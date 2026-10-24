import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaDiscord } from "react-icons/fa";
import { DISCORD_INVITE, SITE } from "../../config/site.js";
import { track } from "../../lib/track.js";

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function HeroSection({ discordMembers, creatorCount, liveCount }) {
  const stats = [
    { label: "Discord members", value: discordMembers != null ? `${discordMembers.toLocaleString()}+` : "—" },
    { label: "Creators", value: creatorCount },
    { label: "Live now", value: liveCount ?? "…", live: liveCount > 0 },
    { label: "League", value: SITE.league },
  ];

  return (
    <section className="hero container">
      <div className="hero__copy">
        <motion.span className="eyebrow" {...rise(0)}>
          {SITE.name} · Official site
        </motion.span>
        <motion.h1 className="display display--xl hero__title" {...rise(0.05)}>
          Built to
          <br />
          <span className="text-orange">compete.</span>
        </motion.h1>
        <motion.p className="lead" {...rise(0.12)}>
          {SITE.league} roster, creators and a community that shows up. One org, one standard.
        </motion.p>
        <motion.div className="row" {...rise(0.18)}>
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary"
            onClick={() => track("discord_click", { source: "home_hero" })}
          >
            <FaDiscord aria-hidden="true" />
            Join the Discord
          </a>
          <Link to="/players" className="btn btn--ghost">
            Meet the roster
          </Link>
        </motion.div>
      </div>

      <motion.div
        className="hero__emblem"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      >
        <div className="hero__ring" />
        <div className="hero__ring hero__ring--inner" />
        <img className="hero__logo" src="/logo.png" alt="" />
        <span className="hero__corner hero__corner--tl" />
        <span className="hero__corner hero__corner--br" />
        <span className="hero__coords mono">GDE // {SITE.league}</span>
      </motion.div>

      <motion.dl className="hero__stats" {...rise(0.26)}>
        {stats.map((s) => (
          <div key={s.label} className={`stat hero__stat ${s.live ? "is-live" : ""}`}>
            <dt className="stat__label">
              {s.live && <span className="live-dot" style={{ color: "var(--live)" }} />} {s.label}
            </dt>
            <dd className="stat__value" style={{ margin: 0 }}>
              {s.value}
            </dd>
          </div>
        ))}
      </motion.dl>
    </section>
  );
}
