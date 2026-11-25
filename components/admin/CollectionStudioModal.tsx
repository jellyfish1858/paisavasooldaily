"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import {
  fetchAdminCollectionDetailsAction,
  createCollectionAction,
  updateCollectionAction,
  createCollectionSectionAction,
  updateCollectionSectionAction,
  deleteCollectionSectionAction,
  reorderCollectionSectionsAction,
  updateCollectionProductAction,
  removeCollectionProductAction,
} from "@/app/secure-admin-panel/actions";
import CollectionProductPickerModal from "./CollectionProductPickerModal";
import type {
  DbCollection,
  DbCollectionSection,
  DbCollectionProduct,
  DbProduct,
  CollectionCategory,
  CollectionStatus,
  CollectionSectionType,
  CollectionWithRelations,
} from "@/utils/supabase/types";

interface CollectionStudioModalProps {
  collectionId: string | null; // null for creating new, string for editing existing
  catalogProducts?: DbProduct[];
  onClose: () => void;
  onSaved: (collection: DbCollection) => void;
  onError: (message: string) => void;
}

const CANONICAL_CATEGORIES: readonly CollectionCategory[] = [
  "Travel",
  "Beauty & Personal Care",
  "Electronics & Tech Accessories",
] as const;

const CANONICAL_STATUSES: readonly CollectionStatus[] = [
  "draft",
  "published",
  "archived",
] as const;

const CANONICAL_SECTION_TYPES: readonly { value: CollectionSectionType; label: string; desc: string }[] = [
  {
    value: "narrative",
    label: "Narrative",
    desc: "Curator background, story, and overarching theme",
  },
  {
    value: "spotlight",
    label: "Spotlight",
    desc: "Hero product deep dive or signature item focus",
  },
  {
    value: "comparison",
    label: "Comparison",
    desc: "Side-by-side trade-off analysis between alternatives",
  },
  {
    value: "checklist",
    label: "Checklist",
    desc: "Key criteria, packing list, or what to look for",
  },
  {
    value: "takeaway",
    label: "Takeaway",
    desc: "Final verdict, summary, and buying guidance",
  },
] as const;

const inputClasses =
  "w-full border-2 border-line bg-paper px-4 py-2.5 font-mono text-xs text-ink placeholder:text-muted/70 focus:border-accent focus:bg-white focus:outline-none transition-colors";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-widest2 font-bold text-ink">
          {label} {required && <span className="text-red-600">*</span>}
        </span>
        {hint && (
          <span className="font-mono text-[10px] text-muted">{hint}</span>
        )}
      </div>
      {children}
    </label>
  );
}

export default function CollectionStudioModal({
  collectionId,
  catalogProducts,
  onClose,
  onSaved,
  onError,
}: CollectionStudioModalProps) {
  // Active modal tab: "metadata" | "sections" | "products"
  const [activeTab, setActiveTab] = useState<"metadata" | "sections" | "products">("metadata");

  // Track the actual current collection ID (can become populated after creating a new collection)
  const [currentId, setCurrentId] = useState<string | null>(collectionId);
  const isEditing = Boolean(currentId);

  // Loading and error states for fetching existing collection details
  const [loadingDetails, setLoadingDetails] = useState<boolean>(Boolean(collectionId));
  const [loadError, setLoadError] = useState<string | null>(null);

  // Metadata Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [category, setCategory] = useState<CollectionCategory>("Travel");
  const [status, setStatus] = useState<CollectionStatus>("draft");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const [savingMetadata, setSavingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [metadataSuccess, setMetadataSuccess] = useState<string | null>(null);

  // Editorial Sections State
  const [sections, setSections] = useState<DbCollectionSection[]>([]);
  const [reordering, setReordering] = useState(false);

  // Section Form / Modal State (for creating or editing a single section)
  const [editingSection, setEditingSection] = useState<DbCollectionSection | null>(null);
  const [isSectionFormOpen, setIsSectionFormOpen] = useState(false);
  const [sectionHeading, setSectionHeading] = useState("");
  const [sectionType, setSectionType] = useState<CollectionSectionType>("narrative");
  const [sectionBody, setSectionBody] = useState("");
  const [sectionImageUrl, setSectionImageUrl] = useState("");
  const [sectionSortOrder, setSectionSortOrder] = useState<number>(0);
  const [sectionCtaText, setSectionCtaText] = useState("");
  const [sectionCtaDestination, setSectionCtaDestination] = useState("");
  const [savingSection, setSavingSection] = useState(false);
  const [sectionError, setSectionError] = useState<string | null>(null);
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(null);

  // Attached Products State
  const [collectionProducts, setCollectionProducts] = useState<DbCollectionProduct[]>([]);
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [productSuccess, setProductSuccess] = useState<string | null>(null);
  const [removingAssocId, setRemovingAssocId] = useState<string | null>(null);

  // Edit Association Modal State
  const [editingAssociation, setEditingAssociation] = useState<DbCollectionProduct | null>(null);
  const [editNote, setEditNote] = useState("");
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editSortOrder, setEditSortOrder] = useState<number>(0);
  const [savingAssociation, setSavingAssociation] = useState(false);
  const [associationError, setAssociationError] = useState<string | null>(null);

  // Fetch full collection details for existing collections
  const loadCollectionDetails = useCallback(async (id: string) => {
    setLoadingDetails(true);
    setLoadError(null);
    try {
      const res = await fetchAdminCollectionDetailsAction(id);
      if (res.success && res.data) {
        const c: CollectionWithRelations = res.data;
        setTitle(c.title || "");
        setSlug(c.slug || "");
        setCategory(c.category || "Travel");
        setStatus(c.status || "draft");
        setSortOrder(typeof c.sort_order === "number" ? c.sort_order : 0);
        setCoverImageUrl(c.cover_image_url || "");
        setDescription(c.description || "");
        setSeoTitle(c.seo_title || "");
        setSeoDescription(c.seo_description || "");
        setSections(c.sections || []);
        setCollectionProducts(c.collection_products || []);
        setSlugTouched(true);
      } else {
        setLoadError(res.error || "Failed to load collection details.");
      }
    } catch (err: any) {
      setLoadError(err?.message || "Failed to load collection details.");
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  useEffect(() => {
    if (collectionId) {
      loadCollectionDetails(collectionId);
    }
  }, [collectionId, loadCollectionDetails]);

  // Handle Title change with automatic slug generation if not manually customized
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugTouched) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlug(val);
    setSlugTouched(true);
  };

  // Submit Collection Metadata
  const handleSaveMetadata = async (e: FormEvent) => {
    e.preventDefault();
    setMetadataError(null);
    setMetadataSuccess(null);

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setMetadataError("Collection title is required.");
      return;
    }

    const cleanSlug = (slug.trim() || slugify(cleanTitle)).trim();
    if (!cleanSlug) {
      setMetadataError("A valid URL slug is required.");
      return;
    }

    setSavingMetadata(true);

    if (currentId) {
      // Update existing collection
      const res = await updateCollectionAction(currentId, {
        title: cleanTitle,
        slug: cleanSlug,
        category,
        status,
        sort_order: Number(sortOrder) || 0,
        cover_image_url: coverImageUrl.trim(),
        description: description.trim(),
        seo_title: seoTitle.trim() || null,
        seo_description: seoDescription.trim() || null,
      });
      setSavingMetadata(false);

      if (!res.success) {
        setMetadataError(res.error || "Failed to update collection.");
        return;
      }

      setMetadataSuccess("Collection metadata saved successfully.");
      if (res.data) {
        onSaved(res.data);
      }
    } else {
      // Create new collection
      const res = await createCollectionAction({
        title: cleanTitle,
        slug: cleanSlug,
        category,
        status,
        sort_order: Number(sortOrder) || 0,
        cover_image_url: coverImageUrl.trim(),
        description: description.trim(),
        seo_title: seoTitle.trim() || null,
        seo_description: seoDescription.trim() || null,
      });
      setSavingMetadata(false);

      if (!res.success) {
        setMetadataError(res.error || "Failed to create collection.");
        return;
      }

      if (res.data) {
        setCurrentId(res.data.id);
        setMetadataSuccess("Collection created! You can now manage editorial sections and attach products.");
        onSaved(res.data);
      }
    }
  };

  // Section Management Handlers
  const handleOpenAddSection = () => {
    setEditingSection(null);
    setSectionHeading("");
    setSectionType("narrative");
    setSectionBody("");
    setSectionImageUrl("");
    setSectionSortOrder(sections.length);
    setSectionCtaText("");
    setSectionCtaDestination("");
    setSectionError(null);
    setIsSectionFormOpen(true);
  };

  const handleOpenEditSection = (section: DbCollectionSection) => {
    setEditingSection(section);
    setSectionHeading(section.heading || "");
    setSectionType(section.section_type || "narrative");
    setSectionBody(section.body || "");
    setSectionImageUrl(section.image_url || "");
    setSectionSortOrder(typeof section.sort_order === "number" ? section.sort_order : 0);
    setSectionCtaText(section.cta_text || "");
    setSectionCtaDestination(section.cta_destination || "");
    setSectionError(null);
    setIsSectionFormOpen(true);
  };

  const handleSaveSection = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentId) {
      setSectionError("Save the collection metadata first before adding sections.");
      return;
    }

    const cleanHeading = sectionHeading.trim();
    if (!cleanHeading) {
      setSectionError("Section heading is required.");
      return;
    }

    setSavingSection(true);
    setSectionError(null);

    if (editingSection) {
      // Update existing section
      const res = await updateCollectionSectionAction(editingSection.id, {
        heading: cleanHeading,
        section_type: sectionType,
        body: sectionBody.trim(),
        image_url: sectionImageUrl.trim(),
        sort_order: Number(sectionSortOrder) || 0,
        cta_text: sectionCtaText.trim() || null,
        cta_destination: sectionCtaDestination.trim() || null,
      });
      setSavingSection(false);

      if (!res.success) {
        setSectionError(res.error || "Failed to update section.");
        return;
      }

      if (res.data) {
        const updated = res.data;
        setSections((prev) =>
          prev
            .map((s) => (s.id === updated.id ? updated : s))
            .sort((a, b) => a.sort_order - b.sort_order)
        );
      }
      setIsSectionFormOpen(false);
    } else {
      // Create new section
      const res = await createCollectionSectionAction(currentId, {
        heading: cleanHeading,
        section_type: sectionType,
        body: sectionBody.trim(),
        image_url: sectionImageUrl.trim(),
        sort_order: Number(sectionSortOrder) || 0,
        cta_text: sectionCtaText.trim() || null,
        cta_destination: sectionCtaDestination.trim() || null,
      });
      setSavingSection(false);

      if (!res.success) {
        setSectionError(res.error || "Failed to create section.");
        return;
      }

      if (res.data) {
        const created = res.data;
        setSections((prev) =>
          [...prev, created].sort((a, b) => a.sort_order - b.sort_order)
        );
      }
      setIsSectionFormOpen(false);
    }
  };

  const handleDeleteSection = async (section: DbCollectionSection) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the section "${section.heading}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingSectionId(section.id);
    const res = await deleteCollectionSectionAction(section.id);
    setDeletingSectionId(null);

    if (!res.success) {
      onError(res.error || "Failed to delete section.");
      return;
    }

    setSections((prev) => prev.filter((s) => s.id !== section.id));
  };

  // Reorder Sections Handler
  const handleMoveSection = async (index: number, direction: "up" | "down") => {
    if (!currentId || reordering) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const reordered = [...sections];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    // Reassign sequential sort_orders
    const orders = reordered.map((sec, idx) => ({
      id: sec.id,
      sort_order: idx,
    }));

    // Optimistically update local state
    setSections(
      reordered.map((sec, idx) => ({
        ...sec,
        sort_order: idx,
      }))
    );

    setReordering(true);
    const res = await reorderCollectionSectionsAction(currentId, orders);
    setReordering(false);

    if (!res.success) {
      onError(res.error || "Failed to reorder sections.");
      // Rollback by reloading details
      loadCollectionDetails(currentId);
    }
  };

  // Product Association Handlers
  const handleOpenEditAssociation = (cp: DbCollectionProduct) => {
    setEditingAssociation(cp);
    setEditNote(cp.editorial_note || "");
    setEditIsFeatured(Boolean(cp.is_featured));
    setEditSortOrder(typeof cp.sort_order === "number" ? cp.sort_order : 0);
    setAssociationError(null);
  };

  const handleSaveAssociation = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingAssociation) return;

    setSavingAssociation(true);
    setAssociationError(null);

    // Update using association ID
    const res = await updateCollectionProductAction(editingAssociation.id, {
      editorial_note: editNote.trim(),
      is_featured: editIsFeatured,
      sort_order: Number(editSortOrder) || 0,
    });
    setSavingAssociation(false);

    if (!res.success) {
      setAssociationError(res.error || "Failed to update product association.");
      return;
    }

    if (res.data) {
      const updated = res.data;
      setCollectionProducts((prev) =>
        prev
          .map((item) =>
            item.id === updated.id
              ? { ...updated, product: editingAssociation.product }
              : item
          )
          .sort((a, b) => a.sort_order - b.sort_order)
      );
    } else if (currentId) {
      loadCollectionDetails(currentId);
    }

    setEditingAssociation(null);
    setProductSuccess("Product association updated.");
  };

  const handleToggleFeatured = async (cp: DbCollectionProduct) => {
    const nextVal = !cp.is_featured;
    // Optimistically update
    setCollectionProducts((prev) =>
      prev.map((item) => (item.id === cp.id ? { ...item, is_featured: nextVal } : item))
    );

    const res = await updateCollectionProductAction(cp.id, { is_featured: nextVal });
    if (!res.success) {
      onError(res.error || "Failed to toggle featured status.");
      if (currentId) loadCollectionDetails(currentId);
    }
  };

  const handleRemoveProduct = async (cp: DbCollectionProduct) => {
    const productName = cp.product?.title || "this product";
    const confirmed = window.confirm(
      `Remove this product from the collection? The product will remain in the Paisavasooldaily catalog.`
    );
    if (!confirmed) return;

    setRemovingAssocId(cp.id);
    const res = await removeCollectionProductAction(cp.id);
    setRemovingAssocId(null);

    if (!res.success) {
      onError(res.error || "Failed to remove product from collection.");
      return;
    }

    setCollectionProducts((prev) => prev.filter((item) => item.id !== cp.id));
    setProductSuccess(`Removed "${productName}" from collection.`);
  };

  const handleProductAttached = (newAssoc: DbCollectionProduct) => {
    setCollectionProducts((prev) =>
      [...prev, newAssoc].sort((a, b) => a.sort_order - b.sort_order)
    );
    setProductSuccess("Product added to collection.");
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/80 p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto border-2 border-line bg-paper shadow-hard animate-reveal-up flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b-2 border-line bg-panel px-6 py-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-mono text-[10px] uppercase tracking-widest2 text-accent font-bold">
                Editorial Collection Studio
              </span>
              {currentId && (
                <span className="font-mono text-[10px] text-muted">
                  ID: #{currentId.slice(0, 8)}
                </span>
              )}
            </div>
            <h3 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
              {isEditing ? (title || "Edit Collection") : "New Editorial Collection"}
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

        {/* Modal Navigation Tabs: Metadata, Sections, Products */}
        <div className="flex border-b-2 border-line bg-panel px-6 pt-2 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("metadata")}
            className={`border-t-2 border-x-2 border-line px-5 py-2.5 font-mono text-xs uppercase tracking-widest font-bold transition-all ${
              activeTab === "metadata"
                ? "bg-paper text-ink -mb-[2px] pb-[12px] border-b-0"
                : "bg-panel text-muted hover:text-ink"
            }`}
          >
            1. Collection Details
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sections")}
            className={`border-t-2 border-x-2 border-line px-5 py-2.5 font-mono text-xs uppercase tracking-widest font-bold transition-all flex items-center gap-2 ${
              activeTab === "sections"
                ? "bg-paper text-ink -mb-[2px] pb-[12px] border-b-0"
                : "bg-panel text-muted hover:text-ink"
            }`}
          >
            <span>2. Sections / Slides</span>
            <span className="bg-ink text-paper px-1.5 py-0.2 font-mono text-[10px] rounded-none">
              {sections.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`border-t-2 border-x-2 border-line px-5 py-2.5 font-mono text-xs uppercase tracking-widest font-bold transition-all flex items-center gap-2 ${
              activeTab === "products"
                ? "bg-paper text-ink -mb-[2px] pb-[12px] border-b-0"
                : "bg-panel text-muted hover:text-ink"
            }`}
          >
            <span>3. Attached Products</span>
            <span className="bg-accent text-ink px-1.5 py-0.2 font-mono text-[10px] font-bold rounded-none">
              {collectionProducts.length}
            </span>
          </button>
        </div>

        {/* Loading details overlay */}
        {loadingDetails ? (
          <div className="p-16 text-center">
            <p className="font-mono text-xs uppercase tracking-widest2 text-muted animate-pulse">
              Loading collection data from Supabase…
            </p>
          </div>
        ) : loadError ? (
          <div className="p-8 text-center space-y-4">
            <div className="border border-red-500 bg-red-50 p-4 font-mono text-xs text-red-700">
              <p className="font-bold mb-1">Failed to load collection details:</p>
              <p>{loadError}</p>
            </div>
            <button
              type="button"
              onClick={() => currentId && loadCollectionDetails(currentId)}
              className="border-2 border-line bg-accent px-4 py-2 font-mono text-xs uppercase font-bold text-ink"
            >
              ↻ Try Reloading
            </button>
          </div>
        ) : (
          <div className="p-6">
            {/* TAB 1: COLLECTION METADATA */}
            {activeTab === "metadata" && (
              <form onSubmit={handleSaveMetadata} className="space-y-5">
                {metadataError && (
                  <div className="border-2 border-red-500 bg-red-50 p-3.5 font-mono text-xs text-red-700">
                    {metadataError}
                  </div>
                )}
                {metadataSuccess && (
                  <div className="border-2 border-green-700 bg-green-50 p-3.5 font-mono text-xs text-green-800">
                    {metadataSuccess}
                  </div>
                )}

                {/* Section A: Core Identity */}
                <div className="border border-line/40 bg-panel/30 p-4 space-y-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-accent block border-b border-line/20 pb-1">
                    A. Core Identity & Category
                  </span>

                  <Field label="Collection Title" hint="Display title in discovery cards and page header" required>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Minimalist Travel Essentials for 2026"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className={inputClasses}
                    />
                  </Field>

                  <Field label="URL Slug" hint="URL path: /collections/[slug]" required>
                    <input
                      required
                      type="text"
                      placeholder="e.g. minimalist-travel-essentials-2026"
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      className={inputClasses}
                    />
                  </Field>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field label="Canonical Category" required>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as CollectionCategory)}
                        className={inputClasses}
                      >
                        {CANONICAL_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Status" hint="Public visibility" required>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as CollectionStatus)}
                        className={inputClasses}
                      >
                        {CANONICAL_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st === "draft" && "Draft (Admin Only)"}
                            {st === "published" && "Published (Live on Storefront)"}
                            {st === "archived" && "Archived"}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Sort Order" hint="Lower appears first">
                      <input
                        type="number"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                        className={inputClasses}
                      />
                    </Field>
                  </div>
                </div>

                {/* Section B: Visuals & Narrative */}
                <div className="border border-line/40 bg-panel/30 p-4 space-y-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-accent block border-b border-line/20 pb-1">
                    B. Narrative & Imagery
                  </span>

                  <Field label="Cover Image URL" hint="Direct HTTPS image link for card header">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                      className={inputClasses}
                    />
                  </Field>

                  <Field label="Editorial Summary / Description" hint="Topic thesis and curation perspective">
                    <textarea
                      rows={3}
                      placeholder="Describe the editorial thesis, product selection criteria, and why these items work together…"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={inputClasses}
                    />
                  </Field>
                </div>

                {/* Section C: SEO Metadata */}
                <div className="border border-line/40 bg-panel/30 p-4 space-y-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-accent block border-b border-line/20 pb-1">
                    C. Search Engine Optimization (Optional)
                  </span>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="SEO Title" hint="Custom browser <title> tag">
                      <input
                        type="text"
                        placeholder="Default is collection title if blank"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        className={inputClasses}
                      />
                    </Field>

                    <Field label="SEO Description" hint="Meta description snippet for search engines">
                      <textarea
                        rows={2}
                        placeholder="Search result summary snippet…"
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        className={inputClasses}
                      />
                    </Field>
                  </div>
                </div>

                {/* Save button bar */}
                <div className="flex items-center justify-between pt-4 border-t-2 border-line">
                  <span className="font-mono text-xs text-muted">
                    {currentId ? "Changes apply immediately to this collection." : "Save details to unlock editorial sections and product attachments."}
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="border-2 border-line bg-paper px-4 py-2 font-mono text-xs uppercase tracking-widest font-bold hover:bg-panel"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingMetadata}
                      className="border-2 border-line bg-accent px-6 py-2.5 font-mono text-xs uppercase tracking-widest2 font-bold text-ink shadow-hard-sm hover:bg-ink hover:text-paper disabled:opacity-50 transition-all"
                    >
                      {savingMetadata ? "Saving Collection…" : isEditing ? "💾 Save Collection Details" : "🚀 Create Collection"}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* TAB 2: EDITORIAL SECTIONS / SLIDES */}
            {activeTab === "sections" && (
              <div className="space-y-6">
                {!currentId ? (
                  <div className="p-8 border-2 border-dashed border-line bg-panel text-center space-y-3">
                    <p className="font-mono text-sm font-bold uppercase text-ink">
                      ⚠️ Collection Must Be Saved First
                    </p>
                    <p className="font-mono text-xs text-muted max-w-md mx-auto">
                      Please return to the &quot;1. Collection Details&quot; tab and save your collection title and slug before adding editorial sections or slides.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("metadata")}
                      className="border-2 border-line bg-accent px-4 py-2 font-mono text-xs uppercase tracking-widest font-bold text-ink hover:bg-ink hover:text-paper"
                    >
                      ← Go to Collection Details
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Header and Add Section Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-line pb-4">
                      <div>
                        <h4 className="font-display text-lg font-bold uppercase tracking-tight text-ink">
                          Editorial Narrative Sections
                        </h4>
                        <p className="font-mono text-xs text-muted">
                          Organize your topic presentation into structured slides and visual takeaways.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleOpenAddSection}
                        className="border-2 border-line bg-accent px-4 py-2 font-mono text-xs uppercase tracking-widest2 font-bold text-ink shadow-hard-sm hover:bg-ink hover:text-paper transition-colors shrink-0"
                      >
                        ➕ Add Section / Slide
                      </button>
                    </div>

                    {/* Section List */}
                    {sections.length === 0 ? (
                      <div className="p-12 border-2 border-line bg-paper text-center space-y-3">
                        <p className="font-mono text-sm uppercase tracking-widest2 text-muted">
                          No editorial sections created yet.
                        </p>
                        <p className="font-mono text-xs text-muted/70 max-w-md mx-auto">
                          Add slides like &quot;The Problem&quot;, &quot;What to Look For&quot;, or &quot;Why This Set Works&quot; to guide the reader.
                        </p>
                        <button
                          type="button"
                          onClick={handleOpenAddSection}
                          className="border-2 border-line bg-accent px-4 py-2 font-mono text-xs uppercase tracking-widest font-bold text-ink hover:bg-ink hover:text-paper"
                        >
                          ➕ Add First Section
                        </button>
                      </div>
                    ) : (
                      <ul className="space-y-3">
                        {sections.map((section, idx) => {
                          const typeInfo = CANONICAL_SECTION_TYPES.find(
                            (t) => t.value === section.section_type
                          );

                          return (
                            <li
                              key={section.id}
                              className="border-2 border-line bg-panel/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-accent transition-colors"
                            >
                              {/* Left: Reorder Controls + Info */}
                              <div className="flex items-start sm:items-center gap-3 min-w-0">
                                {/* Up / Down Order Buttons */}
                                <div className="flex flex-col gap-1 shrink-0">
                                  <button
                                    type="button"
                                    title="Move up"
                                    disabled={idx === 0 || reordering}
                                    onClick={() => handleMoveSection(idx, "up")}
                                    className="border border-line bg-paper h-6 w-6 flex items-center justify-center font-mono text-xs font-bold hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    ▲
                                  </button>
                                  <button
                                    type="button"
                                    title="Move down"
                                    disabled={idx === sections.length - 1 || reordering}
                                    onClick={() => handleMoveSection(idx, "down")}
                                    className="border border-line bg-paper h-6 w-6 flex items-center justify-center font-mono text-xs font-bold hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    ▼
                                  </button>
                                </div>

                                {/* Order & Image */}
                                <span className="font-mono text-xs font-bold text-muted shrink-0 w-6 text-center">
                                  #{idx + 1}
                                </span>

                                {section.image_url ? (
                                  <div className="h-12 w-16 shrink-0 border border-line bg-white p-0.5 overflow-hidden flex items-center justify-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={section.image_url}
                                      alt={section.heading}
                                      className="max-h-full max-w-full w-auto h-auto object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="h-12 w-16 shrink-0 border border-line bg-panel flex items-center justify-center font-mono text-[9px] uppercase text-muted text-center px-1">
                                    No img
                                  </div>
                                )}

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="border border-line bg-paper px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest font-bold text-accent">
                                      {typeInfo?.label || section.section_type}
                                    </span>
                                    {section.cta_text && (
                                      <span className="font-mono text-[10px] text-muted truncate max-w-[200px]">
                                        CTA: &quot;{section.cta_text}&quot;
                                      </span>
                                    )}
                                  </div>
                                  <h5 className="font-display text-sm font-bold text-ink truncate">
                                    {section.heading}
                                  </h5>
                                  {section.body && (
                                    <p className="font-mono text-xs text-muted truncate max-w-xl">
                                      {section.body}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Right: Actions */}
                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditSection(section)}
                                  className="border-2 border-line bg-paper px-3 py-1.5 font-mono text-xs uppercase tracking-widest font-bold text-ink hover:bg-accent transition-colors"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  type="button"
                                  disabled={deletingSectionId === section.id}
                                  onClick={() => handleDeleteSection(section)}
                                  className="border-2 border-line bg-paper px-3 py-1.5 font-mono text-xs uppercase tracking-widest font-bold text-red-700 hover:bg-red-700 hover:text-paper disabled:opacity-50 transition-colors"
                                >
                                  {deletingSectionId === section.id ? "Deleting…" : "🗑️ Delete"}
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                )}
              </div>
            )}

            {/* TAB 3: ATTACHED PRODUCTS */}
            {activeTab === "products" && (
              <div className="space-y-6">
                {!currentId ? (
                  <div className="p-8 border-2 border-dashed border-line bg-panel text-center space-y-3">
                    <p className="font-mono text-sm font-bold uppercase text-ink">
                      ⚠️ Collection Must Be Saved First
                    </p>
                    <p className="font-mono text-xs text-muted max-w-md mx-auto">
                      Please return to the &quot;1. Collection Details&quot; tab and save your collection before attaching products.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("metadata")}
                      className="border-2 border-line bg-accent px-4 py-2 font-mono text-xs uppercase tracking-widest font-bold text-ink hover:bg-ink hover:text-paper"
                    >
                      ← Go to Collection Details
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Header and Attach Product Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-line pb-4">
                      <div>
                        <h4 className="font-display text-lg font-bold uppercase tracking-tight text-ink">
                          Curated Products ({collectionProducts.length})
                        </h4>
                        <p className="font-mono text-xs text-muted">
                          Associate existing catalog items with editorial notes and featured designations.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setProductSuccess(null);
                          setIsProductPickerOpen(true);
                        }}
                        className="border-2 border-line bg-accent px-4 py-2 font-mono text-xs uppercase tracking-widest2 font-bold text-ink shadow-hard-sm hover:bg-ink hover:text-paper transition-colors shrink-0"
                      >
                        ➕ Attach Products
                      </button>
                    </div>

                    {/* Product Action Success Feedback */}
                    {productSuccess && (
                      <div className="border border-green-700 bg-green-50 p-3 font-mono text-xs text-green-800 flex items-center justify-between">
                        <span>{productSuccess}</span>
                        <button
                          type="button"
                          onClick={() => setProductSuccess(null)}
                          className="font-mono text-xs text-green-800 hover:text-ink"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {/* Attached Products List */}
                    {collectionProducts.length === 0 ? (
                      <div className="p-12 border-2 border-line bg-paper text-center space-y-3">
                        <p className="font-mono text-sm uppercase tracking-widest2 text-muted">
                          No products attached to this collection yet.
                        </p>
                        <p className="font-mono text-xs text-muted/70 max-w-md mx-auto">
                          Attach items from your catalog to make this collection actionable for storefront discovery.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setProductSuccess(null);
                            setIsProductPickerOpen(true);
                          }}
                          className="border-2 border-line bg-accent px-4 py-2 font-mono text-xs uppercase tracking-widest font-bold text-ink hover:bg-ink hover:text-paper"
                        >
                          ➕ Attach First Product
                        </button>
                      </div>
                    ) : (
                      <ul className="space-y-3">
                        {collectionProducts.map((cp, idx) => {
                          const prod = cp.product;
                          const titleText = prod?.title || `Product #${cp.product_id.slice(0, 8)}`;
                          const categoryText = prod?.category || "Catalog Item";
                          const imageUrl = prod?.image_url;

                          return (
                            <li
                              key={cp.id}
                              className="border-2 border-line bg-panel/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-accent transition-colors"
                            >
                              {/* Left: Thumbnail & Details */}
                              <div className="flex items-start sm:items-center gap-3 min-w-0">
                                <span className="font-mono text-xs font-bold text-muted shrink-0 w-6 text-center">
                                  #{idx + 1}
                                </span>

                                {imageUrl ? (
                                  <div className="h-14 w-14 shrink-0 border border-line bg-white p-0.5 overflow-hidden flex items-center justify-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={imageUrl}
                                      alt={titleText}
                                      className="max-h-full max-w-full w-auto h-auto object-contain"
                                    />
                                  </div>
                                ) : (
                                  <div className="h-14 w-14 shrink-0 border border-line bg-panel flex items-center justify-center font-mono text-[9px] uppercase text-muted text-center px-1">
                                    No img
                                  </div>
                                )}

                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className="border border-line bg-paper px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest font-bold text-muted">
                                      {categoryText}
                                    </span>

                                    {cp.is_featured ? (
                                      <span className="bg-accent border border-line px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest font-bold text-ink">
                                        ⭐ Featured Pick
                                      </span>
                                    ) : null}

                                    <span className="font-mono text-[10px] text-muted border border-line/40 px-1.5 py-0.5">
                                      Order #{cp.sort_order}
                                    </span>
                                  </div>

                                  <h5 className="font-display text-sm font-bold text-ink truncate">
                                    {titleText}
                                  </h5>

                                  {cp.editorial_note ? (
                                    <p className="font-mono text-xs text-ink/80 italic border-l-2 border-accent pl-2 mt-1 truncate max-w-xl">
                                      &quot;{cp.editorial_note}&quot;
                                    </p>
                                  ) : (
                                    <p className="font-mono text-[11px] text-muted/60 mt-0.5">
                                      (No editorial note added)
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Right: Actions */}
                              <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleFeatured(cp)}
                                  title="Toggle Featured Status"
                                  className={`border-2 border-line px-3 py-1.5 font-mono text-xs uppercase tracking-widest font-bold transition-colors ${
                                    cp.is_featured
                                      ? "bg-accent text-ink"
                                      : "bg-paper text-muted hover:text-ink"
                                  }`}
                                >
                                  {cp.is_featured ? "⭐ Featured" : "☆ Make Hero"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenEditAssociation(cp)}
                                  className="border-2 border-line bg-paper px-3 py-1.5 font-mono text-xs uppercase tracking-widest font-bold text-ink hover:bg-accent transition-colors"
                                >
                                  ✏️ Edit Note
                                </button>

                                <button
                                  type="button"
                                  disabled={removingAssocId === cp.id}
                                  onClick={() => handleRemoveProduct(cp)}
                                  className="border-2 border-line bg-paper px-3 py-1.5 font-mono text-xs uppercase tracking-widest font-bold text-red-700 hover:bg-red-700 hover:text-paper disabled:opacity-50 transition-colors"
                                >
                                  {removingAssocId === cp.id ? "Removing…" : "🗑️ Remove"}
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Section Form Modal (Create or Edit Section) */}
        {isSectionFormOpen && (
          <div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/90 p-4 sm:p-6 overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-line bg-paper shadow-hard animate-reveal-up p-6 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-line pb-3">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest2 text-accent font-bold">
                    Section Editor
                  </span>
                  <h4 className="font-display text-lg font-bold uppercase tracking-tight text-ink">
                    {editingSection ? `Edit Section: ${editingSection.heading}` : "New Editorial Section"}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSectionFormOpen(false)}
                  aria-label="Close modal"
                  className="border-2 border-line bg-paper h-8 w-8 flex items-center justify-center font-mono text-sm font-bold text-muted hover:text-ink hover:bg-accent transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveSection} className="space-y-4">
                {sectionError && (
                  <div className="border border-red-500 bg-red-50 p-3 font-mono text-xs text-red-700">
                    {sectionError}
                  </div>
                )}

                <Field label="Section Heading" hint="Clear, engaging slide headline" required>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Why We Chose These 4 Items"
                    value={sectionHeading}
                    onChange={(e) => setSectionHeading(e.target.value)}
                    className={inputClasses}
                  />
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Section Type" hint="Defines visual layout presentation" required>
                    <select
                      value={sectionType}
                      onChange={(e) => setSectionType(e.target.value as CollectionSectionType)}
                      className={inputClasses}
                    >
                      {CANONICAL_SECTION_TYPES.map((st) => (
                        <option key={st.value} value={st.value}>
                          {st.label} — {st.desc}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Sort Order" hint="Position order in slide carousel">
                    <input
                      type="number"
                      value={sectionSortOrder}
                      onChange={(e) => setSectionSortOrder(parseInt(e.target.value, 10) || 0)}
                      className={inputClasses}
                    />
                  </Field>
                </div>

                <Field label="Image URL" hint="Optional hero or infographic image link">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={sectionImageUrl}
                    onChange={(e) => setSectionImageUrl(e.target.value)}
                    className={inputClasses}
                  />
                </Field>

                <Field label="Section Narrative / Body" hint="Detailed editorial commentary">
                  <textarea
                    rows={4}
                    placeholder="Explain the trade-offs, findings, and reasons behind this recommendation…"
                    value={sectionBody}
                    onChange={(e) => setSectionBody(e.target.value)}
                    className={inputClasses}
                  />
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Call to Action (CTA) Button Text" hint="e.g. Compare Key Specs">
                    <input
                      type="text"
                      placeholder="e.g. Compare Specs"
                      value={sectionCtaText}
                      onChange={(e) => setSectionCtaText(e.target.value)}
                      className={inputClasses}
                    />
                  </Field>

                  <Field label="CTA Destination URL" hint="e.g. #comparison or /compare">
                    <input
                      type="text"
                      placeholder="e.g. #comparison or /guides/travel"
                      value={sectionCtaDestination}
                      onChange={(e) => setSectionCtaDestination(e.target.value)}
                      className={inputClasses}
                    />
                  </Field>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-line/20">
                  <button
                    type="button"
                    onClick={() => setIsSectionFormOpen(false)}
                    className="border-2 border-line bg-paper px-4 py-2 font-mono text-xs uppercase tracking-widest font-bold hover:bg-panel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingSection}
                    className="border-2 border-line bg-accent px-5 py-2 font-mono text-xs uppercase tracking-widest font-bold text-ink shadow-hard-sm hover:bg-ink hover:text-paper disabled:opacity-50"
                  >
                    {savingSection ? "Saving Section…" : editingSection ? "Update Section" : "Create Section"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Association Modal */}
        {editingAssociation && (
          <div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/90 p-4 sm:p-6 overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative w-full max-w-lg overflow-y-auto border-2 border-line bg-paper shadow-hard animate-reveal-up p-6 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-line pb-3">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest2 text-accent font-bold">
                    Edit Association Metadata
                  </span>
                  <h4 className="font-display text-base font-bold uppercase tracking-tight text-ink truncate max-w-sm">
                    {editingAssociation.product?.title || "Curated Product"}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingAssociation(null)}
                  aria-label="Close modal"
                  className="border-2 border-line bg-paper h-8 w-8 flex items-center justify-center font-mono text-sm font-bold text-muted hover:text-ink hover:bg-accent transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveAssociation} className="space-y-4">
                {associationError && (
                  <div className="border border-red-500 bg-red-50 p-3 font-mono text-xs text-red-700">
                    {associationError}
                  </div>
                )}

                <Field label="Editorial Curator Note" hint="Note explaining why this product belongs here">
                  <textarea
                    rows={3}
                    placeholder="e.g. Best overall value for international carry-on compliance…"
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    className={inputClasses}
                  />
                </Field>

                <div className="border border-line bg-panel p-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold block text-ink">
                      ⭐ Featured Hero Status
                    </span>
                    <span className="font-mono text-[10px] text-muted">
                      Marks product as the standout recommendation in this collection.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={editIsFeatured}
                    onChange={(e) => setEditIsFeatured(e.target.checked)}
                    className="h-4 w-4 accent-accent border-2 border-line cursor-pointer"
                  />
                </div>

                <Field label="Sort Order" hint="Position order among collection items">
                  <input
                    type="number"
                    value={editSortOrder}
                    onChange={(e) => setEditSortOrder(parseInt(e.target.value, 10) || 0)}
                    className={inputClasses}
                  />
                </Field>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-line/20">
                  <button
                    type="button"
                    onClick={() => setEditingAssociation(null)}
                    className="border-2 border-line bg-paper px-4 py-2 font-mono text-xs uppercase tracking-widest font-bold hover:bg-panel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingAssociation}
                    className="border-2 border-line bg-accent px-5 py-2 font-mono text-xs uppercase tracking-widest font-bold text-ink shadow-hard-sm hover:bg-ink hover:text-paper disabled:opacity-50"
                  >
                    {savingAssociation ? "Saving…" : "Save Association"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Product Picker Modal */}
        {isProductPickerOpen && currentId && (
          <CollectionProductPickerModal
            collectionId={currentId}
            catalogProducts={catalogProducts}
            attachedProductIds={collectionProducts.map((cp) => cp.product_id)}
            attachedProductsCount={collectionProducts.length}
            onClose={() => {
              setIsProductPickerOpen(false);
              loadCollectionDetails(currentId);
            }}
            onProductAttached={handleProductAttached}
            onError={onError}
          />
        )}
      </div>
    </div>
  );
}
