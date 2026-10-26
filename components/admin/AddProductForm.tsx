"use client";

import { useState, type FormEvent } from "react";
import { postProduct } from "@/app/secure-admin-panel/actions";
import type { DbProduct, NewDbProduct, QualitativeRating, ResearchSource } from "@/utils/supabase/types";
import { extractRetailerDomain } from "@/config/affiliate";
import { isValidYouTubeUrl } from "@/lib/validation";

export { isValidYouTubeUrl };

type Props = {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onInserted: (newProduct?: DbProduct) => void;
};

const QUALITATIVE_OPTIONS: { label: string; value: "" | QualitativeRating }[] = [
  { label: "— Not Assessed / Pending Research —", value: "" },
  { label: "Strong (Clear Advantage / High Reliability)", value: "Strong" },
  { label: "Good (Solid Above-Average Performer)", value: "Good" },
  { label: "Fair (Acceptable with Trade-Offs)", value: "Fair" },
  { label: "Depends (Context / User Dependent)", value: "Depends" },
  { label: "Limited (Notable Constraint / Weakness)", value: "Limited" },
];

const emptyForm = {
  // Basic Info
  title: "",
  slug: "",
  category: "Travel",
  badge: "Best Value",
  description: "",
  imageUrl: "",
  youtubeUrl: "",
  retailerUrl: "",
  amazonUrl: "",
  isOutOfStock: false,

  // Decision Information
  quickTake: "",
  pros: [""],
  cons: [""],
  keySpecs: [{ key: "", value: "" }],
  goodForRaw: "",
  skipIfRaw: "",
  whatToCheckRaw: "",
  finalTake: "",

  // Qualitative Anti-Regret Matrix
  matrixPerformance: "" as "" | QualitativeRating,
  matrixValue: "" as "" | QualitativeRating,
  matrixEaseOfUse: "" as "" | QualitativeRating,
  matrixPortability: "" as "" | QualitativeRating,
  matrixCompatibility: "" as "" | QualitativeRating,
  matrixLongTermSuitability: "" as "" | QualitativeRating,

  // Research
  researchBasis: "",
  researchSourcesRaw: "",
  lastReviewedAt: "",
};

const SUGGESTED_CATEGORIES = [
  "Travel",
  "Beauty & Personal Care",
  "Electronics & Tech Accessories",
];

const SUGGESTED_BADGES = [
  "Best Overall",
  "Best Value",
  "Editor's Choice",
  "Flagship Pick",
  "Creator Pick",
  "Power Pick",
  "Silence Pick",
  "Rugged Pick",
  "Athlete Pick",
  "Reader's Choice",
];

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

const selectClasses =
  "w-full border-2 border-line bg-paper px-4 py-2.5 text-sm text-ink font-body focus:border-accent focus:bg-white focus:outline-none transition-colors";

export default function AddProductForm({ onSuccess, onError, onInserted }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof typeof emptyForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === "checkbox"
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
  const addSpec = () => setForm((f) => ({ ...f, keySpecs: [...f.keySpecs, { key: "", value: "" }] }));
  const removeSpec = (index: number) =>
    setForm((f) => ({
      ...f,
      keySpecs: f.keySpecs.length > 1 ? f.keySpecs.filter((_, i) => i !== index) : [{ key: "", value: "" }],
    }));

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
          const [title, url] = line.split("|").map((s) => s.trim());
          return { title, url };
        }
        return {
          title: line,
          url: line.startsWith("http") ? line : undefined,
        };
      });
  };

  const isYouTubeValid = isValidYouTubeUrl(form.youtubeUrl);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!isValidYouTubeUrl(form.youtubeUrl)) {
      onError("Please enter a valid YouTube URL (youtube.com or youtu.be)");
      return;
    }

    setSubmitting(true);

    const strengthsList = form.pros.map((p) => p.trim()).filter(Boolean);
    const tradeOffsList = form.cons.map((c) => c.trim()).filter(Boolean);
    const finalTakeText = form.finalTake.trim();
    const serializedKeySpecs = form.keySpecs
      .filter((s) => s.key.trim() || s.value.trim())
      .map((s) => (s.value.trim() ? `${s.key.trim()}: ${s.value.trim()}` : s.key.trim()));

    const payload: NewDbProduct = {
      // Basic Info
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      category: form.category.trim() || "Travel",
      badge: form.badge.trim() || undefined,
      description: form.description.trim(),
      image_url: form.imageUrl.trim(),
      youtube_url: form.youtubeUrl.trim() || undefined,
      retailer_url: (form.retailerUrl || form.amazonUrl).trim(),
      retailer_domain: extractRetailerDomain(form.retailerUrl || form.amazonUrl),
      amazon_url: (form.retailerUrl || form.amazonUrl).trim(),
      is_out_of_stock: form.isOutOfStock,

      // Decision Information
      quick_take: form.quickTake.trim() || undefined,
      key_specs: serializedKeySpecs,
      strengths: strengthsList,
      trade_offs: tradeOffsList,
      pros: strengthsList,
      cons: tradeOffsList,
      good_for: parseLines(form.goodForRaw),
      skip_if: parseLines(form.skipIfRaw),
      what_to_check: parseLines(form.whatToCheckRaw),
      final_take: finalTakeText || undefined,

      // Qualitative Anti-Regret Matrix (no numeric scores, no fabricated values)
      matrix_performance: form.matrixPerformance || null,
      matrix_value: form.matrixValue || null,
      matrix_ease_of_use: form.matrixEaseOfUse || null,
      matrix_portability: form.matrixPortability || null,
      matrix_compatibility: form.matrixCompatibility || null,
      matrix_long_term_suitability: form.matrixLongTermSuitability || null,

      // Research
      research_basis: form.researchBasis.trim() || undefined,
      research_sources: parseSources(form.researchSourcesRaw),
      last_reviewed_at: form.lastReviewedAt ? new Date(form.lastReviewedAt).toISOString() : null,
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
          ⚡ Research-First Product Catalog
        </span>
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight sm:text-3xl text-ink">
          Add New Product
        </h2>
        <p className="font-mono text-xs text-muted mt-1">
          Publish curated products with qualitative Anti-Regret analysis and decision support.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8 p-6 sm:p-8">
        {/* SECTION 1: BASIC INFORMATION */}
        <section className="space-y-5">
          <div className="border-b border-line/20 pb-2">
            <span className="font-mono text-xs uppercase tracking-widest font-bold text-accent">
              1. Basic Information
            </span>
          </div>

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

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Category" hint="Select or type">
              <input
                required
                list="category-suggestions"
                placeholder="Travel, Beauty & Personal Care, Electronics & Tech Accessories..."
                value={form.category}
                onChange={update("category")}
                className={inputClasses}
              />
              <datalist id="category-suggestions">
                {SUGGESTED_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </Field>

            <Field label="Badge Label" hint="Editorial pick badge">
              <input
                list="badge-suggestions"
                placeholder="Best Overall, Best Value, Editor's Choice..."
                value={form.badge}
                onChange={update("badge")}
                className={inputClasses}
              />
              <datalist id="badge-suggestions">
                {SUGGESTED_BADGES.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </Field>
          </div>

          <Field label="Description" hint="Required short summary of the product">
            <textarea
              required
              rows={2}
              placeholder="Industry-leading noise cancelling over-ear headphones with custom carbon driver."
              value={form.description}
              onChange={update("description")}
              className={inputClasses}
            />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Image URL" hint="Required direct HTTPS image link">
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
              label="Retailer URL"
              hint={`Required retailer link (Domain: ${extractRetailerDomain(form.retailerUrl || form.amazonUrl)})`}
            >
              <input
                required
                type="url"
                placeholder="https://... Amazon, Flipkart, Snapdeal, or other retailer"
                value={form.retailerUrl || form.amazonUrl}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((prev) => ({ ...prev, retailerUrl: val, amazonUrl: val }));
                }}
                className={inputClasses}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 items-start">
            <div>
              <Field
                label="YouTube Video URL (optional)"
                hint="Add a YouTube product review, demo, or buying guide."
              >
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  value={form.youtubeUrl}
                  onChange={update("youtubeUrl")}
                  className={`${inputClasses} ${!isYouTubeValid ? "border-red-500 focus:border-red-600" : ""}`}
                />
              </Field>
              {!isYouTubeValid && (
                <p className="mt-1 font-mono text-[11px] text-red-600 font-bold">
                  Please enter a valid YouTube URL (youtube.com or youtu.be)
                </p>
              )}
            </div>

            <label className="flex items-center gap-3 border-2 border-line bg-panel p-4 cursor-pointer mt-0">
              <input
                type="checkbox"
                checked={form.isOutOfStock}
                onChange={(e) => setForm((f) => ({ ...f, isOutOfStock: e.target.checked }))}
                className="h-4 w-4 rounded border-line text-ink focus:ring-accent"
              />
              <div>
                <span className="font-mono text-xs uppercase tracking-wider font-bold block text-ink">
                  Mark as Out of Stock
                </span>
                <span className="font-mono text-[10px] text-muted">
                  Displays stock warning on card and disables direct checkout
                </span>
              </div>
            </label>
          </div>
        </section>

        {/* SECTION 2: DECISION INFORMATION */}
        <section className="space-y-6">
          <div className="border-b border-line/20 pb-2">
            <span className="font-mono text-xs uppercase tracking-widest font-bold text-accent">
              2. Decision Information
            </span>
          </div>

          <Field label="Quick Take" hint="Required 20-30 word upfront summary for skimmers">
            <textarea
              required
              rows={2}
              placeholder="The undisputed active noise cancellation benchmark for frequent travelers and commuters who prioritize sound isolation over compact folding."
              value={form.quickTake}
              onChange={update("quickTake")}
              className={inputClasses}
            />
          </Field>

          {/* Repeatable Pros & Cons */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Repeatable Pros */}
            <div className="border border-line/20 bg-panel/30 p-4 rounded-none">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest font-bold text-ink block">
                    Pros (repeatable list)
                  </span>
                  <span className="font-mono text-[10px] text-muted">
                    Key advantages & reasons to buy
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
                      placeholder={`Pro #${idx + 1} (e.g. Superb active noise cancellation)`}
                      value={pro}
                      onChange={(e) => handleProChange(idx, e.target.value)}
                      className={inputClasses}
                    />
                    {form.pros.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePro(idx)}
                        className="h-10 w-10 shrink-0 border-2 border-line bg-paper text-muted hover:text-red-600 hover:bg-panel font-bold transition-colors"
                        title="Remove pro"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Repeatable Cons */}
            <div className="border border-line/20 bg-panel/30 p-4 rounded-none">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest font-bold text-ink block">
                    Cons (repeatable list)
                  </span>
                  <span className="font-mono text-[10px] text-muted">
                    Trade-offs & points to consider
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
                      placeholder={`Con #${idx + 1} (e.g. Does not fold into a compact case)`}
                      value={con}
                      onChange={(e) => handleConChange(idx, e.target.value)}
                      className={inputClasses}
                    />
                    {form.cons.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCon(idx)}
                        className="h-10 w-10 shrink-0 border-2 border-line bg-paper text-muted hover:text-red-600 hover:bg-panel font-bold transition-colors"
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

          {/* Repeatable Key Specs (Key / Value Rows) */}
          <div className="border border-line/20 bg-panel/30 p-4 rounded-none">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest font-bold text-ink block">
                  Key Specs (repeatable key/value rows)
                </span>
                <span className="font-mono text-[10px] text-muted">
                  Add technical or physical attributes (e.g. Battery Life: 30 hours)
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

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Field label="Good For" hint="Who this product serves best (one per line)">
              <textarea
                rows={3}
                placeholder="Frequent flyers&#10;Daily train/bus commuters&#10;Open-plan office workers"
                value={form.goodForRaw}
                onChange={update("goodForRaw")}
                className={inputClasses}
              />
            </Field>

            <Field label="Skip If" hint="Who should look elsewhere (one per line)">
              <textarea
                rows={3}
                placeholder="You need pocketable folding cans&#10;Tight budget under ₹15,000&#10;Strictly for gym and intense workouts"
                value={form.skipIfRaw}
                onChange={update("skipIfRaw")}
                className={inputClasses}
              />
            </Field>

            <Field label="What to Check Before Buying" hint="Pre-purchase verifications (one per line)">
              <textarea
                rows={3}
                placeholder="Ear cup depth for your ear size&#10;Included USB-C cable length&#10;Device Bluetooth codec compatibility"
                value={form.whatToCheckRaw}
                onChange={update("whatToCheckRaw")}
                className={inputClasses}
              />
            </Field>
          </div>

          <Field label="Final Take / Target Profile" hint="Clear bottom-line conclusion">
            <textarea
              rows={2}
              placeholder="Best for audiophiles and commuters seeking maximum acoustic isolation who don't mind the non-folding carry case."
              value={form.finalTake}
              onChange={update("finalTake")}
              className={inputClasses}
            />
          </Field>
        </section>

        {/* SECTION 3: ANTI-REGRET MATRIX (QUALITATIVE) */}
        <section className="space-y-5">
          <div className="border-b border-line/20 pb-2">
            <span className="font-mono text-xs uppercase tracking-widest font-bold text-accent">
              3. Anti-Regret Qualitative Matrix (No Numeric Scores)
            </span>
            <p className="font-mono text-[11px] text-muted mt-1">
              Select qualitative evaluation tiers based on research. Leave unassessed if not verified.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Performance / Reliability">
              <select
                value={form.matrixPerformance}
                onChange={update("matrixPerformance")}
                className={selectClasses}
              >
                {QUALITATIVE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Value for Money">
              <select
                value={form.matrixValue}
                onChange={update("matrixValue")}
                className={selectClasses}
              >
                {QUALITATIVE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Ease of Use">
              <select
                value={form.matrixEaseOfUse}
                onChange={update("matrixEaseOfUse")}
                className={selectClasses}
              >
                {QUALITATIVE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Portability / Footprint">
              <select
                value={form.matrixPortability}
                onChange={update("matrixPortability")}
                className={selectClasses}
              >
                {QUALITATIVE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Compatibility / Ecosystem">
              <select
                value={form.matrixCompatibility}
                onChange={update("matrixCompatibility")}
                className={selectClasses}
              >
                {QUALITATIVE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Long-term Durability">
              <select
                value={form.matrixLongTermSuitability}
                onChange={update("matrixLongTermSuitability")}
                className={selectClasses}
              >
                {QUALITATIVE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        {/* SECTION 4: RESEARCH & EDITORIAL RIGOR */}
        <section className="space-y-5">
          <div className="border-b border-line/20 pb-2">
            <span className="font-mono text-xs uppercase tracking-widest font-bold text-accent">
              4. Research & Editorial Rigor
            </span>
            <p className="font-mono text-[11px] text-muted mt-1">
              Document the actual research basis and genuine sources. Leave blank if not yet researched.
            </p>
          </div>

          <Field label="Research Basis" hint="Methodology summary (e.g. 15hr comparative analysis across 40 user logs)">
            <textarea
              rows={2}
              placeholder="Synthesized findings from teardown reports, owner community feedback (6+ months use), and manufacturer whitepapers."
              value={form.researchBasis}
              onChange={update("researchBasis")}
              className={inputClasses}
            />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Research Sources" hint="Format: Source Name | URL (one per line)">
              <textarea
                rows={3}
                placeholder="RTINGS Technical Measurements | https://www.rtings.com/headphones/reviews/sony/wh-1000xm5&#10;Sony Official Spec Sheet | https://electronics.sony.com"
                value={form.researchSourcesRaw}
                onChange={update("researchSourcesRaw")}
                className={inputClasses}
              />
            </Field>

            <Field label="Last Reviewed Date" hint="Date of last editorial verification">
              <input
                type="date"
                value={form.lastReviewedAt}
                onChange={update("lastReviewedAt")}
                className={inputClasses}
              />
            </Field>
          </div>
        </section>

        {/* Submit button with duplicate submission prevention */}
        <button
          type="submit"
          disabled={submitting || !isYouTubeValid}
          className="mt-2 border-2 border-line bg-accent px-6 py-4 font-mono text-sm font-bold uppercase tracking-widest2 text-ink shadow-hard-sm transition-all hover:-translate-y-0.5 hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Publishing via Server Action…" : "🚀 Publish Product to Storefront"}
        </button>
      </form>
    </div>
  );
}
