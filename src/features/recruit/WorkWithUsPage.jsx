import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaDiscord, FaGamepad, FaHandshake, FaUsers, FaVideo } from "react-icons/fa";
import Page from "../../components/ui/Page.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Field from "../../components/ui/Field.jsx";
import Alert from "../../components/ui/Alert.jsx";
import { DISCORD_INVITE } from "../../config/site.js";
import { postToDiscord } from "../../lib/format.js";
import { track } from "../../lib/track.js";
import "./recruit.css";

const ROLES = [
  { id: "player", label: "Player", icon: FaGamepad, help: "Competitive teams, tryouts, scrims, tournaments." },
  { id: "creator", label: "Creator", icon: FaVideo, help: "Streamers, TikTok/IG creators, editors, community content." },
  { id: "staff", label: "Staff", icon: FaUsers, help: "Coaches, analysts, managers, moderators, designers." },
  { id: "sponsor", label: "Sponsor", icon: FaHandshake, help: "Brands, partnerships, event collabs." },
];

const STEPS = [
  ["Apply", "Pick your path and tell us who you are."],
  ["Review", "The team reads every serious application."],
  ["Follow-up", "Shortlisted entries get a Discord message."],
];

const OPTIONAL_FIELDS = ["email", "country", "timezone", "tournaments", "game", "rank", "socials", "portfolio", "brand", "budget", "message"];

function RoleFields({ role }) {
  if (role === "player") {
    return (
      <>
        <Field label="Main game">
          <input name="game" className="input" placeholder="LoL, Valorant, CS2…" />
        </Field>
        <Field label="Rank / role">
          <input name="rank" className="input" placeholder="Diamond · ADC" />
        </Field>
        <Field label="Availability" className="span-2">
          <textarea name="message" className="input" placeholder="Scrim times, goals, schedule" rows={3} />
        </Field>
      </>
    );
  }
  if (role === "creator") {
    return (
      <>
        <Field label="Social links">
          <input name="socials" className="input" placeholder="Twitch, TikTok, IG, YouTube" />
        </Field>
        <Field label="Portfolio / clips">
          <input name="portfolio" className="input" placeholder="Channel or highlight reel" />
        </Field>
        <Field label="Why GD?" className="span-2">
          <textarea name="message" className="input" placeholder="Content style and why you want to join" rows={3} />
        </Field>
      </>
    );
  }
  if (role === "staff") {
    return (
      <>
        <Field label="Portfolio / CV" className="span-2">
          <input name="portfolio" className="input" placeholder="Link to experience or work" />
        </Field>
        <Field label="Role & experience" className="span-2">
          <textarea name="message" className="input" placeholder="What role you want and relevant background" rows={3} />
        </Field>
      </>
    );
  }
  return (
    <>
      <Field label="Brand / company">
        <input name="brand" className="input" placeholder="Company name" />
      </Field>
      <Field label="Budget / proposal">
        <input name="budget" className="input" placeholder="Optional range or scope" />
      </Field>
      <Field label="Partnership idea" className="span-2">
        <textarea name="message" className="input" placeholder="What kind of collab are you looking for?" rows={3} />
      </Field>
    </>
  );
}

export default function WorkWithUsPage() {
  const [role, setRole] = useState("player");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const active = ROLES.find((r) => r.id === role);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const required = ["firstName", "lastName", "age", "discord", "about"];
    if (required.some((k) => !String(data[k] || "").trim())) {
      setError("Please fill in all required fields.");
      return;
    }

    setBusy(true);
    try {
      const payload = {
        type: "work_with_us",
        role,
        applyRole: role,
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        discord: data.discord,
        about: data.about,
      };
      for (const key of OPTIONAL_FIELDS) payload[key] = data[key] || "";

      await postToDiscord(payload);
      track("work_with_us_submit", { role });
      setSent(true);
      form.reset();
      setRole("player");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page>
      <PageHeader
        eyebrow="Applications"
        title="Join the"
        accent="next chapter."
        lead="Players, creators, staff and partners — one form, a real review for every entry that fits GD."
      />

      <div className="recruit">
        <aside className="recruit__aside">
          <div className="panel">
            <div className="field__label" style={{ marginBottom: 14 }}>
              How it works
            </div>
            <ol className="recruit__steps">
              {STEPS.map(([title, text], i) => (
                <li key={title}>
                  <span className="recruit__step-num">0{i + 1}</span>
                  <span>
                    <strong>{title}</strong>
                    <span className="muted small" style={{ display: "block" }}>
                      {text}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer" className="panel recruit__discord">
            <FaDiscord aria-hidden="true" />
            <span>
              <strong>Questions first?</strong>
              <span className="muted small" style={{ display: "block" }}>
                Ask in our Discord before you apply.
              </span>
            </span>
          </a>
        </aside>

        <form className="recruit__form" name="work-with-us" onSubmit={onSubmit} noValidate>
          <AnimatePresence>
            {sent && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Alert tone="ok" onClose={() => setSent(false)}>
                  Application sent. If you're shortlisted, we'll reach out on Discord.
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <fieldset className="panel recruit__block">
            <legend className="recruit__legend">
              <span className="mono text-orange">01</span> Applying as
            </legend>
            <div className="recruit__roles">
              {ROLES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`recruit__role ${role === id ? "is-active" : ""}`}
                  aria-pressed={role === id}
                  onClick={() => setRole(id)}
                >
                  <Icon aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
            <p className="muted small">{active.help}</p>
          </fieldset>

          <fieldset className="panel recruit__block">
            <legend className="recruit__legend">
              <span className="mono text-orange">02</span> Basic info
            </legend>
            <div className="form-grid">
              <Field label="First name" required>
                <input name="firstName" className="input" autoComplete="given-name" />
              </Field>
              <Field label="Last name" required>
                <input name="lastName" className="input" autoComplete="family-name" />
              </Field>
              <Field label="Age" required>
                <input name="age" className="input" type="number" min="13" />
              </Field>
              <Field label="Discord" required>
                <input name="discord" className="input" placeholder="@username" />
              </Field>
              <Field label="Email" hint="Optional but recommended">
                <input name="email" className="input" type="email" autoComplete="email" />
              </Field>
              <Field label="Country">
                <input name="country" className="input" placeholder="Portugal" />
              </Field>
              <Field label="Timezone" className="span-2">
                <input name="timezone" className="input" placeholder="GMT / WET" />
              </Field>
            </div>
          </fieldset>

          <fieldset className="panel recruit__block">
            <legend className="recruit__legend">
              <span className="mono text-orange">03</span> About you
            </legend>
            <div className="form-grid">
              <Field label="About you" required className="span-2">
                <textarea name="about" className="input" rows={5} placeholder="Who are you, what do you do, and what are you looking for?" />
              </Field>
              <Field label="Experience" hint="Teams, tournaments, achievements" className="span-2">
                <textarea name="tournaments" className="input" rows={3} />
              </Field>
            </div>
          </fieldset>

          <fieldset className="panel recruit__block">
            <legend className="recruit__legend">
              <span className="mono text-orange">04</span> {active.label} details
            </legend>
            <div className="form-grid" key={role}>
              <RoleFields role={role} />
            </div>
          </fieldset>

          {error && <Alert tone="error">{error}</Alert>}

          <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
            {busy ? "Submitting…" : "Submit application"}
          </button>
        </form>
      </div>
    </Page>
  );
}
