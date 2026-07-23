import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import PageMotion from "../components/PageMotion.jsx";
import { useAuth } from "../state/auth.jsx";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [gamerTag, setGamerTag] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      if (!gamerTag.trim()) throw new Error("Please enter a gamer tag.");
      if (!email.trim()) throw new Error("Please enter an email.");
      if (password.length < 6) throw new Error("Password must be at least 6 characters.");
      register({ gamerTag: gamerTag.trim(), email: email.trim(), password });
      nav("/dashboard");
    } catch (ex) {
      setErr(ex?.message || "Register failed.");
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
          <h2>Register</h2>
          <p className="muted">Create your GD Esports account.</p>

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
            <label className="label">Gamer Tag</label>
            <input
              className="input"
              value={gamerTag}
              onChange={(e) => setGamerTag(e.target.value)}
              placeholder="GD_Rookie"
              autoComplete="nickname"
            />

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
              placeholder="at least 6 characters"
              type="password"
              autoComplete="new-password"
            />

            <motion.button
              className="btnPrimary"
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Create Account
            </motion.button>
          </form>

          <div className="muted small" style={{ marginTop: 10 }}>
            Already have an account?{" "}
            <motion.span whileHover={{ opacity: 0.9 }}>
              <Link to="/login">Login</Link>
            </motion.span>
          </div>
        </motion.div>
      </div>
    </PageMotion>
  );
}
