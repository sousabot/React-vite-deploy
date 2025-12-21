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
        // Calls your own backend endpoint (you will add it below)
        const params = new URLSearchParams({
          logins: CREATORS.map((c) => c.twitchLogin).join(","),
        });

        const res = await fetch(`/api/twitch/live?${params.toString()}`);
        if (!res.ok) return;
        const data = await res.json(); // { live: { mewtzu: true } }

        if (!cancelled) setLiveMap(data?.live || {});
      } catch {
        // silently ignore (no badge)
      }
    }

    loadLive();
    const t = setInterval(loadLive, 60_000); // refresh every minute
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
              const isLive = true; // 🔥 TEMP: force live for testing


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

                    {/* Live badge */}
                    {isLive && (
                      <div className="liveBadge" aria-label="Live now">
                        <span className="liveDot" />
                        LIVE
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
