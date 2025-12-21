// netlify/functions/form-to-discord.js

function parseBody(event) {
  const ct = event.headers?.["content-type"] || event.headers?.["Content-Type"] || "";

  // JSON
  if (ct.includes("application/json")) {
    try {
      return JSON.parse(event.body || "{}");
    } catch {
      return {};
    }
  }

  // urlencoded
  if (ct.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(event.body || "");
    return Object.fromEntries(params.entries());
  }

  // fallback
  return {};
}

function clean(v) {
  return String(v ?? "").trim();
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const webhook = process.env.DISCORD_WEBHOOK_URL;
    if (!webhook) {
      return { statusCode: 500, body: "Missing DISCORD_WEBHOOK_URL env var" };
    }

    const data = parseBody(event);
    const type = clean(data.type) || "work-with-us";

    // Common fields (tryout)
    const gamerTag = clean(data.gamerTag);
    const game = clean(data.game);
    const discord = clean(data.discord);
    const role = clean(data.role);
    const availability = clean(data.availability);
    const notes = clean(data.notes);

    // Common fields (work-with-us)
    const firstName = clean(data.firstName);
    const lastName = clean(data.lastName);
    const age = clean(data.age);
    const about = clean(data.about);
    const tournaments = clean(data.tournaments);

    const title =
      type === "tryout" ? "🟢 New Tryout Application" : "📩 New Work With Us Application";

    const fields =
      type === "tryout"
        ? [
            { name: "Gamer Tag", value: gamerTag || "—", inline: true },
            { name: "Game", value: game || "—", inline: true },
            { name: "Discord", value: discord || "—", inline: true },
            { name: "Role", value: role || "—", inline: true },
            { name: "Availability", value: availability || "—", inline: false },
            { name: "Notes", value: notes || "—", inline: false },
          ]
        : [
            { name: "First Name", value: firstName || "—", inline: true },
            { name: "Last Name", value: lastName || "—", inline: true },
            { name: "Age", value: age || "—", inline: true },
            { name: "Discord", value: discord || "—", inline: true },
            { name: "About", value: about || "—", inline: false },
            { name: "Tournaments", value: tournaments || "—", inline: false },
          ];

    const payload = {
      username: "GD Applications",
      embeds: [
        {
          title,
          color: type === "tryout" ? 0x22c55e : 0xff8a00,
          fields,
          footer: {
            text: `Source: ${type} • ${new Date().toLocaleString()}`,
          },
        },
      ],
    };

    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      return { statusCode: 502, body: `Discord webhook failed: ${res.status} ${msg}` };
    }

    return { statusCode: 200, body: "ok" };
  } catch (err) {
    return { statusCode: 500, body: `Function error: ${err?.message || err}` };
  }
};
