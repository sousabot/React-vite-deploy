import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiShoppingBag } from "react-icons/fi";
import Page from "../../components/ui/Page.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Alert from "../../components/ui/Alert.jsx";
import { PRODUCTS, PRODUCT_CATEGORIES } from "../../content/products.js";
import { SITE } from "../../config/site.js";
import { formatGBP } from "../../lib/format.js";
import { useCart } from "./useCart.js";
import ProductCard from "./ProductCard.jsx";
import QuickView from "./QuickView.jsx";
import CartDrawer from "./CartDrawer.jsx";
import "./shop.css";

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "name", label: "Name A–Z" },
];

const PERKS = [
  ["UK & international", "Shipping available"],
  ["Athletic fit", "Between sizes? Size up"],
  ["Secure payment", "Powered by Stripe"],
  ["Support", SITE.email],
];

function readCheckoutResult() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("success") === "1") {
    return { tone: "ok", text: "Payment received — check your email for confirmation." };
  }
  if (params.get("canceled") === "1") {
    return { tone: "warn", text: "Checkout cancelled. Your cart is still here when you're ready." };
  }
  return null;
}

function sortProducts(list, sort) {
  const copy = [...list];
  if (sort === "price-asc") return copy.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") return copy.sort((a, b) => b.price - a.price);
  if (sort === "name") return copy.sort((a, b) => a.name.localeCompare(b.name));
  return copy.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
}

export default function ShopPage() {
  const [banner, setBanner] = useState(readCheckoutResult);
  const cart = useCart({ clearOnLoad: banner?.tone === "ok" });
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quickView, setQuickView] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (window.location.search) window.history.replaceState({}, "", "/shop");
  }, []);

  const products = useMemo(() => {
    const list = category === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === category);
    return sortProducts(list, sort);
  }, [category, sort]);

  function addToCart(item) {
    cart.add(item);
    setDrawerOpen(true);
  }

  async function checkout() {
    if (!cart.lines.length || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/.netlify/functions/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: cart.lines }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) {
        setBanner({ tone: "error", text: data?.error || `Checkout failed (${res.status})` });
        setDrawerOpen(false);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      setBanner({ tone: "error", text: err?.message || "Checkout failed" });
      setDrawerOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page>
      <PageHeader
        eyebrow="Official store"
        title="The"
        accent="kit."
        lead="Official GD Esports jerseys. Pick a size, add to cart, checkout securely with Stripe."
        actions={
          <button type="button" className="btn btn--ghost shop-cart-btn" onClick={() => setDrawerOpen(true)}>
            <FiShoppingBag aria-hidden="true" />
            Cart
            {cart.count > 0 && (
              <motion.span key={cart.count} className="shop-cart-btn__count" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                {cart.count}
              </motion.span>
            )}
          </button>
        }
      />

      {banner && (
        <div style={{ marginBottom: 24 }}>
          <Alert tone={banner.tone} onClose={() => setBanner(null)}>
            {banner.text}
          </Alert>
        </div>
      )}

      <div className="shop-toolbar">
        <div className="chip-row">
          {PRODUCT_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`chip ${category === c.id ? "is-active" : ""}`}
              onClick={() => setCategory(c.id)}
            >
              {c.label}
              <span className="chip__count">
                {c.id === "all" ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === c.id).length}
              </span>
            </button>
          ))}
        </div>
        <label className="row" style={{ "--row": "10px" }}>
          <span className="mono faint">Sort</span>
          <select className="input shop-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <motion.div className="product-grid" layout>
        <AnimatePresence mode="popLayout">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={addToCart} onOpen={() => setQuickView(p)} />
          ))}
        </AnimatePresence>
      </motion.div>

      <ul className="shop-perks">
        {PERKS.map(([title, sub]) => (
          <li key={title}>
            <span className="shop-perks__title">{title}</span>
            <span className="faint small">{sub}</span>
          </li>
        ))}
      </ul>

      {cart.count > 0 && !drawerOpen && (
        <div className="shop-mobile-bar">
          <span>
            <strong>{cart.count}</strong> in cart · {formatGBP(cart.subtotal)}
          </span>
          <button type="button" className="btn btn--primary btn--sm" onClick={() => setDrawerOpen(true)}>
            Checkout
          </button>
        </div>
      )}

      <QuickView
        product={quickView}
        onClose={() => setQuickView(null)}
        onAdd={(item) => {
          setQuickView(null);
          addToCart(item);
        }}
      />
      <CartDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        cart={cart}
        onCheckout={checkout}
        busy={busy}
      />
    </Page>
  );
}
