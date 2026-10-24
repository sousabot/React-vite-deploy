import React, { useState } from "react";
import Modal from "../../components/ui/Modal.jsx";
import Field from "../../components/ui/Field.jsx";
import Alert from "../../components/ui/Alert.jsx";
import { postToDiscord } from "../../lib/format.js";
import { track } from "../../lib/track.js";

const EMPTY = { gamerTag: "", game: "", discord: "", role: "", availability: "", notes: "" };

export default function TryoutModal({ open, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSent(false);
    if (!form.gamerTag || !form.game || !form.discord) {
      setError("Fill in gamer tag, game and Discord.");
      return;
    }
    setBusy(true);
    try {
      await postToDiscord({ type: "tryout", ...form });
      track("tryout_submit", { game: form.game || "unknown" });
      setSent(true);
      setForm(EMPTY);
      setTimeout(() => {
        setSent(false);
        onClose();
      }, 1200);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Tryout application">
      <form className="form-grid" onSubmit={onSubmit}>
        <Field label="Gamer tag" required>
          <input className="input" name="gamerTag" value={form.gamerTag} onChange={onChange} required />
        </Field>
        <Field label="Game" required>
          <input className="input" name="game" value={form.game} onChange={onChange} placeholder="League of Legends" required />
        </Field>
        <Field label="Discord" required>
          <input className="input" name="discord" value={form.discord} onChange={onChange} placeholder="@username" required />
        </Field>
        <Field label="Role">
          <input className="input" name="role" value={form.role} onChange={onChange} placeholder="Jungle" />
        </Field>
        <Field label="Experience / rank / links" className="span-2">
          <textarea className="input" name="notes" value={form.notes} onChange={onChange} />
        </Field>

        {error && (
          <div className="span-2">
            <Alert tone="error">{error}</Alert>
          </div>
        )}
        {sent && (
          <div className="span-2">
            <Alert tone="ok">Application sent. Good luck.</Alert>
          </div>
        )}

        <div className="span-2 row">
          <button className="btn btn--primary" type="submit" disabled={busy}>
            {busy ? "Sending…" : "Submit application"}
          </button>
          <button className="btn btn--ghost" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
