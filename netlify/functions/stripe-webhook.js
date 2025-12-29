import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event) => {
  const sig = event.headers["stripe-signature"];

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object;

    // Pull the cart you stored in metadata
    const cart = safeJson(session?.metadata?.cart) || [];

    const email = session?.customer_details?.email || "";
    const name = session?.customer_details?.name || "";

    const addr = session?.shipping_details?.address || {};
    const addressLine = [
      addr.line1,
      addr.line2,
      addr.city,
      addr.state,
      addr.postal_code,
      addr.country,
    ]
      .filter(Boolean)
      .join(", ");

    const total = (session?.amount_total || 0) / 100;
    const currency = (session?.currency || "").toUpperCase();

    // Send to Discord (super reliable + instant)
    if (process.env.DISCORD_WEBHOOK_URL) {
      const msg =
        `🛒 **NEW ORDER**\n` +
        `**Name:** ${name}\n` +
        `**Email:** ${email}\n` +
        `**Ship to:** ${addressLine}\n` +
        `**Total:** ${total} ${currency}\n` +
        `**Cart:** ${JSON.stringify(cart)}\n` +
        `**Session:** ${session.id}`;

      await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: msg }),
      });
    }
  }

  return { statusCode: 200, body: "ok" };
};

function safeJson(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
