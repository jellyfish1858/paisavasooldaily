/**
 * Keyword-to-Affiliate Links mapping for multi-store search redirection (/go).
 *
 * Stores:
 * - amazon: Default store. Redirects to Amazon India search with affiliate tag.
 * - flipkart / meesho: Looked up in KEYWORD_LINKS. If not found or empty, falls back to Amazon.
 */

export type SupportedStore = "amazon" | "flipkart" | "meesho";

export interface KeywordLinkEntry {
  flipkart?: string;
  meesho?: string;
}

/**
 * Plain object mapping normalized search keywords to retailer affiliate links.
 * Keys are matched lowercase with punctuation and extra whitespace stripped.
 *
 * NOTE: Left with commented placeholder examples only. Paste real affiliate links here:
 */
export const KEYWORD_LINKS: Record<string, KeywordLinkEntry> = {
  // Placeholder examples:
  // "sunscreen": {
  //   flipkart: "https://ekaro.in/...",
  //   meesho: "https://ekaro.in/...",
  // },
  // "running shoes": {
  //   flipkart: "https://ekaro.in/...",
  //   meesho: "https://ekaro.in/...",
  // },
};

/**
 * Normalizes a keyword or query string:
 * - Lowercase
 * - Removes punctuation and special symbols
 * - Collapses consecutive spaces
 * - Trims leading and trailing whitespace
 */
export function normalizeKeyword(text?: string | null): string {
  if (!text || typeof text !== "string") return "";
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Looks up a query in a keyword links map for the requested store.
 * 1. Checks for an exact normalized match.
 * 2. Checks if any normalized keyword key is contained within the normalized query.
 * Returns the matching URL string or null if not found.
 */
export function findKeywordLink(
  query: string,
  store: "flipkart" | "meesho",
  linksMap: Record<string, KeywordLinkEntry> = KEYWORD_LINKS
): string | null {
  const normQ = normalizeKeyword(query);
  if (!normQ) return null;

  const entries = Object.entries(linksMap);
  if (entries.length === 0) return null;

  // 1. Try exact match first
  for (const [key, val] of entries) {
    const normKey = normalizeKeyword(key);
    if (normKey && normKey === normQ && val && typeof val[store] === "string" && val[store]!.trim()) {
      return val[store]!.trim();
    }
  }

  // 2. Try any key contained in the query (longer/more specific keys first)
  const sortedEntries = [...entries].sort((a, b) => b[0].length - a[0].length);
  for (const [key, val] of sortedEntries) {
    const normKey = normalizeKeyword(key);
    if (normKey && normQ.includes(normKey) && val && typeof val[store] === "string" && val[store]!.trim()) {
      return val[store]!.trim();
    }
  }

  return null;
}

/**
 * Builds the Amazon India search URL with affiliate associate tag.
 * Correctly URL-encodes special characters such as quotes, ampersands, and spaces.
 */
export function buildAmazonSearchUrl(query: string, tag: string = "jellyfish180c-21"): string {
  const trimmed = query.trim().slice(0, 100);
  return `https://www.amazon.in/s?k=${encodeURIComponent(trimmed)}&tag=${encodeURIComponent(tag)}`;
}

/**
 * Extracts the full search query 'q' from searchParams, handling cases where
 * query values containing ampersands might be split across parameters.
 */
export function extractSearchQuery(searchParams: URLSearchParams): string {
  const entries = Array.from(searchParams.entries());
  const qParts: string[] = [];
  let foundQ = false;

  for (const [key, value] of entries) {
    if (key === "store") {
      continue;
    }
    if (key === "q") {
      foundQ = true;
      if (value) qParts.push(value);
    } else if (foundQ) {
      const part = value ? `${key}=${value}` : key;
      qParts.push(part);
    }
  }

  return qParts.join("&").trim().slice(0, 100);
}
