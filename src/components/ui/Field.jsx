import React from "react";

export default function Field({ label, hint, error, required, className = "", children }) {
  return (
    <label className={`field ${className}`}>
      <span className="field__label">
        {label}
        {required && <span className="field__req">*</span>}
      </span>
      {children}
      {hint && <span className="field__hint">{hint}</span>}
      {error && <span className="field__error">{error}</span>}
    </label>
  );
}
