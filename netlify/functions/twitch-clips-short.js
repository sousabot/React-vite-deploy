// netlify/functions/twitch-clips-short.js
//
// POST { vodUrl, clipLength, clipCount }
// Returns: ZIP of mp4 clips (base64-encoded response)
//
// Requires env:
// - TWITCH_CLIENT_ID
// - TWITCH_CLIENT_SECRET
//
// Notes:
// - Works best for public VODs.
// - Cutting many/long clips may timeout depending on platform limits.

const ffmpegPath = require("ffmpeg-static");
const archiver = require("archiver");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

function safeJsonParse(str) {
  try {
    return JSON.parse(str || "{}");
  } catch {
    return null;
  }
}

function clampInt(n, min, max, fallback) {
  const x = Number.parseInt(n, 10);
  if (!Number.isFinite(x)) return fallback;
  return Math.min(max, Math.max(min, x));
}

// Accepts:
// - https://www.twitch.tv/videos/123
// - https://twitch.tv/videos/123
// - https://m.twitch.tv/videos/123
function parseTwitchVodId(vodUrl) {
  if (typeof vodUrl !== "string") return null;
  const s = vodUrl.trim();
  if (!s) return null;

  let url;
  try {
    url = new URL(s);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  if (!host.endsWith("twitch.tv")) return null;

  const parts = url.pathname.split("/").filter(Boolean);
  const idx = parts.indexOf("videos");
  if (idx === -1) return null;

  const id = parts[idx + 1];
  if (!id || !/^\d+$/.test(id)) return null;

  return id;
}

async function getAppAccessToken(clientId, clientSecret) {
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    body: params,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.access_token) {
    const msg = data?.message || data?.error || `HTTP ${res.status}`;
    throw new Error(`Failed to get Twitch app access token: ${msg}`);
  }
  return data.access_token;
}

// Get token/signature for VOD playback via Twitch GQL
async function getVodAccessToken(vodId, clientId, appToken) {
  const res = await fetch("https://gql.twitch.tv/gql", {
    method: "POST",
    headers: {
      "Client-Id": clientId,
      Authorization: `Bearer ${appToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      operationName: "PlaybackAccessToken_Template",
      variables: {
        isLive: false,
        login: "",
        isVod: true,
        vodID: vodId,
        playerType: "site",
      },
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash:
            "0828119ded1c13477966434e15800ff57ddacf13ba1911c129dc2200705b0712",
        },
      },
    }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    throw new Error("Failed to get playback token from Twitch");
  }

  // Depending on Twitch response shape, it may be either:
  // { data: { videoPlaybackAccessToken: { value, signature } } }
  // or an array (rare)
  const tokenObj =
    data?.data?.videoPlaybackAccessToken ||
    (Array.isArray(data) ? data?.[0]?.data?.videoPlaybackAccessToken : null);

  const value = tokenObj?.value;
  const signature = tokenObj?.signature;

  if (!value || !signature) {
    throw new Error("Failed to get playback token from Twitch");
  }

  return { value, signature };
}

function buildUsherM3u8Url(vodId, token, sig) {
  const params = new URLSearchParams({
    allow_source: "true",
    allow_audio_only: "true",
    allow_spectre: "true",
    player: "twitchweb",
    playlist_include_framerate: "true",
    supported_codecs: "avc1",
    sig,
    token,
  });

  return `https://usher.ttvnw.net/vod/${encodeURIComponent(
    vodId
  )}.m3u8?${params.toString()}`;
}

function runFfmpegCut({ inputUrl, startSec, durationSec, outPath }) {
  return new Promise((resolve, reject) => {
    const args = [
      "-hide_banner",
      "-loglevel",
      "error",

      // seek before input can be faster, but sometimes less accurate on HLS
      "-ss",
      String(startSec),
      "-i",
      inputUrl,

      "-t",
      String(durationSec),

      // Re-encode for compatibility
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

      outPath,
    ];

    const p = spawn(ffmpegPath, args);

    let stderr = "";
    p.stderr.on("data", (d) => (stderr += d.toString()));

    p.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg failed (${code}): ${stderr.slice(0, 600)}`));
    });

    p.on("error", reject);
  });
}

async function zipFilesToBase64(filePaths) {
  const outChunks = [];
  const archive = archiver("zip", { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    archive.on("data", (chunk) => outChunks.push(chunk));
    archive.on("error", reject);
    archive.on("end", () => {
      const buf = Buffer.concat(outChunks);
      resolve(buf.toString("base64"));
    });

    for (const fp of filePaths) {
      archive.file(fp, { name: path.basename(fp) });
    }

    archive.finalize().catch(reject);
  });
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") return json(405, { error: "Use POST." });

    const body = safeJsonParse(event.body);
    if (!body) return json(400, { error: "Invalid JSON body." });

    const vodUrl = body.vodUrl;
    const clipLength = clampInt(body.clipLength, 5, 120, 30);
    const clipCount = clampInt(body.clipCount, 1, 10, 3);

    const vodId = parseTwitchVodId(vodUrl);
    if (!vodId) {
      return json(400, {
        error:
          "Please provide a valid Twitch VOD URL like https://www.twitch.tv/videos/123456789",
      });
    }

    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return json(400, {
        error: "Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET in environment.",
      });
    }

    // 1) Create an app access token (auto; no manual refresh)
    const appToken = await getAppAccessToken(clientId, clientSecret);

    // 2) Get playback token/signature for the VOD
    const { value, signature } = await getVodAccessToken(vodId, clientId, appToken);

    // 3) Build m3u8 URL
    const m3u8Url = buildUsherM3u8Url(vodId, value, signature);

    // 4) Cut clips into /tmp
    const tmpDir = "/tmp";
    const outputs = [];

    for (let i = 0; i < clipCount; i++) {
      const startSec = i * clipLength;
      const outPath = path.join(tmpDir, `vod_${vodId}_clip_${i + 1}.mp4`);

      await runFfmpegCut({
        inputUrl: m3u8Url,
        startSec,
        durationSec: clipLength,
        outPath,
      });

      outputs.push(outPath);
    }

    // 5) Zip and return
    const zipBase64 = await zipFilesToBase64(outputs);

    // cleanup best effort
    for (const fp of outputs) {
      try {
        fs.unlinkSync(fp);
      } catch {}
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="clips_${vodId}.zip"`,
        "Cache-Control": "no-store",
      },
      isBase64Encoded: true,
      body: zipBase64,
    };
  } catch (e) {
    return json(500, { error: e?.message || "Failed to cut clips." });
  }
};
