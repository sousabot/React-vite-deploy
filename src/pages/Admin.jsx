import React from "react";
import PageMotion from "../components/PageMotion.jsx";
import { motion } from "framer-motion";

export default function Admin() {
  return (
    <PageMotion>
      <div className="adminPage">
        {/* HEADER */}
        <header className="adminHeader">
          <h1>Admin Dashboard</h1>
          <p className="muted">
            Internal analytics & platform overview
          </p>
        </header>

        {/* === PERFORMANCE OVERVIEW === */}
        <section className="adminSection">
          <h2 className="adminSectionTitle">Performance Overview</h2>

          <div className="adminGrid">
            <motion.div className="adminStatCard" whileHover={{ y: -4 }}>
              <div className="adminStatValue">2.6k</div>
              <div className="adminStatLabel">Total Views</div>
              <div className="adminStatDelta positive">+338% this month</div>
            </motion.div>

            <motion.div className="adminStatCard" whileHover={{ y: -4 }}>
              <div className="adminStatValue">62%</div>
              <div className="adminStatLabel">Non-Follower Views</div>
              <div className="adminStatDelta positive">+309%</div>
            </motion.div>

            <motion.div className="adminStatCard" whileHover={{ y: -4 }}>
              <div className="adminStatValue">+86</div>
              <div className="adminStatLabel">Followers</div>
              <div className="adminStatDelta positive">+15 this month</div>
            </motion.div>
          </div>
        </section>

        {/* === WEBSITE ACTIVITY === */}
        <section className="adminSection">
          <h2 className="adminSectionTitle">Website Activity</h2>

          <div className="adminGrid">
            <motion.div className="adminStatCard" whileHover={{ y: -4 }}>
              <div className="adminStatValue">412</div>
              <div className="adminStatLabel">Website Visits</div>
              <div className="adminStatDelta positive">+21%</div>
            </motion.div>

            <motion.div className="adminStatCard" whileHover={{ y: -4 }}>
              <div className="adminStatValue">37</div>
              <div className="adminStatLabel">Logged-in Users</div>
              <div className="adminStatDelta muted">Today</div>
            </motion.div>

            <motion.div className="adminStatCard" whileHover={{ y: -4 }}>
              <div className="adminStatValue">12</div>
              <div className="adminStatLabel">New Registrations</div>
              <div className="adminStatDelta positive">Last 7 days</div>
            </motion.div>
          </div>
        </section>

        {/* === STATUS === */}
        <section className="adminSection">
          <div className="adminNotice">
            <span className="pulseDot" />
            Analytics UI only — live data coming next
          </div>
        </section>
      </div>
    </PageMotion>
  );
}
