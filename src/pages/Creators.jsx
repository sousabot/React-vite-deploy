import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import PageMotion from "../components/PageMotion.jsx";
import { FaTwitch, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

/* ─── DATA ───────────────────────────────────────────── */

const CREATORS = [
  {
    id: "mewtzu",
    name: "Mewtzu",
    handle: "@mewtzu_",
    role: "Streamer · Mid Lane",
    game: "League of Legends",
    twitch: "https://www.twitch.tv/mewtzu",
    twitchLogin: "mewtzu",
    instagram: "https://www.instagram.com/mewtzu",
    twitter: "https://x.com/mewtzu_",
    image: "/creators/mewtzu.png",
    accent: "#ff7a00",
    accentRgb: "255,122,0",
    bio: "High-elo mid laner and full-time GD content creator. Known for calculated plays and clean mechanics on stream.",
    tags: ["Mid Lane", "High Elo", "Live Daily"],
    number: "01",
  },
  {
    id: "kaymael",
    name: "kaymael",
    handle: "@kaymael",
    role: "Streamer · Flex",
    game: "League of Legends",
    twitch: "https://www.twitch.tv/kaymael",
    twitchLogin: "kaymael",
    instagram: "https://www.instagram.com/samirawashere/",
    image: "/creators/kaymael.png",
    accent: "#ffb000",
    accentRgb: "255,176,0",
    bio: "Energy and entertainment every session. Bringing the community together with big plays and even bigger reactions.",
    tags: ["Flex", "Entertainment", "Community"],
    number: "02",
  },
  {
    id: "apheliom13",
    name: "apheliom13",
    handle: "@f_martins1308", 
    role: "Streamer · Bot Lane",
    game: "League of Legends",
    twitch: "https://www.twitch.tv/apheliom13",
    twitchLogin: "apheliom13",
    instagram: "https://www.instagram.com/f_martins13/",
    twitter: "https://x.com/f_martins1308",
    image: "/creators/apheliom13.png",
    accent: "#e85d3a",
    accentRgb: "232,93,58",
    bio: "Consistent ranked grinder and ADC main. Precision, patience, and results — every stream, every game.",
    tags: ["Bot Lane", "ADC", "Ranked"],
    number: "03",
  },
];

/* ─── PAGE ────────────────────────────────────────────── */

export default function Creators() {
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
            } catch { return [c.twitchLogin, false]; }
          })
        );
        if (cancelled) return;
        const next = {};
        for (const [login, isLive] of results) next[login] = isLive;
        setLiveMap(next);
        setChecked(true);
      } catch { if (!cancelled) setChecked(true); }
    }
    poll();
    const t = setInterval(poll, 60_000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  useEffect(() => {
    if (!modal) return;
    const fn = (e) => { if (e.key === "Escape") setModal(null); };
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, [modal]);

  const liveCount = Object.values(liveMap).filter(Boolean).length;
  const anyLive = checked && liveCount > 0;

  return (
    <PageMotion>
      <div className="cx3Page">

        {/* ─── HERO ─────────────────────────────────── */}
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
                GD ESPORTS · CREATORS
              </div>

              <h1 className="cx3HeroTitle">
                The faces<br />
                <em className="cx3HeroTitleAccent">behind the stream.</em>
              </h1>

              <p className="cx3HeroDesc muted">
                Three creators. One org. Building the brand live — every session, every clip, every win.
              </p>

              <div className="cx3HeroActions">
                <a href="https://discord.gg/5fZ7UEnnzn" target="_blank" rel="noopener noreferrer" className="btnPrimary">
                  Join our Discord
                </a>
                <a href="/work-with-us" className="btnGhost">Apply as creator</a>
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
                  <span className="cx3LivePanelTitle">Creator Status</span>
                  <div className={`cx3LiveIndicator ${anyLive ? "on" : ""}`}>
                    <span className="cx3LiveDot" />
                    {!checked ? "Checking…" : anyLive ? `${liveCount} Live` : "All Offline"}
                  </div>
                </div>

                <div className="cx3LiveList">
                  {CREATORS.map((c) => {
                    const isLive = !!liveMap[c.twitchLogin];
                    return (
                      <a
                        key={c.id}
                        href={c.twitch}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`cx3LiveRow ${isLive ? "live" : ""}`}
                        style={{ "--ca": c.accent }}
                      >
                        <div className="cx3LiveRowImg">
                          <img src={c.image} alt={c.name} />
                          {isLive && <span className="cx3LiveRowDot" />}
                        </div>
                        <div className="cx3LiveRowInfo">
                          <div className="cx3LiveRowName">{c.name}</div>
                          <div className="cx3LiveRowSub muted small">{c.role}</div>
                        </div>
                        <div className={`cx3LiveRowStatus ${isLive ? "on" : ""}`}>
                          {!checked ? "–" : isLive ? "LIVE" : "OFFLINE"}
                        </div>
                      </a>
                    );
                  })}
                </div>

                <div className="cx3LivePanelFoot muted small">
                  Updates every 60s · Powered by Twitch API
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ─── CARDS ─────────────────────────────────── */}
        <div className="cx3Section">
          <div className="cx3Divider">
            <span className="cx3DividerLine" />
            <span className="cx3DividerLabel muted small">Our Creators</span>
            <span className="cx3DividerLine" />
          </div>

          <div className="cx3Cards">
            {CREATORS.map((c, i) => (
              <CreatorCard
                key={c.id}
                creator={c}
                index={i}
                isLive={!!liveMap[c.twitchLogin]}
                checked={checked}
                onOpen={() => setModal(c)}
              />
            ))}
          </div>
        </div>

        {/* ─── BANNER ──────────────────────────────── */}
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
              <div className="cx3BannerTitle">Think you belong here?</div>
              <div className="cx3BannerSub muted">We're growing. Apply to join GD as a creator, player, or staff.</div>
            </div>
            <div className="cx3BannerActions">
              <a href="/work-with-us" className="btnPrimary">Apply now</a>
              <a href="https://discord.gg/5fZ7UEnnzn" target="_blank" rel="noopener noreferrer" className="btnGhost">Discord</a>
            </div>
          </div>
        </motion.div>

        {/* ─── MODAL ──────────────────────────────── */}
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

/* ─── CREATOR CARD ────────────────────────────────────── */

function CreatorCard({ creator: c, index, isLive, checked, onOpen }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      className={`cx3Card ${isLive ? "cx3CardLive" : ""}`}
      style={{ "--ca": c.accent, "--ca-rgb": c.accentRgb }}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
    >
      <div className="cx3CardNumber" aria-hidden="true">{c.number}</div>

      {/* image */}
      <div className="cx3CardImg" onClick={onOpen}>
        <img src={c.image} alt={c.name} loading="lazy" />
        <div className="cx3CardImgFade" />
        <div className="cx3CardImgGlow" />

        <div className="cx3CardBadge">
          {!checked ? (
            <span className="cx3Badge cx3BadgeWait">···</span>
          ) : isLive ? (
            <span className="cx3Badge cx3BadgeLive">
              <span className="cx3BadgePulse" />
              LIVE
            </span>
          ) : (
            <span className="cx3Badge cx3BadgeOff">OFFLINE</span>
          )}
        </div>

        <a
          className="cx3WatchOverlay"
          href={c.twitch}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          <FaTwitch className="cx3WatchIcon" />
          <span>Watch on Twitch</span>
        </a>
      </div>

      {/* info */}
      <div className="cx3CardInfo">
        <div className="cx3CardHead">
          <div>
            <div className="cx3CardName">{c.name}</div>
            <div className="cx3CardRole muted small">{c.role}</div>
          </div>
          <button className="cx3ExpandBtn" onClick={onOpen} aria-label={`Open ${c.name}`}>↗</button>
        </div>

        <div className="cx3CardTags">
          {c.tags.map((t) => <span key={t} className="cx3Tag">{t}</span>)}
        </div>

        <div className="cx3CardRule" />

        <div className="cx3CardSocials">
          <a href={c.twitch} target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()} className="cx3Soc cx3SocTwitch" aria-label="Twitch">
            <FaTwitch />
          </a>
          {c.instagram && (
            <a href={c.instagram} target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()} className="cx3Soc cx3SocIG" aria-label="Instagram">
              <FaInstagram />
            </a>
          )}
          {c.twitter && (
            <a href={c.twitter} target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()} className="cx3Soc cx3SocX" aria-label="X">
              <FaXTwitter />
            </a>
          )}
          <button className="cx3CardMore muted small" onClick={onOpen}>View profile →</button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── CREATOR MODAL ───────────────────────────────────── */

function CreatorModal({ creator: c, isLive, onClose }) {
  return (
    <>
      <motion.div
        className="cx3ModalBg"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
        <button className="cx3ModalClose btnIcon" onClick={onClose}>✕</button>

        <div className="cx3ModalLayout">
          <div className="cx3ModalLeft">
            <div className="cx3ModalImg">
              <img src={c.image} alt={c.name} />
              <div className="cx3ModalImgGlow" />
            </div>
            <div className="cx3ModalStatusRow">
              {isLive ? (
                <span className="cx3Badge cx3BadgeLive"><span className="cx3BadgePulse" />LIVE NOW</span>
              ) : (
                <span className="cx3Badge cx3BadgeOff">OFFLINE</span>
              )}
            </div>
          </div>

          <div className="cx3ModalRight">
            <div className="cx3ModalHandle muted small">{c.handle}</div>
            <div className="cx3ModalName">{c.name}</div>
            <div className="cx3ModalSub muted">{c.role} · {c.game}</div>

            <div className="cx3CardTags" style={{ marginTop: 14, marginBottom: 0 }}>
              {c.tags.map((t) => <span key={t} className="cx3Tag">{t}</span>)}
            </div>

            <p className="cx3ModalBio">{c.bio}</p>

            <div className="cx3ModalLinks">
              <a href={c.twitch} target="_blank" rel="noopener noreferrer" className="cx3ModalLink cx3ModalLinkTwitch">
                <FaTwitch /> Watch on Twitch
              </a>
              {c.instagram && (
                <a href={c.instagram} target="_blank" rel="noopener noreferrer" className="cx3ModalLink">
                  <FaInstagram /> Instagram
                </a>
              )}
              {c.twitter && (
                <a href={c.twitter} target="_blank" rel="noopener noreferrer" className="cx3ModalLink">
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