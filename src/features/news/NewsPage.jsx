import React from "react";
import { Link } from "react-router-dom";
import { FaDiscord, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Page from "../../components/ui/Page.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { useSiteContent } from "../../content/siteContent.js";
import { SITE, SOCIALS } from "../../config/site.js";
import { formatMatchDate } from "../../lib/format.js";

export default function NewsPage() {
  const { matches } = useSiteContent();
  const { lastMatch, nextMatch } = matches;
  const nextLabel = nextMatch.opponentTag || nextMatch.opponent;

  const updates = [
    {
      kicker: `${lastMatch.league} · Result`,
      title: `${SITE.tag} ${lastMatch.result === "W" ? "win" : "fall"} ${lastMatch.score} vs ${
        lastMatch.opponentTag || lastMatch.opponent
      }`,
      body: lastMatch.summary || lastMatch.competition,
      href: lastMatch.vodUrl || null,
    },
    nextLabel && {
      kicker: `${nextMatch.competition} · Up next`,
      title: `${SITE.tag} vs ${nextLabel}`,
      body: nextMatch.date ? formatMatchDate(nextMatch.date) : "Date to be announced — alerts go out in Discord.",
      to: "/",
    },
  ].filter(Boolean);

  return (
    <Page>
      <PageHeader
        eyebrow="Newsroom"
        title="News"
        lead="Results, announcements and roster moves. The full feed lives on our socials."
      />

      <div className="stack" style={{ "--stack": "14px" }}>
        {updates.map((u) => {
          const content = (
            <>
              <span className="eyebrow">{u.kicker}</span>
              <h2 className="display display--sm">{u.title}</h2>
              {u.body && <p className="muted">{u.body}</p>}
            </>
          );
          if (u.href) {
            return (
              <a key={u.title} className="panel panel--notch stack" href={u.href} target="_blank" rel="noopener noreferrer">
                {content}
              </a>
            );
          }
          if (u.to) {
            return (
              <Link key={u.title} className="panel panel--notch stack" to={u.to}>
                {content}
              </Link>
            );
          }
          return (
            <article key={u.title} className="panel panel--notch stack">
              {content}
            </article>
          );
        })}

        <div className="empty">
          <h2 className="display display--sm">More updates on socials</h2>
          <p className="muted">Announcements drop on Discord, X and Instagram first.</p>
          <div className="row" style={{ justifyContent: "center" }}>
            <a className="btn btn--primary btn--sm" href={SOCIALS.discord} target="_blank" rel="noopener noreferrer">
              <FaDiscord aria-hidden="true" /> Discord
            </a>
            <a className="btn btn--ghost btn--sm" href={SOCIALS.x} target="_blank" rel="noopener noreferrer">
              <FaXTwitter aria-hidden="true" /> X
            </a>
            <a className="btn btn--ghost btn--sm" href={SOCIALS.instagram} target="_blank" rel="noopener noreferrer">
              <FaInstagram aria-hidden="true" /> Instagram
            </a>
          </div>
        </div>
      </div>
    </Page>
  );
}
