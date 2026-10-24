import { useCallback, useMemo, useState } from "react";
import { getProduct } from "../../content/products.js";

const STORAGE_KEY = "gd_cart_v1";
const MAX_QTY = 10;

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage can be unavailable (private mode); the cart still works in memory.
  }
}

function lineKey({ productId, size, customName, customNumber }) {
  return [productId, size || "", (customName || "").trim().toLowerCase(), (customNumber || "").trim()].join("|");
}

export function useCart({ clearOnLoad = false } = {}) {
  const [lines, setLines] = useState(() => {
    if (clearOnLoad) {
      persist([]);
      return [];
    }
    return load();
  });

  const update = useCallback((fn) => {
    setLines((prev) => {
      const next = fn(prev);
      persist(next);
      return next;
    });
  }, []);

  const add = useCallback(
    (item) => {
      if (!item.size) return;
      update((prev) => {
        const key = lineKey(item);
        const idx = prev.findIndex((l) => lineKey(l) === key);
        if (idx < 0) return [...prev, { ...item, qty: Math.min(MAX_QTY, item.qty || 1) }];
        return prev.map((l, i) =>
          i === idx ? { ...l, qty: Math.min(MAX_QTY, (l.qty || 1) + (item.qty || 1)) } : l
        );
      });
    },
    [update]
  );

  const setQty = useCallback(
    (index, qty) => {
      update((prev) =>
        qty < 1
          ? prev.filter((_, i) => i !== index)
          : prev.map((l, i) => (i === index ? { ...l, qty: Math.min(MAX_QTY, qty) } : l))
      );
    },
    [update]
  );

  const clear = useCallback(() => update(() => []), [update]);

  const { count, subtotal } = useMemo(
    () =>
      lines.reduce(
        (acc, l) => ({
          count: acc.count + (l.qty || 1),
          subtotal: acc.subtotal + Number(getProduct(l.productId)?.price || 0) * (l.qty || 1),
        }),
        { count: 0, subtotal: 0 }
      ),
    [lines]
  );

  return { lines, count, subtotal, add, setQty, clear };
}
