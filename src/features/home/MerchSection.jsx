import React from "react";
import { Link } from "react-router-dom";
import SectionHead from "../../components/ui/SectionHead.jsx";
import { PRODUCTS } from "../../content/products.js";
import { formatGBP } from "../../lib/format.js";
import { track } from "../../lib/track.js";

export default function MerchSection() {
  const featured = PRODUCTS.filter((p) => p.featured);

  return (
    <section className="section container">
      <SectionHead
        index="02"
        eyebrow="Official kit"
        title="Wear the colours"
        sub="Home and away jerseys. Limited runs — restocks hit Discord first."
        actions={
          <Link to="/shop" className="btn btn--ghost btn--sm">
            Open shop
          </Link>
        }
      />

      <div className="merch-grid">
        {featured.map((p, i) => (
          <Link
            key={p.id}
            to="/shop"
            className={`merch-tile ${i === 0 ? "merch-tile--hot" : ""}`}
            onClick={() => track("jersey_view", { id: p.id })}
          >
            <span className="merch-tile__index mono">0{i + 1}</span>
            <img className="merch-tile__img" src={p.image} alt={p.name} loading="lazy" />
            <span className="merch-tile__meta">
              <span>
                <span className="merch-tile__name">{p.name}</span>
                <span className="faint small">{p.edition}</span>
              </span>
              <span className="merch-tile__price">{formatGBP(p.price)}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
