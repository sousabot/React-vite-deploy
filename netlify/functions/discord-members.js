const DEFAULT_INVITE_CODE = "5fZ7UEnnzn";

function json(statusCode, body, cache = true) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      ...(cache ? { "Cache-Control": "public, max-age=60" } : {}),
    },
    body: JSON.stringify(body),
  };
}

function getInviteCode() {
  const raw = (process.env.DISCORD_INVITE_CODE || DEFAULT_INVITE_CODE).trim();

  // Accept "5fZ7UEnnzn" or a full discord.gg URL.
  const match = raw.match(
    /(?:discord\.gg\/|discord\.com\/invite\/)?([A-Za-z0-9-]+)/i
  );
  return match ? match[1] : raw;
}

exports.handler = async () => {
  try {
    const code = getInviteCode();
    const url = `https://discord.com/api/v10/invites/${encodeURIComponent(
      code
    )}?with_counts=true&with_expiration=true`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "GD-Esports-Website (https://gdesports.uk)",
      },
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("Discord invite fetch failed:", res.status, detail);
      throw new Error(`Discord API responded with ${res.status}`);
    }

    const data = await res.json();

    const members =
      data?.approximate_member_count ?? data?.profile?.member_count ?? null;
    const online =
      data?.approximate_presence_count ?? data?.profile?.online_count ?? null;

    return json(200, { members, online });
  } catch (err) {
    console.error("discord-members error:", err?.message || err);
    return json(200, { members: null, online: null });
  }
};
