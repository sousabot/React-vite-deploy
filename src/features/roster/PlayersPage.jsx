import React from "react";
import { Link } from "react-router-dom";
import { FaExternalLinkAlt } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Page from "../../components/ui/Page.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import RosterCard, { RosterSocials } from "../../components/ui/RosterCard.jsx";
import CtaBand from "../../components/ui/CtaBand.jsx";
import RosterGroup from "../../components/ui/RosterGroup.jsx";
import { PLAYER_TEAMS } from "../../content/players.js";
import { SITE } from "../../config/site.js";

export default function PlayersPage() {
  const total = PLAYER_TEAMS.reduce((n, t) => n + t.members.length, 0);

  return (
    <Page>
      <PageHeader
        eyebrow="The roster"
        title="Players"
        lead={`The squad carrying the ${SITE.name} name into ${SITE.league}.`}
        meta={[`${total} members`, SITE.league]}
      />

      {PLAYER_TEAMS.map((team) => (
        <RosterGroup key={team.id} label={team.label} count={team.members.length} noun="on roster">
          {team.members.map((m, i) => (
            <RosterCard
              key={m.id}
              index={i}
              name={m.name}
              role={m.role}
              sub={m.game}
              image={m.image}
              number={m.number}
              accent={m.accent}
              fallback={m.initials}
              badge={m.badge && <span className="tag tag--orange">{m.badge}</span>}
              socials={
                <RosterSocials
                  links={[
                    { href: m.twitter, label: `${m.name} on X`, icon: FaXTwitter },
                    { href: m.lolpros, label: `${m.name} on LoLPros`, icon: FaExternalLinkAlt },
                  ]}
                />
              }
            />
          ))}
        </RosterGroup>
      ))}

      <div className="page-cta">
        <CtaBand eyebrow="Tryouts" title="Think you've got it?" sub="We're always scouting. Apply and the team will review it.">
          <Link to="/work-with-us" className="btn btn--primary">
            Apply for tryouts
          </Link>
        </CtaBand>
      </div>
    </Page>
  );
}
