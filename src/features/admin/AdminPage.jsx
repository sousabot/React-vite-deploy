import React from "react";
import { Link } from "react-router-dom";
import Page from "../../components/ui/Page.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import ContentManager from "./ContentManager.jsx";
import "./admin.css";

export default function AdminPage() {
  return (
    <Page>
      <PageHeader
        eyebrow="Admin"
        title="Content"
        accent="manager."
        lead="Update matches, creators, staff and partners without touching code. Changes go live after Publish."
        actions={
          <Link to="/dashboard" className="btn btn--ghost btn--sm">
            Dashboard
          </Link>
        }
      />
      <ContentManager />
    </Page>
  );
}
