import React, { useState } from "react";
import Page from "../../components/ui/Page.jsx";
import { useSiteContent } from "../../content/siteContent.js";
import { useTwitchLive } from "../../hooks/useTwitchLive.js";
import { useDiscordStats } from "../../hooks/useDiscordStats.js";
import HeroSection from "./HeroSection.jsx";
import LiveCreators from "./LiveCreators.jsx";
import MerchSection from "./MerchSection.jsx";
import JoinSection from "./JoinSection.jsx";
import TryoutModal from "./TryoutModal.jsx";
import "./home.css";

export default function HomePage() {
  const { creators } = useSiteContent();
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
      <LiveCreators creators={creators} {...twitch} />
      <MerchSection />
      <JoinSection discord={discord} onApply={() => setTryoutOpen(true)} />
      <TryoutModal open={tryoutOpen} onClose={() => setTryoutOpen(false)} />
    </Page>
  );
}
