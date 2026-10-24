import React from "react";
import { Link } from "react-router-dom";
import Page from "../../components/ui/Page.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import RosterCard from "../../components/ui/RosterCard.jsx";
import CtaBand from "../../components/ui/CtaBand.jsx";
import RosterGroup from "../../components/ui/RosterGroup.jsx";
import { useSiteContent } from "../../content/siteContent.js";

export default function StaffPage() {
  const { staffDepartments } = useSiteContent();
  const total = staffDepartments.reduce((n, d) => n + d.members.length, 0);

  return (
    <Page>
      <PageHeader
        eyebrow="Behind the scenes"
        title="Staff"
        lead="The people who run the org Ã¢â‚¬â€ management, coordination, development and coaching."
        meta={[`${total} people`, `${staffDepartments.length} departments`]}
      />

      {staffDepartments.map((dept) => (
        <RosterGroup key={dept.id} label={dept.label} count={dept.members.length} noun="members">
          {dept.members.map((m, i) => (
            <RosterCard
              key={m.id}
              index={i}
              name={m.name}
              role={m.role}
              sub={m.game}
              image={m.image}
              accent={m.accent}
              fallback={m.initials}
            />
          ))}
        </RosterGroup>
      ))}

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
