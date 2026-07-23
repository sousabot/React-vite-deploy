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

async function twitchFetch(path, { clientId, token }) {
  const res = await fetch(`${TWITCH_API}${path}`, {
    headers: {
      "Client-Id": clientId,
      Authorization: `Bearer ${token}`,
    },
  });

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

exports.handler = async (event) => {
  try {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const token = process.env.TWITCH_APP_TOKEN;

    if (!clientId || !token) {
      return json(200, {
        clips: [],
        error: "Missing TWITCH_CLIENT_ID or TWITCH_APP_TOKEN",
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

    const creds = { clientId, token };

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
