import React from "react";

export default function Ticker({ items }) {
  const loop = [...items, ...items];
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        {loop.map((item, i) => (
          <span key={i} className="ticker__item">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
