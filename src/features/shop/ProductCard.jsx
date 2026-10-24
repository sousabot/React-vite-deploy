import React, { useState } from "react";
import { motion } from "framer-motion";
import { formatGBP } from "../../lib/format.js";
import SizePicker from "./SizePicker.jsx";

export default function ProductCard({ product, onAdd, onOpen }) {
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
    setTimeout(() => setAdded(false), 900);
  }

  return (
    <motion.article
      className="product-card"
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
    >
      <button type="button" className="product-card__media" onClick={onOpen} aria-label={`View ${product.name}`}>
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.badge && <span className="product-card__badge">{product.badge}</span>}
        <span className="product-card__quick mono">Quick view</span>
      </button>

      <div className="product-card__body">
        <div className="product-card__head">
          <div>
            <h3 className="product-card__name">{product.name}</h3>
            <div className="faint small">{product.edition}</div>
          </div>
          <div className="product-card__price">{formatGBP(product.price)}</div>
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

        <button type="button" className="btn btn--primary btn--block" onClick={handleAdd}>
          {added ? "Added ✓" : size ? "Add to cart" : "Select size"}
        </button>
      </div>
    </motion.article>
  );
}
