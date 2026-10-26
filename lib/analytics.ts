import type { DbProduct } from "@/utils/supabase/types";

export interface ProductClickData {
  productId: string;
  productTitle: string;
  totalClicks: number;
  retailerDomain: string;
  clicksPerDomain: Record<string, number>;
  productSlug?: string;
  productCategory?: string;
  imageUrl?: string;
}

export interface AnalyticsSummary {
  totalClicks: number;
  totalProducts: number;
  avgClicksPerProduct: number;
  topProduct: ProductClickData | null;
  top5Products: ProductClickData[];
  top10Products: ProductClickData[];
  products: ProductClickData[];
  clicksByDomain: Record<string, number>;
}

/**
 * Normalizes and extracts retailer domain from a URL or product record.
 */
export function extractRetailerDomainFromUrl(url?: string | null): string {
  if (!url || typeof url !== "string") return "unknown";
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return "unknown";
  }
}

/**
 * Calculates click tracking analytics from products and raw click records.
 * Provides safe null handling for products with 0 clicks.
 */
export function calculateProductClickAnalytics(
  rawProducts: Array<Partial<DbProduct> | any> = [],
  rawClicks: Array<any> = []
): AnalyticsSummary {
  const products = Array.isArray(rawProducts) ? rawProducts : [];
  const clicks = Array.isArray(rawClicks) ? rawClicks : [];

  // 1. Group clicks by product_id and retailer_domain
  const clicksByProductId = new Map<string, { total: number; domains: Record<string, number> }>();
  const overallClicksByDomain: Record<string, number> = {};

  clicks.forEach((c) => {
    if (!c) return;
    const pid = String(c.product_id || c.productId || "").trim();
    if (!pid) return;

    const count = Number(c.count) > 0 ? Number(c.count) : 1;
    const domain = (c.retailer_domain || c.retailerDomain || "unknown").toLowerCase();

    // Overall domain counts
    overallClicksByDomain[domain] = (overallClicksByDomain[domain] || 0) + count;

    // Per-product counts
    const existing = clicksByProductId.get(pid) || { total: 0, domains: {} };
    existing.total += count;
    existing.domains[domain] = (existing.domains[domain] || 0) + count;
    clicksByProductId.set(pid, existing);
  });

  // 2. Map every product (handling 0 clicks safely)
  let totalClicksAcrossAll = 0;

  const productDataList: ProductClickData[] = products.map((p) => {
    const pid = String(p.id || "").trim();
    const productTitle = String(p.title || "Untitled Product").trim();
    const primaryDomain =
      p.retailer_domain ||
      extractRetailerDomainFromUrl(p.retailer_url || p.amazon_url) ||
      "unknown";

    const clickStats = clicksByProductId.get(pid);
    const totalClicks = clickStats ? clickStats.total : 0;
    const clicksPerDomain = clickStats ? { ...clickStats.domains } : {};

    totalClicksAcrossAll += totalClicks;

    return {
      productId: pid,
      productTitle,
      totalClicks,
      retailerDomain: primaryDomain,
      clicksPerDomain,
      productSlug: p.slug,
      productCategory: p.category,
      imageUrl: p.image_url || p.imageUrl,
    };
  });

  // Sort products by total clicks descending
  productDataList.sort((a, b) => b.totalClicks - a.totalClicks);

  const top5Products = productDataList.slice(0, 5);
  const top10Products = productDataList.slice(0, 10);
  const topProduct = productDataList.length > 0 && productDataList[0].totalClicks > 0
    ? productDataList[0]
    : productDataList[0] || null;

  const totalProducts = products.length;
  const avgClicksPerProduct =
    totalProducts > 0
      ? Number((totalClicksAcrossAll / totalProducts).toFixed(2))
      : 0;

  return {
    totalClicks: totalClicksAcrossAll,
    totalProducts,
    avgClicksPerProduct,
    topProduct,
    top5Products,
    top10Products,
    products: productDataList,
    clicksByDomain: overallClicksByDomain,
  };
}
