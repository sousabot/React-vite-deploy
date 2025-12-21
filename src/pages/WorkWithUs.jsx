import React, { useState } from "react";
import { motion } from "framer-motion";
import PageMotion from "../components/PageMotion.jsx";

export default function WorkWithUs() {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <PageMotion>
      <div className="workPage">
        <h2 className="pageTitle">Work With Us</h2>
        <p className="pageDesc">
          Apply for collaborations, competitive teams, or staff roles at GD Esports.
        </p>

        {!submitted ? (
         <motion.form
  className="workForm"
  name="work-with-us"
  method="POST"
  data-netlify="true"
  onSubmit={onSubmit}
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* Required for Netlify */}
  <input type="hidden" name="form-name" value="work-with-us" />

  {/* Name */}
  <div className="formRow">
    <input name="firstName" className="input" placeholder="First Name" required />
    <input name="lastName" className="input" placeholder="Last Name" required />
  </div>

  {/* Age */}
  <div className="formRow">
    <input
      name="age"
      className="input"
      type="number"
      placeholder="Age"
      min="13"
      required
    />
  </div>

  {/* About */}
  <div className="formRow">
    <textarea
      name="about"
      className="input textarea"
      placeholder="Tell us about yourself"
      rows={4}
      required
    />
  </div>

  {/* Tournaments */}
  <div className="formRow">
    <textarea
      name="tournaments"
      className="input textarea"
      placeholder="Tournaments you have played in"
      rows={3}
    />
  </div>

  {/* Discord */}
  <div className="formRow">
    <input
      name="discord"
      className="input"
      placeholder="Discord username (e.g. user#1234)"
      required
    />
  </div>

  <motion.button
    className="btnPrimary"
    whileHover={{ scale: 1.04 }}
    whileTap={{ scale: 0.97 }}
    type="submit"
  >
    Submit Application
  </motion.button>
</motion.form>

        ) : (
          <motion.div
            className="formSuccess"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3>Application submitted ✅</h3>
            <p className="muted">
              Thank you for reaching out. Our team will review your application.
            </p>
          </motion.div>
        )}
      </div>
    </PageMotion>
  );
}
