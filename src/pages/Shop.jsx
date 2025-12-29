import React, { useEffect, useMemo, useState } from "react";
import PageMotion from "../components/PageMotion.jsx";

/** ✅ Per-product sizes */
const PRODUCTS = [
  {
    id: "home",
    name: "Home Jersey",
    tag: "Orange Edition",
    img: "/jersey-reveal.png",
    price: 70.00, // ✅ testing: £1.00 (set to 49.99 when live)
    desc: "Official GD Esports Home Jersey. Premium athletic fit.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"], // ✅ only one size
  },
  {
    id: "away",
    name: "Away Jersey",
    tag: "Black Edition",
    img: "/jersey-away.png",
    price: 30.00,
    desc: "Official GD Esports Away Jersey. Premium athletic fit.",
    sizes: ["L", "M", "S", "XL", "XS", "XXL"], // ✅ multiple sizes
  },
];

function formatGBP(n) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(n || 0));
}

function loadCart() {
  try {
    const raw = localStorage.getItem("gd_cart_v1");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  try {
    localStorage.setItem("gd_cart_v1", JSON.stringify(items));
  } catch {
    // ignore
  }
}

function cartKey({ productId, size, customName, customNumber }) {
  return [
    productId,
    size || "",
    (customName || "").trim().toLowerCase(),
    (customNumber || "").trim(),
  ].join("|");
}

export default function Shop() {
  const [cart, setCart] = useState(() => loadCart());
  const [drawerOpen, setDrawerOpen] = useState(false);

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
      next[index] = { ...next[index], qty: Math.max(1, Math.min(10, qty)) };
      saveCart(next);
      return next;
    });
  }

  function removeItem(index) {
    setCart((prev) => {
      const next = prev.filter((_, i) => i !== index);
      saveCart(next);
      return next;
    });
  }

  function clearCart() {
    setCart([]);
    saveCart([]);
  }

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, line) => {
      const p = PRODUCTS.find((x) => x.id === line.productId);
      const price = Number(p?.price || 0);
      return sum + price * Number(line.qty || 1);
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

      if (!res.ok) {
        console.error("Checkout error:", data);
        alert(data?.error || `Checkout failed (${res.status})`);
        return;
      }

      if (!data?.url) {
        console.error("No url returned:", data);
        alert("Checkout failed (no url returned)");
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert(err?.message || "Checkout failed");
    }
  }

  const cartCount = cart.reduce((a, x) => a + (x.qty || 1), 0);

  return (
    <PageMotion>
      <section className="shopPage">
        <div className="shopWrap">
          <header className="shopHeader">
            <div className="shopKicker">GD ESPORTS SHOP</div>
            <h1 className="shopTitle">Official Jerseys</h1>
            <p className="shopSub">
              Buy directly on gdesports — secure payment via Stripe. We’ll process and ship your jersey.
            </p>

            <div className="shopCtas">
              <a className="btn btnPrimary" href="#jerseys">Shop jerseys</a>
              <button className="btn btnGhost" type="button" onClick={() => setDrawerOpen(true)}>
                Cart ({cartCount})
              </button>
            </div>
          </header>

          <div className="shopSection" id="jerseys">
            <div className="shopSectionTop">
              <h2 className="shopH2">Jerseys</h2>
              <div className="shopPills">
                <span className="shopPill">Official kit</span>
                <span className="shopPill">Premium fit</span>
                <span className="shopPill">Custom name/number</span>
              </div>
            </div>

            <div className="shopGrid">
              {PRODUCTS.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={addToCart} />
              ))}
            </div>
          </div>

          <div className="shopInfo">
            <div className="shopInfoCard">
              <div className="shopInfoTitle">Shipping</div>
              <div className="shopInfoText">UK & international shipping available.</div>
            </div>
            <div className="shopInfoCard">
              <div className="shopInfoTitle">Sizing</div>
              <div className="shopInfoText">Athletic fit. Between sizes? Size up.</div>
            </div>
            <div className="shopInfoCard">
              <div className="shopInfoTitle">Support</div>
              <div className="shopInfoText">Problems with an order? Contact us and we’ll sort it.</div>
            </div>
          </div>
        </div>

        {/* CART DRAWER */}
        {drawerOpen && (
          <div className="cartModal" role="dialog" aria-modal="true">
            <div className="cartBackdrop" onClick={() => setDrawerOpen(false)} />
            <div className="cartDrawer">
              <div className="cartTop">
                <div>
                  <div className="cartTitle">Your cart</div>
                  <div className="muted small">Secure payment handled by Stripe.</div>
                </div>
                <div className="row" style={{ gap: 10 }}>
                  <button className="btn btnGhost" type="button" onClick={clearCart} disabled={cart.length === 0}>
                    Clear
                  </button>
                  <button className="btn btnPrimary" type="button" onClick={() => setDrawerOpen(false)}>
                    Close
                  </button>
                </div>
              </div>

              <div className="cartBody">
                {cart.length === 0 ? (
                  <div className="muted" style={{ padding: 16 }}>Your cart is empty.</div>
                ) : (
                  <div style={{ display: "grid", gap: 10 }}>
                    {cart.map((line, idx) => {
                      const p = PRODUCTS.find((x) => x.id === line.productId);
                      const unit = Number(p?.price || 0);

                      return (
                        <div key={idx} className="cartLine">
                          <img className="cartThumb" src={p?.img} alt={p?.name} />
                          <div style={{ minWidth: 0 }}>
                            <div className="cartLineTitle">{p?.name || line.productId}</div>
                            <div className="muted small">
                              Size: {line.size || "-"}
                              {line.customName || line.customNumber
                                ? ` • Name: ${line.customName || "-"} • #${line.customNumber || "-"}`
                                : ""}
                            </div>
                            <div className="muted small">{formatGBP(unit)} each</div>
                          </div>

                          <div className="cartQty">
                            <button className="qtyBtn" onClick={() => updateQty(idx, (line.qty || 1) - 1)}>-</button>
                            <div className="qtyNum">{line.qty || 1}</div>
                            <button className="qtyBtn" onClick={() => updateQty(idx, (line.qty || 1) + 1)}>+</button>
                          </div>

                          <div className="cartPrice">{formatGBP(unit * (line.qty || 1))}</div>

                          <button className="cartRemove" onClick={() => removeItem(idx)} aria-label="Remove item">
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="cartBottom">
                <div className="cartTotalRow">
                  <div className="muted">Subtotal</div>
                  <div style={{ fontWeight: 900 }}>{formatGBP(totals.subtotal)}</div>
                </div>

                <button className="btn btnPrimary cartCheckout" onClick={checkout} disabled={cart.length === 0}>
                  Checkout
                </button>

                <div className="muted small" style={{ marginTop: 10 }}>
                  After payment, you’ll receive a confirmation email. We’ll process your jersey order and ship it.
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </PageMotion>
  );
}

/* -------- Product card -------- */
function ProductCard({ product, onAdd }) {
  const sizes = product.sizes?.length ? product.sizes : ["M"];

  const [size, setSize] = useState(sizes[0]);
  const [qty, setQty] = useState(1);
  const [customName, setCustomName] = useState("");
  const [customNumber, setCustomNumber] = useState("");

  useEffect(() => {
    // reset if product sizes differ
    setSize(sizes[0]);
  }, [product.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function add() {
    onAdd({
      productId: product.id,
      size,
      qty,
      customName: customName.trim(),
      customNumber: customNumber.trim(),
    });
  }

  return (
    <article className="shopCard">
      <div className="shopCardMedia">
        <span className="shopCardBadge">Available now</span>
        <img src={product.img} alt={product.name} loading="lazy" />
      </div>

      <div className="shopCardBody">
        <div className="shopCardTopline">
          <div>
            <h3 className="shopCardTitle">{product.name}</h3>
            <div className="shopCardTag">{product.tag}</div>
          </div>
          <div className="shopCardPrice">{formatGBP(product.price)}</div>
        </div>

        <p className="shopCardDesc">{product.desc}</p>

        <div className="shopForm">
          <label className="shopLabel">
            Size
            <select
              className="input"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              disabled={sizes.length === 1}
            >
              {sizes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <label className="shopLabel">
            Qty
            <select className="input" value={qty} onChange={(e) => setQty(Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>

          <label className="shopLabel" style={{ gridColumn: "1 / -1" }}>
            Custom name (optional)
            <input
              className="input"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. MEWTZU"
              maxLength={16}
            />
          </label>
        </div>

        <div className="shopCardActions">
          <button className="btn btnPrimary" type="button" onClick={add}>
            Add to cart
          </button>
          <a className="btn btnGhost" href="/creators">
            See it on creators
          </a>
        </div>
      </div>
    </article>
  );
}
