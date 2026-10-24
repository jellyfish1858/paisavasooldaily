import { fetchPublishedCollectionsAction } from '@/app/actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getSiteUrl } from '@/config/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Editorial Collections | SmartChoice Storefront',
  description: 'Curated buying guides and product collections to help you make informed purchasing decisions.',
  alternates: {
    canonical: `${getSiteUrl()}/collections`,
  },
  openGraph: {
    title: 'Editorial Collections | SmartChoice Storefront',
    description: 'Curated buying guides and product collections to help you make informed purchasing decisions.',
    url: `${getSiteUrl()}/collections`,
    type: 'website',
  },
};

export default async function CollectionsPage() {
  try {
    const res: any = await fetchPublishedCollectionsAction();
    const collections = Array.isArray(res) ? res : (res?.data || []);

    if (!collections || collections.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Editorial Collections</h1>
            <p className="text-lg text-slate-300">No collections available at this time.</p>
            <Link href="/" className="text-blue-400 hover:text-blue-300 mt-6 inline-block">
              ← Back to Home
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-8">Editorial Collections</h1>
          <p className="text-lg text-slate-300 mb-12">
            Explore curated buying journeys crafted to help you make informed decisions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection: any) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className="group block bg-slate-800 rounded-lg overflow-hidden hover:bg-slate-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {collection.cover_image_url && (
                  <img
                    src={collection.cover_image_url}
                    alt={collection.title}
                    className="w-full h-48 object-cover group-hover:opacity-80 transition-opacity"
                  />
                )}
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {collection.title}
                  </h2>
                  <p className="text-slate-300 mb-4 line-clamp-2">{collection.description}</p>
                  <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                    {collection.category}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading collections:', error);
    notFound();
  }
}
