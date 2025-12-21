import React from "react";
import { motion } from "framer-motion";

export default function AnimatedBackground({ children }) {
  return (
    <div className="bgRoot">
      {/* Animated gradient */}
      <motion.div
        className="bgGradient"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 30,
          ease: "linear",
          repeat: Infinity,
        }}
      />

      {/* Vignette */}
      <div className="bgVignette" />

      {/* Content */}
      <div className="bgContent">{children}</div>
    </div>
  );
}
