import React from "react";

export default function SizePicker({ sizes, value, onChange, error }) {
  return (
    <div className="size-picker">
      <div className="size-picker__options" role="radiogroup" aria-label="Size">
        {sizes.map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={value === s}
            className={`size-picker__btn ${value === s ? "is-active" : ""}`}
            onClick={() => onChange(s)}
          >
            {s}
          </button>
        ))}
      </div>
      {error && <div className="field__error">Pick a size to continue</div>}
    </div>
  );
}
