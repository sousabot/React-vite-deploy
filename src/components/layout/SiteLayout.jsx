import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Backdrop from "./Backdrop.jsx";
import SiteHeader from "./SiteHeader.jsx";
import SiteFooter from "./SiteFooter.jsx";
import MobileMenu from "./MobileMenu.jsx";
import { track } from "../../lib/track.js";
import { usePageMeta } from "../../hooks/usePageMeta.js";

export default function SiteLayout() {
  const location = useLocation();
  // The menu belongs to the path it was opened on, so navigating closes it.
  const [menuPath, setMenuPath] = useState(null);
  const menuOpen = menuPath === location.pathname;
  const setMenuOpen = (open) => setMenuPath(open ? location.pathname : null);
  usePageMeta(location.pathname);

  useEffect(() => {
    track("page_view", { path: location.pathname });
    // `html` has smooth scrolling for anchor links; page changes should jump straight to the top.
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <div className="site">
      <Backdrop />
      <SiteHeader onOpenMenu={() => setMenuOpen(true)} />
      <main className="site__main">
        <Outlet />
      </main>
      <SiteFooter />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
