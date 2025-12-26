import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import ParticlesBackground from "./ParticlesBackground.jsx";
import RightSidebar from "./RightSidebar.jsx";
import SidebarButton from "./SidebarButton.jsx";
import { track } from "../state/track.js";
import { useAuth } from "../state/auth.jsx";
import { ADMIN_EMAILS } from "../state/admins.js";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Track page views
  useEffect(() => {
    track("page_view", { path: location.pathname });
  }, [location.pathname]);

  // Admin check
  const isAdmin = useMemo(() => {
    if (!user) return false;
    return ADMIN_EMAILS.includes((user.email || "").toLowerCase());
  }, [user]);

  // Theme
  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  }, [darkMode]);

  return (
    <div className="appShell">
      {/* BACKGROUND */}
      <div className="bgStack">
        <div className="bgGradientAnimated" />
        <ParticlesBackground />
        <div className="bgVignette" />
      </div>

      {/* UI */}
      <div className="uiLayer">
        <header className="topbar">
          {/* Brand */}
          <motion.div
            className="brand"
            onClick={() => navigate("/")}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            role="button"
            tabIndex={0}
          >
            <img src="/vite.svg" alt="GD Esports" className="brandLogo" />
            <span className="brandText">GD Esports</span>
          </motion.div>

          {/* NAV */}
          <nav className="nav navMain">
            <NavLink to="/about">ABOUT</NavLink>
            <NavLink to="/shop">SHOP</NavLink>
            <NavLink to="/creators">CREATORS</NavLink>
            <NavLink to="/giveaway">GIVEAWAY</NavLink>
            <NavLink to="/work-with-us">WORK WITH US</NavLink>
          </nav>

          {/* AUTH */}
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
                >
                  Logout
                </motion.button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="navAuthLink">
                  Login
                </NavLink>
                <NavLink to="/register" className="navAuthLink">
                  Register
                </NavLink>
              </>
            )}
          </div>

          <SidebarButton onClick={() => setSidebarOpen(true)} />
        </header>

        <main className="content">
          <Outlet />
        </main>

        <footer className="footer">
          <span>© {new Date().getFullYear()} GD Esports</span>
          <span className="footerDot">•</span>
          <span>Made by Sousa</span>
        </footer>
      </div>

      <RightSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    </div>
  );
}
