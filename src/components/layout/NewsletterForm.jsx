import React, { useState } from "react";
import { encodeForm } from "../../lib/format.js";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    const clean = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(clean)) {
      setStatus("error");
      setMsg("Enter a valid email.");
      return;
    }

    setStatus("loading");
    setMsg("");
    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeForm({ "form-name": "newsletter", email: clean }),
      });
      if (!res.ok) throw new Error("Submit failed");
      setStatus("success");
      setMsg("You're in. Drops and restocks land in your inbox first.");
      setEmail("");
    } catch {
      setStatus("error");
      setMsg("Couldn't subscribe right now. Try again.");
    }
  }

  return (
    <div className="newsletter">
      <form className="newsletter__form" onSubmit={onSubmit} noValidate>
        <label className="sr-only" htmlFor="newsletter-email">
          Email
        </label>
        <input
          id="newsletter-email"
          className="input"
          type="email"
          name="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <button className="btn btn--primary" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "…" : "Join"}
        </button>
      </form>
      {msg && <div className={`newsletter__msg is-${status}`}>{msg}</div>}
      <p className="faint small">Drops, restocks and announcements. Unsubscribe anytime.</p>
    </div>
  );
}
