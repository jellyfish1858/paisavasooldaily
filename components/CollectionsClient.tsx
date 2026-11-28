'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { COLLECTIONS } from '@/lib/collection-utils';

export default function CollectionsClient() {
  const [collections, setCollections] = useState<any[]>(() =>
    COLLECTIONS.map((c) => ({
      ...c,
      count: c.id === 'best-value' ? 21 : c.id === 'smart-buys' ? 12 : 6,
    }))
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const promises = COLLECTIONS.map(async (col) => {
          const res = await fetch(`/api/collections/${col.id}`);
          return res.json();
        });
        const data = await Promise.all(promises);
        if (Array.isArray(data) && data.length > 0 && data[0]?.id) {
          setCollections(data);
        }
      } catch (error) {
        console.error('Failed to fetch collections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Header */}
      <section className="px-4 py-16 text-center border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-4">Curated Collections</h1>
          <p className="text-xl text-gray-300">
            Handpicked products organized for every need. Zero regrets.
          </p>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.id}`}
                className="group relative overflow-hidden rounded-xl bg-white/5 backdrop-blur border border-white/10 hover:border-blue-400/50 p-8 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
              >
                <div className="text-5xl mb-4">{collection.icon}</div>
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                  {collection.name}
                </h2>
                <p className="text-gray-300 mb-4">{collection.description}</p>
                <div className="text-sm text-gray-400">
                  {collection.count} products
                </div>
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
