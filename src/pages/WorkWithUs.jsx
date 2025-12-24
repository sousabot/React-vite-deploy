import React, { useState } from "react";
import { motion } from "framer-motion";
import PageMotion from "../components/PageMotion.jsx";

function encodeForm(data) {
  return new URLSearchParams(data).toString();
}

export default function WorkWithUs() {
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitted(false);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const entries = Object.fromEntries(formData.entries());

    const payload = {
      type: "work_with_us",
      ...entries,
    };

    try {
      // ✅ Send to Discord
      const res = await fetch("/.netlify/functions/form-to-discord", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeForm(payload),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Submission failed");
      }

      // ✅ Success
      setSubmitted(true);
      form.reset();
    } catch (err) {
      console.error(err);
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageMotion>
      <div className="workPage">
        <h2 className="pageTitle">Work With Us</h2>
        <p className="pageDesc">
          Apply for collaborations, competitive teams, or staff roles at GD Esports.
        </p>

        <motion.form
          className="workForm"
          name="work-with-us"
          method="POST"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Required for Netlify */}
          <input type="hidden" name="form-name" value="work-with-us" />

          {/* Honeypot */}
          <p style={{ display: "none" }}>
            <label>
              Don’t fill this out if you’re human: <input name="bot-field" />
            </label>
          </p>

          {/* Form fields */}
          <div className="formRow">
            <input name="firstName" className="input" placeholder="First Name" required />
            <input name="lastName" className="input" placeholder="Last Name" required />
          </div>

          <div className="formRow">
            <input name="age" type="number" className="input" placeholder="Age" min="13" required />
          </div>

          <div className="formRow">
            <textarea
              name="about"
              className="input textarea"
              placeholder="Tell us about yourself"
              rows={4}
              required
            />
          </div>

          <div className="formRow">
            <textarea
              name="tournaments"
              className="input textarea"
              placeholder="Tournaments you have played in"
              rows={3}
            />
          </div>

          <div className="formRow">
            <input
              name="discord"
              className="input"
              placeholder="Discord username (e.g. user#1234)"
              required
            />
          </div>

          {/* Feedback */}
          {error && <div className="formError">{error}</div>}
          {submitted && (
            <div className="formSuccess">
              Application submitted successfully ✅ We’ll be in touch.
            </div>
          )}

          <motion.button
            className="btnPrimary"
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? "Submitting..." : "Submit Application"}
          </motion.button>
        </motion.form>
      </div>
    </PageMotion>
  );
}
