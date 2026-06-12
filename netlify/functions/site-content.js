import { getStore } from "@netlify/blobs";

const ADMIN_EMAILS = [
  "sousamospt@gmail.com",
  "hrms11@outlook.com",
  "goncalosad123@gmail.com",
  "socialmediagd25@outlook.com",
].map((e) => e.toLowerCase());

function json(statusCode, obj) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(obj),
  };
}

async function verifyFirebaseToken(idToken) {
  const apiKey =
    process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY;
  if (!apiKey || !idToken) return null;

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );

  const data = await res.json().catch(() => null);
  if (!res.ok) return null;
  return data?.users?.[0]?.email || null;
}

async function authorizeAdmin(event) {
  const authHeader =
    event.headers.authorization || event.headers.Authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";

  if (token) {
    const email = await verifyFirebaseToken(token);
    if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
      return email.toLowerCase();
    }
  }

  const adminToken =
    event.headers["x-admin-token"] || event.headers["X-Admin-Token"];
  const expected = process.env.ADMIN_TOKEN;
  if (expected && adminToken && adminToken === expected) {
    return "admin-token";
  }

  return null;
}

export const handler = async (event) => {
  try {
    const store = getStore("gd-esports");
    const key = "site-content";

    if (event.httpMethod === "GET") {
      const stored = await store.get(key, { type: "json" });
      return json(200, stored || {});
    }

    if (event.httpMethod === "PUT") {
      const actor = await authorizeAdmin(event);
      if (!actor) return json(401, { error: "Unauthorized" });

      const incoming = JSON.parse(event.body || "{}");
      const payload = {
        creators: Array.isArray(incoming.creators) ? incoming.creators : null,
        staffDepartments: Array.isArray(incoming.staffDepartments)
          ? incoming.staffDepartments
          : null,
        partnerGroups: Array.isArray(incoming.partnerGroups)
          ? incoming.partnerGroups
          : null,
        updatedAt: Date.now(),
        updatedBy: actor,
      };

      await store.set(key, payload);
      return json(200, { ok: true, content: payload });
    }

    return json(405, { error: "Method not allowed" });
  } catch (err) {
    return json(500, { error: err?.message || String(err) });
  }
};
