'use client';

import { useState, useEffect, use } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { COLLECTIONS } from '@/lib/collection-utils';

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams =
    typeof (params as any)?.then === 'function'
      ? use(params as Promise<{ id: string }>)
      : (params as { id: string });
  const collectionId = resolvedParams?.id;

  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const collectionMeta = COLLECTIONS.find((c) => c.id === collectionId);

  useEffect(() => {
    if (!collectionId) return;

    const fetchCollection = async () => {
      try {
        const res = await fetch(`/api/collections/${collectionId}`);
        const data = await res.json();
        setCollection(data);
      } catch (error) {
        console.error('Failed to fetch collection:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [collectionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-96 bg-slate-800 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
        <p className="text-white text-lg">Collection not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Header */}
      <section className="px-4 py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{collectionMeta?.icon}</span>
            <div>
              <h1 className="text-5xl font-bold text-white">{collection.name}</h1>
              <p className="text-gray-300 mt-2">{collection.description}</p>
            </div>
          </div>
          <p className="text-gray-400">{collection.count} products</p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="px-4 py-16">
        <div className="max-w-7xl mx-auto">
          {collection.products && collection.products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {collection.products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 text-lg">No products in this collection yet</p>
          )}
        </div>
      </section>
    </div>
  );
}
