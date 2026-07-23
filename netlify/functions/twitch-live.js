// netlify/functions/twitch-live.js
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

async function getAppAccessToken(clientId, clientSecret) {
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    body: params,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.access_token) {
    const msg = data?.message || data?.error || `HTTP ${res.status}`;
    throw new Error(`Token error: ${msg}`);
  }
  return data.access_token;
}

async function twitchFetch(url, { clientId, token }) {
  const res = await fetch(url, {
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
    data = null;
  }

  if (!res.ok) {
    const msg = data?.message || data?.error || text?.slice?.(0, 200) || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

exports.handler = async (event) => {
  const username = getQueryParam(event, "user", "").trim();
  const debug = getQueryParam(event, "debug", "0") === "1";

  if (!username) return json(400, { error: "Missing ?user=" });

  try {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return json(500, { error: "Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET" });
    }

    // Always generate a fresh token (simple + reliable)
    const token = await getAppAccessToken(clientId, clientSecret);
    const creds = { clientId, token };

    // 1) Resolve login -> user
    const users = await twitchFetch(
      `${TWITCH_API}/users?login=${encodeURIComponent(username)}`,
      creds
    );

    const user = users?.data?.[0];
    if (!user?.id) {
      return json(200, {
        user: username,
        isLive: false,
        title: "",
        game: "",
        viewerCount: 0,
        startedAt: "",
        error: "User not found",
      });
    }

    // 2) Check stream
    const streams = await twitchFetch(
      `${TWITCH_API}/streams?user_id=${encodeURIComponent(user.id)}`,
      creds
    );

    const stream =
      Array.isArray(streams?.data) && streams.data.length > 0 ? streams.data[0] : null;

    // "type" should be "live" for actual live streams
    const isLive = !!stream && stream.type === "live";

    return json(200, {
      user: user.login,
      displayName: user.display_name,
      isLive,
      title: stream?.title || "",
      game: stream?.game_name || "",
      viewerCount: stream?.viewer_count || 0,
      startedAt: stream?.started_at || "",
      ...(debug
        ? {
            debug: {
              requestedUser: username,
              resolvedUserId: user.id,
              streamsCount: Array.isArray(streams?.data) ? streams.data.length : null,
              streamType: stream?.type || null,
            },
          }
        : {}),
    });
  } catch (err) {
    return json(200, {
      user: username,
      isLive: false,
      title: "",
      game: "",
      viewerCount: 0,
      startedAt: "",
      error: err?.message || "Function error",
      ...(debug ? { debug: { note: "Error thrown while calling Twitch API" } } : {}),
    });
  }
};
