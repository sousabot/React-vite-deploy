import React, { useEffect, useMemo, useState } from "react";
import PageMotion from "../components/PageMotion.jsx";
import { motion } from "framer-motion";
import { subscribeMetricsSum } from "../state/adminMetrics.js";
import { track } from "../state/track.js";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const RANGE_OPTIONS = [
  { label: "7D", days: 7 },
  { label: "14D", days: 14 },
  { label: "30D", days: 30 },
];

function StatCard({ value, label, hint }) {
  return (
    <motion.div
      className="adminStatCard"
      whileHover={{ y: -4 }}
      variants={fadeUp}
      initial="hidden"
      animate="show"
      transition={{ duration: 0.25 }}
    >
      <div className="adminStatValue">{Number(value || 0).toLocaleString()}</div>
      <div className="adminStatLabel">{label}</div>
      {hint && <div className="adminStatDelta muted">{hint}</div>}
    </motion.div>
  );
}

function ChipButton({ active, onClick, children }) {
  return (
    <button
      className={`adminChip ${active ? "active" : ""}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export default function Admin() {
  const [days, setDays] = useState(7);
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    const unsub = subscribeMetricsSum(days, setMetrics);
    return () => unsub?.();
  }, [days]);

  // Core metrics (existing)
  const totalViews = metrics.page_view || 0;
  const websiteActivity = metrics.page_view || 0; // same proxy unless you add distinct event
  const logins = metrics.login || 0;
  const registrations = metrics.register || 0;

  // Useful extra metrics (only show what exists)
  const giveawaySubmits = metrics.giveaway_submit || 0;
  const tryoutSubmits = metrics.tryout_submit || 0;
  const discordClicks = metrics.discord_click || 0;
  const xClicks = metrics.x_click || 0;

  // Build a breakdown list for display
  const eventBreakdown = useMemo(() => {
    const entries = Object.entries(metrics || {})
      .filter(([k, v]) => typeof v === "number" && v > 0)
      .sort((a, b) => b[1] - a[1]);

    return entries;
  }, [metrics]);

  // Optional: "top pages" if you store page path keys like "page_view:/about"
  // If your tracking currently only stores "page_view" total, this will be empty.
  const topPages = useMemo(() => {
    const entries = Object.entries(metrics || {})
      .filter(([k, v]) => k.startsWith("page_view:") && typeof v === "number")
      .map(([k, v]) => [k.replace("page_view:", ""), v])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    return entries;
  }, [metrics]);

  return (
    <PageMotion>
      <div className="adminPage">
        {/* HEADER */}
        <header className="adminHeader">
          <div className="adminHeaderLeft">
            <h1>Admin Dashboard</h1>
            <p className="muted">Internal analytics & platform overview</p>
          </div>

          {/* Range picker */}
          <div className="adminHeaderRight">
            <div className="adminRange">
              <div className="muted small" style={{ marginBottom: 6 }}>
                Range
              </div>
              <div className="adminRangeRow">
                {RANGE_OPTIONS.map((o) => (
                  <ChipButton
                    key={o.days}
                    active={days === o.days}
                    onClick={() => setDays(o.days)}
                  >
                    {o.label}
                  </ChipButton>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="adminActions">
              <motion.a
                className="btnPrimary"
                href="/giveaway"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => track("admin_quick_open", { target: "giveaway" })}
              >
                Open Giveaway
              </motion.a>

              <motion.a
                className="btnGhost"
                href="/dashboard"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  track("admin_quick_open", { target: "dashboard" })
                }
              >
                User Dashboard
              </motion.a>
            </div>
          </div>
        </header>

        {/* PERFORMANCE */}
        <section className="adminSection">
          <h2 className="adminSectionTitle">Performance Overview (Live)</h2>

          <div className="adminGrid">
            <StatCard
              value={totalViews}
              label={`Total Page Views (Last ${days} Days)`}
              hint="Realtime from Firestore"
            />
            <StatCard
              value={websiteActivity}
              label={`Website Activity (Last ${days} Days)`}
              hint="Same proxy as page views"
            />
            <StatCard
              value={logins}
              label={`Logins (Last ${days} Days)`}
              hint="Track event “login” on success"
            />
            <StatCard
              value={registrations}
              label={`Registrations (Last ${days} Days)`}
              hint="Track event “register” on success"
            />
          </div>
        </section>

        {/* CONVERSIONS */}
        <section className="adminSection">
          <h2 className="adminSectionTitle">Conversions</h2>

          <div className="adminGrid">
            <StatCard
              value={giveawaySubmits}
              label={`Giveaway Entries (Last ${days} Days)`}
              hint="Track “giveaway_submit” after form submit"
            />
            <StatCard
              value={tryoutSubmits}
              label={`Tryout Submissions (Last ${days} Days)`}
              hint="Already tracked as “tryout_submit”"
            />
            <StatCard
              value={discordClicks}
              label={`Discord Clicks (Last ${days} Days)`}
              hint="Track “discord_click” from buttons"
            />
            <StatCard
              value={xClicks}
              label={`X Clicks (Last ${days} Days)`}
              hint="Track “x_click” from buttons"
            />
          </div>
        </section>

        {/* BREAKDOWN + TOP PAGES */}
        <section className="adminSection">
          <div className="adminSplit">
            {/* Breakdown */}
            <div className="adminCardWide">
              <div className="adminCardTitle">Event Breakdown</div>

              {eventBreakdown.length === 0 ? (
                <div className="muted">No events recorded for this range.</div>
              ) : (
                <div className="adminList">
                  {eventBreakdown.slice(0, 12).map(([k, v]) => (
                    <div className="adminListRow" key={k}>
                      <div className="adminListKey">{k}</div>
                      <div className="adminListVal">
                        {Number(v).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="muted small" style={{ marginTop: 10 }}>
                Tip: keep event names consistent (snake_case).
              </div>
            </div>

            {/* Top Pages */}
            <div className="adminCardWide">
              <div className="adminCardTitle">Top Pages</div>

              {topPages.length === 0 ? (
                <div className="muted">
                  Not available yet. To enable this, record page views by path
                  using keys like <code>page_view:/about</code>.
                </div>
              ) : (
                <div className="adminList">
                  {topPages.map(([path, v]) => (
                    <div className="adminListRow" key={path}>
                      <div className="adminListKey">{path}</div>
                      <div className="adminListVal">
                        {Number(v).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FOOTNOTE */}
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
