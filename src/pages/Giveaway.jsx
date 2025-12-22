import React, { useState } from "react";
import { motion } from "framer-motion";
import PageMotion from "../components/PageMotion.jsx";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

function encodeForm(data) {
  return new URLSearchParams(data).toString();
}

const IG_URL = "https://www.instagram.com/gdesports25/";
const IG_HANDLE = "@gdesports25";

export default function Giveaway() {
  const [form, setForm] = useState({
    name: "",
    discord: "",
    instagram: "",
    platform: "PC",
    entry: "Follow + Discord",
    proof: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function normalizeInstagramHandle(v) {
    const s = (v || "").trim();
    if (!s) return "";
    return s.startsWith("@") ? s : `@${s}`;
  }

  async function submit(e) {
    e.preventDefault();
    setSubmitError("");
    setSubmitted(false);

    const ig = normalizeInstagramHandle(form.instagram);

    if (!form.name || !form.discord) {
      setSubmitError("Please fill in your name and Discord.");
      return;
    }

    if (!ig) {
      setSubmitError("Please enter your Instagram @username.");
      return;
    }

    // ✅ REQUIRED PROOF CHECK
    if (!form.proof.trim()) {
      setSubmitError(
        `Please provide proof that you follow ${IG_HANDLE} (screenshot link).`
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        type: "giveaway",
        name: form.name,
        discord: form.discord,
        instagram: ig,
        platform: form.platform,
        entry: form.entry,
        proof: form.proof,
        time: new Date().toISOString(),
      };

      const res = await fetch("/.netlify/functions/form-to-discord", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeForm(payload),
      });

      if (!res.ok) throw new Error("Submission failed");

      setSubmitted(true);
      setForm({
        name: "",
        discord: "",
        instagram: "",
        platform: "PC",
        entry: "Follow + Discord",
        proof: "",
      });
    } catch {
      setSubmitError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageMotion>
      <div className="workPage">
        <motion.div
          className="updateCard"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="updateTop">
            <span className="updateBadge">🎁 GIVEAWAY</span>
            <span className="updateSmall">Entry form</span>
          </div>

          <div className="updateTitle">GD Esports Giveaway</div>
          <div className="updateDesc">
            To enter, you must follow{" "}
            <a
              href={IG_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "underline" }}
            >
              {IG_HANDLE}
            </a>{" "}
            on Instagram and provide proof below. Winner announced on Discord.
          </div>

          <form className="workForm" onSubmit={submit}>
            <div>
              <div className="label">Name / Gamer Tag</div>
              <input
                className="input"
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <div className="label">Discord</div>
              <input
                className="input"
                name="discord"
                value={form.discord}
                onChange={onChange}
                placeholder="example#1234 or @username"
                required
              />
            </div>

            <div>
              <div className="label">Instagram Username</div>
              <input
                className="input"
                name="instagram"
                value={form.instagram}
                onChange={onChange}
                placeholder="@yourhandle"
                required
              />
            </div>

            <div className="formRow">
              <div style={{ flex: 1, minWidth: 220 }}>
                <div className="label">Platform</div>
                <select
                  className="input"
                  name="platform"
                  value={form.platform}
                  onChange={onChange}
                >
                  <option>PC</option>
                  <option>PlayStation</option>
                  <option>Xbox</option>
                  <option>Nintendo Switch</option>
                  <option>Mobile</option>
                </select>
              </div>

              <div style={{ flex: 1, minWidth: 220 }}>
                <div className="label">Entry Type</div>
                <select
                  className="input"
                  name="entry"
                  value={form.entry}
                  onChange={onChange}
                >
                  <option>Follow + Discord</option>
                  <option>Instagram follow only</option>
                  <option>Discord only</option>
                </select>
              </div>
            </div>

            {/* ✅ PROOF REQUIRED */}
            <div>
              <div className="label">Proof (required)</div>
              <input
                className="input"
                name="proof"
                value={form.proof}
                onChange={onChange}
                placeholder="Paste screenshot link (Imgur / Discord / Drive)"
                required
              />
              <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                Upload a screenshot showing you follow {IG_HANDLE}, then paste the
                link here.
              </div>
            </div>

            {submitError && <div className="formError">{submitError}</div>}
            {submitted && (
              <div className="formSuccess">
                Entry submitted ✅ Good luck!
              </div>
            )}

            <div className="row">
              <motion.button
                className="btnPrimary"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Enter Giveaway"}
              </motion.button>

              <a
                className="btnGhost"
                href="https://discord.gg/5fZ7UEnnzn"
                target="_blank"
                rel="noopener noreferrer"
              >
                Join Discord
              </a>
            </div>
          </form>
        </motion.div>
      </div>
    </PageMotion>
  );
}
