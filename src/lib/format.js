export function formatViewers(count) {
  if (!count || count < 1) return null;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return count.toLocaleString();
}

export function formatGBP(n) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
    Number(n || 0)
  );
}

export function formatMatchDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const date = d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
  const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return `${date} · ${time}`;
}

export function pad2(n) {
  return String(n).padStart(2, "0");
}

export function initials(name = "") {
  return String(name).trim().slice(0, 2).toUpperCase() || "?";
}

/** Body format expected by the form-to-discord Netlify function. */
export function encodeForm(data) {
  return new URLSearchParams(data).toString();
}

export async function postToDiscord(payload) {
  const res = await fetch("/.netlify/functions/form-to-discord", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: encodeForm(payload),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Submission failed (${res.status}) ${msg}`.trim());
  }
}
