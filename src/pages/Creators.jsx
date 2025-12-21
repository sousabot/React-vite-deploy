import React, { useEffect, useState } from "react";
import PageMotion from "../components/PageMotion.jsx";
import { FaTwitch } from "react-icons/fa";

const CREATORS = [
  {
    name: "mewtzu",
    role: "Streamer",
    platform: "Twitch",
    twitch: "https://www.twitch.tv/mewtzu",
    twitchLogin: "mewtzu",
    image:
      "https://static-cdn.jtvnw.net/jtv_user_pictures/placeholder-profile_image-300x300.png",
  },
];

export default function Creators() {
  const [liveMap, setLiveMap] = useState({}); // { mewtzu: true/false }

  useEffect(() => {
    let cancelled = false;

    async function loadLive() {
      try {
        // Fetch live status for each creator using your existing function:
        // /.netlify/functions/twitch-live?user=<login>
        const results = await Promise.all(
          CREATORS.map(async (c) => {
            try {
              const res = await fetch(
                `/.netlify/functions/twitch-live?user=${encodeURIComponent(c.twitchLogin)}`
              );
              if (!res.ok) return [c.twitchLogin, false];

              const data = await res.json(); // { isLive: true/false, ... }
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
      } catch {
        // ignore
      }
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
        {/* HERO BANNER */}
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

        {/* CONTENT */}
        <section className="creatorsSection">
          <div className="creatorsSectionHead">
            <div className="creatorsSectionLabel">CONTENT CREATORS</div>
            <div className="creatorsSectionLine" />
          </div>

          <div className="creatorsGrid">
            {CREATORS.map((c) => {
              // ✅ real status
              const isLive = !!liveMap[c.twitchLogin];

              return (
                <a
                  key={c.name}
                  href={c.twitch}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="creatorCard creatorCardLink"
                  aria-label={`Visit ${c.name} on Twitch`}
                >
                  <div
                    className="creatorImg creatorImgWithOverlay"
                    style={{ backgroundImage: `url(${c.image})` }}
                  >
                    {/* Twitch icon overlay */}
                    <div className="twitchOverlayIcon" aria-hidden="true">
                      <FaTwitch />
                    </div>

                    {/* ✅ LIVE / OFFLINE badge */}
                    {isLive ? (
                      <div className="liveBadge" aria-label="Live now">
                        <span className="liveDot" />
                        LIVE
                      </div>
                    ) : (
                      <div className="offlineBadge" aria-label="Offline">
                        OFFLINE
                      </div>
                    )}
                  </div>

                  <div className="creatorInfo">
                    <div className="creatorNameRow">
                      <div className="creatorName">{c.name}</div>
                      <div className="creatorArrow" aria-hidden="true">
                        ›
                      </div>
                    </div>

                    <div className="creatorMeta">
                      <span className="creatorChip">{c.role}</span>
                      <span className="creatorChip">{c.platform}</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      </div>
    </PageMotion>
  );
}
