import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import PageMotion from "../components/PageMotion.jsx";
import { useAuth } from "../state/auth.jsx";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      if (!email.trim() || !password) throw new Error("Please enter email and password.");
      login(email.trim(), password);
      nav("/dashboard");
    } catch (ex) {
      setErr(ex?.message || "Login failed.");
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
          <h2>Login</h2>
          <p className="muted">Welcome back to GD Esports.</p>

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

            <motion.button
              className="btnPrimary"
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Login
            </motion.button>
          </form>

          <div className="muted small" style={{ marginTop: 10 }}>
            No account?{" "}
            <motion.span whileHover={{ opacity: 0.9 }}>
              <Link to="/register">Register</Link>
            </motion.span>
          </div>
        </motion.div>
      </div>
    </PageMotion>
  );
}
