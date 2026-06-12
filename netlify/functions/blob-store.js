import { connectLambda, getStore } from "@netlify/blobs";

const BLOB_STORE_NAME = "gd-esports";

/**
 * Opens the Netlify Blobs store in Lambda (v1) and modern function runtimes.
 * Falls back to explicit siteID + token from env when auto-config is missing.
 */
export function openBlobStore(event, name = BLOB_STORE_NAME) {
  if (event?.blobs) {
    connectLambda(event);
    return getStore(name);
  }

  const siteID =
    process.env.NETLIFY_SITE_ID ||
    process.env.SITE_ID ||
    event?.headers?.["x-nf-site-id"] ||
    event?.headers?.["X-Nf-Site-Id"];

  const token =
    process.env.NETLIFY_BLOBS_TOKEN ||
    process.env.NETLIFY_AUTH_TOKEN ||
    process.env.NETLIFY_TOKEN;

  if (siteID && token) {
    return getStore(name, { siteID, token });
  }

  return getStore(name);
}
