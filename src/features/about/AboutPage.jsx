import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaDiscord, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FiArrowUpRight } from "react-icons/fi";
import Page from "../../components/ui/Page.jsx";
import CtaBand from "../../components/ui/CtaBand.jsx";
import { DISCORD_INVITE, SITE, SOCIALS } from "../../config/site.js";
import { PLAYER_GAMES } from "../../content/players.js";
import { useSiteContent } from "../../content/siteContent.js";
import { useDiscordStats } from "../../hooks/useDiscordStats.js";
import { formatViewers, pad2 } from "../../lib/format.js";
import { track } from "../../lib/track.js";
import "./about.css";

const EASE = [0.22, 1, 0.36, 1];

const MANIFESTO = ["Structure on the Rift.", "Discipline in every decision.", "An org built for the long run —", "players, creators and community under one banner."];

const VALUES = [
  { title: "Structure", desc: "Clear roles, standards and systems that keep performance consistent." },
  { title: "Discipline", desc: "Show up, review, improve — even when it isn't exciting." },
  { title: "Identity", desc: "Compete with purpose. Represent GD with professionalism and pride." },
];

const NEXT = [
  { title: "Roster", status: "Tryouts open", desc: "Tryouts open — final spots being decided." },
  { title: "Creators", status: "Growing", desc: "Growing a creator roster that matches the brand." },
  { title: "Community", status: "Ongoing", desc: "Events, scrims and Discord-first updates." },
];

const SOCIAL_TILES = [
  { href: SOCIALS.discord, label: "Discord", handle: "Join the server", icon: FaDiscord },
  { href: SOCIALS.instagram, label: "Instagram", handle: "@gdesports25", icon: FaInstagram },
  { href: SOCIALS.x, label: "X", handle: "@GDESPORTS25", icon: FaXTwitter },
];

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.5, delay, ease: EASE },
});

function Stat({ value, label, live }) {
  return (
    <div className={`about-stat ${live ? "is-live" : ""}`}>
      <span className="about-stat__value">{value ?? "--"}</span>
      <span className="about-stat__label mono">{label}</span>
    </div>
  );
}

export default function AboutPage() {
  const { creators, staffDepartments } = useSiteContent();
  const discord = useDiscordStats();
  const staffCount = staffDepartments.reduce((n, d) => n + (d.members?.length || 0), 0);
  const games = PLAYER_GAMES.map((g) => g.label).join(" · ");

  return (
    <Page className="about-page">
      <section className="about-hero">
        <div className="about-hero__copy">
          <span className="eyebrow">About {SITE.name}</span>
          <h1 className="about-hero__title">
            Built to <span className="text-orange">compete.</span>
          </h1>
          <p className="about-hero__mission">
            We exist to compete seriously, develop talent properly and leave a mark that lasts.
          </p>
          <div className="row">
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary"
              onClick={() => track("discord_click", { source: "about_hero" })}
            >
              <FaDiscord aria-hidden="true" /> Join the Discord
            </a>
            <Link to="/creators" className="btn btn--ghost">
              Meet the creators
            </Link>
          </div>
        </div>

        <motion.aside className="about-card" {...reveal(0.1)}>
          <div className="about-card__head mono">
            <span>{SITE.tag} // Org file</span>
            <span className="text-orange">Active</span>
          </div>
          <div className="about-card__logo">
            <img src="/logo.png" alt={SITE.name} width="160" height="165" decoding="async" />
          </div>
          <dl className="about-card__rows">
            <div>
              <dt className="mono">Name</dt>
              <dd>{SITE.name}</dd>
            </div>
            <div>
              <dt className="mono">Tag</dt>
              <dd>{SITE.tag}</dd>
            </div>
            <div>
              <dt className="mono">Games</dt>
              <dd>{games}</dd>
            </div>
            <div>
              <dt className="mono">Motto</dt>
              <dd>{SITE.tagline}</dd>
            </div>
          </dl>
        </motion.aside>
      </section>

      <section className="about-stats">
        <Stat value={formatViewers(discord.members)} label="Discord members" />
        <Stat value={formatViewers(discord.online)} label="Online now" live={!!discord.online} />
        <Stat value={creators.length ? pad2(creators.length) : null} label="Creators" />
        <Stat value={staffCount ? pad2(staffCount) : null} label="Staff" />
      </section>

      <section className="about-manifesto" aria-label="Manifesto">
        {MANIFESTO.map((line, i) => (
          <motion.p key={line} className={i % 2 ? "is-dim" : ""} {...reveal(i * 0.06)}>
            {line}
          </motion.p>
        ))}
      </section>

      <section className="about-block">
        <div className="about-block__head">
          <span className="eyebrow">What we stand for</span>
          <h2 className="display display--md">Values</h2>
        </div>
        <ol className="about-pillars">
          {VALUES.map((v, i) => (
            <motion.li key={v.title} {...reveal(i * 0.06)}>
              <span className="about-pillars__num mono">{pad2(i + 1)}</span>
              <span className="about-pillars__title">{v.title}</span>
              <span className="about-pillars__desc muted">{v.desc}</span>
            </motion.li>
          ))}
        </ol>
      </section>

      <motion.section className="about-vision" {...reveal()}>
        <span className="about-vision__mark" aria-hidden="true">
          “
        </span>
        <span className="eyebrow">Vision</span>
        <blockquote>
          No shortcuts. No temporary hype. From roster construction to content, every call is made for long-term growth —
          an ecosystem where players improve, creators grow and competition is treated with respect.
        </blockquote>
      </motion.section>

      <section className="about-block">
        <div className="about-block__head">
          <span className="eyebrow">Roadmap</span>
          <h2 className="display display--md">What's next</h2>
        </div>
        <ol className="about-timeline">
          {NEXT.map((item, i) => (
            <motion.li key={item.title} {...reveal(i * 0.08)}>
              <span className="about-timeline__dot" aria-hidden="true" />
              <div className="about-timeline__body">
                <div className="about-timeline__top">
                  <span className="about-timeline__title">{item.title}</span>
                  <span className="tag tag--orange">{item.status}</span>
                </div>
                <p className="muted">{item.desc}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </section>

      <section className="about-block">
        <div className="about-block__head">
          <span className="eyebrow">Find us</span>
          <h2 className="display display--md">Follow the journey</h2>
        </div>
        <div className="about-socials">
          {SOCIAL_TILES.map(({ href, label, handle, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="about-social"
              onClick={() => track("social_click", { network: label, source: "about" })}
            >
              <Icon className="about-social__icon" aria-hidden="true" />
              <span>
                <span className="about-social__label">{label}</span>
                <span className="mono faint small">{handle}</span>
              </span>
              <FiArrowUpRight className="about-social__go" aria-hidden="true" />
            </a>
          ))}
        </div>
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
