"use client";

import { useState, type FormEvent } from "react";
import { updateProductAction } from "@/app/secure-admin-panel/actions";
import type { DbProduct } from "@/utils/supabase/types";
import { extractRetailerDomain } from "@/config/affiliate";
import { isValidYouTubeUrl, isValidUniversalMediaUrl } from "@/lib/validation";

export { isValidYouTubeUrl, isValidUniversalMediaUrl };

interface EditProductModalProps {
  product: DbProduct;
  onClose: () => void;
  onUpdated: (updatedProduct: DbProduct) => void;
  onError: (msg: string) => void;
}

const CATEGORY_PRESETS = [
  { label: "Electronics & Tech Accessories", value: "Electronics & Tech Accessories", icon: "⚡" },
  { label: "Beauty & Fashion", value: "Beauty & Fashion", icon: "✨" },
  { label: "Travel", value: "Travel", icon: "✈️" },
];

const BADGE_PRESETS = [
  "Best Overall",
  "Best Value",
  "Editor's Choice",
  "Flagship Pick",
  "Top Pick",
  "Budget Pick",
];

const inputClasses =
  "w-full border-2 border-line bg-paper px-4 py-2.5 text-sm text-ink font-body focus:border-accent focus:bg-white focus:outline-none transition-colors";

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
  const [category, setCategory] = useState(product.category || "Electronics & Tech Accessories");
  const [badge, setBadge] = useState(stripProductMeta(product.badge) || "");
  const [imageUrl, setImageUrl] = useState(product.image_url || "");
  const [mediaUrl, setMediaUrl] = useState(
    product.youtube_url || (product as any).video_url || ""
  );
  const [retailerUrl, setRetailerUrl] = useState(
    product.retailer_url || product.amazon_url || ""
  );

  // Decision Information
  const [quickTake, setQuickTake] = useState(
    stripProductMeta(product.quick_take || product.description) || ""
  );
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

  const [goodForRaw, setGoodForRaw] = useState(() =>
    toMultilineText(
      (Array.isArray(product.good_for) ? product.good_for : []).map((g: any) =>
        stripProductMeta(String(g))
      )
    )
  );
  const [skipIfRaw, setSkipIfRaw] = useState(() =>
    toMultilineText(
      (Array.isArray(product.skip_if) ? product.skip_if : []).map((s: any) =>
        stripProductMeta(String(s))
      )
    )
  );

  const [saving, setSaving] = useState(false);

  // Pros Handlers
  const handleProChange = (index: number, val: string) => {
    const next = [...pros];
    next[index] = val;
    setPros(next);
  };
  const addPro = () => setPros([...pros, ""]);
  const removePro = (index: number) => {
    setPros(pros.length > 1 ? pros.filter((_, i) => i !== index) : [""]);
  };

  // Cons Handlers
  const handleConChange = (index: number, val: string) => {
    const next = [...cons];
    next[index] = val;
    setCons(next);
  };
  const addCon = () => setCons([...cons, ""]);
  const removeCon = (index: number) => {
    setCons(cons.length > 1 ? cons.filter((_, i) => i !== index) : [""]);
  };

  // Specs Handlers
  const handleSpecChange = (index: number, field: "key" | "value", val: string) => {
    const next = [...keySpecs];
    next[index] = { ...next[index], [field]: val };
    setKeySpecs(next);
  };
  const addSpec = () => setKeySpecs([...keySpecs, { key: "", value: "" }]);
  const removeSpec = (index: number) => {
    setKeySpecs(
      keySpecs.length > 1
        ? keySpecs.filter((_, i) => i !== index)
        : [{ key: "", value: "" }]
    );
  };

  const parseLines = (raw: string): string[] =>
    raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

  const isMediaValid = isValidUniversalMediaUrl(mediaUrl);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;

    if (!isValidUniversalMediaUrl(mediaUrl)) {
      onError("Please enter a valid YouTube or Instagram URL, or leave blank.");
      return;
    }

    setSaving(true);

    const strengthsList = pros.map((p) => p.trim()).filter(Boolean);
    const tradeOffsList = cons.map((c) => c.trim()).filter(Boolean);
    const finalTakeText = finalTake.trim();
    const quickTakeText = quickTake.trim();
    const serializedKeySpecs = keySpecs
      .filter((s) => s.key.trim() || s.value.trim())
      .map((s) => (s.value.trim() ? `${s.key.trim()}: ${s.value.trim()}` : s.key.trim()));

    const cleanedMediaUrl = mediaUrl.trim() || undefined;

    const payload: Partial<DbProduct> = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      category: category.trim(),
      badge: badge.trim() || undefined,
      description: quickTakeText || title.trim(),
      image_url: imageUrl.trim(),
      youtube_url: cleanedMediaUrl,
      retailer_url: retailerUrl.trim(),
      retailer_domain: extractRetailerDomain(retailerUrl),
      amazon_url: retailerUrl.trim(),

      quick_take: quickTakeText || undefined,
      key_specs: serializedKeySpecs,
      strengths: strengthsList,
      trade_offs: tradeOffsList,
      pros: strengthsList,
      cons: tradeOffsList,
      good_for: parseLines(goodForRaw),
      skip_if: parseLines(skipIfRaw),
      final_take: finalTakeText || undefined,
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
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 p-4 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto border-2 border-line bg-paper shadow-hard my-8">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-line bg-panel px-6 py-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-accent font-bold">
              ⚡ Streamlined Product Editor
            </span>
            <h2 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
              Edit: {product.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border-2 border-line bg-paper px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-ink hover:bg-ink hover:text-paper transition-colors"
          >
            ✕ Close
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 sm:p-8">
          {/* SECTION 1: PRODUCT IDENTIFIERS & BUYING LINKS */}
          <section className="space-y-4">
            <div className="border-b border-line/20 pb-1">
              <span className="font-mono text-xs uppercase tracking-widest font-bold text-accent">
                1. Product Identifiers & Links
              </span>
            </div>

            {/* Category with Presets */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-widest font-bold text-ink">
                  Category
                </span>
                <span className="font-mono text-[10px] text-muted">
                  Quick-select preset or custom
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-2.5">
                {CATEGORY_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setCategory(preset.value)}
                    className={`px-3 py-1 font-mono text-xs uppercase tracking-wider font-bold transition-all border-2 ${
                      category === preset.value
                        ? "border-accent bg-accent text-ink shadow-sm"
                        : "border-line bg-panel text-ink hover:border-accent/60"
                    }`}
                  >
                    <span className="mr-1.5">{preset.icon}</span>
                    {preset.label}
                  </button>
                ))}
              </div>
              <input
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClasses}
                placeholder="Electronics & Tech Accessories, Beauty & Fashion, Travel..."
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block font-mono text-[11px] uppercase tracking-widest font-bold text-ink">
                  Product Title (Required)
                </span>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClasses}
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-mono text-[11px] uppercase tracking-widest font-bold text-ink">
                  URL Slug (Optional)
                </span>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className={inputClasses}
                />
              </label>
            </div>

            <div>
              <label className="block">
                <span className="mb-1 block font-mono text-[11px] uppercase tracking-widest font-bold text-ink">
                  Badge Label (Optional)
                </span>
                <input
                  list="edit-badge-options"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className={inputClasses}
                  placeholder="Best Value, Editor's Choice..."
                />
              </label>
              <datalist id="edit-badge-options">
                {BADGE_PRESETS.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block font-mono text-[11px] uppercase tracking-widest font-bold text-ink">
                  Image URL (Required)
                </span>
                <input
                  required
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className={inputClasses}
                />
              </label>

              <label className="block">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-widest font-bold text-ink">
                    Affiliate Retailer Buy URL (&quot;Check Price &amp; Buy&quot;)
                  </span>
                  <span className="font-mono text-[10px] text-muted">
                    {extractRetailerDomain(retailerUrl)}
                  </span>
                </div>
                <input
                  required
                  type="url"
                  value={retailerUrl}
                  onChange={(e) => setRetailerUrl(e.target.value)}
                  className={inputClasses}
                />
              </label>
            </div>

            {/* Optional Universal Media URL */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-widest font-bold text-ink">
                  Optional Video / Social Proof URL (YouTube or Instagram)
                </span>
                <span className="font-mono text-[10px] text-muted">
                  YouTube video/short OR Instagram Reel/Post
                </span>
              </div>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=... or https://www.instagram.com/reel/..."
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className={`${inputClasses} ${!isMediaValid ? "border-red-500 focus:border-red-600" : ""}`}
              />
              {!isMediaValid && (
                <p className="mt-1 font-mono text-[11px] text-red-600 font-bold">
                  Please enter a valid YouTube URL (youtube.com / youtu.be) or Instagram URL (instagram.com)
                </p>
              )}
            </div>
          </section>

          {/* SECTION 2: EDITORIAL CONTENT & DECISION SUPPORT */}
          <section className="space-y-5">
            <div className="border-b border-line/20 pb-1">
              <span className="font-mono text-xs uppercase tracking-widest font-bold text-accent">
                2. Editorial Content & Decision Support
              </span>
            </div>

            {/* Editorial Quick Take */}
            <label className="block">
              <span className="mb-1 block font-mono text-[11px] uppercase tracking-widest font-bold text-ink">
                Editorial Quick Take (Required)
              </span>
              <textarea
                required
                rows={3}
                value={quickTake}
                onChange={(e) => setQuickTake(e.target.value)}
                className={inputClasses}
              />
            </label>

            {/* Repeatable Key Specifications */}
            <div className="border border-line/20 bg-panel/30 p-3.5">
              <div className="mb-2.5 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest font-bold text-ink block">
                    Key Specifications (Key-Value pairs)
                  </span>
                  <span className="font-mono text-[10px] text-muted">
                    Displayed in the specifications table
                  </span>
                </div>
                <button
                  type="button"
                  onClick={addSpec}
                  className="border-2 border-line bg-paper px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-accent hover:bg-ink hover:text-paper transition-colors"
                >
                  + Add Spec Row
                </button>
              </div>
              <div className="space-y-2">
                {keySpecs.map((spec, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                    <input
                      placeholder="Spec Name (e.g. Battery Life)"
                      value={spec.key}
                      onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                      className={inputClasses}
                    />
                    <input
                      placeholder="Value (e.g. 30 Hours)"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                      className={inputClasses}
                    />
                    {keySpecs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSpec(idx)}
                        className="h-9 w-9 shrink-0 border-2 border-line bg-paper text-muted hover:text-red-600 hover:bg-panel font-bold transition-colors"
                        title="Remove spec"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Repeatable Pros & Cons */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Pros */}
              <div className="border border-line/20 bg-panel/30 p-3.5">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs uppercase tracking-widest font-bold text-ink block">
                      Verified Strengths (Pros)
                    </span>
                    <span className="font-mono text-[10px] text-muted">
                      Displayed with green checkmarks
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={addPro}
                    className="border-2 border-line bg-paper px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-accent hover:bg-ink hover:text-paper transition-colors"
                  >
                    + Add Pro
                  </button>
                </div>
                <div className="space-y-2">
                  {pros.map((pro, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        placeholder={`Strength #${idx + 1}`}
                        value={pro}
                        onChange={(e) => handleProChange(idx, e.target.value)}
                        className={inputClasses}
                      />
                      {pros.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePro(idx)}
                          className="h-9 w-9 shrink-0 border-2 border-line bg-paper text-muted hover:text-red-600 hover:bg-panel font-bold transition-colors"
                          title="Remove pro"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cons */}
              <div className="border border-line/20 bg-panel/30 p-3.5">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs uppercase tracking-widest font-bold text-ink block">
                      Trade-offs & Limitations (Cons)
                    </span>
                    <span className="font-mono text-[10px] text-muted">
                      Displayed with red crossmarks
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={addCon}
                    className="border-2 border-line bg-paper px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-accent hover:bg-ink hover:text-paper transition-colors"
                  >
                    + Add Con
                  </button>
                </div>
                <div className="space-y-2">
                  {cons.map((con, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        placeholder={`Trade-off #${idx + 1}`}
                        value={con}
                        onChange={(e) => handleConChange(idx, e.target.value)}
                        className={inputClasses}
                      />
                      {cons.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCon(idx)}
                          className="h-9 w-9 shrink-0 border-2 border-line bg-paper text-muted hover:text-red-600 hover:bg-panel font-bold transition-colors"
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

            {/* Editorial Verdict (Final Take) */}
            <label className="block">
              <span className="mb-1 block font-mono text-[11px] uppercase tracking-widest font-bold text-ink">
                Editorial Verdict (Final Take)
              </span>
              <textarea
                rows={3}
                value={finalTake}
                onChange={(e) => setFinalTake(e.target.value)}
                className={inputClasses}
              />
            </label>

            {/* Target Audience: Who This Is Good For & Skip If */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block font-mono text-[11px] uppercase tracking-widest font-bold text-ink">
                  Who This Is Good For (Ideal 1, Ideal 2)
                </span>
                <textarea
                  rows={3}
                  value={goodForRaw}
                  onChange={(e) => setGoodForRaw(e.target.value)}
                  className={inputClasses}
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-mono text-[11px] uppercase tracking-widest font-bold text-ink">
                  Skip If (Caution 1, Caution 2)
                </span>
                <textarea
                  rows={3}
                  value={skipIfRaw}
                  onChange={(e) => setSkipIfRaw(e.target.value)}
                  className={inputClasses}
                />
              </label>
            </div>
          </section>

          {/* Modal Actions */}
          <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t-2 border-line bg-panel p-4 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8">
            <button
              type="button"
              onClick={onClose}
              className="border-2 border-line bg-paper px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-ink hover:bg-ink hover:text-paper transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !isMediaValid}
              className="border-2 border-line bg-accent px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-ink shadow-hard-sm transition-all hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving Changes…" : "✓ Save & Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
