import React from "react";
import { motion } from "framer-motion";
import PageMotion from "../components/PageMotion.jsx";
import { Link } from "react-router-dom";
import { FaDiscord } from "react-icons/fa";
import { DISCORD_INVITE } from "../data/links.js";
import { useSiteContent } from "../state/siteContent.js";

export default function Staff() {
  const { staffDepartments: DEPARTMENTS } = useSiteContent();
  const ALL_MEMBERS = DEPARTMENTS.flatMap((d) => d.members);

  return (
    <PageMotion>
      <div className="gdPage">
        <header className="gdCastHead">
          <div className="gdCastHeadCopy">
            <h1 className="gdCastTitle">Staff</h1>
            <p className="gdCastMeta muted">
              {ALL_MEMBERS.length} people · {DEPARTMENTS.length} departments
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
              Apply
            </Link>
          </div>
        </header>

        {DEPARTMENTS.map((dept) => (
          <section key={dept.id} className="gdCastBlock">
            <div className="gdCastBlockHead">
              <h2 className="gdCastBlockTitle">{dept.label}</h2>
              <span className="muted small">{dept.members.length} members</span>
            </div>

            <div className="gdCastWall">
              {dept.members.map((m, i) => (
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
                  <span className="gdCastCaption">
                    <span className="gdCastName">{m.name}</span>
                    <span className="gdCastRole">{m.role}</span>
                  </span>
                </motion.div>
              ))}
            </div>
          </section>
        ))}

        <section className="gdCastFooter">
          <p className="muted">Want to help run the org?</p>
          <Link to="/work-with-us" className="btnGhost">
            Work with us
          </Link>
        </section>
      </div>
    </PageMotion>
  );
}
