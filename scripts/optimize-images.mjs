// Shrinks oversized images in public/ in place (same filenames, so CMS paths keep working).
// Usage: npm run images
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const PUBLIC = path.resolve("public");

// [folder or file, max width, max height]
const TARGETS = [
  ["players", 900, 1200],
  ["staff", 900, 1200],
  ["creators", 900, 1200],
  ["partners", 600, 600],
  ["opponents", 600, 600],
  ["logo.png", 512, 512],
  ["jersey.png", 900, 900],
  ["jersey-away.png", 900, 900],
  ["jersey-reveal.png", 900, 900],
];

const EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);

async function filesFor(target) {
  const full = path.join(PUBLIC, target);
  if (EXT.has(path.extname(full).toLowerCase())) return [full];
  try {
    const entries = await readdir(full, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && EXT.has(path.extname(e.name).toLowerCase()))
      .map((e) => path.join(full, e.name));
  } catch {
    return [];
  }
}

async function optimize(file, maxW, maxH) {
  const input = await readFile(file);
  const ext = path.extname(file).toLowerCase();
  let img = sharp(input).rotate().resize({ width: maxW, height: maxH, fit: "inside", withoutEnlargement: true });
  if (ext === ".png") img = img.png({ compressionLevel: 9, adaptiveFiltering: true, effort: 10 });
  else if (ext === ".webp") img = img.webp({ quality: 82 });
  else img = img.jpeg({ quality: 82, mozjpeg: true });

  const output = await img.toBuffer();
  const rel = path.relative(PUBLIC, file);
  if (output.length >= input.length) {
    console.log(`  skip  ${rel}`);
    return 0;
  }
  await writeFile(file, output);
  const kb = (n) => `${Math.round(n / 1024)} KB`;
  console.log(`  ${kb(input.length).padStart(8)} -> ${kb(output.length).padStart(7)}  ${rel}`);
  return input.length - output.length;
}

let saved = 0;
for (const [target, w, h] of TARGETS) {
  for (const file of await filesFor(target)) saved += await optimize(file, w, h);
}
console.log(`Saved ${Math.round(saved / 1024)} KB`);
