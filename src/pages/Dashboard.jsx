import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import PageMotion from "../components/PageMotion.jsx";
import { useAuth } from "../state/auth.jsx";

const cardVariant = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

const LS_KEYS = {
  goals: "gd_dash_goals",
  schedule: "gd_dash_schedule",
  links: "gd_dash_links",
};

export default function Dashboard() {
  const { user } = useAuth();


  const [commScore, setCommScore] = useState(60);
  const [warmup, setWarmup] = useState(false);

  const greeting = useMemo(() => {
    const name = user?.gamerTag || user?.email || "Player";
    return `Welcome, ${name}`;
  }, [user]);


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
              Status:{" "}
              <strong style={{ color: "rgba(255,255,255,.9)" }}>
                {warmup ? "Active" : "Inactive"}
              </strong>
            </div>
          </motion.div>

          {/* NEW: Schedule */}
          <motion.div className="panel" variants={cardVariant} whileHover={{ y: -3 }}>
            <h3>Upcoming Schedule</h3>
            <p className="muted">Scrims, tournaments, content drops — keep it tight.</p>
            <ScheduleCard />
          </motion.div>

          {/* NEW: Goals */}
          <motion.div className="panel" variants={cardVariant} whileHover={{ y: -3 }}>
            <h3>Goals Tracker</h3>
            <p className="muted">Lock in daily/weekly targets. Progress stays saved.</p>
            <GoalsCard />
          </motion.div>

          {/* NEW: Links & Copy */}
          <motion.div className="panel" variants={cardVariant} whileHover={{ y: -3 }}>
            <h3>Quick Links</h3>
            <p className="muted">Copy important links fast (Discord, OP.GG, sheets).</p>
            <QuickLinksCard />
          </motion.div>
        </motion.div>
      </div>
    </PageMotion>
  );
}

/* ---------------- helpers ---------------- */

function BtnGhost({ children, onClick }) {
  return (
    <motion.button
      className="btnGhost"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}

function useLocalStorageState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return initialValue;
      return JSON.parse(raw);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key, value]);

  return [value, setValue];
}

/* ---------------- Schedule ---------------- */

function ScheduleCard() {
  const [items, setItems] = useLocalStorageState(LS_KEYS.schedule, [
    { id: cryptoRandomId(), title: "Scrim vs TBD", date: nextDateISO(1), time: "20:00" },
  ]);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(nextDateISO(1));
  const [time, setTime] = useState("20:00");

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const aa = `${a.date}T${a.time || "00:00"}`;
      const bb = `${b.date}T${b.time || "00:00"}`;
      return aa.localeCompare(bb);
    });
  }, [items]);

  function addItem() {
    if (!title.trim()) return;
    setItems((prev) => [
      ...prev,
      { id: cryptoRandomId(), title: title.trim(), date, time },
    ]);
    setTitle("");
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div style={{ marginTop: 10 }}>
      <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
        <input
          className="input"
          placeholder="Event (e.g., Scrim vs ABC)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: "1 1 220px" }}
        />
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <motion.button
          className="btnPrimary"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={addItem}
        >
          Add
        </motion.button>
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        {sorted.length === 0 ? (
          <div className="muted small">No events yet.</div>
        ) : (
          sorted.map((it) => (
            <div
              key={it.id}
              className="panel"
              style={{
                padding: "10px 12px",
                background: "rgba(255,255,255,.04)",
                border: "1px solid rgba(255,255,255,.10)",
              }}
            >
              <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{it.title}</div>
                  <div className="muted small">
                    {it.date} • {it.time}
                  </div>
                </div>
                <BtnGhost onClick={() => removeItem(it.id)}>Remove</BtnGhost>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ---------------- Goals ---------------- */

function GoalsCard() {
  const [goals, setGoals] = useLocalStorageState(LS_KEYS.goals, [
    { id: cryptoRandomId(), text: "Review 2 VODs", done: false },
    { id: cryptoRandomId(), text: "Play 3 ranked games", done: false },
    { id: cryptoRandomId(), text: "20 min mechanics warmup", done: false },
  ]);

  const [text, setText] = useState("");

  const doneCount = goals.filter((g) => g.done).length;
  const pct = goals.length ? Math.round((doneCount / goals.length) * 100) : 0;

  function toggle(id) {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, done: !g.done } : g)));
  }

  function addGoal() {
    if (!text.trim()) return;
    setGoals((prev) => [...prev, { id: cryptoRandomId(), text: text.trim(), done: false }]);
    setText("");
  }

  function clearDone() {
    setGoals((prev) => prev.filter((g) => !g.done));
  }

  return (
    <div style={{ marginTop: 10 }}>
      <div className="progress" style={{ marginTop: 6 }}>
        <div className="progressFill" style={{ width: `${pct}%` }} />
      </div>
      <div className="muted small" style={{ marginTop: 8 }}>
        {pct}% complete • {doneCount}/{goals.length} done
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        {goals.map((g) => (
          <label
            key={g.id}
            className="panel"
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              padding: "10px 12px",
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.10)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={g.done}
              onChange={() => toggle(g.id)}
              style={{ transform: "scale(1.1)" }}
            />
            <span style={{ opacity: g.done ? 0.6 : 1, textDecoration: g.done ? "line-through" : "none" }}>
              {g.text}
            </span>
          </label>
        ))}
      </div>

      <div className="row" style={{ marginTop: 12, gap: 10, flexWrap: "wrap" }}>
        <input
          className="input"
          placeholder="Add a goal…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ flex: "1 1 220px" }}
        />
        <motion.button className="btnPrimary" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={addGoal}>
          Add
        </motion.button>
        <BtnGhost onClick={clearDone}>Clear done</BtnGhost>
      </div>
    </div>
  );
}

/* ---------------- Links ---------------- */

function QuickLinksCard() {
  const [toast, setToast] = useState("");

  const [links, setLinks] = useLocalStorageState(LS_KEYS.links, [
    { id: cryptoRandomId(), label: "Discord Invite", value: "https://discord.gg/yourinvite" },
    { id: cryptoRandomId(), label: "OP.GG Team", value: "https://www.op.gg/" },
    { id: cryptoRandomId(), label: "Team Sheet", value: "https://docs.google.com/" },
  ]);

  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      setToast("Copied!");
      setTimeout(() => setToast(""), 1200);
    } catch {
      setToast("Copy failed");
      setTimeout(() => setToast(""), 1200);
    }
  }

  function addLink() {
    if (!label.trim() || !value.trim()) return;
    setLinks((prev) => [...prev, { id: cryptoRandomId(), label: label.trim(), value: value.trim() }]);
    setLabel("");
    setValue("");
  }

  function remove(id) {
    setLinks((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "grid", gap: 10 }}>
        {links.map((l) => (
          <div
            key={l.id}
            className="panel"
            style={{
              padding: "10px 12px",
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.10)",
            }}
          >
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 800 }}>{l.label}</div>
                <div className="muted small" style={{ wordBreak: "break-all" }}>
                  {l.value}
                </div>
              </div>

              <div className="row" style={{ gap: 10 }}>
                <BtnGhost onClick={() => copy(l.value)}>Copy</BtnGhost>
                <BtnGhost onClick={() => window.open(l.value, "_blank", "noreferrer")}>Open</BtnGhost>
                <BtnGhost onClick={() => remove(l.id)}>Remove</BtnGhost>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row" style={{ marginTop: 12, gap: 10, flexWrap: "wrap" }}>
        <input
          className="input"
          placeholder="Label (e.g., Discord)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          style={{ flex: "1 1 180px" }}
        />
        <input
          className="input"
          placeholder="URL"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ flex: "2 1 260px" }}
        />
        <motion.button className="btnPrimary" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={addLink}>
          Add
        </motion.button>
      </div>

      {toast && (
        <div className="muted small" style={{ marginTop: 10 }}>
          {toast}
        </div>
      )}
    </div>
  );
}

/* ---------------- utils ---------------- */

function cryptoRandomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function nextDateISO(daysAhead = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
