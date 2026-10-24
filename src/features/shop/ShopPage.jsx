import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiCreditCard, FiGlobe, FiMail, FiShoppingBag, FiMaximize2 } from "react-icons/fi";
import Page from "../../components/ui/Page.jsx";
import Alert from "../../components/ui/Alert.jsx";
import { PRODUCTS } from "../../content/products.js";
import { SITE } from "../../config/site.js";
import { formatGBP, pad2 } from "../../lib/format.js";
import { useCart } from "./useCart.js";
import ShopHero from "./ShopHero.jsx";
import ProductCard from "./ProductCard.jsx";
import QuickView from "./QuickView.jsx";
import CartDrawer from "./CartDrawer.jsx";
import "./shop.css";

const PERKS = [
  { icon: FiGlobe, title: "UK & international", sub: "Shipping available" },
  { icon: FiMaximize2, title: "Athletic fit", sub: "Between sizes? Size up" },
  { icon: FiCreditCard, title: "Secure payment", sub: "Powered by Stripe" },
  { icon: FiMail, title: "Support", sub: SITE.email },
];

const STEPS = [
  ["Pick your kit", "Choose a jersey and your size."],
  ["Make it yours", "Add a custom name if you want one — up to 16 characters."],
  ["Checkout", "Pay securely with Stripe. Confirmation lands in your inbox."],
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

export default function ShopPage() {
  const [banner, setBanner] = useState(readCheckoutResult);
  const cart = useCart({ clearOnLoad: banner?.tone === "ok" });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quickView, setQuickView] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (window.location.search) window.history.replaceState({}, "", "/shop");
  }, []);

  const products = useMemo(
    () => [...PRODUCTS].sort((a, b) => Number(!!b.featured) - Number(!!a.featured)),
    []
  );

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
    <Page className="shop-page">
      <header className="shop-top">
        <div>
          <span className="eyebrow">Official store</span>
          <h1 className="display display--md">
            The <span className="text-orange">kit.</span>
          </h1>
        </div>
        <button type="button" className="btn btn--ghost shop-cart-btn" onClick={() => setDrawerOpen(true)}>
          <FiShoppingBag aria-hidden="true" />
          Cart
          {cart.count > 0 && (
            <motion.span key={cart.count} className="shop-cart-btn__count" initial={{ scale: 0 }} animate={{ scale: 1 }}>
              {cart.count}
            </motion.span>
          )}
        </button>
      </header>

      {banner && (
        <div style={{ marginBottom: 16 }}>
          <Alert tone={banner.tone} onClose={() => setBanner(null)}>
            {banner.text}
          </Alert>
        </div>
      )}

      <ShopHero products={products} onAdd={addToCart} onCustomise={setQuickView} />

      <ul className="shop-perks">
        {PERKS.map(({ icon: Icon, title, sub }) => (
          <li key={title}>
            <Icon className="shop-perks__icon" aria-hidden="true" />
            <span>
              <span className="shop-perks__title">{title}</span>
              <span className="faint small">{sub}</span>
            </span>
          </li>
        ))}
      </ul>

      <section className="shop-section">
        <div className="shop-section__head">
          <h2 className="display display--sm">Full collection</h2>
          <span className="mono faint">{pad2(products.length)} items</span>
        </div>
        <div className="product-grid">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} onOpen={() => setQuickView(p)} />
          ))}
        </div>
      </section>

      <section className="shop-section">
        <div className="shop-section__head">
          <h2 className="display display--sm">How ordering works</h2>
        </div>
        <ol className="shop-steps">
          {STEPS.map(([title, text], i) => (
            <li key={title}>
              <span className="shop-steps__num mono">{pad2(i + 1)}</span>
              <span className="shop-steps__title">{title}</span>
              <span className="muted small">{text}</span>
            </li>
          ))}
        </ol>
      </section>

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
