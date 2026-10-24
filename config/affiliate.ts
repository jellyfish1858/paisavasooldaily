/**
 * Centralized Generic Affiliate Configuration & URL Resolution
 *
 * Platform-neutral architecture:
 * - Accepts any valid HTTP/HTTPS retailer URL (Amazon, direct brands, third-party marketplaces).
 * - Outbound links enforce rel="nofollow sponsored noopener noreferrer" and target="_blank".
 * - Tag is environment-controlled (NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG / AMAZON_ASSOCIATE_TAG).
 * - We do NOT personally test products; editorial desk research only.
 */

export const AFFILIATE_CONFIG = {
  trackingTag:
    process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG ||
    process.env.AMAZON_ASSOCIATE_TAG ||
    (typeof globalThis !== "undefined" && (globalThis as any).NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG) ||
    "",

  generalDisclosure:
    "As an affiliate, we earn from qualifying purchases made through links on this website. Our research and recommendations remain 100% independent.",

  pricingDisclaimer:
    "Product prices and availability are subject to change. Verify final prices on the retailer's site.",

  // Supported Amazon retail domains and short links
  allowedHostnames: [
    "amazon.in",
    "www.amazon.in",
    "m.amazon.in",
    "amzn.in",
    "amazon.com",
    "www.amazon.com",
    "amzn.to",
    "a.co",
    "link.amazon",
    "amazon.co.uk",
    "www.amazon.co.uk",
    "amazon.ca",
    "www.amazon.ca",
    "amazon.de",
    "www.amazon.de",
  ],

  // Backward-compatible compliance disclosure copy
  disclosure: {
    generalStatement:
      "As an affiliate, I earn commissions from qualifying purchases made through links on this website.",
    amazonStatement:
      "As an Amazon Associate I earn from qualifying purchases.",
    statement:
      "As an affiliate, I earn commissions from qualifying purchases made through links on this website.",
    disclaimer:
      "Product prices and availability are subject to change on retailer platforms. Verify the current listing before purchasing.",
    amazonDisclaimer:
      "Prices and availability can change on Amazon. Check the current listing before purchasing.",
  },

  // Outbound link attributes
  linkAttributes: {
    target: "_blank",
    rel: "nofollow sponsored noopener noreferrer",
  } as const,
} as const;

/**
 * Retrieves the configured affiliate/associate tracking tag from environment.
 */
export function getAmazonAssociateTag(): string | null {
  const envTag =
    process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG ||
    process.env.AMAZON_ASSOCIATE_TAG ||
    (typeof globalThis !== "undefined" && (globalThis as any).NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG) ||
    (typeof globalThis !== "undefined" && (globalThis as any).AMAZON_ASSOCIATE_TAG);

  if (typeof envTag === "string" && envTag.trim()) {
    return envTag.trim();
  }
  return null;
}

/**
 * Validates whether a hostname belongs to an Amazon marketplace.
 */
export function isAmazonHostname(hostname?: string | null): boolean {
  if (!hostname || typeof hostname !== "string") return false;
  const cleanHost = hostname.trim().toLowerCase();

  const shortDomains = ["amzn.to", "amzn.in", "amzn.com", "a.co"];
  if (shortDomains.includes(cleanHost) || shortDomains.some((d) => cleanHost.endsWith("." + d))) {
    return true;
  }

  if (cleanHost === "amazon" || cleanHost.endsWith(".amazon")) {
    return true;
  }

  if (AFFILIATE_CONFIG.allowedHostnames.some((allowed) => cleanHost === allowed || cleanHost.endsWith("." + allowed))) {
    return true;
  }

  const amazonDomainPattern = /^(?:[a-z0-9-]+\.)*amazon\.[a-z]{2,}(?:\.[a-z]{2})?$/;
  return amazonDomainPattern.test(cleanHost);
}

/**
 * Accepts ANY valid HTTP/HTTPS URL
 */
export function isValidAffiliateUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  let parsedUrlString = trimmed;
  if (!parsedUrlString.startsWith("http://") && !parsedUrlString.startsWith("https://")) {
    parsedUrlString = "https://" + parsedUrlString;
  }

  try {
    const parsed = new URL(parsedUrlString);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validates that a string is a well-formed HTTP/HTTPS URL pointing to Amazon.
 */
export function isValidAmazonUrl(urlString?: string | null): boolean {
  if (!urlString || typeof urlString !== "string") return false;
  const trimmed = urlString.trim();
  let parsedUrlString = trimmed;
  if (!parsedUrlString.startsWith("http://") && !parsedUrlString.startsWith("https://")) {
    parsedUrlString = "https://" + parsedUrlString;
  }

  try {
    const parsed = new URL(parsedUrlString);
    return (parsed.protocol === "http:" || parsed.protocol === "https:") && isAmazonHostname(parsed.hostname);
  } catch {
    return false;
  }
}

/**
 * Cleans and attaches tag if applicable (Generic)
 */
export function buildAffiliateUrl(originalUrl?: string | null, overrideTag?: string): string {
  if (!originalUrl || typeof originalUrl !== "string") return "#";
  const trimmed = originalUrl.trim();
  if (!trimmed) return "#";

  try {
    let parsedUrlString = trimmed;
    if (!parsedUrlString.startsWith("http://") && !parsedUrlString.startsWith("https://")) {
      parsedUrlString = "https://" + parsedUrlString;
    }

    const urlObj = new URL(parsedUrlString);
    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
      return "#";
    }

    const tag = overrideTag || getAmazonAssociateTag() || AFFILIATE_CONFIG.trackingTag;
    // Attach tracking tag to Amazon URLs, or any URL if explicitly provided
    if (tag) {
      if (isAmazonHostname(urlObj.hostname)) {
        urlObj.searchParams.set("tag", tag);
      } else if (!urlObj.searchParams.has("tag")) {
        urlObj.searchParams.set("tag", tag);
      }
    }

    return urlObj.toString();
  } catch {
    return originalUrl;
  }
}

/**
 * Builds an Amazon affiliate URL (backward compatibility alias).
 */
export function buildAmazonAffiliateUrl(rawUrl?: string | null, overrideTag?: string): string | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  try {
    let parsedUrlString = trimmed;
    if (!parsedUrlString.startsWith("http://") && !parsedUrlString.startsWith("https://")) {
      parsedUrlString = "https://" + parsedUrlString;
    }

    const urlObj = new URL(parsedUrlString);
    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") return null;
    if (!isAmazonHostname(urlObj.hostname)) return null;

    const tag = overrideTag || getAmazonAssociateTag();
    if (!tag) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[SmartChoice Affiliate] NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG is not set.");
      }
      return null;
    }

    urlObj.searchParams.set("tag", tag);
    return urlObj.toString();
  } catch {
    return null;
  }
}

/**
 * Extracts a human-readable retailer name from any URL.
 */
export function extractRetailerName(url?: string | null): string {
  if (!url || typeof url !== "string") return "Retailer";
  try {
    let parsed = url.trim();
    if (!parsed.startsWith("http://") && !parsed.startsWith("https://")) {
      parsed = "https://" + parsed;
    }
    const hostname = new URL(parsed).hostname.toLowerCase();
    if (isAmazonHostname(hostname)) return "Amazon";
    if (hostname.includes("flipkart")) return "Flipkart";
    if (hostname.includes("walmart")) return "Walmart";
    if (hostname.includes("target")) return "Target";
    if (hostname.includes("bestbuy")) return "Best Buy";
    return hostname.replace(/^www\./, "");
  } catch {
    return "Retailer";
  }
}

/**
 * Extracts normalized retailer domain string for analytics and database tracking.
 * Aligns with database migration rules:
 * - '%amazon%' -> 'amazon.com'
 * - '%flipkart%' -> 'flipkart.com'
 * - '%snapdeal%' -> 'snapdeal.com'
 * - other valid url -> 'other'
 * - missing or invalid url -> 'unknown'
 */
export function extractRetailerDomain(url?: string | null): string {
  if (!url || typeof url !== "string") return "unknown";
  const clean = url.trim().toLowerCase();
  if (!clean) return "unknown";
  if (clean.includes("amazon")) return "amazon.com";
  if (clean.includes("flipkart")) return "flipkart.com";
  if (clean.includes("snapdeal")) return "snapdeal.com";
  return "other";
}

