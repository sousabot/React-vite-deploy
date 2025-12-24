import express from "express";
import archiver from "archiver";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

const app = express();

/* ---------------- middleware ---------------- */

app.use(express.json({ limit: "2mb" }));

// CORS (required for localhost / Netlify frontend)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

/* ---------------- helpers ---------------- */

function clampInt(n, min, max, fallback) {
  const x = Number.parseInt(n, 10);
  if (!Number.isFinite(x)) return fallback;
  return Math.min(max, Math.max(min, x));
}

function parseTwitchVodId(vodUrl) {
  try {
    const u = new URL(String(vodUrl || "").trim());
    if (!u.hostname.toLowerCase().includes("twitch.tv")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("videos");
    if (idx === -1) return null;
    const id = parts[idx + 1];
    if (!id || !/^\d+$/.test(id)) return null;
    return id;
  } catch {
    return null;
  }
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, opts);
    let stderr = "";

    p.stderr?.on("data", (d) => (stderr += d.toString()));
    p.on("error", reject);

    p.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} failed (${code}): ${stderr.slice(0, 2000)}`));
    });
  });
}

/* ---------------- routes ---------------- */

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/cut-vod", async (req, res) => {
  const { vodUrl, clipLength, clipCount } = req.body || {};

  const vodId = parseTwitchVodId(vodUrl);
  if (!vodId) {
    return res.status(400).json({ error: "Invalid Twitch VOD URL" });
  }

  const len = clampInt(clipLength, 5, 120, 30);
  const count = clampInt(clipCount, 1, 10, 3);

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), `vod-${vodId}-`));
  const vodPath = path.join(workDir, `vod_${vodId}.mp4`);

  try {
    /* -------- 1) download VOD -------- */

    await run("yt-dlp", [
      "--no-progress",
      "-f",
      "bv*+ba/b",
      "-o",
      vodPath,
      vodUrl,
    ]);

    if (!fs.existsSync(vodPath)) {
      throw new Error("VOD download failed");
    }

    /* -------- 2) setup ZIP response -------- */

    res.status(200);
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="clips_${vodId}.zip"`
    );
    res.setHeader("Cache-Control", "no-store");

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", (err) => {
      throw err;
    });
    archive.pipe(res);

    /* -------- 3) cut clips -------- */

    for (let i = 0; i < count; i++) {
      const start = i * len;
      const clipPath = path.join(
        workDir,
        `vod_${vodId}_clip_${i + 1}.mp4`
      );

      await run("ffmpeg", [
        "-hide_banner",
        "-loglevel",
        "error",
        "-ss",
        String(start),
        "-i",
        vodPath,
        "-t",
        String(len),
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "23",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-movflags",
        "+faststart",
        clipPath,
      ]);

      archive.file(clipPath, { name: path.basename(clipPath) });
    }

    await archive.finalize();
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({
        error: err?.message || "Failed to cut VOD",
      });
    }
  } finally {
    // cleanup (best-effort)
    try {
      fs.rmSync(workDir, { recursive: true, force: true });
    } catch {}
  }
});

/* ---------------- start server ---------------- */

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`VOD cutter API running on port ${PORT}`);
});
