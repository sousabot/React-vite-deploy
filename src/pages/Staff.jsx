import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import PageMotion from "../components/PageMotion.jsx";
import { Link } from "react-router-dom";
import { DISCORD_INVITE } from "../data/links.js";
import { useSiteContent } from "../state/siteContent.js";

export default function Staff() {
  const { staffDepartments: DEPARTMENTS } = useSiteContent();
  const ALL_MEMBERS = DEPARTMENTS.flatMap((d) => d.members);

  return (
    <PageMotion>
      <div className="cx3Page">

        {/* ─── HERO ─────────────────────────────────── */}
        <div className="cx3Hero">
          <div className="cx3HeroBg" aria-hidden="true">
            <div className="cx3HeroBgGrad" />
            <div className="cx3HeroBgGrid" />
          </div>

          <div className="cx3HeroBody">
            <motion.div
              className="cx3HeroLeft"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="cx3HeroKicker">
                <span className="cx3KickerDot" aria-hidden="true" />
                GD ESPORTS · STAFF
              </div>

              <h1 className="cx3HeroTitle">
                The people<br />
                <em className="cx3HeroTitleAccent">running the org.</em>
              </h1>

              <p className="cx3HeroDesc muted">
                Behind every roster, every drop, and every decision — meet the team keeping GD Esports moving.
              </p>

              <div className="cx3HeroActions">
                <a
                  href={DISCORD_INVITE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btnPrimary"
                >
                  Join our Discord
                </a>
                <Link to="/partners" className="btnGhost">
                  Partners
                </Link>
                <Link to="/work-with-us" className="btnGhost">
                  Work with us
                </Link>
              </div>
            </motion.div>

            {/* ─── RIGHT PANEL ── */}
            <motion.div
              className="cx3HeroRight"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
            >
              <div className="cx3LivePanel">
                <div className="cx3LivePanelHeader">
                  <span className="cx3LivePanelTitle">Staff Overview</span>
                  <div className="cx3LiveIndicator on">
                    <span className="cx3LiveDot" />
                    {ALL_MEMBERS.length} Members
                  </div>
                </div>

                <div className="cx3LiveList">
                  {DEPARTMENTS.map((dept) => (
                    <div key={dept.id} className="cx3LiveRow" style={{ cursor: "default" }}>
                      <div className="cx3LiveRowInfo">
                        <div className="cx3LiveRowName">
                          <span style={{ marginRight: 6 }}>{dept.icon}</span>
                          {dept.label}
                        </div>
                        <div className="cx3LiveRowSub muted small">
                          {dept.members.map((m) => m.name).join(", ")}
                        </div>
                      </div>
                      <div className="cx3LiveRowStatus on" style={{ fontSize: 13 }}>
                        {dept.members.length}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cx3LivePanelFoot muted small">
                  GD Esports official staff roster
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ─── DEPARTMENTS ────────────────────────────── */}
        {DEPARTMENTS.map((dept) => (
          <div key={dept.id} className="cx3Section">
            <div className="cx3Divider">
              <span className="cx3DividerLine" />
              <span className="cx3DividerLabel muted small">
                {dept.icon} {dept.label}
              </span>
              <span className="cx3DividerLine" />
            </div>

            <div className="cx3Cards">
              {dept.members.map((member, i) => (
                <StaffCard key={member.id} member={member} index={i} />
              ))}
            </div>
          </div>
        ))}

        {/* ─── BANNER ──────────────────────────────── */}
        <motion.div
          className="cx3Banner"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="cx3BannerGlow" aria-hidden="true" />
          <div className="cx3BannerInner">
            <div>
              <div className="cx3BannerTitle">Want to be part of this?</div>
              <div className="cx3BannerSub muted">
                We're growing. Apply to join GD as a player, creator, or staff member.
              </div>
            </div>
            <div className="cx3BannerActions">
              <Link to="/work-with-us" className="btnPrimary">Apply now</Link>
              <a
                href={DISCORD_INVITE}
                target="_blank"
                rel="noopener noreferrer"
                className="btnGhost"
              >
                Discord
              </a>
            </div>
          </div>
        </motion.div>

      </div>
    </PageMotion>
  );
}

/* ─── STAFF CARD ─────────────────────────────────────── */

function StaffCard({ member: m, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      className="cx3Card"
      style={{ "--ca": m.accent, "--ca-rgb": m.accentRgb }}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
    >
      <div className="cx3CardNumber" aria-hidden="true">{m.number}</div>

      {/* ── Photo / Initials ── */}
      <div className="cx3CardImg" style={{ cursor: "default" }}>
        {m.image && (
          <img
            src={m.image}
            alt={m.name}
            loading="lazy"
            style={{ display: "block" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fallback = e.currentTarget.parentElement.querySelector(".staffInitialsWrap");
              if (fallback) fallback.style.display = "flex";
            }}
          />
        )}

        {/* Initials fallback */}
        <div
          className="staffInitialsWrap"
          style={{ display: m.image ? "none" : "flex" }}
        >
          <span className="staffInitials" style={{ color: m.accent }}>
            {m.initials}
          </span>
        </div>

        <div className="cx3CardImgFade" />
        <div className="cx3CardImgGlow" />

        <div className="cx3CardBadge">
          <span
            className="cx3Badge"
            style={{
              background: `rgba(${m.accentRgb},0.15)`,
              color: m.accent,
              border: `1px solid ${m.accent}55`,
              fontWeight: 700,
              letterSpacing: ".1em",
              fontSize: 10,
            }}
          >
            STAFF
          </span>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="cx3CardInfo">
        <div className="cx3CardHead">
          <div>
            <div className="cx3CardName">{m.name}</div>
            <div className="cx3CardRole muted small">{m.role}</div>
            {m.game && (
              <div
                className="muted"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".06em",
                  marginTop: 3,
                  color: m.accent,
                  opacity: 0.8,
                }}
              >
                {m.game.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {m.tags?.length > 0 && (
          <div className="cx3CardTags">
            {m.tags.map((t) => (
              <span key={t} className="cx3Tag">{t}</span>
            ))}
          </div>
        )}

        <div className="cx3CardRule" />

        <div className="cx3CardSocials">
          <span
            className="muted small"
            style={{ fontWeight: 700, letterSpacing: ".08em", fontSize: 11 }}
          >
            GD ESPORTS STAFF
          </span>
        </div>
      </div>
    </motion.div>
  );
}