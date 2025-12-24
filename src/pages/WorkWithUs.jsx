import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import PageMotion from "../components/PageMotion.jsx";
import { track } from "../state/track.js";

function encodeForm(data) {
  return new URLSearchParams(data).toString();
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function WorkWithUs() {
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  const [role, setRole] = useState("player"); // player | creator | staff | sponsor

  const ROLE_HELP = useMemo(
    () => ({
      player: "Competitive teams, tryouts, scrims, tournaments.",
      creator: "Streamers, TikTok/IG creators, editors, community content.",
      staff: "Coaches, analysts, managers, moderators, designers.",
      sponsor: "Brands, partnerships, event collabs.",
    }),
    []
  );

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setOk(false);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Basic validation (still keep required inputs for browser-level checks)
    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim();
    const age = String(formData.get("age") || "").trim();
    const discord = String(formData.get("discord") || "").trim();
    const about = String(formData.get("about") || "").trim();

    if (!firstName || !lastName || !age || !discord || !about) {
      setError("Please fill all required fields.");
      return;
    }

    setLoading(true);

    // Build payload for Discord + Netlify Forms
    const entriesObj = Object.fromEntries(formData.entries());

    const payloadObj = {
      type: "work_with_us",
      formName: "work-with-us",
      role: entriesObj.role,
      firstName: entriesObj.firstName,
      lastName: entriesObj.lastName,
      age: entriesObj.age,
      discord: entriesObj.discord,
      email: entriesObj.email || "",
      country: entriesObj.country || "",
      timezone: entriesObj.timezone || "",
      about: entriesObj.about || "",
      tournaments: entriesObj.tournaments || "",
      game: entriesObj.game || "",
      rank: entriesObj.rank || "",
      socials: entriesObj.socials || "",
      portfolio: entriesObj.portfolio || "",
      brand: entriesObj.brand || "",
      budget: entriesObj.budget || "",
      message: entriesObj.message || "",
    };

    try {
      // 1) Send to Discord
      const discordRes = await fetch("/.netlify/functions/form-to-discord", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeForm(payloadObj),
      });

      if (!discordRes.ok) {
        const msg = await discordRes.text().catch(() => "");
        throw new Error(`Discord failed (${discordRes.status}) ${msg}`.trim());
      }

      track("work_with_us_submit", { role });

      // 2) Submit to Netlify Forms (so submissions are stored in Netlify)
      // NOTE: we keep your original behavior but we show success state first
      setOk(true);

      // Slight delay so user sees success
      setTimeout(() => {
        form.submit();
      }, 600);
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
        {/* HERO */}
        <section className="workHero">
          <div className="workHeroOverlay" />
          <motion.div
            className="workHeroInner"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="workBadge">🧩 WORK WITH US</div>
            <h1 className="workTitle">Join GD Esports</h1>
            <p className="workSubtitle">
              Apply for collaborations, competitive teams, or staff roles. We’ll
              review every serious entry.
            </p>
          </motion.div>
        </section>

        {/* FORM */}
        <section className="workSection">
          <motion.form
            className="workForm"
            name="work-with-us"
            method="POST"
            action="/"
            data-netlify="true"
            data-netlify-honeypot="bot-field"
            onSubmit={onSubmit}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {/* Required for Netlify */}
            <input type="hidden" name="form-name" value="work-with-us" />

            {/* Honeypot */}
            <p style={{ display: "none" }}>
              <label>
                Don’t fill this out if you’re human: <input name="bot-field" />
              </label>
            </p>

            {/* Redirect */}
            <input type="hidden" name="redirect" value="/" />

            {/* ROLE PICKER */}
            <div className="workCard">
              <div className="workCardTitle">What are you applying for?</div>

              <div className="workRoleRow">
                <button
                  type="button"
                  className={`workRoleChip ${role === "player" ? "active" : ""}`}
                  onClick={() => setRole("player")}
                >
                  Player
                </button>
                <button
                  type="button"
                  className={`workRoleChip ${
                    role === "creator" ? "active" : ""
                  }`}
                  onClick={() => setRole("creator")}
                >
                  Creator
                </button>
                <button
                  type="button"
                  className={`workRoleChip ${role === "staff" ? "active" : ""}`}
                  onClick={() => setRole("staff")}
                >
                  Staff
                </button>
                <button
                  type="button"
                  className={`workRoleChip ${
                    role === "sponsor" ? "active" : ""
                  }`}
                  onClick={() => setRole("sponsor")}
                >
                  Sponsor
                </button>
              </div>

              <div className="muted small" style={{ marginTop: 10 }}>
                {ROLE_HELP[role]}
              </div>

              <input type="hidden" name="role" value={role} />
            </div>

            {/* BASIC INFO */}
            <div className="workCard">
              <div className="workCardTitle">Basic Info</div>

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

              <div className="formRow">
                <input
                  name="age"
                  className="input"
                  type="number"
                  placeholder="Age"
                  min="13"
                  required
                />
                <input
                  name="email"
                  className="input"
                  type="email"
                  placeholder="Email (optional but recommended)"
                  autoComplete="email"
                />
              </div>

              <div className="formRow">
                <input
                  name="discord"
                  className="input"
                  placeholder="Discord (e.g. user#1234 or @user)"
                  required
                />
              </div>

              <div className="formRow">
                <input
                  name="country"
                  className="input"
                  placeholder="Country (optional)"
                />
                <input
                  name="timezone"
                  className="input"
                  placeholder="Timezone (optional, e.g. GMT)"
                />
              </div>
            </div>

            {/* ABOUT */}
            <div className="workCard">
              <div className="workCardTitle">Tell us about you</div>

              <textarea
                name="about"
                className="input textarea"
                placeholder="Who are you, what do you do, and what are you looking for?"
                rows={5}
                required
              />

              <textarea
                name="tournaments"
                className="input textarea"
                placeholder="Tournaments / teams / achievements (optional)"
                rows={3}
              />
            </div>

            {/* CONDITIONAL: PLAYER */}
            {role === "player" && (
              <div className="workCard">
                <div className="workCardTitle">Player Details</div>

                <div className="formRow">
                  <input
                    name="game"
                    className="input"
                    placeholder="Main Game (e.g. LoL, Valorant)"
                  />
                  <input
                    name="rank"
                    className="input"
                    placeholder="Rank / Role (e.g. Diamond, ADC)"
                  />
                </div>

                <textarea
                  name="message"
                  className="input textarea"
                  placeholder="Availability, scrim times, goals (optional)"
                  rows={3}
                />
              </div>
            )}

            {/* CONDITIONAL: CREATOR */}
            {role === "creator" && (
              <div className="workCard">
                <div className="workCardTitle">Creator Details</div>

                <div className="formRow">
                  <input
                    name="socials"
                    className="input"
                    placeholder="Social links (Twitch / TikTok / IG / YouTube)"
                  />
                </div>

                <div className="formRow">
                  <input
                    name="portfolio"
                    className="input"
                    placeholder="Portfolio / clips / channel link (optional)"
                  />
                </div>

                <textarea
                  name="message"
                  className="input textarea"
                  placeholder="What content do you make + why GD? (optional)"
                  rows={3}
                />
              </div>
            )}

            {/* CONDITIONAL: STAFF */}
            {role === "staff" && (
              <div className="workCard">
                <div className="workCardTitle">Staff Details</div>

                <div className="formRow">
                  <input
                    name="portfolio"
                    className="input"
                    placeholder="Portfolio / experience link (optional)"
                  />
                </div>

                <textarea
                  name="message"
                  className="input textarea"
                  placeholder="Role you want + relevant experience (optional)"
                  rows={3}
                />
              </div>
            )}

            {/* CONDITIONAL: SPONSOR */}
            {role === "sponsor" && (
              <div className="workCard">
                <div className="workCardTitle">Sponsor / Partner Details</div>

                <div className="formRow">
                  <input
                    name="brand"
                    className="input"
                    placeholder="Brand / Company name"
                  />
                  <input
                    name="budget"
                    className="input"
                    placeholder="Budget / proposal (optional)"
                  />
                </div>

                <textarea
                  name="message"
                  className="input textarea"
                  placeholder="What kind of partnership are you looking for?"
                  rows={3}
                />
              </div>
            )}

            {/* FEEDBACK */}
            {error && <div className="formError">{error}</div>}
            {ok && (
              <div className="formSuccess">
                Submitted ✅ We’ll be in touch soon.
              </div>
            )}

            {/* SUBMIT */}
            <motion.button
              className="btnPrimary"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Application"}
            </motion.button>
          </motion.form>
        </section>
      </div>
    </PageMotion>
  );
}
