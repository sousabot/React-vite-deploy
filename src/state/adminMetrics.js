import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "./firebase.js";

function lastNDays(n) {
  const days = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    const x = new Date(d);
    x.setDate(d.getDate() - i);
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, "0");
    const day = String(x.getDate()).padStart(2, "0");
    days.push(`${y}-${m}-${day}`);
  }
  return days;
}

/**
 * Realtime sum of counters across last N days (N <= 10 recommended)
 * Calls onUpdate(sumObj) whenever Firestore changes.
 */
export function subscribeMetricsSum(days = 7, onUpdate) {
  const ids = lastNDays(Math.min(days, 10)); // keep <= 10 for "in"

  const q = query(
    collection(db, "metrics_daily"),
    where("day", "in", ids)
  );

  const unsub = onSnapshot(q, (snap) => {
    const sum = {};
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      for (const [k, v] of Object.entries(data)) {
        if (typeof v === "number") sum[k] = (sum[k] || 0) + v;
      }
    });
    onUpdate?.(sum);
  });

  return unsub;
}
