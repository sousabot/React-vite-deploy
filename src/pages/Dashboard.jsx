import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import PageMotion from "../components/PageMotion.jsx";
import { useAuth } from "../state/auth.jsx";

const cardVariant = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

const LS = {
  focus: "gd_dash_focus",
  notes: "gd_dash_notes",
  creators: "gd_dash_creators",
};

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

function cryptoRandomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export default function Dashboard() {
  const { user } = useAuth();

  const greeting = useMemo(() => {
    const name = user?.gamerTag || user?.email || "Player";
    return `Welcome, ${name}`;
  }, [user]);

  return (
    <PageMotion>
      <div className="dash" style={{ maxWidth: 1100 }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <h2>{greeting}</h2>
          <p className="muted">Your GD Esports hub — quick actions, focus list, and Twitch info.</p>
        </motion.div>

        <motion.div
          className="grid2"
          variants={{ hidden: {}, show: {} }}
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.06 }}
          style={{ marginTop: 14 }}
        >
          <motion.div className="panel" variants={cardVariant} whileHover={{ y: -3 }}>
            <h3>Quick Actions</h3>
            <p className="muted">Jump to the most-used pages.</p>
            <QuickActions />
          </motion.div>

          <motion.div className="panel" variants={cardVariant} whileHover={{ y: -3 }}>
            <h3>Today’s Focus</h3>
            <p className="muted">A simple checklist that saves automatically.</p>
            <FocusList />
          </motion.div>

          <motion.div className="panel" variants={cardVariant} whileHover={{ y: -3 }}>
            <h3>Notes</h3>
            <p className="muted">Quick notes for scrims, content ideas, reminders.</p>
            <Notes />
          </motion.div>

          <motion.div className="panel" variants={cardVariant} whileHover={{ y: -3 }}>
            <h3>Twitch</h3>
            <p className="muted">Check stream status + pull recent clips.</p>
            <TwitchPanel />
          </motion.div>
        </motion.div>
      </div>
    </PageMotion>
  );
}

/* ---------------- components ---------------- */

function BtnGhost({ children, onClick, type = "button" }) {
  return (
    <motion.button
      type={type}
      className="btnGhost"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}

function QuickActions() {
  const actions = [
    { label: "Creators", href: "/creators" },
    { label: "Clips", href: "/clips" },
    { label: "Giveaway", href: "/giveaway" },
    { label: "Shop", href: "/shop" },
    { label: "News", href: "/news" },
    { label: "Admin", href: "/admin" },
  ];

  return (
    <div className="row" style={{ gap: 10, flexWrap: "wrap", marginTop: 10 }}>
      {actions.map((a) => (
        <motion.a
          key={a.href}
          href={a.href}
          className="btnPrimary"
          style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          {a.label}
        </motion.a>
      ))}
    </div>
  );
}

function FocusList() {
  const [items, setItems] = useLocalStorageState(LS.focus, [
    { id: cryptoRandomId(), text: "Post 1 short clip", done: false },
    { id: cryptoRandomId(), text: "Check scrim schedule", done: false },
    { id: cryptoRandomId(), text: "Reply to creators", done: false },
  ]);

  const [text, setText] = useState("");

  const doneCount = items.filter((i) => i.done).length;
  const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0;

  function toggle(id) {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  }

  function add() {
    if (!text.trim()) return;
    setItems((prev) => [...prev, { id: cryptoRandomId(), text: text.trim(), done: false }]);
    setText("");
  }

  function clearDone() {
    setItems((prev) => prev.filter((x) => !x.done));
  }

  return (
    <div style={{ marginTop: 10 }}>
      <div className="progress" style={{ marginTop: 6 }}>
        <div className="progressFill" style={{ width: `${pct}%` }} />
      </div>
      <div className="muted small" style={{ marginTop: 8 }}>
        {pct}% complete • {doneCount}/{items.length} done
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        {items.map((it) => (
          <label
            key={it.id}
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
            <input type="checkbox" checked={it.done} onChange={() => toggle(it.id)} />
            <span style={{ opacity: it.done ? 0.6 : 1, textDecoration: it.done ? "line-through" : "none" }}>
              {it.text}
            </span>
          </label>
        ))}
      </div>

      <div className="row" style={{ marginTop: 12, gap: 10, flexWrap: "wrap" }}>
        <input
          className="input"
          placeholder="Add a focus item…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ flex: "1 1 220px" }}
        />
        <motion.button className="btnPrimary" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={add}>
          Add
        </motion.button>
        <BtnGhost onClick={clearDone}>Clear done</BtnGhost>
      </div>
    </div>
  );
}

function Notes() {
  const [notes, setNotes] = useLocalStorageState(LS.notes, "");

  return (
    <div style={{ marginTop: 10 }}>
      <textarea
        className="input"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Type notes here…"
        style={{ minHeight: 160, resize: "vertical", lineHeight: 1.4 }}
      />
      <div className="muted small" style={{ marginTop: 8 }}>
        Autosaved to this browser.
      </div>
    </div>
  );
}

function TwitchPanel() {
  const [creatorList, setCreatorList] = useLocalStorageState(LS.creators, "mewtzu,kaymael");
  const [liveMap, setLiveMap] = useState({});
  const [liveErr, setLiveErr] = useState("");
  const [checkingLive, setCheckingLive] = useState(false);

  const [clipUsers, setClipUsers] = useState("");
  const [clips, setClips] = useState([]);
  const [clipsErr, setClipsErr] = useState("");
  const [loadingClips, setLoadingClips] = useState(false);

  async function checkAllLive() {
    setLiveErr("");
    setCheckingLive(true);

    const logins = creatorList
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (logins.length === 0) {
      setCheckingLive(false);
      setLiveErr("Enter usernames like: mewtzu,kaymael");
      return;
    }

    try {
      const results = await Promise.all(
        logins.map(async (login) => {
          try {
            const res = await fetch(
              `/.netlify/functions/twitch-live?user=${encodeURIComponent(login)}`
            );
            if (!res.ok) return [login, { isLive: false, error: true }];
            const data = await res.json();
            return [
              login,
              {
                isLive: !!data?.isLive,
                title: data?.title || "",
                viewerCount: data?.viewerCount || 0,
              },
            ];
          } catch {
            return [login, { isLive: false, error: true }];
          }
        })
      );

      const next = {};
      for (const [login, info] of results) next[login] = info;
      setLiveMap(next);
    } catch (e) {
      setLiveErr(e?.message || "Live check failed");
    } finally {
      setCheckingLive(false);
    }
  }

  useEffect(() => {
    checkAllLive();
    // refresh every 60s like Creators page
    const t = setInterval(checkAllLive, 60_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadClips() {
    setClipsErr("");
    setClips([]);
    const users = clipUsers.trim();
    if (!users) return setClipsErr("Enter one or more usernames (comma-separated).");

    setLoadingClips(true);
    try {
      const url = `/.netlify/functions/twitch-clips?users=${encodeURIComponent(users)}&days=7&first=12`;
      const res = await fetch(url);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to load clips");
      if (data?.error) throw new Error(data.error);
      setClips(Array.isArray(data.clips) ? data.clips : []);
    } catch (e) {
      setClipsErr(e?.message || "Failed to load clips");
    } finally {
      setLoadingClips(false);
    }
  }

  const logins = creatorList
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div style={{ marginTop: 10, display: "grid", gap: 14 }}>
      {/* Multi Live checker */}
      <div
        className="panel"
        style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.10)" }}
      >
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Stream Status (multiple)</div>

        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <input
            className="input"
            placeholder="mewtzu,kaymael"
            value={creatorList}
            onChange={(e) => setCreatorList(e.target.value)}
            style={{ flex: "1 1 260px" }}
          />
          <motion.button
            className="btnPrimary"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={checkAllLive}
            disabled={checkingLive}
          >
            {checkingLive ? "Checking…" : "Check"}
          </motion.button>
        </div>

        {liveErr && <div className="muted small" style={{ marginTop: 8 }}>❌ {liveErr}</div>}

        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
          {logins.length === 0 ? (
            <div className="muted small">Add usernames to check live status.</div>
          ) : (
            logins.map((login) => {
              const info = liveMap[login];
              const isLive = !!info?.isLive;

              return (
                <div
                  key={login}
                  className="panel"
                  style={{
                    padding: "10px 12px",
                    background: "rgba(255,255,255,.04)",
                    border: "1px solid rgba(255,255,255,.10)",
                  }}
                >
                  <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800 }}>
                        {isLive ? "✅ LIVE" : "🟡 OFFLINE"} — {login}
                      </div>
                      {isLive && (
                        <div className="muted small" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {info?.title || "Live now"} • {info?.viewerCount || 0} viewers
                        </div>
                      )}
                      {!isLive && info?.error && (
                        <div className="muted small">Could not load status (try again).</div>
                      )}
                    </div>

                    <BtnGhost onClick={() => window.open(`https://www.twitch.tv/${login}`, "_blank", "noreferrer")}>
                      Open
                    </BtnGhost>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Clips loader */}
      <div
        className="panel"
        style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.10)" }}
      >
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Recent Clips (last 7 days)</div>

        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <input
            className="input"
            placeholder="user1,user2,user3"
            value={clipUsers}
            onChange={(e) => setClipUsers(e.target.value)}
            style={{ flex: "1 1 220px" }}
          />
          <motion.button
            className="btnPrimary"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadClips}
            disabled={loadingClips}
          >
            {loadingClips ? "Loading…" : "Load Clips"}
          </motion.button>
        </div>

        {clipsErr && <div className="muted small" style={{ marginTop: 8 }}>❌ {clipsErr}</div>}

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {clips.length === 0 && !clipsErr && <div className="muted small">No clips loaded yet.</div>}

          {clips.map((c) => (
            <div
              key={c.id}
              className="panel"
              style={{
                padding: "10px 12px",
                background: "rgba(255,255,255,.04)",
                border: "1px solid rgba(255,255,255,.10)",
              }}
            >
              <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.title}
                  </div>
                  <div className="muted small">
                    {c.broadcaster_name} • {c.view_count} views
                  </div>
                </div>

                <BtnGhost onClick={() => window.open(c.url, "_blank", "noreferrer")}>Open</BtnGhost>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
