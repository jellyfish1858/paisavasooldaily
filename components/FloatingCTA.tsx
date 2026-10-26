"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { recordClickAction } from "@/app/actions";
import { extractRetailerDomain } from "@/config/affiliate";

interface FloatingCTAProps {
  productId?: string;
  productTitle: string;
  retailerUrl?: string;
  imageUrl?: string;
  badge?: string | null;
}

export default function FloatingCTA({
  productId,
  productTitle,
  retailerUrl,
  imageUrl,
  badge,
}: FloatingCTAProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Appear once scrolled down past 450px
      const currentScrollY = window.scrollY;
      if (currentScrollY > 450) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    if (productId) {
      const domain = extractRetailerDomain(retailerUrl);
      recordClickAction(productId, domain).catch(() => {});
    }
    if (retailerUrl) {
      window.open(retailerUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (!isVisible || !retailerUrl) return null;

  return (
    <aside
      aria-label="Quick purchase navigation"
      className="fixed bottom-6 right-6 z-40 max-w-sm sm:max-w-md bg-slate-900/95 border border-blue-500/40 rounded-xl p-3 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 flex items-center gap-3"
    >
      {imageUrl && (
        <div className="relative h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden border border-white/10 bg-slate-800 hidden sm:block">
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
      )}

      <div className="min-w-0 flex-1 pr-1">
        <p className="text-xs font-bold text-white truncate leading-tight">
          {productTitle}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-green-400 font-mono font-bold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            In Stock
          </span>
          {badge && (
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-mono font-semibold truncate">
              {badge}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={handleClick}
        className="flex-shrink-0 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:scale-95 text-white font-mono text-xs uppercase tracking-wider font-bold rounded-lg shadow-md shadow-blue-600/30 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 animate-pulse"
      >
        Check Price →
      </button>
    </aside>
  );
}
