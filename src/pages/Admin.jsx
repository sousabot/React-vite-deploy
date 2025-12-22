import React from "react";
import PageMotion from "../components/PageMotion.jsx";

export default function Admin() {
  return (
    <PageMotion>
      <div className="adminPage">
        <h1>Admin Panel</h1>
        <p className="muted">Restricted access — admins only.</p>

        <div className="adminCard">
          <h3>Site Controls</h3>
          <ul>
            <li>✔ View tryout applications</li>
            <li>✔ Manage creators</li>
            <li>✔ Update org status</li>
          </ul>
        </div>
      </div>
    </PageMotion>
  );
}
