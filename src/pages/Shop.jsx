import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageMotion from "../components/PageMotion.jsx";

/* ─── DATA ─────────────────────────────────────────── */

const CATEGORIES = [
  { id: "all",     label: "All",     icon: "⊞" },
  { id: "jersey",  label: "Jerseys", icon: "👕" },
  { id: "acc",     label: "Accessories", icon: "🎮" },
];

const PRODUCTS = [
  {
    id: "home",
    name: "Home Jersey",
    tag: "Orange Edition",
    category: "jersey",
    img: "/jersey-reveal.png",
    price: 70.00,
    desc: "Official GD Esports Home Jersey. Premium athletic fit.",
    sizes: ["XS","S","M","L","XL","2XL","3XL","4XL","5XL"],
    badge: "Best Seller",
    badgeColor: "#ff7a00",
  },
  {
    id: "away",
    name: "Away Jersey",
    tag: "Black Edition",
    category: "jersey",
    img: "/jersey-away.png",
    price: 30.00,
    desc: "Official GD Esports Away Jersey. Premium athletic fit.",
    sizes: ["XS","S","M","L","XL","XXL"],
    badge: null,
  },
  {
    id: "jersey",
    name: "Jersey",
    tag: "Black & Orange Edition",
    category: "jersey",
    img: "/jersey.png",
    price: 30.00,
    desc: "Official GD Esports Jersey. Premium athletic fit.",
    sizes: ["XS","S","M","L","XL","XXL"],
    badge: "New",
    badgeColor: "#22c55e",
  },
];

const SORT_OPTIONS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: Low → High" },
  { id: "price-desc", label: "Price: High → Low" },
  { id: "name", label: "Name A–Z" },
];

/* ─── UTILS ─────────────────────────────────────────── */

function formatGBP(n) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(n || 0));
}

function loadCart() {
  try {
    const raw = localStorage.getItem("gd_cart_v1");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveCart(items) {
  try { localStorage.setItem("gd_cart_v1", JSON.stringify(items)); } catch {}
}

function cartKey({ productId, size, customName, customNumber }) {
  return [productId, size || "", (customName || "").trim().toLowerCase(), (customNumber || "").trim()].join("|");
}

/* ─── MAIN PAGE ─────────────────────────────────────── */

export default function Shop() {
  const [cart, setCart] = useState(() => loadCart());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  /* cart helpers */
  function addToCart(item) {
    setCart((prev) => {
      const next = [...prev];
      const key = cartKey(item);
      const idx = next.findIndex((x) => cartKey(x) === key);
      if (idx >= 0) {
        next[idx] = { ...next[idx], qty: Math.min(10, (next[idx].qty || 1) + (item.qty || 1)) };
      } else {
        next.push({ ...item, qty: Math.min(10, item.qty || 1) });
      }
      saveCart(next);
      return next;
    });
    setDrawerOpen(true);
  }

  function updateQty(index, qty) {
    setCart((prev) => {
      const next = [...prev];
      if (qty < 1) { next.splice(index, 1); }
      else { next[index] = { ...next[index], qty: Math.min(10, qty) }; }
      saveCart(next);
      return next;
    });
  }

  function removeItem(index) {
    setCart((prev) => { const next = prev.filter((_, i) => i !== index); saveCart(next); return next; });
  }

  function clearCart() { setCart([]); saveCart([]); }

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, line) => {
      const p = PRODUCTS.find((x) => x.id === line.productId);
      return sum + Number(p?.price || 0) * Number(line.qty || 1);
    }, 0);
    return { subtotal };
  }, [cart]);

  async function checkout() {
    if (cart.length === 0) return;
    try {
      const res = await fetch("/.netlify/functions/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { alert(data?.error || `Checkout failed (${res.status})`); return; }
      if (!data?.url) { alert("Checkout failed (no url returned)"); return; }
      window.location.href = data.url;
    } catch (err) { alert(err?.message || "Checkout failed"); }
  }

  const cartCount = cart.reduce((a, x) => a + (x.qty || 1), 0);

  /* filtered + sorted products */
  const displayProducts = useMemo(() => {
    let list = activeCategory === "all"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

    switch (sortBy) {
      case "price-asc":  return [...list].sort((a, b) => a.price - b.price);
      case "price-desc": return [...list].sort((a, b) => b.price - a.price);
      case "name":       return [...list].sort((a, b) => a.name.localeCompare(b.name));
      default:           return list;
    }
  }, [activeCategory, sortBy]);

  /* lock scroll when drawer open */
  useEffect(() => {
    document.body.style.overflow = drawerOpen || quickViewProduct ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen, quickViewProduct]);

  return (
    <PageMotion>
      <div className="shopV2Page">

        {/* ── TOP BAR ───────────────────────────────────── */}
        <div className="shopV2TopBar">
          <div className="shopV2TopBarLeft">
            <span className="shopV2Eyebrow">GD ESPORTS</span>
            <h1 className="shopV2Title">Shop</h1>
          </div>

          <button
            className="shopV2CartBtn"
            onClick={() => setDrawerOpen(true)}
          >
            <span className="shopV2CartIcon">🛒</span>
            <span className="shopV2CartLabel">Cart</span>
            {cartCount > 0 && (
              <motion.span
                className="shopV2CartBadge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={cartCount}
              >
                {cartCount}
              </motion.span>
            )}
          </button>
        </div>

        {/* ── CATEGORY + SORT BAR ──────────────────────── */}
        <div className="shopV2ControlBar">
          <div className="shopV2Cats">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`shopV2CatBtn ${activeCategory === cat.id ? "active" : ""}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span>{cat.icon}</span>
                {cat.label}
                {cat.id !== "all" && (
                  <span className="shopV2CatCount">
                    {PRODUCTS.filter((p) => p.category === cat.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="shopV2SortRow">
            <span className="shopV2SortLabel muted small">Sort</span>
            <select
              className="shopV2SortSelect"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── RESULTS SUMMARY ───────────────────────────── */}
        <div className="shopV2ResultsMeta muted small">
          {displayProducts.length} product{displayProducts.length !== 1 ? "s" : ""}
          {activeCategory !== "all" && ` in ${CATEGORIES.find(c => c.id === activeCategory)?.label}`}
        </div>

        {/* ── PRODUCT GRID ─────────────────────────────── */}
        <motion.div
          className="shopV2Grid"
          layout
        >
          <AnimatePresence mode="popLayout">
            {displayProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAdd={addToCart}
                onQuickView={() => setQuickViewProduct(p)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* ── INFO STRIP ───────────────────────────────── */}
        <div className="shopV2InfoStrip">
          {[
            { icon: "🚚", title: "UK & International", sub: "Shipping available" },
            { icon: "📏", title: "Athletic Fit", sub: "Between sizes? Size up" },
            { icon: "🔒", title: "Secure Payment", sub: "Powered by Stripe" },
            { icon: "📧", title: "Support", sub: "socialmediagd25@outlook.com" },
          ].map((item) => (
            <div key={item.title} className="shopV2InfoItem">
              <span className="shopV2InfoIcon">{item.icon}</span>
              <div>
                <div className="shopV2InfoTitle">{item.title}</div>
                <div className="shopV2InfoSub muted small">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── QUICK VIEW MODAL ──────────────────────────── */}
        <AnimatePresence>
          {quickViewProduct && (
            <QuickView
              product={quickViewProduct}
              onClose={() => setQuickViewProduct(null)}
              onAdd={(item) => { addToCart(item); setQuickViewProduct(null); }}
            />
          )}
        </AnimatePresence>

        {/* ── CART DRAWER ───────────────────────────────── */}
        <AnimatePresence>
          {drawerOpen && (
            <>
              <motion.div
                className="shopV2Backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDrawerOpen(false)}
              />
              <motion.div
                className="shopV2Drawer"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 340, damping: 38 }}
              >
                <div className="shopV2DrawerHeader">
                  <div>
                    <div className="shopV2DrawerTitle">Your Cart</div>
                    <div className="muted small">Secure checkout via Stripe</div>
                  </div>
                  <button className="shopV2DrawerClose btnIcon" onClick={() => setDrawerOpen(false)}>✕</button>
                </div>

                <div className="shopV2DrawerBody">
                  {cart.length === 0 ? (
                    <div className="shopV2EmptyCart">
                      <div className="shopV2EmptyIcon">🛒</div>
                      <div className="muted">Your cart is empty</div>
                      <button className="btnGhost" style={{ marginTop: 10 }} onClick={() => setDrawerOpen(false)}>
                        Keep shopping
                      </button>
                    </div>
                  ) : (
                    cart.map((line, idx) => {
                      const p = PRODUCTS.find((x) => x.id === line.productId);
                      const unit = Number(p?.price || 0);
                      return (
                        <div key={idx} className="shopV2CartLine">
                          <img className="shopV2CartThumb" src={p?.img} alt={p?.name} />
                          <div className="shopV2CartLineInfo">
                            <div className="shopV2CartLineName">{p?.name || line.productId}</div>
                            <div className="muted small">
                              Size: {line.size || "–"}
                              {line.customName ? ` · ${line.customName}` : ""}
                            </div>
                            <div className="shopV2CartLinePrice">{formatGBP(unit)}</div>
                          </div>
                          <div className="shopV2CartQty">
                            <button className="shopV2QtyBtn" onClick={() => updateQty(idx, (line.qty || 1) - 1)}>−</button>
                            <span className="shopV2QtyNum">{line.qty || 1}</span>
                            <button className="shopV2QtyBtn" onClick={() => updateQty(idx, (line.qty || 1) + 1)}>+</button>
                          </div>
                          <div className="shopV2CartLineTotal">{formatGBP(unit * (line.qty || 1))}</div>
                        </div>
                      );
                    })
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="shopV2DrawerFooter">
                    <div className="shopV2SubtotalRow">
                      <span className="muted">Subtotal</span>
                      <span className="shopV2SubtotalAmt">{formatGBP(totals.subtotal)}</span>
                    </div>
                    <button className="btnPrimary shopV2CheckoutBtn" onClick={checkout}>
                      Checkout
                    </button>
                    <button className="shopV2ClearBtn muted small" onClick={clearCart}>
                      Clear cart
                    </button>
                    <div className="muted small" style={{ marginTop: 8, textAlign: "center", lineHeight: 1.5 }}>
                      After payment you'll receive a confirmation email. We'll process and ship your order.
                    </div>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </PageMotion>
  );
}

/* ─── PRODUCT CARD ──────────────────────────────────── */

function ProductCard({ product, onAdd, onQuickView }) {
  const sizes = product.sizes?.length ? product.sizes : ["M"];
  const [size, setSize] = useState(sizes[0]);
  const [adding, setAdding] = useState(false);

  useEffect(() => { setSize(sizes[0]); }, [product.id]);

  function handleAdd() {
    setAdding(true);
    onAdd({ productId: product.id, size, qty: 1, customName: "", customNumber: "" });
    setTimeout(() => setAdding(false), 900);
  }

  return (
    <motion.article
      className="shopV2Card"
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.22 }}
      whileHover={{ y: -3 }}
    >
      {/* image */}
      <div className="shopV2CardImg" onClick={onQuickView}>
        <img src={product.img} alt={product.name} loading="lazy" />
        {product.badge && (
          <span
            className="shopV2Badge"
            style={{ background: product.badgeColor || "var(--accent)" }}
          >
            {product.badge}
          </span>
        )}
        <div className="shopV2CardImgOverlay">
          <button className="shopV2QuickViewBtn" onClick={onQuickView}>Quick view</button>
        </div>
      </div>

      {/* body */}
      <div className="shopV2CardBody">
        <div className="shopV2CardMeta">
          <div>
            <div className="shopV2CardName">{product.name}</div>
            <div className="shopV2CardTag muted small">{product.tag}</div>
          </div>
          <div className="shopV2CardPrice">{formatGBP(product.price)}</div>
        </div>

        {/* size picker */}
        <div className="shopV2SizePicker">
          {sizes.map((s) => (
            <button
              key={s}
              className={`shopV2SizeBtn ${size === s ? "active" : ""}`}
              onClick={() => setSize(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {/* add btn */}
        <motion.button
          className={`shopV2AddBtn ${adding ? "added" : ""}`}
          onClick={handleAdd}
          whileTap={{ scale: 0.97 }}
        >
          {adding ? "✓ Added" : "Add to cart"}
        </motion.button>
      </div>
    </motion.article>
  );
}

/* ─── QUICK VIEW ────────────────────────────────────── */

function QuickView({ product, onClose, onAdd }) {
  const sizes = product.sizes?.length ? product.sizes : ["M"];
  const [size, setSize] = useState(sizes[0]);
  const [qty, setQty] = useState(1);
  const [customName, setCustomName] = useState("");

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <motion.div
        className="shopV2Backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="shopV2QuickView"
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.22 }}
      >
        <button className="shopV2QVClose btnIcon" onClick={onClose}>✕</button>

        <div className="shopV2QVGrid">
          <div className="shopV2QVImg">
            <img src={product.img} alt={product.name} />
            {product.badge && (
              <span className="shopV2Badge" style={{ background: product.badgeColor || "var(--accent)" }}>
                {product.badge}
              </span>
            )}
          </div>

          <div className="shopV2QVInfo">
            <div className="shopV2QVName">{product.name}</div>
            <div className="shopV2QVTag muted">{product.tag}</div>
            <div className="shopV2QVPrice">{formatGBP(product.price)}</div>
            <p className="shopV2QVDesc muted">{product.desc}</p>

            <div className="shopV2QVSection">
              <div className="shopV2QVSectionLabel small">Size</div>
              <div className="shopV2SizePicker">
                {sizes.map((s) => (
                  <button
                    key={s}
                    className={`shopV2SizeBtn ${size === s ? "active" : ""}`}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="shopV2QVSection">
              <div className="shopV2QVSectionLabel small">Custom name (optional)</div>
              <input
                className="input"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. MEWTZU"
                maxLength={16}
              />
            </div>

            <div className="shopV2QVSection">
              <div className="shopV2QVSectionLabel small">Quantity</div>
              <div className="shopV2QVQtyRow">
                <button className="shopV2QtyBtn" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span className="shopV2QtyNum">{qty}</span>
                <button className="shopV2QtyBtn" onClick={() => setQty((q) => Math.min(10, q + 1))}>+</button>
              </div>
            </div>

            <button
              className="btnPrimary shopV2CheckoutBtn"
              onClick={() => onAdd({ productId: product.id, size, qty, customName, customNumber: "" })}
            >
              Add to cart — {formatGBP(product.price * qty)}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}