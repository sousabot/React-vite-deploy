import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import ParticlesBackground from "./ParticlesBackground.jsx";
import RightSidebar from "./RightSidebar.jsx";
import SidebarButton from "./SidebarButton.jsx";
import NewsletterSignup from "./NewsletterSignup.jsx";

import { track } from "../state/track.js";
import { useAuth } from "../state/auth.jsx";
import { ADMIN_EMAILS } from "../state/admins.js";
import { MORE_NAV, PRIMARY_NAV } from "../data/nav.js";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const moreRef = useRef(null);

  useEffect(() => {
    track("page_view", { path: location.pathname });
  }, [location.pathname]);

  useEffect(() => {
    setMoreOpen(false);
    setSidebarOpen(false);
  }, [location.pathname]);

  const isAdmin = useMemo(() => {
    if (!user) return false;
    return ADMIN_EMAILS.includes((user.email || "").toLowerCase());
  }, [user]);

  const moreActive = useMemo(
    () => MORE_NAV.some((item) => location.pathname.startsWith(item.to)),
    [location.pathname]
  );

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  }, [darkMode]);

  useEffect(() => {
    if (!moreOpen) return;
    function onDocClick(e) {
      if (!moreRef.current?.contains(e.target)) setMoreOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setMoreOpen(false);
    }
    // Use click (not pointerdown) so nav links still receive the full click.
    document.addEventListener("click", onDocClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  return (
    <div className="appShell">
      <div className="bgStack">
        <div className="bgGradientAnimated" />
        <ParticlesBackground density={18} />
        <div className="bgVignette" />
      </div>

      <div className="uiLayer">
        <header className="topbar">
          <motion.div
            className="brand"
            onClick={() => navigate("/")}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate("/");
            }}
          >
            <img
              src="/logo.png"
              alt="GD Esports"
              className="brandLogo"
              loading="eager"
            />
          </motion.div>

          <nav className="nav navMain" aria-label="Primary">
            {PRIMARY_NAV.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}

            <div className="navMore" ref={moreRef}>
              <button
                type="button"
                className={`navMoreBtn ${moreOpen || moreActive ? "active" : ""}`}
                aria-expanded={moreOpen}
                aria-haspopup="true"
                onClick={() => setMoreOpen((v) => !v)}
              >
                More
                <span className="navMoreCaret" aria-hidden="true">
                  ▾
                </span>
              </button>
              {moreOpen && (
                <div className="navMoreMenu" role="menu">
                  {MORE_NAV.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      role="menuitem"
                      className="navMoreLink"
                      onClick={() => setMoreOpen(false)}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="navAuth">
            {user ? (
              <>
                <NavLink to="/dashboard" className="navAuthLink">
                  Dashboard
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin" className="navAuthLink">
                    Admin
                  </NavLink>
                )}
                <motion.button
                  className="btnGhost"
                  onClick={logout}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                >
                  Logout
                </motion.button>
              </>
            ) : (
              <NavLink to="/login" className="navAuthLink">
                Login
              </NavLink>
            )}
          </div>

          <SidebarButton onClick={() => setSidebarOpen(true)} />
        </header>

        <main className="content">
          <Outlet />
        </main>

        <footer className="footer">
          <NewsletterSignup />

          <nav className="footerNav" aria-label="Footer">
            {PRIMARY_NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className="footerLink">
                {item.label}
              </NavLink>
            ))}
            {MORE_NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className="footerLink">
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="footerLinks">
            <a className="footerLink" href="/privacy-policy">
              Privacy Policy
            </a>
            <span className="footerDot">•</span>
            <a className="footerLink" href="/terms-of-service">
              Terms of Service
            </a>
          </div>

          <div className="footerMeta">
            <span>© {new Date().getFullYear()} GD Esports</span>
            <span className="footerDot">•</span>
            <span>Made by Sousa Developments</span>
          </div>
        </footer>
      </div>

      <RightSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        user={user}
        isAdmin={isAdmin}
        onLogout={logout}
      />
    </div>
  );
}
