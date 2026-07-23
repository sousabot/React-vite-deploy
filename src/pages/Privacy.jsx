import React from "react";
import PageMotion from "../components/PageMotion.jsx";

export default function Privacy() {
  return (
    <PageMotion>
      <section className="legalPage">
        <div className="legalWrap">
          <h1 className="legalTitle">Privacy Policy</h1>
          <p className="muted legalUpdated">Effective date: 29 Dec 2025</p>

          <p>
            GD Esports (“we”, “us”, “our”) respects your privacy. This Privacy Policy
            explains how we collect, use, disclose, and protect your personal information
            when you use our website (the “Site”).
          </p>

          <h2>1) Information we collect</h2>
          <h3>A. Information you provide</h3>
          <ul>
            <li><b>Account information:</b> email address and any profile info you provide (e.g., gamer tag).</li>
            <li><b>Newsletter signups:</b> email address (and any optional fields you submit).</li>
            <li><b>Contact/support:</b> your email and message content.</li>
            <li><b>Purchases:</b> items purchased and order details needed to fulfil your order.</li>
          </ul>

          <h3>B. Information collected automatically</h3>
          <ul>
            <li><b>Usage data:</b> basic analytics like pages viewed and interactions.</li>
            <li><b>Device data:</b> browser/device type and approximate location derived from IP.</li>
            <li><b>Local storage/cookies:</b> used for login sessions, preferences (e.g., theme), and cart.</li>
          </ul>

          <h2>2) How we use your information</h2>
          <ul>
            <li>Provide and operate the Site and its features.</li>
            <li>Process purchases and fulfil orders.</li>
            <li>Send service messages (account/order notices).</li>
            <li>Send newsletters if you opt in (you can unsubscribe anytime).</li>
            <li>Improve security, prevent fraud/abuse, and improve performance.</li>
            <li>Comply with legal obligations.</li>
          </ul>

          <h2>3) Payments</h2>
          <p>
            Payments are processed by <b>Stripe</b>. We do not store your full card details.
            Stripe processes payment information under its own privacy policy.
          </p>

          <h2>4) Third-party services</h2>
          <p>
            The Site may use third-party services for features such as authentication, analytics,
            embeds, or content. These providers may process data to provide their services.
          </p>

          <h2>5) Data retention</h2>
          <p>
            We keep personal information only as long as necessary to provide the Site, fulfil orders,
            comply with legal obligations, and resolve disputes.
          </p>

          <h2>6) Your choices</h2>
          <ul>
            <li><b>Newsletter:</b> you can unsubscribe anytime using the link in emails.</li>
            <li><b>Account:</b> you may be able to update account details from your profile/dashboard.</li>
            <li><b>Cookies/local storage:</b> you can clear browser storage to remove saved data.</li>
          </ul>

          <h2>7) Security</h2>
          <p>
            We take reasonable measures to protect your data, but no system is 100% secure.
          </p>

          <h2>8) Children</h2>
          <p>
            Our Site is not intended for children under 13. If you believe a child has provided us
            personal data, contact us to remove it.
          </p>

          <h2>9) Contact</h2>
          <p>
            If you have questions about this Privacy Policy, contact us at:{" "}
            <b>socialmediagd25@outlook.com</b>
          </p>
        </div>
      </section>
    </PageMotion>
  );
}
