import React from "react";
import { FiX } from "react-icons/fi";

export default function Alert({ tone = "info", onClose, children }) {
  return (
    <div className={`alert alert--${tone}`} role={tone === "error" ? "alert" : "status"}>
      <div>{children}</div>
      {onClose && (
        <button type="button" className="alert__close" onClick={onClose} aria-label="Dismiss">
          <FiX />
        </button>
      )}
    </div>
  );
}
