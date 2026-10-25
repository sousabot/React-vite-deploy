import React from "react";
import { Link } from "react-router-dom";
import { FaDiscord, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Brand from "./Brand.jsx";
import NewsletterForm from "./NewsletterForm.jsx";
import { LEGAL_NAV, MORE_NAV, PRIMARY_NAV } from "../../config/nav.js";
import { SITE, SOCIALS } from "../../config/site.js";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__col">
          <Brand />
          <p className="muted" style={{ maxWidth: "38ch" }}>
            {SITE.tagline} Competitive League of Legends and CS2 rosters, creators and a community that shows up.
          </p>
          <div className="site-footer__heading" style={{ marginTop: 10 }}>
            Newsletter
          </div>
          <NewsletterForm />
        </div>

        <div className="site-footer__col">
          <div className="site-footer__heading">Explore</div>
          <ul className="site-footer__links">
            {[...PRIMARY_NAV, ...MORE_NAV].map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="site-footer__col">
          <div className="site-footer__heading">Community</div>
          <div className="site-footer__socials">
            <a className="icon-btn" href={SOCIALS.discord} target="_blank" rel="noopener noreferrer" aria-label="Discord">
              <FaDiscord />
            </a>
            <a className="icon-btn" href={SOCIALS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a className="icon-btn" href={SOCIALS.x} target="_blank" rel="noopener noreferrer" aria-label="X">
              <FaXTwitter />
            </a>
          </div>
          <div className="site-footer__heading" style={{ marginTop: 14 }}>
            Contact
          </div>
          <a className="muted" href={`mailto:${SITE.email}`}>
            {SITE.email}
          </a>
        </div>
      </div>

      <div className="container" aria-hidden="true">
        <div className="site-footer__word">{SITE.name}</div>
      </div>

      <div className="container site-footer__bar">
        <span>
          © {new Date().getFullYear()} {SITE.name} · Made by {SITE.credit}
        </span>
        <nav aria-label="Legal">
          {LEGAL_NAV.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
