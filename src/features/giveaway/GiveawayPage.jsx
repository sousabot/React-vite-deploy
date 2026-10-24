import React, { useState } from "react";
import Page from "../../components/ui/Page.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Field from "../../components/ui/Field.jsx";
import Alert from "../../components/ui/Alert.jsx";
import { SOCIALS } from "../../config/site.js";
import { useCountdown } from "../../hooks/useCountdown.js";
import { pad2, postToDiscord } from "../../lib/format.js";
import { track } from "../../lib/track.js";

const GIVEAWAY = {
  title: "GD Esports Giveaway",
  prize: "3 winners — 1x GD Jersey + 2 League of Legends gift cards",
  endMonth: 0,
  endDay: 19,
  rules: ["Join the Discord", "Follow us on X", "Follow us on Instagram", "Submit your entry below"],
};

const EMPTY = { gamerTag: "", email: "", discord: "", platform: "PC", notes: "" };

/** Next occurrence of the end date at 23:59 UTC. */
function nextEndDate() {
  const y = new Date().getUTCFullYear();
  const thisYear = Date.UTC(y, GIVEAWAY.endMonth, GIVEAWAY.endDay, 23, 59);
  return Date.now() > thisYear ? Date.UTC(y + 1, GIVEAWAY.endMonth, GIVEAWAY.endDay, 23, 59) : thisYear;
}

export default function GiveawayPage() {
  const [end] = useState(nextEndDate);
  const left = useCountdown(end);
  const isOpen = !!left && !left.expired;

  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setOk(false);
    if (!isOpen) return setError("This giveaway has ended.");
    if (!form.gamerTag || !form.discord || !form.email) return setError("Fill in gamer tag, Discord and email.");

    setBusy(true);
    try {
      await postToDiscord({ type: "giveaway_entry", ...form, prize: GIVEAWAY.prize });
      track("giveaway_submit", { platform: form.platform });
      setOk(true);
      setForm(EMPTY);
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page>
      <PageHeader eyebrow="Giveaway" title={GIVEAWAY.title} lead={GIVEAWAY.prize} />

      <div className="form-grid" style={{ alignItems: "start" }}>
        <div className="panel panel--notch stack">
          <span className="field__label">{isOpen ? "Ends in" : "Status"}</span>
          {isOpen ? (
            <div className="row" style={{ "--row": "18px" }}>
              {[
                ["Days", left.days],
                ["Hrs", pad2(left.hours)],
                ["Min", pad2(left.mins)],
                ["Sec", pad2(left.secs)],
              ].map(([label, value]) => (
                <div key={label} className="stat">
                  <span className="stat__value">{value}</span>
                  <span className="stat__label">{label}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">Giveaway ended. Winners are announced in Discord.</p>
          )}
          <hr className="divider" />
          <span className="field__label">How to enter</span>
          <ol className="stack" style={{ "--stack": "8px", paddingLeft: 20 }}>
            {GIVEAWAY.rules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
          <div className="row">
            <a className="btn btn--primary btn--sm" href={SOCIALS.discord} target="_blank" rel="noopener noreferrer">
              Discord
            </a>
            <a className="btn btn--ghost btn--sm" href={SOCIALS.x} target="_blank" rel="noopener noreferrer">
              X
            </a>
            <a className="btn btn--ghost btn--sm" href={SOCIALS.instagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </div>
          <p className="faint small">One entry per person. Winners announced in Discord.</p>
        </div>

        <form className="panel stack" onSubmit={onSubmit}>
          <span className="panel__title">Entry form</span>
          {error && <Alert tone="error">{error}</Alert>}
          {ok && <Alert tone="ok">Entry submitted. Good luck!</Alert>}
          <Field label="Gamer tag" required>
            <input className="input" name="gamerTag" value={form.gamerTag} onChange={onChange} disabled={!isOpen || busy} />
          </Field>
          <Field label="Email" required>
            <input className="input" type="email" name="email" value={form.email} onChange={onChange} disabled={!isOpen || busy} />
          </Field>
          <Field label="Discord" required>
            <input className="input" name="discord" value={form.discord} onChange={onChange} disabled={!isOpen || busy} />
          </Field>
          <Field label="Anything else">
            <textarea className="input" name="notes" value={form.notes} onChange={onChange} disabled={!isOpen || busy} />
          </Field>
          <button type="submit" className="btn btn--primary btn--block" disabled={!isOpen || busy}>
            {!isOpen ? "Giveaway ended" : busy ? "Submitting…" : "Submit entry"}
          </button>
        </form>
      </div>
    </Page>
  );
}
