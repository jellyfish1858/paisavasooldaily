"use client";

import { useState, useEffect, useMemo, type FormEvent } from "react";
import {
  fetchProductsAction,
  addCollectionProductAction,
} from "@/app/secure-admin-panel/actions";
import type { DbProduct, DbCollectionProduct } from "@/utils/supabase/types";

interface CollectionProductPickerModalProps {
  collectionId: string;
  catalogProducts?: DbProduct[];
  attachedProductIds: string[];
  attachedProductsCount: number;
  onClose: () => void;
  onProductAttached: (newAssociation: DbCollectionProduct) => void;
  onError: (message: string) => void;
}

const inputClasses =
  "w-full border-2 border-line bg-paper px-4 py-2 text-xs font-mono text-ink placeholder:text-muted/70 focus:border-accent focus:bg-white focus:outline-none transition-colors";

export default function CollectionProductPickerModal({
  collectionId,
  catalogProducts,
  attachedProductIds,
  attachedProductsCount,
  onClose,
  onProductAttached,
  onError,
}: CollectionProductPickerModalProps) {
  const [products, setProducts] = useState<DbProduct[]>(catalogProducts || []);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(!catalogProducts || catalogProducts.length === 0);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Selection & Attachment form state
  const [selectedProduct, setSelectedProduct] = useState<DbProduct | null>(null);
  const [editorialNote, setEditorialNote] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState<number>(attachedProductsCount);
  const [submitting, setSubmitting] = useState(false);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [attachSuccessMsg, setAttachSuccessMsg] = useState<string | null>(null);

  // Track product IDs attached in this active session
  const [attachedInSession, setAttachedInSession] = useState<string[]>([]);

  // If catalogProducts was not provided, fetch them via fetchProductsAction
  useEffect(() => {
    if (!catalogProducts || catalogProducts.length === 0) {
      const loadCatalog = async () => {
        setLoadingProducts(true);
        setFetchError(null);
        try {
          const res = await fetchProductsAction();
          if (res.success && res.data) {
            setProducts(res.data);
          } else {
            setFetchError(res.error || "Failed to load products catalogue.");
          }
        } catch (err: any) {
          setFetchError(err?.message || "Failed to load products catalogue.");
        } finally {
          setLoadingProducts(false);
        }
      };
      loadCatalog();
    }
  }, [catalogProducts]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category.trim());
    });
    return ["ALL", ...Array.from(set)];
  }, [products]);

  // Available products: exclude products already attached and those attached in this session
  const availableProducts = useMemo(() => {
    const excluded = new Set([...attachedProductIds, ...attachedInSession]);
    return products.filter((p) => {
      if (excluded.has(p.id)) return false;

      const matchesCategory =
        categoryFilter === "ALL" ||
        p.category?.toLowerCase() === categoryFilter.toLowerCase();

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [products, attachedProductIds, attachedInSession, categoryFilter, searchQuery]);

  // Handle product selection
  const handleSelectProduct = (prod: DbProduct) => {
    setSelectedProduct(prod);
    setEditorialNote("");
    setIsFeatured(false);
    setSortOrder(attachedProductsCount + attachedInSession.length);
    setAttachError(null);
    setAttachSuccessMsg(null);
  };

  // Submit product attachment
  const handleAttachSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setSubmitting(true);
    setAttachError(null);
    setAttachSuccessMsg(null);

    const targetProduct = selectedProduct;
    const res = await addCollectionProductAction(collectionId, targetProduct.id, {
      editorial_note: editorialNote.trim(),
      is_featured: isFeatured,
      sort_order: Number(sortOrder) || 0,
    });
    setSubmitting(false);

    if (!res.success) {
      setAttachError(res.error || "Failed to attach product to collection.");
      return;
    }

    // Success: mark as attached in this session
    setAttachedInSession((prev) => [...prev, targetProduct.id]);
    setAttachSuccessMsg(`✓ Successfully attached "${targetProduct.title}" to collection.`);

    // Reset selection form so admin can immediately pick another product
    setSelectedProduct(null);
    setEditorialNote("");
    setIsFeatured(false);

    if (res.data) {
      onProductAttached({
        ...res.data,
        product: targetProduct,
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/90 p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto border-2 border-line bg-paper shadow-hard animate-reveal-up flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b-2 border-line bg-panel px-6 py-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-accent font-bold">
              Product Association Picker
            </span>
            <h3 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
              Attach Products to Collection
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

        {/* Multi-add feedback banner */}
        {attachSuccessMsg && (
          <div className="border-b-2 border-green-700 bg-green-50 px-6 py-3 font-mono text-xs text-green-800 flex items-center justify-between">
            <span>{attachSuccessMsg}</span>
            <span className="text-[10px] text-green-700 font-bold uppercase tracking-wider">
              {attachedInSession.length} added this session
            </span>
          </div>
        )}

        {/* Error banner */}
        {attachError && (
          <div className="border-b-2 border-red-500 bg-red-50 px-6 py-3 font-mono text-xs text-red-700">
            {attachError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
          {/* Left Column (Catalog Browser): 7 cols */}
          <div className="md:col-span-7 border-b-2 md:border-b-0 md:border-r-2 border-line flex flex-col p-4 sm:p-6 space-y-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-accent">
                Catalog Products
              </span>
              <p className="font-mono text-xs text-muted mt-0.5">
                Select an existing product from the SmartChoice catalog.
              </p>
            </div>

            {/* Search Box & Category Filters */}
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search catalog products…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={inputClasses}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-2 font-mono text-xs text-muted hover:text-ink"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`border border-line px-2 py-0.5 font-mono text-[10px] uppercase font-bold transition-all ${
                      categoryFilter === cat
                        ? "bg-ink text-paper"
                        : "bg-paper text-ink hover:bg-panel"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Counter */}
            <div className="font-mono text-[11px] text-muted flex items-center justify-between">
              <span>{availableProducts.length} available to attach</span>
              {attachedInSession.length > 0 && (
                <span className="text-accent font-bold">
                  ({attachedInSession.length} attached in this session)
                </span>
              )}
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto max-h-[350px] border border-line divide-y divide-line/20 bg-paper">
              {loadingProducts ? (
                <div className="p-8 text-center font-mono text-xs text-muted animate-pulse">
                  Loading catalog products…
                </div>
              ) : fetchError ? (
                <div className="p-6 text-center space-y-2">
                  <p className="font-mono text-xs text-red-600">{fetchError}</p>
                </div>
              ) : availableProducts.length === 0 ? (
                <div className="p-8 text-center space-y-1">
                  <p className="font-mono text-xs text-muted uppercase tracking-wider">
                    No available products match
                  </p>
                  <p className="font-mono text-[10px] text-muted/70">
                    All matching products may already be attached to this collection.
                  </p>
                </div>
              ) : (
                availableProducts.map((p) => {
                  const isSelected = selectedProduct?.id === p.id;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectProduct(p)}
                      className={`w-full text-left p-3 flex items-center gap-3 transition-colors ${
                        isSelected
                          ? "bg-accent/20 border-l-4 border-l-accent"
                          : "hover:bg-panel/50"
                      }`}
                    >
                      {p.image_url ? (
                        <div className="h-12 w-12 shrink-0 border border-line bg-white p-0.5 overflow-hidden flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.image_url}
                            alt={p.title}
                            className="max-h-full max-w-full w-auto h-auto object-contain"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 shrink-0 border border-line bg-panel flex items-center justify-center font-mono text-[8px] uppercase text-muted">
                          No img
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="border border-line bg-panel px-1.5 py-0.2 font-mono text-[9px] uppercase font-bold text-muted">
                            {p.category}
                          </span>
                          {p.badge && (
                            <span className="bg-accent px-1.5 py-0.2 font-mono text-[9px] uppercase font-bold text-ink">
                              {p.badge}
                            </span>
                          )}
                        </div>
                        <p className="font-display text-xs font-bold text-ink truncate">
                          {p.title}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 font-mono text-xs font-bold px-2 py-1 border border-line ${
                          isSelected
                            ? "bg-ink text-paper"
                            : "bg-paper text-ink"
                        }`}
                      >
                        {isSelected ? "Selected ✓" : "Select"}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column (Attachment Form): 5 cols */}
          <div className="md:col-span-5 p-4 sm:p-6 flex flex-col justify-between bg-panel/20">
            {selectedProduct ? (
              <form onSubmit={handleAttachSubmit} className="space-y-4">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-accent">
                    Association Metadata
                  </span>
                  <h4 className="font-display text-base font-bold text-ink truncate mt-1">
                    {selectedProduct.title}
                  </h4>
                  <p className="font-mono text-[10px] text-muted">
                    Category: {selectedProduct.category}
                  </p>
                </div>

                {/* Editorial Note */}
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                    Editorial Note
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Why this item belongs in this collection (e.g. 'Best ultralight option under 100g')…"
                    value={editorialNote}
                    onChange={(e) => setEditorialNote(e.target.value)}
                    className={inputClasses}
                  />
                  <span className="font-mono text-[10px] text-muted mt-0.5 block">
                    Curator note displayed alongside this product card.
                  </span>
                </div>

                {/* Featured Status Toggle */}
                <div className="border border-line bg-paper p-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold block text-ink">
                      ⭐ Featured Product
                    </span>
                    <span className="font-mono text-[10px] text-muted">
                      Highlights this item as hero recommendation.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="h-4 w-4 accent-accent border-2 border-line cursor-pointer"
                  />
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                    className={inputClasses}
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full border-2 border-line bg-accent py-3 font-mono text-xs uppercase tracking-widest2 font-bold text-ink shadow-hard-sm hover:bg-ink hover:text-paper disabled:opacity-50 transition-all"
                  >
                    {submitting ? "Attaching Product…" : "➕ Attach to Collection"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-line bg-panel/40 space-y-2">
                <span className="text-2xl">👈</span>
                <p className="font-mono text-xs uppercase font-bold text-ink">
                  Select a Product to Attach
                </p>
                <p className="font-mono text-[10px] text-muted max-w-xs">
                  Choose an item from the catalog on the left to configure its curation note and featured status.
                </p>
              </div>
            )}

            {/* Bottom Close / Done bar */}
            <div className="pt-4 border-t border-line/30 flex items-center justify-between mt-4">
              <span className="font-mono text-[10px] text-muted">
                {attachedInSession.length > 0
                  ? `${attachedInSession.length} attached so far`
                  : "Zero catalog duplicate records created"}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="border-2 border-line bg-paper px-4 py-2 font-mono text-xs uppercase tracking-widest font-bold hover:bg-ink hover:text-paper transition-colors"
              >
                Done / Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
