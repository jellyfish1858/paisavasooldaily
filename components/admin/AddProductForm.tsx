"use client";

import { useState, type FormEvent } from "react";
import { postProduct } from "@/app/secure-admin-panel/actions";
import type { DbProduct, NewDbProduct, QualitativeRating, ResearchSource } from "@/utils/supabase/types";
import { extractRetailerDomain } from "@/config/affiliate";

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
  videoUrl: "",
  retailerUrl: "",
  amazonUrl: "",
  isOutOfStock: false,

  // Decision Information
  quickTake: "",
  keySpecsRaw: "",
  strengthsRaw: "",
  tradeOffsRaw: "",
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const strengthsList = parseLines(form.strengthsRaw);
    const tradeOffsList = parseLines(form.tradeOffsRaw);
    const finalTakeText = form.finalTake.trim();

    const payload: NewDbProduct = {
      // Basic Info
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      category: form.category.trim() || "Tech",
      badge: form.badge.trim() || undefined,
      description: form.description.trim(),
      image_url: form.imageUrl.trim(),
      video_url: form.videoUrl.trim() || undefined,
      retailer_url: (form.retailerUrl || form.amazonUrl).trim(),
      retailer_domain: extractRetailerDomain(form.retailerUrl || form.amazonUrl),
      amazon_url: (form.retailerUrl || form.amazonUrl).trim(),
      is_out_of_stock: form.isOutOfStock,

      // Decision Information
      quick_take: form.quickTake.trim() || form.description.trim() || undefined,
      key_specs: parseLines(form.keySpecsRaw),
      strengths: strengthsList,
      trade_offs: tradeOffsList,
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

    const res = await postProduct(payload);
    setSubmitting(false);

    if (!res.success) {
      onError(res.error || "Failed to add product to database.");
      return;
    }

    onSuccess(`"${form.title}" added to database!`);
    setForm(emptyForm);
    onInserted(res.data);
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
                placeholder="Tech, Audio, Productivity..."
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

          <Field label="Short Product Excerpt / Description" hint="1-2 sentences summarizing the product">
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
            <Field label="Image URL" hint="Direct HTTPS image link">
              <input
                required
                type="url"
                placeholder="https://images.unsplash.com/... or Amazon image link"
                value={form.imageUrl}
                onChange={update("imageUrl")}
                className={inputClasses}
              />
            </Field>

            <Field
              label="Retailer URL"
              hint={`Direct retailer link (Domain: ${extractRetailerDomain(form.retailerUrl || form.amazonUrl)})`}
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

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 items-center">
            <Field label="Video Embed URL (Optional)" hint="YouTube embed link">
              <input
                type="url"
                placeholder="https://www.youtube.com/embed/..."
                value={form.videoUrl}
                onChange={update("videoUrl")}
                className={inputClasses}
              />
            </Field>

            <label className="flex items-center gap-3 border-2 border-line bg-panel p-4 cursor-pointer mt-4 sm:mt-0">
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
        <section className="space-y-5">
          <div className="border-b border-line/20 pb-2">
            <span className="font-mono text-xs uppercase tracking-widest font-bold text-accent">
              2. Decision Information
            </span>
          </div>

          <Field label="Quick Take" hint="20-30 word upfront summary for skimmers">
            <textarea
              rows={2}
              placeholder="The undisputed active noise cancellation benchmark for frequent travelers and commuters who prioritize sound isolation over compact folding."
              value={form.quickTake}
              onChange={update("quickTake")}
              className={inputClasses}
            />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Strengths (Why to Buy)" hint="One per line">
              <textarea
                rows={3}
                placeholder="Superb active noise cancellation&#10;30-hour battery life with fast charge&#10;Extremely comfortable ear cushions"
                value={form.strengthsRaw}
                onChange={update("strengthsRaw")}
                className={inputClasses}
              />
            </Field>

            <Field label="Trade-offs (What to Consider)" hint="One per line">
              <textarea
                rows={3}
                placeholder="Does not fold into a compact form factor&#10;Multipoint Bluetooth switches can occasionally hesitate&#10;Premium pricing tier"
                value={form.tradeOffsRaw}
                onChange={update("tradeOffsRaw")}
                className={inputClasses}
              />
            </Field>
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

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Key Specifications" hint="Key specs one per line (e.g. Battery: 30h)">
              <textarea
                rows={3}
                placeholder="Battery Life: 30 hours&#10;Weight: 250g&#10;Driver Size: 30mm Carbon Fiber&#10;Bluetooth: 5.2 LDAC / AAC / SBC"
                value={form.keySpecsRaw}
                onChange={update("keySpecsRaw")}
                className={inputClasses}
              />
            </Field>

            <Field label="Final Take / Target Profile" hint="Clear bottom-line conclusion">
              <textarea
                rows={3}
                placeholder="Best for audiophiles and commuters seeking maximum acoustic isolation who don't mind the non-folding carry case."
                value={form.finalTake}
                onChange={update("finalTake")}
                className={inputClasses}
              />
            </Field>
          </div>
        </section>

        {/* SECTION 3: ANTI-REGRET MATRIX (QUALITATIVE) */}
        <section className="space-y-5">
          <div className="border-b border-line/20 pb-2">
            <span className="font-mono text-xs uppercase tracking-widest font-bold text-accent">
              3. Anti-Regret Matrix (Qualitative Assessment Only)
            </span>
            <p className="font-mono text-[11px] text-muted mt-1">
              Select qualitative evaluation for each dimension. Do NOT assign numerical scores. Leave unassessed if not researched yet.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Performance" hint="Speed, output, efficacy">
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

            <Field label="Value for Money" hint="Price vs capability balance">
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

            <Field label="Ease of Use" hint="Setup, UI, ergonomics">
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

            <Field label="Portability" hint="Weight, bulk, travel ease">
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

            <Field label="Compatibility" hint="Ecosystem & standards fit">
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

            <Field label="Long-Term Suitability" hint="Durability, support, obsolescence">
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

        {/* Submit button */}
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 border-2 border-line bg-accent px-6 py-4 font-mono text-sm font-bold uppercase tracking-widest2 text-ink shadow-hard-sm transition-all hover:-translate-y-0.5 hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Publishing via Server Action…" : "🚀 Publish Product to Storefront"}
        </button>
      </form>
    </div>
  );
}
