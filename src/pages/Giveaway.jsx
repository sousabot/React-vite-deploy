import React, { useMemo, useState } from "react";
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

export default function Giveaway() {
  // ✅ Edit these whenever you run a new giveaway
  const GIVEAWAY = useMemo(
    () => ({
      title: "GD Esports Giveaway",
      subtitle: "Enter for a chance to win exclusive merch.",
      prize: "1x GD Jersey + Gift Card",
      endsText: "Ends: Dec 25",
      rules: [
        "Join the Discord",
        "Follow our X account",
        "Follow our Instagram account",
        "Submit your entry below",
      ],
      discordInvite: "https://discord.gg/5fZ7UEnnzn",
      xUrl: "https://x.com/GDESPORTS25",
    }),
    []
  );

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

    if (!form.gamerTag || !form.discord || !form.email) {
      setErr("Please fill GamerTag, Discord and Email.");
      return;
    }

    setLoading(true);
    try {
      // ✅ send to Discord via your existing function
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
                />

                <label className="label">Email</label>
                <input
                  className="input"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="you@email.com"
                  autoComplete="email"
                />

                <label className="label">Discord</label>
                <input
                  className="input"
                  name="discord"
                  value={form.discord}
                  onChange={onChange}
                  placeholder="name#0000 (or @name)"
                  autoComplete="off"
                />

                <label className="label">Platform</label>
                <select
                  className="input"
                  name="platform"
                  value={form.platform}
                  onChange={onChange}
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
                />

                <motion.button
                  type="submit"
                  className="btnPrimary"
                  disabled={loading}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? "Submitting..." : "Submit Entry"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </section>
      </div>
    </PageMotion>
  );
}
