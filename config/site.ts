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

  // Canonical production URL for SmartChoice Storefront
  return "https://smartchoice-storefront.smartchoice.workers.dev";
}

export const SITE_CONFIG = {
  name: "SmartChoice Storefront",
  shortName: "SmartChoice",
  description:
    "Independent editorial product research, Anti-Regret matrix analysis, and decision support before purchasing.",
  defaultOgImage: "/og-default.jpg",
} as const;
