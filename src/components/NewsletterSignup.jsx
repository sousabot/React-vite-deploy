import React, { useState } from "react";

function encode(data) {
  return Object.keys(data)
    .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(data[k]))
    .join("&");
}

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [msg, setMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");

    const clean = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(clean)) {
      setStatus("error");
      setMsg("Please enter a valid email.");
      return;
    }

    setStatus("loading");
    try {
      // Netlify Forms expects POST to "/" with urlencoded body
      const body = encode({
        "form-name": "newsletter",
        email: clean,
      });

      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      if (!res.ok) throw new Error("Submit failed");

      setStatus("success");
      setMsg("✅ You’re in! We’ll email you for drops and restocks.");
      setEmail("");
    } catch {
      setStatus("error");
      setMsg("❌ Could not subscribe right now. Try again.");
    }
  }

  return (
    <div className="newsletter">
      <div className="newsletterTop">
        <div className="newsletterTitle">Newsletter</div>
        <div className="newsletterSub muted">
          Get drop alerts, restocks, and creator announcements.
        </div>
      </div>

      {/* Hidden Netlify form (required for detection) */}
      <form name="newsletter" data-netlify="true" netlify-honeypot="bot-field" hidden>
        <input name="bot-field" />
        <input type="hidden" name="form-name" value="newsletter" />
        <input type="email" name="email" />
      </form>

      {/* Visible form */}
      <form className="newsletterForm" onSubmit={onSubmit}>
        <input
          className="input newsletterInput"
          type="email"
          name="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <button className="btn btnPrimary newsletterBtn" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Joining…" : "Join"}
        </button>
      </form>

      {msg && <div className={`newsletterMsg ${status}`}>{msg}</div>}

      <div className="newsletterFine muted small">
        By subscribing you agree to receive emails from GD Esports. Unsubscribe anytime.
      </div>
    </div>
  );
}
