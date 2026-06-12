import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../state/firebase.js";
import { slugify } from "./contentHelpers.js";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

function extensionFor(file) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "jpg";
}

export async function uploadSiteImage(file, folder, nameSlug) {
  if (!file) throw new Error("No file selected");
  if (!ALLOWED.has(file.type)) throw new Error("Use PNG, JPG, WebP, or GIF");
  if (file.size > MAX_BYTES) throw new Error("Image must be under 5 MB");

  const slug = slugify(nameSlug);
  if (!slug) throw new Error("Enter a name before uploading");

  const path = `site-content/${folder}/${slug}.${extensionFor(file)}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}
