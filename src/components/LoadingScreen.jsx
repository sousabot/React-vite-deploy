import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function LoadingScreen({ show = true, label = "Loading" }) {
  const [pct, setPct] = useState(10);

  useEffect(() => {
    if (!show) return;

    setPct(10);
    const t = setInterval(() => {
      setPct((p) => {
        const next = p + (p < 60 ? 7 : p < 85 ? 3 : 1);
        return Math.min(next, 92);
      });
    }, 260);

    return () => clearInterval(t);
  }, [show]);

  useEffect(() => {
    if (!show) setPct(100);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="loadingOverlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          aria-busy="true"
          aria-live="polite"
        >
          <div className="loadingVignette" aria-hidden="true" />

          <motion.div
            className="loadingCard"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96, filter: "blur(6px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="loadingLogoWrap">
              <motion.div
                className="loadingRing"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.6, ease: "linear", repeat: Infinity }}
                aria-hidden="true"
              />
              <img className="loadingLogo" src="/vite.svg" alt="GD Esports" />
            </div>

            <motion.div
              className="loadingTitle"
              animate={{ opacity: [0.82, 1, 0.82] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              {label}
              <span className="loadingDots" aria-hidden="true">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </motion.div>

            <div className="loadingSub muted">Preparing the arena</div>

            <div className="loadingBar" aria-hidden="true">
              <motion.div
                className="loadingBarFill"
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              />
            </div>

            <div className="loadingPct muted small">{pct}%</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
