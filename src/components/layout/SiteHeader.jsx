import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaDiscord } from "react-icons/fa";
import Brand from "./Brand.jsx";
import { MORE_NAV, PRIMARY_NAV } from "../../config/nav.js";
import { DISCORD_INVITE } from "../../config/site.js";
import { useAuth } from "../../features/auth/useAuth.js";
import { track } from "../../lib/track.js";

export default function SiteHeader({ onOpenMenu }) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  // Tied to the current path so navigating closes the dropdown.
  const [morePath, setMorePath] = useState(null);
  const moreOpen = morePath === location.pathname;
  const toggleMore = () => setMorePath(moreOpen ? null : location.pathname);
  const moreRef = useRef(null);
  const moreActive = MORE_NAV.some((item) => location.pathname.startsWith(item.to));

  useEffect(() => {
    if (!moreOpen) return;
    function onDocClick(e) {
      if (!moreRef.current?.contains(e.target)) setMorePath(null);
    }
    function onKey(e) {
      if (e.key === "Escape") setMorePath(null);
    }
    document.addEventListener("click", onDocClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Brand />

        <nav className="nav" aria-label="Primary">
          {PRIMARY_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className="nav__link">
              {item.label}
            </NavLink>
          ))}

          <div className={`nav__more ${moreOpen ? "is-open" : ""}`} ref={moreRef}>
            <button
              type="button"
              className={`nav__link ${moreActive ? "is-active" : ""}`}
              aria-expanded={moreOpen}
              aria-haspopup="true"
              onClick={toggleMore}
            >
              More <span className="nav__caret">▾</span>
            </button>
            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  className="nav__menu"
                  role="menu"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                >
                  {MORE_NAV.map((item) => (
                    <NavLink key={item.to} to={item.to} role="menuitem" className="nav__menu-link">
                      {item.label}
                    </NavLink>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        <div className="site-header__actions">
          {isAdmin && (
            <NavLink to="/admin" className="nav__link hide-mobile">
              Admin
            </NavLink>
          )}
          <NavLink to={user ? "/dashboard" : "/login"} className="nav__link hide-mobile">
            {user ? "Dashboard" : "Login"}
          </NavLink>
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary btn--sm hide-mobile"
            onClick={() => track("discord_click", { source: "header" })}
          >
            <FaDiscord aria-hidden="true" />
            Join
          </a>
          <button type="button" className="burger" onClick={onOpenMenu} aria-label="Open menu">
            <span className="burger__lines">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
