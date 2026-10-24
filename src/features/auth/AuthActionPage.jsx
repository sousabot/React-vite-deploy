import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { applyActionCode, confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import AuthCard from "./AuthCard.jsx";
import Field from "../../components/ui/Field.jsx";
import Alert from "../../components/ui/Alert.jsx";
import { auth } from "../../lib/firebase.js";
import { authErrorMessage } from "./authErrors.js";

const LINK_ERRORS = {
  "auth/expired-action-code": "This link has expired. Request a new one from the login page.",
  "auth/invalid-action-code": "This link is invalid or has already been used. Request a new one from the login page.",
  "auth/user-disabled": "This account has been disabled.",
};

function linkError(ex) {
  return LINK_ERRORS[ex?.code] || authErrorMessage(ex, "Something went wrong with this link.");
}

const BackToLogin = () => (
  <Link to="/login" className="btn btn--primary btn--block">
    Go to login
  </Link>
);

function ResetPassword({ code }) {
  const [status, setStatus] = useState("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    verifyPasswordResetCode(auth, code)
      .then((addr) => {
        if (!alive) return;
        setEmail(addr);
        setStatus("ready");
      })
      .catch((ex) => {
        if (!alive) return;
        setError(linkError(ex));
        setStatus("invalid");
      });
    return () => {
      alive = false;
    };
  }, [code]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) return setError("Password needs at least 6 characters.");
    if (password !== confirm) return setError("Passwords don't match.");
    setBusy(true);
    try {
      await confirmPasswordReset(auth, code, password);
      setStatus("done");
    } catch (ex) {
      setError(linkError(ex));
    } finally {
      setBusy(false);
    }
  }

  if (status === "checking") {
    return <AuthCard eyebrow="Account" title="Reset password" sub="Checking your link…" />;
  }

  if (status === "invalid") {
    return (
      <AuthCard eyebrow="Account" title="Link expired">
        <Alert tone="error">{error}</Alert>
        <BackToLogin />
      </AuthCard>
    );
  }

  if (status === "done") {
    return (
      <AuthCard eyebrow="Account" title="Password updated" sub={`You can now log in as ${email} with your new password.`}>
        <BackToLogin />
      </AuthCard>
    );
  }

  return (
    <AuthCard eyebrow="Account" title="New password" sub={<>Choose a new password for <strong>{email}</strong>.</>}>
      {error && <Alert tone="error">{error}</Alert>}
      <form className="auth__form" onSubmit={onSubmit}>
        <input type="email" value={email} autoComplete="username" readOnly hidden />
        <Field label="New password" hint="At least 6 characters">
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            autoFocus
          />
        </Field>
        <Field label="Confirm password">
          <input
            className="input"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </Field>
        <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save password"}
        </button>
      </form>
    </AuthCard>
  );
}

function ApplyCode({ code, title, doneSub }) {
  const [status, setStatus] = useState("checking");
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    applyActionCode(auth, code)
      .then(() => alive && setStatus("done"))
      .catch((ex) => {
        if (!alive) return;
        setError(linkError(ex));
        setStatus("invalid");
      });
    return () => {
      alive = false;
    };
  }, [code]);

  if (status === "checking") return <AuthCard eyebrow="Account" title={title} sub="One moment…" />;

  return (
    <AuthCard eyebrow="Account" title={status === "done" ? title : "Link expired"} sub={status === "done" ? doneSub : null}>
      {error && <Alert tone="error">{error}</Alert>}
      <BackToLogin />
    </AuthCard>
  );
}

export default function AuthActionPage() {
  const [params] = useSearchParams();
  const mode = params.get("mode");
  const code = params.get("oobCode");

  if (!code) {
    return (
      <AuthCard eyebrow="Account" title="Invalid link">
        <Alert tone="error">This link is missing information. Request a new one from the login page.</Alert>
        <BackToLogin />
      </AuthCard>
    );
  }

  if (mode === "resetPassword") return <ResetPassword code={code} />;
  if (mode === "verifyEmail") return <ApplyCode code={code} title="Email verified" doneSub="Thanks — your email is confirmed." />;
  if (mode === "recoverEmail") {
    return <ApplyCode code={code} title="Email restored" doneSub="Your account email has been changed back. Consider resetting your password." />;
  }

  return (
    <AuthCard eyebrow="Account" title="Invalid link">
      <Alert tone="error">We don't recognise this link.</Alert>
      <BackToLogin />
    </AuthCard>
  );
}
