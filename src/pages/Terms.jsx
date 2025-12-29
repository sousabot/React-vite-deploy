import React from "react";
import PageMotion from "../components/PageMotion.jsx";

export default function Terms() {
  return (
    <PageMotion>
      <section className="legalPage">
        <div className="legalWrap">
          <h1 className="legalTitle">Terms of Service</h1>
          <p className="legalUpdated">Effective date: 29 Dec 2025</p>

          <p>
            These Terms of Service (“Terms”) govern your access to and use of the
            GD Esports website, services, and products (collectively, the “Site”).
            By accessing or using the Site, you agree to be bound by these Terms.
          </p>

          <h2>1) Use of the Site</h2>
          <ul>
            <li>You must be at least 13 years old to use the Site.</li>
            <li>You agree to use the Site only for lawful purposes.</li>
            <li>You may not attempt to disrupt, damage, or gain unauthorised access to the Site.</li>
          </ul>

          <h2>2) Accounts</h2>
          <ul>
            <li>You are responsible for maintaining the security of your account.</li>
            <li>You must provide accurate and up-to-date information.</li>
            <li>We may suspend or terminate accounts that violate these Terms.</li>
          </ul>

          <h2>3) Purchases & Payments</h2>
          <ul>
            <li>All payments are processed securely via Stripe.</li>
            <li>Prices are shown in GBP unless otherwise stated.</li>
            <li>You agree to provide accurate billing and shipping information.</li>
            <li>Customised items (e.g. jerseys with names/numbers) may not be refundable.</li>
          </ul>

          <h2>4) Shipping & Fulfilment</h2>
          <ul>
            <li>We aim to process and ship orders within reasonable timeframes.</li>
            <li>Delivery times may vary based on location and demand.</li>
            <li>GD Esports is not responsible for delays caused by carriers.</li>
          </ul>

          <h2>5) Intellectual Property</h2>
          <ul>
            <li>All content, logos, designs, and branding are owned by GD Esports.</li>
            <li>You may not copy, reproduce, or distribute our content without permission.</li>
          </ul>

          <h2>6) User Content</h2>
          <ul>
            <li>You retain ownership of content you submit (e.g. usernames, messages).</li>
            <li>You grant GD Esports permission to use submitted content for site operation and promotion.</li>
          </ul>

          <h2>7) Limitation of Liability</h2>
          <ul>
            <li>The Site is provided “as is” without warranties of any kind.</li>
            <li>GD Esports is not liable for indirect or consequential damages.</li>
            <li>Our total liability will not exceed the amount paid for the relevant service.</li>
          </ul>

          <h2>8) Termination</h2>
          <ul>
            <li>We may suspend or terminate access to the Site at our discretion.</li>
            <li>Termination does not affect rights or obligations accrued prior.</li>
          </ul>

          <h2>9) Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of the Site
            after changes means you accept the updated Terms.
          </p>

          <h2>10) Contact</h2>
          <p>
            If you have any questions about these Terms, contact us at{" "}
            <a href="mailto:socialmediagd25@outlook.com">socialmediagd25@outlook.com</a>.
          </p>
        </div>
      </section>
    </PageMotion>
  );
}
