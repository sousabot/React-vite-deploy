import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { FaDiscord, FaTwitch } from "react-icons/fa";
import SectionHead from "../../components/ui/SectionHead.jsx";
import { buildSchedule } from "../../content/matches.js";
import { DISCORD_INVITE, SITE } from "../../config/site.js";
import { useCountdown } from "../../hooks/useCountdown.js";
import { formatMatchDate, pad2 } from "../../lib/format.js";
import { track } from "../../lib/track.js";

function TeamSlot({ logo, tag, name, home }) {
  return (
    <div className={`mc-team ${home ? "mc-team--home" : ""}`}>
      <div className="mc-team__logo">
        {logo ? <img src={logo} alt={name || tag || "Team"} /> : <span>{tag?.slice(0, 3) || "?"}</span>}
      </div>
      <div className="mc-team__tag">{tag || "TBA"}</div>
      {name && <div className="mc-team__name faint small">{name}</div>}
    </div>
  );
}

export default function MatchCenter({ matches }) {
  const { lastMatch, nextMatch, matchTwitchUrl } = matches;
  const schedule = useMemo(() => buildSchedule(lastMatch, nextMatch), [lastMatch, nextMatch]);
  const countdown = useCountdown(nextMatch.date);

  const counting = !!countdown && !countdown.expired;
  const hasNextOpponent = !!(nextMatch.opponentTag?.trim() || nextMatch.opponent?.trim());
  const showNext = counting || hasNextOpponent;
  const won = lastMatch.result === "W";

  return (
    <section className="section container">
      <SectionHead
        index="01"
        eyebrow="Match centre"
        title={showNext ? "Next up" : "Last result"}
        sub={
          showNext
            ? `${nextMatch.competition} · ${nextMatch.format}`
            : `${lastMatch.league} · ${lastMatch.competition}`
        }
      />

      <motion.div
        className="panel panel--notch mc"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mc__board">
          <TeamSlot home logo="/logo.png" tag={SITE.tag} name={SITE.name} />

          <div className="mc__center">
            {counting ? (
              <div className="mc__countdown">
                {[
                  ["Days", countdown.days],
                  ["Hrs", countdown.hours],
                  ["Min", countdown.mins],
                  ["Sec", countdown.secs],
                ].map(([label, value]) => (
                  <div key={label} className="mc__unit">
                    <span className="mc__num">{pad2(value)}</span>
                    <span className="mc__lbl">{label}</span>
                  </div>
                ))}
              </div>
            ) : showNext ? (
              <>
                <div className="mc__vs">VS</div>
                <div className="mono faint">Date TBA · alerts in Discord</div>
              </>
            ) : (
              <>
                <div className={`mc__score ${won ? "is-win" : "is-loss"}`}>
                  {lastMatch.score || "—"}
                </div>
                <div className={`tag ${won ? "tag--orange" : ""}`}>{won ? "Victory" : "Defeat"}</div>
              </>
            )}
          </div>

          {showNext ? (
            <TeamSlot logo={nextMatch.opponentLogo} tag={nextMatch.opponentTag} name={nextMatch.opponent} />
          ) : (
            <TeamSlot logo={lastMatch.opponentLogo} tag={lastMatch.opponentTag} name={lastMatch.opponent} />
          )}
        </div>

        <div className="mc__actions row">
          <a
            href={matchTwitchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary btn--sm"
            onClick={() => track("twitch_watch", { source: "match_center" })}
          >
            <FaTwitch aria-hidden="true" />
            Watch on Twitch
          </a>
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--ghost btn--sm"
            onClick={() => track("discord_click", { source: "match_center" })}
          >
            <FaDiscord aria-hidden="true" />
            Match alerts
          </a>
          {lastMatch.vodUrl && (
            <a
              href={lastMatch.vodUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--ghost btn--sm"
              onClick={() => track("match_recap_click", { league: lastMatch.league })}
            >
              Last recap
            </a>
          )}
        </div>

        <ol className="mc__schedule">
          {schedule.map((m) => (
            <li key={m.id} className={`mc__slot ${m.isPast ? "is-past" : ""}`}>
              <span className="mono faint">
                {m.competition} · {m.format}
              </span>
              <span className="mc__slot-teams">
                {SITE.tag} <span className="faint">vs</span> {m.opponent || "TBA"}
              </span>
              <span
                className={`mc__slot-status ${
                  m.isPast ? (won ? "is-win" : "is-loss") : "is-upcoming"
                }`}
              >
                {m.isPast ? m.status : formatMatchDate(m.date) || "TBA"}
              </span>
            </li>
          ))}
        </ol>
      </motion.div>
    </section>
  );
}
