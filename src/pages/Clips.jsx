// src/pages/Clips.jsx
import React, { useEffect, useMemo, useState } from "react";
import PageMotion from "../components/PageMotion.jsx";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

const CREATORS = [
  { key: "all", label: "All", twitchLogin: null },
  { key: "mewtzu", label: "Mewtzu", twitchLogin: "mewtzu" },
  { key: "kaymael", label: "Kaymael", twitchLogin: "kaymael" },
];

const DAY_OPTIONS = [
  { key: 7, label: "7D" },
  { key: 14, label: "14D" },
  { key: 30, label: "30D" },
];

// how far back we fetch to build the "30+ days" section (adjust if you want)
const OLDER_FETCH_DAYS = 365;

function cls(...args) {
  return args.filter(Boolean).join(" ");
}

function getClipDate(clip) {
  const raw = clip.created_at || clip.createdAt;
  const d = raw ? new Date(raw) : null;
  return d && !Number.isNaN(d.getTime()) ? d : null;
}

export default function Clips() {
  const [days, setDays] = useState(7);
  const [creatorKey, setCreatorKey] = useState("all");

  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // 30+ days section
  const [olderClips, setOlderClips] = useState([]);
  const [olderLoading, setOlderLoading] = useState(false);
  const [olderErr, setOlderErr] = useState("");

  const selectedCreator = useMemo(
    () => CREATORS.find((c) => c.key === creatorKey) || CREATORS[0],
    [creatorKey]
  );

  const usersParam = useMemo(() => {
    if (selectedCreator?.twitchLogin) return selectedCreator.twitchLogin;
    return CREATORS.filter((c) => c.twitchLogin)
      .map((c) => c.twitchLogin)
      .join(",");
  }, [selectedCreator]);

  // main clips (7/14/30)
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");

      try {
        const url = `/.netlify/functions/twitch-clips?users=${encodeURIComponent(
          usersParam
        )}&days=${encodeURIComponent(days)}&first=24`;

        const res = await fetch(url, { cache: "no-store" });
        const text = await res.text();

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(
            `Clips API did not return JSON. First bytes: ${text.slice(0, 80)}`
          );
        }

        if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
        if (cancelled) return;

        setClips(Array.isArray(data?.clips) ? data.clips : []);
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Failed to load clips.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [days, usersParam]);

  // "30+ days" section: only fetch when 30D is selected
  useEffect(() => {
    let cancelled = false;

    async function loadOlder() {
      if (days !== 30) {
        setOlderClips([]);
        setOlderErr("");
        setOlderLoading(false);
        return;
      }

      setOlderLoading(true);
      setOlderErr("");

      try {
        const url = `/.netlify/functions/twitch-clips?users=${encodeURIComponent(
          usersParam
        )}&days=${encodeURIComponent(OLDER_FETCH_DAYS)}&first=50`;

        const res = await fetch(url, { cache: "no-store" });
        const text = await res.text();

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(
            `Clips API did not return JSON. First bytes: ${text.slice(0, 80)}`
          );
        }

        if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
        if (cancelled) return;

        const all = Array.isArray(data?.clips) ? data.clips : [];

        // keep ONLY clips older than 30 days
        const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const olderOnly = all
          .filter((c) => {
            const d = getClipDate(c);
            return d ? d.getTime() < cutoff : false;
          })
          .slice(0, 24);

        setOlderClips(olderOnly);
      } catch (e) {
        if (!cancelled) setOlderErr(e?.message || "Failed to load older clips.");
      } finally {
        if (!cancelled) setOlderLoading(false);
      }
    }

    loadOlder();
    return () => {
      cancelled = true;
    };
  }, [days, usersParam]);

  const renderClipCard = (clip) => {
    const thumb = clip.thumbnail_url || clip.thumbnailUrl || "";
    const title = clip.title || "Untitled clip";
    const creator = clip.broadcaster_name || clip.broadcasterName || "";
    const views = clip.view_count ?? clip.views ?? 0;
    const url = clip.url || clip.clip_url || "#";

    return (
      <a
        key={clip.id || url}
        className="clipCard"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open clip: ${title}`}
        title={title}
      >
        <div className="clipThumb">
          {thumb ? <img src={thumb} alt={title} loading="lazy" /> : null}
          <div className="clipPlay">▶</div>
        </div>

        <div className="clipInfo">
          <div className="clipTitle">{title}</div>
          <div className="clipMeta">
            <span>{creator || "Creator"}</span>
            <span>{Number(views || 0).toLocaleString()} views</span>
          </div>
        </div>
      </a>
    );
  };

  return (
    <PageMotion>
      <div className="clipsPage">
        <section className="clipsHero">
          <div className="clipsHeroOverlay" />

          <motion.div
            className="clipsHeroInner"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="clipsBadge">🎞️ CLIPS</div>
            <h1 className="clipsTitle">Top Clips</h1>
            <p className="clipsSubtitle muted">
              Best moments from our creators — auto-updated from Twitch.
            </p>

            <div className="clipsControls">
              <div className="clipsFilters">
                {DAY_OPTIONS.map((o) => (
                  <button
                    key={o.key}
                    className={cls("clipsFilterBtn", days === o.key && "active")}
                    onClick={() => setDays(o.key)}
                    type="button"
                  >
                    {o.label}
                  </button>
                ))}
              </div>

              <div className="clipsFilters">
                {CREATORS.map((c) => (
                  <button
                    key={c.key}
                    className={cls("clipsFilterBtn", creatorKey === c.key && "active")}
                    onClick={() => setCreatorKey(c.key)}
                    type="button"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {loading && (
              <div className="muted small" style={{ marginTop: 10 }}>
                Loading clips…
              </div>
            )}
            {err && (
              <div className="clipsError" style={{ marginTop: 10 }}>
                {err}
              </div>
            )}
          </motion.div>
        </section>

        {/* MAIN GRID */}
        <section className="clipsSection">
          <motion.div
            className="clipsGrid"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {!loading && !err && clips.length === 0 && (
              <div className="clipsEmpty muted">
                No clips found for this filter. Try a bigger range (14D / 30D).
              </div>
            )}

            {clips.map(renderClipCard)}
          </motion.div>
        </section>

        {/* 30+ DAYS SECTION */}
        {days === 30 && (
          <section className="clipsSection">
            <div className="clipsSectionHeader">
              <div className="clipsSectionTitle">More Clips (30+ days)</div>
              <div className="muted small">
                Older highlights pulled from the last {OLDER_FETCH_DAYS} days.
              </div>
            </div>

            {olderLoading && (
              <div className="muted small" style={{ maxWidth: 1180, margin: "0 auto 10px" }}>
                Loading older clips…
              </div>
            )}
            {olderErr && (
              <div className="clipsError" style={{ maxWidth: 1180, margin: "0 auto 10px" }}>
                {olderErr}
              </div>
            )}

            <motion.div
              className="clipsGrid"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {!olderLoading && !olderErr && olderClips.length === 0 && (
                <div className="clipsEmpty muted">
                  No older clips found yet. Try again later or switch creators.
                </div>
              )}

              {olderClips.map(renderClipCard)}
            </motion.div>
          </section>
        )}
      </div>
    </PageMotion>
  );
}
