import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import PageMotion from "../components/PageMotion.jsx";
import { useAuth } from "../state/auth.jsx";

export default function Login() {
  const { login, resetPassword } = useAuth();
  const nav = useNavigate();

  const [mode, setMode] = useState("login"); // "login" | "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      await login(email.trim(), password);
      nav("/dashboard");
    } catch (ex) {
      setErr(ex?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  async function onReset(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      await resetPassword(email.trim());
      setMsg("Reset link sent ✅ Check your email inbox (and spam).");
    } catch (ex) {
      setErr(ex?.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageMotion>
      <div className="authWrap">
        <motion.div
          className="authCard"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <h2>{mode === "login" ? "Login" : "Reset Password"}</h2>
          <p className="muted">
            {mode === "login"
              ? "Welcome back to GD Esports."
              : "Enter your email and we’ll send you a reset link."}
          </p>

          {err && (
            <motion.div
              className="alert"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {err}
            </motion.div>
          )}

          {msg && (
            <motion.div
              className="alert success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {msg}
            </motion.div>
          )}

          {mode === "login" ? (
            <form onSubmit={onSubmit} className="form">
              <label className="label">Email</label>
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
              />

              <label className="label">Password</label>
              <input
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
                autoComplete="current-password"
              />

              <div className="authRow">
                <button
                  type="button"
                  className="linkBtn"
                  onClick={() => {
                    setErr("");
                    setMsg("");
                    setMode("reset");
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <motion.button
                className="btnPrimary"
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? "Logging in..." : "Login"}
              </motion.button>
            </form>
          ) : (
            <form onSubmit={onReset} className="form">
              <label className="label">Email</label>
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
              />

              <motion.button
                className="btnPrimary"
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? "Sending..." : "Send reset link"}
              </motion.button>

              <button
                type="button"
                className="linkBtn"
                style={{ marginTop: 10 }}
                onClick={() => {
                  setErr("");
                  setMsg("");
                  setMode("login");
                }}
              >
                Back to login
              </button>
            </form>
          )}

          {mode === "login" && (
            <div className="muted small" style={{ marginTop: 10 }}>
              No account?{" "}
              <motion.span whileHover={{ opacity: 0.9 }}>
                <Link to="/register">Register</Link>
              </motion.span>
            </div>
          )}
        </motion.div>
      </div>
    </PageMotion>
  );
}
