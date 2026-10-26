"use client";

import { useState, type FormEvent } from "react";
import { updateProductAction } from "@/app/secure-admin-panel/actions";
import type { DbProduct, QualitativeRating, ResearchSource } from "@/utils/supabase/types";
import { extractRetailerDomain } from "@/config/affiliate";
import { isValidYouTubeUrl } from "@/lib/validation";

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
  const [youtubeUrl, setYoutubeUrl] = useState(product.youtube_url || product.video_url || "");
  const [retailerUrl, setRetailerUrl] = useState(product.retailer_url || product.amazon_url || "");
  const [description, setDescription] = useState(stripProductMeta(product.description) || "");
  const [isOutOfStock, setIsOutOfStock] = useState(Boolean(product.is_out_of_stock));

  // Decision Information
  const [quickTake, setQuickTake] = useState(stripProductMeta(product.quick_take || product.description) || "");
  const [finalTake, setFinalTake] = useState(
    stripProductMeta(product.final_take || product.verdict) || ""
  );

  // Repeatable Pros
  const [pros, setPros] = useState<string[]>(() => {
    const list = product.pros || product.strengths || product.reasons_to_buy;
    if (Array.isArray(list) && list.length > 0) {
      const cleaned = list.map((s: any) => stripProductMeta(String(s))).filter(Boolean);
      return cleaned.length > 0 ? cleaned : [""];
    }
    return [""];
  });

  // Repeatable Cons
  const [cons, setCons] = useState<string[]>(() => {
    const list = product.cons || product.trade_offs || product.reasons_not_to_buy;
    if (Array.isArray(list) && list.length > 0) {
      const cleaned = list.map((t: any) => stripProductMeta(String(t))).filter(Boolean);
      return cleaned.length > 0 ? cleaned : [""];
    }
    return [""];
  });

  // Repeatable Key Specs
  const [keySpecs, setKeySpecs] = useState<Array<{ key: string; value: string }>>(() => {
    if (Array.isArray(product.key_specs) && product.key_specs.length > 0) {
      return product.key_specs.map((item: any) => {
        if (typeof item === "string") {
          const colonIdx = item.indexOf(":");
          if (colonIdx > 0) {
            return { key: item.slice(0, colonIdx).trim(), value: item.slice(colonIdx + 1).trim() };
          }
          return { key: item.trim(), value: "" };
        }
        if (item && typeof item === "object") {
          const entries = Object.entries(item);
          if (entries.length > 0) return { key: String(entries[0][0]), value: String(entries[0][1]) };
        }
        return { key: String(item), value: "" };
      });
    }
    if (product.key_specs && typeof product.key_specs === "object") {
      const entries = Object.entries(product.key_specs);
      if (entries.length > 0) {
        return entries.map(([k, v]) => ({ key: String(k), value: String(v) }));
      }
    }
    return [{ key: "", value: "" }];
  });

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

  // Pros Handlers
  const handleProChange = (index: number, val: string) => {
    setPros((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };
  const addPro = () => setPros((prev) => [...prev, ""]);
  const removePro = (index: number) =>
    setPros((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : [""]));

  // Cons Handlers
  const handleConChange = (index: number, val: string) => {
    setCons((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };
  const addCon = () => setCons((prev) => [...prev, ""]);
  const removeCon = (index: number) =>
    setCons((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : [""]));

  // Key Specs Handlers
  const handleSpecChange = (index: number, field: "key" | "value", val: string) => {
    setKeySpecs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };
  const addSpec = () => setKeySpecs((prev) => [...prev, { key: "", value: "" }]);
  const removeSpec = (index: number) =>
    setKeySpecs((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : [{ key: "", value: "" }]));

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

  const isYouTubeValid = isValidYouTubeUrl(youtubeUrl);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;

    if (!isValidYouTubeUrl(youtubeUrl)) {
      onError("Please enter a valid YouTube URL (youtube.com or youtu.be)");
      return;
    }

    setSaving(true);

    const strengthsList = pros.map((p) => p.trim()).filter(Boolean);
    const tradeOffsList = cons.map((c) => c.trim()).filter(Boolean);
    const finalTakeText = finalTake.trim();
    const serializedKeySpecs = keySpecs
      .filter((s) => s.key.trim() || s.value.trim())
      .map((s) => (s.value.trim() ? `${s.key.trim()}: ${s.value.trim()}` : s.key.trim()));

    const payload: Partial<DbProduct> = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      category: category.trim(),
      badge: badge.trim() || undefined,
      description: description.trim(),
      image_url: imageUrl.trim(),
      youtube_url: youtubeUrl.trim() || undefined,
      video_url: youtubeUrl.trim() || undefined,
      retailer_url: retailerUrl.trim(),
      retailer_domain: extractRetailerDomain(retailerUrl),
      amazon_url: retailerUrl.trim(),
      is_out_of_stock: isOutOfStock,

      quick_take: quickTake.trim() || undefined,
      key_specs: serializedKeySpecs,
      strengths: strengthsList,
      trade_offs: tradeOffsList,
      pros: strengthsList,
      cons: tradeOffsList,
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

    try {
      const res = await updateProductAction(product.id, payload);
      setSaving(false);

      if (!res.success) {
        onError(res.error || "Failed to update product.");
        return;
      }

      onUpdated(res.data as DbProduct);
      onClose();
    } catch (err: any) {
      setSaving(false);
      onError(err?.message || "An unexpected error occurred while updating product.");
    }
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
                  Product Title (Required)
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
                  Category (Required)
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
                  Image URL (Required)
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
                  Retailer URL {retailerUrl ? `(Domain: ${extractRetailerDomain(retailerUrl)})` : ""} (Required)
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-start">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                  YouTube Video URL (optional)
                </label>
                <span className="font-mono text-[10px] text-muted block mb-1">
                  Add a YouTube product review, demo, or buying guide.
                </span>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className={`${inputClasses} ${!isYouTubeValid ? "border-red-500 focus:border-red-600" : ""}`}
                />
                {!isYouTubeValid && (
                  <p className="mt-1 font-mono text-[11px] text-red-600 font-bold">
                    Please enter a valid YouTube URL (youtube.com or youtu.be)
                  </p>
                )}
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                  Description (Required)
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
                Quick Take (Required upfront summary)
              </label>
              <textarea
                rows={2}
                required
                value={quickTake}
                onChange={(e) => setQuickTake(e.target.value)}
                className={inputClasses}
              />
            </div>

            {/* Repeatable Pros & Cons */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="border border-line/20 bg-panel/30 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-widest font-bold text-ink">
                    Pros (repeatable list)
                  </span>
                  <button
                    type="button"
                    onClick={addPro}
                    className="border border-line bg-paper px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-accent hover:bg-ink hover:text-paper transition-colors"
                  >
                    + Add Pro
                  </button>
                </div>
                <div className="space-y-2">
                  {pros.map((pro, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        placeholder={`Pro #${idx + 1}`}
                        value={pro}
                        onChange={(e) => handleProChange(idx, e.target.value)}
                        className={inputClasses}
                      />
                      {pros.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePro(idx)}
                          className="h-9 w-9 shrink-0 border border-line bg-paper text-muted hover:text-red-600 font-bold transition-colors"
                          title="Remove pro"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-line/20 bg-panel/30 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-widest font-bold text-ink">
                    Cons (repeatable list)
                  </span>
                  <button
                    type="button"
                    onClick={addCon}
                    className="border border-line bg-paper px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-accent hover:bg-ink hover:text-paper transition-colors"
                  >
                    + Add Con
                  </button>
                </div>
                <div className="space-y-2">
                  {cons.map((con, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        placeholder={`Con #${idx + 1}`}
                        value={con}
                        onChange={(e) => handleConChange(idx, e.target.value)}
                        className={inputClasses}
                      />
                      {cons.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCon(idx)}
                          className="h-9 w-9 shrink-0 border border-line bg-paper text-muted hover:text-red-600 font-bold transition-colors"
                          title="Remove con"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Repeatable Key Specs */}
            <div className="border border-line/20 bg-panel/30 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-widest font-bold text-ink">
                  Key Specs (repeatable key/value rows)
                </span>
                <button
                  type="button"
                  onClick={addSpec}
                  className="border border-line bg-paper px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-accent hover:bg-ink hover:text-paper transition-colors"
                >
                  + Add Spec Row
                </button>
              </div>
              <div className="space-y-2">
                {keySpecs.map((spec, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                    <input
                      placeholder="Spec Name"
                      value={spec.key}
                      onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                      className={inputClasses}
                    />
                    <input
                      placeholder="Value"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                      className={inputClasses}
                    />
                    {keySpecs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSpec(idx)}
                        className="h-9 w-9 shrink-0 border border-line bg-paper text-muted hover:text-red-600 font-bold transition-colors"
                        title="Remove spec"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                  Good For (one per line)
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
                  Skip If (one per line)
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
                  What to Check (one per line)
                </label>
                <textarea
                  rows={3}
                  value={whatToCheckRaw}
                  onChange={(e) => setWhatToCheckRaw(e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                Final Take / Target Profile
              </label>
              <textarea
                rows={2}
                value={finalTake}
                onChange={(e) => setFinalTake(e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>

          {/* SECTION 3: ANTI-REGRET MATRIX */}
          <div className="space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest font-bold text-accent block border-b border-line/20 pb-1">
              3. Qualitative Anti-Regret Matrix
            </span>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                  Performance
                </label>
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
                <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                  Value for Money
                </label>
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
                <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                  Ease of Use
                </label>
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
                <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                  Portability
                </label>
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
                <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                  Compatibility
                </label>
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
                <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                  Long-term Durability
                </label>
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

          {/* SECTION 4: RESEARCH */}
          <div className="space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest font-bold text-accent block border-b border-line/20 pb-1">
              4. Research & Editorial Rigor
            </span>

            <div>
              <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                Research Methodology Basis
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
                  Sources (Name | URL per line)
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

          {/* Actions with duplicate submission prevention */}
          <div className="flex items-center justify-end gap-3 border-t-2 border-line bg-panel p-4 sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="border-2 border-line bg-paper px-4 py-2 font-mono text-xs uppercase tracking-widest font-bold text-muted hover:text-ink transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !isYouTubeValid}
              className="border-2 border-line bg-accent px-6 py-2 font-mono text-xs uppercase tracking-widest font-bold text-ink shadow-hard-sm hover:bg-ink hover:text-paper transition-all disabled:opacity-50"
            >
              {saving ? "Saving Changes…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
