export async function handler(event) {
  const logins = event.queryStringParameters.logins?.split(",") || [];

  const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  const url =
    "https://api.twitch.tv/helix/streams?" +
    logins.map((l) => `user_login=${l}`).join("&");

  const liveRes = await fetch(url, {
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await liveRes.json();

  const live = {};
  data.data.forEach((s) => {
    live[s.user_login] = true;
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ live }),
  };
}
