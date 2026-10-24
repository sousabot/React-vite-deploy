import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MIN_MS = 700;

/** Brief branded intro on first load; the app renders underneath. */
export default function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), MIN_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          aria-busy="true"
        >
          <motion.div
            className="splash__inner"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <img className="splash__logo" src="/logo.png" alt="GD Esports" />
            <div className="splash__bar" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
