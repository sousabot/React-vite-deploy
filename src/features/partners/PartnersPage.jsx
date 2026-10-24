import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import Page from "../../components/ui/Page.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import CtaBand from "../../components/ui/CtaBand.jsx";
import RosterGroup from "../../components/ui/RosterGroup.jsx";
import { useSiteContent } from "../../content/siteContent.js";
import { DISCORD_INVITE } from "../../config/site.js";
import { initials } from "../../lib/format.js";
import "./partners.css";

function PartnerCard({ partner: p, index }) {
  const Wrap = p.website ? "a" : "div";
  const linkProps = p.website
    ? { href: p.website, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Wrap className="partner-card" style={{ "--accent": p.accent || "var(--orange)" }} {...linkProps}>
        <div className="partner-card__logo">
          {p.logo ? <img src={p.logo} alt={`${p.name} logo`} loading="lazy" /> : <span>{initials(p.name)}</span>}
        </div>
        <div className="partner-card__body">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="mono faint">#{p.number}</span>
            <span className="tag tag--orange">{p.role || "Partner"}</span>
          </div>
          <h3 className="display display--sm">{p.name}</h3>
          {p.description && <p className="muted small">{p.description}</p>}
          {p.tags?.length > 0 && (
            <div className="chip-row">
              {p.tags.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div>
          )}
          {p.website && (
            <span className="partner-card__link mono">
              Visit website <FiArrowUpRight aria-hidden="true" />
            </span>
          )}
        </div>
      </Wrap>
    </motion.div>
  );
}

export default function PartnersPage() {
  const { partnerGroups } = useSiteContent();
  const total = partnerGroups.reduce((n, g) => n + g.partners.length, 0);
  const groups = partnerGroups.filter((g) => g.partners.length > 0);

  return (
    <Page>
      <PageHeader
        eyebrow="Partnerships"
        title="Our"
        accent="partners."
        lead="Brands, leagues and communities that help us compete, create and grow."
        meta={[`${total} active`, `${partnerGroups.length} categories`]}
        actions={
          <Link to="/work-with-us?role=sponsor" className="btn btn--primary">
            Become a partner
          </Link>
        }
      />

      {groups.length === 0 ? (
        <div className="empty">
          <h2 className="display display--sm">Partner roster updating</h2>
          <p className="muted">Official partners will be listed here soon.</p>
        </div>
      ) : (
        groups.map((group) => (
          <RosterGroup key={group.id} label={group.label} count={group.partners.length} noun="partners">
            {group.partners.map((p, i) => (
              <PartnerCard key={p.id} partner={p} index={i} />
            ))}
          </RosterGroup>
        ))
      )}

      <div className="page-cta">
        <CtaBand
          eyebrow="Work with GD"
          title="Let's build something"
          sub="Sponsorships, event collabs, product integrations — tell us what you have in mind."
        >
          <Link to="/work-with-us?role=sponsor" className="btn btn--primary">
            Pitch us
          </Link>
          <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
            Discord
          </a>
        </CtaBand>
      </div>
    </Page>
  );
}
