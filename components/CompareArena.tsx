"use client";

import { useState } from "react";
import Link from "next/link";
import { useCompare } from "@/components/CompareProvider";
import RetailerCTA from "@/components/RetailerCTA";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import type { DbProduct, QualitativeRating } from "@/utils/supabase/types";

const MATRIX_DIMENSIONS: { key: keyof DbProduct; label: string }[] = [
  { key: "matrix_performance", label: "Performance" },
  { key: "matrix_value", label: "Value for Money" },
  { key: "matrix_ease_of_use", label: "Ease of Use" },
  { key: "matrix_portability", label: "Portability" },
  { key: "matrix_compatibility", label: "Compatibility" },
  { key: "matrix_long_term_suitability", label: "Long-Term Suitability" },
];

function getQualitativeBadgeClass(val?: QualitativeRating | null) {
  switch (val) {
    case "Strong":
      return "bg-green-100 text-green-800 border-green-700 font-bold";
    case "Good":
      return "bg-emerald-50 text-emerald-800 border-emerald-600 font-bold";
    case "Fair":
      return "bg-amber-50 text-amber-800 border-amber-600 font-bold";
    case "Depends":
      return "bg-blue-50 text-blue-800 border-blue-600 font-bold";
    case "Limited":
      return "bg-red-50 text-red-800 border-red-600 font-bold";
    default:
      return "bg-panel text-muted border-line/40";
  }
}

function CompareColumn({
  product,
  onRemove,
}: {
  product: DbProduct | any;
  allProducts: (DbProduct | any)[];
  onRemove?: () => void;
}) {
  const imageUrl = product.image_url || product.imageUrl;
  const rawRetailerUrl = product.retailer_url || product.amazon_url || product.amazonUrl;
  const strengths = product.strengths || product.reasons_to_buy || product.reasonsToBuy || product.pros || [];
  const tradeOffs = product.trade_offs || product.reasons_not_to_buy || product.reasonsNotToBuy || product.cons || [];
  const finalTake = product.final_take || product.verdict;
  const isOutOfStock = Boolean(product.is_out_of_stock);

  return (
    <div className="flex flex-1 flex-col justify-between gap-6 p-5 sm:p-6 bg-paper border-2 border-line shadow-hard relative">
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          title="Remove from comparison"
          aria-label={`Remove ${product.title} from comparison`}
          className="absolute top-3 right-3 border-2 border-line bg-panel h-7 w-7 flex items-center justify-center font-mono text-xs font-bold text-muted hover:text-ink hover:bg-accent transition-colors"
        >
          ✕
        </button>
      )}

      <div className="space-y-4">
        {/* Header Badges */}
        <div>
          <div className="flex flex-wrap items-center gap-1.5 mb-2 pr-8">
            <span className="inline-flex items-center border border-line bg-panel px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider font-bold text-ink">
              {product.category || "Tech"}
            </span>
            {product.badge && (
              <span className="inline-flex items-center border border-line bg-accent px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider font-bold text-ink">
                {product.badge}
              </span>
            )}
            {isOutOfStock && (
              <span className="inline-flex items-center bg-red-600 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider font-bold text-white">
                Out of Stock
              </span>
            )}
          </div>

          <h3 className="font-display text-lg sm:text-xl font-bold leading-snug text-ink line-clamp-2">
            {product.title}
          </h3>

          <div className="mt-2 flex items-center gap-2">
            <span className="inline-block h-2 w-2 bg-accent" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted font-bold">
              Amazon In-Stock Listing
            </span>
          </div>
        </div>

        {/* Product Image */}
        <div className="flex h-48 sm:h-56 w-full items-center justify-center border-2 border-line bg-white p-3 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${product.title} Benchmark Review`}
              className="max-h-full max-w-full w-auto h-auto object-contain"
            />
          ) : (
            <span className="font-mono text-xs uppercase tracking-widest2 text-muted">
              {product.category || "Product"}
            </span>
          )}
        </div>

        {/* Anti-Regret Matrix (Qualitative Assessment) */}
        <div className="flex flex-col gap-2.5 border-2 border-line bg-panel p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-accent font-bold">
              Anti-Regret Matrix
            </span>
            <span className="font-mono text-[9px] text-muted uppercase">Qualitative</span>
          </div>

          <div className="space-y-2">
            {MATRIX_DIMENSIONS.map(({ key, label }) => {
              const val = product[key] as QualitativeRating | undefined | null;
              return (
                <div key={key} className="flex items-center justify-between border-b border-line/10 pb-1.5 last:border-b-0 last:pb-0">
                  <span className="font-mono text-[11px] text-ink font-semibold">
                    {label}
                  </span>
                  <span
                    className={`font-mono text-[10px] uppercase px-2 py-0.5 border ${getQualitativeBadgeClass(
                      val
                    )}`}
                  >
                    {val || "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strengths & Trade-offs Preview */}
        {(strengths.length > 0 || tradeOffs.length > 0) && (
          <div className="space-y-2 border-t border-line/15 pt-3">
            {strengths.length > 0 && (
              <div className="text-xs text-green-700 font-body">
                <span className="font-mono font-bold">PRO: </span>
                <span>{strengths[0]}</span>
              </div>
            )}
            {tradeOffs.length > 0 && (
              <div className="text-xs text-red-700 font-body">
                <span className="font-mono font-bold">CON: </span>
                <span>{tradeOffs[0]}</span>
              </div>
            )}
          </div>
        )}

        {/* Final Take / Verdict Summary */}
        {finalTake && (
          <div className="border border-line/20 bg-panel/60 p-3">
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted font-bold block mb-1">
              Final Take
            </span>
            <p className="font-body text-xs leading-relaxed text-ink line-clamp-3">
              {finalTake}
            </p>
          </div>
        )}
        {/* Actions: Read Full Research (Primary) & Outbound Amazon (Secondary) */}
        <div className="space-y-2 pt-2 border-t border-line/15">
          <a
            href={`/product/${product.slug || product.id}`}
            className="flex w-full items-center justify-center gap-2 border-2 border-line bg-paper px-4 py-2.5 font-mono text-xs uppercase tracking-widest2 font-bold text-ink shadow-hard-sm transition-all hover:bg-ink hover:text-paper"
          >
            Read Full Research →
          </a>

          <RetailerCTA
            url={rawRetailerUrl}
            productId={product.id}
            productTitle={product.title}
            isOutOfStock={isOutOfStock}
            variant="arena-button"
            label="Check Price ↗"
          />
        </div>
      </div>
    </div>
  );
}

function BattleModal({
  products,
  onClose,
  onRemove,
}: {
  products: (DbProduct | any)[];
  onClose: () => void;
  onRemove: (id: string) => void;
}) {
  const getGridColsClass = () => {
    switch (products.length) {
      case 1:
        return "grid-cols-1 max-w-xl";
      case 2:
        return "grid-cols-1 md:grid-cols-2 max-w-5xl";
      case 3:
        return "grid-cols-1 md:grid-cols-3 max-w-6xl";
      case 4:
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-7xl";
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col overflow-y-auto bg-ink/95 backdrop-blur-sm animate-reveal-up"
      role="dialog"
      aria-modal="true"
      aria-label="Multi-product comparison arena"
    >
      {/* Modal Sticky Top Bar */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between border-b-2 border-line bg-accent px-6 py-4 shadow-hard gap-3">
        <div className="flex items-center gap-2">
          <span className="font-display text-base sm:text-lg font-bold uppercase tracking-tight text-ink">
            HEAD-TO-HEAD COMPARISON ({products.length} PRODUCTS)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/compare?ids=${products.map((p) => p.id).join(",")}`}
            onClick={onClose}
            className="border-2 border-line bg-paper px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-ink hover:bg-ink hover:text-paper transition-colors shadow-hard-sm"
          >
            Open Full Comparison Page ↗
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="border-2 border-line bg-paper px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-ink hover:bg-ink hover:text-paper transition-colors shadow-hard-sm"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Multi-Column Comparison Grid */}
      <div className="container-page py-8 flex-1 mx-auto w-full">
        <div className={`grid gap-6 mx-auto ${getGridColsClass()}`}>
          {products.map((prod) => (
            <CompareColumn
              key={prod.id}
              product={prod}
              allProducts={products}
              onRemove={products.length > 1 ? () => onRemove(prod.id) : undefined}
            />
          ))}
        </div>

        {/* Affiliate Disclosure in Battle Modal */}
        <div className="mt-8 max-w-2xl mx-auto">
          <AffiliateDisclosure variant="compact" />
        </div>
      </div>
    </div>
  );
}

export default function CompareArena() {
  const { selected, remove, clear, canCompare, maxSlots } = useCompare();
  const [battleOpen, setBattleOpen] = useState(false);

  if (selected.length === 0) return null;

  return (
    <>
      {/* Floating Bottom Sticky Compare Bar */}
      <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
        <div className="flex w-full max-w-4xl flex-col gap-3 border-2 border-line bg-paper p-4 shadow-hard-lg sm:flex-row sm:items-center sm:justify-between animate-reveal-up">
          {/* Label & Counter */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="h-2.5 w-2.5 bg-accent inline-block" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-ink">
              Compare ({selected.length}/{maxSlots})
            </span>
          </div>

          {/* Selected Products Chips */}
          <div className="flex flex-1 flex-wrap gap-2 min-w-0 items-center">
            {selected.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-1.5 border-2 border-line bg-panel px-2.5 py-1 max-w-[200px]"
              >
                <span className="truncate font-mono text-xs font-bold text-ink">
                  {product.title}
                </span>
                <button
                  type="button"
                  onClick={() => remove(product.id)}
                  aria-label={`Remove ${product.title} from compare arena`}
                  className="shrink-0 font-mono text-xs text-muted hover:text-ink font-bold pl-1"
                >
                  ✕
                </button>
              </div>
            ))}

            {selected.length < maxSlots && (
              <span className="font-mono text-[11px] text-muted italic">
                + Add up to {maxSlots - selected.length} more
              </span>
            )}
          </div>

          {/* Actions: Compare Button & Clear */}
          <div className="flex items-center gap-2 shrink-0">
            {canCompare ? (
              <button
                type="button"
                onClick={() => setBattleOpen(true)}
                className="border-2 border-line bg-accent px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest2 text-ink shadow-hard-sm hover:bg-ink hover:text-paper transition-all"
              >
                COMPARE ({selected.length}) →
              </button>
            ) : (
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
                Pick 1 more to compare
              </span>
            )}

            <button
              type="button"
              onClick={clear}
              className="border border-line/40 px-2.5 py-2 font-mono text-[11px] uppercase tracking-wider text-muted hover:text-ink hover:border-line transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {battleOpen && selected.length >= 1 && (
        <BattleModal
          products={selected}
          onClose={() => setBattleOpen(false)}
          onRemove={(id) => {
            remove(id);
          }}
        />
      )}
    </>
  );
}
