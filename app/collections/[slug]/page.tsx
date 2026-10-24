import { fetchPublishedCollectionBySlugAction, fetchProductsAction } from '@/app/actions';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getSiteUrl } from '@/config/site';
import ProductCard from '@/components/ProductCard';
import AffiliateDisclosure from '@/components/AffiliateDisclosure';
import { assignProductsToCollections, type CollectionId } from '@/lib/collection-assignment';
import { CompareProvider } from '@/components/CompareProvider';
import CompareArena from '@/components/CompareArena';

export const dynamic = 'force-dynamic';

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

const CURATED_FALLBACK_COLLECTIONS: Record<
  string,
  { title: string; description: string; badgeMatch?: string }
> = {
  "best-value": {
    title: "Best Value Picks",
    description: "Top-rated products ranked by real customer choices and high cost-to-capability ratio.",
    badgeMatch: "value",
  },
  "premium-picks": {
    title: "Premium Picks",
    description: "Investment pieces engineered for long-term endurance and superior construction.",
    badgeMatch: "premium",
  },
  "everyday-essentials": {
    title: "Everyday Essentials",
    description: "Affordable, dependable must-haves for daily productivity, commuting, and home.",
    badgeMatch: "pick",
  },
  "trending-now": {
    title: "Trending Now",
    description: "Fresh community favorites and popular essentials.",
    badgeMatch: "trending",
  },
  "smart-buys": {
    title: "Smart Buys",
    description: "High-scoring curated models identified through qualitative anti-regret research.",
    badgeMatch: "smart",
  },
};

export async function generateMetadata(
  { params }: CollectionPageProps
): Promise<Metadata> {
  const { slug } = await params;
  const res: any = await fetchPublishedCollectionBySlugAction(slug);
  let collection: any = (res && 'data' in res) ? res.data : res;

  if (!collection && CURATED_FALLBACK_COLLECTIONS[slug]) {
    const fallback = CURATED_FALLBACK_COLLECTIONS[slug];
    collection = {
      title: `${fallback.title} | SmartChoice Collections`,
      description: fallback.description,
      status: 'published',
      slug,
    };
  }

  if (!collection) {
    return {
      title: 'Collection Not Found',
    };
  }

  const url = `${getSiteUrl()}/collections/${slug}`;
  return {
    title: collection.seo_title || collection.title,
    description: collection.seo_description || collection.description,
    openGraph: {
      title: collection.seo_title || collection.title,
      description: collection.seo_description || collection.description,
      url,
      type: 'website',
      images: collection.cover_image_url ? [{ url: collection.cover_image_url }] : [],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function CollectionDetailPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const res: any = await fetchPublishedCollectionBySlugAction(slug);
  let collection: any = (res && 'data' in res) ? res.data : res;

  let fallbackProducts: any[] = [];
  if (!collection && CURATED_FALLBACK_COLLECTIONS[slug]) {
    const fallback = CURATED_FALLBACK_COLLECTIONS[slug];
    const allProductsRes = await fetchProductsAction();
    const all = allProductsRes.success && Array.isArray(allProductsRes.data) ? allProductsRes.data : [];
    const assignments = assignProductsToCollections(all as any);
    fallbackProducts = all.filter((p: any) =>
      assignments.get(p.id)?.includes(slug as CollectionId)
    );
    collection = {
      id: slug,
      title: fallback.title,
      description: fallback.description,
      slug,
      cover_image_url: null,
      sections: [],
      products: fallbackProducts,
    };
  }

  if (!collection) {
    notFound();
  }

  const rawProducts = collection.products || collection.collection_products?.map((cp: any) => cp.product || cp) || [];
  const products = rawProducts.filter(Boolean);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.title,
    description: collection.description,
    url: `${getSiteUrl()}/collections/${slug}`,
    image: collection.cover_image_url,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: products.map((product: any, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: product.title,
        url: `${getSiteUrl()}/product/${product.id}`,
      })),
    },
  };

  return (
    <CompareProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        {/* Hero Section */}
        <div className="relative w-full h-96 bg-cover bg-center flex items-center justify-center">
          {collection.cover_image_url && (
            <img
              src={collection.cover_image_url}
              alt={collection.title}
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
          )}
          <div className="relative z-10 text-center text-white px-6">
            <h1 className="text-5xl font-bold mb-4">{collection.title}</h1>
            <p className="text-xl text-slate-200">{collection.description}</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* Sections */}
          {collection.sections && collection.sections.length > 0 && (
            <div className="mb-16 space-y-12">
              {collection.sections
                .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
                .map((section: any) => (
                  <div key={section.id} className="bg-slate-800 rounded-lg p-8">
                    {section.heading && (
                      <h2 className="text-3xl font-bold text-white mb-4">{section.heading}</h2>
                    )}
                    {section.body && (
                      <div className="text-slate-300 mb-6 max-w-none whitespace-pre-wrap">
                        {section.body}
                      </div>
                    )}
                    {section.image_url && (
                      <img
                        src={section.image_url}
                        alt={section.heading}
                        className="w-full max-h-96 object-cover rounded mb-6"
                      />
                    )}
                    {section.cta_text && section.cta_destination && (
                      <a
                        href={section.cta_destination}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                      >
                        {section.cta_text}
                      </a>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Products in Collection */}
          {products.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-white mb-8">Products in This Collection</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products
                  .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
                  .map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
              </div>
            </div>
          )}

          {/* Affiliate Disclosure */}
          <div className="mt-12">
            <AffiliateDisclosure />
          </div>
        </div>

        {/* Comparison Arena Drawer */}
        <CompareArena />
      </div>
    </CompareProvider>
  );
}
