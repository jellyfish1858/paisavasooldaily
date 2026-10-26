"use client";

import React from "react";
import { recordClickAction } from "@/app/actions";
import { buildAffiliateUrl, isValidAffiliateUrl, extractRetailerName, extractRetailerDomain, AFFILIATE_CONFIG } from "@/config/affiliate";

export type RetailerCtaVariant =
  | "hero"
  | "banner-large"
  | "subdued-link"
  | "table-button"
  | "arena-button";

export interface RetailerCTAProps {
  url?: string | null;
  productId?: string;
  productTitle?: string;
  isOutOfStock?: boolean;
  variant?: RetailerCtaVariant;
  label?: string;
  className?: string;
}

/**
 * Platform-neutral Outbound Retailer Affiliate CTA Component
 *
 * Requirements:
 * - Always enforces target="_blank" and rel="nofollow sponsored noopener noreferrer".
 * - Supports any valid HTTP/HTTPS retailer URL and safely appends/updates affiliate tags.
 * - Handles missing/malformed URLs and out-of-stock states gracefully.
 * - Prioritizes factual wording ("View Listing", "Check Price") over urgency.
 * - Preserves the storefront's editorial brutalist design system across all variants.
 */
export default function RetailerCTA({
  url,
  productId,
  productTitle = "Product",
  isOutOfStock = false,
  variant = "hero",
  label,
  className = "",
}: RetailerCTAProps) {
  const finalUrl = buildAffiliateUrl(url);
  const hasValidLink = isValidAffiliateUrl(url) && finalUrl !== "#";
  const retailerName = extractRetailerName(url);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (productId) {
      const domain = extractRetailerDomain(url);
      recordClickAction(productId, domain).catch(() => {});
    }
  };

  // 1. OUT OF STOCK STATE
  if (isOutOfStock) {
    if (variant === "subdued-link") {
      return (
        <span className={`text-red-700 font-bold uppercase ${className}`}>
          Out of Stock
        </span>
      );
    }
    if (variant === "table-button") {
      return (
        <span
          className={`block text-center font-mono text-[10px] text-red-700 font-bold uppercase py-1 ${className}`}
        >
          Out of Stock
        </span>
      );
    }
    if (variant === "arena-button") {
      return (
        <span
          className={`block border-2 border-line bg-panel p-2.5 text-center font-mono text-xs font-bold uppercase text-red-600 ${className}`}
        >
          Currently Unavailable
        </span>
      );
    }
    if (variant === "banner-large") {
      return (
        <div
          className={`w-full border-2 border-line bg-panel p-8 text-center font-mono text-base sm:text-lg font-bold uppercase tracking-widest2 text-muted shadow-hard ${className}`}
        >
          Item Currently Reported Out of Stock
        </div>
      );
    }
    return (
      <div
        className={`border-2 border-line bg-paper px-6 py-3 font-mono text-xs uppercase tracking-widest font-bold text-muted ${className}`}
      >
        Currently Out of Stock
      </div>
    );
  }

  // 2. MISSING OR INVALID URL STATE
  if (!hasValidLink) {
    if (variant === "subdued-link") {
      return null;
    }
    if (variant === "table-button" || variant === "arena-button") {
      return (
        <span
          className={`font-mono text-[10px] uppercase tracking-wider text-muted ${className}`}
        >
          Listing Unavailable
        </span>
      );
    }
    if (variant === "banner-large") {
      return (
        <div
          className={`w-full border-2 border-line bg-panel p-6 text-center font-mono text-sm uppercase tracking-widest text-muted ${className}`}
        >
          Direct retailer link currently unavailable
        </div>
      );
    }
    return (
      <span
        className={`font-mono text-xs uppercase tracking-wider text-muted ${className}`}
      >
        Retailer link currently unavailable
      </span>
    );
  }

  // 3. VALID ACTIVE AFFILIATE LINK
  const linkAttributes = AFFILIATE_CONFIG.linkAttributes;

  if (variant === "subdued-link") {
    return (
      <a
        href={finalUrl}
        target={linkAttributes.target}
        rel={linkAttributes.rel}
        onClick={handleClick}
        className={`text-muted hover:text-ink underline transition-colors ${className}`}
        aria-label={`View ${productTitle} listing (opens in new tab)`}
      >
        {label || `${retailerName} listing ↗`}
      </a>
    );
  }

  if (variant === "table-button") {
    return (
      <a
        href={finalUrl}
        target={linkAttributes.target}
        rel={linkAttributes.rel}
        onClick={handleClick}
        className={`w-full inline-flex items-center justify-center gap-1.5 border border-line bg-paper px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted hover:text-ink hover:border-ink transition-colors ${className}`}
        aria-label={`View ${productTitle} listing (opens in new tab)`}
      >
        {label || `See on ${retailerName} ↗`}
      </a>
    );
  }

  if (variant === "arena-button") {
    return (
      <a
        href={finalUrl}
        target={linkAttributes.target}
        rel={linkAttributes.rel}
        onClick={handleClick}
        aria-label={`View ${productTitle} (opens in new tab)`}
        className={`flex w-full items-center justify-center gap-2 border-2 border-line bg-accent px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-widest2 text-ink shadow-hard-sm transition-all hover:bg-ink hover:text-paper ${className}`}
      >
        {label || `View on ${retailerName} ↗`}
      </a>
    );
  }

  if (variant === "banner-large") {
    const rawLabel = label || `VIEW ON ${retailerName.toUpperCase()} →`;
    const hasArrow = rawLabel.includes("→") || rawLabel.includes("↗");
    return (
      <a
        href={finalUrl}
        target={linkAttributes.target}
        rel={linkAttributes.rel}
        onClick={handleClick}
        aria-label={`View ${productTitle} listing (opens in new tab)`}
        className={`group flex w-full items-center justify-center gap-3 border-2 border-line bg-accent px-8 py-6 font-mono text-lg sm:text-xl font-bold uppercase tracking-widest2 text-ink shadow-hard transition-all duration-150 hover:-translate-y-1 hover:bg-ink hover:text-paper hover:shadow-hard-lg ${className}`}
      >
        <span>{rawLabel}</span>
        {!hasArrow && (
          <span
            aria-hidden="true"
            className="transition-transform duration-150 group-hover:translate-x-1"
          >
            →
          </span>
        )}
      </a>
    );
  }

  // Default "hero" variant
  return (
    <a
      href={finalUrl}
      target={linkAttributes.target}
      rel={linkAttributes.rel}
      onClick={handleClick}
      aria-label={`View ${productTitle} (opens in new tab)`}
      className={`inline-flex items-center gap-2 border-2 border-line bg-accent px-6 py-3.5 font-mono text-xs sm:text-sm uppercase tracking-widest2 font-bold text-ink shadow-hard-sm hover:bg-ink hover:text-paper transition-all ${className}`}
    >
      {label || `VIEW ON ${retailerName.toUpperCase()} →`}
    </a>
  );
}
