import React, { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaXTwitter } from "react-icons/fa6";
import { FiArrowLeft, FiArrowRight, FiExternalLink } from "react-icons/fi";
import Page from "../../components/ui/Page.jsx";
import CtaBand from "../../components/ui/CtaBand.jsx";
import { PLAYER_GAMES } from "../../content/players.js";
import { DISCORD_INVITE } from "../../config/site.js";
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
  AWPER: "AWP",
  "IN-GAME LEADER": "IGL",
  "ENTRY FRAGGER": "ENTRY",
  RIFLER: "RIFLE",
  LURKER: "LURK",
  ANCHOR: "ANCHOR",
  SUBSTITUTE: "SUB",
};

function roleCode(role = "") {
  const r = role.toUpperCase();
  return ROLE_CODES[r] || r.split(" ")[0];
}

function slug(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
}

// Per game: the first team is the starting lineup, every other team goes on the bench.
const GAMES = PLAYER_GAMES.map((game) => {
  const [starters, ...bench] = game.teams;
  const teams = game.announced === false ? [] : game.teams;
  const all = teams.flatMap((team) =>
    team.members.map((m) => ({ ...m, slug: slug(m.name), teamLabel: team.label, starter: team === starters }))
  );
  return { ...game, starters, bench: bench.filter((t) => t.members.length), all };
});

const warmed = new Set();
function warmImages(players) {
  for (const p of players) {
    if (!p.image || warmed.has(p.image)) continue;
    warmed.add(p.image);
    const img = new Image();
    img.decoding = "async";
    img.src = p.image;
  }
}

// This module is also preloaded in the background from other pages, so start fetching
// the default roster's photos then.
if (typeof window !== "undefined") {
  const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 500));
  idle(() => warmImages((GAMES.find((g) => g.all.length) || GAMES[0]).all));
}

function GameTabs({ activeId, onSelect }) {
  return (
    <div className="game-tabs" role="tablist" aria-label="Game">
      {GAMES.map((g) => (
        <button
          key={g.id}
          type="button"
          role="tab"
          aria-selected={g.id === activeId}
          className={`game-tabs__tab ${g.id === activeId ? "is-active" : ""}`}
          onClick={() => onSelect(g.id)}
        >
          <span className="game-tabs__short mono">{g.short}</span>
          <span className="game-tabs__label">{g.label}</span>
          <span className="game-tabs__count mono">{g.all.length ? pad2(g.all.length) : "Soon"}</span>
        </button>
      ))}
    </div>
  );
}

function Spotlight({ game, player, index, onStep }) {
  const links = [
    player.twitter && { href: player.twitter, label: "X", icon: <FaXTwitter /> },
    player.lolpros && { href: player.lolpros, label: "LoLPros", icon: <FiExternalLink /> },
    player.faceit && { href: player.faceit, label: "FACEIT", icon: <FiExternalLink /> },
    player.hltv && { href: player.hltv, label: "HLTV", icon: <FiExternalLink /> },
  ].filter(Boolean);

  return (
    <section id="spotlight" className="spotlight" aria-live="polite">
      <div className="spotlight__bg" aria-hidden="true">
        <span className="spotlight__mark">{roleCode(player.role)}</span>
      </div>

      <div className="spotlight__stage">
        <AnimatePresence initial={false}>
          {player.image && (
            <motion.img
              key={player.id}
              className="spotlight__img"
              src={player.image}
              alt={player.name}
              fetchPriority="high"
              initial={{ opacity: 0, x: 48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -48 }}
              transition={{ duration: 0.45, ease: EASE }}
            />
          )}
        </AnimatePresence>
      </div>

      <div className="spotlight__info">
        <span className="eyebrow">
          {player.starter ? `Starting five · ${game.league || game.label}` : player.teamLabel}
        </span>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={player.id}
            className="spotlight__copy"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: EASE }}
          >
            {player.number && <span className="spotlight__number mono">#{player.number}</span>}
            <h2 className="spotlight__name">{player.name}</h2>
            <div className="spotlight__meta mono">
              <span className="text-orange">{player.role}</span>
              <span>{player.game || game.label}</span>
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

        {game.all.length > 1 && (
          <div className="spotlight__nav">
            <button type="button" className="icon-btn" onClick={() => onStep(-1)} aria-label="Previous player">
              <FiArrowLeft />
            </button>
            <button type="button" className="icon-btn" onClick={() => onStep(1)} aria-label="Next player">
              <FiArrowRight />
            </button>
            <span className="mono faint">
              {pad2(index + 1)} / {pad2(game.all.length)}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

function ComingSoon({ game }) {
  return (
    <section className="spotlight spotlight--soon">
      <div className="spotlight__bg" aria-hidden="true">
        <span className="spotlight__mark">{game.short}</span>
      </div>
      <div className="spotlight__info">
        <span className="eyebrow">{game.league ? `${game.label} · ${game.league}` : game.label}</span>
        <h2 className="spotlight__name">Roster coming soon</h2>
        <p className="muted">
          Our {game.label} squad is being locked in. Join the Discord to be first to see who's wearing the jersey.
        </p>
        <div className="spotlight__links">
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary btn--sm"
            onClick={() => track("discord_click", { source: `players_${game.id}_soon` })}
          >
            Join the Discord
          </a>
          <Link to="/work-with-us?role=player" className="btn btn--ghost btn--sm">
            Apply for tryouts
          </Link>
        </div>
      </div>
    </section>
  );
}

function Lineup({ team, activeSlug, onSelect }) {
  if (!team?.members.length) return null;
  return (
    <nav className="lineup" aria-label="Starting lineup">
      {team.members.map((m) => {
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
            {m.image && <img src={m.image} alt="" decoding="async" />}
            <span className="lineup__code mono">{roleCode(m.role)}</span>
            <span className="lineup__name">{m.name}</span>
          </button>
        );
      })}
    </nav>
  );
}

function Bench({ teams, activeSlug, onSelect }) {
  if (!teams.length) return null;
  return (
    <section className="bench">
      {teams.map((team) => (
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
                  {m.number && <span className="bench-row__num mono">#{m.number}</span>}
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
  const playerParam = params.get("player");

  // A shared player link picks its own game; otherwise use ?game=, then the first game.
  const game =
    GAMES.find((g) => g.all.some((p) => p.slug === playerParam)) ||
    GAMES.find((g) => g.id === params.get("game")) ||
    GAMES.find((g) => g.all.length) ||
    GAMES[0];
  const found = game.all.findIndex((p) => p.slug === playerParam);
  const index = found === -1 ? 0 : found;
  const player = game.all[index];

  useEffect(() => {
    warmImages(game.all);
  }, [game]);

  function select(nextSlug, { scroll = false } = {}) {
    setParams({ game: game.id, player: nextSlug }, { replace: true });
    if (scroll) document.getElementById("spotlight")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function selectGame(id) {
    if (id === game.id) return;
    setParams({ game: id }, { replace: true });
    track("players_game_tab", { game: id });
  }

  function step(dir) {
    if (game.all.length < 2) return;
    select(game.all[(index + dir + game.all.length) % game.all.length].slug);
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

  const totalMembers = GAMES.reduce((n, g) => n + g.all.length, 0);

  return (
    <Page className="players-page">
      <header className="players-top">
        <div>
          <span className="eyebrow">The roster</span>
          <h1 className="display display--md">Players</h1>
        </div>
        <div className="players-top__meta mono faint">
          {totalMembers > 0 && <span>{totalMembers} members</span>}
          <span>{GAMES.length} games</span>
          {player && <span className="hide-mobile">← → to browse</span>}
        </div>
      </header>

      <GameTabs activeId={game.id} onSelect={selectGame} />

      {player ? (
        <>
          <Spotlight game={game} player={player} index={index} onStep={step} />
          <Lineup team={game.starters} activeSlug={player.slug} onSelect={select} />
          <Bench teams={game.bench} activeSlug={player.slug} onSelect={select} />
        </>
      ) : (
        <ComingSoon game={game} />
      )}

      <div className="page-cta">
        <CtaBand eyebrow="Tryouts" title="Think you've got it?" sub="We're always scouting. Apply and the team will review it.">
          <Link to="/work-with-us?role=player" className="btn btn--primary">
            Apply for tryouts
          </Link>
        </CtaBand>
      </div>
    </Page>
  );
}
