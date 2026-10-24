// Builds public/og.png, the 1200x630 preview shown when the site is shared on Discord, X, etc.
// Usage: npm run og
import path from "node:path";
import sharp from "sharp";

const W = 1200;
const H = 630;
const ORANGE = "#ff6a00";
const PUBLIC = path.resolve("public");

const grid = Array.from({ length: Math.ceil(W / 60) }, (_, i) => `<line x1="${i * 60}" y1="0" x2="${i * 60}" y2="${H}"/>`)
  .concat(Array.from({ length: Math.ceil(H / 60) }, (_, i) => `<line x1="0" y1="${i * 60}" x2="${W}" y2="${i * 60}"/>`))
  .join("");

const background = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="0.27" cy="0.5" r="0.55">
      <stop offset="0" stop-color="${ORANGE}" stop-opacity="0.32"/>
      <stop offset="1" stop-color="${ORANGE}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#08090b"/>
  <g stroke="#ffffff" stroke-opacity="0.04" stroke-width="1">${grid}</g>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect x="0" y="${H - 10}" width="${W}" height="10" fill="${ORANGE}"/>
  <path d="M40 40 h56 M40 40 v56" stroke="${ORANGE}" stroke-width="4" fill="none"/>
  <path d="M${W - 40} ${H - 50} h-56 M${W - 40} ${H - 50} v-56" stroke="${ORANGE}" stroke-width="4" fill="none"/>
</svg>`;

const text = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .eyebrow { font: 600 22px Consolas, 'Courier New', monospace; letter-spacing: 6px; fill: ${ORANGE}; }
    .title { font: 900 112px Impact, 'Arial Black', sans-serif; fill: #f2f2f2; }
    .tag { font: 900 56px Impact, 'Arial Black', sans-serif; fill: ${ORANGE}; letter-spacing: 2px; }
    .sub { font: 600 24px 'Segoe UI', Arial, sans-serif; fill: #9aa0a6; }
  </style>
  <rect x="560" y="186" width="40" height="3" fill="${ORANGE}"/>
  <text x="614" y="196" class="eyebrow">ESPORTS ORGANISATION</text>
  <text x="556" y="316" class="title">GD ESPORTS</text>
  <text x="560" y="390" class="tag">BUILT TO COMPETE.</text>
  <text x="560" y="446" class="sub">League of Legends · CS2 · Creators · Official kits</text>
</svg>`;

const logo = await sharp(path.join(PUBLIC, "logo.png")).resize(380, 380, { fit: "inside" }).toBuffer();

await sharp(Buffer.from(background))
  .composite([
    { input: logo, left: 110, top: Math.round((H - 380) / 2) - 5 },
    { input: Buffer.from(text), left: 0, top: 0 },
  ])
  .png({ compressionLevel: 9 })
  .toFile(path.join(PUBLIC, "og.png"));

console.log("Wrote public/og.png");
