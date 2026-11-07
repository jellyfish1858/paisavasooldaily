"use client";

import { useState, type FormEvent } from "react";
import { postProduct } from "@/app/secure-admin-panel/actions";
import type { DbProduct, NewDbProduct } from "@/utils/supabase/types";
import { extractRetailerDomain } from "@/config/affiliate";
import { isValidYouTubeUrl, isValidUniversalMediaUrl } from "@/lib/validation";

export { isValidYouTubeUrl, isValidUniversalMediaUrl };

type Props = {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onInserted: (newProduct?: DbProduct) => void;
};

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

const emptyForm = {
  title: "",
  slug: "",
  category: "Electronics & Tech Accessories",
  badge: "Best Value",
  imageUrl: "",
  retailerUrl: "",
  mediaUrl: "",

  // Decision Information (matches Product Detail Page)
  quickTake: "",
  keySpecs: [{ key: "", value: "" }],
  pros: [""],
  cons: [""],
  finalTake: "",
  goodForRaw: "",
  skipIfRaw: "",
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-widest2 font-bold text-ink">
          {label}
        </span>
        {hint && (
          <span className="font-mono text-[10px] text-muted">{hint}</span>
        )}
      </div>
      {children}
    </label>
  );
}

const inputClasses =
  "w-full border-2 border-line bg-paper px-4 py-3 text-sm text-ink font-body focus:border-accent focus:bg-white focus:outline-none transition-colors placeholder:text-muted/60";

export default function AddProductForm({ onSuccess, onError, onInserted }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof typeof emptyForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value =
      e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  // Pros Handlers
  const handleProChange = (index: number, val: string) => {
    setForm((f) => {
      const next = [...f.pros];
      next[index] = val;
      return { ...f, pros: next };
    });
  };
  const addPro = () => setForm((f) => ({ ...f, pros: [...f.pros, ""] }));
  const removePro = (index: number) =>
    setForm((f) => ({
      ...f,
      pros: f.pros.length > 1 ? f.pros.filter((_, i) => i !== index) : [""],
    }));

  // Cons Handlers
  const handleConChange = (index: number, val: string) => {
    setForm((f) => {
      const next = [...f.cons];
      next[index] = val;
      return { ...f, cons: next };
    });
  };
  const addCon = () => setForm((f) => ({ ...f, cons: [...f.cons, ""] }));
  const removeCon = (index: number) =>
    setForm((f) => ({
      ...f,
      cons: f.cons.length > 1 ? f.cons.filter((_, i) => i !== index) : [""],
    }));

  // Key Specs Handlers
  const handleSpecChange = (index: number, field: "key" | "value", val: string) => {
    setForm((f) => {
      const next = [...f.keySpecs];
      next[index] = { ...next[index], [field]: val };
      return { ...f, keySpecs: next };
    });
  };
  const addSpec = () =>
    setForm((f) => ({ ...f, keySpecs: [...f.keySpecs, { key: "", value: "" }] }));
  const removeSpec = (index: number) =>
    setForm((f) => ({
      ...f,
      keySpecs:
        f.keySpecs.length > 1
          ? f.keySpecs.filter((_, i) => i !== index)
          : [{ key: "", value: "" }],
    }));

  const parseLines = (raw: string): string[] =>
    raw
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);

  const isMediaValid = isValidUniversalMediaUrl(form.mediaUrl);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!isValidUniversalMediaUrl(form.mediaUrl)) {
      onError("Please enter a valid YouTube or Instagram URL, or leave blank.");
      return;
    }

    setSubmitting(true);

    const strengthsList = form.pros.map((p) => p.trim()).filter(Boolean);
    const tradeOffsList = form.cons.map((c) => c.trim()).filter(Boolean);
    const finalTakeText = form.finalTake.trim();
    const quickTakeText = form.quickTake.trim();
    const serializedKeySpecs = form.keySpecs
      .filter((s) => s.key.trim() || s.value.trim())
      .map((s) =>
        s.value.trim() ? `${s.key.trim()}: ${s.value.trim()}` : s.key.trim()
      );

    const cleanedMediaUrl = form.mediaUrl.trim() || undefined;

    const payload: NewDbProduct = {
      // Basic Info
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      category: form.category.trim() || "Electronics & Tech Accessories",
      badge: form.badge.trim() || undefined,
      description: quickTakeText || form.title.trim(),
      image_url: form.imageUrl.trim(),
      youtube_url: cleanedMediaUrl,
      retailer_url: form.retailerUrl.trim(),
      retailer_domain: extractRetailerDomain(form.retailerUrl),
      amazon_url: form.retailerUrl.trim(),

      // Decision Information (matches Product Detail Page)
      quick_take: quickTakeText || undefined,
      key_specs: serializedKeySpecs,
      strengths: strengthsList,
      trade_offs: tradeOffsList,
      pros: strengthsList,
      cons: tradeOffsList,
      good_for: parseLines(form.goodForRaw),
      skip_if: parseLines(form.skipIfRaw),
      final_take: finalTakeText || undefined,
    };

    try {
      const res = await postProduct(payload);
      setSubmitting(false);

      if (!res.success) {
        onError(res.error || "Failed to add product to database.");
        return;
      }

      onSuccess(`"${form.title}" added to database!`);
      setForm(emptyForm);
      onInserted(res.data);
    } catch (err: any) {
      setSubmitting(false);
      onError(err?.message || "An unexpected error occurred while adding product.");
    }
  };

  return (
    <div className="border-2 border-line bg-paper shadow-hard">
      <div className="border-b-2 border-line bg-panel px-6 py-4 sm:px-8">
        <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold">
          ⚡ Streamlined Product Editor
        </span>
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight sm:text-3xl text-ink">
          Add New Product
        </h2>
        <p className="font-mono text-xs text-muted mt-1">
          Publish products with verified specs, editorial quick take, decision support, and optional video proof.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8 p-6 sm:p-8">
        {/* SECTION 1: CORE PRODUCT IDENTIFIERS & BUYING LINKS */}
        <section className="space-y-5">
          <div className="border-b border-line/20 pb-2">
            <span className="font-mono text-xs uppercase tracking-widest font-bold text-accent">
              1. Product Identifiers & Links
            </span>
          </div>

          {/* Category with Quick-Select Presets */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-widest2 font-bold text-ink">
                Category
              </span>
              <span className="font-mono text-[10px] text-muted">
                Quick-select or type custom
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {CATEGORY_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, category: preset.value }))}
                  className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider font-bold transition-all border-2 ${
                    form.category === preset.value
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
              placeholder="e.g. Electronics & Tech Accessories, Beauty & Fashion, Travel..."
              value={form.category}
              onChange={update("category")}
              className={inputClasses}
            />
          </div>

          {/* Title and Optional URL Slug */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Product Title" hint="Required">
              <input
                required
                placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                value={form.title}
                onChange={update("title")}
                className={inputClasses}
              />
            </Field>

            <Field label="URL Slug (Optional)" hint="Auto-generated if empty">
              <input
                placeholder="e.g. sony-wh-1000xm5"
                value={form.slug}
                onChange={update("slug")}
                className={inputClasses}
              />
            </Field>
          </div>

          {/* Badge */}
          <div>
            <Field label="Badge Label (Optional)" hint="Featured pick tag (e.g. Best Value, Top Pick)">
              <input
                list="badge-options"
                placeholder="Best Overall, Best Value, Editor's Choice..."
                value={form.badge}
                onChange={update("badge")}
                className={inputClasses}
              />
            </Field>
            <datalist id="badge-options">
              {BADGE_PRESETS.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>

          {/* Image URL & Retailer Buy URL */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Product Image URL" hint="Direct HTTPS image link">
              <input
                required
                type="url"
                placeholder="https://images.unsplash.com/... or retailer image link"
                value={form.imageUrl}
                onChange={update("imageUrl")}
                className={inputClasses}
              />
            </Field>

            <Field
              label='Affiliate Retailer Buy URL ("Check Price & Buy")'
              hint={`Domain: ${extractRetailerDomain(form.retailerUrl)}`}
            >
              <input
                required
                type="url"
                placeholder="https://www.amazon.in/dp/... or Flipkart link"
                value={form.retailerUrl}
                onChange={update("retailerUrl")}
                className={inputClasses}
              />
            </Field>
          </div>

          {/* Optional Universal Media URL (YouTube or Instagram) */}
          <div>
            <Field
              label="Optional Video / Social Proof URL (YouTube or Instagram)"
              hint="YouTube video/short OR Instagram Reel/Post"
            >
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=... or https://www.instagram.com/reel/..."
                value={form.mediaUrl}
                onChange={update("mediaUrl")}
                className={`${inputClasses} ${!isMediaValid ? "border-red-500 focus:border-red-600" : ""}`}
              />
            </Field>
            {!isMediaValid && (
              <p className="mt-1 font-mono text-[11px] text-red-600 font-bold">
                Please enter a valid YouTube URL (youtube.com / youtu.be) or Instagram URL (instagram.com)
              </p>
            )}
          </div>
        </section>

        {/* SECTION 2: EDITORIAL CONTENT & DECISION SUPPORT */}
        <section className="space-y-6">
          <div className="border-b border-line/20 pb-2">
            <span className="font-mono text-xs uppercase tracking-widest font-bold text-accent">
              2. Editorial Content & Decision Support
            </span>
          </div>

          {/* Editorial Quick Take */}
          <Field
            label="Editorial Quick Take"
            hint="2-3 sentence upfront summary displayed in top highlight box"
          >
            <textarea
              required
              rows={3}
              placeholder="The benchmark active noise cancellation headphones for frequent commuters and remote workers seeking premium acoustic isolation."
              value={form.quickTake}
              onChange={update("quickTake")}
              className={inputClasses}
            />
          </Field>

          {/* Repeatable Key Specifications */}
          <div className="border border-line/20 bg-panel/30 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest font-bold text-ink block">
                  Key Specifications (Key-Value pairs)
                </span>
                <span className="font-mono text-[10px] text-muted">
                  Displayed in the Key Specifications table on the product page
                </span>
              </div>
              <button
                type="button"
                onClick={addSpec}
                className="border-2 border-line bg-paper px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-accent hover:bg-ink hover:text-paper transition-colors"
              >
                + Add Spec Row
              </button>
            </div>
            <div className="space-y-2">
              {form.keySpecs.map((spec, idx) => (
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
                  {form.keySpecs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSpec(idx)}
                      className="h-10 w-10 shrink-0 border-2 border-line bg-paper text-muted hover:text-red-600 hover:bg-panel font-bold transition-colors"
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Pros */}
            <div className="border border-line/20 bg-panel/30 p-4">
              <div className="mb-3 flex items-center justify-between">
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
                  className="border-2 border-line bg-paper px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-accent hover:bg-ink hover:text-paper transition-colors"
                >
                  + Add Pro
                </button>
              </div>
              <div className="space-y-2">
                {form.pros.map((pro, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      placeholder={`Strength #${idx + 1} (e.g. Class-leading active noise cancellation)`}
                      value={pro}
                      onChange={(e) => handleProChange(idx, e.target.value)}
                      className={inputClasses}
                    />
                    {form.pros.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePro(idx)}
                        className="h-10 w-10 shrink-0 border-2 border-line bg-paper text-muted hover:text-red-600 hover:bg-panel font-bold transition-colors"
                        title="Remove strength"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Cons */}
            <div className="border border-line/20 bg-panel/30 p-4">
              <div className="mb-3 flex items-center justify-between">
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
                  className="border-2 border-line bg-paper px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-accent hover:bg-ink hover:text-paper transition-colors"
                >
                  + Add Con
                </button>
              </div>
              <div className="space-y-2">
                {form.cons.map((con, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      placeholder={`Trade-off #${idx + 1} (e.g. Does not fold into a compact size)`}
                      value={con}
                      onChange={(e) => handleConChange(idx, e.target.value)}
                      className={inputClasses}
                    />
                    {form.cons.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCon(idx)}
                        className="h-10 w-10 shrink-0 border-2 border-line bg-paper text-muted hover:text-red-600 hover:bg-panel font-bold transition-colors"
                        title="Remove trade-off"
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
          <Field
            label="Editorial Verdict (Final Take)"
            hint="Displayed in the gradient Editorial Verdict box"
          >
            <textarea
              rows={3}
              placeholder="Best for audiophiles and frequent travelers seeking maximum acoustic isolation who don't mind the non-folding case."
              value={form.finalTake}
              onChange={update("finalTake")}
              className={inputClasses}
            />
          </Field>

          {/* Target Audience: Who This Is Good For & Skip If */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field
              label="Who This Is Good For"
              hint="Maps to Ideal 1, Ideal 2 on product page (one per line)"
            >
              <textarea
                rows={3}
                placeholder="Frequent flyers&#10;Daily office commuters&#10;Remote workers needing focus"
                value={form.goodForRaw}
                onChange={update("goodForRaw")}
                className={inputClasses}
              />
            </Field>

            <Field
              label="Skip If"
              hint="Maps to Caution 1, Caution 2 on product page (one per line)"
            >
              <textarea
                rows={3}
                placeholder="You need ultra-compact folding headphones&#10;Budget is strictly under ₹15,000&#10;Primary use is intense workout sweating"
                value={form.skipIfRaw}
                onChange={update("skipIfRaw")}
                className={inputClasses}
              />
            </Field>
          </div>
        </section>

        {/* Submit button */}
        <button
          type="submit"
          disabled={submitting || !isMediaValid}
          className="mt-2 border-2 border-line bg-accent px-6 py-4 font-mono text-sm font-bold uppercase tracking-widest2 text-ink shadow-hard-sm transition-all hover:-translate-y-0.5 hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Publishing to Database…" : "🚀 Publish Product to Storefront"}
        </button>
      </form>
    </div>
  );
}
