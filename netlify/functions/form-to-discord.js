exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const webhook = process.env.DISCORD_WEBHOOK_URL;
    if (!webhook) {
      return { statusCode: 500, body: "Missing DISCORD_WEBHOOK_URL env var" };
    }

    const data = new URLSearchParams(event.body || "");

    const payload = {
      embeds: [
        {
          title: "📝 New GD Esports Application",
          color: 9145343,
          fields: [
            {
              name: "Name",
              value:
                `${data.get("firstName") || ""} ${data.get("lastName") || ""}`.trim() || "—",
              inline: true,
            },
            { name: "Age", value: data.get("age") || "—", inline: true },
            { name: "Discord", value: data.get("discord") || "—" },
            { name: "About", value: data.get("about") || "—" },
            { name: "Tournaments", value: data.get("tournaments") || "—" },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const r = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const text = await r.text().catch(() => "");
      return { statusCode: 502, body: `Discord webhook failed: ${r.status} ${text}` };
    }

    return { statusCode: 200, body: "OK" };
  } catch (err) {
    return { statusCode: 500, body: `Function error: ${err?.message || err}` };
  }
};
