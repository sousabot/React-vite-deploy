import React from "react";
import Page from "../../components/ui/Page.jsx";
import "./auth.css";

export default function AuthCard({ eyebrow, title, sub, children, footer }) {
  return (
    <Page className="auth">
      <div className="auth__card panel panel--notch">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="display display--md">{title}</h1>
        {sub && <p className="muted">{sub}</p>}
        {children}
        {footer && <div className="auth__footer muted small">{footer}</div>}
      </div>
    </Page>
  );
}
