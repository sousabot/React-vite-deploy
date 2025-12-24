import React, { useState } from "react";
import PageMotion from "../components/PageMotion.jsx";
import { motion } from "framer-motion";
import { track } from "../state/track.js";

const GIVEAWAY = {
  title: "GD Esports Giveaway",
  prize: "1x GD Jersey + Discord VIP Role",
  ends: "Dec 25",
};

function encodeForm(data) {
  return new URLSearchParams(data).toString();
}

export default function Giveaway() {
  const [form, setForm] = useState({
    gamerTag: "",
    email: "",
    discord: "",
    platform: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!form.gamerTag || !form.email || !form.discord) {
      setError("Please fill Gamer Tag, Email, and Discord.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        type: "giveaway_entry",
        prize: GIVEAWAY.prize,
        gamerTag: form.gamerTag,
        email: form.email,
        discord: form.discord,
        platform: form.platform,
        notes: form.notes,
      };

      const res = await fetch("/.netlify/functions/form-to-discord", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeForm(payload),
      });

      if (!res.ok) throw new Error("Submission failed");

      setSuccess(true);
      track("giveaway_submit");

      setForm({
        gamerTag: "",
        email: "",
        discord: "",
        platform: "",
        notes: "",
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageMotion>
      <div className="giveawayPage">
        <section className="giveawayHero">
          <span className="giveawayBadge">🎁 GIVEAWAY</span>

          <h1 className="giveawayTitle">{GIVEAWAY.title}</h1>
          <p className="giveawaySub">
            Enter for a chance to win exclusive merch.
          </p>

          <div className="giveawayPrizeCard">
            <div className="giveawayPrizeLabel">Prize</div>
            <div className="giveawayPrize">{GIVEAWAY.prize}</div>
            <div className="giveawayEnds">Ends: {GIVEAWAY.ends}</div>
          </div>

          <motion.form
            className="giveawayForm"
            onSubmit={submit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="formRow">
              <input
                className="input"
                name="gamerTag"
                placeholder="Gamer Tag"
                value={form.gamerTag}
                onChange={onChange}
                required
              />

              <input
                className="input"
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={onChange}
                required
              />
            </div>

            <div className="formRow">
              <input
                className="input"
                name="discord"
                placeholder="Discord (name#0000)"
                value={form.discord}
                onChange={onChange}
                required
              />

              <input
                className="input"
                name="platform"
                placeholder="Platform (PC / Console)"
                value={form.platform}
                onChange={onChange}
              />
            </div>

            <textarea
              className="input textarea"
              name="notes"
              placeholder="Anything else? (optional)"
              value={form.notes}
              onChange={onChange}
            />

            {error && <div className="formError">{error}</div>}
            {success && (
              <div className="formSuccess">
                Entry submitted ✅ Good luck!
              </div>
            )}

            <motion.button
              className="btnPrimary giveawaySubmit"
              type="submit"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Enter Giveaway"}
            </motion.button>
          </motion.form>
        </section>
      </div>
    </PageMotion>
  );
}
