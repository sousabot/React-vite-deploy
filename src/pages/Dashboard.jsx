import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";

import PageMotion from "../components/PageMotion.jsx";
import { useAuth } from "../state/auth.jsx";

const cardVariant = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user } = useAuth();

  const [status, setStatus] = useState("Ready");
  const [commScore, setCommScore] = useState(60);
  const [warmup, setWarmup] = useState(false);

  const greeting = useMemo(() => {
    const name = user?.gamerTag || user?.email || "Player";
    return `Welcome, ${name}`;
  }, [user]);

  const statusTone =
    status === "Ready" ? "Locked In" : status === "Queueing" ? "On Deck" : "AFK";

  return (
    <PageMotion>
      <div className="dash">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <h2>{greeting}</h2>
          <p className="muted">Your GD Esports hub. (Protected route — requires login.)</p>
        </motion.div>

        <motion.div
          className="grid2"
          variants={{ hidden: {}, show: {} }}
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.06 }}
          style={{ marginTop: 14 }}
        >
          {/* Status Card */}
          <motion.div className="panel" variants={cardVariant} whileHover={{ y: -3 }}>
            <h3>Scrim Status</h3>
            <p className="muted">Set your status so the squad knows your vibe.</p>

            <div className="row" style={{ marginTop: 10 }}>
              <motion.button
                className="btnGhost"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStatus("Ready")}
              >
                Ready
              </motion.button>
              <motion.button
                className="btnGhost"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStatus("Queueing")}
              >
                Queueing
              </motion.button>
              <motion.button
                className="btnGhost"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStatus("AFK")}
              >
                AFK
              </motion.button>
            </div>

            <motion.div
              className="badge big"
              style={{ marginTop: 12 }}
              initial={{ scale: 0.98, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.18 }}
              key={status}
            >
              {status} • {statusTone}
            </motion.div>
          </motion.div>

          {/* Comms Card */}
          <motion.div className="panel" variants={cardVariant} whileHover={{ y: -3 }}>
            <h3>Comms Quality</h3>
            <p className="muted">Interactive slider example — keep it crisp.</p>

            <input
              type="range"
              min="0"
              max="100"
              value={commScore}
              onChange={(e) => setCommScore(Number(e.target.value))}
              className="slider"
              style={{ marginTop: 10 }}
            />

            <div className="progress" style={{ marginTop: 10 }}>
              <div className="progressFill" style={{ width: `${commScore}%` }} />
            </div>

            <div className="muted" style={{ marginTop: 8 }}>
              {commScore}% {commScore > 80 ? "Elite" : commScore > 55 ? "Solid" : "Needs work"}
            </div>

            <div className="row" style={{ marginTop: 12 }}>
              <motion.button
                className="btnPrimary"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCommScore(90)}
              >
                Boost to 90
              </motion.button>

              <motion.button
                className="btnGhost"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCommScore(60)}
              >
                Reset
              </motion.button>
            </div>
          </motion.div>

          {/* Warmup Card */}
          <motion.div className="panel" variants={cardVariant} whileHover={{ y: -3 }}>
            <h3>Warmup Mode</h3>
            <p className="muted">A simple interactive toggle with motion feedback.</p>

            <motion.div
              className="panel"
              style={{
                marginTop: 10,
                background: "rgba(255,255,255,.04)",
                border: "1px solid rgba(255,255,255,.10)",
              }}
              whileHover={{ y: -1 }}
            >
              <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 800 }}>Aim Routine</div>
                  <div className="muted small">Enable timed warmup reminders</div>
                </div>

                <motion.button
                  className={warmup ? "btnPrimary" : "btnGhost"}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setWarmup((v) => !v)}
                >
                  {warmup ? "On" : "Off"}
                </motion.button>
              </div>
            </motion.div>

            <div className="muted" style={{ marginTop: 10 }}>
              Status: <strong style={{ color: "rgba(255,255,255,.9)" }}>{warmup ? "Active" : "Inactive"}</strong>
            </div>
          </motion.div>

          {/* Quick Notes Card */}
          <motion.div className="panel" variants={cardVariant} whileHover={{ y: -3 }}>
            <h3>Quick Notes</h3>
            <p className="muted">Tiny “dashboard app” element. Type and it saves for the session.</p>

            <NoteBox />
          </motion.div>
        </motion.div>
      </div>
    </PageMotion>
  );
}

function NoteBox() {
  const [note, setNote] = useState("");

  return (
    <div style={{ marginTop: 10 }}>
      <textarea
        className="input"
        style={{ minHeight: 110, resize: "vertical" }}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Drop strats, lineups, reminders…"
      />
      <div className="muted small" style={{ marginTop: 8 }}>
        {note.length} characters
      </div>
    </div>
  );
}
