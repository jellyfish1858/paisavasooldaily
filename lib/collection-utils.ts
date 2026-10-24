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
