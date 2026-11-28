import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ArrowLeft } from 'lucide-react';
import {
  fetchProductBySlugAction,
  fetchProductByIdAction,
  fetchProductsAction,
} from '@/app/secure-admin-panel/actions';
import { generateProductMeta } from '@/lib/seo';
import { getProductSchema } from '@/lib/structured-data';
import { getSiteUrl } from '@/config/site';
import FloatingCTA from '@/components/FloatingCTA';
import ProductDetailCTA from '@/components/ProductDetailCTA';
import ProductMedia from '@/components/ProductMedia';

export const dynamic = 'force-dynamic';

async function getProduct(id: string) {
  try {
    const bySlug = await fetchProductBySlugAction(id);
    if (bySlug.success && bySlug.data) return bySlug.data;

    const byId = await fetchProductByIdAction(id);
    if (byId.success && byId.data) return byId.data;

    const all = await fetchProductsAction();
    if (all.success && all.data) {
      return all.data.find((p) => p.slug === id || p.id === id) || null;
    }
  } catch (err) {
    console.error('Error fetching product for page:', err);
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  return generateProductMeta(product).metadata;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rawProduct = await getProduct(id);

  if (!rawProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Product Not Found</h1>
        <p className="text-slate-400 mb-8 max-w-md">
          The requested product could not be located in our curated catalog.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs uppercase tracking-widest font-bold rounded-lg transition-all"
        >
          ← Back to Catalog
        </Link>
      </div>
    );
  }

  // Normalize properties
  const product = {
    ...rawProduct,
    title: (rawProduct.title || '').replace(/^PRODUCT TITLE:\s*/i, '').trim(),
    imageUrl: rawProduct.image_url || (rawProduct as any).imageUrl || '',
    retailerUrl:
      rawProduct.retailer_url ||
      rawProduct.amazon_url ||
      (rawProduct as any).amazonUrl ||
      '',
    quickTake:
      rawProduct.quick_take ||
      (rawProduct as any).quickTake ||
      rawProduct.description ||
      '',
    badge: rawProduct.badge || null,
    youtubeUrl:
      rawProduct.youtube_url ||
      (rawProduct as any).youtubeUrl ||
      rawProduct.video_url ||
      '',
    pros:
      rawProduct.strengths ||
      rawProduct.pros ||
      (rawProduct as any).reasons_to_buy ||
      [],
    cons:
      rawProduct.trade_offs ||
      rawProduct.cons ||
      (rawProduct as any).reasons_not_to_buy ||
      [],
    finalTake:
      rawProduct.final_take ||
      (rawProduct as any).finalTake ||
      rawProduct.verdict ||
      '',
    keySpecs: rawProduct.key_specs || (rawProduct as any).keySpecs || [],
    goodFor: rawProduct.good_for || (rawProduct as any).goodFor || [],
    skipIf: rawProduct.skip_if || (rawProduct as any).skipIf || [],
  };

  const productSchema = getProductSchema(product);

  // Format specs list whether keySpecs is an array or an object
  const specsEntries: [string, string][] = Array.isArray(product.keySpecs)
    ? product.keySpecs.map((item: string) => {
        const parts = String(item).split(':');
        return [parts[0]?.trim() || 'Spec', parts.slice(1).join(':').trim() || ''];
      })
    : typeof product.keySpecs === 'object' && product.keySpecs !== null
    ? Object.entries(product.keySpecs).map(([k, v]) => [k, String(v)])
    : [];

  // Format goodFor items whether array or object
  const goodForEntries: [string, string][] = Array.isArray(product.goodFor)
    ? product.goodFor.map((item: string, i: number) => [`Ideal ${i + 1}`, String(item)])
    : typeof product.goodFor === 'object' && product.goodFor !== null
    ? Object.entries(product.goodFor).map(([k, v]) => [k, String(v)])
    : [];

  // Format skipIf items whether array or object
  const skipIfEntries: [string, string][] = Array.isArray(product.skipIf)
    ? product.skipIf.map((item: string, i: number) => [`Caution ${i + 1}`, String(item)])
    : typeof product.skipIf === 'object' && product.skipIf !== null
    ? Object.entries(product.skipIf).map(([k, v]) => [k, String(v)])
    : [];

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
      ...(product.category
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: product.category,
              item: `${baseUrl}/category`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: product.title,
              item: `${baseUrl}/product/${id}`,
            },
          ]
        : [
            {
              "@type": "ListItem",
              position: 2,
              name: product.title,
              item: `${baseUrl}/product/${id}`,
            },
          ]),
    ],
  };

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
        {/* Header Breadcrumb */}
        <div className="border-b border-white/10 px-4 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-mono text-xs uppercase tracking-wider"
            >
              <ArrowLeft size={16} />
              Back to Catalog
            </Link>
            {product.category && (
              <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">
                Category: <strong className="text-slate-200">{product.category}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Main Content */}
        <section className="px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Product Image & Optional Media */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-center">
                  {product.imageUrl ? (
                    <div className="relative w-full h-[380px] sm:h-[480px] rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-2xl">
                      <Image
                        src={product.imageUrl}
                        alt={product.title}
                        fill
                        priority
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-96 bg-slate-800 rounded-2xl flex items-center justify-center text-gray-500 border border-white/10">
                      No image available
                    </div>
                  )}
                </div>

                {/* Optional Universal Media URL (YouTube or Instagram Reel) */}
                {product.youtubeUrl && (
                  <ProductMedia
                    mediaUrl={product.youtubeUrl}
                    productTitle={product.title}
                  />
                )}
              </div>

              {/* Info & Buying Box */}
              <div className="flex flex-col justify-start">
                {/* Category & Badge */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {product.badge && (
                    <span className="bg-green-500/20 border border-green-500/50 px-3 py-1 rounded-full text-green-300 text-xs font-mono font-bold tracking-wide">
                      {product.badge}
                    </span>
                  )}
                  {product.category && (
                    <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-slate-300 text-xs font-mono">
                      {product.category}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                  {product.title}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex gap-1" aria-label="5 out of 5 stars">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className="fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <span className="text-slate-300 text-sm font-semibold">
                    Highly Recommended Pick
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs text-slate-400">Anti-Regret Analysis</span>
                </div>

                {/* Quick Take */}
                {product.quickTake && (
                  <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
                    <h2 className="text-sm font-mono uppercase tracking-wider text-blue-400 font-bold mb-2">
                      Editorial Quick Take
                    </h2>
                    <p className="text-slate-300 text-sm leading-relaxed">{product.quickTake}</p>
                  </div>
                )}

                {/* Key Specs */}
                {specsEntries.length > 0 && (
                  <div className="mb-6 bg-slate-900/60 border border-white/10 rounded-xl p-4">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-3">
                      Key Specifications
                    </h3>
                    <div className="space-y-2">
                      {specsEntries.map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs sm:text-sm py-1 border-b border-white/5 last:border-0">
                          <span className="text-gray-400">{key}</span>
                          <span className="text-white font-semibold text-right">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main Interactive CTA Button with pulse animation, trust messaging, and click tracking */}
                <div className="mt-2">
                  <ProductDetailCTA
                    productId={product.id}
                    retailerUrl={product.retailerUrl}
                    badge={product.badge}
                    isOutOfStock={product.is_out_of_stock}
                  />
                </div>
              </div>
            </div>

            {/* Qualitative Assessment: Pros & Cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {/* Pros */}
              {product.pros && product.pros.length > 0 && (
                <div className="bg-slate-900/60 border border-green-500/20 rounded-xl p-6">
                  <h3 className="text-base font-bold text-green-400 mb-4 flex items-center gap-2">
                    <span>✓</span> Key Strengths (Pros)
                  </h3>
                  <ul className="space-y-2.5">
                    {product.pros.map((pro: string, i: number) => (
                      <li key={i} className="text-slate-300 text-sm flex gap-2.5">
                        <span className="text-green-400 font-bold">•</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cons */}
              {product.cons && product.cons.length > 0 && (
                <div className="bg-slate-900/60 border border-red-500/20 rounded-xl p-6">
                  <h3 className="text-base font-bold text-red-400 mb-4 flex items-center gap-2">
                    <span>✗</span> Trade-offs & Limitations (Cons)
                  </h3>
                  <ul className="space-y-2.5">
                    {product.cons.map((con: string, i: number) => (
                      <li key={i} className="text-slate-300 text-sm flex gap-2.5">
                        <span className="text-red-400 font-bold">•</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Final Take / Bottom Line */}
            {product.finalTake && (
              <div className="bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-slate-900/40 border border-blue-500/30 rounded-xl p-6 mb-12 shadow-lg">
                <span className="font-mono text-xs uppercase tracking-widest text-blue-400 font-bold block mb-2">
                  Editorial Verdict
                </span>
                <h3 className="text-xl font-bold text-white mb-3">Final Take</h3>
                <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                  {product.finalTake}
                </p>
              </div>
            )}

            {/* Target Audience: Good For / Skip If */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goodForEntries.length > 0 && (
                <div className="bg-slate-900/60 border border-white/10 rounded-xl p-6">
                  <h3 className="text-sm font-mono uppercase tracking-wider text-blue-400 font-bold mb-3">
                    Who This Is Good For
                  </h3>
                  <ul className="space-y-2">
                    {goodForEntries.map(([key, value]) => (
                      <li key={key} className="text-slate-300 text-sm">
                        <span className="text-blue-300 font-semibold">{key}:</span> {value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {skipIfEntries.length > 0 && (
                <div className="bg-slate-900/60 border border-white/10 rounded-xl p-6">
                  <h3 className="text-sm font-mono uppercase tracking-wider text-amber-400 font-bold mb-3">
                    Skip If
                  </h3>
                  <ul className="space-y-2">
                    {skipIfEntries.map(([key, value]) => (
                      <li key={key} className="text-slate-300 text-sm">
                        <span className="text-amber-300 font-semibold">{key}:</span> {value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Floating CTA (bottom-right on scroll) */}
        <FloatingCTA
          productId={product.id}
          productTitle={product.title}
          retailerUrl={product.retailerUrl}
          imageUrl={product.imageUrl}
          badge={product.badge}
        />
      </div>
    </>
  );
}
