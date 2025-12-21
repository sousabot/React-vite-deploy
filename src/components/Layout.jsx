import React, { useEffect, useState } from "react";
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

  // Theme toggle hook (optional)
  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  }, [darkMode]);

  return (
    <div className="appShell">
      {/* Background */}
      <ParticlesBackground />

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
        >
          <span className="brandMark">GD</span>
          <span className="brandText">Esports</span>
        </motion.div>

        {/* Main nav (like your screenshot) */}
        <nav className="nav navMain">
          <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
            ABOUT
          </NavLink>

          <NavLink to="/shop" className={({ isActive }) => (isActive ? "active" : "")}>
            SHOP
          </NavLink>

          <NavLink
            to="/partners"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            PARTNERS
          </NavLink>

          <NavLink to="/news" className={({ isActive }) => (isActive ? "active" : "")}>
            NEWS
          </NavLink>

          <NavLink
            to="/work-with-us"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            WORK WITH US
          </NavLink>
        </nav>

        {/* Optional auth buttons (keep or remove) */}
        <div className="navAuth">
  {user ? (
    <>
      <NavLink
        to="/dashboard"
        className={({ isActive }) => `navAuthLink ${isActive ? "active" : ""}`}
      >
        Dashboard
      </NavLink>

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
        className={({ isActive }) => `navAuthLink ${isActive ? "active" : ""}`}
      >
        Login
      </NavLink>

      <NavLink
        to="/register"
        className={({ isActive }) => `navAuthLink ${isActive ? "active" : ""}`}
      >
        Register
      </NavLink>
    </>
  )}
</div>


        {/* Right-side hamburger button */}
        <SidebarButton onClick={() => setSidebarOpen(true)} />
      </header>

      <main className="content">
        <Outlet />
      </main>

      <footer className="footer">
        <span>© {new Date().getFullYear()} GD Esports</span>
        <span className="footerDot">•</span>
        <span>Built with React</span>
      </footer>

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
