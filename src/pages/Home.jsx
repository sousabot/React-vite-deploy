import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useMotionValue, animate } from "framer-motion";
import PageMotion from "../components/PageMotion.jsx";
import Modal from "../components/Modal.jsx";
import { Link } from "react-router-dom";
import { track } from "../state/track.js";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

// 🔧 LOCAL TESTING ONLY (set to false when done)
const FORCE_REVEAL = true;

/* ======================
   CREATORS (add more)
   ====================== */
const CREATORS = [
  {
    twitchLogin: "mewtzu",
    name: "Mewtzu",
    role: "Creator",
    tagline: "Live gameplay • highlights • community vibes",
    twitchUrl: "https://twitch.tv/mewtzu",
  },
  {
    twitchLogin: "kaymael",
    name: "Kaymael",
    role: "Content Creator",
    tagline: "Streams • clips • esports energy",
    twitchUrl: "https://twitch.tv/kaymael",
  },
];

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
      "https://www.spized.com/uk-en/design-preview?cfgId=9c58ed21fcfae35b449522141611f77833875fb7c5be760a69db6080e8352126381d90eb5ab54adc9f3ecf271cab68c2607f99f6eed0d09f17daa43ac52da0a3",
  },
  {
    id: "away",
    title: "Away Jersey ⚫",
    image: "/jersey-away.png", // ✅ add this file to /public
    previewUrl: "PASTE_SECOND_SPIZED_URL_HERE",
  },
];

function encodeForm(data) {
  return new URLSearchParams(data).toString();
}

/* ======================
   ANNOUNCEMENT COUNTDOWN + REVEAL
   ====================== */
function getTargetDateUTC() {
  // Dec 25 @ 00:00 UTC (safe across timezones)
  return new Date(Date.UTC(new Date().getUTCFullYear(), 11, 25, 0, 0, 0));
}

function CountdownToDec25({ onFinished }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const target = getTargetDateUTC();
  const diff = target.getTime() - now;
  const finished = diff <= 0;

  useEffect(() => {
    if (finished) onFinished?.();
  }, [finished, onFinished]);

  const totalSeconds = Math.max(0, Math.floor(diff / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="announceTimer">
      <div className="timerChip">
        <div className="timerNum">{days}</div>
        <div className="timerLbl">DAYS</div>
      </div>
      <div className="timerChip">
        <div className="timerNum">{pad(hours)}</div>
        <div className="timerLbl">HRS</div>
      </div>
      <div className="timerChip">
        <div className="timerNum">{pad(minutes)}</div>
        <div className="timerLbl">MIN</div>
      </div>
      <div className="timerChip">
        <div className="timerNum">{pad(seconds)}</div>
        <div className="timerLbl">SEC</div>
      </div>
    </div>
  );
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
     ====================== */
  const [revealReady, setRevealReady] = useState(false);
  const revealDate = useMemo(() => getTargetDateUTC(), []);

  useEffect(() => {
    if (FORCE_REVEAL || Date.now() >= revealDate.getTime()) {
      setRevealReady(true);
    }
  }, [revealDate]);

  /* ======================
     LIVE CREATOR STATUS
     ====================== */
  const [liveCount, setLiveCount] = useState(0);
  const [liveMap, setLiveMap] = useState({});
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
                )}`
              );
              if (!res.ok) return [c.twitchLogin, false];
              const data = await res.json();
              return [c.twitchLogin, !!data?.isLive];
            } catch {
              return [c.twitchLogin, false];
            }
          })
        );

        if (!cancelled) {
          const map = Object.fromEntries(entries);
          setLiveMap(map);

          const count = Object.values(map).filter(Boolean).length;
          setLiveCount(count);

          const liveCreator = CREATORS.find((c) => map[c.twitchLogin]);
          setFeatured(liveCreator || CREATORS[0]);
        }
      } catch {
        // ignore
      }
    }

    loadLive();
    const t = setInterval(loadLive, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  const creatorStatus =
    liveCount > 0
      ? `${liveCount} Creator${liveCount > 1 ? "s" : ""} Live Now`
      : "No one Live Right Now";

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

  const featuredIsLive = !!liveMap?.[featured?.twitchLogin];

  return (
    <PageMotion>
      <div className="homePro">
        {/* ======================
            ANNOUNCEMENT TEASER
           ====================== */}
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

            {!revealReady ? (
              <>
                <div className="announceTitle">Jersey Reveal — Dec 25</div>
                <CountdownToDec25 onFinished={() => setRevealReady(true)} />
                <div className="announceDesc muted">
                  Countdown to the drop. Join Discord so you don’t miss it.
                </div>

                <div className="announceActions">
                  <a
                    href="https://discord.gg/5fZ7UEnnzn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btnPrimary"
                    onClick={() =>
                      track("discord_click", { source: "announcement" })
                    }
                  >
                    Join Discord
                  </a>

                  <a
                    href="https://x.com/GDESPORTS25"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btnGhost"
                  >
                    Follow on X
                  </a>
                </div>
              </>
            ) : (
              <>
                <div className="announceTitle">Jerseys are Here 🟠⚫</div>

                <div
                  className="announceReveal"
                  style={{
                    marginTop: 14,
                    borderRadius: 18,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,.12)",
                    background: "rgba(0,0,0,.22)",
                    padding: 12,
                    display: "grid",
                    gap: 12,
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  }}
                >
                  {JERSEYS.map((j) => (
                    <div
                      key={j.id}
                      style={{
                        borderRadius: 14,
                        overflow: "hidden",
                        border: "1px solid rgba(255,255,255,.10)",
                        background: "rgba(0,0,0,.18)",
                      }}
                    >
                      <div
                        className="jerseyRevealImg"
                        style={{
                          backgroundImage: `url(${j.image})`,
                          minHeight: 220,
                        }}
                      />
                      <div
                        style={{
                          padding: 10,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>{j.title}</div>
                        <a
                          href={j.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btnPrimary"
                          style={{ padding: "8px 12px", fontSize: 14 }}
                          onClick={() => track("jersey_view", { id: j.id })}
                        >
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="announceDesc muted" style={{ marginTop: 10 }}>
                  Official GD Esports jersey reveals. Hit view to open the
                  previews.
                </div>

                <div className="announceActions">
                  <Link to="/shop" className="btnGhost">
                    Shop
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </section>

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
            className="featuredCreatorCard"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="featuredTop">
              <span className="featuredBadge">⭐ FEATURED CREATOR</span>

              <span className={`featuredLive ${featuredIsLive ? "on" : ""}`}>
                <span className="featuredLiveDot" />
                {featuredIsLive ? "LIVE NOW" : "OFFLINE"}
              </span>
            </div>

            <div className="featuredNameRow">
              <div className="featuredName">{featured?.name}</div>
              <div className="featuredRole">{featured?.role}</div>
            </div>

            <div className="featuredTagline muted">{featured?.tagline}</div>

            <div className="featuredActions">
              <a
                className="btnPrimary"
                href={featured?.twitchUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Watch on Twitch
              </a>

              <Link className="btnGhost" to="/creators">
                View Creators
              </Link>
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
          </motion.div>
        </section>

        {/* ======================
            CREATOR CTA
           ====================== */}
        <section className="sectionPro shopCtaSection">
          <Link to="/creators" className="shopCtaCard">
            <span className="shopCtaText">
              MEET OUR
              <br />
              CREATORS
            </span>
            <span className="shopCtaArrow">›</span>
          </Link>
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
