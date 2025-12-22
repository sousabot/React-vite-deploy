import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import ParticlesBackground from "./ParticlesBackground.jsx";
import RightSidebar from "./RightSidebar.jsx";
import SidebarButton from "./SidebarButton.jsx";
import { useAuth } from "../state/auth.jsx";

export default function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // ✅ Put YOUR real login email here (from your console screenshot)
  const ADMIN_EMAIL = "goncalosd123@gmail.com";

  const isAdmin = useMemo(() => {
    if (!user) return false;

    const email =
      user.email ||
      user.user?.email ||
      user.profile?.email ||
      user?.claims?.email ||
      "";

    return email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  }, [user]);

  // Theme toggle
  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  }, [darkMode]);

  return (
    <div className="appShell">
      {/* === BACKGROUND STACK === */}
      <div className="bgStack">
        <div className="bgGradientAnimated" />
        <ParticlesBackground />
        <div className="bgVignette" />
      </div>

      {/* === UI LAYER === */}
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
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate("/");
            }}
            aria-label="Go to home"
            title="GD Esports"
          >
            {/* ✅ Logo (from public/vite.svg) */}
            <img src="/vite.svg" alt="GD Esports" className="brandLogo" />
            <span className="brandText">GD Esports</span>
          </motion.div>

          {/* Main nav */}
          <nav className="nav navMain">
            <NavLink
              to="/about"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              ABOUT
            </NavLink>

            <NavLink
              to="/shop"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              SHOP
            </NavLink>

            <NavLink
              to="/giveaway"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              GIVEAWAY
            </NavLink>

            <NavLink
              to="/work-with-us"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              WORK WITH US
            </NavLink>
          </nav>

          {/* Auth */}
          <div className="navAuth">
            {user ? (
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `navAuthLink ${isActive ? "active" : ""}`
                  }
                >
                  Dashboard
                </NavLink>

                {/* ✅ Only show Admin for your admin email */}
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `navAuthLink ${isActive ? "active" : ""}`
                    }
                  >
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
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `navAuthLink ${isActive ? "active" : ""}`
                  }
                >
                  Login
                </NavLink>

                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `navAuthLink ${isActive ? "active" : ""}`
                  }
                >
                  Register
                </NavLink>
              </>
            )}
          </div>

          {/* Sidebar toggle */}
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

      {/* Right Sidebar */}
      <RightSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    </div>
  );
}
