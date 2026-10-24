import React from "react";
import { motion } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import { formatGBP } from "../../lib/format.js";

export default function ProductCard({ product, index = 0, onOpen }) {
  return (
    <motion.article
      className="product-card"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <button type="button" className="product-card__hit" onClick={onOpen} aria-label={`View ${product.name}`}>
        <span className="product-card__media">
          <img src={product.image} alt="" loading="lazy" decoding="async" />
          {product.badge && <span className="product-card__badge">{product.badge}</span>}
        </span>
        <span className="product-card__body">
          <span>
            <span className="product-card__name">{product.name}</span>
            <span className="product-card__edition faint small">{product.edition}</span>
          </span>
          <span className="product-card__price">{formatGBP(product.price)}</span>
        </span>
        <span className="product-card__foot mono">
          <span>{product.sizes.length} sizes · {product.sizes[0]}–{product.sizes[product.sizes.length - 1]}</span>
          <span className="product-card__cta">
            Choose size <FiArrowUpRight aria-hidden="true" />
          </span>
        </span>
      </button>
    </motion.article>
  );
}
