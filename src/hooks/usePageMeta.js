import { useEffect } from "react";
import { metaFor } from "../config/seo.js";

function setTag(selector, create, attr, value) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

function meta(key, keyAttr = "name") {
  return () => {
    const el = document.createElement("meta");
    el.setAttribute(keyAttr, key);
    return el;
  };
}

/** Keeps the tab title, description, canonical URL and robots tag in sync with the route. */
export function usePageMeta(path) {
  useEffect(() => {
    const { title, description, index, url } = metaFor(path);
    document.title = title;
    setTag('meta[name="description"]', meta("description"), "content", description);
    setTag('meta[property="og:title"]', meta("og:title", "property"), "content", title);
    setTag('meta[property="og:description"]', meta("og:description", "property"), "content", description);
    setTag('meta[property="og:url"]', meta("og:url", "property"), "content", url);
    setTag('meta[name="robots"]', meta("robots"), "content", index ? "index, follow" : "noindex, nofollow");
    setTag(
      'link[rel="canonical"]',
      () => {
        const el = document.createElement("link");
        el.rel = "canonical";
        return el;
      },
      "href",
      url
    );
  }, [path]);
}
