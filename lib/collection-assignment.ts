import type { Product } from '@/data/products';

export type CollectionId = 'best-value' | 'premium-picks' | 'everyday-essentials' | 'trending-now' | 'smart-buys';

export interface CollectionAssignment {
  productId: string;
  collections: CollectionId[];
}

/**
 * TEMPORARY: Assign products to collections by price & recency
 * PERMANENT: Switch to affiliate_clicks ranking (code structure ready)
 */
export function assignProductsToCollections(products: Product[]): Map<string, CollectionId[]> {
  const assignments = new Map<string, CollectionId[]>();

  if (products.length === 0) return assignments;

  // Sort by price for tier assignment
  const byPrice = [...products].sort((a, b) => {
    const priceA = extractPrice(a) || 0;
    const priceB = extractPrice(b) || 0;
    return priceB - priceA;
  });

  // Sort by date for trending
  const byDate = [...products].sort((a, b) => {
    const dateA = new Date((a as any).createdAt || a.created_at || 0).getTime();
    const dateB = new Date((b as any).createdAt || b.created_at || 0).getTime();
    return dateB - dateA;
  });

  const topQuarter = Math.ceil(products.length * 0.25);
  const bottomQuarter = Math.ceil(products.length * 0.25);
  const middleHalf = Math.ceil(products.length * 0.5);

  // TEMPORARY LOGIC: Price-based tiers
  // Premium Picks: Top 25% by price
  byPrice.slice(0, topQuarter).forEach((product) => {
    if (!assignments.has(product.id)) assignments.set(product.id, []);
    assignments.get(product.id)!.push('premium-picks');
  });

  // Everyday Essentials: Bottom 25% by price
  byPrice.slice(-bottomQuarter).forEach((product) => {
    if (!assignments.has(product.id)) assignments.set(product.id, []);
    assignments.get(product.id)!.push('everyday-essentials');
  });

  // Trending Now: Newest 25% (by created_at)
  byDate.slice(0, Math.ceil(products.length * 0.25)).forEach((product) => {
    if (!assignments.has(product.id)) assignments.set(product.id, []);
    assignments.get(product.id)!.push('trending-now');
  });

  // Smart Buys: Middle 50% by price (value sweet spot)
  const middleStart = topQuarter;
  const middleEnd = topQuarter + middleHalf;
  byPrice.slice(middleStart, middleEnd).forEach((product) => {
    if (!assignments.has(product.id)) assignments.set(product.id, []);
    assignments.get(product.id)!.push('smart-buys');
  });

  // Best Value: All products (sorted by clicks when data available)
  products.forEach((product) => {
    if (!assignments.has(product.id)) assignments.set(product.id, []);
    assignments.get(product.id)!.push('best-value');
  });

  return assignments;
}

/**
 * PRODUCTION SWITCH: Rank products by affiliate clicks instead of price
 * Uncomment this when affiliate_clicks data starts flowing
 */
export async function assignProductsByClicks(
  products: Product[],
  supabase: any
): Promise<Map<string, CollectionId[]>> {
  const assignments = new Map<string, CollectionId[]>();

  // Fetch click counts from database
  const { data: clickData } = await supabase
    .from('affiliate_clicks')
    .select('product_id, COUNT(*) as click_count')
    .group_by('product_id');

  const clickMap = new Map(clickData?.map((c: any) => [c.product_id, c.click_count]) || []);

  // Sort products by click count (descending)
  const byClicks = [...products].sort((a, b) => {
    const clicksA = Number(clickMap.get(a.id)) || 0;
    const clicksB = Number(clickMap.get(b.id)) || 0;
    return clicksB - clicksA;
  });

  const topQuarter = Math.ceil(products.length * 0.25);

  // Best Value: Top 25% by clicks
  byClicks.slice(0, topQuarter).forEach((product) => {
    if (!assignments.has(product.id)) assignments.set(product.id, []);
    assignments.get(product.id)!.push('best-value');
  });

  // All other collections still use price-based logic (or can be updated)
  // This ensures Best Value is always click-driven for conversion optimization
  return assignments;
}

function extractPrice(product: Product): number | null {
  // Check direct price if present
  if ((product as any).price && typeof (product as any).price === 'number') {
    return (product as any).price;
  }
  // Try to extract price from title, description, or review details
  const text = `${product.title || ''} ${product.description || ''} ${(product as any).review_details || ''}`;
  const priceMatch = text.match(/[₹$]\s?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
  if (priceMatch) {
    return parseFloat(priceMatch[1].replace(/,/g, ''));
  }
  // Deterministic fallback for products without explicit currency notation
  if ((product as any).budget_tier === 'premium') return 8000;
  if ((product as any).budget_tier === 'mid') return 3000;
  if ((product as any).budget_tier === 'low') return 800;
  let hash = 0;
  const str = product.id || product.title || '';
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return 1000 + Math.abs(hash % 9000);
}

/**
 * Sorts products for the "Best Value" collection:
 * 1. Click count (descending) first.
 * 2. Price as tiebreaker (descending).
 */
export function sortBestValueProducts(
  products: Product[],
  clickMap?: Map<string, number> | Record<string, number>
): Product[] {
  const getClicks = (id: string): number => {
    if (!clickMap) return 0;
    if (clickMap instanceof Map) return clickMap.get(id) || 0;
    return (clickMap as Record<string, number>)[id] || 0;
  };

  return [...products].sort((a, b) => {
    const clicksA = getClicks(a.id);
    const clicksB = getClicks(b.id);
    if (clicksB !== clicksA) {
      return clicksB - clicksA;
    }
    const priceA = extractPrice(a) || 0;
    const priceB = extractPrice(b) || 0;
    return priceB - priceA;
  });
}

/**
 * Assigns products to collections with click and price ranking.
 * "Best Value" collection: Sort products by click count (descending) first, then price as tiebreaker.
 * Other collections: Keep existing auto-assignment logic.
 */
export function assignProductsByClicksAndPrice(
  products: Product[],
  clickMap?: Map<string, number> | Record<string, number>
) {
  const assignments = assignProductsToCollections(products);
  const sortedBestValue = sortBestValueProducts(products, clickMap);

  const result: any = [...sortedBestValue];
  result.get = (id: string) => assignments.get(id);
  result.has = (id: string) => assignments.has(id);
  result.assignments = assignments;
  result.sortedBestValue = sortedBestValue;
  return result;
}


