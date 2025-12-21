import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import PageMotion from "../components/PageMotion.jsx";
import Modal from "../components/Modal.jsx";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  const [open, setOpen] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const tiltStyle = useMemo(
    () => ({ transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)` }),
    [tilt]
  );

  function onMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({ x: (px - 0.5) * 8, y: -(py - 0.5) * 6 });
  }

  function onLeave() {
    setTilt({ x: 0, y: 0 });
  }

  return (
    <PageMotion>
      <div className="homePro">
        {/* DEPLOY MARKER (TEST) */}
        <div style={{ opacity: 0.35, fontSize: 12, padding: "6px 0" }}>
          HOME DEPLOY CHECK: 2a88ed4
        </div>




        {/* ✅ NEW FEATURE (TEST): LIVE UPDATE CARD */}
        <section className="sectionPro">
          <motion.div
            className="updateCard"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="updateTop">
              <span className="updateBadge">
                <span className="pulseDot" /> LIVE UPDATE
              </span>
              <span className="updateSmall">Home feature test</span>
            </div>

            <div className="updateTitle">Deploy test feature added ✅</div>
            <div className="updateDesc">
              If you can see this card on Netlify, your auto-deploy pipeline is working
              perfectly.
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

function Stat({ value, label }) {
  return (
    <div className="statPro">
      <div className="statValue">{value}</div>
      <div className="statLabel">{label}</div>
    </div>
  );
}
