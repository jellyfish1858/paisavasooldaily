import type { Metadata } from "next";
import { fetchProductsAction } from "@/app/secure-admin-panel/actions";
import { getSiteUrl } from "@/config/site";
import { generateHomeMeta } from "@/lib/seo";
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
    name: "SmartChoice Storefront",
    url: baseUrl,
    description:
      "Independent editorial product research, Anti-Regret matrix analysis, and decision support before purchasing.",
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SmartChoice Storefront",
    url: baseUrl,
    logo: `${baseUrl}/brand/logo-full.png`,
    description:
      "Independent editorial product research, Anti-Regret matrix analysis, and decision support before purchasing across Tech, Travel, and Beauty.",
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.slice(0, 10).map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.title,
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