import React from "react";
import { FaDiscord, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Page from "../../components/ui/Page.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { SOCIALS } from "../../config/site.js";

export default function NewsPage() {
  return (
    <Page>
      <PageHeader
        eyebrow="Newsroom"
        title="News"
        lead="Results, announcements and roster moves. The full feed lives on our socials."
      />

      <div className="empty">
        <h2 className="display display--sm">Updates live on our socials</h2>
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
    </Page>
  );
}
