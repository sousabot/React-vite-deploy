import React from "react";
import { motion } from "framer-motion";
import PageMotion from "../components/PageMotion.jsx";
import { Link } from "react-router-dom";
import { FaDiscord } from "react-icons/fa";
import { DISCORD_INVITE } from "../data/links.js";

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

const NEXT = [
  { title: "Roster", desc: "Tryouts open — final spots being decided." },
  { title: "Creators", desc: "Growing a creator roster that matches the brand." },
  { title: "Community", desc: "Events, scrims, and Discord-first updates." },
];

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function About() {
  return (
    <PageMotion>
      <div className="gdPage aboutClean">
        <header className="gdCastHead">
          <div className="gdCastHeadCopy">
            <h1 className="gdCastTitle">About</h1>
            <p className="gdCastMeta muted">GD Esports · LPLOL</p>
          </div>
          <div className="gdCastHeadActions">
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noopener noreferrer"
              className="btnPrimary"
            >
              <FaDiscord aria-hidden="true" />
              Discord
            </a>
            <Link to="/work-with-us" className="btnGhost">
              Work with us
            </Link>
          </div>
        </header>

        <motion.section
          className="aboutCleanIntro"
          variants={fade}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.4 }}
        >
          <p className="aboutCleanLead">
            Built to compete seriously, develop talent properly, and leave a mark
            that lasts.
          </p>
          <p className="aboutCleanSub muted">
            Structure on the Rift. Discipline in every decision. An org built for
            the long run — players, creators, and community under one banner.
          </p>
        </motion.section>

        <motion.section
          className="aboutCleanSection"
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <div className="aboutCleanLabel">Values</div>
          <div className="aboutCleanValues">
            {VALUES.map((v) => (
              <div key={v.title} className="aboutCleanValue">
                <h2>{v.title}</h2>
                <p className="muted">{v.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="aboutCleanSection aboutCleanSplit"
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <div className="aboutCleanLabel">Vision</div>
          <p className="aboutCleanBody">
            No shortcuts. No temporary hype. From roster construction to content,
            every call is made for long-term growth — an ecosystem where players
            improve, creators grow, and competition is treated with respect.
          </p>
        </motion.section>

        <motion.section
          className="aboutCleanSection"
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <div className="aboutCleanLabel">What’s next</div>
          <ul className="aboutCleanList">
            {NEXT.map((item) => (
              <li key={item.title}>
                <span className="aboutCleanListTitle">{item.title}</span>
                <span className="muted">{item.desc}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        <section className="gdCastFooter">
          <p className="muted">Together, we rise.</p>
          <div className="gdCastHeadActions">
            <Link to="/players" className="btnGhost">
              Players
            </Link>
            <Link to="/work-with-us" className="btnPrimary">
              Apply now
            </Link>
          </div>
        </section>
      </div>
    </PageMotion>
  );
}
