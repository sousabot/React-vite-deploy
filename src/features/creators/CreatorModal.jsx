import React, { useState } from "react";
import { FaInstagram, FaTwitch } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Modal from "../../components/ui/Modal.jsx";
import { formatViewers } from "../../lib/format.js";

export default function CreatorModal({ creator, stream, onClose }) {
  // Keep the last creator rendered so the exit animation has content.
  const [c, setShown] = useState(creator);
  if (creator && creator !== c) setShown(creator);

  const isLive = !!stream?.isLive;
  const viewers = formatViewers(stream?.viewerCount);

  return (
    <Modal open={!!creator} onClose={onClose} title={c?.handle || c?.name} wide>
      {c && (
        <div className="creator-profile" style={{ "--accent": c.accent || "var(--orange)" }}>
          <div className="creator-profile__img">
            {c.image && <img src={c.image} alt={c.name} decoding="async" />}
          </div>
          <div className="creator-profile__info">
            <span className={`live-pill ${isLive ? "is-live" : ""}`}>
              <span className="live-dot" />
              {isLive ? `Live${viewers ? ` · ${viewers} watching` : ""}` : "Offline"}
            </span>
            <h2 className="display display--lg">{c.name}</h2>
            <p className="muted">
              {c.role} · {c.game?.trim()}
            </p>
            {isLive && stream.title && <p className="creator-profile__title">“{stream.title}”</p>}
            {c.tags?.length > 0 && (
              <div className="chip-row">
                {c.tags.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
            )}
            {c.bio && <p className="muted">{c.bio}</p>}
            <div className="row">
              <a href={c.twitch} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
                <FaTwitch aria-hidden="true" /> {isLive ? "Watch live" : "Twitch"}
              </a>
              {c.instagram && (
                <a href={c.instagram} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
                  <FaInstagram aria-hidden="true" /> Instagram
                </a>
              )}
              {c.twitter && (
                <a href={c.twitter} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
                  <FaXTwitter aria-hidden="true" /> X
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
