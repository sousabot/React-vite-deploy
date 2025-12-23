import React, { useEffect, useState } from "react";
import PageMotion from "../components/PageMotion.jsx";
import { FaTwitch, FaInstagram, FaXTwitter } from "react-icons/fa6";

const CREATORS = [
  {
    name: "mewtzu",
    role: "Streamer",
    platform: "Twitch",
    twitch: "https://www.twitch.tv/mewtzu",
    twitchLogin: "mewtzu",

    instagram: "https://www.instagram.com/mewtzu",
    twitter: "https://x.com/mewtzu_",

    image: "/creators/mewtzu.png",
  },

  // ✅ NEW CREATOR
  {
    name: "kaymael",
    role: "Content Creator",
    platform: "Twitch",
    twitch: "https://www.twitch.tv/kaymael",
    twitchLogin: "kaymael",

    instagram: "https://www.instagram.com/samirawashere",

    image: "/creators/kaymael.png",
  },
];


export default function Creators() {
  const [liveMap, setLiveMap] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function loadLive() {
      const results = await Promise.all(
        CREATORS.map(async (c) => {
          try {
            const res = await fetch(
              `/.netlify/functions/twitch-live?user=${encodeURIComponent(c.twitchLogin)}`
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
    }

    loadLive();
    const t = setInterval(loadLive, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  return (
    <PageMotion>
      <div className="creatorsPage">
        {/* HERO */}
        <section className="creatorsHero">
          <div className="creatorsHeroOverlay" />
          <div className="creatorsHeroInner">
            <div className="creatorsBreadcrumb">‹ ABOUT &nbsp; US</div>
            <h1 className="creatorsTitle">
              CONTENT
              <br />
              CREATORS
            </h1>
          </div>
        </section>

        {/* LIST */}
        <section className="creatorsSection">
          <div className="creatorsSectionHead">
            <div className="creatorsSectionLabel">CONTENT CREATORS</div>
            <div className="creatorsSectionLine" />
          </div>

          <div className="creatorsGrid">
            {CREATORS.map((c) => {
              const isLive = !!liveMap[c.twitchLogin];

              return (
                <div key={c.name} className="creatorCard">
                  {/* IMAGE */}
                  <div
                    className="creatorImg creatorImgWithOverlay"
                    style={{ backgroundImage: `url(${c.image})` }}
                  >
                    <a
                      href={c.twitch}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="twitchOverlayIcon"
                      aria-label={`Visit ${c.name} on Twitch`}
                    >
                      <FaTwitch />
                    </a>

                    {isLive ? (
                      <div className="liveBadge">
                        <span className="liveDot" />
                        LIVE
                      </div>
                    ) : (
                      <div className="offlineBadge">OFFLINE</div>
                    )}
                  </div>

                  {/* INFO */}
                  <div className="creatorInfo">
                    <div className="creatorName">{c.name}</div>

                    <div className="creatorMeta">
                      <span className="creatorChip">{c.role}</span>
                      <span className="creatorChip">{c.platform}</span>
                    </div>

                    {/* SOCIALS */}
                    <div className="creatorSocials">
                      {c.instagram && (
                        <a
                          href={c.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Instagram"
                        >
                          <FaInstagram />
                        </a>
                      )}

                      {c.twitter && (
                        <a
                          href={c.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Twitter / X"
                        >
                          <FaXTwitter />
                        </a>
                      )}

                      <a
                        href={c.twitch}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Twitch"
                      >
                        <FaTwitch />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </PageMotion>
  );
}
