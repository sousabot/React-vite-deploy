export async function handler() {
  try {
    const INVITE = process.env.DISCORD_INVITE_CODE; // e.g. "5fZ7UEnnzn"
    if (!INVITE) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing DISCORD_INVITE_CODE" }),
      };
    }

    const res = await fetch(
      `https://discord.com/api/v10/invites/${INVITE}?with_counts=true&with_expiration=true`
    );

    if (!res.ok) throw new Error("Failed to fetch invite");

    const data = await res.json();

    const members = data?.approximate_member_count ?? null;
    const online = data?.approximate_presence_count ?? null;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "max-age=60",
      },
      body: JSON.stringify({ members, online }),
    };
  } catch {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ members: null, online: null }),
    };
  }
}
