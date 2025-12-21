import React, { useState } from "react";
import { motion } from "framer-motion";
import PageMotion from "../components/PageMotion.jsx";

function encodeForm(data) {
  return new URLSearchParams(data).toString();
}

export default function WorkWithUs() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

async function onSubmit(e) {
  e.preventDefault();
  setError("");

  const form = e.currentTarget;
  const formData = new FormData(form);

  const payloadObj = {
    "form-name": "work-with-us",
    ...Object.fromEntries(formData.entries()),
  };

  try {
    // 1) Send to Discord first
    const discordRes = await fetch("/.netlify/functions/form-to-discord", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encodeForm(payloadObj),
    });

    if (!discordRes.ok) {
      const msg = await discordRes.text().catch(() => "");
      throw new Error(`Discord failed (${discordRes.status}) ${msg}`.trim());
    }

    // 2) Now submit to Netlify Forms (native submit)
    // This will POST to /success.html (a real file) and Netlify will store the form submission.
    form.submit();
  } catch (err) {
    console.error(err);
    setError(err?.message || "Something went wrong. Please try again.");
  }
}

  return (
    <PageMotion>
      <div className="workPage">
        <h2 className="pageTitle">Work With Us</h2>
        <p className="pageDesc">
          Apply for collaborations, competitive teams, or staff roles at GD Esports.
        </p>

        {!submitted ? (
      <motion.form
  name="work-with-us"
  method="POST"
  action="/success.html"
  data-netlify="true"
  data-netlify-honeypot="bot-field"
  onSubmit={onSubmit}
>
            {/* Required for Netlify */}
            <input type="hidden" name="form-name" value="work-with-us" />

            {/* Honeypot (anti-spam) */}
            <input type="hidden" name="bot-field" />

            {/* Name */}
            <div className="formRow">
              <input
                name="firstName"
                className="input"
                placeholder="First Name"
                autoComplete="given-name"
                required
              />
              <input
                name="lastName"
                className="input"
                placeholder="Last Name"
                autoComplete="family-name"
                required
              />
            </div>

            {/* Age */}
            <div className="formRow">
              <input
                name="age"
                className="input"
                type="number"
                placeholder="Age"
                min="13"
                required
              />
            </div>

            {/* About */}
            <div className="formRow">
              <textarea
                name="about"
                className="input textarea"
                placeholder="Tell us about yourself"
                rows={4}
                required
              />
            </div>

            {/* Tournaments */}
            <div className="formRow">
              <textarea
                name="tournaments"
                className="input textarea"
                placeholder="Tournaments you have played in"
                rows={3}
              />
            </div>

            {/* Discord */}
            <div className="formRow">
              <input
                name="discord"
                className="input"
                placeholder="Discord username (e.g. user#1234)"
                required
              />
            </div>

            {error && <div className="formError">{error}</div>}

            <motion.button
              className="btnPrimary"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
            >
              Submit Application
            </motion.button>
          </motion.form>
        ) : (
          <motion.div
            className="formSuccess"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3>Application submitted ✅</h3>
            <p className="muted">Thanks — we’ll review it and get back to you.</p>

            <motion.button
              className="btnGhost"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSubmitted(false);
                setError("");
              }}
            >
              Submit another
            </motion.button>
          </motion.div>
        )}
      </div>
    </PageMotion>
  );
}
