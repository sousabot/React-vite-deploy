import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRODUCTS = {
  home: { name: "GD Esports Home Jersey (Orange Edition)", amount: 7000 }, // £1.00
  away: { name: "GD Esports Away Jersey (Black Edition)", amount: 3000 }, // £49.99
  Jersey: { name: "GD Esports Jersey (Black & Orange Edition)", amount: 3000 },
};

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const body = JSON.parse(event.body || "{}");
    const cart = Array.isArray(body.cart) ? body.cart : [];

    if (cart.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: "Cart is empty" }) };
    }

    const baseUrl =
      process.env.URL ||
      process.env.DEPLOY_PRIME_URL ||
      process.env.SITE_URL ||
      "http://localhost:8888";

    const line_items = cart.map((line) => {
      const p = PRODUCTS[line.productId];
      if (!p) throw new Error(`Invalid product: ${line.productId}`);

      const qty = Math.max(1, Math.min(10, Number(line.qty || 1)));
      const size = String(line.size || "").toUpperCase();
      const customName = String(line.customName || "").trim();
      const customNumber = String(line.customNumber || "").trim();

      // Put customisation into the name so it shows in Stripe
      const extras = [];
      if (size) extras.push(`Size ${size}`);
      if (customName) extras.push(`Name ${customName}`);
      if (customNumber) extras.push(`#${customNumber}`);
      const suffix = extras.length ? ` — ${extras.join(" • ")}` : "";

      return {
        price_data: {
          currency: "gbp",
          unit_amount: p.amount,
          product_data: {
            name: `${p.name}${suffix}`,
          },
        },
        quantity: qty,
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
  shipping_address_collection: {
  allowed_countries: [
    "GB","IE","US","CA","AU",
    "FR","DE","NL","ES","IT",
    "BE","CH","AT","SE","NO","DK","FI",
    "PT","PL","CZ","HU","GR","RO","BG",
    "LU","IS"
  ],
},
      success_url: `${baseUrl}/shop?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/shop?canceled=1`,
      metadata: {
        cart: JSON.stringify(cart.slice(0, 20)),
      },
    });

    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (e) {
    console.error("create-checkout error:", e);
    return { statusCode: 500, body: JSON.stringify({ error: e?.message || "Server error" }) };
  }
};
