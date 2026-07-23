import { slugify } from "./contentHelpers.js";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

function extensionFor(file) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "jpg";
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("Could not read image file"));
    reader.readAsDataURL(file);
  });
}

export async function uploadSiteImage(file, folder, nameSlug, idToken) {
  if (!file) throw new Error("No file selected");
  if (!ALLOWED.has(file.type)) throw new Error("Use PNG, JPG, WebP, or GIF");
  if (file.size > MAX_BYTES) throw new Error("Image must be under 5 MB");
  if (!idToken) throw new Error("You must be logged in to upload");

  const slug = slugify(nameSlug);
  if (!slug) throw new Error("Enter a name before uploading");

  const path = `${folder}/${slug}.${extensionFor(file)}`;
  const data = await fileToBase64(file);

  const res = await fetch("/.netlify/functions/site-asset", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      path,
      contentType: file.type,
      data,
    }),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload?.error || "Upload failed");
  return payload.url;
}
