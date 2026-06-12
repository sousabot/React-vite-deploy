import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import PageMotion from "../components/PageMotion.jsx";
import { DISCORD_INVITE } from "../data/links.js";
import { useSiteContent } from "../state/siteContent.js";

export default function Partners() {
  const { partnerGroups: PARTNER_GROUPS } = useSiteContent();
  const ALL_PARTNERS = PARTNER_GROUPS.flatMap((g) => g.partners);
  const HAS_PARTNERS = ALL_PARTNERS.length > 0;

  return (
    <PageMotion>
      <div className="cx3Page">

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
                GD ESPORTS · PARTNERSHIPS
              </div>

              <h1 className="cx3HeroTitle">
                Built with<br />
                <em className="cx3HeroTitleAccent">great partners.</em>
              </h1>

              <p className="cx3HeroDesc muted">
                Brands, leagues, and communities that help us compete, create, and grow the GD Esports ecosystem.
              </p>

              <div className="cx3HeroActions">
                <Link to="/work-with-us" className="btnPrimary">
                  Become a partner
                </Link>
                <a
                  href={DISCORD_INVITE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btnGhost"
                >
                  Join Discord
                </a>
              </div>
            </motion.div>

            <motion.div
              className="cx3HeroRight"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
            >
              <div className="cx3LivePanel">
                <div className="cx3LivePanelHeader">
                  <span className="cx3LivePanelTitle">Partnership overview</span>
                  <div className="cx3LiveIndicator on">
                    <span className="cx3LiveDot" />
                    {HAS_PARTNERS ? `${ALL_PARTNERS.length} Active` : "Growing"}
                  </div>
                </div>

                <div className="cx3LiveList">
                  {PARTNER_GROUPS.map((group) => (
                    <div key={group.id} className="cx3LiveRow" style={{ cursor: "default" }}>
                      <div className="cx3LiveRowInfo">
                        <div className="cx3LiveRowName">
                          <span style={{ marginRight: 6 }}>{group.icon}</span>
                          {group.label}
                        </div>
                        <div className="cx3LiveRowSub muted small">
                          {group.partners.length > 0
                            ? group.partners.map((p) => p.name).join(", ")
                            : "Partners coming soon"}
                        </div>
                      </div>
                      <div className="cx3LiveRowStatus on" style={{ fontSize: 13 }}>
                        {group.partners.length}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cx3LivePanelFoot muted small">
                  Interested in partnering? Apply via Work With Us.
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {!HAS_PARTNERS && (
          <motion.div
            className="partnersEmpty"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="partnersEmptyIcon" aria-hidden="true">
              🤝
            </div>
            <h2 className="partnersEmptyTitle">Partner roster updating</h2>
            <p className="partnersEmptyDesc muted">
              Our official partners will be listed here soon. Want to collaborate with GD Esports?
            </p>
            <Link to="/work-with-us" className="btnPrimary">
              Partner with GD Esports
            </Link>
          </motion.div>
        )}

        {PARTNER_GROUPS.map((group) =>
          group.partners.length > 0 ? (
            <div key={group.id} className="cx3Section">
              <div className="cx3Divider">
                <span className="cx3DividerLine" />
                <span className="cx3DividerLabel muted small">
                  {group.icon} {group.label}
                </span>
                <span className="cx3DividerLine" />
              </div>

              <div className="cx3Cards">
                {group.partners.map((partner, i) => (
                  <PartnerCard key={partner.id} partner={partner} index={i} />
                ))}
              </div>
            </div>
          ) : null
        )}

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
              <div className="cx3BannerTitle">Want to partner with GD?</div>
              <div className="cx3BannerSub muted">
                Sponsorships, event collabs, product integrations, and more — tell us what you have in mind.
              </div>
            </div>
            <div className="cx3BannerActions">
              <Link to="/work-with-us" className="btnPrimary">
                Work with us
              </Link>
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

function PartnerCard({ partner: p, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  const CardWrap = p.website ? "a" : "div";
  const cardProps = p.website
    ? {
        href: p.website,
        target: "_blank",
        rel: "noopener noreferrer",
        "aria-label": `Visit ${p.name}`,
      }
    : {};

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
    >
      <CardWrap
        className={`cx3Card partnerCard ${p.website ? "partnerCardLink" : ""}`}
        style={{ "--ca": p.accent, "--ca-rgb": p.accentRgb }}
        {...cardProps}
      >
        <div className="cx3CardNumber" aria-hidden="true">
          {p.number}
        </div>

        <div className="cx3CardImg partnerCardImg">
          {p.logo ? (
            <img
              src={p.logo}
              alt={`${p.name} logo`}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.parentElement.querySelector(".partnerInitialsWrap");
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}

          <div
            className="partnerInitialsWrap staffInitialsWrap"
            style={{ display: p.logo ? "none" : "flex" }}
          >
            <span className="staffInitials" style={{ color: p.accent }}>
              {(p.name || "?").slice(0, 2).toUpperCase()}
            </span>
          </div>

          <div className="cx3CardImgFade" />
          <div className="cx3CardImgGlow" />

          <div className="cx3CardBadge">
            <span
              className="cx3Badge"
              style={{
                background: `rgba(${p.accentRgb},0.15)`,
                color: p.accent,
                border: `1px solid ${p.accent}55`,
                fontWeight: 700,
                letterSpacing: ".1em",
                fontSize: 10,
              }}
            >
              PARTNER
            </span>
          </div>
        </div>

        <div className="cx3CardInfo">
          <div className="cx3CardHead">
            <div>
              <div className="cx3CardName">{p.name}</div>
              <div className="cx3CardRole muted small">{p.role}</div>
            </div>
          </div>

          {p.description && (
            <p className="partnerCardDesc muted small">{p.description}</p>
          )}

          {p.tags?.length > 0 && (
            <div className="cx3CardTags">
              {p.tags.map((t) => (
                <span key={t} className="cx3Tag">
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="cx3CardRule" />

          <div className="cx3CardSocials">
            {p.website ? (
              <span className="partnerCardLinkLabel muted small">Visit website →</span>
            ) : (
              <span className="muted small" style={{ fontWeight: 700, letterSpacing: ".08em", fontSize: 11 }}>
                GD ESPORTS PARTNER
              </span>
            )}
          </div>
        </div>
      </CardWrap>
    </motion.div>
  );
}
