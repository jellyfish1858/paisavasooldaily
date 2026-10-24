"use client";

import Link from "next/link";
import { useCompare } from "@/components/CompareProvider";
import RetailerCTA from "@/components/RetailerCTA";
import type { DbProduct, QualitativeRating } from "@/utils/supabase/types";

interface ProductCardProps {
  product: DbProduct | any;
}

function getQualitativeBadgeClass(val?: QualitativeRating | null) {
  switch (val) {
    case "Strong":
      return "bg-green-100 text-green-900 border-green-700";
    case "Good":
      return "bg-emerald-50 text-emerald-800 border-emerald-600";
    case "Fair":
      return "bg-amber-50 text-amber-900 border-amber-600";
    case "Depends":
      return "bg-blue-50 text-blue-900 border-blue-600";
    case "Limited":
      return "bg-red-50 text-red-900 border-red-600";
    default:
      return "bg-panel text-muted border-line/40";
  }
}

function stripProductMeta(text?: string | null): string {
  if (!text || typeof text !== "string") return "";
  return text.replace(/<!--\s*PRODUCT_META:\s*[\s\S]*?-->/gi, "").trim();
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toggle, isSelected, isFull } = useCompare();
  const inArena = isSelected(product.id);

  const imageUrl = product.image_url || product.imageUrl || "";
  const rawRetailerUrl = product.retailer_url || product.amazon_url || product.amazonUrl;
  const title = stripProductMeta(product.title) || "Curated Product";
  const category = product.category || "General";
  const badge = product.badge ? stripProductMeta(product.badge) : null;
  const displaySummary = stripProductMeta(product.quick_take || product.description || "");
  const isOutOfStock = Boolean(product.is_out_of_stock);
  const primaryStrength = stripProductMeta(
    product.strengths?.[0] ||
    product.reasons_to_buy?.[0] ||
    product.reasonsToBuy?.[0] ||
    product.pros?.[0] ||
    ""
  );

  const formattedReviewedDate = product.last_reviewed_at
    ? (() => {
        try {
          const d = new Date(product.last_reviewed_at);
          return isNaN(d.getTime())
            ? null
            : d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
        } catch {
          return null;
        }
      })()
    : null;

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product);
  };

  return (
    <article
      className={`group flex flex-col justify-between border-2 border-line bg-paper shadow-hard transition-all duration-200 hover:-translate-y-1 hover:shadow-hard-lg ${
        inArena ? "ring-2 ring-accent" : ""
      }`}
    >
      <div>
        {/* Card Image Banner */}
        <Link
          href={`/product/${product.slug || product.id}`}
          className="block relative aspect-video w-full border-b-2 border-line bg-panel overflow-hidden"
          aria-label={`Read research for ${title}`}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${title} - Product Overview & Editorial Research`}
              className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-panel text-muted">
              <span className="font-mono text-xs uppercase tracking-widest2 font-bold">
                {category}
              </span>
            </div>
          )}

          {/* Status Badges Overlay */}
          {isOutOfStock ? (
            <div className="absolute left-3 top-3 border-2 border-line bg-red-600 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest2 font-bold text-white shadow-hard-sm">
              Out of Stock
            </div>
          ) : badge ? (
            <div className="absolute left-3 top-3 border-2 border-line bg-accent px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest2 font-bold text-ink shadow-hard-sm">
              {badge}
            </div>
          ) : null}

          {/* Arena Active Indicator */}
          {inArena && (
            <div className="absolute right-3 top-3 border-2 border-line bg-ink px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider font-bold text-paper shadow-hard-sm">
              ✓ In Compare
            </div>
          )}
        </Link>

        {/* Card Body */}
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <span className="font-mono text-[11px] uppercase tracking-widest2 text-muted font-bold">
              {category}
            </span>
            {formattedReviewedDate ? (
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted/80 border border-line/20 px-1.5 py-0.5 bg-panel">
                Updated {formattedReviewedDate}
              </span>
            ) : (
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted/70">
                Research Published
              </span>
            )}
          </div>

          <h3 className="font-display text-xl font-bold leading-snug text-ink group-hover:text-accent transition-colors">
            <Link href={`/product/${product.slug || product.id}`}>{title}</Link>
          </h3>

          <p className="mt-2.5 line-clamp-2 font-body text-xs leading-relaxed text-muted">
            {displaySummary}
          </p>

          {/* Qualitative Matrix Preview Pills */}
          {(product.matrix_performance || product.matrix_value) && (
            <div className="mt-3.5 pt-3 border-t border-line/10 flex flex-wrap gap-2 items-center">
              {product.matrix_performance && (
                <span
                  className={`font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border ${getQualitativeBadgeClass(
                    product.matrix_performance
                  )}`}
                >
                  Perf: {product.matrix_performance}
                </span>
              )}
              {product.matrix_value && (
                <span
                  className={`font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border ${getQualitativeBadgeClass(
                    product.matrix_value
                  )}`}
                >
                  Value: {product.matrix_value}
                </span>
              )}
            </div>
          )}

          {/* Primary Strength Preview */}
          {primaryStrength && (
            <div className="mt-3 flex items-start gap-1.5 text-[11px] text-green-800 font-mono">
              <span className="font-bold shrink-0">✓</span>
              <span className="truncate">{primaryStrength}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Primary action drives to SmartChoice Research */}
      <div className="border-t-2 border-line bg-panel p-4 space-y-2.5">
        {/* Primary Row: Read Research (Main) + Compare (Secondary) */}
        <div className="flex items-center gap-2">
          <Link
            href={`/product/${product.slug || product.id}`}
            className="group flex-1 inline-flex items-center justify-center gap-2 border-2 border-line bg-accent px-4 py-2.5 font-mono text-xs uppercase tracking-widest2 font-bold text-ink shadow-hard-sm hover:bg-ink hover:text-paper transition-all whitespace-nowrap"
          >
            <span>Read Research</span>
            <span
              aria-hidden="true"
              className="transition-transform duration-150 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>

          {/* Compare Toggle Button */}
          <button
            type="button"
            onClick={handleToggleCompare}
            disabled={!inArena && isFull}
            aria-label={`Add ${title} to side-by-side comparison`}
            className={`border-2 border-line px-3 py-2.5 font-mono text-xs uppercase tracking-wider font-bold transition-all whitespace-nowrap shrink-0 ${
              inArena
                ? "bg-ink text-paper shadow-hard-sm"
                : isFull
                ? "bg-paper text-muted/50 border-line/30 cursor-not-allowed"
                : "bg-paper text-ink hover:bg-ink hover:text-paper shadow-hard-sm"
            }`}
          >
            {inArena ? "✓ Added" : "+ Compare"}
          </button>
        </div>

        {/* Secondary Subdued Retailer Link (Compliant, Non-Dominating) */}
        <div className="flex items-center justify-between pt-1 border-t border-line/10 text-[11px] font-mono">
          <span className="text-muted/70">Anti-Regret Analysis</span>
          <RetailerCTA
            url={rawRetailerUrl}
            productId={product.id}
            productTitle={title}
            isOutOfStock={isOutOfStock}
            variant="subdued-link"
            label="Check Price ↗"
          />
        </div>
      </div>
    </article>
  );
}