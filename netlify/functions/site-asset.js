import { openBlobStore } from "./blob-store.js";

const ADMIN_EMAILS = [
  "sousamospt@gmail.com",
  "hrms11@outlook.com",
  "goncalosad123@gmail.com",
  "socialmediagd25@outlook.com",
].map((e) => e.toLowerCase());

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

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

function assetKey(path) {
  return `asset:${path}`;
}

function publicUrl(path) {
  return `/.netlify/functions/site-asset?path=${encodeURIComponent(path)}`;
}

function contentTypeForPath(path) {
  const lower = path.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

function normalizeAssetPath(path) {
  const clean = String(path || "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/\\/g, "/");

  if (
    !/^(creators|staff|partners)\/[a-z0-9-]+\.(png|jpe?g|webp|gif)$/i.test(
      clean
    )
  ) {
    throw new Error("Invalid image path");
  }

  return clean;
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
    const store = openBlobStore(event);

    if (event.httpMethod === "GET") {
      const params = event.queryStringParameters || {};
      const path = normalizeAssetPath(params.path);
      const key = assetKey(path);

      const meta = await store.getMetadata(key).catch(() => null);
      if (!meta) return json(404, { error: "Image not found" });

      const data = await store.get(key, { type: "arrayBuffer" });
      if (!data) return json(404, { error: "Image not found" });

      const contentType =
        meta.metadata?.contentType || contentTypeForPath(path);

      return {
        statusCode: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
        body: Buffer.from(data).toString("base64"),
        isBase64Encoded: true,
      };
    }

    if (event.httpMethod === "PUT") {
      const actor = await authorizeAdmin(event);
      if (!actor) return json(401, { error: "Unauthorized" });

      const incoming = JSON.parse(event.body || "{}");
      const path = normalizeAssetPath(incoming.path);
      const contentType = String(incoming.contentType || "").toLowerCase();

      if (!ALLOWED_TYPES.has(contentType)) {
        return json(400, { error: "Unsupported image type" });
      }

      const raw = String(incoming.data || "");
      if (!raw) return json(400, { error: "Missing image data" });

      const buffer = Buffer.from(raw, "base64");
      if (!buffer.length) return json(400, { error: "Invalid image data" });
      if (buffer.length > MAX_BYTES) {
        return json(400, { error: "Image must be under 5 MB" });
      }

      const key = assetKey(path);
      await store.set(key, buffer, {
        metadata: { contentType, updatedAt: Date.now(), updatedBy: actor },
      });

      return json(200, { ok: true, path, url: publicUrl(path) });
    }

    return json(405, { error: "Method not allowed" });
  } catch (err) {
    return json(500, { error: err?.message || String(err) });
  }
};
