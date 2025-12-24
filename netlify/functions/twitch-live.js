// netlify/functions/twitch-live.js
const TWITCH_API = "https://api.twitch.tv/helix";

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store", // IMPORTANT: avoid stale live status
    },
    body: JSON.stringify(body),
  };
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
  try {
    const username =
      event.queryStringParameters?.user ||
      event.multiValueQueryStringParameters?.user?.[0];

    if (!username) return json(400, { error: "Missing ?user=" });

    const clientId = process.env.TWITCH_CLIENT_ID;
    const token = process.env.TWITCH_APP_TOKEN;

    if (!clientId || !token) {
      return json(500, { error: "Missing TWITCH_CLIENT_ID or TWITCH_APP_TOKEN env vars" });
    }

    const creds = { clientId, token };

    // 1) Resolve user login -> id
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

    // 2) Streams endpoint: if offline => data = []
    const streams = await twitchFetch(
      `${TWITCH_API}/streams?user_id=${encodeURIComponent(user.id)}`,
      creds
    );

    const stream = Array.isArray(streams?.data) && streams.data.length > 0 ? streams.data[0] : null;

    // ✅ Correct offline handling
    const isLive = !!stream;

    return json(200, {
      user: user.login,
      displayName: user.display_name,
      isLive,
      title: stream?.title || "",
      game: stream?.game_name || "",
      viewerCount: stream?.viewer_count || 0,
      startedAt: stream?.started_at || "",
    });
  } catch (err) {
    return json(200, {
      user: event.queryStringParameters?.user || "",
      isLive: false,
      title: "",
      game: "",
      viewerCount: 0,
      startedAt: "",
      error: err?.message || "Function error",
    });
  }
};
