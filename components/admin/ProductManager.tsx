"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { deleteProduct } from "@/app/secure-admin-panel/actions";
import EditProductModal from "./EditProductModal";
import type { DbProduct } from "@/utils/supabase/types";

type Props = {
  products: DbProduct[];
  onDeleted: (message: string) => void;
  onError: (message: string) => void;
  onRefresh: () => void;
  onProductUpdated?: (product: DbProduct) => void;
};

function stripProductMeta(text?: string | null): string {
  if (!text || typeof text !== "string") return "";
  return text.replace(/<!--\s*PRODUCT_META:\s*[\s\S]*?-->/gi, "").trim();
}

export default function ProductManager({
  products,
  onDeleted,
  onError,
  onRefresh,
  onProductUpdated,
}: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category.toUpperCase());
    });
    return ["ALL", ...Array.from(set)];
  }, [products]);

  // Filtered products list based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        categoryFilter === "ALL" ||
        product.category?.toUpperCase() === categoryFilter;

      const matchesSearch =
        !searchQuery.trim() ||
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [products, categoryFilter, searchQuery]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This will permanently remove it from the storefront.`)) {
      return;
    }

    setDeletingId(id);
    const res = await deleteProduct(id);
    setDeletingId(null);

    if (!res.success) {
      onError(res.error || "Failed to delete product.");
      return;
    }

    onDeleted(`"${title}" was removed from the catalog.`);
    onRefresh();
  };

  return (
    <div className="border-2 border-line bg-paper shadow-hard space-y-0">
      {/* Header with Title and Quick Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-line bg-panel px-6 py-4 sm:px-8">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold">
            Live Inventory Management
          </span>
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-ink">
            Published Products
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-widest2 text-muted">
            {products.length.toString().padStart(2, "0")} Total
          </span>
          <button
            type="button"
            onClick={onRefresh}
            className="border-2 border-line bg-paper px-3 py-1.5 font-mono text-xs uppercase tracking-widest2 font-bold hover:bg-ink hover:text-paper transition-colors"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Search & Category Filter Box at the top */}
      <div className="border-b-2 border-line bg-paper p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search published products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-2 border-line bg-panel px-4 py-2.5 font-mono text-xs text-ink placeholder:text-muted/70 focus:border-accent focus:bg-white focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 font-mono text-xs text-muted hover:text-ink"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
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
            Displaying <strong>{filteredProducts.length}</strong> of {products.length} published products
          </span>
          {categoryFilter !== "ALL" && (
            <button
              onClick={() => setCategoryFilter("ALL")}
              className="underline text-accent hover:text-ink text-xs font-bold"
            >
              Clear Category Filter
            </button>
          )}
        </div>
      </div>

      {/* Product List */}
      {products.length === 0 ? (
        <div className="p-12 text-center">
          <p className="font-mono text-sm uppercase tracking-widest2 text-muted">
            No products found in database yet.
          </p>
          <p className="font-mono text-xs text-muted/70 mt-2">
            Use the &quot;Publish Product&quot; tab to add your first curated affiliate product.
          </p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center space-y-3">
          <p className="font-mono text-sm uppercase tracking-widest2 text-muted">
            No products match &quot;{searchQuery}&quot;
          </p>
          <button
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
          {filteredProducts.map((product) => (
            <li
              key={product.id}
              className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between hover:bg-panel/40 transition-colors"
            >
              {/* Product Info & Thumbnail */}
              <div className="flex items-start sm:items-center gap-4 min-w-0">
                {product.image_url ? (
                  <div className="h-16 w-16 shrink-0 border-2 border-line bg-white p-1 overflow-hidden flex items-center justify-center">
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="max-h-full max-w-full w-auto h-auto object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 shrink-0 border-2 border-line bg-panel flex items-center justify-center font-mono text-[10px] uppercase text-muted">
                    No img
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="inline-block border border-line bg-panel px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest font-bold">
                      {product.category}
                    </span>
                    {product.badge && (
                      <span className="inline-block bg-accent px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest font-bold text-ink">
                        {product.badge}
                      </span>
                    )}
                    {product.is_out_of_stock ? (
                      <span className="inline-block bg-red-600 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest font-bold text-white">
                        Out of Stock
                      </span>
                    ) : (
                      <span className="inline-block bg-green-700 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest font-bold text-white">
                        In Stock
                      </span>
                    )}
                    {(product.youtube_url || (product as any).video_url) && (
                      <span className="inline-block border border-line bg-panel px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider font-bold text-muted">
                        🎥 Media added
                      </span>
                    )}
                    {product.retailer_domain && product.retailer_domain !== "unknown" && (
                      <span className="inline-block border border-line bg-panel px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider font-bold text-muted">
                        🌐 {product.retailer_domain}
                      </span>
                    )}
                    {typeof product.clicks_count === "number" && product.clicks_count > 0 && (
                      <span className="font-mono text-[11px] font-bold text-accent">
                        ⚡ {product.clicks_count} clicks
                      </span>
                    )}
                  </div>

                  <h3 className="truncate font-display text-base font-bold text-ink">
                    {product.title}
                  </h3>
                  <p className="truncate font-mono text-xs text-muted max-w-lg">
                    {stripProductMeta(product.description || product.quick_take || "")}
                  </p>
                </div>
              </div>

              {/* Action Buttons: View on Website, Edit, Retailer, Delete */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Link
                  href={`/product/${product.slug || product.id}`}
                  className="border-2 border-line bg-paper px-3 py-2 font-mono text-xs uppercase tracking-widest font-bold text-ink hover:bg-ink hover:text-paper transition-colors"
                >
                  View on Website ↗
                </Link>

                <button
                  type="button"
                  onClick={() => setEditingProduct(product)}
                  className="border-2 border-line bg-panel px-3 py-2 font-mono text-xs uppercase tracking-widest font-bold text-ink hover:bg-accent transition-colors"
                >
                  ✏️ Edit
                </button>

                <a
                  href={product.retailer_url || product.amazon_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 border-line bg-paper px-3 py-2 font-mono text-xs uppercase tracking-widest font-bold hover:bg-accent hover:text-ink transition-colors"
                >
                  Retailer ↗
                </a>

                <button
                  type="button"
                  disabled={deletingId === product.id}
                  onClick={() => handleDelete(product.id, product.title)}
                  className="border-2 border-line bg-paper px-3 py-2 font-mono text-xs uppercase tracking-widest font-bold text-red-700 hover:bg-red-700 hover:text-paper disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                >
                  {deletingId === product.id ? "Deleting…" : "🗑️ Delete"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdated={(updated) => {
            onDeleted(`"${updated.title}" was updated.`);
            if (onProductUpdated) onProductUpdated(updated);
            onRefresh();
          }}
          onError={onError}
        />
      )}
    </div>
  );
}
