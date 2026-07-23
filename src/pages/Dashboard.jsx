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
import { DISCORD_INVITE } from "../data/links.js";
import { useSiteContent } from "../state/siteContent.js";

const cardVariant = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

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

function sortLiveCreators(streams, creators) {
  return creators.filter((c) => streams[c.twitchLogin]?.isLive).sort((a, b) => {
    const diff =
      (streams[b.twitchLogin]?.viewerCount || 0) -
      (streams[a.twitchLogin]?.viewerCount || 0);
    if (diff !== 0) return diff;
    return creators.indexOf(a) - creators.indexOf(b);
  });
}

export default function Dashboard() {
  const { user } = useAuth();
  const { creators } = useSiteContent();

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
          creators.map(async (c) => {
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

    if (!creators.length) return;

    loadLive();
    const t = setInterval(loadLive, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [creators]);

  const liveCreators = useMemo(
    () => sortLiveCreators(streamMap, creators),
    [streamMap, creators]
  );
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
            Org pulse, live creators, and quick links — built for the team.
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
              creators={creators}
              streamMap={streamMap}
              liveChecked={liveChecked}
              liveCreators={liveCreators}
            />
          </motion.section>

          <motion.section className="dashCard" variants={cardVariant}>
            <QuickActionsPanel isAdmin={isAdmin} />
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

function LiveCreatorsPanel({ creators, streamMap, liveChecked, liveCreators }) {
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
        {creators.map((c) => {
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
