import React from "react";
import ParticlesBackground from "../components/ParticlesBackground.jsx";
import { DISCORD_INVITE } from "../data/links.js";

export default function Maintenance() {
  return (
    <div className="appShell">
      <div className="bgStack">
        <div className="bgGradientAnimated" />
        <ParticlesBackground density={18} />
        <div className="bgVignette" />
      </div>

      <div className="uiLayer">
        <main className="content">
          <div className="homeMaintenance homeMaintenance--site">
            <div className="homeMaintenanceCard">
              <img
                src="/logo.png"
                alt="GD Esports"
                className="homeMaintenanceLogo"
                loading="eager"
              />

              <div className="cx3HeroKicker">
                <span className="cx3KickerDot" aria-hidden="true" />
                Under maintenance
              </div>

              <h1 className="homeMaintenanceTitle">
                GD Esports is
                <br />
                <span className="accentText">under maintenance.</span>
              </h1>

              <p className="homeMaintenanceDesc">
                The full website is temporarily offline while we update it. Follow us on Discord for news, and check back soon.
              </p>

              <div className="heroCTA">
                <a
                  href={DISCORD_INVITE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btnPrimary"
                >
                  Join Discord
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
