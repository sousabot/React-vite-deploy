import React from "react";

export default function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop__glow" />
      <div className="backdrop__grid" />
      <div className="backdrop__noise" />
    </div>
  );
}
