"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { CompareProvider } from "@/components/CompareProvider";
import CompareArena from "@/components/CompareArena";
import BeautyTrustShowcase from "@/components/BeautyTrustShowcase";
import type { DbProduct } from "@/utils/supabase/types";

export interface StorefrontClientProps {
  initialProducts?: DbProduct[];
}

export type CategoryTab = "all" | "beauty" | "tech";

const COLLECTIONS = [
  {
    id: "best-value",
    name: "Best Value",
    description: "Top-rated products ranked by real customer choices",
    icon: "⭐",
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "premium-picks",
    name: "Premium Picks",
    description: "Investment pieces that last",
    icon: "👑",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "everyday-essentials",
    name: "Everyday Essentials",
    description: "Affordable must-haves for daily life",
    icon: "✨",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "trending-now",
    name: "Trending Now",
    description: "Fresh finds and seasonal favorites",
    icon: "🔥",
    color: "from-red-500 to-rose-500",
  },
  {
    id: "smart-buys",
    name: "Smart Buys",
    description: "Best value across all categories",
    icon: "💡",
    color: "from-green-500 to-emerald-500",
  },
];

function filterProductsByTab(allProducts: DbProduct[], tab: CategoryTab): DbProduct[] {
  if (tab === "all") return allProducts;
  return allProducts.filter((product) => {
    const cat = (product.category || "").toLowerCase();
    const title = (product.title || "").toLowerCase();
    const desc = (product.description || product.quick_take || "").toLowerCase();

    const isBeauty =
      cat.includes("beauty") ||
      cat.includes("fashion") ||
      cat.includes("personal care") ||
      cat.includes("skincare") ||
      cat.includes("grooming") ||
      cat.includes("style") ||
      cat.includes("bath") ||
      cat.includes("soap") ||
      cat.includes("haircare") ||
      cat.includes("fragrance") ||
      title.includes("soap") ||
      title.includes("bath bar") ||
      title.includes("skincare");

    if (tab === "beauty") return isBeauty;
    if (tab === "tech") return !isBeauty;
    return true;
  });
}

export default function StorefrontClient({ initialProducts = [] }: StorefrontClientProps) {
  const [products, setProducts] = useState<DbProduct[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [activeTab, setActiveTab] = useState<CategoryTab>("all");
  const [itemsToShow, setItemsToShow] = useState(12);

  // Load products from API on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Listen to URL search param ?tab= and custom browser event smartchoice:select-tab
  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncTabFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab")?.toLowerCase();
      if (
        tabParam === "beauty" ||
        tabParam === "beauty-fashion" ||
        tabParam === "skincare" ||
        tabParam === "grooming"
      ) {
        setActiveTab("beauty");
      } else if (
        tabParam === "tech" ||
        tabParam === "tech-accessories" ||
        tabParam === "electronics" ||
        tabParam === "travel"
      ) {
        setActiveTab("tech");
      } else if (tabParam === "all") {
        setActiveTab("all");
      }
    };

    syncTabFromUrl();

    const handleCustomSelectTab = (event: Event) => {
      const customEv = event as CustomEvent<string>;
      const detail = (customEv.detail || "").toLowerCase();
      if (detail.includes("beauty") || detail.includes("fashion") || detail.includes("skin")) {
        setActiveTab("beauty");
        const element = document.getElementById("products-grid");
        element?.scrollIntoView({ behavior: "smooth" });
      } else if (detail.includes("tech") || detail.includes("travel")) {
        setActiveTab("tech");
        const element = document.getElementById("products-grid");
        element?.scrollIntoView({ behavior: "smooth" });
      } else if (detail.includes("all")) {
        setActiveTab("all");
      }
    };

    window.addEventListener("smartchoice:select-tab", handleCustomSelectTab);
    window.addEventListener("popstate", syncTabFromUrl);

    return () => {
      window.removeEventListener("smartchoice:select-tab", handleCustomSelectTab);
      window.removeEventListener("popstate", syncTabFromUrl);
    };
  }, []);

  const handleTabChange = (newTab: CategoryTab) => {
    setActiveTab(newTab);
    setItemsToShow(12);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (newTab === "all") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", newTab);
      }
      window.history.replaceState(null, "", url.toString());
    }
  };

  const handleLoadMore = () => {
    setItemsToShow((prev) => prev + 12);
  };

  const filteredProducts = filterProductsByTab(products, activeTab);
  const displayProducts = filteredProducts.slice(0, itemsToShow);
  const hasMore = itemsToShow < filteredProducts.length;

  const allCount = products.length;
  const beautyCount = filterProductsByTab(products, "beauty").length;
  const techCount = filterProductsByTab(products, "tech").length;

  return (
    <CompareProvider>
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white selection:bg-blue-500 selection:text-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 py-20 sm:py-32">
          {/* Ambient Lighting Orbs */}
          <div className="pointer-events-none absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl animate-pulse delay-700"></div>
            <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative max-w-4xl mx-auto text-center">
            <h1 className="text-5xl sm:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-white mb-6 leading-tight tracking-tight">
              Handpicked essentials.
              <br />
              Zero regrets.
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed font-body">
              Every product here is vetted for quality, value, and real-world performance. We only recommend what we&apos;d buy ourselves.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center font-mono text-sm uppercase tracking-wider font-bold">
              <button
                type="button"
                onClick={() => {
                  const element = document.getElementById("products-grid");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Explore Now ↓
              </button>
              <Link
                href="/collections"
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/20 backdrop-blur hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                Browse Collections
              </Link>
              <Link
                href="/guides"
                className="w-full sm:w-auto px-8 py-4 bg-slate-900/80 hover:bg-slate-800 text-blue-300 hover:text-white rounded-lg transition-all border border-blue-500/30 backdrop-blur hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Learn More (Guides) →
              </Link>
            </div>
          </div>

          {/* Trust Badges */}
          <div id="trust" className="relative mt-16 grid grid-cols-3 gap-4 max-w-2xl mx-auto text-center">
            <div className="p-4 bg-white/5 backdrop-blur rounded-lg border border-white/10">
              <div className="text-2xl mb-2">⚡</div>
              <p className="text-sm text-gray-300">Fast Shipping</p>
            </div>
            <div className="p-4 bg-white/5 backdrop-blur rounded-lg border border-white/10">
              <div className="text-2xl mb-2">✓</div>
              <p className="text-sm text-gray-300">100% Verified Picks</p>
            </div>
            <div className="p-4 bg-white/5 backdrop-blur rounded-lg border border-white/10">
              <div className="text-2xl mb-2">💰</div>
              <p className="text-sm text-gray-300">Best Prices</p>
            </div>
          </div>
        </section>

        {/* Prominent Shop Collections Banner CTA */}
        <section className="relative px-4 py-4 max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-blue-900/40 via-purple-900/30 to-slate-900/50 border border-blue-500/30 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl backdrop-blur">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-blue-400 font-bold block mb-1">
                ⭐ Verified Buyer Collections
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Explore Themed Product Collections
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-xl">
                Browse Best Value, Everyday Essentials, Premium Picks, and Trending items ranked by customer choices.
              </p>
            </div>
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs uppercase tracking-widest font-bold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-blue-600/30 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <span>Shop Collections</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        {/* Curated Collections Grid */}
        <section className="relative px-4 py-16 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">Curated Collections</h2>
            <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">
              Editorial journeys grouped by decision criteria
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {COLLECTIONS.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.id}`}
                className="group relative overflow-hidden rounded-xl bg-slate-900/80 border border-white/10 p-6 transition-all duration-300 transform hover:-translate-y-1 hover:border-white/30 shadow-md"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${collection.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                ></div>
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    <div className="text-3xl mb-3">{collection.icon}</div>
                    <h3 className="text-lg font-bold text-white mb-2">{collection.name}</h3>
                    <p className="text-xs text-slate-300 group-hover:text-white transition-colors leading-relaxed">
                      {collection.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/10 font-mono text-[11px] text-blue-400 group-hover:text-blue-300 flex items-center gap-1">
                    <span>Explore</span>
                    <span aria-hidden="true">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Products Grid with Universal Category Switcher */}
        <section id="products-grid" className="relative px-4 py-16 max-w-7xl mx-auto scroll-mt-6">
          {/* Universal Category Switcher Tab Bar */}
          <div className="mb-10 flex flex-col items-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur shadow-2xl gap-1.5 max-w-full overflow-x-auto">
              {/* Tab 1: All Picks */}
              <button
                type="button"
                onClick={() => handleTabChange("all")}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${activeTab === "all"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 border border-white/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
              >
                <span>🌟</span>
                <span>All Picks</span>
                <span
                  className={`ml-1 text-[10px] px-2 py-0.5 rounded-full ${activeTab === "all"
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-slate-400"
                    }`}
                >
                  {allCount}
                </span>
              </button>

              {/* Tab 2: Beauty & Fashion */}
              <button
                type="button"
                onClick={() => handleTabChange("beauty")}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${activeTab === "beauty"
                    ? "bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white shadow-lg shadow-pink-600/30 border border-white/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
              >
                <span>✨</span>
                <span>Beauty &amp; Fashion</span>
                <span
                  className={`ml-1 text-[10px] px-2 py-0.5 rounded-full ${activeTab === "beauty"
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-slate-400"
                    }`}
                >
                  {beautyCount}
                </span>
              </button>

              {/* Tab 3: Tech & Accessories */}
              <button
                type="button"
                onClick={() => handleTabChange("tech")}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${activeTab === "tech"
                    ? "bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-600/30 border border-white/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
              >
                <span>⚡</span>
                <span>Tech &amp; Accessories</span>
                <span
                  className={`ml-1 text-[10px] px-2 py-0.5 rounded-full ${activeTab === "tech"
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-slate-400"
                    }`}
                >
                  {techCount}
                </span>
              </button>
            </div>
          </div>

          {/* High-conversion Anti-Adulteration & Routine Guarantee Banner in Beauty & Fashion Tab */}
          {activeTab === "beauty" && (
            <BeautyTrustShowcase
              onSwitchToAll={() => handleTabChange("all")}
              productCount={filteredProducts.length}
            />
          )}

          {/* Section Header */}
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
                {activeTab === "all"
                  ? "Best Value Products"
                  : activeTab === "beauty"
                    ? "Beauty & Fashion Essentials"
                    : "Tech & Accessories"}
              </h2>
              <p className="text-slate-400 font-mono text-xs uppercase tracking-wider">
                {activeTab === "all"
                  ? "Ranked by real customer choices • Qualitative Anti-Regret analysis"
                  : activeTab === "beauty"
                    ? "Anti-adulteration certified routine picks for men & women"
                    : "Charging, travel ergonomics & workstation performance gear"}
              </p>
            </div>
            <div className="font-mono text-xs text-slate-400">
              Showing <span className="text-white font-bold">{displayProducts.length}</span> of{" "}
              <span className="text-white font-bold">{filteredProducts.length}</span> curated models
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-900 border-2 border-slate-800 rounded-lg h-[460px] animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <>
              {displayProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                activeTab !== "beauty" && (
                  <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-white/10">
                    <p className="text-slate-400 font-mono text-sm mb-4">
                      No products found matching this category filter.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleTabChange("all")}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs uppercase font-bold rounded-lg transition-all"
                    >
                      View All Products
                    </button>
                  </div>
                )
              )}

              {hasMore && (
                <div className="flex justify-center mt-12">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-mono text-xs uppercase tracking-widest font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-600/30 cursor-pointer"
                  >
                    Load More Products ({filteredProducts.length - itemsToShow} remaining)
                  </button>
                </div>
              )}

              {!hasMore && displayProducts.length > 0 && (
                <div className="text-center mt-12 py-6 border-t border-white/10 font-mono text-xs text-slate-400">
                  You&apos;ve seen all {displayProducts.length} curated products in this view
                </div>
              )}
            </>
          )}
        </section>

        {/* Call to Action Section */}
        <section className="relative px-4 py-16 max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 backdrop-blur border border-blue-500/20 rounded-2xl p-8 sm:p-12 shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Start Smart Shopping Today
            </h2>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto font-body text-sm sm:text-base leading-relaxed">
              Browse thematic editorial collections or discover your next reliable purchase with zero buyer&apos;s remorse.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/collections"
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-mono text-xs uppercase tracking-widest font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-600/30 text-center"
              >
                Explore All Collections →
              </Link>
              <Link
                href="/guides"
                className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-widest font-bold rounded-lg transition-all border border-white/20 backdrop-blur hover:scale-105 text-center"
              >
                Learn More (Interactive Guides)
              </Link>
            </div>
          </div>
        </section>

        {/* Footer Disclosure */}
        <footer className="relative px-4 py-8 border-t border-white/10">
          <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
            <p>We earn an affiliate commission when you purchase through links on this site. This helps us provide free, unbiased product recommendations.</p>
            <p className="mt-2">Join thousands of smart shoppers saving time and money on quality products.</p>
          </div>
        </footer>

        {/* Interactive Comparison Arena Drawer */}
        <CompareArena />
      </div>
    </CompareProvider>
  );
}
