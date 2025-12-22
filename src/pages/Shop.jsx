import React from "react";
import { motion } from "framer-motion";
import PageMotion from "../components/PageMotion.jsx";

const PRODUCTS = [
  {
    id: "jersey",
    name: "GD Esports Jersey",
    desc: "Official competition jersey",
    preview:
      "https://www.spized.com/uk-en/design-preview?cfgId=9c58ed21fcfae35b449522141611f77833875fb7c5be760a69db6080e8352126381d90eb5ab54adc9f3ecf271cab68c2607f99f6eed0d09f17daa43ac52da0a3",
    image: "/vite.svg", // replace later with real mockup
  },
];

export default function Shop() {
  return (
    <PageMotion>
      <div className="shopPage">
        {/* HERO */}
        <header className="shopHero">
          <h1 className="shopTitle">GD ESPORTS SHOP</h1>
          <p className="shopSubtitle">Official team apparel</p>
        </header>

        {/* PRODUCTS */}
        <section className="shopGrid">
          {PRODUCTS.map((p) => (
            <motion.div
              key={p.id}
              className="shopCard"
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className="shopImg"
                style={{ backgroundImage: `url(${p.image})` }}
              />

              <div className="shopInfo">
                <h3>{p.name}</h3>
                <p className="muted">{p.desc}</p>

                <a
                  href={p.preview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btnPrimary shopBtn"
                >
                  View / Customize
                </a>
              </div>
            </motion.div>
          ))}
        </section>
      </div>
    </PageMotion>
  );
}
