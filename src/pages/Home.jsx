import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PageMotion from "../components/PageMotion.jsx";
import Modal from "../components/Modal.jsx";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const CREATORS = [{ twitchLogin: "mewtzu" }];

function encodeForm(data) {
  return new URLSearchParams(data).toString();
}

export default function Home() {
  const [open, setOpen] = useState(false);

  // Live status
  const [liveCount, setLiveCount] = useState(0);

  // Tryouts form state
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

  useEffect(() => {
    let cancelled = false;

    async function loadLive() {
      try {
        const results = await Promise.all(
          CREATORS.map(async (c) => {
            try {
              const res = await fetch(
                `/.netlify/functions/twitch-live?user=${encodeURIComponent(c.twitchLogin)}`
              );
              if (!res.ok) return false;
              const data = await res.json();
              return !!data?.isLive;
            } catch {
              return false;
            }
          })
        );

        if (!cancelled) setLiveCount(results.filter(Boolean).length);
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

  function onChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function submitTryout(e) {
    e.preventDefault();
    setSubmitError("");
    setSubmitted(false);

    // Basic required checks
    if (!form.gamerTag.trim() || !form.game.trim() || !form.discord.trim()) {
      setSubmitError("Please fill Gamer tag, Game, and Discord.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        type: "tryout",
        ...form,
      };

      const res = await fetch("/.netlify/functions/form-to-discord", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeForm(payload),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Submit failed (${res.status})`);
      }

      setSubmitted(true);
      setForm({
        gamerTag: "",
        game: "",
        discord: "",
        role: "",
        availability: "",
        notes: "",
      });

      // Optional: close after a moment
      setTimeout(() => setOpen(false), 900);
    } catch (err) {
      console.error(err);
      setSubmitError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageMotion>
      <div className="homePro">
        {/* WHAT'S HAPPENING NOW */}
        <section className="sectionPro">
          <motion.div
            className="statusCard"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="statusTop">
              <span className="statusBadge">
                <span className="pulseDot" /> WHAT’S HAPPENING NOW
              </span>
              <span className="statusSmall">Live org status</span>
            </div>

            <div className="statusTitle">Current Status</div>

            <div className="statusGrid">
              {/* Creator Live */}
              <div className="statusItem">
                <div className="statusItemLeft">
                  <span className={`statusDot ${liveCount > 0 ? "dotRed" : "dotGray"}`} />
                  <div className="statusItemText">
                    <div className="statusLabel">Creator</div>
                    <div className="statusValue">{creatorStatus}</div>
                  </div>
                </div>

                <Link to="/creators" className="statusLink">
                  View
                </Link>
              </div>

              {/* Tryouts Open */}
              <div className="statusItem">
                <div className="statusItemLeft">
                  <span className="statusDot dotGreen" />
                  <div className="statusItemText">
                    <div className="statusLabel">Tryouts</div>
                    <div className="statusValue">Open</div>
                  </div>
                </div>

                <button className="statusLinkBtn" onClick={() => setOpen(true)}>
                  Apply
                </button>
              </div>

              {/* Roster Forming */}
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

        {/* CREATOR CTA */}
        <section className="sectionPro shopCtaSection">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="shopCtaGrid">
              <Link to="/creators" className="shopCtaCard">
                <span className="shopCtaText">
                  MEET OUR
                  <br />
                  CREATORS
                </span>
                <span className="shopCtaArrow">›</span>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* TRYOUTS MODAL */}
        <Modal open={open} title="GD Esports Tryouts" onClose={() => setOpen(false)}>
          <p className="muted">
            Apply to join GD Esports. Show consistency, strong comms, and mindset.
          </p>

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
                placeholder="Discord (e.g. user#1234)"
                required
              />
              <input
                className="input"
                name="role"
                value={form.role}
                onChange={onChange}
                placeholder="Role (Top / Jungle / Mid / ADC / Support)"
              />
            </div>

            <div className="formRow">
              <input
                className="input"
                name="availability"
                value={form.availability}
                onChange={onChange}
                placeholder="Availability (days/times)"
              />
            </div>

            <div className="formRow">
              <textarea
                className="input textarea"
                name="notes"
                value={form.notes}
                onChange={onChange}
                placeholder="Anything else? (rank, experience, links...)"
                rows={4}
              />
            </div>

            {submitError && <div className="formError">{submitError}</div>}
            {submitted && (
              <div className="formSuccess" style={{ marginTop: 10 }}>
                Application sent ✅
              </div>
            )}

            <div className="formRow" style={{ marginTop: 10 }}>
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
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setOpen(false)}
                disabled={submitting}
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
