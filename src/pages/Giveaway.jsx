import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import PageMotion from "../components/PageMotion.jsx";
import { track } from "../state/track.js";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

function encodeForm(data) {
  return new URLSearchParams(data).toString();
}

function msParts(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { days, hours, minutes, seconds };
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function Countdown({ targetMs, label }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = Math.max(0, targetMs - now);
  const { days, hours, minutes, seconds } = msParts(diff);

  return (
    <div className="giveawayCountdown">
      <div className="giveawayCountdownLabel">{label}</div>
      <div className="giveawayCountdownRow">
        <div className="timerChip">
          <div className="timerNum">{days}</div>
          <div className="timerLbl">DAYS</div>
        </div>
        <div className="timerChip">
          <div className="timerNum">{pad2(hours)}</div>
          <div className="timerLbl">HRS</div>
        </div>
        <div className="timerChip">
          <div className="timerNum">{pad2(minutes)}</div>
          <div className="timerLbl">MIN</div>
        </div>
        <div className="timerChip">
          <div className="timerNum">{pad2(seconds)}</div>
          <div className="timerLbl">SEC</div>
        </div>
      </div>
    </div>
  );
}

export default function Giveaway() {
  /**
   * ✅ SET YOUR WINDOW HERE (UTC)
   * Example below:
   * - Start: Dec 25, 00:00 UTC
   * - End:   Dec 31, 23:59 UTC
   */
  const START_UTC = useMemo(
    () => new Date(Date.UTC(new Date().getUTCFullYear(), 11, 25, 0, 0, 0)).getTime(),
    []
  );
  const END_UTC = useMemo(
    () => new Date(Date.UTC(new Date().getUTCFullYear(), 11, 31, 23, 59, 0)).getTime(),
    []
  );

  const GIVEAWAY = useMemo(
    () => ({
      title: "GD Esports Giveaway",
      subtitle: "Enter for a chance to win exclusive merch.",
      prize: "3 winners 1x GD Jersey + 2 League of legends giftcards",
      endsText: "Ends: Dec 31",
      rules: [
        "Join the Discord",
        "Follow our X account",
        "Follow our Instagram account",
        "Submit your entry below",
      ],
      discordInvite: "https://discord.gg/5fZ7UEnnzn",
      xUrl: "https://x.com/GDESPORTS25",
      instagramUrl: "https://www.instagram.com/", // <-- update
    }),
    []
  );

  // Window state
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const hasStarted = now >= START_UTC;
  const hasEnded = now >= END_UTC;
  const isOpen = hasStarted && !hasEnded;

  const [form, setForm] = useState({
    gamerTag: "",
    email: "",
    discord: "",
    platform: "PC",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setOk(false);

    // ✅ hard lock
    if (!isOpen) {
      setErr(hasEnded ? "This giveaway has ended." : "Giveaway not open yet.");
      return;
    }

    if (!form.gamerTag || !form.discord || !form.email) {
      setErr("Please fill GamerTag, Discord and Email.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        type: "giveaway_entry",
        ...form,
        prize: GIVEAWAY.prize,
      };

      const res = await fetch("/.netlify/functions/form-to-discord", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeForm(payload),
      });

      if (!res.ok) throw new Error("Failed to submit.");

      track("giveaway_submit", { platform: form.platform });

      setOk(true);
      setForm({
        gamerTag: "",
        email: "",
        discord: "",
        platform: "PC",
        notes: "",
      });
    } catch (e2) {
      setErr(e2?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageMotion>
      <div className="giveawayPage">
        {/* HERO */}
        <section className="giveawayHero">
          <div className="giveawayHeroOverlay" />
          <motion.div
            className="giveawayHeroInner"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="giveawayBadge">🎁 GIVEAWAY</div>
            <h1 className="giveawayTitle">{GIVEAWAY.title}</h1>
            <p className="giveawaySubtitle">{GIVEAWAY.subtitle}</p>

            <div className="giveawayPrizeCard">
              <div className="giveawayPrizeLabel">Prize</div>
              <div className="giveawayPrize">{GIVEAWAY.prize}</div>
              <div className="giveawayEnds muted">{GIVEAWAY.endsText}</div>

              {/* ✅ STATUS / COUNTDOWN */}
              {!hasStarted && (
                <Countdown targetMs={START_UTC} label="Giveaway opens in" />
              )}
              {isOpen && <Countdown targetMs={END_UTC} label="Giveaway ends in" />}
              {hasEnded && (
                <div className="giveawayLocked">
                  Giveaway ended ✅ Winners announced in Discord.
                </div>
              )}
            </div>

            <div className="giveawayActions">
              <a
                href={GIVEAWAY.discordInvite}
                target="_blank"
                rel="noopener noreferrer"
                className="btnPrimary"
                onClick={() => track("discord_click", { source: "giveaway" })}
              >
                Join Discord
              </a>

              <a
                href={GIVEAWAY.xUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btnGhost"
                onClick={() => track("x_click", { source: "giveaway" })}
              >
                Follow on X
              </a>

              <a
                href={GIVEAWAY.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btnGhost"
                onClick={() => track("instagram_click", { source: "giveaway" })}
              >
                Follow on Instagram
              </a>
            </div>
          </motion.div>
        </section>

        {/* CONTENT */}
        <section className="giveawaySection">
          <motion.div
            className="giveawayGrid"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {/* RULES */}
            <div className="giveawayCard">
              <div className="giveawayCardTitle">How to Enter</div>
              <ol className="giveawayRules">
                {GIVEAWAY.rules.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ol>
              <div className="muted small">
                One entry per person. Winners announced in Discord.
              </div>
            </div>

            {/* FORM */}
            <div className="giveawayCard">
              <div className="giveawayCardTitle">Entry Form</div>

              {!isOpen && !hasEnded && (
                <div className="alert">
                  Giveaway is not open yet. Come back when the countdown hits 0.
                </div>
              )}

              {hasEnded && (
                <div className="alert">
                  Giveaway has ended. Winners will be announced in Discord.
                </div>
              )}

              {err && <div className="alert">{err}</div>}
              {ok && (
                <div className="alert success">
                  Entry submitted ✅ Good luck!
                </div>
              )}

              <form onSubmit={onSubmit} className="form">
                <label className="label">GamerTag</label>
                <input
                  className="input"
                  name="gamerTag"
                  value={form.gamerTag}
                  onChange={onChange}
                  placeholder="Your gamer tag"
                  autoComplete="off"
                  disabled={!isOpen || loading}
                />

                <label className="label">Email</label>
                <input
                  className="input"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="you@email.com"
                  autoComplete="email"
                  disabled={!isOpen || loading}
                />

                <label className="label">Discord</label>
                <input
                  className="input"
                  name="discord"
                  value={form.discord}
                  onChange={onChange}
                  placeholder="name#0000 (or @name)"
                  autoComplete="off"
                  disabled={!isOpen || loading}
                />

                <label className="label">Platform</label>
                <select
                  className="input"
                  name="platform"
                  value={form.platform}
                  onChange={onChange}
                  disabled={!isOpen || loading}
                >
                  <option value="PC">PC</option>
                </select>

                <label className="label">Anything else (optional)</label>
                <textarea
                  className="input textarea"
                  name="notes"
                  value={form.notes}
                  onChange={onChange}
                  placeholder="Links / socials / notes"
                  disabled={!isOpen || loading}
                />

                <motion.button
                  type="submit"
                  className="btnPrimary"
                  disabled={!isOpen || loading}
                  whileHover={{ scale: isOpen && !loading ? 1.03 : 1 }}
                  whileTap={{ scale: isOpen && !loading ? 0.98 : 1 }}
                >
                  {hasEnded
                    ? "Giveaway Ended"
                    : !hasStarted
                    ? "Not Open Yet"
                    : loading
                    ? "Submitting..."
                    : "Submit Entry"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </section>
      </div>
    </PageMotion>
  );
}
