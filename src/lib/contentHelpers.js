export function slugify(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function hexToRgb(hex = "#ff7a00") {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "255,122,0";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return "255,122,0";
  return `${r},${g},${b}`;
}

export function parseTags(value = "") {
  return String(value)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function parseTwitchLogin(url = "") {
  const match = String(url).match(/twitch\.tv\/([^/?#]+)/i);
  return match ? match[1] : "";
}

export function nextNumber(items = []) {
  const nums = items
    .map((item) => parseInt(String(item?.number || "").replace(/\D/g, ""), 10))
    .filter((n) => Number.isFinite(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return String(next).padStart(2, "0");
}
