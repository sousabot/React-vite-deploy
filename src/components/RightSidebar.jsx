import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function RightSidebar({ open, onClose, darkMode, setDarkMode }) {
  // Close on ESC
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="sidebarBackdrop"
            onMouseDown={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Panel */}
          <motion.aside
            className="rightSidebar"
            initial={{ x: 360 }}
            animate={{ x: 0 }}
            exit={{ x: 360 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* TOP */}
            <div className="sidebarTop">
              <div className="sidebarGrip" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>

              <button
                className="sidebarClose"
                onClick={onClose}
                aria-label="Close sidebar"
              >
                ✕
              </button>
            </div>

            {/* BODY */}
            <div className="sidebarBody">
              <div className="modeBlock">
                <div className="modeLabel">MODE</div>

                <button
                  className={`modeToggle ${darkMode ? "on" : ""}`}
                  onClick={() => setDarkMode((v) => !v)}
                  aria-label="Toggle dark mode"
                >
                  <span className="knob" />
                </button>
              </div>

              <div className="sidebarHint">
                Follow GD Esports for clips, highlights, and updates.
              </div>
            </div>

            {/* BOTTOM – SOCIAL LINKS */}
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
