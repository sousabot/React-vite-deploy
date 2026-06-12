import React from "react";
import { motion } from "framer-motion";
import PageMotion from "../components/PageMotion.jsx";
import { Link } from "react-router-dom";
import {
  FaBolt,
  FaBullhorn,
  FaDiscord,
  FaShieldHalved,
  FaSitemap,
  FaUsers,
  FaVideo,
} from "react-icons/fa6";
import { DISCORD_INVITE } from "../data/links.js";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

const VALUES = [
  {
    title: "Structure",
    desc: "Clear roles, standards, and systems that keep performance consistent.",
    icon: FaSitemap,
    num: "01",
  },
  {
    title: "Discipline",
    desc: "Show up, review, improve — even when it's not exciting.",
    icon: FaBolt,
    num: "02",
  },
  {
    title: "Identity",
    desc: "Compete with purpose. Represent GD with professionalism and pride.",
    icon: FaShieldHalved,
    num: "03",
  },
];

const ROADMAP = [
  {
    title: "Roster building",
    desc: "Tryouts open — final spots being decided.",
    icon: FaUsers,
  },
  {
    title: "Creator expansion",
    desc: "Bringing in creators who match the brand.",
    icon: FaVideo,
  },
  {
    title: "Community growth",
    desc: "Events, scrims, and Discord initiatives.",
    icon: FaDiscord,
  },
  {
    title: "Major announcements",
    desc: "Reveals + drops coming soon.",
    icon: FaBullhorn,
  },
];

export default function About() {
  return (
    <PageMotion>
      <div className="aboutPage">
        <section className="aboutHero">
          <div className="aboutHeroBg" aria-hidden="true">
            <div className="aboutHeroBgGrad" />
            <div className="aboutHeroBgGrid" />
            <div className="aboutHeroLogo" />
          </div>

          <motion.div
            className="aboutHeroInner"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="aboutHeroKicker">
              <span className="aboutKickerDot" aria-hidden="true" />
              GD ESPORTS · ABOUT
            </div>
            <h1 className="aboutHeroTitle">
              Built to compete.<br />
              <em className="aboutHeroTitleAccent">Built to last.</em>
            </h1>
            <p className="aboutHeroDesc muted">
              Structure. Discipline. The relentless grind required to win at the
              highest level — on the Rift and beyond.
            </p>
          </motion.div>
        </section>

        <motion.section
          className="aboutMission"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.35 }}
        >
          <p className="aboutLead">
            GD ESPORTS was built with a clear purpose: to compete seriously,
            develop talent properly, and leave a mark that lasts.
          </p>
        </motion.section>

        <motion.section
          className="aboutSection"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35 }}
        >
          <div className="aboutSectionHead">
            <span className="aboutSectionNum">01</span>
            <h2 className="aboutSectionTitle">Our values</h2>
          </div>

          <div className="aboutValuesGrid">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.article
                  key={v.title}
                  className="aboutValueCard"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                >
                  <span className="aboutValueNum">{v.num}</span>
                  <span className="aboutValueIcon" aria-hidden="true">
                    <Icon />
                  </span>
                  <h3 className="aboutValueTitle">{v.title}</h3>
                  <p className="aboutValueDesc muted">{v.desc}</p>
                </motion.article>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          className="aboutStory"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.35 }}
        >
          <div className="aboutSectionHead">
            <span className="aboutSectionNum">02</span>
            <h2 className="aboutSectionTitle">The vision</h2>
          </div>

          <div className="aboutStoryGrid">
            <p className="aboutText">
              We&apos;re not here for shortcuts or temporary hype. Every decision
              — from roster construction to content creation — is made with
              long-term growth in mind.
            </p>
            <p className="aboutText">
              Our focus starts on the Rift, but our vision goes beyond a single
              game. We&apos;re building an ecosystem where players improve, creators
              grow, and competition is treated with the respect it deserves.
            </p>
          </div>
        </motion.section>

        <motion.section
          className="aboutSection"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35 }}
        >
          <div className="aboutSectionHead">
            <span className="aboutSectionNum">03</span>
            <h2 className="aboutSectionTitle">What&apos;s next</h2>
          </div>

          <div className="aboutRoadmap">
            {ROADMAP.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  className="aboutRoadmapItem"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                >
                  <span className="aboutRoadmapIcon" aria-hidden="true">
                    <Icon />
                  </span>
                  <div>
                    <div className="aboutRoadmapTitle">{item.title}</div>
                    <div className="aboutRoadmapDesc muted small">{item.desc}</div>
                  </div>
                  <span className="aboutRoadmapLine" aria-hidden="true" />
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          className="aboutCta"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.35 }}
        >
          <div className="aboutCtaGlow" aria-hidden="true" />
          <p className="aboutCommitment">
            GD ESPORTS isn&apos;t just a name. It&apos;s a commitment.
          </p>
          <p className="aboutTagline">Together, we rise.</p>

          <div className="aboutCtaActions">
            <Link to="/work-with-us" className="btnPrimary">
              Apply now
            </Link>
            <Link to="/creators" className="btnGhost">
              Meet the roster
            </Link>
            <a
              className="btnGhost"
              href={DISCORD_INVITE}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Discord
            </a>
          </div>
        </motion.section>
      </div>
    </PageMotion>
  );
}
