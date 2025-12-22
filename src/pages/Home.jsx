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

  /* ======================
     LIVE CREATOR STATUS
     ====================== */
  const [liveCount, setLiveCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadLive() {
      try {
        const results = await Promise.all(
          CREATORS.map(async (c) => {
            try {
              const res = await fetch(
                `/.netlify/functions/twitch-live?user=${encodeURIComponent(
                  c.twitchLogin
                )}`
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
      setForm({
        gamerTag: "",
        game: "",
        discord: "",
        role: "",
        availability: "",
        notes: "",
      });

      setTimeout(() => setOpen(false), 900);
    } catch (err) {
      setSubmitError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageMotion>
      <div className="homePro">
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
                <span
                  className={`statusDot ${
                    liveCount > 0 ? "dotRed" : "dotGray"
                  }`}
                />
                <div>
                  <div className="statusLabel">Creators</div>
                  <div className="statusValue">{creatorStatus}</div>
                </div>
                <Link to="/creators" className="statusLink">
                  View
                </Link>
              </div>

              <div className="statusItem">
                <span className="statusDot dotGreen" />
                <div>
                  <div className="statusLabel">Tryouts</div>
                  <div className="statusValue">Open</div>
                </div>
                <button
                  className="statusLinkBtn"
                  onClick={() => setOpen(true)}
                >
                  Apply
                </button>
              </div>

              <div className="statusItem">
                <span className="statusDot dotYellow" />
                <div>
                  <div className="statusLabel">Roster</div>
                  <div className="statusValue">Forming</div>
                </div>
                <Link to="/about" className="statusLink">
                  Info
                </Link>
              </div>
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
              <span className="announceBadge">🚨 ANNOUNCEMENT INCOMING</span>
              <span className="announceSmall muted">Stay locked in</span>
            </div>

            <div className="announceTitle">Roster reveal coming soon</div>
            <div className="announceDesc muted">
              Major updates are on the way. Follow GD Esports to be first.
            </div>

            <div className="announceActions">
              <a
                href="https://discord.gg/5fZ7UEnnzn"
                target="_blank"
                rel="noopener noreferrer"
                className="btnPrimary"
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
          </motion.div>
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
            {submitted && (
              <div className="formSuccess">Application sent ✅</div>
            )}

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
