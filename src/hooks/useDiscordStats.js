import { useEffect, useState } from "react";

export function useDiscordStats() {
  const [stats, setStats] = useState({ members: null, online: null });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/.netlify/functions/discord-members", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setStats({
          members: typeof data?.members === "number" ? data.members : null,
          online: typeof data?.online === "number" ? data.online : null,
        });
      } catch {
        // Stats are decorative; keep the last known values.
      }
    }

    load();
    const t = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  return stats;
}
