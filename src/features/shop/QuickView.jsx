import React, { useState } from "react";
import Modal from "../../components/ui/Modal.jsx";
import Field from "../../components/ui/Field.jsx";
import { formatGBP } from "../../lib/format.js";
import SizePicker from "./SizePicker.jsx";
import QtyStepper from "./QtyStepper.jsx";

function QuickViewBody({ product, onAdd }) {
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [customName, setCustomName] = useState("");
  const [needSize, setNeedSize] = useState(false);

  function handleAdd() {
    if (!size) {
      setNeedSize(true);
      return;
    }
    onAdd({ productId: product.id, size, qty, customName, customNumber: "" });
  }

  return (
    <div className="quick-view">
      <div className="quick-view__media">
        <img src={product.image} alt={product.name} />
        {product.badge && <span className="product-card__badge">{product.badge}</span>}
      </div>
      <div className="quick-view__info">
        <span className="eyebrow">{product.edition}</span>
        <h2 className="display display--md">{product.name}</h2>
        <div className="product-card__price">{formatGBP(product.price)}</div>
        <p className="muted">{product.description}</p>

        <Field label="Size" required>
          <SizePicker
            sizes={product.sizes}
            value={size}
            error={needSize}
            onChange={(s) => {
              setSize(s);
              setNeedSize(false);
            }}
          />
        </Field>

        <Field label="Custom name" hint="Optional, up to 16 characters">
          <input
            className="input"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="e.g. MEWTZU"
            maxLength={16}
          />
        </Field>

        <Field label="Quantity">
          <QtyStepper value={qty} onChange={(q) => setQty(Math.max(1, Math.min(10, q)))} />
        </Field>

        <button type="button" className="btn btn--primary btn--block" onClick={handleAdd}>
          {size ? `Add to cart — ${formatGBP(product.price * qty)}` : "Select a size"}
        </button>
      </div>
    </div>
  );
}

export default function QuickView({ product, onClose, onAdd }) {
  // Keep the last product rendered so the exit animation has content.
  const [shown, setShown] = useState(product);
  if (product && product !== shown) setShown(product);

  return (
    <Modal open={!!product} onClose={onClose} title="Product" wide>
      {shown && <QuickViewBody key={shown.id} product={shown} onAdd={onAdd} />}
    </Modal>
  );
}
