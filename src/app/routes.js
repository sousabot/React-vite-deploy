import { lazy } from "react";
import { FEATURE_FLAGS } from "../config/site.js";

/**
 * `guard`: "user" requires login, "admin" requires an admin email.
 */
export const ROUTES = [
  { path: "/", element: lazy(() => import("../features/home/HomePage.jsx")) },
  { path: "/about", element: lazy(() => import("../features/about/AboutPage.jsx")) },
  { path: "/players", element: lazy(() => import("../features/roster/PlayersPage.jsx")) },
  { path: "/staff", element: lazy(() => import("../features/roster/StaffPage.jsx")) },
  { path: "/creators", element: lazy(() => import("../features/creators/CreatorsPage.jsx")) },
  { path: "/clips", element: lazy(() => import("../features/clips/ClipsPage.jsx")) },
  { path: "/partners", element: lazy(() => import("../features/partners/PartnersPage.jsx")) },
  { path: "/news", element: lazy(() => import("../features/news/NewsPage.jsx")) },
  { path: "/shop", element: lazy(() => import("../features/shop/ShopPage.jsx")) },
  { path: "/work-with-us", element: lazy(() => import("../features/recruit/WorkWithUsPage.jsx")) },
  ...(FEATURE_FLAGS.giveaway
    ? [{ path: "/giveaway", element: lazy(() => import("../features/giveaway/GiveawayPage.jsx")) }]
    : []),

  { path: "/privacy-policy", element: lazy(() => import("../features/legal/PrivacyPage.jsx")) },
  { path: "/terms-of-service", element: lazy(() => import("../features/legal/TermsPage.jsx")) },

  { path: "/login", element: lazy(() => import("../features/auth/LoginPage.jsx")) },
  { path: "/register", element: lazy(() => import("../features/auth/RegisterPage.jsx")) },
  {
    path: "/dashboard",
    guard: "user",
    element: lazy(() => import("../features/dashboard/DashboardPage.jsx")),
  },
  {
    path: "/admin",
    guard: "admin",
    element: lazy(() => import("../features/admin/AdminPage.jsx")),
  },
];
