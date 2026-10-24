/** Default match center data — overridden by Admin → Matches when published. */

export const DEFAULT_MATCHES = {
  matchTwitchUrl: "https://www.twitch.tv/rtparenalol",
  lastMatch: {
    league: "LPLOL",
    competition: "Season Opener · Game 1",
    result: "W",
    score: "1-0",
    opponent: "ZeroZone Gaming",
    opponentTag: "ZZG",
    opponentLogo: "",
    vodUrl: "",
    summary: "GDE opens the season 1-0 against ZeroZone Gaming.",
  },
  nextMatch: {
    competition: "LPLOL",
    format: "Best of 1",
    date: null,
    opponent: "",
    opponentTag: "",
    opponentLogo: "",
  },
};

export function resolveMatches(stored) {
  const base = DEFAULT_MATCHES;
  const last = stored?.lastMatch && typeof stored.lastMatch === "object"
    ? { ...base.lastMatch, ...stored.lastMatch }
    : base.lastMatch;
  const next = stored?.nextMatch && typeof stored.nextMatch === "object"
    ? { ...base.nextMatch, ...stored.nextMatch }
    : base.nextMatch;

  return {
    matchTwitchUrl:
      typeof stored?.matchTwitchUrl === "string" && stored.matchTwitchUrl.trim()
        ? stored.matchTwitchUrl.trim()
        : base.matchTwitchUrl,
    lastMatch: {
      ...last,
      opponentLogo: last.opponentLogo || "",
      vodUrl: last.vodUrl || "",
    },
    nextMatch: {
      ...next,
      date: next.date || null,
      opponent: next.opponent || "",
      opponentTag: next.opponentTag || "",
      opponentLogo: next.opponentLogo || "",
    },
  };
}

/** Build the 3-slot schedule strip from last + next match. */
export function buildSchedule(lastMatch, nextMatch) {
  const formatShort = (format) => {
    if (!format) return "Bo1";
    if (/best of 1/i.test(format) || format === "Bo1") return "Bo1";
    if (/best of 3/i.test(format) || format === "Bo3") return "Bo3";
    if (/best of 5/i.test(format) || format === "Bo5") return "Bo5";
    return format;
  };

  return [
    {
      id: "g1",
      isPast: true,
      competition: lastMatch?.league || "LPLOL",
      format: "Bo1",
      opponent: lastMatch?.opponentTag || null,
      status: lastMatch
        ? `${lastMatch.result || "?"} ${lastMatch.score || ""}`.trim()
        : "—",
    },
    {
      id: "g2",
      isPast: false,
      competition: nextMatch?.competition || "LPLOL",
      format: formatShort(nextMatch?.format),
      opponent: nextMatch?.opponentTag || null,
      date: nextMatch?.date || null,
    },
    {
      id: "g3",
      isPast: false,
      competition: "LPLOL",
      format: "Bo1",
      opponent: null,
      date: null,
    },
  ];
}

/** datetime-local ↔ ISO helpers for the admin form */
export function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalInputValue(local) {
  if (!local) return null;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
