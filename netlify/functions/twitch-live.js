exports.handler = async (event) => {
  try {
    const username = event.queryStringParameters?.user;
    if (!username) {
      return { statusCode: 400, body: "Missing ?user=" };
    }

    const clientId = process.env.TWITCH_CLIENT_ID;
    const token = process.env.TWITCH_APP_TOKEN;

    if (!clientId || !token) {
      return { statusCode: 500, body: "Missing TWITCH_CLIENT_ID or TWITCH_APP_TOKEN env vars" };
    }

    // 1) Get user id from login name
    const userRes = await fetch(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(username)}`, {
      headers: {
        "Client-Id": clientId,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!userRes.ok) {
      const t = await userRes.text().catch(() => "");
      return { statusCode: 502, body: `Twitch users lookup failed: ${userRes.status} ${t}` };
    }

    const userJson = await userRes.json();
    const userId = userJson?.data?.[0]?.id;

    if (!userId) {
      return { statusCode: 200, body: JSON.stringify({ user: username, isLive: false }) };
    }

    // 2) Check if user has an active stream
    const streamRes = await fetch(`https://api.twitch.tv/helix/streams?user_id=${userId}`, {
      headers: {
        "Client-Id": clientId,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!streamRes.ok) {
      const t = await streamRes.text().catch(() => "");
      return { statusCode: 502, body: `Twitch streams lookup failed: ${streamRes.status} ${t}` };
    }

    const streamJson = await streamRes.json();
    const stream = streamJson?.data?.[0];

    const out = {
      user: username,
      isLive: Boolean(stream),
      title: stream?.title || "",
      game: stream?.game_name || "",
      viewerCount: stream?.viewer_count || 0,
      startedAt: stream?.started_at || "",
    };

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=30" },
      body: JSON.stringify(out),
    };
  } catch (err) {
    return { statusCode: 500, body: `Function error: ${err?.message || err}` };
  }
};
