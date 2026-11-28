import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import {
  COLLECTIONS,
  assignProductsToCollections,
  sortBestValueProducts,
  type CollectionId,
} from '@/lib/collection-utils';
import {
  fetchProductsAction,
  fetchPublishedCollectionsAction,
} from '@/app/secure-admin-panel/actions';
import { createClient } from '@/utils/supabase/server';
import { generateCollectionMeta } from '@/lib/seo';
import { getCollectionSchema } from '@/lib/structured-data';
import { getSiteUrl } from '@/config/site';

export const dynamic = 'force-dynamic';

async function getCollectionData(collectionId: string) {
  const builtIn = COLLECTIONS.find((c) => c.id === collectionId);

  // 1. Fetch all products
  let allProducts: any[] = [];
  try {
    const pRes = await fetchProductsAction();
    if (pRes.success && Array.isArray(pRes.data)) {
      allProducts = pRes.data;
    }
  } catch (err) {
    console.error('Error fetching products for collection:', err);
  }

  // Handle built-in collection
  if (builtIn) {
    const assignments = assignProductsToCollections(allProducts);
    let matched = allProducts.filter((p) =>
      assignments.get(p.id)?.includes(collectionId as CollectionId)
    );

    let desc = builtIn.description;

    // Best Value collection: sort by clicks descending with price tiebreaker
    if (collectionId === 'best-value') {
      desc = 'Top-rated products ranked by real customer choices';
      const clickMap = new Map<string, number>();
      try {
        const supabase = await createClient();
        const { data: clickRows } = await supabase
          .from('affiliate_clicks')
          .select('product_id');

        if (clickRows && Array.isArray(clickRows)) {
          clickRows.forEach((row: any) => {
            if (row.product_id) {
              clickMap.set(row.product_id, (clickMap.get(row.product_id) || 0) + 1);
            }
          });
        }
      } catch (clickErr) {
        console.warn('affiliate_clicks fetch note for collection page:', clickErr);
      }

      matched = sortBestValueProducts(matched, clickMap);
    }

    return {
      id: builtIn.id,
      name: builtIn.name,
      description: desc,
      icon: builtIn.icon,
      color: builtIn.color,
      products: matched,
      count: matched.length,
    };
  }

  // Handle editorial collection
  try {
    const colRes = await fetchPublishedCollectionsAction();
    if (colRes.success && Array.isArray(colRes.data)) {
      const found = colRes.data.find(
        (c) => c.slug === collectionId || c.id === collectionId
      );
      if (found) {
        const foundAny = found as any;
        const matched = allProducts.filter((p) =>
          foundAny.products?.some((fp: any) => fp.id === p.id)
        );
        return {
          id: found.slug || found.id,
          name: found.title,
          description: found.description || 'Curated editorial collection',
          icon: '📚',
          color: 'from-blue-500 to-indigo-500',
          products: matched.length > 0 ? matched : (foundAny.products as any[]) || [],
          count: matched.length || foundAny.products?.length || 0,
        };
      }
    }
  } catch (err) {
    console.error('Error fetching editorial collection:', err);
  }

  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const collection = await getCollectionData(id);
  return generateCollectionMeta(collection).metadata;
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = await getCollectionData(id);

  if (!collection) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Collection Not Found</h1>
        <p className="text-slate-400 mb-8 max-w-md">
          The requested collection could not be found or has been archived.
        </p>
        <Link
          href="/collections"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs uppercase tracking-widest font-bold rounded-lg transition-all"
        >
          ← Browse All Collections
        </Link>
      </div>
    );
  }

  const collectionSchema = getCollectionSchema(collection);
  const baseUrl = getSiteUrl();
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
        name: "Collections",
        item: `${baseUrl}/collections`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: collection.name,
        item: `${baseUrl}/collections/${id}`,
      },
    ],
  };

  return (
    <>
      {collectionSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        {/* Navigation Breadcrumb */}
        <div className="border-b border-white/10 px-4 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-mono text-xs uppercase tracking-wider"
            >
              <ArrowLeft size={16} />
              All Collections
            </Link>
            <span className="text-xs text-slate-400 font-mono">
              Curated Selection: <strong className="text-white">{collection.count} Items</strong>
            </span>
          </div>
        </div>

        {/* Collection Header Banner */}
        <section className="relative px-4 py-16 sm:py-20 border-b border-white/10 overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-4">
              <span className="text-5xl sm:text-6xl p-3 bg-white/5 border border-white/10 rounded-2xl shadow-inner">
                {collection.icon}
              </span>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs uppercase tracking-widest text-blue-400 font-bold">
                    Curated Collection
                  </span>
                  {collection.id === 'best-value' && (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                      ⚡ Click-Ranked
                    </span>
                  )}
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                  {collection.name}
                </h1>
                <p className="text-slate-300 mt-2 text-base sm:text-lg max-w-2xl leading-relaxed">
                  {collection.description}
                </p>
              </div>
            </div>

            {/* Collection Metadata & Trust Signal */}
            <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 text-green-400 font-bold">
                <span>✓</span>
                <span>100% Editorial Quality Assured</span>
              </span>
              <span>•</span>
              <span>
                Total Products: <strong className="text-white">{collection.count}</strong>
              </span>
              {collection.id === 'best-value' && (
                <>
                  <span>•</span>
                  <span className="text-amber-400 font-semibold">
                    Ranked by real customer choices (affiliate click signals)
                  </span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="px-4 py-16 max-w-7xl mx-auto">
          {collection.products && collection.products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {collection.products.map((product: any, index: number) => {
                // Highlight top 3 products in collection
                const isPopular = index < 3;
                return (
                  <ProductCard
                    key={product.id || index}
                    product={product}
                    isPopular={isPopular}
                    popularLabel={index === 0 ? "Top Choice" : "Popular"}
                  />
                );
              })}
            </div>
          ) : (
            <div className="p-16 text-center border border-white/10 bg-white/5 rounded-2xl">
              <p className="text-gray-400 text-lg">No products in this collection yet.</p>
              <Link
                href="/"
                className="mt-4 inline-block text-blue-400 hover:text-blue-300 font-mono text-sm underline"
              >
                Browse All Catalog Products →
              </Link>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
