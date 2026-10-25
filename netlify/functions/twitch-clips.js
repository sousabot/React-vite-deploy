// netlify/functions/twitch-clips.js

const TWITCH_API = "https://api.twitch.tv/helix";

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

function getQueryParam(event, key, fallback = "") {
  return (
    event.queryStringParameters?.[key] ??
    event.multiValueQueryStringParameters?.[key]?.[0] ??
    fallback
  );
}

function clampInt(n, min, max, fallback) {
  const x = Number.parseInt(n, 10);
  if (!Number.isFinite(x)) return fallback;
  return Math.min(max, Math.max(min, x));
}

function isoFromDaysAgo(days) {
  const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return d.toISOString();
}

// App tokens last ~60 days; reuse one per warm function instance and refresh before expiry.
let cachedToken = null;

async function getAppToken(clientId, clientSecret, { force = false } = {}) {
  if (!clientSecret) return process.env.TWITCH_APP_TOKEN || "";
  if (!force && cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.access_token) {
    throw new Error(`Token error: ${data?.message || data?.error || `HTTP ${res.status}`}`);
  }
  cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in || 3600) * 1000 };
  return cachedToken.value;
}

async function twitchFetch(path, creds, retried = false) {
  const res = await fetch(`${TWITCH_API}${path}`, {
    headers: {
      "Client-Id": creds.clientId,
      Authorization: `Bearer ${creds.token}`,
    },
  });

  if (res.status === 401 && creds.clientSecret && !retried) {
    creds.token = await getAppToken(creds.clientId, creds.clientSecret, { force: true });
    return twitchFetch(path, creds, true);
  }

  const text = await res.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    // keep as null
  }

  if (!res.ok) {
    const msg =
      data?.message ||
      data?.error ||
      text?.slice?.(0, 200) ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

async function getUsersByLogins(logins, creds) {
  // Twitch supports multiple login params: /users?login=a&login=b
  const qs = logins.map((l) => `login=${encodeURIComponent(l)}`).join("&");
  const data = await twitchFetch(`/users?${qs}`, creds);
  return Array.isArray(data?.data) ? data.data : [];
}

async function getClipsForBroadcaster(broadcasterId, days, first, creds) {
  // started_at is inclusive; Twitch clips endpoint:
  // /clips?broadcaster_id=...&first=...&started_at=...
  const started_at = encodeURIComponent(isoFromDaysAgo(days));
  const path = `/clips?broadcaster_id=${encodeURIComponent(
    broadcasterId
  )}&first=${encodeURIComponent(first)}&started_at=${started_at}`;

  const data = await twitchFetch(path, creds);
  return Array.isArray(data?.data) ? data.data : [];
}

export const handler = async (event) => {
  try {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;

    if (!clientId || (!clientSecret && !process.env.TWITCH_APP_TOKEN)) {
      return json(200, {
        clips: [],
        error: "Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET",
      });
    }

    const usersRaw = getQueryParam(event, "users", "");
    const days = clampInt(getQueryParam(event, "days", "7"), 1, 365, 7);
    const first = clampInt(getQueryParam(event, "first", "24"), 1, 50, 24);
    const debug = getQueryParam(event, "debug", "0") === "1";

    const logins = usersRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (logins.length === 0) {
      return json(200, { clips: [], error: "No users provided" });
    }

    const creds = { clientId, clientSecret, token: await getAppToken(clientId, clientSecret) };

    // 1) Resolve logins -> ids
    const users = await getUsersByLogins(logins, creds);

    // If twitch returns fewer users than requested, some logins are wrong
    const idMap = new Map(users.map((u) => [u.login?.toLowerCase(), u.id]));

    // 2) Fetch clips per id
    const allClipsNested = await Promise.all(
      logins.map(async (login) => {
        const id = idMap.get(login.toLowerCase());
        if (!id) return [];
        return await getClipsForBroadcaster(id, days, first, creds);
      })
    );

    const allClips = allClipsNested.flat();

    // 3) Sort by views desc
    allClips.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));

    return json(200, {
      clips: allClips,
      ...(debug
        ? {
            debug: {
              requestedLogins: logins,
              resolvedUsers: users.map((u) => ({
                login: u.login,
                id: u.id,
                display_name: u.display_name,
              })),
              totalClips: allClips.length,
              days,
              first,
            },
          }
        : {}),
    });
  } catch (e) {
    return json(200, { clips: [], error: e?.message || "Failed to load clips" });
  }
};
