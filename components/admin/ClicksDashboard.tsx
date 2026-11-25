"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { fetchProductClickAnalyticsAction } from "@/app/secure-admin-panel/actions";
import type { DbProduct } from "@/utils/supabase/types";
import type { AnalyticsSummary, ProductClickData } from "@/lib/analytics";
import EditProductModal from "./EditProductModal";

interface ClicksDashboardProps {
  products: DbProduct[];
  onNavigateToPublish?: () => void;
  onNavigateToProducts?: () => void;
  onProductUpdated?: (product: DbProduct) => void;
  onError?: (msg: string) => void;
}

export default function ClicksDashboard({
  products,
  onNavigateToPublish,
  onNavigateToProducts,
  onProductUpdated,
  onError,
}: ClicksDashboardProps) {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadAnalytics = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setRefreshing(true);
    }
    try {
      const res = await fetchProductClickAnalyticsAction();
      if (res.success && res.data) {
        setSummary(res.data);
        setLastRefreshedAt(new Date());
      } else if (res.error) {
        console.warn("Analytics fetch error:", res.error);
        if (onError && !isBackground) {
          onError(res.error);
        }
      }
    } catch (err: any) {
      console.warn("loadAnalytics exception:", err);
      if (onError && !isBackground) {
        onError(err?.message || "Failed to load click tracking data.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [onError]);

  // Initial load and 30-second auto-refresh interval
  useEffect(() => {
    loadAnalytics();

    // Auto-refresh data every 30 seconds
    intervalRef.current = setInterval(() => {
      loadAnalytics(true);
    }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadAnalytics]);

  const handleEditClick = (productId: string) => {
    const fullProduct = products.find((p) => p.id === productId);
    if (fullProduct) {
      setEditingProduct(fullProduct);
    } else if (onError) {
      onError("Product details could not be found for editing.");
    }
  };

  // Safe fallback metrics if summary is still loading
  const totalClicks = summary?.totalClicks ?? 0;
  const totalProducts = summary?.totalProducts ?? products.length;
  const avgClicks = summary?.avgClicksPerProduct ?? 0;
  const topProduct = summary?.topProduct ?? null;
  const top5 = summary?.top5Products ?? [];
  const top10 = summary?.top10Products ?? [];

  // Maximum clicks for bar chart normalization
  const maxClicksInTop10 = Math.max(...top10.map((p) => p.totalClicks), 1);

  return (
    <div className="space-y-8" id="analytics-dashboard">
      {/* Top Section Header & Controls */}
      <div className="border-2 border-line bg-paper p-6 shadow-hard flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2.5 w-2.5 bg-accent inline-block" />
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-accent font-bold">
              Affiliate Tracking Engine
            </span>
            <span className="border border-line bg-panel px-2 py-0.5 font-mono text-[10px] uppercase font-bold text-muted">
              🔒 Read-Only
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-ink">
            Click Tracking Analytics
          </h2>
          <p className="font-mono text-xs text-muted mt-1">
            Aggregated metrics for outbound affiliate clicks grouped by product and retailer domain.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-start sm:justify-end">
          <div className="font-mono text-[11px] text-muted flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>Auto-refreshes every 30s</span>
            {lastRefreshedAt && (
              <span className="hidden md:inline text-line">| Updated {lastRefreshedAt.toLocaleTimeString()}</span>
            )}
          </div>

          <button
            onClick={() => loadAnalytics(false)}
            disabled={refreshing}
            className="border-2 border-line bg-paper px-4 py-2 font-mono text-xs uppercase tracking-wider font-bold text-ink hover:bg-ink hover:text-paper disabled:opacity-50 transition-colors inline-flex items-center gap-1.5"
            title="Refresh analytics data immediately"
          >
            <span className={refreshing ? "animate-spin inline-block" : ""}>↻</span>
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Horizontal Summary Cards (3 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Clicks Across All Products */}
        <div className="border-2 border-line bg-paper p-6 shadow-hard flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest2 text-accent font-bold">
                Total Traffic
              </span>
              <span className="font-mono text-xs text-ink font-bold">⚡ All Time</span>
            </div>
            <div className="mt-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted block mb-1">
                Total Clicks Across All Products
              </span>
              <h3 className="font-display text-4xl sm:text-5xl font-bold text-ink tracking-tight">
                {loading ? "…" : totalClicks.toLocaleString()}
              </h3>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-line/20">
            <p className="font-mono text-xs text-muted">
              Outbound clicks routed to partner retailer product listings.
            </p>
          </div>
        </div>

        {/* Card 2: Top Product by Clicks */}
        <div className="border-2 border-line bg-paper p-6 shadow-hard flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest2 text-accent font-bold">
                Conversion Leader
              </span>
              <span className="font-mono text-xs text-green-700 font-bold">🏆 #1 Ranked</span>
            </div>
            <div className="mt-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted block mb-1">
                Top Product by Clicks
              </span>
              <h3
                className="font-display text-lg sm:text-xl font-bold text-ink line-clamp-2 min-h-[3rem]"
                title={topProduct?.productTitle || "No clicks recorded yet"}
              >
                {loading
                  ? "…"
                  : topProduct && topProduct.totalClicks > 0
                  ? topProduct.productTitle
                  : "No clicks recorded yet"}
              </h3>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-line/20 flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-accent">
              {topProduct && topProduct.totalClicks > 0
                ? `⚡ ${topProduct.totalClicks} clicks`
                : "0 clicks"}
            </span>
            {topProduct?.retailerDomain && topProduct.retailerDomain !== "unknown" && (
              <span className="border border-line bg-panel px-2 py-0.5 font-mono text-[10px] uppercase font-bold text-ink">
                {topProduct.retailerDomain}
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Avg Clicks Per Product */}
        <div className="border-2 border-line bg-paper p-6 shadow-hard flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest2 text-accent font-bold">
                Catalog Engagement
              </span>
              <span className="font-mono text-xs text-muted font-bold">📈 Velocity</span>
            </div>
            <div className="mt-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted block mb-1">
                Avg Clicks Per Product
              </span>
              <h3 className="font-display text-4xl sm:text-5xl font-bold text-ink tracking-tight">
                {loading ? "…" : avgClicks.toFixed(2)}
              </h3>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-line/20">
            <p className="font-mono text-xs text-muted">
              Calculated across all {totalProducts} active catalog products.
            </p>
          </div>
        </div>
      </div>

      {/* Top 5 Products Table */}
      <div className="border-2 border-line bg-paper shadow-hard">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-line bg-panel px-6 py-4 gap-2">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold">
              Performance Leaderboard
            </span>
            <h3 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
              Top 5 Products by Click Count
            </h3>
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            Ranked by outbound affiliate clicks
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <p className="font-mono text-xs uppercase tracking-widest2 text-muted animate-pulse">
              Aggregating affiliate click data...
            </p>
          </div>
        ) : top5.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-mono text-xs uppercase tracking-widest2 text-muted">
              No products found in catalog. Publish a product to begin tracking clicks.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b-2 border-line bg-panel">
                <tr>
                  <th className="p-4 text-ink font-bold uppercase tracking-wider w-16 text-center">
                    Rank
                  </th>
                  <th className="p-4 text-ink font-bold uppercase tracking-wider">
                    Product Title
                  </th>
                  <th className="p-4 text-ink font-bold uppercase tracking-wider text-right w-32">
                    Total Clicks
                  </th>
                  <th className="p-4 text-ink font-bold uppercase tracking-wider w-48">
                    Retailer Domains
                  </th>
                  <th className="p-4 text-ink font-bold uppercase tracking-wider text-right w-48">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y border-line/15">
                {top5.map((item, index) => {
                  const rank = index + 1;
                  const matchingProduct = products.find((p) => p.id === item.productId);
                  const slug = item.productSlug || matchingProduct?.slug || item.productId;
                  const domainKeys = Object.keys(item.clicksPerDomain || {});
                  const hasClicks = item.totalClicks > 0;

                  return (
                    <tr
                      key={item.productId || index}
                      className="hover:bg-panel/40 transition-colors"
                    >
                      {/* Rank */}
                      <td className="p-4 text-center font-bold">
                        <span
                          className={`inline-flex items-center justify-center h-7 w-7 border-2 border-line font-bold ${
                            rank === 1
                              ? "bg-accent text-ink shadow-hard-sm"
                              : "bg-paper text-ink"
                          }`}
                        >
                          #{rank}
                        </span>
                      </td>

                      {/* Product Title */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {item.imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.imageUrl}
                              alt=""
                              className="h-10 w-10 object-cover border border-line bg-panel flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-display text-sm font-bold text-ink truncate max-w-md">
                              {item.productTitle}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {item.productCategory && (
                                <span className="border border-line bg-panel px-1.5 py-0.2 text-[9px] uppercase font-bold text-muted">
                                  {item.productCategory}
                                </span>
                              )}
                              <span className="text-[10px] text-muted truncate">
                                ID: {item.productId.slice(0, 8)}…
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Total Clicks */}
                      <td className="p-4 text-right">
                        <span
                          className={`font-bold font-mono text-sm ${
                            hasClicks ? "text-accent" : "text-muted"
                          }`}
                        >
                          ⚡ {item.totalClicks.toLocaleString()}
                        </span>
                      </td>

                      {/* Retailer Domains */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {domainKeys.length > 0 ? (
                            domainKeys.map((domain) => (
                              <span
                                key={domain}
                                className="border border-line bg-panel px-2 py-0.5 text-[10px] uppercase font-bold text-ink inline-flex items-center gap-1"
                              >
                                <span>{domain}</span>
                                {item.clicksPerDomain[domain] > 1 && (
                                  <span className="text-muted">
                                    ({item.clicksPerDomain[domain]})
                                  </span>
                                )}
                              </span>
                            ))
                          ) : item.retailerDomain && item.retailerDomain !== "unknown" ? (
                            <span className="border border-line bg-panel px-2 py-0.5 text-[10px] uppercase font-bold text-muted">
                              {item.retailerDomain}
                            </span>
                          ) : (
                            <span className="text-muted text-[10px] italic">—</span>
                          )}
                        </div>
                      </td>

                      {/* Action (Edit product & View storefront link) */}
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(item.productId)}
                            className="border border-line bg-paper px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink hover:bg-ink hover:text-paper transition-colors"
                            title="Edit this product record"
                          >
                            Edit Product
                          </button>
                          <Link
                            href={`/product/${slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border border-line bg-panel px-2 py-1 text-[11px] font-bold uppercase text-muted hover:text-ink hover:border-ink transition-colors"
                            title="View product on public storefront"
                          >
                            View ↗
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Click Distribution Chart (Top 10 Products Bar Chart) */}
      <div className="border-2 border-line bg-paper shadow-hard">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-line bg-panel px-6 py-4 gap-2">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold">
              Volume Distribution
            </span>
            <h3 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
              Click Distribution (Top 10 Products)
            </h3>
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            Relative click proportions
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <p className="font-mono text-xs uppercase tracking-widest2 text-muted animate-pulse">
              Generating distribution graph...
            </p>
          </div>
        ) : top10.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-mono text-xs uppercase tracking-widest2 text-muted">
              No products available for distribution chart.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {top10.map((item, idx) => {
              const rank = idx + 1;
              const percentage =
                maxClicksInTop10 > 0 && item.totalClicks > 0
                  ? Math.max(Math.round((item.totalClicks / maxClicksInTop10) * 100), 4)
                  : 0;

              return (
                <div key={item.productId || idx} className="space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-2 truncate pr-4">
                      <span className="font-bold text-muted w-6 text-right flex-shrink-0">
                        #{rank}
                      </span>
                      <span className="font-bold text-ink truncate max-w-sm sm:max-w-md">
                        {item.productTitle}
                      </span>
                      {item.retailerDomain && item.retailerDomain !== "unknown" && (
                        <span className="border border-line bg-panel px-1.5 py-0.2 text-[9px] uppercase font-bold text-muted flex-shrink-0">
                          {item.retailerDomain}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-accent font-mono flex-shrink-0">
                      ⚡ {item.totalClicks.toLocaleString()}
                    </span>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full bg-panel border border-line h-6 overflow-hidden relative">
                    <div
                      className={`h-full border-r border-line transition-all duration-500 flex items-center justify-end px-2 ${
                        item.totalClicks > 0 ? "bg-accent" : "bg-panel"
                      }`}
                      style={{ width: `${percentage}%` }}
                    >
                      {percentage >= 15 && (
                        <span className="font-mono text-[10px] font-bold text-ink">
                          {percentage}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Direct Edit Product Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdated={(updated) => {
            setEditingProduct(null);
            if (onProductUpdated) onProductUpdated(updated);
            loadAnalytics(false);
          }}
          onError={(err) => {
            if (onError) onError(err);
          }}
        />
      )}
    </div>
  );
}
