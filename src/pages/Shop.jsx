import React from "react";
import PageMotion from "../components/PageMotion.jsx";

export default function Shop() {
  return (
    <PageMotion>
      <div
        className="shopPage"
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p className="muted" style={{ fontSize: "20px", fontWeight: 700 }}>
          Coming soon
        </p>
      </div>
    </PageMotion>
  );
}
