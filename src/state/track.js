import { logEvent } from "firebase/analytics";
import { doc, increment, setDoc } from "firebase/firestore";
import { analytics, db } from "./firebase.js";

function yyyyMmDd(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Public helper
export async function track(eventName, params = {}) {
  // 1) Firebase Analytics event
  try {
    if (analytics) logEvent(analytics, eventName, params);
  } catch {}

  // 2) Firestore daily counter (for Admin dashboard)
  try {
    const dayId = yyyyMmDd();
    const ref = doc(db, "metrics_daily", dayId);

    await setDoc(
      ref,
      {
        day: dayId,
        [eventName]: increment(1),
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch {}
}
