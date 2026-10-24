import React from "react";

export default function PageHeader({ eyebrow, title, accent, lead, meta = [], actions }) {
  return (
    <header className="page-header">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <div className="page-header__row">
        <h1 className="display display--lg">
          {title}
          {accent && (
            <>
              {" "}
              <span className="text-orange">{accent}</span>
            </>
          )}
        </h1>
        {actions && <div className="row">{actions}</div>}
      </div>
      {lead && <p className="lead">{lead}</p>}
      {meta.length > 0 && (
        <div className="page-header__meta">
          {meta.filter(Boolean).map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      )}
    </header>
  );
}
