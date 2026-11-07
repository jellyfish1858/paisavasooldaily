import type { Metadata } from "next";
import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from "./social.ts";

export { INSTAGRAM_URL, INSTAGRAM_HANDLE };

function resolveBaseUrl(customUrl?: string): string {
  if (customUrl && typeof customUrl === "string" && customUrl.trim()) {
    return customUrl.trim().replace(/\/+$/, "");
  }
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, "");
  }
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }
  return "https://smartchoice-storefront.smartchoice.workers.dev";
}

export interface SeoMetaResult {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  ogType: "website" | "article";
  twitter: {
    card: "summary_large_image";
    title: string;
    description: string;
    images: string[];
  };
  metadata: Metadata;
}

/**
 * Strips HTML or markdown comments and cleans text.
 */
function cleanText(text?: string | null): string {
  if (!text || typeof text !== "string") return "";
  return text.replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Truncates text to max length without breaking words mid-way.
 */
function truncateText(text: string, maxLength = 160): string {
  const cleaned = cleanText(text);
  if (cleaned.length <= maxLength) return cleaned;
  const truncated = cleaned.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + "...";
}

/**
 * Generates SEO meta tags and Next.js Metadata object for the homepage.
 */
export function generateHomeMeta(customBaseUrl?: string): SeoMetaResult {
  const baseUrl = resolveBaseUrl(customBaseUrl);
  const title = "SmartChoice Storefront — Curated Product Picks & Anti-Regret Research";
  const description =
    "Independent editorial product research, Anti-Regret matrix analysis, and curated recommendations before buying across Verified Beauty, Skincare & Grooming for Men and Women, and Tech Accessories in India.";
  const canonical = baseUrl;
  const ogImage = `${baseUrl}/og-default.jpg`;
  const ogType: "website" = "website";

  const keywords = [
    "SmartChoice Storefront",
    "India product reviews",
    "Verified Beauty and Fashion picks",
    "Everyday lifestyle skincare and grooming for men and women",
    "100% original verified non-adulterated seller links",
    "Anti-Adulteration skincare guarantee",
    "Electronics and Tech Accessories India",
    "Anti-Regret buying guides India",
    "Best value products INR",
  ];

  const twitter = {
    card: "summary_large_image" as const,
    title,
    description,
    images: [ogImage],
  };

  const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "SmartChoice Storefront",
      locale: "en_IN",
      type: ogType,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "SmartChoice Storefront — Curated Product Picks & Editorial Research",
        },
      ],
    },
    twitter,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };

  return {
    title,
    description,
    canonical,
    ogImage,
    ogType,
    twitter,
    metadata,
  };
}

/**
 * Generates dynamic SEO meta tags and Next.js Metadata object for a product page.
 * Meta title: product name + category
 * Meta description: quick take + key specs
 * Canonical URL & Open Graph image
 */
export function generateProductMeta(
  product?: any,
  customBaseUrl?: string
): SeoMetaResult {
  const baseUrl = resolveBaseUrl(customBaseUrl);

  if (!product) {
    return generateHomeMeta(baseUrl);
  }

  const rawTitle = cleanText(product.title) || "Curated Product";
  const category = cleanText(product.category) || "Picks";
  const slug = cleanText(product.slug) || cleanText(product.id) || "item";
  const canonical = `${baseUrl}/product/${slug}`;

  // Product Name + Category title
  const title = `${rawTitle} | ${category} | SmartChoice`;

  // Quick take + key specs description
  const quickTake = cleanText(
    product.quickTake || product.quick_take || product.description
  );
  const specsList: string[] = Array.isArray(product.keySpecs || product.key_specs)
    ? (product.keySpecs || product.key_specs).map((s: any) => cleanText(String(s)))
    : [];

  let descBase = quickTake;
  if (specsList.length > 0) {
    const specsSnippet = specsList.slice(0, 3).join(", ");
    descBase = descBase ? `${descBase} Key Specs: ${specsSnippet}.` : `Key Specs: ${specsSnippet}.`;
  }
  if (!descBase) {
    descBase = `Unbiased editorial review, specifications, and anti-regret analysis for ${rawTitle}.`;
  }

  const description = truncateText(descBase, 160);

  const ogImage =
    product.imageUrl ||
    product.image_url ||
    product.image ||
    `${baseUrl}/og-default.jpg`;

  const ogType: "article" = "article";

  const twitter = {
    card: "summary_large_image" as const,
    title,
    description,
    images: [ogImage],
  };

  const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "SmartChoice Storefront",
      locale: "en_IN",
      type: ogType,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${rawTitle} — SmartChoice Curated Pick`,
        },
      ],
    },
    twitter,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };

  return {
    title,
    description,
    canonical,
    ogImage,
    ogType,
    twitter,
    metadata,
  };
}

/**
 * Generates dynamic SEO meta tags and Next.js Metadata object for a collection page.
 * Meta title: collection name
 * Meta description: collection description + product count
 * Canonical URL
 */
export function generateCollectionMeta(
  collection?: any,
  customBaseUrl?: string
): SeoMetaResult {
  const baseUrl = resolveBaseUrl(customBaseUrl);

  if (!collection) {
    return generateHomeMeta(baseUrl);
  }

  const rawName = cleanText(collection.name) || "Curated Collection";
  const slug = cleanText(collection.id || collection.slug) || "collection";
  const canonical = `${baseUrl}/collections/${slug}`;
  const count = Number(collection.count || collection.products?.length || 0);

  // Dynamic meta title: collection name
  const title = `${rawName} Collection — Curated Top Picks | SmartChoice`;

  // Dynamic meta description: collection description + product count
  let rawDesc = cleanText(collection.description);
  if (slug === "best-value") {
    rawDesc = "Top-rated products ranked by real customer choices.";
  }
  const countSnippet = count > 0 ? ` Explore ${count} curated product recommendations.` : "";
  const fullDesc = rawDesc
    ? `${rawDesc}${countSnippet} Verified by independent editorial research.`
    : `Explore ${count} handpicked items in the ${rawName} collection. Zero regrets guaranteed.`;

  const description = truncateText(fullDesc, 160);

  const ogImage = `${baseUrl}/og-default.jpg`;
  const ogType: "website" = "website";

  const twitter = {
    card: "summary_large_image" as const,
    title,
    description,
    images: [ogImage],
  };

  const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "SmartChoice Storefront",
      locale: "en_IN",
      type: ogType,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${rawName} — SmartChoice Curated Collection`,
        },
      ],
    },
    twitter,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };

  return {
    title,
    description,
    canonical,
    ogImage,
    ogType,
    twitter,
    metadata,
  };
}
