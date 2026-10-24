import { FEATURE_FLAGS, SITE } from "./site.js";

export const DEFAULT_DESCRIPTION =
  "GD Esports — League of Legends and CS2 teams, creators, official jerseys and a community that shows up.";

/** `index: false` keeps a page out of search results and the sitemap. */
export const PAGE_META = {
  "/": { title: `${SITE.name} — Built to compete`, description: DEFAULT_DESCRIPTION },
  "/about": { title: "About", description: "Who GD Esports are, what we stand for and where we're going." },
  "/players": { title: "Players", description: "The GD Esports League of Legends and Counter-Strike 2 rosters." },
  "/staff": { title: "Staff", description: "The people who run GD Esports — management, coordination, development and coaching." },
  "/creators": { title: "Creators", description: "GD Esports streamers and creators — see who's live right now." },
  "/clips": { title: "Clips", description: "The best moments from GD Esports creators and players." },
  "/partners": { title: "Partners", description: "The brands and partners that back GD Esports." },
  "/news": { title: "News", description: "Announcements, roster news and updates from GD Esports." },
  "/shop": { title: "Shop", description: "Official GD Esports jerseys — personalise with your name and order online." },
  "/work-with-us": {
    title: "Work with us",
    description: "Apply to join GD Esports as a player, creator or staff member, or partner with us.",
  },
  ...(FEATURE_FLAGS.giveaway ? { "/giveaway": { title: "Giveaway", description: "Enter the GD Esports giveaway." } } : {}),
  "/privacy-policy": { title: "Privacy policy" },
  "/terms-of-service": { title: "Terms of service" },
  "/login": { title: "Log in", index: false },
  "/register": { title: "Register", index: false },
  "/auth/action": { title: "Account", index: false },
  "/dashboard": { title: "Dashboard", index: false },
  "/admin": { title: "Admin", index: false },
};

export function metaFor(path) {
  const meta = PAGE_META[path] || {};
  const title = !meta.title || path === "/" ? meta.title || `${SITE.name} — Built to compete` : `${meta.title} — ${SITE.name}`;
  return {
    title,
    description: meta.description || DEFAULT_DESCRIPTION,
    index: meta.index !== false,
    url: SITE.url + (path === "/" ? "/" : path),
  };
}

export const SITEMAP_PATHS = Object.keys(PAGE_META).filter((p) => PAGE_META[p].index !== false);
