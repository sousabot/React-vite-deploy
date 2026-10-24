import { useEffect, useState } from "react";

function compute(target) {
  if (!target) return null;
  const ms = new Date(target).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    mins: Math.floor((total % 3600) / 60),
    secs: total % 60,
    expired: ms <= 0,
  };
}

/** Ticks every second. Accepts an ISO string, Date, or epoch ms. */
export function useCountdown(target) {
  const [state, setState] = useState(() => ({ target, left: compute(target) }));
  if (state.target !== target) setState({ target, left: compute(target) });

  useEffect(() => {
    if (!target) return;
    const t = setInterval(() => setState({ target, left: compute(target) }), 1000);
    return () => clearInterval(t);
  }, [target]);

  return state.target === target ? state.left : compute(target);
}
