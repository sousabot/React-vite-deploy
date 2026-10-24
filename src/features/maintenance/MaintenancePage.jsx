import React from "react";
import { FaDiscord, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Backdrop from "../../components/layout/Backdrop.jsx";
import { SITE, SOCIALS } from "../../config/site.js";
import "./maintenance.css";

export default function MaintenancePage() {
  return (
    <div className="site maintenance">
      <Backdrop />
      <main className="container maintenance__inner">
        <img className="maintenance__logo" src="/logo.png" alt={SITE.name} />
        <span className="eyebrow">Under maintenance</span>
        <h1 className="display display--xl">
          Something new
          <br />
          <span className="text-orange">is loading.</span>
        </h1>
        <p className="lead">
          The {SITE.name} site is offline while we rebuild it. Follow us for news and check back soon.
        </p>
        <div className="row" style={{ justifyContent: "center" }}>
          <a href={SOCIALS.discord} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
            <FaDiscord aria-hidden="true" /> Join Discord
          </a>
          <a href={SOCIALS.x} target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="X">
            <FaXTwitter />
          </a>
          <a href={SOCIALS.instagram} target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="Instagram">
            <FaInstagram />
          </a>
        </div>
      </main>
    </div>
  );
}
