"use client";

import { recordClickAction } from "@/app/actions";
import { extractRetailerDomain } from "@/config/affiliate";

interface ProductDetailCTAProps {
  productId?: string;
  retailerUrl?: string;
  badge?: string | null;
  isOutOfStock?: boolean;
}

export default function ProductDetailCTA({
  productId,
  retailerUrl,
  badge,
  isOutOfStock = false,
}: ProductDetailCTAProps) {
  const handleClick = () => {
    if (productId) {
      const domain = extractRetailerDomain(retailerUrl);
      recordClickAction(productId, domain).catch(() => {});
    }
    if (retailerUrl) {
      window.open(retailerUrl, "_blank", "noopener,noreferrer");
    }
  };

  const isLimitedTime = badge?.toLowerCase().includes("limited") || badge?.toLowerCase().includes("deal");

  return (
    <div className="space-y-3">
      {/* Urgency Micro-copy */}
      {isLimitedTime && (
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1.5 rounded-lg">
          <span className="animate-ping inline-block h-2 w-2 rounded-full bg-amber-400 opacity-75" />
          <span>⚡ Limited Time Offer: High Demand Item</span>
        </div>
      )}

      {/* Main CTA Button with subtle pulse/glow animation */}
      <button
        onClick={handleClick}
        disabled={isOutOfStock || !retailerUrl}
        className={`w-full py-4 px-6 rounded-lg font-bold text-lg text-white transition-all transform duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-xl ${
          isOutOfStock
            ? "bg-slate-800 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 hover:from-blue-500 hover:to-blue-600 hover:scale-[1.02] active:scale-[0.98] shadow-blue-600/30 animate-pulse hover:animate-none focus:outline-none focus:ring-4 focus:ring-blue-500/40"
        }`}
      >
        <span>{isOutOfStock ? "Currently Out of Stock" : "Check Price & Buy →"}</span>
      </button>

      {/* Trust Badge Footer Line */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 pt-1 font-mono">
        <div className="flex items-center gap-1.5 text-green-400 font-semibold">
          <span>✓</span>
          <span>Quality Assured</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300">Verified Purchase Data</span>
        </div>
        <p className="text-[11px] text-gray-500 text-center sm:text-right">
          Affiliate commissions support our free research.
        </p>
      </div>
    </div>
  );
}
