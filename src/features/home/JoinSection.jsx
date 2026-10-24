import React from "react";
import { FaDiscord } from "react-icons/fa";
import CtaBand from "../../components/ui/CtaBand.jsx";
import { DISCORD_INVITE } from "../../config/site.js";
import { track } from "../../lib/track.js";

export default function JoinSection({ discord, onApply }) {
  const sub =
    discord.members != null
      ? `${discord.members.toLocaleString()}+ members${
          discord.online != null ? ` · ${discord.online} online now` : ""
        }. Match alerts, drops, scrims and tryouts all happen here.`
      : "Match alerts, drops, scrims and tryouts all happen here.";

  return (
    <section className="section container">
      <CtaBand eyebrow="04 · Community" title="Join the squad" sub={sub}>
        <a
          href={DISCORD_INVITE}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--primary"
          onClick={() => track("discord_click", { source: "home_community" })}
        >
          <FaDiscord aria-hidden="true" />
          Join Discord
        </a>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => {
            track("tryout_open");
            onApply();
          }}
        >
          Apply for tryouts
        </button>
      </CtaBand>
    </section>
  );
}
