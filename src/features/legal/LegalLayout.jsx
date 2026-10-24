import React from "react";
import Page from "../../components/ui/Page.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import "./legal.css";

export default function LegalLayout({ title, effective, children }) {
  return (
    <Page>
      <PageHeader eyebrow="Legal" title={title} meta={[`Effective ${effective}`]} />
      <article className="legal">{children}</article>
    </Page>
  );
}
