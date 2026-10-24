import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "./AuthCard.jsx";
import Field from "../../components/ui/Field.jsx";
import Alert from "../../components/ui/Alert.jsx";
import { useAuth } from "./useAuth.js";
import { authErrorMessage } from "./authErrors.js";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [gamerTag, setGamerTag] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!gamerTag.trim()) return setError("Please enter a gamer tag.");
    if (!email.trim()) return setError("Please enter an email.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    setBusy(true);
    try {
      await register({ gamerTag: gamerTag.trim(), email: email.trim(), password });
      navigate("/dashboard");
    } catch (ex) {
      setError(authErrorMessage(ex, "Registration failed. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      eyebrow="Members"
      title="Create account"
      sub="Join GD Esports."
      footer={
        <>
          Already have an account? <Link className="link" to="/login">Log in</Link>
        </>
      }
    >
      {error && <Alert tone="error">{error}</Alert>}
      <form className="auth__form" onSubmit={onSubmit}>
        <Field label="Gamer tag">
          <input
            className="input"
            value={gamerTag}
            onChange={(e) => setGamerTag(e.target.value)}
            placeholder="GD_Rookie"
            autoComplete="nickname"
          />
        </Field>
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
        <Field label="Password" hint="At least 6 characters">
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </Field>
        <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
          {busy ? "Creating…" : "Create account"}
        </button>
      </form>
    </AuthCard>
  );
}
