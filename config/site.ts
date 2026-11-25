/**
 * Site Configuration & Canonical URL Resolution
 *
 * Centralizes the canonical site URL to ensure deployment independence
 * (Cloudflare Pages, custom domain, or localhost during development).
 */

export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, "");
  }

  // In explicit development mode, use localhost
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  // Canonical production URL for Paisavasooldaily
  return "https://smartchoice-storefront.smartchoice.workers.dev";
}

export const SITE_CONFIG = {
  name: "Paisavasooldaily",
  shortName: "Paisavasooldaily",
  description:
    "Independent editorial product research, Anti-Regret matrix analysis, and decision support before purchasing.",
  defaultOgImage: "/og-default.jpg",
} as const;

/**
 * Public Contact Email configuration
 * Read from NEXT_PUBLIC_CONTACT_EMAIL env var.
 * When empty or unset, visible contact line is hidden and omitted from structured data.
 */
export const CONTACT_EMAIL = (process.env.NEXT_PUBLIC_CONTACT_EMAIL || "").trim();
