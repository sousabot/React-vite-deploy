import React from "react";
import { motion } from "framer-motion";
import PageMotion from "../components/PageMotion.jsx";
import { Link } from "react-router-dom";
import { FaDiscord, FaExternalLinkAlt } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { DISCORD_INVITE } from "../data/links.js";
import { PLAYER_TEAMS } from "../data/players.js";

export default function Players() {
  const TEAMS = PLAYER_TEAMS;
  const ALL_PLAYERS = TEAMS.flatMap((t) => t.members);

  return (
    <PageMotion>
      <div className="gdPage">
        <header className="gdCastHead">
          <div className="gdCastHeadCopy">
            <h1 className="gdCastTitle">Players</h1>
            <p className="gdCastMeta muted">
              {ALL_PLAYERS.length} players · LPLOL
            </p>
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
              Tryouts
            </Link>
          </div>
        </header>

        {TEAMS.map((team) => (
          <section key={team.id} className="gdCastBlock">
            <div className="gdCastBlockHead">
              <h2 className="gdCastBlockTitle">{team.label}</h2>
              <span className="muted small">{team.members.length} on roster</span>
            </div>

            <div className="gdCastWall">
              {team.members.map((m, i) => (
                <motion.div
                  key={m.id}
                  className="gdCastTile"
                  style={{ "--ca": m.accent || "#ff7a00" }}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.35) }}
                >
                  {m.image ? (
                    <img src={m.image} alt={m.name} loading={i < 3 ? "eager" : "lazy"} />
                  ) : (
                    <span className="gdCastFallback">
                      {m.initials || m.name?.slice(0, 2)?.toUpperCase()}
                    </span>
                  )}
                  <span className="gdCastShade" aria-hidden="true" />
                  <span className="gdCastLive">{m.role}</span>
                  <span className="gdCastCaption">
                    <span className="gdCastName">{m.name}</span>
                    <span className="gdCastRole">{m.game || "GD Esports"}</span>
                  </span>

                  {(m.twitter || m.lolpros) && (
                    <div className="gdCastSocials">
                      {m.twitter && (
                        <a
                          href={m.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="gdCastSoc"
                          aria-label={`${m.name} on X`}
                        >
                          <FaXTwitter />
                        </a>
                      )}
                      {m.lolpros && (
                        <a
                          href={m.lolpros}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="gdCastSoc"
                          aria-label={`${m.name} on LoLPros`}
                        >
                          <FaExternalLinkAlt />
                        </a>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </section>
        ))}

        <section className="gdCastFooter">
          <p className="muted">Want to compete with GD?</p>
          <Link to="/work-with-us" className="btnGhost">
            Apply for tryouts
          </Link>
        </section>
      </div>
    </PageMotion>
  );
}
