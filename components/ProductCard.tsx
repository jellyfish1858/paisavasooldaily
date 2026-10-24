'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import type { Product } from '@/data/products';

interface ProductCardProps {
  product: Product | any;
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.imageUrl || product.image_url || '';
  const retailerUrl = product.retailerUrl || product.retailer_url || product.amazon_url || product.amazonUrl || '';
  const quickTake = product.quickTake || product.quick_take || product.description || '';
  const badge = product.badge || null;
  const title = product.title || 'Curated Product';
  const targetId = product.slug || product.id;

  return (
    <Link href={`/product/${targetId}`}>
      <div className="group h-full bg-white/5 backdrop-blur border border-white/10 rounded-lg overflow-hidden hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
        
        {/* Image */}
        <div className="relative h-56 bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No image
            </div>
          )}
          
          {/* Badge */}
          {badge && (
            <div className="absolute top-3 right-3 bg-green-500/90 px-2 py-1 rounded text-white text-xs font-bold">
              {badge}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors line-clamp-2 mb-2">
            {title}
          </h3>

          {/* Quick Take */}
          {quickTake && (
            <p className="text-xs text-gray-400 line-clamp-2 mb-3">
              {quickTake}
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1 mb-4">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className="fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">Recommended</span>
          </div>

          {/* Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              if (retailerUrl) {
                window.open(retailerUrl, '_blank', 'noopener,noreferrer');
              }
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded transition-colors"
          >
            Check Price
          </button>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;