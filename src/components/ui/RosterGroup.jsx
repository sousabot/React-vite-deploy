import React from "react";

export default function RosterGroup({ label, count, noun, children }) {
  return (
    <section className="roster-group">
      <div className="roster-group__head">
        <h2 className="display display--sm">{label}</h2>
        <span className="mono faint">
          {String(count).padStart(2, "0")} {noun}
        </span>
      </div>
      <div className="roster-grid">{children}</div>
    </section>
  );
}
