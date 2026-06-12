import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaDiscord,
  FaInstagram,
  FaCopy,
  FaShoppingBag,
  FaNewspaper,
  FaUsers,
  FaFilm,
  FaCog,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import PageMotion from "../components/PageMotion.jsx";
import { useAuth } from "../state/auth.jsx";
import { ADMIN_EMAILS } from "../state/admins.js";
import { CREATORS } from "../data/creators.js";
import { DISCORD_INVITE } from "../data/links.js";

const cardVariant = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

const LS = {
  focus: "gd_dash_focus_v2",
};

const DEFAULT_FOCUS = [
  "Post 1 short clip",
  "Check Discord announcements",
  "Share shop or jersey update",
  "Reply to creator messages",
  "Review live schedule",
];

function formatViewers(count) {
  if (!count || count < 1) return null;
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return count.toLocaleString();
}

function sortLiveCreators(streams) {
  return CREATORS.filter((c) => streams[c.twitchLogin]?.isLive).sort((a, b) => {
    const diff =
      (streams[b.twitchLogin]?.viewerCount || 0) -
      (streams[a.twitchLogin]?.viewerCount || 0);
    if (diff !== 0) return diff;
    return CREATORS.indexOf(a) - CREATORS.indexOf(b);
  });
}

function useLocalStorageState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return initialValue;
      return JSON.parse(raw);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key, value]);

  return [value, setValue];
}

function cryptoRandomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

const ALL_CREATOR_LOGINS = CREATORS.map((c) => c.twitchLogin).join(",");

export default function Dashboard() {
  const { user } = useAuth();

  const isAdmin = useMemo(() => {
    if (!user) return false;
    return ADMIN_EMAILS.includes((user.email || "").toLowerCase());
  }, [user]);

  const greeting = useMemo(() => {
    const name = user?.gamerTag || user?.email?.split("@")[0] || "Player";
    return `Welcome, ${name}`;
  }, [user]);

  const [discordMembers, setDiscordMembers] = useState(null);
  const [discordOnline, setDiscordOnline] = useState(null);
  const [tryoutsOpen, setTryoutsOpen] = useState(true);
  const [streamMap, setStreamMap] = useState({});
  const [liveChecked, setLiveChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDiscord() {
      try {
        const res = await fetch("/.netlify/functions/discord-members", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (typeof data?.members === "number") setDiscordMembers(data.members);
        if (typeof data?.online === "number") setDiscordOnline(data.online);
      } catch {
        // ignore
      }
    }

    async function loadConfig() {
      try {
        const res = await fetch("/.netlify/functions/site-config", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && typeof data?.tryoutsOpen === "boolean") {
          setTryoutsOpen(data.tryoutsOpen);
        }
      } catch {
        // ignore
      }
    }

    loadDiscord();
    loadConfig();
    const t = setInterval(loadDiscord, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadLive() {
      try {
        const entries = await Promise.all(
          CREATORS.map(async (c) => {
            try {
              const res = await fetch(
                `/.netlify/functions/twitch-live?user=${encodeURIComponent(
                  c.twitchLogin
                )}&_=${Date.now()}`,
                { cache: "no-store" }
              );
              if (!res.ok) {
                return [
                  c.twitchLogin,
                  { isLive: false, viewerCount: 0, title: "", streamGame: "" },
                ];
              }
              const data = await res.json();
              return [
                c.twitchLogin,
                {
                  isLive: !!data?.isLive,
                  viewerCount: data?.viewerCount || 0,
                  title: data?.title || "",
                  streamGame: data?.game || "",
                },
              ];
            } catch {
              return [
                c.twitchLogin,
                { isLive: false, viewerCount: 0, title: "", streamGame: "" },
              ];
            }
          })
        );

        if (!cancelled) {
          setStreamMap(Object.fromEntries(entries));
          setLiveChecked(true);
        }
      } catch {
        if (!cancelled) setLiveChecked(true);
      }
    }

    loadLive();
    const t = setInterval(loadLive, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  const liveCreators = useMemo(() => sortLiveCreators(streamMap), [streamMap]);
  const liveCount = liveCreators.length;
  const topLive = liveCreators[0];

  return (
    <PageMotion>
      <div className="dashV2">
        <motion.header
          className="dashHero"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="dashHeroKicker">GD ESPORTS · COMMAND CENTER</div>
          <h1 className="dashHeroTitle">{greeting}</h1>
          <p className="dashHeroSub muted">
            Org pulse, live creators, content tasks, and quick links — built for
            the team.
          </p>
        </motion.header>

        <OrgStatusStrip
          discordMembers={discordMembers}
          discordOnline={discordOnline}
          liveCount={liveCount}
          liveChecked={liveChecked}
          topLive={topLive}
          topViewers={topLive ? streamMap[topLive.twitchLogin]?.viewerCount : 0}
          tryoutsOpen={tryoutsOpen}
        />

        <motion.div
          className="dashGrid"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        >
          <motion.section className="dashCard dashCardWide" variants={cardVariant}>
            <LiveCreatorsPanel
              streamMap={streamMap}
              liveChecked={liveChecked}
              liveCreators={liveCreators}
            />
          </motion.section>

          <motion.section className="dashCard" variants={cardVariant}>
            <QuickActionsPanel isAdmin={isAdmin} />
          </motion.section>

          <motion.section className="dashCard dashCardWide" variants={cardVariant}>
            <RecentClipsPanel />
          </motion.section>

          <motion.section className="dashCard" variants={cardVariant}>
            <FocusList />
          </motion.section>

          <motion.section className="dashCard dashCardFull" variants={cardVariant}>
            <CopyLinksBar />
          </motion.section>
        </motion.div>
      </div>
    </PageMotion>
  );
}

function OrgStatusStrip({
  discordMembers,
  discordOnline,
  liveCount,
  liveChecked,
  topLive,
  topViewers,
  tryoutsOpen,
}) {
  const viewerLabel = formatViewers(topViewers);

  return (
    <div className="dashStatusStrip">
      <div className="dashStatPill">
        <span className="dashStatLabel">Discord</span>
        <span className="dashStatValue">
          {discordMembers != null ? `${discordMembers.toLocaleString()}+` : "—"}
        </span>
        <span className="dashStatSub muted small">
          {discordOnline != null ? `${discordOnline} online` : "Members"}
        </span>
      </div>

      <div className={`dashStatPill ${liveCount > 0 ? "dashStatPillLive" : ""}`}>
        <span className="dashStatLabel">Creators Live</span>
        <span className="dashStatValue">
          {!liveChecked ? "…" : liveCount}
        </span>
        <span className="dashStatSub muted small">
          {!liveChecked
            ? "Checking…"
            : liveCount > 0
              ? viewerLabel
                ? `Top: ${topLive?.name} · ${viewerLabel} viewers`
                : `${topLive?.name} is live`
              : "No one live right now"}
        </span>
      </div>

      <div className={`dashStatPill ${tryoutsOpen ? "dashStatPillOpen" : ""}`}>
        <span className="dashStatLabel">Tryouts</span>
        <span className="dashStatValue">{tryoutsOpen ? "Open" : "Closed"}</span>
        <span className="dashStatSub muted small">
          {tryoutsOpen ? "Applications welcome" : "Not accepting right now"}
        </span>
      </div>
    </div>
  );
}

function LiveCreatorsPanel({ streamMap, liveChecked, liveCreators }) {
  return (
    <>
      <div className="dashCardHead">
        <div>
          <h2 className="dashCardTitle">Live Creators</h2>
          <p className="dashCardSub muted">
            Auto-monitored from the GD roster — sorted by viewers.
          </p>
        </div>
        <span className={`dashLiveBadge ${liveCreators.length > 0 ? "on" : ""}`}>
          <span className="dashLiveDot" />
          {!liveChecked
            ? "Checking…"
            : liveCreators.length > 0
              ? `${liveCreators.length} live`
              : "All offline"}
        </span>
      </div>

      <div className="dashLiveList">
        {CREATORS.map((c) => {
          const info = streamMap[c.twitchLogin];
          const isLive = !!info?.isLive;
          const viewers = formatViewers(info?.viewerCount);

          return (
            <a
              key={c.id}
              href={c.twitch}
              target="_blank"
              rel="noopener noreferrer"
              className={`dashLiveRow ${isLive ? "live" : ""}`}
              style={{ "--ca": c.accent, "--ca-rgb": c.accentRgb }}
            >
              <div className="dashLiveRowImg">
                <img src={c.image} alt={c.name} loading="lazy" />
                {isLive && <span className="dashLiveRowDot" />}
              </div>

              <div className="dashLiveRowInfo">
                <div className="dashLiveRowName">{c.name}</div>
                <div className="dashLiveRowSub muted small">
                  {!liveChecked
                    ? "Checking status…"
                    : isLive
                      ? viewers
                        ? `${viewers} watching · ${info?.streamGame || c.game}`
                        : info?.title || c.game
                      : c.game}
                </div>
              </div>

              <div className={`dashLiveRowStatus ${isLive ? "on" : ""}`}>
                {!liveChecked ? "…" : isLive ? "LIVE" : "OFFLINE"}
              </div>
            </a>
          );
        })}
      </div>
    </>
  );
}

function QuickActionsPanel({ isAdmin }) {
  const actions = [
    { label: "Creators", href: "/creators", icon: FaUsers, external: false },
    { label: "Clips", href: "/clips", icon: FaFilm, external: false },
    { label: "Shop", href: "/shop", icon: FaShoppingBag, external: false },
    { label: "News", href: "/news", icon: FaNewspaper, external: false },
    {
      label: "Discord",
      href: DISCORD_INVITE,
      icon: FaDiscord,
      external: true,
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/gdesports25/",
      icon: FaInstagram,
      external: true,
    },
    {
      label: "X / Twitter",
      href: "https://x.com/GDESPORTS25",
      icon: FaXTwitter,
      external: true,
    },
    ...(isAdmin
      ? [{ label: "Admin", href: "/admin", icon: FaCog, external: false }]
      : []),
  ];

  return (
    <>
      <div className="dashCardHead">
        <div>
          <h2 className="dashCardTitle">Quick Actions</h2>
          <p className="dashCardSub muted">Pages and socials in one tap.</p>
        </div>
      </div>

      <div className="dashActionGrid">
        {actions.map((a) => {
          const Icon = a.icon;
          const className = "dashActionTile";

          if (a.external) {
            return (
              <a
                key={a.label}
                href={a.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                <Icon className="dashActionIcon" aria-hidden="true" />
                <span>{a.label}</span>
              </a>
            );
          }

          return (
            <Link key={a.label} to={a.href} className={className}>
              <Icon className="dashActionIcon" aria-hidden="true" />
              <span>{a.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

function RecentClipsPanel() {
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");

      try {
        const url = `/.netlify/functions/twitch-clips?users=${encodeURIComponent(
          ALL_CREATOR_LOGINS
        )}&days=7&first=8`;

        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed to load clips");
        if (cancelled) return;
        setClips(Array.isArray(data.clips) ? data.clips.slice(0, 8) : []);
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Failed to load clips");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const t = setInterval(load, 5 * 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  return (
    <>
      <div className="dashCardHead">
        <div>
          <h2 className="dashCardTitle">Recent Clips</h2>
          <p className="dashCardSub muted">
            Last 7 days from all GD creators — refreshed every 5 min.
          </p>
        </div>
        <Link to="/clips" className="dashCardLink">
          View all
        </Link>
      </div>

      {loading && <div className="dashEmpty muted">Loading clips…</div>}
      {err && <div className="dashEmpty muted">❌ {err}</div>}

      {!loading && !err && clips.length === 0 && (
        <div className="dashEmpty muted">No clips found in the last 7 days.</div>
      )}

      <div className="dashClipsGrid">
        {clips.map((clip) => {
          const thumb = clip.thumbnail_url || clip.thumbnailUrl || "";
          const title = clip.title || "Untitled clip";
          const creator = clip.broadcaster_name || clip.broadcasterName || "";
          const views = clip.view_count ?? clip.views ?? 0;
          const url = clip.url || clip.clip_url || "#";

          return (
            <a
              key={clip.id || url}
              className="dashClipCard"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="dashClipThumb">
                {thumb ? <img src={thumb} alt="" loading="lazy" /> : null}
                <span className="dashClipPlay" aria-hidden="true">
                  ▶
                </span>
              </div>
              <div className="dashClipMeta">
                <div className="dashClipTitle">{title}</div>
                <div className="dashClipSub muted small">
                  {creator} · {Number(views).toLocaleString()} views
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </>
  );
}

function FocusList() {
  const [items, setItems] = useLocalStorageState(
    LS.focus,
    DEFAULT_FOCUS.map((text) => ({
      id: cryptoRandomId(),
      text,
      done: false,
    }))
  );
  const [text, setText] = useState("");

  const doneCount = items.filter((i) => i.done).length;
  const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0;

  function toggle(id) {
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, done: !x.done } : x))
    );
  }

  function add() {
    if (!text.trim()) return;
    setItems((prev) => [
      ...prev,
      { id: cryptoRandomId(), text: text.trim(), done: false },
    ]);
    setText("");
  }

  function clearDone() {
    setItems((prev) => prev.filter((x) => !x.done));
  }

  return (
    <>
      <div className="dashCardHead">
        <div>
          <h2 className="dashCardTitle">Content Tasks</h2>
          <p className="dashCardSub muted">
            Daily checklist for social and content — saves in this browser.
          </p>
        </div>
      </div>

      <div className="dashProgress">
        <div className="progressFill" style={{ width: `${pct}%` }} />
      </div>
      <div className="muted small dashProgressLabel">
        {pct}% complete · {doneCount}/{items.length} done
      </div>

      <div className="dashFocusList">
        {items.map((it) => (
          <label key={it.id} className={`dashFocusItem ${it.done ? "done" : ""}`}>
            <input
              type="checkbox"
              checked={it.done}
              onChange={() => toggle(it.id)}
            />
            <span>{it.text}</span>
          </label>
        ))}
      </div>

      <div className="dashFocusAdd">
        <input
          className="input"
          placeholder="Add a task…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button type="button" className="btnPrimary" onClick={add}>
          Add
        </button>
      </div>
      <button type="button" className="btnGhost dashClearBtn" onClick={clearDone}>
        Clear done
      </button>
    </>
  );
}

function CopyLinksBar() {
  const [copied, setCopied] = useState("");

  const shopUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/shop`
      : "https://gdesports.uk/shop";

  const links = [
    { id: "discord", label: "Discord invite", value: DISCORD_INVITE },
    { id: "shop", label: "Shop link", value: shopUrl },
    { id: "site", label: "Website", value: typeof window !== "undefined" ? window.location.origin : "https://gdesports.uk" },
  ];

  async function copy(id, value) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(id);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      setCopied("error");
      setTimeout(() => setCopied(""), 2000);
    }
  }

  return (
    <>
      <div className="dashCardHead">
        <div>
          <h2 className="dashCardTitle">Copy Links</h2>
          <p className="dashCardSub muted">
            One-click copy for posts, bios, and announcements.
          </p>
        </div>
      </div>

      <div className="dashCopyGrid">
        {links.map((link) => (
          <button
            key={link.id}
            type="button"
            className="dashCopyBtn"
            onClick={() => copy(link.id, link.value)}
          >
            <FaCopy aria-hidden="true" />
            <span className="dashCopyLabel">{link.label}</span>
            <span className="dashCopyValue muted small">{link.value}</span>
            <AnimatePresence mode="wait">
              {copied === link.id && (
                <motion.span
                  className="dashCopyToast"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  Copied!
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        ))}
      </div>
    </>
  );
}
