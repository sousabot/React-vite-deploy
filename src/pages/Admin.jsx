import React from "react";
import PageMotion from "../components/PageMotion.jsx";
import { motion } from "framer-motion";
import AdminContentManager from "../components/AdminContentManager.jsx";

export default function Admin() {
  return (
    <PageMotion>
      <div className="adminPage">
        <header className="adminHeader">
          <div className="adminHeaderLeft">
            <h1>Content Manager</h1>
            <p className="muted">Manage creators, staff, and partners</p>
          </div>

          <div className="adminHeaderRight">
            <motion.a
              className="btnGhost"
              href="/dashboard"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Dashboard
            </motion.a>
          </div>
        </header>

        <AdminContentManager />
      </div>
    </PageMotion>
  );
}
