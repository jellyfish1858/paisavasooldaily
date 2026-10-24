"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCompare, CompareProvider } from "@/components/CompareProvider";
import { fetchProductsAction } from "@/app/secure-admin-panel/actions";
import RetailerCTA from "@/components/RetailerCTA";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import type { DbProduct, QualitativeRating } from "@/utils/supabase/types";

const MATRIX_DIMENSIONS: { key: keyof DbProduct; label: string; desc: string }[] = [
  { key: "matrix_performance", label: "Performance", desc: "Speed, throughput, efficacy" },
  { key: "matrix_value", label: "Value for Money", desc: "Price vs capability ratio" },
  { key: "matrix_ease_of_use", label: "Ease of Use", desc: "Setup, daily workflow, ergonomics" },
  { key: "matrix_portability", label: "Portability", desc: "Footprint, weight, transport" },
  { key: "matrix_compatibility", label: "Compatibility", desc: "Standards compliance & ecosystem fit" },
  { key: "matrix_long_term_suitability", label: "Long-Term Suitability", desc: "Endurance & obsolescence risk" },
];

function stripProductMeta(text?: string | null): string {
  if (!text || typeof text !== "string") return "";
  return text.replace(/<!--\s*PRODUCT_META:\s*[\s\S]*?-->/gi, "").trim();
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
      return "bg-panel text-muted border-line/30 italic";
  }
}

function CompareContent() {
  const searchParams = useSearchParams();
  const { selected, add, remove, isSelected, maxSlots } = useCompare();
  const [allProducts, setAllProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all products from DB for lookup and selection
  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await fetchProductsAction();
        if (res.success && Array.isArray(res.data)) {
          setAllProducts(res.data as DbProduct[]);
        }
      } catch (err) {
        console.error("Error loading products for compare:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  // Sync URL query param `ids` with compare list on initial load
  useEffect(() => {
    const idsParam = searchParams.get("ids");
    if (idsParam && allProducts.length > 0) {
      const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
      ids.forEach((id) => {
        if (!isSelected(id)) {
          const match = allProducts.find((p) => p.id === id);
          if (match) add(match);
        }
      });
    }
  }, [searchParams, allProducts, isSelected, add]);

  // Active products being compared (from compare provider)
  const activeProducts = useMemo(() => {
    return selected.slice(0, 4);
  }, [selected]);

  return (
    <div className="container-page py-10 sm:py-16 max-w-6xl mx-auto space-y-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest2 text-muted">
          <li>
            <Link href="/" className="hover:text-ink transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li className="text-ink font-bold">Compare Products</li>
        </ol>
      </nav>

      {/* Comparison Header */}
      <header className="border-2 border-line bg-paper p-6 sm:p-10 shadow-hard space-y-3">
        <div className="inline-flex items-center gap-2 border-2 border-line bg-panel px-3 py-1 font-mono text-[11px] uppercase tracking-widest2 font-bold text-ink">
          <span className="h-2 w-2 bg-accent inline-block" />
          Side-by-Side Analysis
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-bold uppercase tracking-tight text-ink leading-tight">
          Compare Products
        </h1>
        <p className="font-body text-sm sm:text-base text-muted max-w-2xl leading-relaxed">
          Compare factors worth considering before buying. We benchmark qualitative Anti-Regret dimensions, technical specifications, and key trade-offs without declaring arbitrary winners.
        </p>
      </header>

      {/* Product Selection Controls */}
      <section aria-label="Product selector" className="border-2 border-line bg-panel p-5 sm:p-6 shadow-hard space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight text-ink">
              Selected for Comparison ({activeProducts.length}/{maxSlots})
            </h2>
            <p className="font-mono text-xs text-muted">
              Add between 2 and 4 products to compare specifications and trade-offs.
            </p>
          </div>

          {/* Catalog Quick-Add Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="add-product-select" className="sr-only">
              Add product to comparison
            </label>
            <select
              id="add-product-select"
              defaultValue=""
              onChange={(e) => {
                const id = e.target.value;
                if (id) {
                  const match = allProducts.find((p) => p.id === id);
                  if (match) add(match);
                  e.target.value = "";
                }
              }}
              disabled={activeProducts.length >= maxSlots}
              className="border-2 border-line bg-paper px-3 py-2 font-mono text-xs text-ink focus:border-accent focus:outline-none"
            >
              <option value="" disabled>
                + Add product from catalog...
              </option>
              {allProducts
                .filter((p) => !isSelected(p.id))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.category || "General"})
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Selected Product Badges / Remove Buttons */}
        {activeProducts.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-line/20">
            {activeProducts.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-2 border border-line bg-paper px-3 py-1 font-mono text-xs text-ink"
              >
                <span className="font-bold truncate max-w-[200px]">{p.title}</span>
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  aria-label={`Remove ${p.title} from comparison`}
                  className="text-muted hover:text-red-600 font-bold ml-1"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Empty State / Prompt */}
      {activeProducts.length === 0 ? (
        <div className="border-2 border-line bg-paper p-12 text-center shadow-hard space-y-4">
          <div className="mx-auto w-12 h-12 border-2 border-line bg-panel flex items-center justify-center font-display text-2xl font-bold text-accent">
            ⇄
          </div>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
            No Products Selected Yet
          </h2>
          <p className="font-mono text-xs text-muted max-w-md mx-auto leading-relaxed">
            Select products from the dropdown above, or click the &ldquo;+ Compare&rdquo; button on any product card in our catalog.
          </p>
          <div className="pt-2">
            <Link
              href="/#grid"
              className="inline-block border-2 border-line bg-ink text-paper px-6 py-2.5 font-mono text-xs uppercase tracking-widest2 font-bold shadow-hard-sm hover:bg-accent hover:text-ink transition-colors"
            >
              Browse Products Catalog →
            </Link>
          </div>
        </div>
      ) : (
        /* Side-by-Side Comparison Table */
        <div className="space-y-8">
          <div className="overflow-x-auto border-2 border-line bg-paper shadow-hard">
            <table className="w-full border-collapse text-left font-body text-xs sm:text-sm">
              <thead>
                <tr className="border-b-2 border-line bg-panel">
                  <th className="p-4 font-mono text-xs uppercase tracking-wider font-bold text-muted w-48 min-w-[180px] sticky left-0 bg-panel z-10 border-r-2 border-line">
                    Evaluation Factor
                  </th>
                  {activeProducts.map((p) => (
                    <th
                      key={p.id}
                      className="p-4 font-display text-sm sm:text-base font-bold uppercase text-ink min-w-[220px] max-w-[280px] align-top border-r border-line/20 last:border-r-0"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-[10px] text-muted uppercase font-bold tracking-wider">
                            {p.category || "General"}
                          </span>
                          <button
                            type="button"
                            onClick={() => remove(p.id)}
                            className="text-muted hover:text-red-600 text-xs font-mono font-bold"
                            title="Remove"
                          >
                            [Remove]
                          </button>
                        </div>
                        <div className="line-clamp-2 leading-snug">{p.title}</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-line/20">
                {/* 1. Visual Preview & Links */}
                <tr>
                  <td className="p-4 font-mono text-xs uppercase tracking-wider font-bold text-muted sticky left-0 bg-paper z-10 border-r-2 border-line">
                    Product Image & Link
                  </td>
                  {activeProducts.map((p) => (
                    <td key={p.id} className="p-4 align-top border-r border-line/20 last:border-r-0 space-y-3">
                      {p.image_url && (
                        <div className="aspect-video w-full max-w-[180px] border border-line bg-panel overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.image_url}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="space-y-1.5 pt-1">
                        <Link
                          href={`/product/${p.slug || p.id}`}
                          className="inline-block font-mono text-xs font-bold uppercase tracking-wider text-ink underline hover:text-accent"
                        >
                          Read Full Research Dossier →
                        </Link>
                        <RetailerCTA
                          url={p.retailer_url || p.amazon_url}
                          variant="arena-button"
                          label="Check Price ↗"
                          productId={p.id}
                          productTitle={p.title}
                        />
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 2. Quick Take / Summary */}
                <tr className="bg-panel/40">
                  <td className="p-4 font-mono text-xs uppercase tracking-wider font-bold text-muted sticky left-0 bg-panel z-10 border-r-2 border-line">
                    Quick Take
                  </td>
                  {activeProducts.map((p) => (
                    <td key={p.id} className="p-4 align-top border-r border-line/20 last:border-r-0 leading-relaxed text-ink/90">
                      {stripProductMeta(p.quick_take || p.description) || "Specifications-focused product evaluation."}
                    </td>
                  ))}
                </tr>

                {/* 3. Anti-Regret Matrix Section Header */}
                <tr className="bg-ink text-paper">
                  <td
                    colSpan={activeProducts.length + 1}
                    className="p-3 font-mono text-xs uppercase tracking-widest2 font-bold"
                  >
                    Anti-Regret Qualitative Matrix Breakdown
                  </td>
                </tr>

                {/* 4. Anti-Regret Dimensions (Rows) */}
                {MATRIX_DIMENSIONS.map((dim) => (
                  <tr key={dim.key} className="hover:bg-panel/30 transition-colors">
                    <td className="p-4 sticky left-0 bg-paper z-10 border-r-2 border-line space-y-0.5">
                      <div className="font-mono text-xs uppercase font-bold text-ink">
                        {dim.label}
                      </div>
                      <div className="font-mono text-[10px] text-muted">{dim.desc}</div>
                    </td>
                    {activeProducts.map((p) => {
                      const assessment = p[dim.key] as QualitativeRating | null | undefined;
                      return (
                        <td
                          key={p.id}
                          className="p-4 align-middle border-r border-line/20 last:border-r-0"
                        >
                          <span
                            className={`inline-block border px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider ${getQualitativeBadgeClass(
                              assessment
                            )}`}
                          >
                            {assessment || "Not Specified"}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* 5. Key Strengths Section */}
                <tr className="bg-ink text-paper">
                  <td
                    colSpan={activeProducts.length + 1}
                    className="p-3 font-mono text-xs uppercase tracking-widest2 font-bold"
                  >
                    Primary Strengths
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-xs uppercase tracking-wider font-bold text-muted sticky left-0 bg-paper z-10 border-r-2 border-line">
                    Noted Strengths
                  </td>
                  {activeProducts.map((p) => {
                    const strengths: string[] = Array.isArray(p.strengths)
                      ? p.strengths
                      : Array.isArray(p.reasons_to_buy)
                      ? (p.reasons_to_buy as string[])
                      : Array.isArray(p.pros)
                      ? (p.pros as string[])
                      : [];
                    return (
                      <td key={p.id} className="p-4 align-top border-r border-line/20 last:border-r-0">
                        {strengths.length > 0 ? (
                          <ul className="space-y-1.5">
                            {strengths.map((item: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-1.5 text-xs text-ink">
                                <span className="font-bold text-accent shrink-0">✓</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="font-mono text-xs text-muted italic">
                            Published in full dossier.
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 6. Honest Trade-Offs Section */}
                <tr className="bg-ink text-paper">
                  <td
                    colSpan={activeProducts.length + 1}
                    className="p-3 font-mono text-xs uppercase tracking-widest2 font-bold"
                  >
                    Trade-Offs & Limitations (Anti-Regret)
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-xs uppercase tracking-wider font-bold text-muted sticky left-0 bg-paper z-10 border-r-2 border-line">
                    Trade-Offs
                  </td>
                  {activeProducts.map((p) => {
                    const tradeOffs: string[] = Array.isArray(p.trade_offs)
                      ? p.trade_offs
                      : Array.isArray(p.reasons_not_to_buy)
                      ? (p.reasons_not_to_buy as string[])
                      : Array.isArray(p.cons)
                      ? (p.cons as string[])
                      : [];
                    return (
                      <td key={p.id} className="p-4 align-top border-r border-line/20 last:border-r-0">
                        {tradeOffs.length > 0 ? (
                          <ul className="space-y-1.5">
                            {tradeOffs.map((item: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-1.5 text-xs text-ink/90">
                                <span className="font-mono text-accent font-bold shrink-0">!</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="font-mono text-xs text-muted italic">
                            Published in full dossier.
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 7. Who Should Buy / Good For */}
                <tr className="bg-panel/40">
                  <td className="p-4 font-mono text-xs uppercase tracking-wider font-bold text-muted sticky left-0 bg-panel z-10 border-r-2 border-line">
                    Best Suited For
                  </td>
                  {activeProducts.map((p) => {
                    const goodFor: string[] = Array.isArray(p.good_for) ? p.good_for : [];
                    return (
                      <td key={p.id} className="p-4 align-top border-r border-line/20 last:border-r-0">
                        {goodFor.length > 0 ? (
                          <ul className="space-y-1 text-xs text-ink">
                            {goodFor.map((gf: string, idx: number) => (
                              <li key={idx}>• {gf}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="font-mono text-xs text-muted italic">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 8. Skip If / Pass If */}
                <tr>
                  <td className="p-4 font-mono text-xs uppercase tracking-wider font-bold text-muted sticky left-0 bg-paper z-10 border-r-2 border-line">
                    Skip If
                  </td>
                  {activeProducts.map((p) => {
                    const skipIf: string[] = Array.isArray(p.skip_if) ? p.skip_if : [];
                    return (
                      <td key={p.id} className="p-4 align-top border-r border-line/20 last:border-r-0">
                        {skipIf.length > 0 ? (
                          <ul className="space-y-1 text-xs text-ink/90">
                            {skipIf.map((si: string, idx: number) => (
                              <li key={idx}>• {si}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="font-mono text-xs text-muted italic">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Decision Framing Notice */}
          <section aria-labelledby="decision-notice-heading" className="border-2 border-line bg-panel p-6 sm:p-8 shadow-hard space-y-4">
            <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold block">
              Decision Support
            </span>
            <h2 id="decision-notice-heading" className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-ink">
              How to Interpret This Comparison
            </h2>
            <div className="space-y-3 font-body text-sm sm:text-base text-ink/90 leading-relaxed">
              <p>
                Each product compared above embodies deliberate engineering trade-offs. Rather than declaring an arbitrary &ldquo;winner,&rdquo; your decision should be dictated by your specific primary constraint:
              </p>
              <ul className="space-y-2 pt-1 font-mono text-xs sm:text-sm text-ink">
                {activeProducts.map((p) => (
                  <li key={p.id} className="border border-line/20 bg-paper p-3">
                    <strong>{stripProductMeta(p.title)}:</strong>{" "}
                    {stripProductMeta(
                      p.final_take ||
                      p.quick_take ||
                      p.description
                    ) || "Evaluated according to published technical specifications."}
                  </li>
                ))}
              </ul>
              <p className="font-mono text-xs text-muted pt-2 border-t border-line/10">
                We do not calculate composite score averages or rank products overall. Readers should evaluate dimensions according to their unique device ecosystem and travel demands.
              </p>
            </div>
          </section>

          {/* Affiliate Disclosure */}
          <AffiliateDisclosure />
        </div>
      )}
    </div>
  );
}

export default function CompareClient() {
  return (
    <CompareProvider>
      <Suspense
        fallback={
          <div className="container-page py-16 text-center font-mono text-xs text-muted animate-pulse">
            Loading comparison arena...
          </div>
        }
      >
        <CompareContent />
      </Suspense>
    </CompareProvider>
  );
}
