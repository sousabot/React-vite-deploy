import React from "react";
import { motion } from "framer-motion";
import PageMotion from "../components/PageMotion.jsx";

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

            {/* Animated divider under hero */}
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
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <p className="aboutLead">
              GD ESPORTS was built with a clear purpose: to compete seriously, develop talent
              properly, and leave a mark that lasts.
            </p>

            <div className="animatedDivider" aria-hidden="true">
              <span className="animatedDividerGlow" />
              <span className="animatedDividerTrack" />
            </div>

            <motion.p
              className="aboutText"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
            >
              We’re not here for shortcuts or temporary hype. GD ESPORTS is driven by structure,
              discipline, and the relentless grind required to win at the highest level. Every
              decision — from roster construction to content creation — is made with long-term
              growth in mind.
            </motion.p>

            <motion.p
              className="aboutText"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.08 }}
            >
              Our focus starts on the Rift, but our vision goes beyond a single game. We aim to
              create an ecosystem where players improve, creators grow, and competition is treated
              with the respect it deserves. That means accountability, professionalism, and
              standards that don’t bend when things get difficult.
            </motion.p>

            <motion.p
              className="aboutText"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            >
              This is only the beginning. Rosters are forming, content is coming, and major
              announcements are on the way. What matters most is the foundation we’re building now
              — one that prioritizes performance, mindset, and identity.
            </motion.p>

            <div className="animatedDivider" aria-hidden="true">
              <span className="animatedDividerGlow" />
              <span className="animatedDividerTrack" />
            </div>

            <motion.div
              className="aboutClosing"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <p className="aboutCommitment">GD ESPORTS isn’t just a name. It’s a commitment.</p>
              <p className="aboutTagline">Together, we rise.</p>
            </motion.div>
          </motion.section>
        </main>
      </div>
    </PageMotion>
  );
}
