'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import type { Product } from '@/data/products';
import { recordClickAction } from '@/app/actions';
import { extractRetailerDomain } from '@/config/affiliate';

interface ProductCardProps {
  product: Product | any;
  isPopular?: boolean;
  popularLabel?: string;
}

export function ProductCard({
  product,
  isPopular = false,
  popularLabel = "Popular in This Collection",
}: ProductCardProps) {
  const imageUrl = product.imageUrl || product.image_url || '';
  const retailerUrl =
    product.retailerUrl ||
    product.retailer_url ||
    product.amazon_url ||
    product.amazonUrl ||
    '';
  const quickTake = product.quickTake || product.quick_take || product.description || '';
  const badge = product.badge || null;
  const title = product.title || 'Curated Product';
  const targetId = product.slug || product.id;

  const isLimitedTime =
    badge?.toLowerCase().includes("limited") ||
    badge?.toLowerCase().includes("ends soon");
  const isBestseller =
    badge?.toLowerCase().includes("best value") ||
    badge?.toLowerCase().includes("bestseller");
  const isTrending = badge?.toLowerCase().includes("trending");

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.id) {
      const domain = extractRetailerDomain(retailerUrl);
      recordClickAction(product.id, domain).catch(() => {});
    }
    if (retailerUrl) {
      window.open(retailerUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Link href={`/product/${targetId}`} className="block h-full">
      <div className="group h-full flex flex-col justify-between bg-white/5 backdrop-blur border border-white/10 rounded-xl overflow-hidden hover:border-blue-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1">
        
        {/* Image & Badges */}
        <div>
          <div className="relative h-56 w-full bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-mono">
                No image available
              </div>
            )}
            
            {/* Top-Right Badge: Existing Badge / Bestseller / Limited Time */}
            <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
              {badge && (
                <span
                  className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold tracking-wide shadow-md ${
                    isLimitedTime
                      ? "bg-amber-500 text-slate-950 animate-pulse"
                      : isTrending
                      ? "bg-rose-500 text-white"
                      : isBestseller
                      ? "bg-emerald-500 text-white"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {isLimitedTime ? "⚡ Limited Stock" : badge}
                </span>
              )}

              {/* Popular in This Collection Badge (Top 3 in collection) */}
              {isPopular && (
                <span className="bg-purple-600/90 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-md backdrop-blur">
                  ⭐ {popularLabel}
                </span>
              )}
            </div>

            {/* Micro-copy urgency tag for Limited Time */}
            {isLimitedTime && (
              <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 font-bold border border-amber-500/30">
                ⏳ Ends Soon
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Title */}
            <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors line-clamp-2 mb-2 leading-snug">
              {title}
            </h3>

            {/* Quick Take */}
            {quickTake && (
              <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                {quickTake}
              </p>
            )}

            {/* Rating & Trust indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5" aria-label="5 stars rating">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span className="text-[11px] text-gray-400 font-mono">Recommended</span>
              </div>

              <span className="text-[10px] text-green-400 font-mono font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                Verified
              </span>
            </div>
          </div>
        </div>

        {/* Sticky/Fixed Bottom Button: Always visible at bottom of card */}
        <div className="p-4 pt-0 mt-auto">
          <button
            onClick={handleButtonClick}
            className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs font-mono uppercase tracking-wider font-bold py-2.5 px-4 rounded-lg transition-all duration-150 shadow-md shadow-blue-600/20 hover:shadow-blue-600/40 flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <span>Check Price</span>
            <span aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform">→</span>
          </button>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;