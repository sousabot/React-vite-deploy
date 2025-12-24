// netlify/functions/form-to-discord.js

// ✅ Ensure fetch exists in Netlify Functions
let _fetch = globalThis.fetch;
if (!_fetch) {
  // eslint-disable-next-line global-require
  _fetch = require("node-fetch");
}

function parseBody(event) {
  const contentType =
    event.headers?.["content-type"] ||
    event.headers?.["Content-Type"] ||
    "";

  const raw = event.body || "";

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(raw || "{}");
    } catch {
      return {};
    }
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(raw);
    return Object.fromEntries(params.entries());
  }

  // Fallback attempt (sometimes Netlify sends urlencoded without header)
  try {
    const params = new URLSearchParams(raw);
    const obj = Object.fromEntries(params.entries());
    if (Object.keys(obj).length) return obj;
  } catch {
    // ignore
  }

  return {};
}

function clean(value) {
  return String(value ?? "").trim();
}

function clampField(value, max = 900) {
  const v = clean(value);
  if (!v) return "—";
  // Discord embed field values max is 1024 chars
  return v.length > max ? `${v.slice(0, max)}…` : v;
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
    const type = clean(data.type) || clean(data.formName) || "work-with-us";

    // ===== COMMON FIELDS =====
    const gamerTag = clean(data.gamerTag);
    const discord = clean(data.discord);
    const notes = clean(data.notes);

    // ===== TRYOUT FIELDS =====
    const game = clean(data.game);
    const tryoutRole = clean(data.role); // tryout "role"
    const availability = clean(data.availability);

    // ===== WORK WITH US FIELDS =====
    const applyRole = clean(data.applyRole || data.role); // "player/creator/staff/sponsor" in new form
    const firstName = clean(data.firstName);
    const lastName = clean(data.lastName);
    const age = clean(data.age);
    const email = clean(data.email);

    const country = clean(data.country);
    const timezone = clean(data.timezone);

    const about = clean(data.about);
    const tournaments = clean(data.tournaments);

    const socials = clean(data.socials);
    const portfolio = clean(data.portfolio);

    const brand = clean(data.brand);
    const budget = clean(data.budget);

    const message = clean(data.message);

    // ===== GIVEAWAY FIELDS =====
    const platform = clean(data.platform);
    const prize = clean(data.prize);

    let title = "📩 New Submission";
    let color = 0xff8a00;
    let fields = [];

    if (type === "tryout") {
      title = "🟢 New Tryout Application";
      color = 0x22c55e;

      fields = [
        { name: "Gamer Tag", value: clampField(gamerTag), inline: true },
        { name: "Game", value: clampField(game), inline: true },
        { name: "Discord", value: clampField(discord), inline: true },
        { name: "Role", value: clampField(tryoutRole), inline: true },
        { name: "Availability", value: clampField(availability), inline: false },
        { name: "Notes", value: clampField(notes), inline: false },
      ];
    } else if (type === "giveaway_entry") {
      title = "🎁 New Giveaway Entry";
      color = 0xf59e0b;

      fields = [
        { name: "Prize", value: clampField(prize), inline: false },
        { name: "Gamer Tag", value: clampField(gamerTag), inline: true },
        { name: "Email", value: clampField(email), inline: true },
        { name: "Discord", value: clampField(discord), inline: true },
        { name: "Platform", value: clampField(platform), inline: true },
        { name: "Notes", value: clampField(notes), inline: false },
      ];
    } else {
      // Default: Work With Us
      title = "📩 New Work With Us Application";
      color = 0xff8a00;

      fields = [
        { name: "Applying As", value: clampField(applyRole), inline: true },
        { name: "First Name", value: clampField(firstName), inline: true },
        { name: "Last Name", value: clampField(lastName), inline: true },
        { name: "Age", value: clampField(age), inline: true },
        { name: "Email", value: clampField(email), inline: true },
        { name: "Discord", value: clampField(discord), inline: true },
        { name: "Country", value: clampField(country), inline: true },
        { name: "Timezone", value: clampField(timezone), inline: true },
        { name: "About", value: clampField(about, 1000), inline: false },
        { name: "Tournaments", value: clampField(tournaments, 1000), inline: false },
      ];

      // Add optional fields only if present
      if (socials) fields.push({ name: "Socials", value: clampField(socials), inline: false });
      if (portfolio) fields.push({ name: "Portfolio", value: clampField(portfolio), inline: false });
      if (brand) fields.push({ name: "Brand", value: clampField(brand), inline: true });
      if (budget) fields.push({ name: "Budget", value: clampField(budget), inline: true });
      if (message) fields.push({ name: "Message", value: clampField(message, 1000), inline: false });
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

    const res = await _fetch(webhookUrl, {
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

    return { statusCode: 200, body: "OK" };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Function error: ${err?.message || err}`,
    };
  }
};
