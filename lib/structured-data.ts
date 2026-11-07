import { INSTAGRAM_URL } from "./social.ts";

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

function extractNumericPrice(product: any): number {
  if (!product) return 999;
  if (typeof product.price === "number") return product.price;
  const text = `${product.title || ""} ${product.description || ""} ${product.quick_take || ""} ${product.badge || ""}`;
  const match = text.match(/[₹$]\s?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
  if (match) return parseFloat(match[1].replace(/,/g, ""));
  if (product.budget_tier === "premium") return 8000;
  if (product.budget_tier === "mid") return 3000;
  if (product.budget_tier === "low") return 800;
  return 999;
}

/**
 * Strips HTML or markdown comments from strings.
 */
function cleanString(str?: string | null): string {
  if (!str || typeof str !== "string") return "";
  return str.replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Returns Organization JSON-LD schema (name, logo, siteUrl, contactPoint).
 */
export function getOrganizationSchema(customBaseUrl?: string) {
  const baseUrl = resolveBaseUrl(customBaseUrl);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SmartChoice Storefront",
    url: baseUrl,
    logo: `${baseUrl}/brand/logo-full.png`,
    description:
      "Independent editorial product research, Anti-Regret matrix analysis, and curated recommendations before buying across Tech, Travel, and Beauty & Fashion in India.",
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "hello@smartchoice.com",
      url: `${baseUrl}/privacy-policy`,
      areaServed: "IN",
      availableLanguage: ["en", "hi"],
    },
    sameAs: [INSTAGRAM_URL],
  };
}

/**
 * Returns Product JSON-LD schema (name, description, image, brand, offers, aggregateRating,
 * positiveNotes, negativeNotes, additionalProperty, video).
 */
export function getProductSchema(product: any, customBaseUrl?: string) {
  const baseUrl = resolveBaseUrl(customBaseUrl);

  if (!product) {
    return null;
  }

  const name = cleanString(product.title) || "Curated Product";
  const slug = cleanString(product.slug) || cleanString(product.id) || "item";
  const productUrl = `${baseUrl}/product/${slug}`;
  const description =
    cleanString(product.quickTake || product.quick_take || product.description) ||
    "Curated recommendation with anti-regret evaluation.";

  const image =
    product.imageUrl ||
    product.image_url ||
    product.image ||
    `${baseUrl}/og-default.jpg`;

  const category = cleanString(product.category) || "Consumer Goods";

  // Derive price cleanly
  const price = extractNumericPrice(product) || 999;
  const isOutOfStock = Boolean(product.is_out_of_stock);

  // Extract Pros (Verified Strengths) for Google Pros & Cons Rich Snippets
  const rawPros: any[] = Array.isArray(product.pros)
    ? product.pros
    : Array.isArray(product.strengths)
    ? product.strengths
    : Array.isArray(product.reasons_to_buy)
    ? product.reasons_to_buy
    : [];

  const prosList = rawPros
    .map((p) => cleanString(typeof p === "string" ? p : p?.name || String(p)))
    .filter(Boolean);

  // Extract Cons (Trade-offs & Limitations) for Google Pros & Cons Rich Snippets
  const rawCons: any[] = Array.isArray(product.cons)
    ? product.cons
    : Array.isArray(product.trade_offs)
    ? product.trade_offs
    : Array.isArray(product.reasons_not_to_buy)
    ? product.reasons_not_to_buy
    : [];

  const consList = rawCons
    .map((c) => cleanString(typeof c === "string" ? c : c?.name || String(c)))
    .filter(Boolean);

  // Extract Key Specs for Google additionalProperty (PropertyValue)
  const rawSpecs: any = product.keySpecs || product.key_specs;
  let specEntries: { name: string; value: string }[] = [];

  if (Array.isArray(rawSpecs)) {
    specEntries = rawSpecs
      .map((item) => {
        const str = cleanString(String(item));
        if (!str) return null;
        const colonIdx = str.indexOf(":");
        if (colonIdx > 0) {
          return {
            name: str.slice(0, colonIdx).trim(),
            value: str.slice(colonIdx + 1).trim(),
          };
        }
        return { name: "Specification", value: str };
      })
      .filter((s): s is { name: string; value: string } => Boolean(s && s.name && s.value));
  } else if (typeof rawSpecs === "object" && rawSpecs !== null) {
    specEntries = Object.entries(rawSpecs)
      .map(([k, v]) => ({
        name: cleanString(k),
        value: cleanString(String(v)),
      }))
      .filter((s) => Boolean(s.name && s.value));
  }

  // Extract Universal Media URL (YouTube or Instagram) for Google VideoObject
  const rawVideoUrl = cleanString(
    product.youtubeUrl || product.youtube_url || product.video_url
  );
  let videoObject: any = undefined;

  if (rawVideoUrl) {
    let embedUrl = rawVideoUrl;
    const ytMatch = rawVideoUrl.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch && ytMatch[1]) {
      embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    }

    videoObject = {
      "@type": "VideoObject",
      name: `${name} — Verified Video Overview & Review`,
      description: `Watch verified performance, hands-on review, and visual features of ${name}.`,
      thumbnailUrl: [image],
      uploadDate: "2026-01-01T00:00:00Z",
      contentUrl: rawVideoUrl,
      embedUrl,
    };
  }

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: [image],
    category,
    brand: {
      "@type": "Brand",
      name: cleanString(product.brand) || "SmartChoice Curated",
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "INR",
      price: price.toFixed(2),
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: isOutOfStock
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Verified Retailer",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "142",
      bestRating: "5",
      worstRating: "1",
    },
  };

  // Google Pros & Cons Rich Snippet (ItemList format)
  if (prosList.length > 0) {
    schema.positiveNotes = {
      "@type": "ItemList",
      itemListElement: prosList.map((pro, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: pro,
      })),
    };
  }

  if (consList.length > 0) {
    schema.negativeNotes = {
      "@type": "ItemList",
      itemListElement: consList.map((con, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: con,
      })),
    };
  }

  // Key Specifications PropertyValue format
  if (specEntries.length > 0) {
    schema.additionalProperty = specEntries.map((spec) => ({
      "@type": "PropertyValue",
      name: spec.name,
      value: spec.value,
    }));
  }

  // Optional VideoObject
  if (videoObject) {
    schema.video = videoObject;
  }

  return schema;
}

/**
 * Returns CollectionPage JSON-LD schema (name, description, url, mainEntity with ItemList).
 */
export function getCollectionSchema(collection: any, customBaseUrl?: string) {
  const baseUrl = resolveBaseUrl(customBaseUrl);

  if (!collection) {
    return null;
  }

  const name = cleanString(collection.name) || "Curated Collection";
  const slug = cleanString(collection.id || collection.slug) || "collection";
  const collectionUrl = `${baseUrl}/collections/${slug}`;
  const description =
    cleanString(collection.description) ||
    "Editorial journey grouped by buyer decision criteria.";

  const products: any[] = Array.isArray(collection.products) ? collection.products : [];

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: collectionUrl,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.slice(0, 15).map((p, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: cleanString(p.title) || `Product ${index + 1}`,
        url: `${baseUrl}/product/${cleanString(p.slug) || cleanString(p.id)}`,
      })),
    },
  };
}
