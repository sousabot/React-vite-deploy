import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaInstagram, FaTwitch } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FiArrowUpRight } from "react-icons/fi";
import Page from "../../components/ui/Page.jsx";
import CtaBand from "../../components/ui/CtaBand.jsx";
import { useSiteContent } from "../../content/siteContent.js";
import { useTwitchLive } from "../../hooks/useTwitchLive.js";
import { formatViewers, initials, pad2 } from "../../lib/format.js";
import { track } from "../../lib/track.js";
import CreatorModal from "./CreatorModal.jsx";
import "./creators.css";

const EASE = [0.22, 1, 0.36, 1];

function gamesOf(c) {
  return (c.game || "")
    .split(/[·,/|]/)
    .map((g) => g.trim())
    .filter(Boolean);
}

function previewUrl(login, polledAt) {
  // Twitch refreshes these every few minutes; the poll time keeps the browser from showing a stale frame.
  const bucket = Math.floor((polledAt || 0) / 300_000);
  return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${login.toLowerCase()}-640x360.jpg?t=${bucket}`;
}

function uptime(stream) {
  const start = new Date(stream?.startedAt || "").getTime();
  if (!start || !stream?.polledAt) return null;
  const mins = Math.max(0, Math.floor((stream.polledAt - start) / 60_000));
  const h = Math.floor(mins / 60);
  return h ? `${h}h ${pad2(mins % 60)}m` : `${mins}m`;
}

function Avatar({ creator, live, size = "md" }) {
  return (
    <span
      className={`avatar avatar--${size} ${live ? "is-live" : ""}`}
      style={{ "--accent": creator.accent || "var(--orange)" }}
    >
      {creator.image ? <img src={creator.image} alt="" loading="lazy" decoding="async" /> : initials(creator.name)}
    </span>
  );
}

function OnAir({ live, streams, checked, onOpen }) {
  const [pick, setPick] = useState(null);
  const current = live.find((c) => c.id === pick) || live[0];

  if (!checked) {
    return <section className="on-air on-air--loading" aria-busy="true" />;
  }

  if (!current) {
    return (
      <section className="off-air">
        <span className="off-air__signal" aria-hidden="true" />
        <div>
          <span className="eyebrow">Off air</span>
          <p className="off-air__title">Nobody's live right now</p>
          <p className="muted small">Follow the team on Twitch and you'll catch the next stream as it starts.</p>
        </div>
      </section>
    );
  }

  const s = streams[current.twitchLogin];
  const viewers = formatViewers(s?.viewerCount);
  const up = uptime(s);

  return (
    <section className="on-air" style={{ "--accent": current.accent || "var(--orange)" }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.a
          key={current.id}
          href={current.twitch}
          target="_blank"
          rel="noopener noreferrer"
          className="on-air__screen"
          onClick={() => track("creator_watch_click", { creator: current.name, source: "on_air" })}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          <img src={previewUrl(current.twitchLogin, s?.polledAt)} alt={`${current.name} live on Twitch`} decoding="async" />
          <span className="on-air__hud">
            <span className="live-pill is-live">
              <span className="live-dot" /> Live
            </span>
            {viewers && <span className="on-air__stat mono">{viewers} watching</span>}
            {up && <span className="on-air__stat mono">{up}</span>}
          </span>
          <span className="on-air__play" aria-hidden="true">
            <FaTwitch />
          </span>
        </motion.a>
      </AnimatePresence>

      <div className="on-air__info">
        <span className="eyebrow">On air now</span>
        <div className="on-air__who">
          <Avatar creator={current} live size="lg" />
          <div>
            <h2 className="on-air__name">{current.name}</h2>
            <span className="mono faint small">{current.handle}</span>
          </div>
        </div>
        {s?.title && <p className="on-air__title">“{s.title}”</p>}
        {s?.streamGame && <span className="tag">{s.streamGame}</span>}
        <div className="row">
          <a
            href={current.twitch}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary"
            onClick={() => track("creator_watch_click", { creator: current.name, source: "on_air_button" })}
          >
            <FaTwitch aria-hidden="true" /> Watch live
          </a>
          <button type="button" className="btn btn--ghost" onClick={() => onOpen(current)}>
            Profile
          </button>
        </div>

        {live.length > 1 && (
          <div className="on-air__others">
            <span className="mono faint small">Also live</span>
            <div className="on-air__switch">
              {live.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={c.id === current.id ? "is-active" : ""}
                  onClick={() => setPick(c.id)}
                  aria-label={`Show ${c.name}`}
                  title={c.name}
                >
                  <Avatar creator={c} live size="sm" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ChannelRow({ creator, channel, stream, checked, onOpen }) {
  const isLive = !!stream?.isLive;
  const viewers = formatViewers(stream?.viewerCount);
  const socials = [
    { href: creator.twitch, label: "Twitch", icon: FaTwitch },
    { href: creator.instagram, label: "Instagram", icon: FaInstagram },
    { href: creator.twitter, label: "X", icon: FaXTwitter },
  ].filter((s) => s.href);

  return (
    <motion.li
      layout="position"
      className={`channel ${isLive ? "is-live" : ""}`}
      style={{ "--accent": creator.accent || "var(--orange)" }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <button type="button" className="channel__hit" onClick={() => onOpen(creator)} aria-label={`Open ${creator.name}`} />
      <span className="channel__num mono">CH {pad2(channel)}</span>
      <Avatar creator={creator} live={isLive} />
      <span className="channel__who">
        <span className="channel__name">{creator.name}</span>
        <span className="channel__handle mono">{creator.handle || creator.role}</span>
      </span>
      <span className="channel__games">
        {gamesOf(creator).map((g) => (
          <span key={g} className="tag">
            {g}
          </span>
        ))}
      </span>
      <span className="channel__status mono">
        {!checked ? (
          <span className="faint">—</span>
        ) : isLive ? (
          <span className="channel__live">
            <span className="live-dot" /> Live{viewers ? ` · ${viewers}` : ""}
          </span>
        ) : (
          <span className="faint">Offline</span>
        )}
      </span>
      <span className="channel__socials">
        {socials.map(({ href, label, icon: Icon }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${creator.name} on ${label}`}>
            <Icon />
          </a>
        ))}
      </span>
      <FiArrowUpRight className="channel__go" aria-hidden="true" />
    </motion.li>
  );
}

export default function CreatorsPage() {
  const { creators } = useSiteContent();
  const { streams, checked, live } = useTwitchLive(creators);
  const [open, setOpen] = useState(null);
  const [filter, setFilter] = useState("all");

  const games = useMemo(() => {
    const counts = new Map();
    creators.forEach((c) => gamesOf(c).forEach((g) => counts.set(g, (counts.get(g) || 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([g]) => g);
  }, [creators]);

  // Channel numbers follow the CMS order so they stay stable while live creators move to the top.
  const channels = useMemo(() => new Map(creators.map((c, i) => [c.id, i + 1])), [creators]);

  const list = useMemo(() => {
    const isLive = (c) => !!streams[c.twitchLogin]?.isLive;
    const ordered = [...live, ...creators.filter((c) => !isLive(c))];
    if (filter === "live") return ordered.filter(isLive);
    if (filter !== "all") return ordered.filter((c) => gamesOf(c).includes(filter));
    return ordered;
  }, [creators, live, streams, filter]);

  const filters = [
    { id: "all", label: "All", count: creators.length },
    { id: "live", label: "Live now", count: checked ? live.length : null },
    ...games.map((g) => ({ id: g, label: g })),
  ];

  return (
    <Page className="creators-page">
      <header className="creators-top">
        <div>
          <span className="eyebrow">Content team</span>
          <h1 className="display display--lg">Creators</h1>
          <p className="lead">Streamers repping GD across League, CS2 and beyond.</p>
        </div>
        <div className="creators-top__stats">
          <span>
            <strong>{pad2(creators.length)}</strong>
            <span className="mono faint">Channels</span>
          </span>
          <span className={live.length ? "is-live" : ""}>
            <strong>{checked ? pad2(live.length) : "--"}</strong>
            <span className="mono faint">Live now</span>
          </span>
        </div>
      </header>

      <OnAir live={live} streams={streams} checked={checked} onOpen={setOpen} />

      <section className="guide">
        <div className="guide__bar">
          <h2 className="display display--sm">Channel guide</h2>
          <div className="guide__filters" role="tablist" aria-label="Filter creators">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                className={`chip ${filter === f.id ? "is-active" : ""}`}
                onClick={() => setFilter(f.id)}
              >
                {f.id === "live" && <span className={`live-dot ${live.length ? "is-on" : ""}`} />}
                {f.label}
                {f.count != null && <span className="faint">{f.count}</span>}
              </button>
            ))}
          </div>
        </div>

        <ul className="guide__list">
          <AnimatePresence initial={false}>
            {list.map((c) => (
              <ChannelRow
                key={c.id}
                creator={c}
                channel={channels.get(c.id)}
                stream={streams[c.twitchLogin]}
                checked={checked}
                onOpen={setOpen}
              />
            ))}
          </AnimatePresence>
        </ul>
        {list.length === 0 && (
          <p className="guide__empty muted">
            {filter === "live" ? "Nobody's live right now. Check back soon." : "No creators here yet."}
          </p>
        )}
      </section>

      <div className="page-cta">
        <CtaBand eyebrow="Create with us" title="Stream under the GD banner" sub="Streamers, editors and short-form creators — tell us about your content.">
          <Link to="/work-with-us?role=creator" className="btn btn--primary">
            Apply as creator
          </Link>
        </CtaBand>
      </div>

      <CreatorModal creator={open} stream={open ? streams[open.twitchLogin] : null} onClose={() => setOpen(null)} />
    </Page>
  );
}
