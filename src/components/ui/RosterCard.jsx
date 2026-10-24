import React from "react";
import { motion } from "framer-motion";
import { initials } from "../../lib/format.js";

/**
 * Shared portrait card for players, staff and creators.
 * Pass `onClick` to render as a button, otherwise it's a static tile.
 */
export default function RosterCard({
  name,
  role,
  sub,
  image,
  number,
  accent,
  badge,
  fallback,
  socials,
  onClick,
  index = 0,
}) {
  const Tag = onClick ? "button" : "div";

  return (
    <motion.div
      className="roster-card-wrap"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4), ease: [0.22, 1, 0.36, 1] }}
    >
      <Tag
        type={onClick ? "button" : undefined}
        className="roster-card"
        style={accent ? { "--accent": accent } : undefined}
        onClick={onClick}
        aria-label={onClick ? `Open ${name}` : undefined}
      >
        {image ? (
          <img
            className="roster-card__img"
            src={image}
            alt={name}
            loading={index < 4 ? "eager" : "lazy"}
          />
        ) : (
          <span className="roster-card__fallback">{fallback || initials(name)}</span>
        )}
        <span className="roster-card__shade" aria-hidden="true" />
        {number && <span className="roster-card__number">#{number}</span>}
        {badge && <span className="roster-card__badge">{badge}</span>}

        <span className="roster-card__body">
          {role && <span className="roster-card__role">{role}</span>}
          <span className="roster-card__name">{name}</span>
          {sub && <span className="roster-card__sub">{sub}</span>}
        </span>
        <span className="roster-card__bar" aria-hidden="true" />
      </Tag>
      {socials}
    </motion.div>
  );
}

export function RosterSocials({ links }) {
  const visible = links.filter((l) => l.href);
  if (!visible.length) return null;
  return (
    <span className="roster-card__socials">
      {visible.map(({ href, label, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          onClick={(e) => e.stopPropagation()}
        >
          <Icon />
        </a>
      ))}
    </span>
  );
}
