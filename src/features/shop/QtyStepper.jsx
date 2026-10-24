import React from "react";

export default function QtyStepper({ value, onChange, size }) {
  return (
    <div className={`qty ${size === "sm" ? "qty--sm" : ""}`}>
      <button type="button" onClick={() => onChange(value - 1)} aria-label="Decrease quantity">
        −
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} aria-label="Increase quantity">
        +
      </button>
    </div>
  );
}
