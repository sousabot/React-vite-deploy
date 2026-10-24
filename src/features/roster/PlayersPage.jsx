import React, { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaXTwitter } from "react-icons/fa6";
import { FiArrowLeft, FiArrowRight, FiExternalLink } from "react-icons/fi";
import Page from "../../components/ui/Page.jsx";
import CtaBand from "../../components/ui/CtaBand.jsx";
import { PLAYER_TEAMS } from "../../content/players.js";
import { SITE } from "../../config/site.js";
import { pad2 } from "../../lib/format.js";
import { track } from "../../lib/track.js";
import "./players.css";

const EASE = [0.22, 1, 0.36, 1];

const ROLE_CODES = {
  "TOP LANE": "TOP",
  JUNGLE: "JGL",
  JUNGLER: "JGL",
  "MID LANE": "MID",
  ADC: "ADC",
  SUPPORT: "SUP",
  "HEAD COACH": "COACH",
};

function roleCode(role = "") {
  const r = role.toUpperCase();
  return ROLE_CODES[r] || r.split(" ")[0];
}

function slug(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
}

// First team is the starting lineup; every other team is listed on the bench.
const [STARTERS, ...BENCH] = PLAYER_TEAMS;
const ALL = PLAYER_TEAMS.flatMap((team) =>
  team.members.map((m) => ({ ...m, slug: slug(m.name), teamLabel: team.label, starter: team === STARTERS }))
);

function Spotlight({ player, index, onStep }) {
  const links = [
    player.twitter && { href: player.twitter, label: "X", icon: <FaXTwitter /> },
    player.lolpros && { href: player.lolpros, label: "LoLPros", icon: <FiExternalLink /> },
  ].filter(Boolean);

  return (
    <section id="spotlight" className="spotlight" aria-live="polite">
      <div className="spotlight__bg" aria-hidden="true">
        <span className="spotlight__mark">{roleCode(player.role)}</span>
      </div>

      <div className="spotlight__stage">
        <AnimatePresence initial={false}>
          <motion.img
            key={player.id}
            className="spotlight__img"
            src={player.image}
            alt={player.name}
            decoding="async"
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -48 }}
            transition={{ duration: 0.45, ease: EASE }}
          />
        </AnimatePresence>
      </div>

      <div className="spotlight__info">
        <span className="eyebrow">{player.starter ? `Starting five · ${SITE.league}` : player.teamLabel}</span>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={player.id}
            className="spotlight__copy"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: EASE }}
          >
            <span className="spotlight__number mono">#{player.number}</span>
            <h2 className="spotlight__name">{player.name}</h2>
            <div className="spotlight__meta mono">
              <span className="text-orange">{player.role}</span>
              <span>{player.game}</span>
            </div>
            {links.length > 0 && (
              <div className="spotlight__links">
                {links.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--ghost btn--sm"
                    onClick={() => track("player_social_click", { player: player.name, network: l.label })}
                  >
                    {l.icon}
                    {l.label}
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="spotlight__nav">
          <button type="button" className="icon-btn" onClick={() => onStep(-1)} aria-label="Previous player">
            <FiArrowLeft />
          </button>
          <button type="button" className="icon-btn" onClick={() => onStep(1)} aria-label="Next player">
            <FiArrowRight />
          </button>
          <span className="mono faint">
            {pad2(index + 1)} / {pad2(ALL.length)}
          </span>
        </div>
      </div>
    </section>
  );
}

function Lineup({ activeSlug, onSelect }) {
  return (
    <nav className="lineup" aria-label="Starting lineup">
      {STARTERS.members.map((m) => {
        const s = slug(m.name);
        const active = s === activeSlug;
        return (
          <button
            key={m.id}
            type="button"
            className={`lineup__slot ${active ? "is-active" : ""}`}
            aria-pressed={active}
            onClick={() => onSelect(s)}
          >
            {m.image && <img src={m.image} alt="" loading="lazy" decoding="async" />}
            <span className="lineup__code mono">{roleCode(m.role)}</span>
            <span className="lineup__name">{m.name}</span>
          </button>
        );
      })}
    </nav>
  );
}

function Bench({ activeSlug, onSelect }) {
  if (!BENCH.length) return null;
  return (
    <section className="bench">
      {BENCH.map((team) => (
        <div key={team.id} className="bench__group">
          <div className="bench__head">
            <h2 className="display display--sm">{team.label}</h2>
            <span className="mono faint">{pad2(team.members.length)}</span>
          </div>
          <div className="bench__grid">
            {team.members.map((m) => {
              const s = slug(m.name);
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`bench-row ${s === activeSlug ? "is-active" : ""}`}
                  onClick={() => onSelect(s, { scroll: true })}
                >
                  <span className="bench-row__img">
                    {m.image ? <img src={m.image} alt="" loading="lazy" decoding="async" /> : m.initials}
                  </span>
                  <span className="bench-row__info">
                    <span className="bench-row__role mono">{m.badge || m.role}</span>
                    <span className="bench-row__name">{m.name}</span>
                  </span>
                  <span className="bench-row__num mono">#{m.number}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}

export default function PlayersPage() {
  const [params, setParams] = useSearchParams();
  const found = ALL.findIndex((p) => p.slug === params.get("player"));
  const index = found === -1 ? 0 : found;
  const player = ALL[index];

  function select(nextSlug, { scroll = false } = {}) {
    setParams({ player: nextSlug }, { replace: true });
    if (scroll) document.getElementById("spotlight")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function step(dir) {
    select(ALL[(index + dir + ALL.length) % ALL.length].slug);
  }

  useEffect(() => {
    function onKey(e) {
      if (e.target.closest?.("input, textarea, select, [contenteditable]")) return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <Page className="players-page">
      <header className="players-top">
        <div>
          <span className="eyebrow">The roster</span>
          <h1 className="display display--md">Players</h1>
        </div>
        <div className="players-top__meta mono faint">
          <span>{ALL.length} members</span>
          <span>{SITE.league}</span>
          <span className="hide-mobile">← → to browse</span>
        </div>
      </header>

      <Spotlight player={player} index={index} onStep={step} />
      <Lineup activeSlug={player.slug} onSelect={select} />
      <Bench activeSlug={player.slug} onSelect={select} />

      <div className="page-cta">
        <CtaBand eyebrow="Tryouts" title="Think you've got it?" sub="We're always scouting. Apply and the team will review it.">
          <Link to="/work-with-us" className="btn btn--primary">
            Apply for tryouts
          </Link>
        </CtaBand>
      </div>
    </Page>
  );
}
