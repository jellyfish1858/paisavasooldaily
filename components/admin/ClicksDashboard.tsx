"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAnalyticsAction } from "@/app/secure-admin-panel/actions";
import type { DbProduct } from "@/utils/supabase/types";

interface ClicksDashboardProps {
  products: DbProduct[];
  onNavigateToPublish: () => void;
  onNavigateToProducts: () => void;
}

export default function ClicksDashboard({
  products,
  onNavigateToPublish,
  onNavigateToProducts,
}: ClicksDashboardProps) {
  const [analytics, setAnalytics] = useState<{
    totalProducts: number;
    totalClicks: number;
    topClickedProducts: Array<{ id: string; title: string; category: string; clicks: number }>;
    recentClicks: Array<any>;
  }>({
    totalProducts: products.length,
    totalClicks: 0,
    topClickedProducts: [],
    recentClicks: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      const res = await fetchAnalyticsAction();
      if (res.success && res.data) {
        setAnalytics(res.data);
      }
      setLoading(false);
    }
    loadStats();
  }, [products]);

  const inStockCount = products.filter((p) => !p.is_out_of_stock).length;
  const outOfStockCount = products.filter((p) => p.is_out_of_stock).length;

  return (
    <div className="space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="border-2 border-line bg-paper p-6 shadow-hard">
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-accent font-bold">
            Traffic & Conversions
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="font-display text-4xl font-bold text-ink">
              {loading ? "…" : analytics.totalClicks}
            </h3>
            <span className="font-mono text-xs text-green-700 font-bold">
              ⚡ Affiliate Clicks
            </span>
          </div>
          <p className="font-mono text-xs text-muted mt-2">
            Total verified clicks routed to retailer listings.
          </p>
        </div>

        <div className="border-2 border-line bg-paper p-6 shadow-hard">
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-muted font-bold">
            Live Catalog
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="font-display text-4xl font-bold text-ink">
              {products.length}
            </h3>
            <span className="font-mono text-xs text-ink font-bold">
              Published Items
            </span>
          </div>
          <p className="font-mono text-xs text-muted mt-2">
            Active products across all categories.
          </p>
        </div>

        <div className="border-2 border-line bg-paper p-6 shadow-hard">
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-green-700 font-bold">
            In-Stock Inventory
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="font-display text-4xl font-bold text-green-700">
              {inStockCount}
            </h3>
            <span className="font-mono text-xs text-muted">
              Ready to Buy
            </span>
          </div>
          <p className="font-mono text-xs text-muted mt-2">
            {outOfStockCount > 0 ? `${outOfStockCount} marked as out of stock.` : "All products currently in stock."}
          </p>
        </div>

        <div className="border-2 border-line bg-panel p-6 shadow-hard flex flex-col justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-accent font-bold">
              Quick Actions
            </span>
            <p className="font-display text-sm font-bold text-ink mt-1">
              Storefront Control
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={onNavigateToPublish}
              className="flex-1 border-2 border-line bg-accent py-2 font-mono text-[11px] uppercase tracking-wider font-bold text-ink hover:bg-ink hover:text-paper transition-colors"
            >
              + Post
            </button>
            <button
              onClick={onNavigateToProducts}
              className="flex-1 border-2 border-line bg-paper py-2 font-mono text-[11px] uppercase tracking-wider font-bold text-ink hover:bg-ink hover:text-paper transition-colors"
            >
              Manage
            </button>
          </div>
        </div>
      </div>

      {/* Top Clicked Products Table */}
      <div className="border-2 border-line bg-paper shadow-hard">
        <div className="flex items-center justify-between border-b-2 border-line bg-panel px-6 py-4 sm:px-8">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold">
              Performance Leaderboard
            </span>
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-ink">
              Top Converting Products
            </h2>
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            Ranked by Outbound Clicks
          </span>
        </div>

        {analytics.topClickedProducts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-mono text-xs uppercase tracking-widest2 text-muted">
              No clicks recorded yet. Share your storefront product links to start tracking clicks.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b-2 border-line bg-panel">
                <tr>
                  <th className="p-4 text-ink font-bold uppercase tracking-wider">#</th>
                  <th className="p-4 text-ink font-bold uppercase tracking-wider">Product Name</th>
                  <th className="p-4 text-ink font-bold uppercase tracking-wider">Category</th>
                  <th className="p-4 text-ink font-bold uppercase tracking-wider text-right">Clicks</th>
                  <th className="p-4 text-ink font-bold uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y border-line/15">
                {analytics.topClickedProducts.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-panel/40 transition-colors">
                    <td className="p-4 font-bold text-muted">{idx + 1}</td>
                    <td className="p-4 font-bold font-display text-sm text-ink max-w-xs truncate">
                      {item.title}
                    </td>
                    <td className="p-4">
                      <span className="border border-line bg-panel px-2 py-0.5 text-[10px] uppercase font-bold">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-accent">
                      ⚡ {item.clicks}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/product/${products.find((p) => p.id === item.id)?.slug || item.id}`}
                        className="border border-line bg-paper px-2.5 py-1 text-[11px] uppercase font-bold hover:bg-ink hover:text-paper"
                      >
                        View Page →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
