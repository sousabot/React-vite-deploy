import React from "react";

export default function SectionHead({ index, eyebrow, title, sub, actions }) {
  return (
    <div className="section-head">
      <div className="section-head__copy">
        <div className="row" style={{ "--row": "14px" }}>
          {index && <span className="section-index">{index}</span>}
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        </div>
        <h2 className="display display--md">{title}</h2>
        {sub && <p className="muted">{sub}</p>}
      </div>
      {actions && <div className="row">{actions}</div>}
    </div>
  );
}
