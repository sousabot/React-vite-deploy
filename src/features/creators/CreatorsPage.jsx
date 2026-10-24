import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaTwitch } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Page from "../../components/ui/Page.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import RosterCard, { RosterSocials } from "../../components/ui/RosterCard.jsx";
import CtaBand from "../../components/ui/CtaBand.jsx";
import { useSiteContent } from "../../content/siteContent.js";
import { useTwitchLive } from "../../hooks/useTwitchLive.js";
import CreatorModal from "./CreatorModal.jsx";
import "./creators.css";

export default function CreatorsPage() {
  const { creators } = useSiteContent();
  const { streams, checked, live } = useTwitchLive(creators);
  const [open, setOpen] = useState(null);

  const ordered = useMemo(
    () => [...live, ...creators.filter((c) => !streams[c.twitchLogin]?.isLive)],
    [creators, live, streams]
  );

  return (
    <Page>
      <PageHeader
        eyebrow="Content team"
        title="Creators"
        lead="Streamers repping GD across League, CS2 and beyond. Live creators float to the top."
        meta={[
          `${creators.length} creators`,
          checked ? (live.length ? `${live.length} live now` : "Nobody live") : "Checking live…",
        ]}
      />

      <div className="roster-grid">
        {ordered.map((c, i) => {
          const isLive = !!streams[c.twitchLogin]?.isLive;
          return (
            <RosterCard
              key={c.id}
              index={i}
              name={c.name}
              role={c.role}
              sub={c.game?.trim()}
              image={c.image}
              accent={c.accent}
              onClick={() => setOpen(c)}
              badge={
                checked && (
                  <span className={`live-pill ${isLive ? "is-live" : ""}`}>
                    <span className="live-dot" />
                    {isLive ? "Live" : "Offline"}
                  </span>
                )
              }
              socials={
                <RosterSocials
                  links={[
                    { href: c.twitch, label: `${c.name} on Twitch`, icon: FaTwitch },
                    { href: c.instagram, label: `${c.name} on Instagram`, icon: FaInstagram },
                    { href: c.twitter, label: `${c.name} on X`, icon: FaXTwitter },
                  ]}
                />
              }
            />
          );
        })}
      </div>

      <div className="page-cta">
        <CtaBand eyebrow="Create with us" title="Stream under the GD banner" sub="Streamers, editors and short-form creators — tell us about your content.">
          <Link to="/work-with-us" className="btn btn--primary">
            Apply as creator
          </Link>
        </CtaBand>
      </div>

      <CreatorModal
        creator={open}
        stream={open ? streams[open.twitchLogin] : null}
        onClose={() => setOpen(null)}
      />
    </Page>
  );
}
