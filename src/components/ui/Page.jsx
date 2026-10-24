import React from "react";
import { motion } from "framer-motion";

export default function Page({ children, className = "", bare = false }) {
  return (
    <motion.div
      className={bare ? className : `page container ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
