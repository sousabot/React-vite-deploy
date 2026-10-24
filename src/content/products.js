/**
 * Product ids and prices must match PRODUCTS in
 * netlify/functions/create-checkout.js — the server charges its own price.
 */
export const PRODUCTS = [
  {
    id: "home",
    name: "Home Jersey",
    edition: "Orange Edition",
    category: "jersey",
    image: "/jersey-reveal.png",
    price: 70,
    description: "The official GD Esports home kit. Premium athletic fit, built for match day.",
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    badge: "Best seller",
    featured: true,
  },
  {
    id: "away",
    name: "Away Jersey",
    edition: "Black Edition",
    category: "jersey",
    image: "/jersey-away.png",
    price: 30,
    description: "The official GD Esports away kit. Premium athletic fit.",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    featured: true,
  },
  {
    id: "jersey",
    name: "Classic Jersey",
    edition: "Black & Orange Edition",
    category: "jersey",
    image: "/jersey.png",
    price: 30,
    description: "The original GD Esports jersey. Premium athletic fit.",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    featured: false,
  },
];

export const PRODUCT_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "jersey", label: "Jerseys" },
];

export function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}
