import { collection, getDocs, query, where } from "firebase/firestore";
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

export async function getMetricsSum(days = 30) {
  const ids = lastNDays(days);
  const q = query(collection(db, "metrics_daily"), where("day", "in", ids.slice(0, 10)));
  // Firestore "in" supports max 10 values — call multiple chunks if you want >10.
  // For now: 7 or 10 days works best.

  const snap = await getDocs(q);

  const sum = {};
  snap.forEach((doc) => {
    const data = doc.data();
    for (const [k, v] of Object.entries(data)) {
      if (typeof v === "number") sum[k] = (sum[k] || 0) + v;
    }
  });

  return sum;
}
