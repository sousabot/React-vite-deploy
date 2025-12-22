import { getStore } from "@netlify/blobs";

const DEFAULT_CONFIG = {
  tryoutsOpen: true,
  rosterStatus: "Forming", // "Forming" | "Closed" | "Tryouts"
  announcement: {
    enabled: true,
    title: "🚨 ANNOUNCEMENT INCOMING",
    subtitle: "Roster reveal coming soon",
    body: "Major updates are on the way. Follow GD Esports to be first.",
    discordUrl: "https://discord.gg/5fZ7UEnnzn",
    xUrl: "https://x.com/GDESPORTS25",
  },
};

function json(statusCode, obj) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(obj),
  };
}

export const handler = async (event) => {
  try {
    const store = getStore("gd-esports"); // namespace
    const key = "site-config";

    // Public GET (no auth) so the website can read it
    if (event.httpMethod === "GET") {
      const existing = await store.get(key, { type: "json" });
      return json(200, existing || DEFAULT_CONFIG);
    }

    // Admin-only updates
    if (event.httpMethod === "PUT") {
      const token = event.headers["x-admin-token"] || event.headers["X-Admin-Token"];
      const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

      if (!ADMIN_TOKEN) return json(500, { error: "Missing ADMIN_TOKEN env var" });
      if (!token || token !== ADMIN_TOKEN) return json(401, { error: "Unauthorized" });

      const incoming = JSON.parse(event.body || "{}");
      const next = {
        ...DEFAULT_CONFIG,
        ...incoming,
        announcement: {
          ...DEFAULT_CONFIG.announcement,
          ...(incoming.announcement || {}),
        },
      };

      await store.set(key, next);
      return json(200, { ok: true, config: next });
    }

    return json(405, { error: "Method not allowed" });
  } catch (err) {
    return json(500, { error: err?.message || String(err) });
  }
};
