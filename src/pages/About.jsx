import React from "react";
import { motion } from "framer-motion";
import PageMotion from "../components/PageMotion.jsx";
import { Link } from "react-router-dom";
import { FaDiscord } from "react-icons/fa";
import { DISCORD_INVITE } from "../data/links.js";

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
    desc: "Show up, review, improve — even when it's not exciting.",
  },
  {
    title: "Identity",
    desc: "Compete with purpose. Represent GD with professionalism and pride.",
  },
];

const NEXT = [
  { title: "Roster building", desc: "Tryouts open — final spots being decided." },
  { title: "Creator expansion", desc: "Bringing in creators who match the brand." },
  { title: "Community growth", desc: "Events, scrims, and Discord initiatives." },
];

export default function About() {
  return (
    <PageMotion>
      <div className="gdPage">
        <section className="gdPageHero">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <img
              src="/logo.png"
              alt=""
              className="gdPageLogo"
              loading="eager"
            />
            <h1 className="gdPageTitle">About GD</h1>
            <p className="gdPageLead muted">
              Structure. Discipline. Built to compete on the Rift — and last.
            </p>
            <div className="gdPageActions">
              <a
                href={DISCORD_INVITE}
                target="_blank"
                rel="noopener noreferrer"
                className="btnPrimary"
              >
                <FaDiscord aria-hidden="true" />
                Join Discord
              </a>
              <Link to="/work-with-us" className="btnGhost">
                Work with us
              </Link>
            </div>
          </motion.div>
        </section>

        <motion.section
          className="gdPageSection"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <p className="gdPageMission">
            GD Esports was built to compete seriously, develop talent properly,
            and leave a mark that lasts.
          </p>
        </motion.section>

        <motion.section
          className="gdPageSection"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="homeSectionHead">
            <h2 className="homeSectionTitle">Values</h2>
            <p className="homeSectionSub muted">What we hold the org to.</p>
          </div>
          <div className="gdValueList">
            {VALUES.map((v) => (
              <div key={v.title} className="gdValueRow">
                <h3 className="gdValueTitle">{v.title}</h3>
                <p className="gdValueDesc muted">{v.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="gdPageSection"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="homeSectionHead">
            <h2 className="homeSectionTitle">Vision</h2>
            <p className="homeSectionSub muted">Long-term over temporary hype.</p>
          </div>
          <div className="gdPageProse">
            <p>
              Every decision — from roster construction to content — is made with
              long-term growth in mind. We start on the Rift, but we&apos;re
              building an ecosystem where players improve, creators grow, and
              competition is treated with respect.
            </p>
          </div>
        </motion.section>

        <motion.section
          className="gdPageSection"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="homeSectionHead">
            <h2 className="homeSectionTitle">What&apos;s next</h2>
            <p className="homeSectionSub muted">Where the org is headed.</p>
          </div>
          <div className="gdValueList">
            {NEXT.map((item) => (
              <div key={item.title} className="gdValueRow">
                <h3 className="gdValueTitle">{item.title}</h3>
                <p className="gdValueDesc muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="gdPageSection gdPageCta"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="homeSectionHead">
            <h2 className="homeSectionTitle">Together, we rise</h2>
            <p className="homeSectionSub muted">
              Apply, compete, or join the Discord.
            </p>
          </div>
          <div className="gdPageActions gdPageActions--center">
            <Link to="/work-with-us" className="btnPrimary">
              Apply now
            </Link>
            <Link to="/players" className="btnGhost">
              Meet players
            </Link>
          </div>
        </motion.section>
      </div>
    </PageMotion>
  );
}
