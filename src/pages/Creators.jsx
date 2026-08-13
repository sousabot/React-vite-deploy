import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageMotion from "../components/PageMotion.jsx";
import { FaTwitch, FaInstagram, FaDiscord } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { DISCORD_INVITE } from "../data/links.js";
import { useSiteContent } from "../state/siteContent.js";

export default function Creators() {
  const { creators: CREATORS } = useSiteContent();
  const [liveMap, setLiveMap] = useState({});
  const [checked, setChecked] = useState(false);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const results = await Promise.all(
          CREATORS.map(async (c) => {
            try {
              const res = await fetch(
                `/.netlify/functions/twitch-live?user=${encodeURIComponent(c.twitchLogin)}&_=${Date.now()}`,
                { cache: "no-store" }
              );
              if (!res.ok) return [c.twitchLogin, false];
              const data = await res.json();
              return [c.twitchLogin, !!data?.isLive];
            } catch {
              return [c.twitchLogin, false];
            }
          })
        );
        if (cancelled) return;
        const next = {};
        for (const [login, isLive] of results) next[login] = isLive;
        setLiveMap(next);
        setChecked(true);
      } catch {
        if (!cancelled) setChecked(true);
      }
    }
    if (!CREATORS.length) return;
    poll();
    const t = setInterval(poll, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [CREATORS]);

  useEffect(() => {
    if (!modal) return;
    const fn = (e) => {
      if (e.key === "Escape") setModal(null);
    };
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [modal]);

  const ordered = useMemo(() => {
    return [...CREATORS].sort((a, b) => {
      const aLive = liveMap[a.twitchLogin] ? 1 : 0;
      const bLive = liveMap[b.twitchLogin] ? 1 : 0;
      if (aLive !== bLive) return bLive - aLive;
      return CREATORS.indexOf(a) - CREATORS.indexOf(b);
    });
  }, [CREATORS, liveMap]);

  const liveCount = Object.values(liveMap).filter(Boolean).length;
  const anyLive = checked && liveCount > 0;

  return (
    <PageMotion>
      <div className="gdPage">
        <header className="gdCastHead">
          <div className="gdCastHeadCopy">
            <h1 className="gdCastTitle">Creators</h1>
            <p className="gdCastMeta muted">
              {CREATORS.length} creators
              {" · "}
              {!checked
                ? "Checking live…"
                : anyLive
                  ? `${liveCount} live now`
                  : "Nobody live right now"}
            </p>
          </div>
          <div className="gdCastHeadActions">
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noopener noreferrer"
              className="btnPrimary"
            >
              <FaDiscord aria-hidden="true" />
              Discord
            </a>
            <Link to="/work-with-us" className="btnGhost">
              Apply
            </Link>
          </div>
        </header>

        <div className="gdCastWall">
          {ordered.map((c, i) => {
            const isLive = !!liveMap[c.twitchLogin];
            return (
              <motion.div
                key={c.id}
                className={`gdCastTile ${isLive ? "isLive" : ""}`}
                style={{ "--ca": c.accent || "#ff7a00" }}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.35) }}
              >
                <button
                  type="button"
                  className="gdCastTileHit"
                  onClick={() => setModal(c)}
                  aria-label={`Open ${c.name}`}
                >
                  {c.image ? (
                    <img src={c.image} alt={c.name} loading={i < 3 ? "eager" : "lazy"} />
                  ) : (
                    <span className="gdCastFallback">
                      {c.name?.slice(0, 2)?.toUpperCase() || "?"}
                    </span>
                  )}
                  <span className="gdCastShade" aria-hidden="true" />
                  {checked && (
                    <span className={`gdCastLive ${isLive ? "on" : ""}`}>
                      {isLive ? "Live" : "Offline"}
                    </span>
                  )}
                  <span className="gdCastCaption">
                    <span className="gdCastName">{c.name}</span>
                    <span className="gdCastRole">{c.role || c.game}</span>
                  </span>
                </button>

                <div className="gdCastSocials">
                  {c.twitch && (
                    <a
                      href={c.twitch}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gdCastSoc"
                      aria-label={`${c.name} on Twitch`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaTwitch />
                    </a>
                  )}
                  {c.instagram && (
                    <a
                      href={c.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gdCastSoc"
                      aria-label={`${c.name} on Instagram`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaInstagram />
                    </a>
                  )}
                  {c.twitter && (
                    <a
                      href={c.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gdCastSoc"
                      aria-label={`${c.name} on X`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaXTwitter />
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <section className="gdCastFooter">
          <p className="muted">Want to create with GD?</p>
          <Link to="/work-with-us" className="btnGhost">
            Apply as creator
          </Link>
        </section>

        <AnimatePresence>
          {modal && (
            <CreatorModal
              creator={modal}
              isLive={!!liveMap[modal.twitchLogin]}
              onClose={() => setModal(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </PageMotion>
  );
}

function CreatorModal({ creator: c, isLive, onClose }) {
  return (
    <>
      <motion.div
        className="cx3ModalBg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="cx3Modal"
        style={{ "--ca": c.accent, "--ca-rgb": c.accentRgb }}
        initial={{ opacity: 0, scale: 0.94, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="cx3ModalAccentBar" />
        <button type="button" className="cx3ModalClose btnIcon" onClick={onClose}>
          ✕
        </button>

        <div className="cx3ModalLayout">
          <div className="cx3ModalLeft">
            <div className="cx3ModalImg">
              <img src={c.image} alt={c.name} decoding="async" />
              <div className="cx3ModalImgGlow" />
            </div>
            <div className="cx3ModalStatusRow">
              {isLive ? (
                <span className="cx3Badge cx3BadgeLive">
                  <span className="cx3BadgePulse" />
                  LIVE NOW
                </span>
              ) : (
                <span className="cx3Badge cx3BadgeOff">OFFLINE</span>
              )}
            </div>
          </div>

          <div className="cx3ModalRight">
            <div className="cx3ModalHandle muted small">{c.handle}</div>
            <div className="cx3ModalName">{c.name}</div>
            <div className="cx3ModalSub muted">
              {c.role} · {c.game}
            </div>

            <div className="cx3CardTags" style={{ marginTop: 14, marginBottom: 0 }}>
              {(c.tags || []).map((t) => (
                <span key={t} className="cx3Tag">
                  {t}
                </span>
              ))}
            </div>

            {c.bio && <p className="cx3ModalBio">{c.bio}</p>}

            <div className="cx3ModalLinks">
              <a
                href={c.twitch}
                target="_blank"
                rel="noopener noreferrer"
                className="cx3ModalLink cx3ModalLinkTwitch"
              >
                <FaTwitch /> Watch on Twitch
              </a>
              {c.instagram && (
                <a
                  href={c.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cx3ModalLink"
                >
                  <FaInstagram /> Instagram
                </a>
              )}
              {c.twitter && (
                <a
                  href={c.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cx3ModalLink"
                >
                  <FaXTwitter /> X / Twitter
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
