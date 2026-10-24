"use client";

import Link from "next/link";
import RetailerCTA from "@/components/RetailerCTA";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import { getCategoryForProduct } from "@/data/categories";
import type { DbProduct, QualitativeRating, ResearchSource } from "@/utils/supabase/types";

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="12" cy="12" r="10" stroke="#15803D" strokeWidth="1.75" />
      <path
        d="M8 12.5L10.5 15L16 9"
        stroke="#15803D"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="12" cy="12" r="10" stroke="#B91C1C" strokeWidth="1.75" />
      <path
        d="M9 9L15 15M15 9L9 15"
        stroke="#B91C1C"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatYoutubeEmbed(url?: string): string | null {
  if (!url) return null;
  if (url.includes("youtube.com/embed/")) return url;
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  return url;
}

function getMatrixBadgeClass(val?: QualitativeRating | null) {
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

function formatReviewedDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

function stripProductMeta(text?: string | null): string {
  if (!text || typeof text !== "string") return "";
  return text.replace(/<!--\s*PRODUCT_META:\s*[\s\S]*?-->/gi, "").trim();
}

export default function ReviewDetails({ product }: { product: DbProduct | any }) {
  const imageUrl = product.image_url || product.imageUrl;
  const rawRetailerUrl = product.retailer_url || product.amazon_url || product.amazonUrl;
  const videoUrl = formatYoutubeEmbed(product.video_url || product.videoUrl);

  const rawStrengths = product.strengths || product.reasons_to_buy || product.reasonsToBuy || product.pros || [];
  const rawTradeOffs = product.trade_offs || product.reasons_not_to_buy || product.reasonsNotToBuy || product.cons || [];
  const strengths = (Array.isArray(rawStrengths) ? rawStrengths : []).map((s: any) => stripProductMeta(String(s)));
  const tradeOffs = (Array.isArray(rawTradeOffs) ? rawTradeOffs : []).map((t: any) => stripProductMeta(String(t)));
  const goodFor = (Array.isArray(product.good_for) ? product.good_for : []).map((g: any) => stripProductMeta(String(g)));
  const skipIf = (Array.isArray(product.skip_if) ? product.skip_if : []).map((s: any) => stripProductMeta(String(s)));
  const whatToCheck = (Array.isArray(product.what_to_check) ? product.what_to_check : []).map((w: any) => stripProductMeta(String(w)));
  const keySpecs = product.key_specs || [];
  const finalTake = stripProductMeta(product.final_take || product.verdict);
  const quickTake = stripProductMeta(product.quick_take);
  const description = stripProductMeta(product.description);
  const researchBasis = stripProductMeta(product.research_basis);
  const badge = product.badge ? stripProductMeta(product.badge) : null;
  const isOutOfStock = Boolean(product.is_out_of_stock);
  const formattedLastReviewed = formatReviewedDate(product.last_reviewed_at);
  const matchedCategory = getCategoryForProduct(product.category);

  const matrixItems: { label: string; description: string; value?: QualitativeRating | null }[] = [
    {
      label: "Performance",
      description: "Speed, throughput, efficiency",
      value: product.matrix_performance,
    },
    {
      label: "Value for Money",
      description: "Price-to-capability ratio",
      value: product.matrix_value,
    },
    {
      label: "Ease of Use",
      description: "Setup, daily workflow, ergonomics",
      value: product.matrix_ease_of_use,
    },
    {
      label: "Portability",
      description: "Footprint, weight, travel convenience",
      value: product.matrix_portability,
    },
    {
      label: "Compatibility",
      description: "Ecosystem integration & standards",
      value: product.matrix_compatibility,
    },
    {
      label: "Long-Term Suitability",
      description: "Build endurance & obsolescence risk",
      value: product.matrix_long_term_suitability,
    },
  ];

  return (
    <article className="container-page py-10 sm:py-16 max-w-4xl mx-auto space-y-12 sm:space-y-16">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest2 text-muted">
          <li>
            <Link href="/" className="hover:text-ink transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link
              href={matchedCategory ? `/category/${matchedCategory.slug}` : "/category"}
              className="hover:text-ink transition-colors"
            >
              {matchedCategory ? matchedCategory.shortName : product.category || "General"}
            </Link>
          </li>
          <li>/</li>
          <li className="text-ink font-bold truncate max-w-[200px] sm:max-w-md">
            {product.title}
          </li>
        </ol>
      </nav>

      {/* Out-of-Stock Alert Banner */}
      {isOutOfStock && (
        <div
          role="status"
          className="border-2 border-red-700 bg-red-50 p-4 flex items-center justify-between font-mono text-xs text-red-800 shadow-hard-sm"
        >
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider">⚠️ Current Status:</span>
            <span>This product is currently reported out of stock on Amazon.</span>
          </div>
          <span className="font-bold uppercase tracking-widest">Unavailable</span>
        </div>
      )}

      {/* =========================================================================
          1. PRODUCT HERO
          ========================================================================= */}
      <section aria-labelledby="product-hero-heading" className="space-y-6">
        {/* Category & Badge Meta Row */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center border-2 border-line bg-panel px-3 py-1 font-mono text-[11px] uppercase tracking-widest2 font-bold text-ink">
            {product.category || "Curated Product"}
          </span>
          {badge && (
            <span className="inline-flex items-center border-2 border-line bg-accent px-3 py-1 font-mono text-[11px] uppercase tracking-widest2 font-bold text-ink shadow-hard-sm">
              {badge}
            </span>
          )}
          {isOutOfStock && (
            <span className="inline-flex items-center border-2 border-red-700 bg-red-600 px-3 py-1 font-mono text-[11px] uppercase tracking-widest2 font-bold text-white shadow-hard-sm">
              Out of Stock
            </span>
          )}
        </div>

        {/* Title */}
        <h1
          id="product-hero-heading"
          className="font-display text-3xl sm:text-5xl font-bold leading-[1.08] tracking-tight text-ink"
        >
          {product.title}
        </h1>

        {/* Short Description */}
        {description && (
          <p className="text-base leading-relaxed text-muted sm:text-lg">
            {description}
          </p>
        )}

        {/* Media Container: Overview Video or High-Res Image */}
        <div className="w-full border-2 border-line bg-white shadow-hard overflow-hidden">
          {videoUrl ? (
            <div className="aspect-video w-full">
              <iframe
                src={videoUrl}
                title={`${product.title} Overview Video`}
                className="h-full w-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : imageUrl ? (
            <div className="flex min-h-[300px] max-h-[520px] w-full items-center justify-center p-4 sm:p-8 bg-white">
              <img
                src={imageUrl}
                alt={`${product.title} - Product Overview`}
                className="max-h-[460px] w-auto max-w-full object-contain mx-auto transition-transform duration-300 hover:scale-[1.01]"
              />
            </div>
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 bg-panel text-muted">
              <span className="font-mono text-xs uppercase tracking-widest2">
                Product Image Not Currently Available
              </span>
            </div>
          )}
        </div>

        {/* Hero Amazon Action & Affiliate Disclosure */}
        <div className="border-2 border-line bg-panel p-5 sm:p-6 shadow-hard-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <RetailerCTA
              url={rawRetailerUrl}
              productId={product.id}
              productTitle={product.title}
              isOutOfStock={isOutOfStock}
              variant="hero"
              label="CHECK PRICE →"
            />

            <div className="text-right">
              <span className="font-mono text-[11px] text-muted block">
                Direct retailer link • Verification before checkout recommended
              </span>
            </div>
          </div>

          <AffiliateDisclosure variant="inline" className="border-t border-line/15 pt-3" />
        </div>
      </section>

      {/* =========================================================================
          2. QUICK TAKE
          ========================================================================= */}
      <section aria-labelledby="quick-take-heading" className="border-2 border-line bg-panel p-6 sm:p-8 shadow-hard">
        <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold block mb-2">
          Editorial Summary
        </span>
        <h2 id="quick-take-heading" className="font-display text-2xl font-bold uppercase tracking-tight text-ink mb-4">
          Quick Take
        </h2>
        {quickTake ? (
          <p className="font-display text-lg sm:text-xl font-bold leading-snug text-ink">
            {quickTake}
          </p>
        ) : (
          <p className="font-mono text-xs text-muted italic">
            Quick take summary is currently being synthesized for this product.
          </p>
        )}
      </section>

      {/* =========================================================================
          3. KEY SPECIFICATIONS
          ========================================================================= */}
      <section aria-labelledby="key-specs-heading" className="border-2 border-line bg-panel p-6 sm:p-8 shadow-hard">
        <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold block mb-2">
          Verified Characteristics
        </span>
        <h2 id="key-specs-heading" className="font-display text-2xl font-bold uppercase tracking-tight text-ink mb-4">
          Key Specifications
        </h2>
        {keySpecs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {keySpecs.map((spec: string, i: number) => (
              <div
                key={i}
                className="border border-line bg-paper px-4 py-3 font-mono text-xs text-ink flex items-center justify-between"
              >
                <span>{spec}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-line bg-paper p-4 font-mono text-xs text-muted">
            Specification verification in progress. Refer to official manufacturer documentation for unconfirmed parameters.
          </div>
        )}
      </section>

      {/* =========================================================================
          4. STRENGTHS
          ========================================================================= */}
      <section aria-labelledby="strengths-heading" className="border-2 border-line bg-paper shadow-hard overflow-hidden">
        <div className="flex items-center gap-2 border-b-2 border-line bg-green-50 px-6 py-4">
          <CheckIcon />
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest2 font-bold text-green-900 block">
              Editorial Findings
            </span>
            <h2 id="strengths-heading" className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-green-900">
              Why It Stands Out
            </h2>
          </div>
        </div>
        <ul>
          {strengths.length > 0 ? (
            strengths.map((item: string, i: number) => (
              <li
                key={i}
                className="flex items-start gap-3 border-b border-line/15 px-6 py-4 last:border-b-0"
              >
                <CheckIcon />
                <span className="text-sm sm:text-base leading-relaxed text-ink">{item}</span>
              </li>
            ))
          ) : (
            <li className="px-6 py-4 font-mono text-xs text-muted">
              Primary strengths are currently being evaluated based on available research.
            </li>
          )}
        </ul>
      </section>

      {/* =========================================================================
          5. TRADE-OFFS
          ========================================================================= */}
      <section aria-labelledby="trade-offs-heading" className="border-2 border-line bg-paper shadow-hard overflow-hidden">
        <div className="flex items-center gap-2 border-b-2 border-line bg-red-50 px-6 py-4">
          <CrossIcon />
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest2 font-bold text-red-900 block">
              Legitimate Compromises
            </span>
            <h2 id="trade-offs-heading" className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-red-900">
              Trade-offs to Consider
            </h2>
          </div>
        </div>
        <ul>
          {tradeOffs.length > 0 ? (
            tradeOffs.map((item: string, i: number) => (
              <li
                key={i}
                className="flex items-start gap-3 border-b border-line/15 px-6 py-4 last:border-b-0"
              >
                <CrossIcon />
                <span className="text-sm sm:text-base leading-relaxed text-ink">{item}</span>
              </li>
            ))
          ) : (
            <li className="px-6 py-4 font-mono text-xs text-muted">
              Trade-off analysis is being compiled from published user reports and specifications.
            </li>
          )}
        </ul>
      </section>

      {/* =========================================================================
          6. GOOD FOR
          ========================================================================= */}
      <section aria-labelledby="good-for-heading" className="border-2 border-line bg-panel p-6 sm:p-8 shadow-hard">
        <span className="font-mono text-[11px] uppercase tracking-widest2 text-green-800 font-bold block mb-1">
          Target Audience & Use Cases
        </span>
        <h2 id="good-for-heading" className="font-display text-2xl font-bold uppercase tracking-tight text-ink mb-4">
          Good For
        </h2>
        {goodFor.length > 0 ? (
          <ul className="space-y-2.5">
            {goodFor.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5 text-sm sm:text-base text-ink">
                <span className="font-bold text-green-700 shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-mono text-xs text-muted italic">
            Specific buyer profile recommendations are currently in editorial synthesis.
          </p>
        )}
      </section>

      {/* =========================================================================
          7. SKIP IF
          ========================================================================= */}
      <section aria-labelledby="skip-if-heading" className="border-2 border-line bg-panel p-6 sm:p-8 shadow-hard">
        <span className="font-mono text-[11px] uppercase tracking-widest2 text-red-800 font-bold block mb-1">
          Alternative Considerations
        </span>
        <h2 id="skip-if-heading" className="font-display text-2xl font-bold uppercase tracking-tight text-ink mb-4">
          Skip If
        </h2>
        {skipIf.length > 0 ? (
          <ul className="space-y-2.5">
            {skipIf.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5 text-sm sm:text-base text-ink">
                <span className="font-bold text-red-700 shrink-0">✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-mono text-xs text-muted italic">
            No critical disqualifiers identified in preliminary review; verify individual requirements.
          </p>
        )}
      </section>

      {/* =========================================================================
          8. WHAT TO CHECK BEFORE BUYING
          ========================================================================= */}
      <section aria-labelledby="what-to-check-heading" className="border-2 border-line bg-panel p-6 sm:p-8 shadow-hard">
        <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold block mb-1">
          Pre-Purchase Verification
        </span>
        <h2 id="what-to-check-heading" className="font-display text-2xl font-bold uppercase tracking-tight text-ink mb-4">
          What to Check Before Buying
        </h2>
        {whatToCheck.length > 0 ? (
          <ul className="space-y-2.5">
            {whatToCheck.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5 text-sm sm:text-base text-ink">
                <span className="font-bold text-accent shrink-0">🔍</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-mono text-xs text-muted italic">
            Check device compatibility, charging standard requirements, and return policies before purchasing.
          </p>
        )}
      </section>

      {/* =========================================================================
          9. ANTI-REGRET MATRIX
          ========================================================================= */}
      <section aria-labelledby="matrix-heading" className="border-2 border-line bg-panel p-6 sm:p-8 shadow-hard">
        <div className="border-b-2 border-line pb-4 mb-6">
          <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold block">
            Qualitative Decision Framework
          </span>
          <h2 id="matrix-heading" className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-ink mt-1">
            Anti-Regret Matrix
          </h2>
          <p className="font-body text-xs sm:text-sm text-muted mt-2 leading-relaxed">
            The Anti-Regret Matrix highlights the factors that may matter most when deciding whether this product fits your needs. Each assessment represents an editorial analysis based on published specifications and comparison research.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {matrixItems.map(({ label, description, value }) => (
            <div key={label} className="border-2 border-line bg-paper p-4 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-muted block">
                  {label}
                </span>
                <span className="font-body text-xs text-muted/80 mt-1 block">
                  {description}
                </span>
              </div>
              <div className="mt-4 pt-3 border-t border-line/15 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-ink">Assessment:</span>
                {value ? (
                  <span className={`font-mono text-xs font-bold uppercase px-2.5 py-1 border ${getMatrixBadgeClass(value)}`}>
                    {value}
                  </span>
                ) : (
                  <span className="font-mono text-xs text-muted italic">Pending evaluation</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          10. RESEARCH BASIS
          ========================================================================= */}
      <section aria-labelledby="research-basis-heading" className="border-2 border-line bg-paper p-6 sm:p-8 shadow-hard">
        <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold block mb-1">
          Methodology & Transparency
        </span>
        <h2 id="research-basis-heading" className="font-display text-2xl font-bold uppercase tracking-tight text-ink mb-3">
          Research Basis
        </h2>
        <p className="font-body text-sm sm:text-base text-ink/90 leading-relaxed">
          {researchBasis ||
            "Information synthesized from official manufacturer specifications, technical documentation, published ecosystem compatibility standards, and comparative product data."}
        </p>
      </section>

      {/* =========================================================================
          11. RESEARCH SOURCES
          ========================================================================= */}
      <section aria-labelledby="research-sources-heading" className="border-2 border-line bg-panel p-6 sm:p-8 shadow-hard">
        <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold block mb-1">
          Citations & References
        </span>
        <h2 id="research-sources-heading" className="font-display text-2xl font-bold uppercase tracking-tight text-ink mb-4">
          Research Sources
        </h2>
        {product.research_sources && product.research_sources.length > 0 ? (
          <ul className="space-y-2">
            {product.research_sources.map((src: ResearchSource, i: number) => (
              <li key={i} className="font-mono text-xs sm:text-sm">
                {src.url ? (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-accent underline hover:text-ink transition-colors"
                  >
                    {src.title} ↗
                  </a>
                ) : (
                  <span className="text-ink">{src.title}</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-mono text-xs text-muted italic">
            Research sources are being expanded for this product.
          </p>
        )}
      </section>

      {/* =========================================================================
          12. LAST REVIEWED
          ========================================================================= */}
      <section aria-labelledby="last-reviewed-heading" className="border-2 border-line bg-paper p-5 sm:p-6 shadow-hard-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-muted font-bold block">
              Editorial Timeline
            </span>
            <h2 id="last-reviewed-heading" className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-ink">
              Last Reviewed
            </h2>
          </div>
          <div className="font-mono text-xs sm:text-sm text-ink">
            {formattedLastReviewed ? (
              <span>Reviewed on {formattedLastReviewed}</span>
            ) : (
              <span className="text-muted italic">Review date not yet recorded.</span>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          13. FINAL TAKE
          ========================================================================= */}
      <section aria-labelledby="final-take-heading" className="border-2 border-line bg-ink p-6 sm:p-8 shadow-hard text-paper">
        <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold block mb-2">
          Editorial Conclusion
        </span>
        <h2 id="final-take-heading" className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-paper mb-4">
          Final Take
        </h2>
        {finalTake ? (
          <p className="font-display text-lg sm:text-xl leading-relaxed text-paper/95 font-medium">
            {finalTake}
          </p>
        ) : (
          <p className="font-mono text-xs text-paper/70 italic">
            Editorial conclusion is being finalized based on comprehensive comparison research.
          </p>
        )}
      </section>

      {/* Internal Decision Support Pathway */}
      <section
        aria-label="Related Decision Guides and Comparisons"
        className="border-2 border-line bg-panel p-5 sm:p-6 shadow-hard-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-accent">
            Decision Support & Context
          </span>
          <h3 className="font-display text-base sm:text-lg font-bold uppercase text-ink">
            Need broader context before deciding?
          </h3>
          <p className="font-body text-xs text-muted">
            Read our in-depth category buying guides or benchmark this model side-by-side with alternatives.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {matchedCategory && (
            <Link
              href={`/category/${matchedCategory.slug}`}
              className="border-2 border-line bg-paper px-4 py-2 font-mono text-xs uppercase tracking-wider font-bold text-ink hover:bg-ink hover:text-paper transition-all"
            >
              {matchedCategory.shortName} Hub →
            </Link>
          )}
          <Link
            href="/guides"
            className="border-2 border-line bg-paper px-4 py-2 font-mono text-xs uppercase tracking-wider font-bold text-ink hover:bg-ink hover:text-paper transition-all"
          >
            Browse Guides →
          </Link>
          <Link
            href={`/compare?ids=${product.id}`}
            className="border-2 border-line bg-accent px-4 py-2 font-mono text-xs uppercase tracking-wider font-bold text-ink hover:bg-ink hover:text-paper transition-all"
          >
            Compare Model →
          </Link>
        </div>
      </section>

      {/* =========================================================================
          14. AMAZON CTA & AFFILIATE DISCLOSURE
          ========================================================================= */}
      <section aria-labelledby="cta-heading" className="space-y-4">
        <RetailerCTA
          url={rawRetailerUrl}
          productId={product.id}
          productTitle={product.title}
          isOutOfStock={isOutOfStock}
          variant="banner-large"
          label="CHECK RETAILER PRICE →"
        />

        {/* Mandatory Amazon Associate Disclosure */}
        <AffiliateDisclosure />
      </section>
    </article>
  );
}
