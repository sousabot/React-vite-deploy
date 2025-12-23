import React from "react";
import { motion } from "framer-motion";
import PageMotion from "../components/PageMotion.jsx";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

const VALUES = [
  {
    title: "Structure",
    desc: "Clear roles, standards, and systems that keep performance consistent.",
  },
  {
    title: "Discipline",
    desc: "Show up, review, improve — even when it’s not exciting.",
  },
  {
    title: "Identity",
    desc: "Compete with purpose. Represent GD with professionalism and pride.",
  },
];

const ROADMAP = [
  { title: "Roster building", desc: "Tryouts open — final spots being decided." },
  { title: "Creator expansion", desc: "Bringing in creators who match the brand." },
  { title: "Community growth", desc: "Events, scrims, and Discord initiatives." },
  { title: "Major announcements", desc: "Reveals + drops coming soon." },
];

export default function About() {
  return (
    <PageMotion>
      <div className="aboutPage">
        {/* Watermark background */}
        <div className="aboutWatermark" aria-hidden="true" />

        {/* HERO */}
        <header className="aboutHero">
          <motion.div
            className="aboutHeroInner"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="aboutKicker">GD ESPORTS</div>
            <h1 className="aboutTitle">Built to Compete. Built to Last.</h1>
            <p className="aboutSubtitle">
              Structure. Discipline. The relentless grind required to win at the highest level.
            </p>

            <div className="dividerWrap">
              <span className="dividerLine" />
              <span className="dividerPulse" />
              <span className="dividerLine" />
            </div>
          </motion.div>
        </header>

        {/* BODY */}
        <main className="aboutMain">
          <motion.section
            className="aboutCard"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <p className="aboutLead">
              GD ESPORTS was built with a clear purpose: to compete seriously, develop talent
              properly, and leave a mark that lasts.
            </p>

            <div className="animatedDivider" aria-hidden="true">
              <span className="animatedDividerGlow" />
              <span className="animatedDividerTrack" />
            </div>

            {/* VALUES */}
            <div className="aboutValuesGrid">
              {VALUES.map((v) => (
                <motion.div
                  key={v.title}
                  className="statusItem aboutValueCard"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  <div className="statusItemLeft">
                    <span className="statusDot dotYellow" />
                    <div className="statusItemText">
                      <div className="statusLabel">{v.title}</div>
                      <div className="statusValue">{v.desc}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="animatedDivider" aria-hidden="true" style={{ marginTop: 16 }}>
              <span className="animatedDividerGlow" />
              <span className="animatedDividerTrack" />
            </div>

            <motion.p
              className="aboutText"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              We’re not here for shortcuts or temporary hype. Every decision — from roster
              construction to content creation — is made with long-term growth in mind.
            </motion.p>

            <motion.p
              className="aboutText"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
            >
              Our focus starts on the Rift, but our vision goes beyond a single game. We’re building
              an ecosystem where players improve, creators grow, and competition is treated with
              the respect it deserves.
            </motion.p>

            <div className="animatedDivider" aria-hidden="true" style={{ marginTop: 16 }}>
              <span className="animatedDividerGlow" />
              <span className="animatedDividerTrack" />
            </div>

            {/* ROADMAP */}
            <div style={{ marginTop: 12 }}>
              <div className="muted" style={{ fontWeight: 950, letterSpacing: ".12em", fontSize: 12 }}>
                WHAT’S NEXT
              </div>

              <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                {ROADMAP.map((r) => (
                  <div key={r.title} className="statusItem">
                    <div className="statusItemLeft">
                      <span className="statusDot dotGreen" />
                      <div className="statusItemText">
                        <div className="statusLabel">{r.title}</div>
                        <div className="statusValue">{r.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="animatedDivider" aria-hidden="true" style={{ marginTop: 16 }}>
              <span className="animatedDividerGlow" />
              <span className="animatedDividerTrack" />
            </div>

            <motion.div
              className="aboutClosing"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{ display: "grid", gap: 12 }}
            >
              <div>
                <p className="aboutCommitment">GD ESPORTS isn’t just a name. It’s a commitment.</p>
                <p className="aboutTagline">Together, we rise.</p>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                <Link to="/" className="btnPrimary">
                  Tryouts
                </Link>
                <Link to="/work-with-us" className="btnGhost">
                  Work With Us
                </Link>
                <a
                  className="btnGhost"
                  href="https://discord.gg/5fZ7UEnnzn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join Discord
                </a>
              </div>
            </motion.div>
          </motion.section>
        </main>
      </div>
    </PageMotion>
  );
}
