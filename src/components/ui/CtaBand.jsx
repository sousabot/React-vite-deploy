import React from "react";

export default function CtaBand({ eyebrow, title, sub, children }) {
  return (
    <section className="cta-band">
      <div className="cta-band__copy">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 className="display display--md">{title}</h2>
        {sub && <p className="muted">{sub}</p>}
      </div>
      <div className="cta-band__actions row">{children}</div>
    </section>
  );
}
