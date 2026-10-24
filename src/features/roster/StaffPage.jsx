import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Page from "../../components/ui/Page.jsx";
import CtaBand from "../../components/ui/CtaBand.jsx";
import { useSiteContent } from "../../content/siteContent.js";
import { SITE } from "../../config/site.js";
import { initials, pad2 } from "../../lib/format.js";
import "./staff.css";

const EASE = [0.22, 1, 0.36, 1];

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.45, delay, ease: EASE },
});

function StaffPass({ member, dept, lead = false, delay = 0 }) {
  const tags = (member.tags || []).filter(Boolean).slice(0, 3);
  return (
    <motion.article
      className={`pass ${lead ? "pass--lead" : ""}`}
      style={{ "--accent": member.accent || "var(--orange)" }}
      {...reveal(delay)}
    >
      <div className="pass__strip mono">
        <span>
          {SITE.tag} staff{member.number ? ` · #${member.number}` : ""}
        </span>
        <span className="pass__slot" aria-hidden="true" />
      </div>
      <div className="pass__photo">
        {member.image ? (
          <img src={member.image} alt={member.name} loading="lazy" decoding="async" />
        ) : (
          <span className="pass__monogram">{initials(member.name)}</span>
        )}
      </div>
      <div className="pass__body">
        <span className="pass__dept mono">{dept}</span>
        <h3 className="pass__name">{member.name}</h3>
        <span className="pass__role">{member.role}</span>
        {tags.length > 0 && (
          <div className="pass__tags">
            {tags.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
      <span className="pass__bar" aria-hidden="true" />
    </motion.article>
  );
}

export default function StaffPage() {
  const { staffDepartments } = useSiteContent();
  const departments = staffDepartments.filter((d) => d.members?.length);
  const [top, ...branches] = departments;
  const total = departments.reduce((n, d) => n + d.members.length, 0);

  return (
    <Page className="staff-page">
      <header className="staff-top">
        <div>
          <span className="eyebrow">Behind the scenes</span>
          <h1 className="display display--lg">Staff</h1>
          <p className="lead">The people who run the org — management, coordination, development and coaching.</p>
        </div>
        <div className="staff-top__count">
          <span>
            <strong>{pad2(total)}</strong>
            <span className="mono faint">People</span>
          </span>
          <span>
            <strong>{pad2(departments.length)}</strong>
            <span className="mono faint">Departments</span>
          </span>
        </div>
      </header>

      {top && (
        <section className="org">
          <div className="org__tier">
            <div className="org__label mono">
              <span className="org__node" aria-hidden="true" />
              {top.label}
            </div>
            <div className="org__lead">
              {top.members.map((m, i) => (
                <StaffPass key={m.id} member={m} dept={top.label} lead delay={i * 0.06} />
              ))}
            </div>
          </div>

          {branches.length > 0 && (
            <div
              className={`org__branches ${branches.length <= 4 ? "is-row" : ""}`}
              style={{ "--n": Math.min(branches.length, 4) }}
            >
              {branches.map((dept, di) => (
                <div key={dept.id} className="org__branch">
                  <div className="org__label mono">
                    <span className="org__node" aria-hidden="true" />
                    {dept.label}
                    <span className="faint">{pad2(dept.members.length)}</span>
                  </div>
                  <div className="org__members">
                    {dept.members.map((m, i) => (
                      <StaffPass key={m.id} member={m} dept={dept.label} delay={di * 0.05 + i * 0.05} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <div className="page-cta">
        <CtaBand eyebrow="Join the team" title="Help run the org" sub="Coaches, analysts, managers, designers, moderators.">
          <Link to="/work-with-us" className="btn btn--primary">
            Work with us
          </Link>
        </CtaBand>
      </div>
    </Page>
  );
}
