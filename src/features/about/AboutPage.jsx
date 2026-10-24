import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaDiscord } from "react-icons/fa";
import Page from "../../components/ui/Page.jsx";
import SectionHead from "../../components/ui/SectionHead.jsx";
import CtaBand from "../../components/ui/CtaBand.jsx";
import { DISCORD_INVITE, SITE } from "../../config/site.js";
import "./about.css";

const VALUES = [
  { title: "Structure", desc: "Clear roles, standards and systems that keep performance consistent." },
  { title: "Discipline", desc: "Show up, review, improve — even when it isn't exciting." },
  { title: "Identity", desc: "Compete with purpose. Represent GD with professionalism and pride." },
];

const NEXT = [
  { title: "Roster", desc: "Tryouts open — final spots being decided." },
  { title: "Creators", desc: "Growing a creator roster that matches the brand." },
  { title: "Community", desc: "Events, scrims and Discord-first updates." },
];

const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

export default function AboutPage() {
  return (
    <Page>
      <section className="about-intro">
        <span className="eyebrow">About {SITE.name}</span>
        <motion.h1 className="display display--lg" {...reveal}>
          Built to compete seriously, develop talent properly and leave a mark{" "}
          <span className="text-orange">that lasts.</span>
        </motion.h1>
        <motion.p className="lead" {...reveal}>
          Structure on the Rift. Discipline in every decision. An org built for the long run —
          players, creators and community under one banner.
        </motion.p>
      </section>

      <section className="section--tight">
        <SectionHead index="01" eyebrow="What we stand for" title="Values" />
        <div className="about-values">
          {VALUES.map((v, i) => (
            <motion.article key={v.title} className="panel about-value" {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }}>
              <span className="mono faint">0{i + 1}</span>
              <h3 className="display display--sm">{v.title}</h3>
              <p className="muted">{v.desc}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="section--tight">
        <SectionHead index="02" eyebrow="Long term" title="Vision" />
        <motion.blockquote className="about-quote" {...reveal}>
          No shortcuts. No temporary hype. From roster construction to content, every call is made
          for long-term growth — an ecosystem where players improve, creators grow and competition
          is treated with respect.
        </motion.blockquote>
      </section>

      <section className="section--tight">
        <SectionHead index="03" eyebrow="Roadmap" title="What's next" />
        <ol className="about-next">
          {NEXT.map((item) => (
            <motion.li key={item.title} {...reveal}>
              <span className="display display--sm">{item.title}</span>
              <span className="muted">{item.desc}</span>
            </motion.li>
          ))}
        </ol>
      </section>

      <div className="page-cta">
        <CtaBand eyebrow="Together, we rise" title="Be part of it" sub="Compete, create or help run the org.">
          <Link to="/work-with-us" className="btn btn--primary">
            Apply now
          </Link>
          <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
            <FaDiscord aria-hidden="true" /> Discord
          </a>
        </CtaBand>
      </div>
    </Page>
  );
}
