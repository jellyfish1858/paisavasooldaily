import { Metadata } from 'next';
import Link from 'next/link';
import { fetchProductsAction } from '@/app/actions';
import { assignProductsToCollections, type CollectionId } from '@/lib/collection-assignment';
import ProductCard from '@/components/ProductCard';
import { CompareProvider } from '@/components/CompareProvider';
import CompareArena from '@/components/CompareArena';
import AffiliateDisclosure from '@/components/AffiliateDisclosure';
import { getSiteUrl } from '@/config/site';
import type { DbProduct } from '@/utils/supabase/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Editorial Collections — Curated Buying Guides | SmartChoice',
  description: 'Explore 5 curated product collections: Best Value, Premium Picks, Everyday Essentials, Trending Now, and Smart Buys.',
  alternates: {
    canonical: `${getSiteUrl()}/collections`,
  },
  openGraph: {
    title: 'Editorial Collections — Curated Buying Guides | SmartChoice',
    description: 'Explore 5 curated product collections: Best Value, Premium Picks, Everyday Essentials, Trending Now, and Smart Buys.',
    url: `${getSiteUrl()}/collections`,
    type: 'website',
  },
};

interface CollectionMeta {
  id: CollectionId;
  title: string;
  description: string;
  icon: string;
  badge: string;
  accentBorder: string;
  accentBg: string;
  accentText: string;
}

const COLLECTIONS_CONFIG: CollectionMeta[] = [
  {
    id: 'best-value',
    title: 'Best Value',
    description: 'Top-rated products ranked by real customer choices and high performance-to-cost ratio',
    icon: '⭐',
    badge: 'Conversion Ranked',
    accentBorder: 'border-amber-500/30',
    accentBg: 'bg-amber-500/10',
    accentText: 'text-amber-400',
  },
  {
    id: 'premium-picks',
    title: 'Premium Picks',
    description: 'Top-tier investment pieces engineered for long-term endurance and superior construction',
    icon: '👑',
    badge: 'Top 25% Tier',
    accentBorder: 'border-purple-500/30',
    accentBg: 'bg-purple-500/10',
    accentText: 'text-purple-400',
  },
  {
    id: 'everyday-essentials',
    title: 'Everyday Essentials',
    description: 'Affordable, dependable must-haves for daily productivity, home, and commute',
    icon: '✨',
    badge: 'Budget Value',
    accentBorder: 'border-blue-500/30',
    accentBg: 'bg-blue-500/10',
    accentText: 'text-blue-400',
  },
  {
    id: 'trending-now',
    title: 'Trending Now',
    description: 'Fresh community favorites and recently vetted arrivals making waves',
    icon: '🔥',
    badge: 'Newest Arrivals',
    accentBorder: 'border-rose-500/30',
    accentBg: 'bg-rose-500/10',
    accentText: 'text-rose-400',
  },
  {
    id: 'smart-buys',
    title: 'Smart Buys',
    description: 'Qualitative anti-regret sweet spot models balancing performance, durability, and fair price',
    icon: '💡',
    badge: 'Sweet Spot',
    accentBorder: 'border-emerald-500/30',
    accentBg: 'bg-emerald-500/10',
    accentText: 'text-emerald-400',
  },
];

export default async function CollectionsPage() {
  let allProducts: DbProduct[] = [];

  try {
    const res = await fetchProductsAction();
    if (res && res.success && Array.isArray(res.data)) {
      allProducts = res.data;
    }
  } catch (error) {
    console.error('Failed to load products for collections page:', error);
  }

  const assignments = assignProductsToCollections(allProducts as any);

  const collectionsWithProducts = COLLECTIONS_CONFIG.map((col) => {
    const productsInCol = allProducts.filter((p) =>
      assignments.get(p.id)?.includes(col.id)
    );
    return {
      ...col,
      products: productsInCol,
    };
  });

  return (
    <CompareProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
        {/* Hero Header */}
        <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-16 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-600/15 via-transparent to-transparent pointer-events-none" />

          <div className="relative max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-xs uppercase tracking-widest mb-4">
              <span>✦ Auto-Assigned Editorial Collections</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
              Editorial Collections
            </h1>

            <p className="max-w-2xl text-slate-300 font-body text-base sm:text-lg leading-relaxed mb-8">
              Explore 5 distinct shopping frameworks populated through qualitative anti-regret research,
              balanced by price tiers, recency, and customer satisfaction metrics.
            </p>

            {/* Quick jump anchor navigation */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              {collectionsWithProducts.map((col) => (
                <a
                  key={col.id}
                  href={`#${col.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 border border-white/10 hover:border-blue-500/50 hover:bg-slate-800 text-xs font-mono font-medium text-slate-200 transition-all transform hover:-translate-y-0.5"
                >
                  <span>{col.icon}</span>
                  <span>{col.title}</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] text-slate-400">
                    {col.products.length}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Collections Sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
          {collectionsWithProducts.map((col, colIndex) => (
            <section
              key={col.id}
              id={col.id}
              className="scroll-mt-24 border border-white/10 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-900/20 backdrop-blur p-6 sm:p-8 lg:p-10 shadow-2xl"
            >
              {/* Collection Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{col.icon}</span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      {col.title}
                    </h2>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${col.accentBorder} ${col.accentBg} ${col.accentText}`}
                    >
                      {col.badge}
                    </span>
                  </div>
                  <p className="text-slate-400 font-body text-sm max-w-2xl leading-relaxed">
                    {col.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="font-mono text-xs text-slate-400">
                    <span className="text-white font-bold">{col.products.length}</span> models included
                  </div>
                  <Link
                    href={`/collections/${col.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-mono font-bold uppercase tracking-wider transition-all"
                  >
                    <span>View Detail</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>

              {/* Product Cards Grid */}
              {col.products.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-mono text-xs">
                  No products assigned to this collection yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {col.products.map((product) => (
                    <ProductCard key={`${col.id}-${product.id}`} product={product} />
                  ))}
                </div>
              )}
            </section>
          ))}

          {/* Compliance Affiliate Disclosure */}
          <div className="pt-8">
            <AffiliateDisclosure />
          </div>
        </div>

        {/* Global Compare Arena Bottom Drawer */}
        <CompareArena />
      </div>
    </CompareProvider>
  );
}
