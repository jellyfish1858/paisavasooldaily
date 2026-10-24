"use client";

import { useState, type FormEvent } from "react";
import { updateProductAction } from "@/app/secure-admin-panel/actions";
import type { DbProduct, QualitativeRating, ResearchSource } from "@/utils/supabase/types";
import { extractRetailerDomain } from "@/config/affiliate";

interface EditProductModalProps {
  product: DbProduct;
  onClose: () => void;
  onUpdated: (updatedProduct: DbProduct) => void;
  onError: (msg: string) => void;
}

const QUALITATIVE_OPTIONS: { label: string; value: "" | QualitativeRating }[] = [
  { label: "— Not Assessed / Pending Research —", value: "" },
  { label: "Strong (Clear Advantage / High Reliability)", value: "Strong" },
  { label: "Good (Solid Above-Average Performer)", value: "Good" },
  { label: "Fair (Acceptable with Trade-Offs)", value: "Fair" },
  { label: "Depends (Context / User Dependent)", value: "Depends" },
  { label: "Limited (Notable Constraint / Weakness)", value: "Limited" },
];

const inputClasses =
  "w-full border-2 border-line bg-paper px-4 py-2.5 text-sm text-ink font-body focus:border-accent focus:bg-white focus:outline-none transition-colors";

const selectClasses =
  "w-full border-2 border-line bg-paper px-4 py-2 text-sm text-ink font-body focus:border-accent focus:bg-white focus:outline-none transition-colors";

function toMultilineText(val: any): string {
  if (Array.isArray(val)) return val.join("\n");
  if (typeof val === "string") return val;
  if (val && typeof val === "object") {
    return Object.entries(val)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
  }
  return "";
}

function stripProductMeta(text?: string | null): string {
  if (!text || typeof text !== "string") return "";
  return text.replace(/<!--\s*PRODUCT_META:\s*[\s\S]*?-->/gi, "").trim();
}

export default function EditProductModal({
  product,
  onClose,
  onUpdated,
  onError,
}: EditProductModalProps) {
  // Basic Information
  const [title, setTitle] = useState(stripProductMeta(product.title) || "");
  const [slug, setSlug] = useState(product.slug || "");
  const [category, setCategory] = useState(product.category || "Travel");
  const [badge, setBadge] = useState(stripProductMeta(product.badge) || "");
  const [imageUrl, setImageUrl] = useState(product.image_url || "");
  const [videoUrl, setVideoUrl] = useState(product.video_url || "");
  const [retailerUrl, setRetailerUrl] = useState(product.retailer_url || product.amazon_url || "");
  const [description, setDescription] = useState(stripProductMeta(product.description) || "");
  const [isOutOfStock, setIsOutOfStock] = useState(Boolean(product.is_out_of_stock));

  // Decision Information
  const [quickTake, setQuickTake] = useState(stripProductMeta(product.quick_take || product.description) || "");
  const [finalTake, setFinalTake] = useState(
    stripProductMeta(product.final_take || product.verdict) || ""
  );
  const [keySpecsRaw, setKeySpecsRaw] = useState(() => toMultilineText(product.key_specs));
  const [strengthsRaw, setStrengthsRaw] = useState(() =>
    toMultilineText((product.strengths || product.reasons_to_buy || product.pros || []).map((s: any) => stripProductMeta(String(s))))
  );
  const [tradeOffsRaw, setTradeOffsRaw] = useState(() =>
    toMultilineText((product.trade_offs || product.reasons_not_to_buy || product.cons || []).map((t: any) => stripProductMeta(String(t))))
  );
  const [goodForRaw, setGoodForRaw] = useState(() => toMultilineText((Array.isArray(product.good_for) ? product.good_for : []).map((g: any) => stripProductMeta(String(g)))));
  const [skipIfRaw, setSkipIfRaw] = useState(() => toMultilineText((Array.isArray(product.skip_if) ? product.skip_if : []).map((s: any) => stripProductMeta(String(s)))));
  const [whatToCheckRaw, setWhatToCheckRaw] = useState(() => toMultilineText((Array.isArray(product.what_to_check) ? product.what_to_check : []).map((w: any) => stripProductMeta(String(w)))));

  // Qualitative Anti-Regret Matrix
  const [matrixPerformance, setMatrixPerformance] = useState<"" | QualitativeRating>(
    product.matrix_performance || ""
  );
  const [matrixValue, setMatrixValue] = useState<"" | QualitativeRating>(
    product.matrix_value || ""
  );
  const [matrixEaseOfUse, setMatrixEaseOfUse] = useState<"" | QualitativeRating>(
    product.matrix_ease_of_use || ""
  );
  const [matrixPortability, setMatrixPortability] = useState<"" | QualitativeRating>(
    product.matrix_portability || ""
  );
  const [matrixCompatibility, setMatrixCompatibility] = useState<"" | QualitativeRating>(
    product.matrix_compatibility || ""
  );
  const [matrixLongTermSuitability, setMatrixLongTermSuitability] = useState<"" | QualitativeRating>(
    product.matrix_long_term_suitability || ""
  );

  // Research
  const [researchBasis, setResearchBasis] = useState(product.research_basis || "");
  const [researchSourcesRaw, setResearchSourcesRaw] = useState(
    (product.research_sources || [])
      .map((s: any) =>
        typeof s === "string" ? s : s.url ? `${s.title} | ${s.url}` : s.title
      )
      .join("\n")
  );
  const [lastReviewedAt, setLastReviewedAt] = useState(
    product.last_reviewed_at ? product.last_reviewed_at.split("T")[0] : ""
  );

  const [saving, setSaving] = useState(false);

  const parseLines = (raw: string): string[] =>
    raw
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);

  const parseSources = (raw: string): ResearchSource[] => {
    return raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        if (line.includes("|")) {
          const [sTitle, sUrl] = line.split("|").map((s) => s.trim());
          return { title: sTitle, url: sUrl };
        }
        return {
          title: line,
          url: line.startsWith("http") ? line : undefined,
        };
      });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const strengthsList = parseLines(strengthsRaw);
    const tradeOffsList = parseLines(tradeOffsRaw);
    const finalTakeText = finalTake.trim();

    const payload: Partial<DbProduct> = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      category: category.trim(),
      badge: badge.trim() || undefined,
      description: description.trim(),
      image_url: imageUrl.trim(),
      video_url: videoUrl.trim() || undefined,
      retailer_url: retailerUrl.trim(),
      retailer_domain: extractRetailerDomain(retailerUrl),
      amazon_url: retailerUrl.trim(),
      is_out_of_stock: isOutOfStock,

      quick_take: quickTake.trim() || undefined,
      key_specs: parseLines(keySpecsRaw),
      strengths: strengthsList,
      trade_offs: tradeOffsList,
      good_for: parseLines(goodForRaw),
      skip_if: parseLines(skipIfRaw),
      what_to_check: parseLines(whatToCheckRaw),
      final_take: finalTakeText || undefined,

      matrix_performance: matrixPerformance || null,
      matrix_value: matrixValue || null,
      matrix_ease_of_use: matrixEaseOfUse || null,
      matrix_portability: matrixPortability || null,
      matrix_compatibility: matrixCompatibility || null,
      matrix_long_term_suitability: matrixLongTermSuitability || null,

      research_basis: researchBasis.trim() || undefined,
      research_sources: parseSources(researchSourcesRaw),
      last_reviewed_at: lastReviewedAt ? new Date(lastReviewedAt).toISOString() : null,
    };

    const res = await updateProductAction(product.id, payload);
    setSaving(false);

    if (!res.success) {
      onError(res.error || "Failed to update product.");
      return;
    }

    onUpdated(res.data as DbProduct);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/80 p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto border-2 border-line bg-paper shadow-hard animate-reveal-up">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-line bg-panel px-6 py-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-accent font-bold">
              Editing Product: ID #{product.id.slice(0, 8)}
            </span>
            <h3 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
              {product.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="border-2 border-line bg-paper h-8 w-8 flex items-center justify-center font-mono text-sm font-bold text-muted hover:text-ink hover:bg-accent transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* SECTION 1: BASIC INFORMATION */}
          <div className="space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest font-bold text-accent block border-b border-line/20 pb-1">
              1. Basic Information
            </span>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                  Product Title
                </label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                  Slug
                </label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                  Category
                </label>
                <input
                  required
                  list="edit-category-suggestions"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={inputClasses}
                />
                <datalist id="edit-category-suggestions">
                  <option value="Travel" />
                  <option value="Beauty & Personal Care" />
                  <option value="Electronics & Tech Accessories" />
                </datalist>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                  Badge Label
                </label>
                <input
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOutOfStock}
                    onChange={(e) => setIsOutOfStock(e.target.checked)}
                    className="h-4 w-4 rounded border-line text-ink focus:ring-accent"
                  />
                  <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-ink">
                    Mark Out of Stock
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                  Image URL
                </label>
                <input
                  required
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                  Retailer URL {retailerUrl ? `(Domain: ${extractRetailerDomain(retailerUrl)})` : ""}
                </label>
                <input
                  required
                  type="url"
                  placeholder="https://... Amazon, Flipkart, Snapdeal, or other retailer"
                  value={retailerUrl}
                  onChange={(e) => setRetailerUrl(e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                  Video Embed URL (Optional)
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                  Short Description / Excerpt
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: DECISION INFORMATION */}
          <div className="space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest font-bold text-accent block border-b border-line/20 pb-1">
              2. Decision Information
            </span>

            <div>
              <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                Quick Take (20-30 word upfront summary)
              </label>
              <textarea
                rows={2}
                value={quickTake}
                onChange={(e) => setQuickTake(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                  Strengths (One per line)
                </label>
                <textarea
                  rows={3}
                  value={strengthsRaw}
                  onChange={(e) => setStrengthsRaw(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                  Trade-offs (One per line)
                </label>
                <textarea
                  rows={3}
                  value={tradeOffsRaw}
                  onChange={(e) => setTradeOffsRaw(e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                  Good For (One per line)
                </label>
                <textarea
                  rows={3}
                  value={goodForRaw}
                  onChange={(e) => setGoodForRaw(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                  Skip If (One per line)
                </label>
                <textarea
                  rows={3}
                  value={skipIfRaw}
                  onChange={(e) => setSkipIfRaw(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                  What to Check (One per line)
                </label>
                <textarea
                  rows={3}
                  value={whatToCheckRaw}
                  onChange={(e) => setWhatToCheckRaw(e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                  Key Specifications (One per line)
                </label>
                <textarea
                  rows={3}
                  value={keySpecsRaw}
                  onChange={(e) => setKeySpecsRaw(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                  Final Take / Target Profile
                </label>
                <textarea
                  rows={3}
                  value={finalTake}
                  onChange={(e) => setFinalTake(e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: ANTI-REGRET MATRIX (QUALITATIVE) */}
          <div className="space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest font-bold text-accent block border-b border-line/20 pb-1">
              3. Anti-Regret Matrix (Qualitative Assessment Only)
            </span>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block font-mono text-[10px] uppercase font-bold mb-1">Performance</label>
                <select
                  value={matrixPerformance}
                  onChange={(e) => setMatrixPerformance(e.target.value as any)}
                  className={selectClasses}
                >
                  {QUALITATIVE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase font-bold mb-1">Value for Money</label>
                <select
                  value={matrixValue}
                  onChange={(e) => setMatrixValue(e.target.value as any)}
                  className={selectClasses}
                >
                  {QUALITATIVE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase font-bold mb-1">Ease of Use</label>
                <select
                  value={matrixEaseOfUse}
                  onChange={(e) => setMatrixEaseOfUse(e.target.value as any)}
                  className={selectClasses}
                >
                  {QUALITATIVE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase font-bold mb-1">Portability</label>
                <select
                  value={matrixPortability}
                  onChange={(e) => setMatrixPortability(e.target.value as any)}
                  className={selectClasses}
                >
                  {QUALITATIVE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase font-bold mb-1">Compatibility</label>
                <select
                  value={matrixCompatibility}
                  onChange={(e) => setMatrixCompatibility(e.target.value as any)}
                  className={selectClasses}
                >
                  {QUALITATIVE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase font-bold mb-1">Long-Term Suitability</label>
                <select
                  value={matrixLongTermSuitability}
                  onChange={(e) => setMatrixLongTermSuitability(e.target.value as any)}
                  className={selectClasses}
                >
                  {QUALITATIVE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: RESEARCH & EDITORIAL RIGOR */}
          <div className="space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest font-bold text-accent block border-b border-line/20 pb-1">
              4. Research & Editorial Rigor
            </span>

            <div>
              <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                Research Basis
              </label>
              <textarea
                rows={2}
                value={researchBasis}
                onChange={(e) => setResearchBasis(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                  Research Sources (Source | URL, one per line)
                </label>
                <textarea
                  rows={3}
                  value={researchSourcesRaw}
                  onChange={(e) => setResearchSourcesRaw(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                  Last Reviewed Date
                </label>
                <input
                  type="date"
                  value={lastReviewedAt}
                  onChange={(e) => setLastReviewedAt(e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-line">
            <button
              type="button"
              onClick={onClose}
              className="border-2 border-line bg-paper px-5 py-3 font-mono text-xs uppercase tracking-widest font-bold hover:bg-panel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="border-2 border-line bg-accent px-6 py-3 font-mono text-xs uppercase tracking-widest font-bold text-ink shadow-hard-sm hover:bg-ink hover:text-paper transition-all disabled:opacity-50"
            >
              {saving ? "Saving Changes…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
