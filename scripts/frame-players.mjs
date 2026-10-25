// Reframes transparent player cut-outs so everyone has the same size and head height.
// Trims the empty space, scales the person to a fixed width (or taller if needed to reach
// the bottom edge), puts the top of the head at the same line and crops to one canvas size.
// Safe to re-run on already framed images.
// Usage: npm run frame -- public/players/cs2
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const CANVAS_W = 480;
const CANVAS_H = 640;
const PERSON_W = 350;
const HEAD_TOP = 56;

const dir = path.resolve(process.argv[2] || "public/players/cs2");
const files = (await readdir(dir)).filter((f) => /\.png$/i.test(f));

for (const file of files) {
  const full = path.join(dir, file);
  const trimmed = await sharp(await readFile(full)).trim({ threshold: 10 }).toBuffer({ resolveWithObject: true });
  const { width, height } = trimmed.info;

  const scale = Math.max(PERSON_W / width, (CANVAS_H - HEAD_TOP) / height);
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const person = await sharp(trimmed.data).resize(w, h).toBuffer();

  // Centre horizontally; crop anything past the canvas edges.
  const left = Math.round((CANVAS_W - w) / 2);
  const cropLeft = Math.max(0, -left);
  const visibleW = Math.min(w - cropLeft, CANVAS_W);
  const visibleH = Math.min(h, CANVAS_H - HEAD_TOP);
  const piece = await sharp(person).extract({ left: cropLeft, top: 0, width: visibleW, height: visibleH }).toBuffer();

  const out = await sharp({
    create: { width: CANVAS_W, height: CANVAS_H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: piece, left: Math.max(0, left), top: HEAD_TOP }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();

  await writeFile(full, out);
  console.log(`  ${file.padEnd(18)} ${width}x${height} -> person ${w}x${h}`);
}
