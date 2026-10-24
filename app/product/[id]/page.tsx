import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { products } from "@/data/products";
import { getStoredProducts } from "@/utils/storage";
import {
  fetchProductByIdAction,
  fetchProductBySlugAction,
  fetchProductsAction,
} from "@/app/secure-admin-panel/actions";
import ReviewDetails from "@/components/ReviewDetails";
import { getSiteUrl } from "@/config/site";
import { getCategoryForProduct } from "@/data/categories";
import { extractRetailerDomain } from "@/config/affiliate";
import type { DbProduct } from "@/utils/supabase/types";

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamicParams = true;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateStaticParams() {
  const slugs = new Set<string>();
  products.forEach((p) => {
    if (p.slug) slugs.add(p.slug);
  });
  try {
    const stored = getStoredProducts();
    stored.forEach((p) => {
      if (p.slug) slugs.add(p.slug);
    });
  } catch {
    // fallback to static
  }
  try {
    const res = await fetchProductsAction();
    if (res.success && res.data) {
      res.data.forEach((p) => {
        if (p.slug) slugs.add(p.slug);
      });
    }
  } catch {
    // fallback to static
  }
  return Array.from(slugs).map((slug) => ({ id: slug }));
}

function stripProductMeta(text?: string | null): string {
  if (!text || typeof text !== "string") return "";
  return text.replace(/<!--\s*PRODUCT_META:\s*[\s\S]*?-->/gi, "").trim();
}

function toCleanStringArray(val: any): string[] {
  if (Array.isArray(val)) return val.map((s) => stripProductMeta(String(s)));
  if (typeof val === "string" && val.trim()) return [stripProductMeta(val.trim())];
  return [];
}

function getProductFromFallback(id: string): DbProduct | null {
  const p = products.find((prod) => prod.id === id);
  if (!p) return null;
  const strengthsList = (p.strengths || p.reasonsToBuy || []).map((s) => stripProductMeta(String(s)));
  const tradeOffsList = (p.trade_offs || p.reasonsNotToBuy || []).map((t) => stripProductMeta(String(t)));
  const cleanFinalTake = stripProductMeta(p.final_take || p.verdict || "");
  return {
    id: p.id,
    title: stripProductMeta(p.title),
    slug: p.slug,
    description: stripProductMeta(p.description),
    category: p.category,
    badge: p.badge ? stripProductMeta(p.badge) : "TOP PICK",
    image_url: p.image_url || p.imageUrl || "",
    video_url: p.video_url || "",
    retailer_url: p.retailer_url || p.amazon_url || p.amazonUrl || "https://www.amazon.in",
    retailer_domain: p.retailer_domain || extractRetailerDomain(p.retailer_url || p.amazon_url || p.amazonUrl || "https://www.amazon.in"),
    amazon_url: p.retailer_url || p.amazon_url || p.amazonUrl || "https://www.amazon.in",
    quick_take: stripProductMeta(p.quick_take || p.description || ""),
    key_specs: p.key_specs || [],
    strengths: strengthsList,
    trade_offs: tradeOffsList,
    good_for: toCleanStringArray(p.good_for),
    skip_if: toCleanStringArray(p.skip_if),
    what_to_check: toCleanStringArray(p.what_to_check),
    final_take: cleanFinalTake,
    verdict: cleanFinalTake,
    reasons_to_buy: strengthsList,
    reasons_not_to_buy: tradeOffsList,
    pros: strengthsList,
    cons: tradeOffsList,
    matrix_performance: p.matrix_performance || null,
    matrix_value: p.matrix_value || null,
    matrix_ease_of_use: p.matrix_ease_of_use || null,
    matrix_portability: p.matrix_portability || null,
    matrix_compatibility: p.matrix_compatibility || null,
    matrix_long_term_suitability: p.matrix_long_term_suitability || null,
    research_basis: stripProductMeta(p.research_basis || ""),
    research_sources: p.research_sources || [],
    last_reviewed_at: p.last_reviewed_at || null,
    is_out_of_stock: Boolean(p.is_out_of_stock),
    clicks_count: p.clicks_count || 0,
  };
}

async function getProductById(id: string): Promise<DbProduct | null> {
  try {
    const res = await fetchProductByIdAction(id);
    if (res.success && res.data) {
      return res.data;
    }
  } catch {
    // fallback
  }
  return getProductFromFallback(id);
}

async function getProductBySlug(slug: string): Promise<DbProduct | null> {
  try {
    const res = await fetchProductBySlugAction(slug);
    if (res.success && res.data) {
      return res.data;
    }
  } catch {
    // fallback
  }
  const p = products.find((prod) => prod.slug === slug);
  if (p) return getProductFromFallback(p.id);
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: slugOrId } = await params;
  const isUuid = UUID_REGEX.test(slugOrId);

  let product: DbProduct | null = null;
  if (isUuid) {
    product = await getProductById(slugOrId);
    if (!product) {
      return {
        title: "Product Not Found",
        description: "The requested product research page could not be found.",
        robots: {
          index: false,
          follow: false,
        },
        alternates: {
          canonical: null,
        },
      };
    }
    const baseUrl = getSiteUrl();
    const canonicalSlugUrl = `${baseUrl}/product/${product.slug || product.id}`;
    return {
      title: `${stripProductMeta(product.title)} — Research, Trade-offs & Buying Guide`,
      alternates: {
        canonical: canonicalSlugUrl,
      },
    };
  } else {
    product = await getProductBySlug(slugOrId);
  }

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product research page could not be found.",
      robots: {
        index: false,
        follow: false,
      },
      alternates: {
        canonical: null,
      },
    };
  }

  const cleanTitle = stripProductMeta(product.title);
  const title = `${cleanTitle} — Research, Trade-offs & Buying Guide`;
  const description =
    stripProductMeta(product.quick_take) ||
    stripProductMeta(product.description) ||
    `Editorial research, key strengths, trade-offs, and Anti-Regret matrix analysis for ${cleanTitle}.`;

  const baseUrl = getSiteUrl();
  const canonicalUrl = `${baseUrl}/product/${product.slug || product.id}`;
  const ogImage = product.image_url || `${baseUrl}/og-default.jpg`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: canonicalUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${cleanTitle} - Overview and Editorial Analysis`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slugOrId } = await params;
  const isUuid = UUID_REGEX.test(slugOrId);

  let product: DbProduct | null = null;
  if (isUuid) {
    product = await getProductById(slugOrId);
    if (!product) {
      notFound();
    }
    if (product.slug) {
      permanentRedirect(`/product/${product.slug}`);
    }
  } else {
    product = await getProductBySlug(slugOrId);
  }

  if (!product) {
    notFound();
  }

  const baseUrl = getSiteUrl();
  const canonicalUrl = `${baseUrl}/product/${product.slug || product.id}`;

  const cleanTitle = stripProductMeta(product.title);
  const cleanDescription = stripProductMeta(product.quick_take) || stripProductMeta(product.description) || "";

  // Extract brand name cleanly
  const brandName = cleanTitle.split(" ")[0] || "SmartChoice Storefront";

  // Google Search Console JSON-LD Product Schema (without fabricated reviews or ratings)
  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: cleanTitle,
    url: canonicalUrl,
    image: [product.image_url || `${baseUrl}/og-default.jpg`],
    description: cleanDescription,
    category: product.category,
    brand: {
      "@type": "Brand",
      name: brandName,
    },
  };

  const matchedCategory = getCategoryForProduct(product.category, product.id);
  const categoryName = matchedCategory ? matchedCategory.name : (product.category || "Products");
  const categoryItem = matchedCategory ? `${baseUrl}/category/${matchedCategory.slug}` : `${baseUrl}/category`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryName,
        item: categoryItem,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: cleanTitle,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ReviewDetails product={product} />
    </>
  );
}

