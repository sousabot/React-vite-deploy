import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaDiscord,
  FaGamepad,
  FaHandshake,
  FaUsers,
  FaVideo,
} from "react-icons/fa";
import PageMotion from "../components/PageMotion.jsx";
import { DISCORD_INVITE } from "../data/links.js";
import { track } from "../state/track.js";

function encodeForm(data) {
  return new URLSearchParams(data).toString();
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const ROLES = [
  {
    id: "player",
    label: "Player",
    icon: FaGamepad,
    help: "Competitive teams, tryouts, scrims, tournaments.",
  },
  {
    id: "creator",
    label: "Creator",
    icon: FaVideo,
    help: "Streamers, TikTok/IG creators, editors, community content.",
  },
  {
    id: "staff",
    label: "Staff",
    icon: FaUsers,
    help: "Coaches, analysts, managers, moderators, designers.",
  },
  {
    id: "sponsor",
    label: "Sponsor",
    icon: FaHandshake,
    help: "Brands, partnerships, event collabs.",
  },
];

const STEPS = [
  { num: "01", title: "Apply", text: "Pick your path and tell us who you are." },
  { num: "02", title: "Review", text: "The team reads every serious application." },
  { num: "03", title: "Follow-up", text: "Shortlisted entries get a Discord message." },
];

function WorkField({ label, hint, children, required }) {
  return (
    <label className="workField">
      <span className="workFieldLabel">
        {label}
        {required ? <span className="workFieldReq">*</span> : null}
      </span>
      {children}
      {hint ? <span className="workFieldHint muted small">{hint}</span> : null}
    </label>
  );
}

export default function WorkWithUs() {
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("player");

  const activeRole = useMemo(
    () => ROLES.find((r) => r.id === role) || ROLES[0],
    [role]
  );

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setOk(false);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const entriesObj = Object.fromEntries(formData.entries());

    const firstName = String(entriesObj.firstName || "").trim();
    const lastName = String(entriesObj.lastName || "").trim();
    const age = String(entriesObj.age || "").trim();
    const discord = String(entriesObj.discord || "").trim();
    const about = String(entriesObj.about || "").trim();

    if (!firstName || !lastName || !age || !discord || !about) {
      setError("Please fill all required fields.");
      return;
    }

    setLoading(true);

    try {
      const payloadObj = {
        type: "work_with_us",
        role: entriesObj.role || role,
        applyRole: entriesObj.role || role,
        firstName: entriesObj.firstName,
        lastName: entriesObj.lastName,
        age: entriesObj.age,
        email: entriesObj.email || "",
        discord: entriesObj.discord,
        country: entriesObj.country || "",
        timezone: entriesObj.timezone || "",
        about: entriesObj.about,
        tournaments: entriesObj.tournaments || "",
        game: entriesObj.game || "",
        rank: entriesObj.rank || "",
        socials: entriesObj.socials || "",
        portfolio: entriesObj.portfolio || "",
        brand: entriesObj.brand || "",
        budget: entriesObj.budget || "",
        message: entriesObj.message || "",
      };

      const discordRes = await fetch("/.netlify/functions/form-to-discord", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeForm(payloadObj),
      });

      if (!discordRes.ok) {
        const msg = await discordRes.text().catch(() => "");
        throw new Error(
          `Discord failed (${discordRes.status}) ${msg}`.trim()
        );
      }

      track("work_with_us_submit", { role });
      setOk(true);
      form.reset();
      setRole("player");
      window.scrollTo({ top: 0, behavior: "smooth" });
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
        <section className="workHero">
          <div className="workHeroBg" aria-hidden="true">
            <div className="workHeroBgGrad" />
            <div className="workHeroBgGrid" />
          </div>

          <motion.div
            className="workHeroInner"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="workHeroKicker">
              <span className="workKickerDot" aria-hidden="true" />
              GD ESPORTS · APPLICATIONS
            </div>
            <h1 className="workHeroTitle">
              Join the<br />
              <em className="workHeroTitleAccent">next chapter.</em>
            </h1>
            <p className="workHeroDesc muted">
              Players, creators, staff, and partners — one form, serious review
              for every entry that fits GD.
            </p>
          </motion.div>
        </section>

        <div className="workLayout">
          <motion.aside
            className="workAside"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            <div className="workAsideCard">
              <div className="workAsideTitle">How it works</div>
              <div className="workSteps">
                {STEPS.map((step) => (
                  <div key={step.num} className="workStep">
                    <span className="workStepNum">{step.num}</span>
                    <div>
                      <div className="workStepTitle">{step.title}</div>
                      <div className="workStepText muted small">{step.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="workAsideCard workAsideRole">
              <div className="workAsideTitle">Applying as</div>
              <div className="workAsideRoleName">{activeRole.label}</div>
              <p className="muted small">{activeRole.help}</p>
            </div>

            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noopener noreferrer"
              className="workDiscordCard"
            >
              <FaDiscord className="workDiscordIcon" aria-hidden="true" />
              <div>
                <div className="workDiscordTitle">Questions first?</div>
                <div className="muted small">Jump into our Discord before you apply.</div>
              </div>
            </a>
          </motion.aside>

          <motion.form
            className="workForm"
            name="work-with-us"
            method="POST"
            data-netlify="true"
            data-netlify-honeypot="bot-field"
            onSubmit={onSubmit}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.35, delay: 0.08 }}
          >
            <input type="hidden" name="form-name" value="work-with-us" />
            <p style={{ display: "none" }}>
              <label>
                Don’t fill this out if you’re human: <input name="bot-field" />
              </label>
            </p>

            <AnimatePresence mode="wait">
              {ok ? (
                <motion.div
                  key="success"
                  className="workSuccessCard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <div className="workSuccessIcon">✓</div>
                  <div className="workSuccessTitle">Application sent</div>
                  <p className="muted">
                    Thanks for applying. If you&apos;re shortlisted, we&apos;ll reach
                    out on Discord.
                  </p>
                  <button
                    type="button"
                    className="btnGhost"
                    onClick={() => setOk(false)}
                  >
                    Submit another
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="workCard">
              <div className="workCardHead">
                <span className="workCardStep">01</span>
                <div className="workCardTitle">What are you applying for?</div>
              </div>

              <div className="workRoleGrid">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const active = role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      className={`workRoleCard ${active ? "active" : ""}`}
                      onClick={() => setRole(r.id)}
                    >
                      <span className="workRoleCardIcon" aria-hidden="true">
                        <Icon />
                      </span>
                      <span className="workRoleCardLabel">{r.label}</span>
                    </button>
                  );
                })}
              </div>

              <p className="workRoleHelp muted small">{activeRole.help}</p>
              <input type="hidden" name="role" value={role} />
            </div>

            <div className="workCard">
              <div className="workCardHead">
                <span className="workCardStep">02</span>
                <div className="workCardTitle">Basic info</div>
              </div>

              <div className="workFieldGrid">
                <WorkField label="First name" required>
                  <input
                    name="firstName"
                    className="input"
                    placeholder="Alex"
                    autoComplete="given-name"
                    required
                  />
                </WorkField>
                <WorkField label="Last name" required>
                  <input
                    name="lastName"
                    className="input"
                    placeholder="Silva"
                    autoComplete="family-name"
                    required
                  />
                </WorkField>
                <WorkField label="Age" required>
                  <input
                    name="age"
                    className="input"
                    type="number"
                    placeholder="18"
                    min="13"
                    required
                  />
                </WorkField>
                <WorkField label="Email" hint="Optional but recommended">
                  <input
                    name="email"
                    className="input"
                    type="email"
                    placeholder="you@email.com"
                    autoComplete="email"
                  />
                </WorkField>
                <WorkField label="Discord" required>
                  <input
                    name="discord"
                    className="input"
                    placeholder="username or @user"
                    required
                  />
                </WorkField>
                <WorkField label="Country">
                  <input name="country" className="input" placeholder="Portugal" />
                </WorkField>
                <WorkField label="Timezone">
                  <input name="timezone" className="input" placeholder="GMT / WET" />
                </WorkField>
              </div>
            </div>

            <div className="workCard">
              <div className="workCardHead">
                <span className="workCardStep">03</span>
                <div className="workCardTitle">Tell us about you</div>
              </div>

              <WorkField label="About you" required>
                <textarea
                  name="about"
                  className="input textarea"
                  placeholder="Who are you, what do you do, and what are you looking for?"
                  rows={5}
                  required
                />
              </WorkField>

              <WorkField label="Experience" hint="Teams, tournaments, achievements">
                <textarea
                  name="tournaments"
                  className="input textarea"
                  placeholder="Past teams, events, or relevant wins"
                  rows={3}
                />
              </WorkField>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={role}
                className="workCard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                <div className="workCardHead">
                  <span className="workCardStep">04</span>
                  <div className="workCardTitle">{activeRole.label} details</div>
                </div>

                {role === "player" && (
                  <div className="workFieldGrid">
                    <WorkField label="Main game">
                      <input name="game" className="input" placeholder="LoL, Valorant, CS2…" />
                    </WorkField>
                    <WorkField label="Rank / role">
                      <input name="rank" className="input" placeholder="Diamond · ADC" />
                    </WorkField>
                    <WorkField label="Availability">
                      <textarea
                        name="message"
                        className="input textarea"
                        placeholder="Scrim times, goals, schedule"
                        rows={3}
                      />
                    </WorkField>
                  </div>
                )}

                {role === "creator" && (
                  <div className="workFieldGrid">
                    <WorkField label="Social links">
                      <input
                        name="socials"
                        className="input"
                        placeholder="Twitch, TikTok, IG, YouTube"
                      />
                    </WorkField>
                    <WorkField label="Portfolio / clips">
                      <input
                        name="portfolio"
                        className="input"
                        placeholder="Channel or highlight reel"
                      />
                    </WorkField>
                    <WorkField label="Why GD?">
                      <textarea
                        name="message"
                        className="input textarea"
                        placeholder="Content style and why you want to join"
                        rows={3}
                      />
                    </WorkField>
                  </div>
                )}

                {role === "staff" && (
                  <div className="workFieldGrid">
                    <WorkField label="Portfolio / CV">
                      <input
                        name="portfolio"
                        className="input"
                        placeholder="Link to experience or work"
                      />
                    </WorkField>
                    <WorkField label="Role & experience">
                      <textarea
                        name="message"
                        className="input textarea"
                        placeholder="What role you want and relevant background"
                        rows={3}
                      />
                    </WorkField>
                  </div>
                )}

                {role === "sponsor" && (
                  <div className="workFieldGrid">
                    <WorkField label="Brand / company">
                      <input name="brand" className="input" placeholder="Company name" />
                    </WorkField>
                    <WorkField label="Budget / proposal">
                      <input name="budget" className="input" placeholder="Optional range or scope" />
                    </WorkField>
                    <WorkField label="Partnership idea">
                      <textarea
                        name="message"
                        className="input textarea"
                        placeholder="What kind of collab are you looking for?"
                        rows={3}
                      />
                    </WorkField>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {error ? <div className="formError workFormError">{error}</div> : null}

            <motion.button
              className="btnPrimary workSubmitBtn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || ok}
            >
              {loading ? "Submitting…" : "Submit application"}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </PageMotion>
  );
}
