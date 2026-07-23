import { useEffect, useState } from "react";
import { CREATORS as DEFAULT_CREATORS } from "../data/creators.js";
import { STAFF_DEPARTMENTS as DEFAULT_STAFF } from "../data/staff.js";
import { PARTNER_GROUPS as DEFAULT_PARTNERS } from "../data/partners.js";

let cachedContent = null;
let cachePromise = null;

export function resolveSiteContent(stored) {
  return {
    creators:
      Array.isArray(stored?.creators) && stored.creators.length
        ? stored.creators
        : DEFAULT_CREATORS,
    staffDepartments:
      Array.isArray(stored?.staffDepartments) && stored.staffDepartments.length
        ? stored.staffDepartments
        : DEFAULT_STAFF,
    partnerGroups:
      Array.isArray(stored?.partnerGroups) && stored.partnerGroups.length
        ? stored.partnerGroups
        : DEFAULT_PARTNERS,
    updatedAt: stored?.updatedAt || null,
    source: stored?.updatedAt ? "remote" : "defaults",
  };
}

export function invalidateSiteContentCache() {
  cachedContent = null;
  cachePromise = null;
}

export async function fetchSiteContent({ force = false } = {}) {
  if (!force && cachedContent) return cachedContent;
  if (!force && cachePromise) return cachePromise;

  cachePromise = fetch(`/.netlify/functions/site-content?_=${Date.now()}`, {
    cache: "no-store",
  })
    .then(async (res) => {
      const stored = await res.json().catch(() => ({}));
      if (!res.ok || stored?.error) return resolveSiteContent(null);
      cachedContent = resolveSiteContent(stored);
      return cachedContent;
    })
    .catch(() => {
      cachedContent = resolveSiteContent(null);
      return cachedContent;
    })
    .finally(() => {
      cachePromise = null;
    });

  return cachePromise;
}

export async function saveSiteContent(payload, idToken) {
  const res = await fetch("/.netlify/functions/site-content", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Failed to save content");

  invalidateSiteContentCache();
  cachedContent = resolveSiteContent(data.content || payload);
  return cachedContent;
}

export function useSiteContent() {
  const [content, setContent] = useState(
    cachedContent || resolveSiteContent(null)
  );
  const [loading, setLoading] = useState(!cachedContent);

  useEffect(() => {
    let cancelled = false;
    fetchSiteContent().then((next) => {
      if (!cancelled) setContent(next);
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    creators: content.creators,
    staffDepartments: content.staffDepartments,
    partnerGroups: content.partnerGroups,
    updatedAt: content.updatedAt,
    source: content.source,
    loading,
    refresh: async () => {
      const next = await fetchSiteContent({ force: true });
      setContent(next);
      return next;
    },
  };
}
