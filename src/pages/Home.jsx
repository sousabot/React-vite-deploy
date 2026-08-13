import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, animate } from "framer-motion";
import PageMotion from "../components/PageMotion.jsx";
import Modal from "../components/Modal.jsx";
import { Link } from "react-router-dom";
import { FaDiscord } from "react-icons/fa";
import { track } from "../state/track.js";
import { CREATORS as DEFAULT_CREATORS } from "../data/creators.js";
import { buildSchedule } from "../data/matches.js";
import { DISCORD_INVITE } from "../data/links.js";
import { useSiteContent } from "../state/siteContent.js";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const JERSEYS = [
  {
    id: "home",
    title: "Home Jersey",
    image: "/jersey-reveal.png",
    previewUrl: "/shop",
  },
  {
    id: "away",
    title: "Away Jersey",
    image: "/jersey-away.png",
    previewUrl: "/shop",
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
  const { creators: CREATORS, matches } = useSiteContent();
  const LAST_MATCH = matches.lastMatch;
  const NEXT_MATCH = matches.nextMatch;
  const MATCH_TWITCH_URL = matches.matchTwitchUrl;
  const SCHEDULE = useMemo(
    () => buildSchedule(LAST_MATCH, NEXT_MATCH),
    [LAST_MATCH, NEXT_MATCH]
  );

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
  const matchCountdownActive =
    !!nextMatchCountdown && !nextMatchCountdown.expired;
  const hasNextOpponent = !!(
    (NEXT_MATCH.opponentTag && NEXT_MATCH.opponentTag.trim()) ||
    (NEXT_MATCH.opponent && NEXT_MATCH.opponent.trim())
  );

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
        {/* HERO — brand + one story */}
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
            </h1>

            <p className="heroDesc">
              LPLOL squad. Creators. Community. One org.
            </p>

            <div className="heroCTA">
              <a
                href={DISCORD_INVITE}
                target="_blank"
                rel="noopener noreferrer"
                className="btnPrimary"
                onClick={() => track("discord_click", { source: "home_hero" })}
              >
                <FaDiscord aria-hidden="true" />
                Get Match Alerts
              </a>
              <Link to="/shop" className="btnGhost">
                Shop Jerseys
              </Link>
            </div>
          </motion.div>
        </section>

        {/* MATCH CENTER */}
        <section className="sectionPro sectionPro--tight">
          <motion.div
            className="matchCenterCard"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="matchCenterGlow" aria-hidden="true" />

            <div className="matchCenterTop">
              <span className="matchCenterComp">
                {matchCountdownActive || hasNextOpponent
                  ? "Next Match"
                  : "Last Result"}
              </span>
              <span className="matchCenterFormat muted">
                {matchCountdownActive || hasNextOpponent
                  ? `${NEXT_MATCH.competition} · ${NEXT_MATCH.format}`
                  : `${LAST_MATCH.league} · ${LAST_MATCH.competition}`}
              </span>
            </div>

            <div className="matchCenterMain">
              <div className="matchCenterTeam">
                <img
                  src="/logo.png"
                  alt="GD Esports"
                  className="matchCenterLogo"
                />
                <span className="matchCenterTeamName">GDE</span>
              </div>

              <div className="matchCenterCenter">
                {matchCountdownActive ? (
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
                ) : hasNextOpponent ? (
                  <div className="matchCenterTBA">
                    <span className="matchCenterVs">VS</span>
                    <span className="matchCenterTBALabel muted">
                      Date TBA — alerts in Discord
                    </span>
                  </div>
                ) : (
                  <div className="matchCenterTBA">
                    <span className="matchCenterScore">
                      {LAST_MATCH.result} {LAST_MATCH.score}
                    </span>
                    <span className="matchCenterTBALabel muted">
                      Next opponent TBA
                    </span>
                  </div>
                )}
              </div>

              <div className="matchCenterTeam">
                {matchCountdownActive || hasNextOpponent ? (
                  <>
                    {NEXT_MATCH.opponentLogo ? (
                      <img
                        src={NEXT_MATCH.opponentLogo}
                        alt={NEXT_MATCH.opponent || "Opponent"}
                        className="matchCenterLogo"
                      />
                    ) : (
                      <div className="matchCenterLogo matchCenterLogo--placeholder">
                        ?
                      </div>
                    )}
                    <span className="matchCenterTeamName">
                      {NEXT_MATCH.opponentTag || "TBA"}
                    </span>
                  </>
                ) : (
                  <>
                    {LAST_MATCH.opponentLogo ? (
                      <img
                        src={LAST_MATCH.opponentLogo}
                        alt={LAST_MATCH.opponent}
                        className="matchCenterLogo"
                      />
                    ) : (
                      <div className="matchCenterLogo matchCenterLogo--placeholder">
                        {LAST_MATCH.opponentTag?.slice(0, 2) || "?"}
                      </div>
                    )}
                    <span className="matchCenterTeamName">
                      {LAST_MATCH.opponentTag || "TBA"}
                    </span>
                  </>
                )}
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
                Match Alerts
              </a>

              <a
                href={MATCH_TWITCH_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btnGhost"
                onClick={() =>
                  track("twitch_watch", { source: "match_center" })
                }
              >
                Watch on Twitch
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
                  Last Recap
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
                    <span>GDE</span>
                    <span className="matchCenterScheduleVs muted">vs</span>
                    <span>{m.opponent || "TBA"}</span>
                  </div>
                  <div
                    className={`matchCenterScheduleStatus ${
                      m.isPast
                        ? LAST_MATCH.result === "W"
                          ? "won"
                          : "lost"
                        : "upcoming"
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

        {/* CREATORS — one section (live or featured) */}
        <section className="sectionPro">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="homeSectionHead">
              <h2 className="homeSectionTitle">Creators</h2>
              <p className="homeSectionSub muted">
                {liveChecked
                  ? liveCount > 0
                    ? `${liveCount} live right now`
                    : "Nobody live — catch the next stream"
                  : "Checking live status…"}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {featuredIsLive ? (
                <motion.a
                  key="live"
                  href={featured?.twitch}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="liveBanner"
                  style={{
                    "--lb-accent": featured?.accent || "#ff7a00",
                    "--lb-accent-rgb": featured?.accentRgb || "255,122,0",
                  }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  onClick={() =>
                    track("twitch_watch", {
                      source: "home_creators",
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
                        : `${featured.name} · top stream`}
                    </span>
                    <span className="liveBannerSub muted">
                      {featuredViewerLabel
                        ? `${featuredViewerLabel} watching · ${featuredStream?.streamGame || featured.game}`
                        : featuredStream?.title || featured.game}
                    </span>
                    {otherLiveCreators.length > 0 && (
                      <span className="liveBannerAlso muted small">
                        Also live:{" "}
                        {otherLiveCreators.map((c) => c.name).join(", ")}
                      </span>
                    )}
                  </div>

                  <span className="liveBannerCta">Watch Live</span>
                </motion.a>
              ) : (
                <motion.div
                  key="offline"
                  className="homeCreatorCard"
                  style={{
                    "--fc-accent": featured?.accent || "#ff7a00",
                    "--fc-accent-rgb": featured?.accentRgb || "255,122,0",
                  }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={featured?.image}
                    alt={featured?.name}
                    className="homeCreatorAvatar"
                    loading="lazy"
                  />
                  <div className="homeCreatorInfo">
                    <div className="homeCreatorName">{featured?.name}</div>
                    <div className="homeCreatorMeta muted">
                      {featured?.handle}
                      {featured?.game ? ` · ${featured.game}` : ""}
                    </div>
                    <div className="homeCreatorActions">
                      <a
                        className="btnPrimary"
                        href={featured?.twitch}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          track("twitch_watch", {
                            source: "home_creators",
                            creator: featured?.id,
                          })
                        }
                      >
                        Watch on Twitch
                      </a>
                      <Link className="btnGhost" to="/creators">
                        All Creators
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>

        {/* SHOP */}
        <section className="sectionPro">
          <motion.div
            className="homeShop"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="homeSectionHead">
              <h2 className="homeSectionTitle">Official Jerseys</h2>
              <p className="homeSectionSub muted">
                Home and away — limited runs.
              </p>
            </div>

            <div className="jerseyShowcase__grid">
              {JERSEYS.map((j) => (
                <Link
                  key={j.id}
                  to={j.previewUrl}
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
                        <span>Shop</span>
                        <span className="jerseyTile__arrow">→</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

            <div className="homeShopFooter">
              <p className="muted small">
                Creator drops and restocks drop in Discord first.
              </p>
              <Link to="/shop" className="btnGhost">
                Open Shop
              </Link>
            </div>
          </motion.div>
        </section>

        {/* COMMUNITY */}
        <section className="sectionPro">
          <motion.div
            className="statsWrap"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="homeSectionHead">
              <h2 className="homeSectionTitle">Community</h2>
              <p className="homeSectionSub muted">
                Match alerts, drops, and tryouts live here.
              </p>
            </div>

            <div className="statsGrid">
              {COMMUNITY_STATS.map((s) => (
                <StatCard key={s.label} {...s} />
              ))}
            </div>

            <div className="discordCtaRow">
              <div className="discordCtaCopy">
                <div className="discordCtaTitle">Join the Discord</div>
                <div className="discordCtaSub muted">
                  {discordMembers > 0
                    ? `${discordMembers.toLocaleString()}+ members — updates, drops, and events.`
                    : "Updates, jersey drops, scrims, and community events."}
                </div>
              </div>

              <div className="homeCommunityActions">
                <a
                  href={DISCORD_INVITE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btnPrimary discordCtaBtn"
                  onClick={() =>
                    track("discord_click", { source: "home_community" })
                  }
                >
                  <FaDiscord aria-hidden="true" />
                  Join Discord
                </a>
                <button
                  type="button"
                  className="btnGhost"
                  onClick={() => {
                    track("tryout_open");
                    setOpen(true);
                  }}
                >
                  Apply for Tryouts
                </button>
              </div>
            </div>
          </motion.div>
        </section>

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
            {submitted && <div className="formSuccess">Application sent</div>}

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