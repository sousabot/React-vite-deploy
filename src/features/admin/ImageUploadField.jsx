import React, { useRef, useState } from "react";
import { useAuth } from "../auth/useAuth.js";
import { uploadSiteImage } from "../../lib/uploadImage.js";

export default function ImageUploadField({ label, value, onChange, folder, slug, hint, placeholder }) {
  const { user } = useAuth();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const hasSlug = !!slug?.trim();

  async function handleFile(file) {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const token = await user?.firebaseUser?.getIdToken?.();
      onChange(await uploadSiteImage(file, folder, slug, token));
    } catch (e) {
      setError(e?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="field span-2">
      <span className="field__label">{label}</span>
      <div className="admin__upload">
        <div className="admin__upload-preview">{value ? <img src={value} alt="" /> : <span className="mono faint">No image</span>}</div>
        <div className="stack" style={{ "--stack": "8px" }}>
          <input
            className="input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || `/${folder}/name.png`}
          />
          <div className="row">
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              hidden
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              disabled={uploading || !hasSlug}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? "Uploading…" : "Upload image"}
            </button>
            {!hasSlug && <span className="field__hint">Enter a name first</span>}
          </div>
        </div>
      </div>
      {hint && <span className="field__hint">{hint}</span>}
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}
