import React, { useRef, useState } from "react";
import { uploadSiteImage } from "../utils/uploadImage.js";

export default function ImageUploadField({
  label,
  value,
  onChange,
  folder,
  slug,
  hint,
  placeholder,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file) {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const url = await uploadSiteImage(file, folder, slug);
      onChange(url);
    } catch (e) {
      setError(e?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <label className="adminFormField">
      <span className="adminFormLabel">{label}</span>
      <div className="adminImageUpload">
        {value ? (
          <div className="adminImagePreview">
            <img src={value} alt="" />
          </div>
        ) : null}
        <input
          className="input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || `/${folder}/name.png`}
        />
        <div className="adminImageUploadActions">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            className="btnGhost"
            disabled={uploading || !slug?.trim()}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Uploading…" : "Upload image"}
          </button>
          {!slug?.trim() && (
            <span className="adminFormHint muted small">Enter a name first</span>
          )}
        </div>
      </div>
      {hint && <span className="adminFormHint muted small">{hint}</span>}
      {error && <span className="adminFormHint adminFormError small">{error}</span>}
    </label>
  );
}
