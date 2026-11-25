import type { Metadata } from "next";
import { fetchProductsAction } from "@/app/secure-admin-panel/actions";
import { getSiteUrl } from "@/config/site";
import { generateHomeMeta, INSTAGRAM_URL } from "@/lib/seo";
import { getOrganizationSchema } from "@/lib/structured-data";
import StorefrontClient from "./StorefrontClient";
import type { DbProduct } from "@/utils/supabase/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = generateHomeMeta().metadata;

export default async function StorefrontHome() {
  let products: DbProduct[] = [];
  try {
    const res = await fetchProductsAction();
    if (res && res.success && Array.isArray(res.data)) {
      products = res.data as DbProduct[];
    }
  } catch (err) {
    console.error("Error loading products for homepage SSR:", err);
  }

  const baseUrl = getSiteUrl();

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Paisavasooldaily",
    url: baseUrl,
    inLanguage: "en-IN",
    description:
      "Independent editorial product research, Anti-Regret matrix analysis of customer reviews and product specifications, and curated product recommendations across Beauty & Fashion and Tech & Accessories in India.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Paisavasooldaily",
    url: baseUrl,
    logo: `${baseUrl}/brand/logo-full.png`,
    description:
      "Independent editorial product research, Anti-Regret matrix analysis of customer reviews and product specifications, and decision support before purchasing across Tech & Accessories, Travel, and Beauty & Fashion in India.",
    inLanguage: "en-IN",
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    knowsAbout: [
      "Beauty & Skincare Staples",
      "Daily Grooming for Men & Women",
      "Direct Marketplace Seller Links",
      "Electronics & Tech Accessories",
      "Anti-Regret Consumer Research",
    ],
    sameAs: [INSTAGRAM_URL],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.slice(0, 10).map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: (product.title || "Curated Product").replace(/^PRODUCT TITLE:\s*/i, "").trim(),
      url: `${baseUrl}/product/${product.slug || product.id}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <StorefrontClient initialProducts={products} />
    </>
  );
}