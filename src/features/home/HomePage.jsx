import React, { useState } from "react";
import Page from "../../components/ui/Page.jsx";
import Ticker from "../../components/ui/Ticker.jsx";
import { useSiteContent } from "../../content/siteContent.js";
import { useTwitchLive } from "../../hooks/useTwitchLive.js";
import { useDiscordStats } from "../../hooks/useDiscordStats.js";
import HeroSection from "./HeroSection.jsx";
import MatchCenter from "./MatchCenter.jsx";
import LiveCreators from "./LiveCreators.jsx";
import MerchSection from "./MerchSection.jsx";
import JoinSection from "./JoinSection.jsx";
import TryoutModal from "./TryoutModal.jsx";
import "./home.css";

const TICKER = ["Built to compete", "LPLOL", "GD Esports", "Creators", "Community", "Official jerseys"];

export default function HomePage() {
  const { creators, matches } = useSiteContent();
  const twitch = useTwitchLive(creators);
  const discord = useDiscordStats();
  const [tryoutOpen, setTryoutOpen] = useState(false);

  return (
    <Page bare>
      <HeroSection
        discordMembers={discord.members}
        creatorCount={creators.length}
        liveCount={twitch.checked ? twitch.live.length : null}
      />
      <Ticker items={TICKER} />
      <MatchCenter matches={matches} />
      <LiveCreators creators={creators} {...twitch} />
      <MerchSection />
      <JoinSection discord={discord} onApply={() => setTryoutOpen(true)} />
      <TryoutModal open={tryoutOpen} onClose={() => setTryoutOpen(false)} />
    </Page>
  );
}
