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
        {/* HERO */}
        <section className="heroPro" onMouseMove={onMove} onMouseLeave={onLeave}>
          <motion.div
            className="heroGrid"
            style={tiltStyle}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="heroLeft">
              <div className="kickerRow">
                <span className="kickerBadge">GD Esports</span>
                <span className="kickerDot">•</span>
                <span className="kickerText">Competitive Organization</span>
              </div>

              <h1 className="heroTitle">
                Play Fast. <span className="accentText">Think Faster.</span>
              </h1>

              <p className="heroDesc">
                GD Esports is a competitive organization built on discipline,
                clean communication, and clutch decision-making.
                We compete to win — nothing less.
              </p>

              <div className="heroCTA">
                <motion.button
                  className="btnPrimary"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setOpen(true)}
                >
                  Join Tryouts
                </motion.button>

                <div className="socialRow">
                  <a className="socialChip" href="#" onClick={(e) => e.preventDefault()}>
                    Discord
                  </a>
                  <a className="socialChip" href="#" onClick={(e) => e.preventDefault()}>
                    Twitch
                  </a>
                  <a className="socialChip" href="#" onClick={(e) => e.preventDefault()}>
                    X
                  </a>
                </div>
              </div>

              <div className="heroStats">
                <Stat label="Scrims / Week" value="24" />
                <Stat label="Tournaments" value="7" />
                <Stat label="Goal" value="Champions" />
                <Stat label="Region" value="EU / NA" />
              </div>
            </div>
          </motion.div>

          <div className="heroDivider" />
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
