import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PageMotion from "../components/PageMotion.jsx";
import Modal from "../components/Modal.jsx";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

// keep this in sync with Creators page
const CREATORS = [{ twitchLogin: "mewtzu" }];

export default function Home() {
  const [open, setOpen] = useState(false);

  // Live status
  const [liveCount, setLiveCount] = useState(0);

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

        if (cancelled) return;
        setLiveCount(results.filter(Boolean).length);
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
    liveCount > 0 ? `${liveCount} Creator${liveCount > 1 ? "s" : ""} Live Now` : "No one Live Right Now";

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

          <div className="formRow">
            <input className="input" placeholder="Gamer tag" />
            <input className="input" placeholder="Game (Valorant / CS2 / Apex)" />
          </div>

          <div className="formRow">
            <motion.button
              className="btnPrimary"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setOpen(false)}
            >
              Submit
            </motion.button>

            <motion.button
              className="btnGhost"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setOpen(false)}
            >
              Cancel
            </motion.button>
          </div>
        </Modal>
      </div>
    </PageMotion>
  );
}
