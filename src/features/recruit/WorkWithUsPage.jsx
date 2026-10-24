import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaDiscord, FaGamepad, FaHandshake, FaUsers, FaVideo } from "react-icons/fa";
import { FiArrowLeft, FiArrowRight, FiCheck, FiEdit2 } from "react-icons/fi";
import Page from "../../components/ui/Page.jsx";
import Field from "../../components/ui/Field.jsx";
import Alert from "../../components/ui/Alert.jsx";
import { DISCORD_INVITE } from "../../config/site.js";
import { pad2, postToDiscord } from "../../lib/format.js";
import { track } from "../../lib/track.js";
import "./recruit.css";

const EASE = [0.22, 1, 0.36, 1];

const ROLES = [
  { id: "player", label: "Player", icon: FaGamepad, help: "Competitive teams, tryouts, scrims, tournaments." },
  { id: "creator", label: "Creator", icon: FaVideo, help: "Streamers, TikTok/IG creators, editors, community content." },
  { id: "staff", label: "Staff", icon: FaUsers, help: "Coaches, analysts, managers, moderators, designers." },
  { id: "sponsor", label: "Sponsor", icon: FaHandshake, help: "Brands, partnerships, event collabs." },
];

/** Path-specific fields. Only the chosen path's fields are sent. */
const ROLE_FIELDS = {
  player: [
    { name: "game", label: "Main game", placeholder: "LoL, Valorant, CS2…" },
    { name: "rank", label: "Rank / role", placeholder: "Diamond · ADC" },
    { name: "message", label: "Availability", placeholder: "Scrim times, goals, schedule", area: true },
  ],
  creator: [
    { name: "socials", label: "Social links", placeholder: "Twitch, TikTok, IG, YouTube" },
    { name: "portfolio", label: "Portfolio / clips", placeholder: "Channel or highlight reel" },
    { name: "message", label: "Why GD?", placeholder: "Content style and why you want to join", area: true },
  ],
  staff: [
    { name: "portfolio", label: "Portfolio / CV", placeholder: "Link to experience or work", wide: true },
    { name: "message", label: "Role & experience", placeholder: "What role you want and relevant background", area: true },
  ],
  sponsor: [
    { name: "brand", label: "Brand / company", placeholder: "Company name" },
    { name: "budget", label: "Budget / proposal", placeholder: "Optional range or scope" },
    { name: "message", label: "Partnership idea", placeholder: "What kind of collab are you looking for?", area: true },
  ],
};

const OPTIONAL_FIELDS = ["email", "country", "timezone", "tournaments", "game", "rank", "socials", "portfolio", "brand", "budget", "message"];

const STEPS = [
  { id: "path", label: "Path" },
  { id: "you", label: "You", required: ["firstName", "lastName", "age", "discord"] },
  { id: "story", label: "Story", required: ["about"] },
  { id: "details", label: "Details" },
  { id: "review", label: "Review" },
];

const LABELS = {
  firstName: "First name",
  lastName: "Last name",
  age: "Age",
  discord: "Discord",
  email: "Email",
  country: "Country",
  timezone: "Timezone",
  about: "About you",
  tournaments: "Experience",
};

const EMPTY = Object.fromEntries(
  ["firstName", "lastName", "age", "discord", "about", ...OPTIONAL_FIELDS].map((k) => [k, ""])
);

function TextInput({ form, setField, name, area, ...rest }) {
  const Tag = area ? "textarea" : "input";
  return (
    <Tag
      name={name}
      className="input"
      value={form[name]}
      onChange={(e) => setField(name, e.target.value)}
      rows={area ? rest.rows || 4 : undefined}
      {...rest}
    />
  );
}

function ReviewGroup({ title, rows, onEdit }) {
  const filled = rows.filter(([, v]) => String(v || "").trim());
  return (
    <div className="review-group">
      <div className="review-group__head">
        <span className="review-group__title">{title}</span>
        <button type="button" className="review-group__edit mono" onClick={onEdit}>
          <FiEdit2 aria-hidden="true" /> Edit
        </button>
      </div>
      {filled.length ? (
        <dl>
          {filled.map(([label, value]) => (
            <div key={label}>
              <dt className="mono">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="faint small">Nothing added.</p>
      )}
    </div>
  );
}

function roleFromUrl() {
  const id = new URLSearchParams(window.location.search).get("role");
  return ROLES.some((r) => r.id === id) ? id : null;
}

export default function WorkWithUsPage() {
  const [role, setRole] = useState(roleFromUrl);
  const [step, setStep] = useState(() => (roleFromUrl() ? 1 : 0));
  const [form, setForm] = useState(EMPTY);
  const [missing, setMissing] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(null);

  const active = ROLES.find((r) => r.id === role);
  const roleFields = role ? ROLE_FIELDS[role] : [];

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    if (missing.includes(name)) setMissing((m) => m.filter((k) => k !== name));
  }

  function goTo(i) {
    setStep(i);
    setError("");
    document.getElementById("apply")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function pickRole(id) {
    setRole(id);
    track("work_with_us_path", { role: id });
    goTo(1);
  }

  function next() {
    const req = STEPS[step].required || [];
    const gaps = req.filter((k) => !String(form[k] || "").trim());
    if (gaps.length) {
      setMissing(gaps);
      setError("Please fill in the required fields.");
      return;
    }
    setMissing([]);
    goTo(Math.min(step + 1, STEPS.length - 1));
  }

  async function submit() {
    const gaps = ["firstName", "lastName", "age", "discord", "about"].filter((k) => !String(form[k] || "").trim());
    if (gaps.length) {
      setMissing(gaps);
      goTo(gaps.includes("about") && gaps.length === 1 ? 2 : 1);
      setError("Please fill in all required fields.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const allowed = new Set(["email", "country", "timezone", "tournaments", ...roleFields.map((f) => f.name)]);
      const payload = {
        type: "work_with_us",
        role,
        applyRole: role,
        firstName: form.firstName,
        lastName: form.lastName,
        age: form.age,
        discord: form.discord,
        about: form.about,
      };
      for (const key of OPTIONAL_FIELDS) payload[key] = allowed.has(key) ? form[key] || "" : "";

      await postToDiscord(payload);
      track("work_with_us_submit", { role });
      setSent({ role: active.label, name: form.firstName });
      setForm(EMPTY);
      setRole(null);
      setStep(0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    if (step === STEPS.length - 1) submit();
    else if (step > 0) next();
  }

  const err = (name) => (missing.includes(name) ? "Required" : undefined);
  const progress = role ? Math.round((step / (STEPS.length - 1)) * 100) : 0;

  if (sent) {
    return (
      <Page className="recruit-page">
        <motion.section
          className="recruit-done"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <span className="recruit-done__icon">
            <FiCheck aria-hidden="true" />
          </span>
          <span className="eyebrow">Application sent</span>
          <h1 className="display display--lg">
            You're in the <span className="text-orange">queue{sent.name ? `, ${sent.name}` : ""}.</span>
          </h1>
          <p className="lead">
            Your {sent.role.toLowerCase()} application is with the team. If you're shortlisted, we'll reach out on Discord.
          </p>
          <ol className="recruit-done__next">
            <li>
              <span className="mono text-orange">01</span> The team reads every serious application.
            </li>
            <li>
              <span className="mono text-orange">02</span> Shortlisted entries get a Discord message.
            </li>
          </ol>
          <div className="row">
            <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
              <FaDiscord aria-hidden="true" /> Join the Discord
            </a>
            <button type="button" className="btn btn--ghost" onClick={() => setSent(null)}>
              Send another application
            </button>
          </div>
        </motion.section>
      </Page>
    );
  }

  return (
    <Page className="recruit-page">
      <header className="recruit-top">
        <span className="eyebrow">Applications</span>
        <h1 className="display display--lg">
          Join the <span className="text-orange">next chapter.</span>
        </h1>
        <p className="lead">Players, creators, staff and partners — one form, a real review for every entry that fits GD.</p>
      </header>

      <section className="paths" aria-label="Choose your path">
        {ROLES.map(({ id, label, icon: Icon, help }, i) => (
          <button
            key={id}
            type="button"
            className={`path ${role === id ? "is-active" : ""}`}
            aria-pressed={role === id}
            onClick={() => pickRole(id)}
          >
            <span className="path__num mono">{pad2(i + 1)}</span>
            <Icon className="path__icon" aria-hidden="true" />
            <span className="path__label">{label}</span>
            <span className="path__help muted small">{help}</span>
            <span className="path__cta mono">
              {role === id ? "Selected" : "Apply"} <FiArrowRight aria-hidden="true" />
            </span>
          </button>
        ))}
      </section>

      <div className="recruit" id="apply">
        <form className="apply" name="work-with-us" onSubmit={onSubmit} noValidate>
          <div className="apply__progress">
            <ol className="apply__steps">
              {STEPS.map((s, i) => {
                const reachable = role && i <= step;
                return (
                  <li key={s.id} className={`${i === step && role ? "is-current" : ""} ${i < step ? "is-done" : ""}`}>
                    <button type="button" disabled={!reachable} onClick={() => goTo(i)}>
                      <span className="apply__dot mono">{i < step ? <FiCheck aria-hidden="true" /> : pad2(i + 1)}</span>
                      <span className="apply__step-label">{s.label}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="apply__bar">
              <span style={{ transform: `scaleX(${progress / 100})` }} />
            </div>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={role ? step : "intro"}
              className="apply__panel"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22, ease: EASE }}
            >
              {(!role || step === 0) && (
                <div className="apply__intro">
                  <h2 className="apply__title">Choose your path</h2>
                  <p className="muted">Pick Player, Creator, Staff or Sponsor above to start. It takes a couple of minutes.</p>
                  <div className="apply__mini-paths">
                    {ROLES.map(({ id, label, icon: Icon }) => (
                      <button key={id} type="button" className={`chip ${role === id ? "is-active" : ""}`} onClick={() => pickRole(id)}>
                        <Icon aria-hidden="true" /> {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {role && step === 1 && (
                <>
                  <h2 className="apply__title">About you</h2>
                  <div className="form-grid">
                    <Field label="First name" required error={err("firstName")}>
                      <TextInput form={form} setField={setField} name="firstName" autoComplete="given-name" />
                    </Field>
                    <Field label="Last name" required error={err("lastName")}>
                      <TextInput form={form} setField={setField} name="lastName" autoComplete="family-name" />
                    </Field>
                    <Field label="Age" required error={err("age")}>
                      <TextInput form={form} setField={setField} name="age" type="number" min="13" inputMode="numeric" />
                    </Field>
                    <Field label="Discord" required error={err("discord")}>
                      <TextInput form={form} setField={setField} name="discord" placeholder="@username" />
                    </Field>
                    <Field label="Email" hint="Optional but recommended">
                      <TextInput form={form} setField={setField} name="email" type="email" autoComplete="email" />
                    </Field>
                    <Field label="Country">
                      <TextInput form={form} setField={setField} name="country" placeholder="Portugal" />
                    </Field>
                    <Field label="Timezone" className="span-2">
                      <TextInput form={form} setField={setField} name="timezone" placeholder="GMT / WET" />
                    </Field>
                  </div>
                </>
              )}

              {role && step === 2 && (
                <>
                  <h2 className="apply__title">Your story</h2>
                  <div className="form-grid">
                    <Field label="About you" required className="span-2" error={err("about")}>
                      <TextInput
                        form={form}
                        setField={setField}
                        name="about"
                        area
                        rows={6}
                        placeholder="Who are you, what do you do, and what are you looking for?"
                      />
                    </Field>
                    <Field label="Experience" hint="Teams, tournaments, achievements" className="span-2">
                      <TextInput form={form} setField={setField} name="tournaments" area rows={3} />
                    </Field>
                  </div>
                </>
              )}

              {role && step === 3 && (
                <>
                  <h2 className="apply__title">{active.label} details</h2>
                  <div className="form-grid">
                    {roleFields.map((f) => (
                      <Field key={f.name} label={f.label} className={f.area || f.wide ? "span-2" : ""}>
                        <TextInput form={form} setField={setField} name={f.name} area={f.area} placeholder={f.placeholder} />
                      </Field>
                    ))}
                  </div>
                </>
              )}

              {role && step === 4 && (
                <>
                  <h2 className="apply__title">Review & send</h2>
                  <div className="review">
                    <ReviewGroup title="Path" rows={[["Applying as", active.label]]} onEdit={() => goTo(0)} />
                    <ReviewGroup
                      title="You"
                      rows={["firstName", "lastName", "age", "discord", "email", "country", "timezone"].map((k) => [LABELS[k], form[k]])}
                      onEdit={() => goTo(1)}
                    />
                    <ReviewGroup
                      title="Story"
                      rows={[
                        [LABELS.about, form.about],
                        [LABELS.tournaments, form.tournaments],
                      ]}
                      onEdit={() => goTo(2)}
                    />
                    <ReviewGroup
                      title={`${active.label} details`}
                      rows={roleFields.map((f) => [f.label, form[f.name]])}
                      onEdit={() => goTo(3)}
                    />
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {error && <Alert tone="error">{error}</Alert>}

          {role && step > 0 && (
            <div className="apply__nav">
              <button type="button" className="btn btn--ghost" onClick={() => goTo(step - 1)}>
                <FiArrowLeft aria-hidden="true" /> Back
              </button>
              <button type="submit" className="btn btn--primary" disabled={busy}>
                {step === STEPS.length - 1 ? (busy ? "Sending…" : "Send application") : "Continue"}
                {step < STEPS.length - 1 && <FiArrowRight aria-hidden="true" />}
              </button>
            </div>
          )}
        </form>

        <aside className="recruit__aside">
          <div className="summary">
            <div className="summary__head mono">
              <span>Your application</span>
              <span className="text-orange">{progress}%</span>
            </div>
            <div className="summary__path">
              {active ? (
                <>
                  <active.icon className="summary__icon" aria-hidden="true" />
                  <span>
                    <span className="summary__label">{active.label}</span>
                    <span className="muted small">{active.help}</span>
                  </span>
                </>
              ) : (
                <span className="muted small">No path chosen yet.</span>
              )}
            </div>
            <ol className="summary__how">
              <li>
                <span className="mono text-orange">01</span>
                <span>
                  <strong>Apply</strong>
                  <span className="muted small">Pick your path and tell us who you are.</span>
                </span>
              </li>
              <li>
                <span className="mono text-orange">02</span>
                <span>
                  <strong>Review</strong>
                  <span className="muted small">The team reads every serious application.</span>
                </span>
              </li>
              <li>
                <span className="mono text-orange">03</span>
                <span>
                  <strong>Follow-up</strong>
                  <span className="muted small">Shortlisted entries get a Discord message.</span>
                </span>
              </li>
            </ol>
          </div>
          <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer" className="recruit__discord">
            <FaDiscord aria-hidden="true" />
            <span>
              <strong>Questions first?</strong>
              <span className="muted small">Ask in our Discord before you apply.</span>
            </span>
          </a>
        </aside>
      </div>
    </Page>
  );
}
