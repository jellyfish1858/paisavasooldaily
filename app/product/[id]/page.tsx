'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import { Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@/data/products';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products`);
        const products = await res.json();
        const found = products.find((p: any) => p.id === id || p.slug === id);
        if (found) {
          // Normalize properties to support both camelCase and snake_case API data
          const normalized = {
            ...found,
            imageUrl: found.imageUrl || found.image_url || '',
            retailerUrl: found.retailerUrl || found.retailer_url || found.amazon_url || '',
            quickTake: found.quickTake || found.quick_take || found.description || '',
            badge: found.badge || null,
            pros: found.pros || found.strengths || found.reasons_to_buy || [],
            cons: found.cons || found.trade_offs || found.reasons_not_to_buy || [],
            finalTake: found.finalTake || found.final_take || found.bottom_line || found.verdict || '',
            keySpecs: found.keySpecs || found.key_specs || {},
            goodFor: found.goodFor || found.good_for || {},
            skipIf: found.skipIf || found.skip_if || {},
          };
          setProduct(normalized);
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 bg-slate-800 rounded-lg animate-pulse"></div>
            <div className="space-y-4">
              <div className="h-8 bg-slate-800 rounded w-3/4 animate-pulse"></div>
              <div className="h-6 bg-slate-800 rounded w-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl font-bold text-white mb-4">Product Not Found</h1>
        <Link href="/" className="text-blue-400 hover:text-blue-300">
          ← Back to Home
        </Link>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Products
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <section className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Image */}
            <div className="flex items-center justify-center">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  width={500}
                  height={500}
                  className="rounded-lg object-cover w-full h-auto max-h-[500px]"
                />
              ) : (
                <div className="w-full h-96 bg-slate-800 rounded-lg flex items-center justify-center text-gray-500">
                  No image available
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col justify-start">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{product.title}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span className="text-gray-300 text-sm">Highly Recommended</span>
              </div>

              {/* Quick Take */}
              {product.quickTake && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-white mb-2">Quick Take</h2>
                  <p className="text-gray-300">{product.quickTake}</p>
                </div>
              )}

              {/* Badge */}
              {product.badge && (
                <div className="mb-6 inline-block self-start bg-green-500/20 border border-green-500/50 px-4 py-2 rounded-lg text-green-300 text-sm font-semibold">
                  {product.badge}
                </div>
              )}

              {/* Key Specs */}
              {specsEntries.length > 0 && (
                <div className="mb-6 bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Key Specs</h3>
                  <div className="space-y-2">
                    {specsEntries.map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-400">{key}</span>
                        <span className="text-white font-semibold text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={() => {
                  if (product.retailerUrl) {
                    window.open(product.retailerUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 text-lg mb-4 cursor-pointer"
              >
                Check Price & Buy →
              </button>

              <p className="text-xs text-gray-500 text-center">
                We earn an affiliate commission when you purchase through this link.
              </p>
            </div>
          </div>

          {/* Details Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Pros */}
            {product.pros && product.pros.length > 0 && (
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-400 mb-4">✓ Pros</h3>
                <ul className="space-y-2">
                  {product.pros.map((pro: string, i: number) => (
                    <li key={i} className="text-gray-300 flex gap-2">
                      <span className="text-green-400">•</span> {pro}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cons */}
            {product.cons && product.cons.length > 0 && (
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-400 mb-4">✗ Cons</h3>
                <ul className="space-y-2">
                  {product.cons.map((con: string, i: number) => (
                    <li key={i} className="text-gray-300 flex gap-2">
                      <span className="text-red-400">•</span> {con}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Final Take */}
          {product.finalTake && (
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur border border-blue-500/20 rounded-lg p-6 mb-12">
              <h3 className="text-lg font-semibold text-white mb-3">Final Take</h3>
              <p className="text-gray-300 leading-relaxed">{product.finalTake}</p>
            </div>
          )}

          {/* Good For / Skip If */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goodForEntries.length > 0 && (
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Good For</h3>
                <ul className="space-y-2">
                  {goodForEntries.map(([key, value]) => (
                    <li key={key} className="text-gray-300">
                      <span className="text-blue-300 font-semibold">{key}:</span> {value}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {skipIfEntries.length > 0 && (
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Skip If</h3>
                <ul className="space-y-2">
                  {skipIfEntries.map(([key, value]) => (
                    <li key={key} className="text-gray-300">
                      <span className="text-red-300 font-semibold">{key}:</span> {value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 py-12 mt-12 bg-slate-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h4 className="text-white font-bold text-lg mb-3">SmartChoice</h4>
              <p className="text-gray-400 text-sm">Handpicked essentials. Zero regrets.</p>
            </div>

            {/* Links */}
            <div>
              <h5 className="text-white font-semibold mb-3">Browse</h5>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/collections" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Collections
                  </Link>
                </li>
                <li>
                  <Link href="/compare" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Compare
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h5 className="text-white font-semibold mb-3">Legal</h5>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Affiliate Disclosure
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h5 className="text-white font-semibold mb-3">Contact</h5>
              <p className="text-gray-400 text-sm mb-2">Questions? We&apos;re here to help.</p>
              <a href="mailto:hello@smartchoice.com" className="text-blue-400 hover:text-blue-300 text-sm">
                hello@smartchoice.com
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 pt-8">
            <div className="text-center text-gray-500 text-sm">
              <p>© 2026 SmartChoice. All rights reserved.</p>
              <p className="mt-2">We earn affiliate commissions to provide free, unbiased product recommendations.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
