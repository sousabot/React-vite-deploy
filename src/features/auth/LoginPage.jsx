import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "./AuthCard.jsx";
import Field from "../../components/ui/Field.jsx";
import Alert from "../../components/ui/Alert.jsx";
import { useAuth } from "./useAuth.js";

export default function LoginPage() {
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  function switchMode(next) {
    setError("");
    setNotice("");
    setMode(next);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email.trim(), password);
        navigate("/dashboard");
      } else {
        await resetPassword(email.trim());
        setNotice("Reset link sent. Check your inbox (and spam).");
      }
    } catch (ex) {
      setError(ex?.message || (mode === "login" ? "Login failed." : "Couldn't send reset email."));
    } finally {
      setBusy(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <AuthCard
      eyebrow="Members"
      title={isLogin ? "Log in" : "Reset password"}
      sub={isLogin ? "Welcome back to GD Esports." : "Enter your email and we'll send a reset link."}
      footer={
        isLogin ? (
          <>
            No account? <Link className="link" to="/register">Register</Link>
          </>
        ) : (
          <button type="button" className="link" onClick={() => switchMode("login")}>
            Back to login
          </button>
        )
      }
    >
      {error && <Alert tone="error">{error}</Alert>}
      {notice && <Alert tone="ok">{notice}</Alert>}

      <form className="auth__form" onSubmit={onSubmit}>
        <Field label="Email">
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
          />
        </Field>
        {isLogin && (
          <>
            <Field label="Password">
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </Field>
            <div className="auth__aside">
              <button type="button" className="link small" onClick={() => switchMode("reset")}>
                Forgot password?
              </button>
            </div>
          </>
        )}
        <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
          {busy ? "Working…" : isLogin ? "Log in" : "Send reset link"}
        </button>
      </form>
    </AuthCard>
  );
}
