import React from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaDiscord, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FiX } from "react-icons/fi";
import Brand from "./Brand.jsx";
import { ALL_NAV } from "../../config/nav.js";
import { SOCIALS } from "../../config/site.js";
import { useAuth } from "../../features/auth/useAuth.js";
import { useOverlay } from "../../hooks/useOverlay.js";
import { pad2 } from "../../lib/format.js";

export default function MobileMenu({ open, onClose }) {
  const { user, isAdmin, logout } = useAuth();
  useOverlay(open, onClose);

  const links = [
    { to: "/", label: "Home" },
    ...ALL_NAV,
    ...(user ? [{ to: "/dashboard", label: "Dashboard" }] : []),
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="mobile-menu"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="container mobile-menu__top">
            <Brand onClick={onClose} />
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close menu">
              <FiX />
            </button>
          </div>

          <nav className="container mobile-menu__nav" aria-label="Site">
            {links.map((item, i) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className="mobile-menu__link"
                onClick={onClose}
              >
                <span>{pad2(i + 1)}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="container mobile-menu__foot">
            {user ? (
              <button
                type="button"
                className="btn btn--ghost btn--block"
                onClick={() => {
                  logout();
                  onClose();
                }}
              >
                Log out
              </button>
            ) : (
              <div className="row">
                <NavLink to="/login" className="btn btn--ghost" onClick={onClose}>
                  Login
                </NavLink>
                <NavLink to="/register" className="btn btn--ghost" onClick={onClose}>
                  Register
                </NavLink>
              </div>
            )}
            <div className="row">
              <a className="icon-btn" href={SOCIALS.discord} target="_blank" rel="noopener noreferrer" aria-label="Discord">
                <FaDiscord />
              </a>
              <a className="icon-btn" href={SOCIALS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a className="icon-btn" href={SOCIALS.x} target="_blank" rel="noopener noreferrer" aria-label="X">
                <FaXTwitter />
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
