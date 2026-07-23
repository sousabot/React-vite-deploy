import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, animate } from "framer-motion";
import PageMotion from "../components/PageMotion.jsx";
import Modal from "../components/Modal.jsx";
import { Link } from "react-router-dom";
import { FaDiscord } from "react-icons/fa";
import { track } from "../state/track.js";
import { CREATORS as DEFAULT_CREATORS } from "../data/creators.js";
import { DISCORD_INVITE } from "../data/links.js";
import { useSiteContent } from "../state/siteContent.js";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

/* ======================
   JERSEYS (add more)
   Put images in /public and set paths here.
   ====================== */
const JERSEYS = [
  {
    id: "home",
    title: "Home Jersey 🟠",
    image: "/jersey-reveal.png",
    previewUrl:
      "https://gdesports.uk/shop",
  },
  {
    id: "away",
    title: "Away Jersey ⚫",
    image: "/jersey-away.png",
    previewUrl: "https://gdesports.uk/shop", // <-- update this
  },
];

/* ======================
   MATCH CENTER (edit me)
   Update LAST_MATCH after every game.
   Update NEXT_MATCH once LPLOL reveals the opponent
   (usually ~48h before match day) — leave date/opponent
   as null until then and the card will show "TBA".
   ====================== */
const LAST_MATCH = {
  league: "LPLOL",
  competition: "Season Opener · Game 1",
  result: "W", // "W" or "L"
  score: "1-0",
  opponent: "ZeroZone Gaming", // <-- update with real opponent name
  opponentLogo: null, // <-- optional path to opponent logo, e.g. "/opponents/team-x.png"
  vodUrl: "", // <-- update with VOD/recap link, leave empty to hide the button
  summary: "GD eSports takes down TBD to open the season 1-0.",
};

const NEXT_MATCH = {
  competition: "LPLOL",
  format: "Best of 1",
  date: null, // <-- set an ISO string once known, e.g. "2026-08-02T18:00:00"
  opponent: null, // <-- set once revealed, e.g. "Team X"
  opponentLogo: null,
};

// Rolling schedule strip shown under the match center card.
// Add/remove entries as the season progresses.
const SCHEDULE = [
  {
    id: "g1",
    isPast: true,
    competition: LAST_MATCH.league,
    format: "Bo1",
    opponent: LAST_MATCH.opponent,
    status: `${LAST_MATCH.result} ${LAST_MATCH.score}`,
  },
  {
    id: "g2",
    isPast: false,
    competition: NEXT_MATCH.competition,
    format: "Bo1",
    opponent: NEXT_MATCH.opponent,
    date: NEXT_MATCH.date,
  },
  {
    id: "g3",
    isPast: false,
    competition: "LPLOL",
    format: "Bo1",
    opponent: null,
    date: null,
  },
];

function computeTimeLeft(targetDate) {
  if (!targetDate) return null;
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, expired: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    mins: Math.floor((diff / (1000 * 60)) % 60),
    secs: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState(() => computeTimeLeft(targetDate));

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft(null);
      return;
    }
    setTimeLeft(computeTimeLeft(targetDate));
    const t = setInterval(() => setTimeLeft(computeTimeLeft(targetDate)), 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  return timeLeft;
}

function formatScheduleDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  const datePart = d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
  const timePart = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return `${datePart} · ${timePart}`;
}

function encodeForm(data) {
  return new URLSearchParams(data).toString();
}

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

function pickFeaturedCreator(streams, creators) {
  const live = sortLiveCreators(streams, creators);
  return live[0] || creators[0];
}

/* ======================
   STAT ANIMATION
   ====================== */
function AnimatedNumber({ value, duration = 1.2 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });

  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const unsub = mv.on("change", (latest) => setDisplay(Math.round(latest)));
    return () => unsub();
  }, [mv]);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, { duration, ease: "easeOut" });
    return () => controls.stop();
  }, [inView, mv, value, duration]);

  return (
    <span ref={ref}>
      {Number.isFinite(display) ? display.toLocaleString() : "0"}
    </span>
  );
}

function StatCard({ label, value, suffix }) {
  return (
    <div className="statCard">
      <div className="statCardValue">
        <AnimatedNumber value={value} />
        {suffix}
      </div>
      <div className="statCardLabel">{label}</div>
    </div>
  );
}

export default function Home() {
  const { creators: CREATORS } = useSiteContent();
  const [open, setOpen] = useState(false);
  const nextMatchCountdown = useCountdown(NEXT_MATCH.date);

  /* ======================
     DISCORD MEMBER COUNT (AUTO)
     ====================== */
  const [discordMembers, setDiscordMembers] = useState(0);
  const [discordOnline, setDiscordOnline] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDiscordCounts() {
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

    loadDiscordCounts();
    const t = setInterval(loadDiscordCounts, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  const COMMUNITY_STATS = useMemo(
    () => [
      { label: "Discord Members", value: discordMembers || 0, suffix: "+" },
      { label: "Creators", value: CREATORS.length, suffix: "" },
      ...(typeof discordOnline === "number"
        ? [{ label: "Online Now", value: discordOnline, suffix: "" }]
        : []),
    ],
    [discordMembers, discordOnline]
  );

  /* ======================
     JERSEY REVEAL STATE
     Jerseys are already out -> always show reveal UI.
     ====================== */
  const revealReady = true;

  /* ======================
     LIVE CREATOR STATUS
     ====================== */
  const [liveCount, setLiveCount] = useState(0);
  const [streamMap, setStreamMap] = useState({});
  const [liveChecked, setLiveChecked] = useState(false);
  const [featured, setFeatured] = useState(DEFAULT_CREATORS[0]);

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
          const map = Object.fromEntries(entries);
          setStreamMap(map);

          const live = sortLiveCreators(map, CREATORS);
          setLiveCount(live.length);
          setFeatured(pickFeaturedCreator(map, CREATORS));
          setLiveChecked(true);
        }
      } catch {
        if (!cancelled) setLiveChecked(true);
      }
    }

    if (!CREATORS.length) return;

    loadLive();
    const t = setInterval(loadLive, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [CREATORS]);

  const liveCreators = useMemo(
    () => sortLiveCreators(streamMap, CREATORS),
    [streamMap, CREATORS]
  );

  const otherLiveCreators = useMemo(
    () => liveCreators.filter((c) => c.id !== featured?.id),
    [liveCreators, featured]
  );

  const featuredStream = streamMap[featured?.twitchLogin];
  const featuredIsLive = !!featuredStream?.isLive;
  const featuredViewers = featuredStream?.viewerCount || 0;
  const featuredViewerLabel = formatViewers(featuredViewers);

  const creatorStatus = !liveChecked
    ? "Checking live status…"
    : liveCount > 0
      ? featuredViewerLabel
        ? `${liveCount} live · top stream ${featuredViewerLabel} viewers`
        : `${liveCount} Creator${liveCount > 1 ? "s" : ""} Live Now`
      : "No one live right now";

  /* ======================
     TRYOUT FORM STATE
     ====================== */
  const [form, setForm] = useState({
    gamerTag: "",
    game: "",
    discord: "",
    role: "",
    availability: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function submitTryout(e) {
    e.preventDefault();
    setSubmitError("");
    setSubmitted(false);

    if (!form.gamerTag || !form.game || !form.discord) {
      setSubmitError("Please fill Gamer tag, Game, and Discord.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = { type: "tryout", ...form };

      const res = await fetch("/.netlify/functions/form-to-discord", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeForm(payload),
      });

      if (!res.ok) throw new Error("Submission failed");

      setSubmitted(true);
      track("tryout_submit", { game: form.game || "unknown" });

      setForm({
        gamerTag: "",
        game: "",
        discord: "",
        role: "",
        availability: "",
        notes: "",
      });

      setTimeout(() => setOpen(false), 900);
    } catch {
      setSubmitError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageMotion>
      <div className="homePro">
        {/* ======================
            HERO
           ====================== */}
        <section className="heroPro">
          <motion.div
            className="homeHero"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <img
              src="/logo.png"
              alt="GD Esports"
              className="homeHeroLogo"
              loading="eager"
            />

            <h1 className="heroTitle">
              Built to <span className="accentText">Compete.</span>
              <br />
              Built to Last.
            </h1>

            <p className="heroDesc">
              Structure, discipline, and community — from tryouts to creators to
              the squad.
            </p>

            <div className="heroCTA">
              <Link to="/shop" className="btnPrimary">
                Shop Jerseys
              </Link>
              <Link to="/creators" className="btnGhost">
                Meet Creators
              </Link>
            </div>

            <div className="heroRecordChip">
              <span className="heroRecordDot" aria-hidden="true" />
              LPLOL Season Opener — {LAST_MATCH.score} vs {LAST_MATCH.opponent}
            </div>

            <div className="heroDivider" aria-hidden="true" />
          </motion.div>
        </section>

        {/* ======================
            MATCH CENTER
            (Next match / countdown up top,
             recent + upcoming schedule strip below)
           ====================== */}
        <section className="sectionPro">
          <motion.div
            className="matchCenterCard"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="matchCenterGlow" aria-hidden="true" />

            <div className="matchCenterTop">
              <span className="matchCenterComp">{NEXT_MATCH.competition}</span>
              <span className="matchCenterFormat muted">{NEXT_MATCH.format}</span>
            </div>

            <div className="matchCenterMain">
              <div className="matchCenterTeam">
                <img
                  src="/logo.png"
                  alt="GD Esports"
                  className="matchCenterLogo"
                />
                <span className="matchCenterTeamName">GD</span>
              </div>

              <div className="matchCenterCenter">
                {nextMatchCountdown && !nextMatchCountdown.expired ? (
                  <div className="matchCenterCountdown">
                    {[
                      { label: "days", value: nextMatchCountdown.days },
                      { label: "hours", value: nextMatchCountdown.hours },
                      { label: "mins", value: nextMatchCountdown.mins },
                      { label: "secs", value: nextMatchCountdown.secs },
                    ].map((u) => (
                      <div key={u.label} className="matchCenterCountdownUnit">
                        <span className="matchCenterCountdownValue">
                          {String(u.value).padStart(2, "0")}
                        </span>
                        <span className="matchCenterCountdownLabel muted">
                          {u.label}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="matchCenterTBA">
                    <span className="matchCenterVs">VS</span>
                    <span className="matchCenterTBALabel muted">
                      Opponent revealed 48h before match day
                    </span>
                  </div>
                )}
              </div>

              <div className="matchCenterTeam">
                {NEXT_MATCH.opponentLogo ? (
                  <img
                    src={NEXT_MATCH.opponentLogo}
                    alt={NEXT_MATCH.opponent}
                    className="matchCenterLogo"
                  />
                ) : (
                  <div className="matchCenterLogo matchCenterLogo--placeholder">
                    ?
                  </div>
                )}
                <span className="matchCenterTeamName">
                  {NEXT_MATCH.opponent || "TBA"}
                </span>
              </div>
            </div>

            <div className="matchCenterActions">
              <a
                href={DISCORD_INVITE}
                target="_blank"
                rel="noopener noreferrer"
                className="btnPrimary"
                onClick={() =>
                  track("discord_click", { source: "match_center" })
                }
              >
                <FaDiscord aria-hidden="true" />
                Get Match Alerts
              </a>

              {LAST_MATCH.vodUrl && (
                <a
                  href={LAST_MATCH.vodUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btnGhost"
                  onClick={() =>
                    track("match_recap_click", { league: LAST_MATCH.league })
                  }
                >
                  Watch Last Recap ↗
                </a>
              )}
            </div>

            <div className="matchCenterSchedule">
              {SCHEDULE.map((m) => (
                <div
                  key={m.id}
                  className={`matchCenterScheduleItem ${
                    m.isPast ? "isPast" : "isUpcoming"
                  }`}
                >
                  <div className="matchCenterScheduleComp muted">
                    {m.competition} · {m.format}
                  </div>
                  <div className="matchCenterScheduleTeams">
                    <span>GD</span>
                    <span className="matchCenterScheduleVs muted">vs</span>
                    <span>{m.opponent || "TBA"}</span>
                  </div>
                  <div
                    className={`matchCenterScheduleStatus ${
                      m.isPast ? "won" : "upcoming"
                    }`}
                  >
                    {m.isPast
                      ? m.status
                      : m.date
                        ? formatScheduleDate(m.date)
                        : "TBA"}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ======================
            LIVE BANNER
           ====================== */}
        <AnimatePresence>
          {liveChecked && liveCreators.length > 0 && (
            <motion.section
              className="sectionPro liveBannerSection"
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <a
                href={featured?.twitch}
                target="_blank"
                rel="noopener noreferrer"
                className="liveBanner"
                style={{
                  "--lb-accent": featured?.accent || "#ff7a00",
                  "--lb-accent-rgb": featured?.accentRgb || "255,122,0",
                }}
                onClick={() =>
                  track("twitch_watch", {
                    source: "home_live_banner",
                    creator: featured?.id,
                  })
                }
              >
                <div className="liveBannerPulse" aria-hidden="true" />

                <div className="liveBannerAvatars">
                  {liveCreators.slice(0, 3).map((c) => (
                    <img
                      key={c.id}
                      src={c.image}
                      alt={c.name}
                      className="liveBannerAvatar"
                    />
                  ))}
                </div>

                <div className="liveBannerCopy">
                  <span className="liveBannerKicker">
                    <span className="liveBannerDot" aria-hidden="true" />
                    Live now
                  </span>
                  <span className="liveBannerTitle">
                    {liveCount === 1
                      ? `${featured.name} is streaming`
                      : `${featured.name} has the most viewers`}
                  </span>
                  <span className="liveBannerSub muted">
                    {featuredViewerLabel
                      ? `${featuredViewerLabel} watching · ${featuredStream?.streamGame || featured.game}`
                      : featuredStream?.title || featured.game}
                  </span>
                </div>

                <span className="liveBannerCta">Watch on Twitch ↗</span>
              </a>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ======================
            WHAT’S HAPPENING NOW
           ====================== */}
        <section className="sectionPro">
          <motion.div
            className="statusCard"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="statusTop">
              <span className="statusBadge">
                <span className="pulseDot" /> WHAT’S HAPPENING NOW
              </span>
              <span className="statusSmall">Live org status</span>
            </div>

            <div className="statusGrid">
              <div className="statusItem">
                <div className="statusItemLeft">
                  <span
                    className={`statusDot ${
                      liveCount > 0 ? "dotRed" : "dotGray"
                    }`}
                  />
                  <div className="statusItemText">
                    <div className="statusLabel">Creators</div>
                    <div className="statusValue">{creatorStatus}</div>
                  </div>
                </div>

                <Link to="/creators" className="statusLink">
                  View
                </Link>
              </div>

              <div className="statusItem">
                <div className="statusItemLeft">
                  <span className="statusDot dotGreen" />
                  <div className="statusItemText">
                    <div className="statusLabel">Tryouts</div>
                    <div className="statusValue">Open</div>
                  </div>
                </div>

                <button
                  className="statusLinkBtn"
                  onClick={() => {
                    track("tryout_open");
                    setOpen(true);
                  }}
                >
                  Apply
                </button>
              </div>

              <div className="statusItem">
                <div className="statusItemLeft">
                  <span className="statusDot dotYellow" />
                  <div className="statusItemText">
                    <div className="statusLabel">Roster</div>
                    <div className="statusValue">Forming</div>
                  </div>
                </div>

                <Link to="/about" className="statusLink">
                  Info
                </Link>
              </div>

              <div className="statusItem">
                <div className="statusItemLeft">
                  <span className="statusDot dotGreen" />
                  <div className="statusItemText">
                    <div className="statusLabel">LPLOL</div>
                    <div className="statusValue">
                      {LAST_MATCH.result === "W" ? "Won" : "Lost"} Game 1
                      {" "}
                      {LAST_MATCH.score} vs {LAST_MATCH.opponent}
                    </div>
                  </div>
                </div>

                {LAST_MATCH.vodUrl ? (
                  <a
                    href={LAST_MATCH.vodUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="statusLink"
                  >
                    Recap
                  </a>
                ) : (
                  <Link to="/players" className="statusLink">
                    Roster
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </section>

        {/* ======================
            FEATURED CREATOR
           ====================== */}
        <section className="sectionPro">
          <motion.div
            className={`featuredCreatorCard ${
              featuredIsLive ? "featuredCreatorCard--live" : ""
            }`}
            style={{
              "--fc-accent": featured?.accent || "#ff7a00",
              "--fc-accent-rgb": featured?.accentRgb || "255,122,0",
            }}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="featuredBody">
              <div className="featuredAvatarWrap">
                <img
                  src={featured?.image}
                  alt={featured?.name}
                  className="featuredAvatar"
                  loading="lazy"
                />
                {featuredIsLive && (
                  <span className="featuredAvatarLive" aria-hidden="true" />
                )}
              </div>

              <div className="featuredInfo">
                <div className="featuredTop">
                  <span className="featuredBadge">
                    {featuredIsLive
                      ? featuredViewerLabel
                        ? `🔴 TOP STREAM · ${featuredViewerLabel}`
                        : "🔴 MOST WATCHED"
                      : "⭐ FEATURED CREATOR"}
                  </span>

                  <span className={`featuredLive ${featuredIsLive ? "on" : ""}`}>
                    <span className="featuredLiveDot" />
                    {!liveChecked
                      ? "CHECKING…"
                      : featuredIsLive
                        ? featuredViewerLabel
                          ? `${featuredViewerLabel} LIVE`
                          : "LIVE NOW"
                        : "OFFLINE"}
                  </span>
                </div>

                <div className="featuredHandle muted small">
                  {featured?.handle}
                </div>

                <div className="featuredNameRow">
                  <div className="featuredName">{featured?.name}</div>
                  <div className="featuredRole">{featured?.role}</div>
                </div>

                <div className="featuredTagline muted">
                  {featuredIsLive && featuredStream?.streamGame
                    ? featuredStream.streamGame
                    : featured?.game}
                </div>

                {featuredIsLive && featuredStream?.title && (
                  <div className="featuredStreamTitle muted small">
                    {featuredStream.title}
                  </div>
                )}

                {featured?.tags?.length > 0 && (
                  <div className="featuredTags">
                    {featured.tags.map((tag) => (
                      <span key={tag} className="featuredTag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="featuredActions">
                  <a
                    className="btnPrimary"
                    href={featured?.twitch}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      track("twitch_watch", {
                        source: "home_featured",
                        creator: featured?.id,
                      })
                    }
                  >
                    {featuredIsLive ? "Watch Live" : "Watch on Twitch"}
                  </a>

                  <Link className="btnGhost" to="/creators">
                    View Creators
                  </Link>
                </div>
              </div>
            </div>

            {otherLiveCreators.length > 0 && (
              <div className="featuredAlsoLive muted small">
                Also live:{" "}
                {otherLiveCreators.map((c, i) => (
                  <span key={c.id}>
                    {i > 0 && ", "}
                    <a
                      href={c.twitch}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="featuredAlsoLiveLink"
                    >
                      {c.name}
                      {formatViewers(streamMap[c.twitchLogin]?.viewerCount)
                        ? ` (${formatViewers(streamMap[c.twitchLogin]?.viewerCount)})`
                        : ""}
                    </a>
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </section>

        <section className="sectionPro">
          <motion.div
            className="announceCard"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="announceTop">
              <span className="announceBadge">🚨 ANNOUNCEMENT</span>
              <span className="announceSmall muted">
                {revealReady ? "Live now" : "Stay locked in"}
              </span>
            </div>

            <div className="announceTitle">Jerseys are Here 🟠⚫</div>

            <div className="jerseyShowcase">
              <div className="jerseyShowcase__head">
                <div className="jerseyShowcase__kicker muted">
                  Official reveal
                </div>
                <div className="jerseyShowcase__sub">
                  Click a jersey to open the Spized preview.
                </div>
              </div>

              <div className="jerseyShowcase__grid">
                {JERSEYS.map((j) => (
                  <a
                    key={j.id}
                    href={j.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="jerseyTile"
                    onClick={() => track("jersey_view", { id: j.id })}
                  >
                    <div
                      className={`jerseyTile__img jerseyTile__img--${j.id}`}
                      style={{ backgroundImage: `url(${j.image})` }}
                    />

                    <div className="jerseyTile__meta">
                      <div className="jerseyTile__title">{j.title}</div>
                      <div className="jerseyTile__cta">
                        <span>View</span>
                        <span className="jerseyTile__arrow">↗</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              <div className="jerseyShowcase__footer">
                <div className="jerseyShowcase__note muted">
                  Limited runs. Creator drops + team stock update in Discord.
                </div>

                <Link to="/shop" className="btnGhost">
                  Shop
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ======================
            COMMUNITY STATS
           ====================== */}
        <section className="sectionPro">
          <motion.div
            className="statsWrap"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="statsHead">
              <div className="statsTitle">Community Stats</div>
              <div className="statsSub muted">
                Built by the squad — powered by the community
              </div>
            </div>

            <div className="statsGrid">
              {COMMUNITY_STATS.map((s) => (
                <StatCard key={s.label} {...s} />
              ))}
            </div>

            <div className="discordCtaRow">
              <div className="discordCtaCopy">
                <div className="discordCtaTitle">Join the squad on Discord</div>
                <div className="discordCtaSub muted">
                  {discordMembers > 0
                    ? `${discordMembers.toLocaleString()}+ members — updates, drops, and events.`
                    : "Updates, jersey drops, scrims, and community events."}
                </div>
              </div>

              <a
                href={DISCORD_INVITE}
                target="_blank"
                rel="noopener noreferrer"
                className="btnPrimary discordCtaBtn"
                onClick={() => track("discord_click", { source: "home_stats" })}
              >
                <FaDiscord aria-hidden="true" />
                Join Discord
              </a>
            </div>
          </motion.div>
        </section>

        {/* ======================
            DISCORD CTA
           ====================== */}
        <section className="sectionPro shopCtaSection">
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="shopCtaCard discordCtaCard"
            onClick={() => track("discord_click", { source: "home_banner" })}
          >
            <span className="shopCtaText">
              JOIN OUR
              <br />
              DISCORD
            </span>
            <span className="shopCtaArrow">›</span>
          </a>
        </section>

        {/* ======================
            TRYOUTS MODAL
           ====================== */}
        <Modal
          open={open}
          title="GD Esports Tryouts"
          onClose={() => setOpen(false)}
        >
          <form onSubmit={submitTryout}>
            <div className="formRow">
              <input
                className="input"
                name="gamerTag"
                value={form.gamerTag}
                onChange={onChange}
                placeholder="Gamer tag"
                required
              />
              <input
                className="input"
                name="game"
                value={form.game}
                onChange={onChange}
                placeholder="Game (LoL)"
                required
              />
            </div>

            <div className="formRow">
              <input
                className="input"
                name="discord"
                value={form.discord}
                onChange={onChange}
                placeholder="Discord"
                required
              />
              <input
                className="input"
                name="role"
                value={form.role}
                onChange={onChange}
                placeholder="Role"
              />
            </div>

            <textarea
              className="input textarea"
              name="notes"
              value={form.notes}
              onChange={onChange}
              placeholder="Experience / rank / links"
            />

            {submitError && <div className="formError">{submitError}</div>}
            {submitted && <div className="formSuccess">Application sent ✅</div>}

            <div className="formRow">
              <motion.button
                className="btnPrimary"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit"}
              </motion.button>

              <motion.button
                className="btnGhost"
                type="button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </Modal>
      </div>
    </PageMotion>
  );
}