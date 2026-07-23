import React from "react";
import { motion } from "framer-motion";

export default function SidebarButton({ onClick }) {
  return (
    <motion.button
      className="sidebarOpenBtn"
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      aria-label="Open sidebar"
    >
      <span />
      <span />
      <span />
    </motion.button>
  );
}
