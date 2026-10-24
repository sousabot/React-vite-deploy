import { useEffect, useMemo, useState } from "react";

const OFFLINE = { isLive: false, viewerCount: 0, title: "", streamGame: "", startedAt: "" };
const POLL_MS = 60_000;

async function fetchStream(login) {
  try {
    const res = await fetch(
      `/.netlify/functions/twitch-live?user=${encodeURIComponent(login)}&_=${Date.now()}`,
      { cache: "no-store" }
    );
    if (!res.ok) return OFFLINE;
    const data = await res.json();
    return {
      isLive: !!data?.isLive,
      viewerCount: data?.viewerCount || 0,
      title: data?.title || "",
      streamGame: data?.game || "",
      startedAt: data?.startedAt || "",
    };
  } catch {
    return OFFLINE;
  }
}

/** Polls Twitch live status for every creator; live creators sorted by viewers. */
export function useTwitchLive(creators) {
  const [streams, setStreams] = useState({});
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!creators?.length) return;
    let cancelled = false;

    async function poll() {
      const entries = await Promise.all(
        creators.map(async (c) => [c.twitchLogin, await fetchStream(c.twitchLogin)])
      );
      if (cancelled) return;
      const polledAt = Date.now();
      setStreams(Object.fromEntries(entries.map(([login, s]) => [login, { ...s, polledAt }])));
      setChecked(true);
    }

    poll();
    const t = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [creators]);

  const live = useMemo(
    () =>
      creators
        .filter((c) => streams[c.twitchLogin]?.isLive)
        .sort((a, b) => {
          const diff =
            (streams[b.twitchLogin]?.viewerCount || 0) -
            (streams[a.twitchLogin]?.viewerCount || 0);
          return diff || creators.indexOf(a) - creators.indexOf(b);
        }),
    [creators, streams]
  );

  return { streams, checked, live };
}
