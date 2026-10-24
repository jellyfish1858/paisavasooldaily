"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { deleteCollectionAction } from "@/app/secure-admin-panel/actions";
import CollectionStudioModal from "./CollectionStudioModal";
import type { DbCollection, DbProduct, CollectionCategory } from "@/utils/supabase/types";

type Props = {
  collections: DbCollection[];
  catalogProducts?: DbProduct[];
  loading?: boolean;
  loadError?: string | null;
  onRefresh: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

const CANONICAL_CATEGORIES: readonly CollectionCategory[] = [
  "Travel",
  "Beauty & Personal Care",
  "Electronics & Tech Accessories",
] as const;

export default function CollectionManager({
  collections,
  catalogProducts,
  loading = false,
  loadError = null,
  onRefresh,
  onSuccess,
  onError,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Collection Studio Modal State (handles both new and edit)
  const [studioCollectionId, setStudioCollectionId] = useState<string | null>(null);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // Filtered collections based on search query and category
  const filteredCollections = useMemo(() => {
    return collections.filter((item) => {
      const matchesCategory =
        categoryFilter === "ALL" || item.category === categoryFilter;

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.slug.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [collections, categoryFilter, searchQuery]);

  const handleDelete = async (collection: DbCollection) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${collection.title}"?\n\nWARNING: Deleting this collection is permanent and will automatically delete all of its editorial sections and product associations.`
    );
    if (!confirmed) return;

    setDeletingId(collection.id);
    const res = await deleteCollectionAction(collection.id);
    setDeletingId(null);

    if (!res.success) {
      onError(res.error || "Failed to delete collection.");
      return;
    }

    onSuccess(`Collection "${collection.title}" was permanently deleted.`);
    onRefresh();
  };

  const handleOpenCreate = () => {
    setStudioCollectionId(null);
    setIsStudioOpen(true);
  };

  const handleOpenEdit = (collection: DbCollection) => {
    setStudioCollectionId(collection.id);
    setIsStudioOpen(true);
  };

  return (
    <div className="border-2 border-line bg-paper shadow-hard space-y-0">
      {/* Header with Title, Count, Refresh, and Create Collection Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-line bg-panel px-6 py-4 sm:px-8">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold">
            Editorial Discovery
          </span>
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-ink">
            Editorial Collections
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-widest2 text-muted">
            {collections.length.toString().padStart(2, "0")} Total
          </span>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="border-2 border-line bg-paper px-3 py-1.5 font-mono text-xs uppercase tracking-widest2 font-bold hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
          >
            {loading ? "Loading…" : "↻ Refresh"}
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="border-2 border-line bg-accent px-4 py-1.5 font-mono text-xs uppercase tracking-widest2 font-bold text-ink shadow-hard-sm hover:bg-ink hover:text-paper transition-colors"
          >
            ➕ Create Collection
          </button>
        </div>
      </div>

      {/* Database Setup Notice / Error Banner */}
      {loadError && (
        <div className="border-b-2 border-line bg-red-50 p-6 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-red-700">⚠️ DATABASE SETUP NOTICE:</span>
          </div>
          <p className="font-mono text-xs text-red-800">
            {loadError}
          </p>
          <p className="font-mono text-[11px] text-muted">
            If you have not yet applied the collections migration, run{" "}
            <code className="bg-white px-1.5 py-0.5 border border-line text-ink font-bold">
              supabase/migrations/20261021120000_create_editorial_collections.sql
            </code>{" "}
            against your Supabase database.
          </p>
          <button
            type="button"
            onClick={onRefresh}
            className="mt-2 border-2 border-line bg-paper px-3 py-1 font-mono text-xs font-bold uppercase hover:bg-ink hover:text-paper"
          >
            ↻ Try Again
          </button>
        </div>
      )}

      {/* Search & Category Filter Box */}
      <div className="border-b-2 border-line bg-paper p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search collections by title or slug…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-2 border-line bg-panel px-4 py-2.5 font-mono text-xs text-ink placeholder:text-muted/70 focus:border-accent focus:bg-white focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 font-mono text-xs text-muted hover:text-ink"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setCategoryFilter("ALL")}
              className={`border-2 border-line px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider font-bold transition-all ${
                categoryFilter === "ALL"
                  ? "bg-ink text-paper"
                  : "bg-paper text-ink hover:bg-panel"
              }`}
            >
              ALL
            </button>
            {CANONICAL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`border-2 border-line px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider font-bold transition-all ${
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
        <div className="flex items-center justify-between font-mono text-xs text-muted">
          <span>
            Displaying <strong>{filteredCollections.length}</strong> of {collections.length} collections
          </span>
          {categoryFilter !== "ALL" && (
            <button
              type="button"
              onClick={() => setCategoryFilter("ALL")}
              className="underline text-accent hover:text-ink text-xs font-bold"
            >
              Clear Category Filter
            </button>
          )}
        </div>
      </div>

      {/* Collections List or State */}
      {loading ? (
        <div className="p-16 text-center">
          <p className="font-mono text-xs uppercase tracking-widest2 text-muted animate-pulse">
            Loading editorial collections from Supabase…
          </p>
        </div>
      ) : collections.length === 0 ? (
        <div className="p-12 text-center space-y-3">
          <p className="font-mono text-sm uppercase tracking-widest2 text-muted">
            No editorial collections found in database yet.
          </p>
          <p className="font-mono text-xs text-muted/70 max-w-md mx-auto">
            Use the &quot;➕ Create Collection&quot; button above to create your first topic-led curated collection.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="border-2 border-line bg-accent px-4 py-2 font-mono text-xs uppercase tracking-widest font-bold text-ink hover:bg-ink hover:text-paper transition-colors"
          >
            ➕ Create First Collection
          </button>
        </div>
      ) : filteredCollections.length === 0 ? (
        <div className="p-12 text-center space-y-3">
          <p className="font-mono text-sm uppercase tracking-widest2 text-muted">
            No collections match &quot;{searchQuery}&quot;
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setCategoryFilter("ALL");
            }}
            className="border-2 border-line bg-accent px-4 py-2 font-mono text-xs uppercase tracking-widest font-bold text-ink"
          >
            Reset Search & Filters
          </button>
        </div>
      ) : (
        <ul className="divide-y-2 divide-line/15">
          {filteredCollections.map((collection) => {
            const isPublished = collection.status === "published";

            return (
              <li
                key={collection.id}
                className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between hover:bg-panel/40 transition-colors"
              >
                {/* Info & Cover Thumbnail */}
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  {collection.cover_image_url ? (
                    <div className="h-16 w-20 shrink-0 border-2 border-line bg-white p-1 overflow-hidden flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={collection.cover_image_url}
                        alt={collection.title}
                        className="max-h-full max-w-full w-auto h-auto object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-16 w-20 shrink-0 border-2 border-line bg-panel flex items-center justify-center font-mono text-[10px] uppercase text-muted text-center px-1">
                      No cover
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {/* Category Pill */}
                      <span className="inline-block border border-line bg-panel px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest font-bold">
                        {collection.category}
                      </span>

                      {/* Status Badge */}
                      {collection.status === "published" && (
                        <span className="inline-block border-2 border-green-700 bg-green-700 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest font-bold text-white">
                          Published
                        </span>
                      )}
                      {collection.status === "draft" && (
                        <span className="inline-block border-2 border-amber-600 bg-amber-400 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest font-bold text-ink">
                          Draft
                        </span>
                      )}
                      {collection.status === "archived" && (
                        <span className="inline-block border-2 border-line bg-panel px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest font-bold text-muted">
                          Archived
                        </span>
                      )}

                      {/* Sort Order */}
                      <span className="font-mono text-[10px] text-muted border border-line/40 px-1.5 py-0.5">
                        Order #{collection.sort_order}
                      </span>
                    </div>

                    <h3 className="truncate font-display text-base font-bold text-ink">
                      {collection.title}
                    </h3>

                    <p className="truncate font-mono text-xs text-muted max-w-lg">
                      <code className="text-accent">/collections/{collection.slug}</code>
                      {collection.description && ` — ${collection.description}`}
                    </p>
                  </div>
                </div>

                {/* Actions: View Public Page, Edit, Delete */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {isPublished ? (
                    <Link
                      href={`/collections/${collection.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-2 border-line bg-paper px-3 py-2 font-mono text-xs uppercase tracking-widest font-bold text-ink hover:bg-ink hover:text-paper transition-colors"
                    >
                      View on Website ↗
                    </Link>
                  ) : (
                    <span
                      title="Only published collections have public URLs"
                      className="border-2 border-line/30 bg-panel/40 px-3 py-2 font-mono text-xs uppercase tracking-widest font-bold text-muted/60 cursor-not-allowed"
                    >
                      Unpublished
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(collection)}
                    className="border-2 border-line bg-panel px-3 py-2 font-mono text-xs uppercase tracking-widest font-bold text-ink hover:bg-accent transition-colors"
                  >
                    ✏️ Edit
                  </button>

                  <button
                    type="button"
                    disabled={deletingId === collection.id}
                    onClick={() => handleDelete(collection)}
                    className="border-2 border-line bg-paper px-3 py-2 font-mono text-xs uppercase tracking-widest font-bold text-red-700 hover:bg-red-700 hover:text-paper disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  >
                    {deletingId === collection.id ? "Deleting…" : "🗑️ Delete"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Collection Studio Modal for Create and Edit */}
      {isStudioOpen && (
        <CollectionStudioModal
          collectionId={studioCollectionId}
          catalogProducts={catalogProducts}
          onClose={() => {
            setIsStudioOpen(false);
            setStudioCollectionId(null);
          }}
          onSaved={(saved) => {
            onSuccess(
              studioCollectionId
                ? `Collection "${saved.title}" was updated.`
                : `Collection "${saved.title}" was created.`
            );
            onRefresh();
          }}
          onError={onError}
        />
      )}
    </div>
  );
}
