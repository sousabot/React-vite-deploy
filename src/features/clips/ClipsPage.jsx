import React, { useEffect, useMemo, useState } from "react";
import { FaPlay } from "react-icons/fa";
import Page from "../../components/ui/Page.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import SectionHead from "../../components/ui/SectionHead.jsx";
import Alert from "../../components/ui/Alert.jsx";
import { useSiteContent } from "../../content/siteContent.js";
import "./clips.css";

const RANGES = [7, 14, 30];
const ARCHIVE_DAYS = 365;
const DAY_MS = 24 * 60 * 60 * 1000;

function clipDate(clip) {
  const d = new Date(clip.created_at || clip.createdAt || "");
  return Number.isNaN(d.getTime()) ? null : d;
}

async function fetchClips(users, days, first) {
  const url = `/.netlify/functions/twitch-clips?users=${encodeURIComponent(users)}&days=${days}&first=${first}`;
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Clips service returned an unexpected response.");
  }
  const clips = Array.isArray(data?.clips) ? data.clips : [];
  if (!res.ok || (data?.error && !clips.length)) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return clips;
}

function useClips(users, days, first, { enabled = true, filter } = {}) {
  const key = enabled && users ? `${users}|${days}|${first}` : null;
  const [result, setResult] = useState({ key: null, clips: [], error: "" });

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    fetchClips(users, days, first)
      .then((clips) => {
        if (!cancelled) setResult({ key, clips: filter ? filter(clips) : clips, error: "" });
      })
      .catch((e) => {
        console.warn("[clips]", e.message);
        if (!cancelled) {
          setResult({ key, clips: [], error: "Clips are unavailable right now. Check back soon, or watch on Twitch." });
        }
      });
    return () => {
      cancelled = true;
    };
    // `filter` is a stable module-level function when provided.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const current = !!key && result.key === key;
  return {
    clips: current ? result.clips : [],
    loading: !!key && !current,
    error: current ? result.error : "",
  };
}

function olderThan30Days(clips) {
  const cutoff = Date.now() - 30 * DAY_MS;
  return clips.filter((c) => (clipDate(c)?.getTime() ?? Infinity) < cutoff).slice(0, 24);
}

function ClipCard({ clip }) {
  const title = clip.title || "Untitled clip";
  const url = clip.url || clip.clip_url || "#";
  const thumb = clip.thumbnail_url || clip.thumbnailUrl;
  const views = clip.view_count ?? clip.views ?? 0;
  const date = clipDate(clip);

  return (
    <a className="clip-card" href={url} target="_blank" rel="noopener noreferrer" title={title}>
      <span className="clip-card__thumb">
        {thumb && <img src={thumb} alt="" loading="lazy" />}
        <span className="clip-card__play">
          <FaPlay aria-hidden="true" />
        </span>
        <span className="clip-card__views mono">{Number(views).toLocaleString()} views</span>
      </span>
      <span className="clip-card__info">
        <span className="clip-card__title">{title}</span>
        <span className="mono faint">
          {clip.broadcaster_name || clip.broadcasterName || "Creator"}
          {date ? ` · ${date.toLocaleDateString(undefined, { day: "2-digit", month: "short" })}` : ""}
        </span>
      </span>
    </a>
  );
}

function ClipGrid({ loading, error, clips, empty }) {
  if (error) return <Alert tone="error">{error}</Alert>;
  if (loading && !clips.length) {
    return (
      <div className="clip-grid">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="clip-card clip-card--skeleton" />
        ))}
      </div>
    );
  }
  if (!clips.length) return <div className="empty muted">{empty}</div>;
  return (
    <div className="clip-grid">
      {clips.map((clip) => (
        <ClipCard key={clip.id || clip.url} clip={clip} />
      ))}
    </div>
  );
}

export default function ClipsPage() {
  const { creators } = useSiteContent();
  const [days, setDays] = useState(7);
  const [creator, setCreator] = useState("all");

  const users = useMemo(
    () => (creator === "all" ? creators.map((c) => c.twitchLogin).join(",") : creator),
    [creator, creators]
  );

  const main = useClips(users, days, 24);
  const archive = useClips(users, ARCHIVE_DAYS, 50, { enabled: days === 30, filter: olderThan30Days });

  return (
    <Page>
      <PageHeader
        eyebrow="Highlights"
        title="Clips"
        lead="The best moments from GD creators, pulled straight from Twitch."
      />

      <div className="clips-controls">
        <div className="chip-row" role="group" aria-label="Time range">
          {RANGES.map((d) => (
            <button
              key={d}
              type="button"
              className={`chip ${days === d ? "is-active" : ""}`}
              onClick={() => setDays(d)}
            >
              {d} days
            </button>
          ))}
        </div>
        <div className="chip-row" role="group" aria-label="Creator">
          <button
            type="button"
            className={`chip ${creator === "all" ? "is-active" : ""}`}
            onClick={() => setCreator("all")}
          >
            All
          </button>
          {creators.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`chip ${creator === c.twitchLogin ? "is-active" : ""}`}
              onClick={() => setCreator(c.twitchLogin)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <ClipGrid {...main} empty="No clips in this range. Try 14 or 30 days." />

      {days === 30 && (
        <section className="section--tight" style={{ marginTop: 32 }}>
          <SectionHead eyebrow="Archive" title="From the vault" sub={`Older highlights from the last ${ARCHIVE_DAYS} days.`} />
          <ClipGrid {...archive} empty="No older clips yet." />
        </section>
      )}
    </Page>
  );
}
