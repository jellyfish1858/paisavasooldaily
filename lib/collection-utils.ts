import type { Product } from '@/data/products';

export type CollectionId = 'best-value' | 'premium-picks' | 'everyday-essentials' | 'trending-now' | 'smart-buys';

export function assignProductsToCollections(products: Product[]): Map<string, CollectionId[]> {
  const assignments = new Map<string, CollectionId[]>();

  if (products.length === 0) return assignments;

  const sorted = [...products].sort((a, b) => {
    const dateA = new Date((a as any).createdAt || a.created_at || 0).getTime();
    const dateB = new Date((b as any).createdAt || b.created_at || 0).getTime();
    return dateB - dateA;
  });

  const quarter = Math.ceil(products.length / 4);
  
  // Trending Now: Newest 25%
  sorted.slice(0, quarter).forEach(p => {
    if (!assignments.has(p.id)) assignments.set(p.id, []);
    assignments.get(p.id)!.push('trending-now');
  });

  // Premium Picks: Every other product (variation)
  products.filter((_, i) => i % 2 === 0).slice(0, quarter).forEach(p => {
    if (!assignments.has(p.id)) assignments.set(p.id, []);
    assignments.get(p.id)!.push('premium-picks');
  });

  // Everyday Essentials: Remaining after premium
  products.filter((_, i) => i % 2 !== 0).slice(0, quarter).forEach(p => {
    if (!assignments.has(p.id)) assignments.set(p.id, []);
    assignments.get(p.id)!.push('everyday-essentials');
  });

  // Smart Buys: 50% middle products
  products.slice(quarter, quarter * 3).forEach(p => {
    if (!assignments.has(p.id)) assignments.set(p.id, []);
    assignments.get(p.id)!.push('smart-buys');
  });

  // Best Value: All products (will sort by clicks in API)
  products.forEach(p => {
    if (!assignments.has(p.id)) assignments.set(p.id, []);
    assignments.get(p.id)!.push('best-value');
  });

  return assignments;
}

/**
 * Extracts a numeric price from a product record or text/budget tier fallback.
 */
export function extractPrice(product: any): number {
  if (!product) return 0;
  if (typeof product.price === 'number') {
    return product.price;
  }
  const text = `${product.title || ''} ${product.description || ''} ${product.quick_take || ''} ${product.badge || ''}`;
  const priceMatch = text.match(/[₹$]\s?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
  if (priceMatch) {
    return parseFloat(priceMatch[1].replace(/,/g, ''));
  }
  if (product.budget_tier === 'premium') return 8000;
  if (product.budget_tier === 'mid') return 3000;
  if (product.budget_tier === 'low') return 800;
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
    const priceA = extractPrice(a);
    const priceB = extractPrice(b);
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


export const COLLECTIONS = [
  {
    id: 'best-value' as const,
    name: 'Best Value',
    description: 'Top-rated products ranked by customer choices',
    icon: '⭐',
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'premium-picks' as const,
    name: 'Premium Picks',
    description: 'Investment pieces that last',
    icon: '👑',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'everyday-essentials' as const,
    name: 'Everyday Essentials',
    description: 'Affordable must-haves for daily life',
    icon: '✨',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'trending-now' as const,
    name: 'Trending Now',
    description: 'Fresh finds and seasonal favorites',
    icon: '🔥',
    color: 'from-red-500 to-rose-500',
  },
  {
    id: 'smart-buys' as const,
    name: 'Smart Buys',
    description: 'Best value across all categories',
    icon: '💡',
    color: 'from-green-500 to-emerald-500',
  },
];
