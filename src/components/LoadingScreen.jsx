import React from "react";
import { motion } from "framer-motion";
import InteractiveBackground from "./InteractiveBackground.jsx";

export default function LoadingScreen() {
  return (
    <div className="loadingStage">
      <InteractiveBackground density={45} className="bgBehindLoader" />

      <motion.div
        className="loadingCard"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <motion.div
          className="logoPulse"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        >
          GD
        </motion.div>

        <div className="loadingBar">
          <div className="loadingBarFill" />
        </div>

        <div className="loadingText">Loading GD Esports…</div>

        <div className="loadingHint muted small">
          Tip: hover/click the background 👀
        </div>
      </motion.div>
    </div>
  );
}
