import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import { getProduct } from "../../content/products.js";
import { formatGBP } from "../../lib/format.js";
import { useOverlay } from "../../hooks/useOverlay.js";
import QtyStepper from "./QtyStepper.jsx";

export default function CartDrawer({ open, onClose, cart, onCheckout, busy }) {
  useOverlay(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="cart-drawer"
            aria-label="Cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 38 }}
          >
            <div className="cart-drawer__head">
              <div>
                <div className="modal__title">Your cart</div>
                <div className="mono faint">{cart.count} items</div>
              </div>
              <button type="button" className="icon-btn" onClick={onClose} aria-label="Close cart">
                <FiX />
              </button>
            </div>

            <div className="cart-drawer__body">
              {cart.lines.length === 0 ? (
                <div className="empty">
                  <p className="muted">Your cart is empty.</p>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
                    Keep shopping
                  </button>
                </div>
              ) : (
                cart.lines.map((line, idx) => {
                  const p = getProduct(line.productId);
                  const unit = Number(p?.price || 0);
                  return (
                    <div key={`${line.productId}-${line.size}-${line.customName}`} className="cart-line">
                      <img className="cart-line__img" src={p?.image} alt="" />
                      <div className="cart-line__info">
                        <div className="cart-line__name">{p?.name || line.productId}</div>
                        <div className="mono faint">
                          Size {line.size}
                          {line.customName ? ` · ${line.customName}` : ""}
                        </div>
                        <QtyStepper size="sm" value={line.qty || 1} onChange={(q) => cart.setQty(idx, q)} />
                      </div>
                      <div className="cart-line__total">{formatGBP(unit * (line.qty || 1))}</div>
                    </div>
                  );
                })
              )}
            </div>

            {cart.lines.length > 0 && (
              <div className="cart-drawer__foot">
                <div className="cart-drawer__subtotal">
                  <span className="mono faint">Subtotal</span>
                  <span>{formatGBP(cart.subtotal)}</span>
                </div>
                <button type="button" className="btn btn--primary btn--block" onClick={onCheckout} disabled={busy}>
                  {busy ? "Redirecting…" : "Checkout with Stripe"}
                </button>
                <button type="button" className="link small" onClick={cart.clear}>
                  Clear cart
                </button>
                <p className="faint small">
                  After payment you'll receive a confirmation email. We'll process and ship your order.
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
