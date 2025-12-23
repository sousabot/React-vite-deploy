import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import PageMotion from "../components/PageMotion.jsx";
import { useAuth } from "../state/auth.jsx";

export default function Login() {
  const { login, resetPassword, confirmPasswordReset } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const [mode, setMode] = useState("login"); // "login" | "resetRequest" | "resetConfirm"
  const [loading, setLoading] = useState(false);

  // reset confirm fields
  const [resetCode, setResetCode] = useState("");
  const [newPass, setNewPass] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      if (!email.trim() || !password) throw new Error("Please enter email and password.");
      await login(email.trim(), password);
      nav("/dashboard");
    } catch (ex) {
      setErr(ex?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  async function onResetRequest(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      const em = email.trim();
      if (!em) throw new Error("Please enter your email.");

      const res = await resetPassword(em);

      // localStorage auth can't email, so show code (demo)
      if (res?.code) {
        setMsg(`Reset code (demo): ${res.code}. Enter it below to set a new password.`);
        setMode("resetConfirm");
      } else {
        // generic message (don’t leak whether account exists)
        setMsg("If that email exists, a reset link/code has been sent.");
      }
    } catch (ex) {
      setErr(ex?.message || "Failed to request reset.");
    } finally {
      setLoading(false);
    }
  }

  async function onResetConfirm(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      const em = email.trim();
      if (!em) throw new Error("Please enter your email.");
      if (!resetCode.trim()) throw new Error("Enter the reset code.");
      if (!newPass) throw new Error("Enter a new password.");
      if (newPass.length < 6) throw new Error("Password must be at least 6 characters.");

      await confirmPasswordReset(em, resetCode.trim(), newPass);
      setMsg("Password updated ✅ You can log in now.");
      setMode("login");
      setPassword("");
      setResetCode("");
      setNewPass("");
    } catch (ex) {
      setErr(ex?.message || "Reset failed.");
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
          <h2>
            {mode === "login"
              ? "Login"
              : mode === "resetRequest"
              ? "Reset Password"
              : "Set New Password"}
          </h2>

          <p className="muted">
            {mode === "login"
              ? "Welcome back to GD Esports."
              : mode === "resetRequest"
              ? "Enter your email to request a reset."
              : "Enter the code and your new password."}
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

          {/* EMAIL always visible for reset flow */}
          <label className="label">Email</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
          />

          {mode === "login" && (
            <form onSubmit={onSubmit} className="form" style={{ marginTop: 10 }}>
              <label className="label">Password</label>
              <input
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
                autoComplete="current-password"
              />

              <div className="authRow" style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="linkBtn"
                  onClick={() => {
                    setErr("");
                    setMsg("");
                    setMode("resetRequest");
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
          )}

          {mode === "resetRequest" && (
            <form onSubmit={onResetRequest} className="form" style={{ marginTop: 10 }}>
              <motion.button
                className="btnPrimary"
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? "Sending..." : "Send reset code"}
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

          {mode === "resetConfirm" && (
            <form onSubmit={onResetConfirm} className="form" style={{ marginTop: 10 }}>
              <label className="label">Reset Code</label>
              <input
                className="input"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="123456"
                inputMode="numeric"
              />

              <label className="label">New Password</label>
              <input
                className="input"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="New password"
                type="password"
                autoComplete="new-password"
              />

              <motion.button
                className="btnPrimary"
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? "Updating..." : "Update password"}
              </motion.button>

              <button
                type="button"
                className="linkBtn"
                style={{ marginTop: 10 }}
                onClick={() => {
                  setErr("");
                  setMsg("");
                  setMode("login");
                  setResetCode("");
                  setNewPass("");
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
