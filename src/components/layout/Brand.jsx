import React from "react";
import { Link } from "react-router-dom";
import { SITE } from "../../config/site.js";

export default function Brand({ onClick }) {
  return (
    <Link to="/" className="brand" onClick={onClick} aria-label={`${SITE.name} home`}>
      <img className="brand__logo" src="/logo.png" alt="" width="40" height="40" />
      <span className="brand__word">
        <span className="brand__name">{SITE.name}</span>
        <span className="brand__sub">{SITE.tagline}</span>
      </span>
    </Link>
  );
}
