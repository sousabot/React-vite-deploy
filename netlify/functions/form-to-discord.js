// netlify/functions/form-to-discord.js

function parseBody(event) {
  const contentType =
    event.headers?.["content-type"] ||
    event.headers?.["Content-Type"] ||
    "";

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(event.body || "{}");
    } catch {
      return {};
    }
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(event.body || "");
    return Object.fromEntries(params.entries());
  }

  return {};
}

function clean(value) {
  return String(value ?? "").trim();
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      return {
        statusCode: 500,
        body: "Missing DISCORD_WEBHOOK_URL environment variable",
      };
    }

    const data = parseBody(event);
    const type = clean(data.type) || "work-with-us";

    // ===== COMMON FIELDS =====
    const gamerTag = clean(data.gamerTag);
    const discord = clean(data.discord);
    const notes = clean(data.notes);

    // ===== TRYOUT FIELDS =====
    const game = clean(data.game);
    const role = clean(data.role);
    const availability = clean(data.availability);

    // ===== WORK WITH US FIELDS =====
    const firstName = clean(data.firstName);
    const lastName = clean(data.lastName);
    const age = clean(data.age);
    const about = clean(data.about);
    const tournaments = clean(data.tournaments);

    // ===== GIVEAWAY FIELDS =====
    const email = clean(data.email);
    const platform = clean(data.platform);
    const prize = clean(data.prize);

    let title = "📩 New Submission";
    let color = 0xff8a00;
    let fields = [];

    if (type === "tryout") {
      title = "🟢 New Tryout Application";
      color = 0x22c55e;

      fields = [
        { name: "Gamer Tag", value: gamerTag || "—", inline: true },
        { name: "Game", value: game || "—", inline: true },
        { name: "Discord", value: discord || "—", inline: true },
        { name: "Role", value: role || "—", inline: true },
        { name: "Availability", value: availability || "—", inline: false },
        { name: "Notes", value: notes || "—", inline: false },
      ];
    }

    else if (type === "giveaway_entry") {
      title = "🎁 New Giveaway Entry";
      color = 0xf59e0b;

      fields = [
        { name: "Prize", value: prize || "—", inline: false },
        { name: "Gamer Tag", value: gamerTag || "—", inline: true },
        { name: "Email", value: email || "—", inline: true },
        { name: "Discord", value: discord || "—", inline: true },
        { name: "Platform", value: platform || "—", inline: true },
        { name: "Notes", value: notes || "—", inline: false },
      ];
    }

    else {
      title = "📩 New Work With Us Application";
      color = 0xff8a00;

      fields = [
        { name: "First Name", value: firstName || "—", inline: true },
        { name: "Last Name", value: lastName || "—", inline: true },
        { name: "Age", value: age || "—", inline: true },
        { name: "Discord", value: discord || "—", inline: true },
        { name: "About", value: about || "—", inline: false },
        { name: "Tournaments", value: tournaments || "—", inline: false },
      ];
    }

    const payload = {
      username: "GD Esports Bot",
      embeds: [
        {
          title,
          color,
          fields,
          footer: {
            text: `Source: ${type} • ${new Date().toLocaleString()}`,
          },
        },
      ],
    };

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        statusCode: 502,
        body: `Discord webhook failed: ${res.status} ${text}`,
      };
    }

    return {
      statusCode: 200,
      body: "OK",
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Function error: ${err?.message || err}`,
    };
  }
};
