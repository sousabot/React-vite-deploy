import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import InteractiveBackground from "./InteractiveBackground.jsx";

const STATUS = [
  "Booting systems",
  "Connecting to servers",
  "Loading creators",
  "Syncing data",
  "Almost ready",
];

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(STATUS[0]);

  useEffect(() => {
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 8 + 4; // natural feel
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
      }

      setProgress(p);

      const index = Math.min(
        STATUS.length - 1,
        Math.floor((p / 100) * STATUS.length)
      );
      setStatus(STATUS[index]);
    }, 220);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loadingStage">
      <InteractiveBackground density={45} className="bgBehindLoader" />

      <motion.div
        className="loadingCard"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Logo */}
        <motion.div
          className="logoPulse"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        >
          GD
        </motion.div>

        {/* Progress bar */}
        <div className="loadingBar">
          <motion.div
            className="loadingBarFill"
            style={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.25 }}
          />
        </div>

        {/* Status */}
        <div className="loadingText">
          {status} <span className="loadingPercent">{Math.floor(progress)}%</span>
        </div>

        <div className="loadingHint muted small">
          Tip: hover & click the background 👀
        </div>
      </motion.div>
    </div>
  );
}
