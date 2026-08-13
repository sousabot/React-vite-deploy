import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { ALL_NAV } from "../data/nav.js";

export default function RightSidebar({
  open,
  onClose,
  darkMode,
  setDarkMode,
  user,
  isAdmin,
  onLogout,
}) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="sidebarBackdrop"
            onMouseDown={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.aside
            className="rightSidebar"
            initial={{ x: 360 }}
            animate={{ x: 0 }}
            exit={{ x: 360 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="sidebarTop">
              <div className="sidebarBrand">Menu</div>
              <button
                className="sidebarClose"
                onClick={onClose}
                aria-label="Close menu"
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="sidebarBody">
              <nav className="sidebarNav" aria-label="Site">
                {ALL_NAV.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="sidebarNavLink"
                    onClick={onClose}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="sidebarAuth">
                {user ? (
                  <>
                    <NavLink
                      to="/dashboard"
                      className="sidebarNavLink"
                      onClick={onClose}
                    >
                      Dashboard
                    </NavLink>
                    {isAdmin && (
                      <NavLink
                        to="/admin"
                        className="sidebarNavLink"
                        onClick={onClose}
                      >
                        Admin
                      </NavLink>
                    )}
                    <button
                      type="button"
                      className="sidebarNavLink sidebarNavBtn"
                      onClick={() => {
                        onLogout?.();
                        onClose?.();
                      }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink
                      to="/login"
                      className="sidebarNavLink"
                      onClick={onClose}
                    >
                      Login
                    </NavLink>
                    <NavLink
                      to="/register"
                      className="sidebarNavLink"
                      onClick={onClose}
                    >
                      Register
                    </NavLink>
                  </>
                )}
              </div>

              <div className="modeBlock">
                <div className="modeLabel">Dark mode</div>
                <button
                  className={`modeToggle ${darkMode ? "on" : ""}`}
                  onClick={() => setDarkMode((v) => !v)}
                  aria-label="Toggle dark mode"
                  type="button"
                >
                  <span className="knob" />
                </button>
              </div>
            </div>

            <div className="sidebarBottom">
              <a
                className="sideIcon"
                href="https://www.instagram.com/gdesports25/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
              <a
                className="sideIcon"
                href="https://x.com/GDESPORTS25"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
              >
                <FaXTwitter />
              </a>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
