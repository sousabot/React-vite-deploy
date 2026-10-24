import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaCog, FaCopy, FaDiscord, FaFilm, FaInstagram, FaNewspaper, FaShoppingBag, FaUsers } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Page from "../../components/ui/Page.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { useAuth } from "../auth/useAuth.js";
import { useSiteContent } from "../../content/siteContent.js";
import { useTwitchLive } from "../../hooks/useTwitchLive.js";
import { useDiscordStats } from "../../hooks/useDiscordStats.js";
import { SITE, SOCIALS } from "../../config/site.js";
import { formatViewers } from "../../lib/format.js";
import "./dashboard.css";

function useTryoutsOpen() {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    let cancelled = false;
    fetch("/.netlify/functions/site-config", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && typeof data?.tryoutsOpen === "boolean") setOpen(data.tryoutsOpen);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return open;
}

function StatusStrip({ discord, checked, live, streams, tryoutsOpen }) {
  const top = live[0];
  const topViewers = top ? formatViewers(streams[top.twitchLogin]?.viewerCount) : null;

  const items = [
    {
      label: "Discord",
      value: discord.members != null ? `${discord.members.toLocaleString()}+` : "—",
      sub: discord.online != null ? `${discord.online} online` : "Members",
    },
    {
      label: "Creators live",
      value: checked ? live.length : "…",
      sub: !checked
        ? "Checking…"
        : top
          ? `Top: ${top.name}${topViewers ? ` · ${topViewers}` : ""}`
          : "No one live right now",
      tone: live.length > 0 ? "live" : null,
    },
    {
      label: "Tryouts",
      value: tryoutsOpen ? "Open" : "Closed",
      sub: tryoutsOpen ? "Applications welcome" : "Not accepting right now",
      tone: tryoutsOpen ? "ok" : null,
    },
  ];

  return (
    <div className="dash-strip">
      {items.map((s) => (
        <div key={s.label} className={`dash-strip__item ${s.tone ? `is-${s.tone}` : ""}`}>
          <span className="stat__label">{s.label}</span>
          <span className="stat__value">{s.value}</span>
          <span className="faint small">{s.sub}</span>
        </div>
      ))}
    </div>
  );
}

function LivePanel({ creators, streams, checked }) {
  return (
    <section className="panel dash-live">
      <div className="panel__head">
        <div>
          <h2 className="panel__title">Live creators</h2>
          <p className="faint small">Auto-monitored from the GD roster.</p>
        </div>
      </div>
      <div className="dash-live__list">
        {creators.map((c) => {
          const info = streams[c.twitchLogin];
          const isLive = !!info?.isLive;
          const viewers = formatViewers(info?.viewerCount);
          return (
            <a
              key={c.id}
              href={c.twitch}
              target="_blank"
              rel="noopener noreferrer"
              className={`dash-live__row ${isLive ? "is-live" : ""}`}
            >
              <span className="dash-live__img">{c.image && <img src={c.image} alt="" loading="lazy" />}</span>
              <span className="dash-live__info">
                <strong>{c.name}</strong>
                <span className="faint small">
                  {isLive ? `${viewers ? `${viewers} watching · ` : ""}${info.streamGame || c.game}` : c.game?.trim()}
                </span>
              </span>
              <span className={`live-pill ${isLive ? "is-live" : ""}`}>
                <span className="live-dot" />
                {!checked ? "…" : isLive ? "Live" : "Off"}
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

function QuickActions({ isAdmin }) {
  const actions = [
    { label: "Creators", to: "/creators", icon: FaUsers },
    { label: "Clips", to: "/clips", icon: FaFilm },
    { label: "Shop", to: "/shop", icon: FaShoppingBag },
    { label: "News", to: "/news", icon: FaNewspaper },
    { label: "Discord", href: SOCIALS.discord, icon: FaDiscord },
    { label: "Instagram", href: SOCIALS.instagram, icon: FaInstagram },
    { label: "X", href: SOCIALS.x, icon: FaXTwitter },
    ...(isAdmin ? [{ label: "Admin", to: "/admin", icon: FaCog }] : []),
  ];

  return (
    <section className="panel">
      <div className="panel__head">
        <h2 className="panel__title">Quick actions</h2>
      </div>
      <div className="dash-actions">
        {actions.map(({ label, to, href, icon: Icon }) =>
          to ? (
            <Link key={label} to={to} className="dash-actions__tile">
              <Icon aria-hidden="true" />
              {label}
            </Link>
          ) : (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="dash-actions__tile">
              <Icon aria-hidden="true" />
              {label}
            </a>
          )
        )}
      </div>
    </section>
  );
}

function CopyLinks() {
  const [copied, setCopied] = useState("");
  const origin = window.location.origin || SITE.url;
  const links = [
    { id: "discord", label: "Discord invite", value: SOCIALS.discord },
    { id: "shop", label: "Shop link", value: `${origin}/shop` },
    { id: "site", label: "Website", value: origin },
  ];

  async function copy(id, value) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(id);
    } catch {
      setCopied("error");
    }
    setTimeout(() => setCopied(""), 2000);
  }

  return (
    <section className="panel dash-copy">
      <div className="panel__head">
        <div>
          <h2 className="panel__title">Copy links</h2>
          <p className="faint small">One click for posts, bios and announcements.</p>
        </div>
      </div>
      <div className="dash-copy__grid">
        {links.map((l) => (
          <button key={l.id} type="button" className="dash-copy__btn" onClick={() => copy(l.id, l.value)}>
            <FaCopy aria-hidden="true" />
            <span>
              <strong>{l.label}</strong>
              <span className="faint small">{l.value}</span>
            </span>
            <AnimatePresence>
              {copied === l.id && (
                <motion.span className="dash-copy__toast mono" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  Copied
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const { creators } = useSiteContent();
  const { streams, checked, live } = useTwitchLive(creators);
  const discord = useDiscordStats();
  const tryoutsOpen = useTryoutsOpen();
  const name = user?.gamerTag || user?.email?.split("@")[0] || "player";

  return (
    <Page>
      <PageHeader eyebrow="Command centre" title="Welcome," accent={`${name}.`} lead="Org pulse, live creators and quick links." />
      <StatusStrip discord={discord} checked={checked} live={live} streams={streams} tryoutsOpen={tryoutsOpen} />
      <div className="dash-grid">
        <LivePanel creators={creators} streams={streams} checked={checked} />
        <QuickActions isAdmin={isAdmin} />
        <CopyLinks />
      </div>
    </Page>
  );
}
