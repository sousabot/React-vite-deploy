import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiEdit3, FiLock } from "react-icons/fi";
import { formatGBP, pad2 } from "../../lib/format.js";
import SizePicker from "./SizePicker.jsx";

const EASE = [0.22, 1, 0.36, 1];

/** Size + add-to-cart for one product; keyed by product so it resets on switch. */
function BuyBox({ product, onAdd, onCustomise }) {
  const [size, setSize] = useState(null);
  const [needSize, setNeedSize] = useState(false);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    if (!size) {
      setNeedSize(true);
      return;
    }
    onAdd({ productId: product.id, size, qty: 1, customName: "", customNumber: "" });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="buy-box">
      <div className="buy-box__label mono">
        Size <span className="faint">{size ? `· ${size}` : "· choose one"}</span>
      </div>
      <SizePicker
        sizes={product.sizes}
        value={size}
        error={needSize}
        onChange={(s) => {
          setSize(s);
          setNeedSize(false);
        }}
      />
      <div className="buy-box__actions">
        <button type="button" className="btn btn--primary buy-box__add" onClick={handleAdd}>
          {added ? "Added to cart ✓" : size ? `Add to cart — ${formatGBP(product.price)}` : "Select a size"}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onCustomise}>
          <FiEdit3 aria-hidden="true" /> Add your name
        </button>
      </div>
      <p className="buy-box__secure faint small">
        <FiLock aria-hidden="true" /> Secure checkout powered by Stripe
      </p>
    </div>
  );
}

export default function ShopHero({ products, onAdd, onCustomise }) {
  const [activeId, setActiveId] = useState(products[0]?.id);
  const index = Math.max(0, products.findIndex((p) => p.id === activeId));
  const product = products[index];
  if (!product) return null;

  const word = product.name.split(" ")[0];

  return (
    <section className="shop-hero">
      <div className="shop-hero__stage">
        <span className="shop-hero__word" aria-hidden="true">
          {word}
        </span>
        <AnimatePresence initial={false}>
          <motion.img
            key={product.id}
            className="shop-hero__img"
            src={product.image}
            alt={product.name}
            decoding="async"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.45, ease: EASE }}
          />
        </AnimatePresence>
        <span className="shop-hero__index mono">
          {pad2(index + 1)} / {pad2(products.length)}
        </span>

        <div className="shop-hero__thumbs" role="tablist" aria-label="Choose a kit">
          {products.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={p.id === product.id}
              className={p.id === product.id ? "is-active" : ""}
              onClick={() => setActiveId(p.id)}
              title={p.name}
            >
              <img src={p.image} alt={p.name} loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      </div>

      <div className="shop-hero__info">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={product.id}
            className="shop-hero__copy"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: EASE }}
          >
            <div className="row" style={{ "--row": "8px" }}>
              {product.badge && <span className="tag tag--orange">{product.badge}</span>}
              <span className="tag">{product.edition}</span>
            </div>
            <h2 className="shop-hero__name">{product.name}</h2>
            <div className="shop-hero__price">{formatGBP(product.price)}</div>
            <p className="muted">{product.description}</p>
          </motion.div>
        </AnimatePresence>

        <BuyBox key={product.id} product={product} onAdd={onAdd} onCustomise={() => onCustomise(product)} />
      </div>
    </section>
  );
}
