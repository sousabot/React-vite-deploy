import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, animate } from "framer-motion";
import PageMotion from "../components/PageMotion.jsx";
import Modal from "../components/Modal.jsx";
import { Link } from "react-router-dom";
import { FaDiscord } from "react-icons/fa";
import { track } from "../state/track.js";
import { CREATORS } from "../data/creators.js";
import { DISCORD_INVITE } from "../data/links.js";

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

function sortLiveCreators(streams) {
  return CREATORS.filter((c) => streams[c.twitchLogin]?.isLive).sort((a, b) => {
    const diff =
      (streams[b.twitchLogin]?.viewerCount || 0) -
      (streams[a.twitchLogin]?.viewerCount || 0);
    if (diff !== 0) return diff;
    return CREATORS.indexOf(a) - CREATORS.indexOf(b);
  });
}

function pickFeaturedCreator(streams) {
  const live = sortLiveCreators(streams);
  return live[0] || CREATORS[0];
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
  const [open, setOpen] = useState(false);

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
  const [featured, setFeatured] = useState(CREATORS[0]);

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

          const live = sortLiveCreators(map);
          setLiveCount(live.length);
          setFeatured(pickFeaturedCreator(map));
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

  const liveCreators = useMemo(
    () => sortLiveCreators(streamMap),
    [streamMap]
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

            <div className="heroDivider" aria-hidden="true" />
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
