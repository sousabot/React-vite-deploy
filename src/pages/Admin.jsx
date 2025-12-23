import React, { useEffect, useMemo, useState } from "react";
import PageMotion from "../components/PageMotion.jsx";
import { motion } from "framer-motion";
import { subscribeMetricsSum } from "../state/adminMetrics.js";

export default function Admin() {
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    // last 7 days in realtime
    const unsub = subscribeMetricsSum(7, setMetrics);
    return () => unsub?.();
  }, []);

  // These are the real counters you are already writing via track()
  const totalViews = metrics.page_view || 0;

  // If you want to separate "visits" from "views", track a different event
  // For now, your "page_view" is the best proxy.
  const websiteVisits = metrics.page_view || 0;

  // These won’t exist until you track them (see section 3)
  const logins = metrics.login || 0;
  const registrations = metrics.register || 0;

  return (
    <PageMotion>
      <div className="adminPage">
        <header className="adminHeader">
          <h1>Admin Dashboard</h1>
          <p className="muted">Internal analytics & platform overview</p>
        </header>

        <section className="adminSection">
          <h2 className="adminSectionTitle">Performance Overview (Live)</h2>

          <div className="adminGrid">
            <motion.div className="adminStatCard" whileHover={{ y: -4 }}>
              <div className="adminStatValue">{totalViews.toLocaleString()}</div>
              <div className="adminStatLabel">Total Page Views (Last 7 Days)</div>
              <div className="adminStatDelta muted">Realtime from Firestore</div>
            </motion.div>

            <motion.div className="adminStatCard" whileHover={{ y: -4 }}>
              <div className="adminStatValue">{websiteVisits.toLocaleString()}</div>
              <div className="adminStatLabel">Website Activity (Last 7 Days)</div>
              <div className="adminStatDelta muted">Realtime from Firestore</div>
            </motion.div>

            <motion.div className="adminStatCard" whileHover={{ y: -4 }}>
              <div className="adminStatValue">{logins.toLocaleString()}</div>
              <div className="adminStatLabel">Logins (Last 7 Days)</div>
              <div className="adminStatDelta muted">Requires tracking “login”</div>
            </motion.div>
          </div>
        </section>

        <section className="adminSection">
          <h2 className="adminSectionTitle">New Registrations</h2>
          <div className="adminGrid">
            <motion.div className="adminStatCard" whileHover={{ y: -4 }}>
              <div className="adminStatValue">{registrations.toLocaleString()}</div>
              <div className="adminStatLabel">Registrations (Last 7 Days)</div>
              <div className="adminStatDelta muted">Requires tracking “register”</div>
            </motion.div>
          </div>
        </section>

        <section className="adminSection">
          <div className="adminNotice">
            <span className="pulseDot" />
            Live metrics powered by <code>metrics_daily</code>
          </div>
        </section>
      </div>
    </PageMotion>
  );
}
