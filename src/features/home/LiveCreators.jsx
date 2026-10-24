import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaTwitch } from "react-icons/fa";
import SectionHead from "../../components/ui/SectionHead.jsx";
import { formatViewers } from "../../lib/format.js";
import { track } from "../../lib/track.js";

export default function LiveCreators({ creators, streams, checked, live }) {
  const featured = live[0];
  const featuredStream = featured ? streams[featured.twitchLogin] : null;

  const sub = !checked
    ? "Checking who's live…"
    : live.length
      ? `${live.length} live right now`
      : "Nobody live right now — catch the next stream.";

  return (
    <section className="section container">
      <SectionHead
        index="01"
        eyebrow="Creators"
        title="On the stream"
        sub={sub}
        actions={
          <Link to="/creators" className="btn btn--ghost btn--sm">
            All creators
          </Link>
        }
      />

      {featured && (
        <motion.a
          href={featured.twitch}
          target="_blank"
          rel="noopener noreferrer"
          className="live-feature"
          style={{ "--accent": featured.accent || "var(--orange)" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => track("twitch_watch", { source: "home_creators", creator: featured.id })}
        >
          <img className="live-feature__img" src={featured.image} alt={featured.name} />
          <div className="live-feature__body">
            <span className="live-pill is-live">
              <span className="live-dot" /> Live now
            </span>
            <div className="display display--md">{featured.name}</div>
            <p className="muted">
              {featuredStream?.title || featured.game}
              {formatViewers(featuredStream?.viewerCount)
                ? ` · ${formatViewers(featuredStream.viewerCount)} watching`
                : ""}
            </p>
          </div>
          <span className="btn btn--primary btn--sm live-feature__cta">
            <FaTwitch aria-hidden="true" /> Watch
          </span>
        </motion.a>
      )}

      <div className="creator-strip">
        {creators.map((c) => {
          const isLive = !!streams[c.twitchLogin]?.isLive;
          return (
            <a
              key={c.id}
              href={c.twitch}
              target="_blank"
              rel="noopener noreferrer"
              className={`creator-chip ${isLive ? "is-live" : ""}`}
              style={{ "--accent": c.accent || "var(--orange)" }}
              onClick={() => track("twitch_watch", { source: "home_strip", creator: c.id })}
            >
              <span className="creator-chip__img">
                {c.image && <img src={c.image} alt="" loading="lazy" />}
              </span>
              <span className="creator-chip__info">
                <span className="creator-chip__name">{c.name}</span>
                <span className="creator-chip__game faint">{c.game?.trim()}</span>
              </span>
              {checked && (
                <span className={`live-pill ${isLive ? "is-live" : ""}`}>
                  <span className="live-dot" />
                  {isLive ? "Live" : "Off"}
                </span>
              )}
            </a>
          );
        })}
      </div>
    </section>
  );
}
