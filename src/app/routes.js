import { lazy } from "react";
import { FEATURE_FLAGS } from "../config/site.js";

/**
 * `guard`: "user" requires login, "admin" requires an admin email.
 * `preload`: fetched in the background after first paint so navigation is instant.
 */
const PAGES = [
  { path: "/", load: () => import("../features/home/HomePage.jsx"), preload: true },
  { path: "/about", load: () => import("../features/about/AboutPage.jsx"), preload: true },
  { path: "/players", load: () => import("../features/roster/PlayersPage.jsx"), preload: true },
  { path: "/staff", load: () => import("../features/roster/StaffPage.jsx"), preload: true },
  { path: "/creators", load: () => import("../features/creators/CreatorsPage.jsx"), preload: true },
  { path: "/clips", load: () => import("../features/clips/ClipsPage.jsx"), preload: true },
  { path: "/partners", load: () => import("../features/partners/PartnersPage.jsx"), preload: true },
  { path: "/news", load: () => import("../features/news/NewsPage.jsx"), preload: true },
  { path: "/shop", load: () => import("../features/shop/ShopPage.jsx"), preload: true },
  { path: "/work-with-us", load: () => import("../features/recruit/WorkWithUsPage.jsx"), preload: true },
  ...(FEATURE_FLAGS.giveaway
    ? [{ path: "/giveaway", load: () => import("../features/giveaway/GiveawayPage.jsx"), preload: true }]
    : []),

  { path: "/privacy-policy", load: () => import("../features/legal/PrivacyPage.jsx") },
  { path: "/terms-of-service", load: () => import("../features/legal/TermsPage.jsx") },

  { path: "/login", load: () => import("../features/auth/LoginPage.jsx") },
  { path: "/register", load: () => import("../features/auth/RegisterPage.jsx") },
  { path: "/dashboard", guard: "user", load: () => import("../features/dashboard/DashboardPage.jsx") },
  { path: "/admin", guard: "admin", load: () => import("../features/admin/AdminPage.jsx") },
];

export const ROUTES = PAGES.map(({ path, guard, load }) => ({ path, guard, element: lazy(load) }));

/** Warm the public page chunks during idle time (skipped on data-saver / slow connections). */
export function preloadRoutes() {
  const conn = navigator.connection;
  if (conn?.saveData || /2g/.test(conn?.effectiveType || "")) return;

  const queue = PAGES.filter((p) => p.preload).map((p) => p.load);
  const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 300));
  const next = () => {
    const load = queue.shift();
    if (!load) return;
    load()
      .catch(() => {})
      .finally(() => idle(next));
  };
  idle(next);
}
