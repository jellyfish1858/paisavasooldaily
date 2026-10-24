"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import LoginForm from "@/components/admin/LoginForm";
import AddProductForm from "@/components/admin/AddProductForm";
import ProductManager from "@/components/admin/ProductManager";
import ClicksDashboard from "@/components/admin/ClicksDashboard";
import CollectionManager from "@/components/admin/CollectionManager";
import Toast, { type ToastData } from "@/components/admin/Toast";
import {
  checkAdminAuthAction,
  logoutAdminAction,
  fetchProductsAction,
  fetchAdminCollectionsAction,
} from "@/app/secure-admin-panel/actions";
import type { DbProduct, DbCollection } from "@/utils/supabase/types";

type AdminTab = "dashboard" | "published" | "publish" | "collections";

export default function SecureAdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [collections, setCollections] = useState<DbCollection[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [collectionsError, setCollectionsError] = useState<string | null>(null);
  const [hasLoadedCollections, setHasLoadedCollections] = useState(false);
  const [toast, setToast] = useState<ToastData>(null);

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    const res = await fetchProductsAction();
    if (res.success && res.data) {
      setProducts(res.data as DbProduct[]);
    } else {
      setToast({
        type: "error",
        message: res.error || "Failed to load products from database.",
      });
    }
    setLoadingProducts(false);
  }, []);

  const loadCollections = useCallback(async () => {
    setLoadingCollections(true);
    setCollectionsError(null);
    try {
      const res = await fetchAdminCollectionsAction();
      if (res.success && res.data) {
        setCollections(res.data);
      } else {
        const errMsg = res.error || "Failed to load collections from database.";
        setCollectionsError(errMsg);
      }
    } catch (err: any) {
      setCollectionsError(err?.message || "Failed to load collections.");
    } finally {
      setLoadingCollections(false);
      setHasLoadedCollections(true);
    }
  }, []);

  // Check Supabase Auth session on load
  useEffect(() => {
    async function verifyAuth() {
      try {
        const res = await checkAdminAuthAction();
        setIsAuthenticated(res.isAuthenticated);
        setUserEmail(res.email);

        if (res.isAuthenticated) {
          loadProducts();
        }
      } catch (err) {
        console.error("Auth verification failed:", err);
        setIsAuthenticated(false);
        setUserEmail(null);
      }
    }
    verifyAuth();
  }, [loadProducts]);

  // Load collections on first switch to collections tab
  useEffect(() => {
    if (isAuthenticated && activeTab === "collections" && !hasLoadedCollections) {
      loadCollections();
    }
  }, [isAuthenticated, activeTab, hasLoadedCollections, loadCollections]);

  const handleLoginSuccess = (email: string) => {
    setIsAuthenticated(true);
    setUserEmail(email);
    setHasLoadedCollections(false);
    loadProducts();
  };

  const handleLogout = async () => {
    await logoutAdminAction();
    setIsAuthenticated(false);
    setUserEmail(null);
  };

  const handleSuccess = (message: string) => {
    setToast({ type: "success", message });
  };

  const handleError = (message: string) => {
    setToast({ type: "error", message });
  };

  // Loading auth state
  if (isAuthenticated === null) {
    return (
      <div className="container-page flex min-h-[70vh] items-center justify-center py-20">
        <div className="border-2 border-line bg-paper p-8 text-center shadow-hard">
          <p className="font-mono text-xs uppercase tracking-widest2 text-muted animate-pulse">
            Verifying Supabase security credentials…
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated or not an admin: render Supabase Auth Login Form
  if (!isAuthenticated) {
    return <LoginForm onLoggedIn={handleLoginSuccess} />;
  }

  // Authenticated Admin Dashboard
  return (
    <div className="container-page py-10 space-y-8 max-w-6xl mx-auto">
      {/* Top Header Bar */}
      <header className="border-2 border-line p-6 bg-paper flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-hard">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2.5 w-2.5 bg-green-500 rounded-none inline-block animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest2 text-accent font-bold">
              Secure Admin Console
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink uppercase">
            Storefront Control Panel
          </h1>
          <p className="font-mono text-xs text-muted mt-1">
            Authenticated via Supabase Auth as: <strong className="text-ink">{userEmail}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="border-2 border-line bg-paper px-4 py-2.5 font-mono text-xs uppercase tracking-widest font-bold hover:bg-ink hover:text-paper transition-colors"
          >
            ← View Storefront
          </Link>

          <button
            onClick={handleLogout}
            className="border-2 border-line bg-panel px-4 py-2.5 font-mono text-xs uppercase tracking-widest font-bold text-red-700 hover:bg-red-700 hover:text-paper transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b-2 border-line pb-4">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`border-2 border-line px-5 py-3 font-mono text-xs uppercase tracking-widest font-bold transition-all ${
            activeTab === "dashboard"
              ? "bg-accent text-ink shadow-hard-sm"
              : "bg-paper text-ink hover:bg-panel"
          }`}
        >
          📊 Clicks Dashboard
        </button>

        <button
          onClick={() => setActiveTab("published")}
          className={`border-2 border-line px-5 py-3 font-mono text-xs uppercase tracking-widest font-bold transition-all ${
            activeTab === "published"
              ? "bg-accent text-ink shadow-hard-sm"
              : "bg-paper text-ink hover:bg-panel"
          }`}
        >
          📦 Published Products ({products.length})
        </button>

        <button
          onClick={() => setActiveTab("publish")}
          className={`border-2 border-line px-5 py-3 font-mono text-xs uppercase tracking-widest font-bold transition-all ${
            activeTab === "publish"
              ? "bg-accent text-ink shadow-hard-sm"
              : "bg-paper text-ink hover:bg-panel"
          }`}
        >
          ➕ Publish a Product
        </button>

        <button
          onClick={() => setActiveTab("collections")}
          className={`border-2 border-line px-5 py-3 font-mono text-xs uppercase tracking-widest font-bold transition-all ${
            activeTab === "collections"
              ? "bg-accent text-ink shadow-hard-sm"
              : "bg-paper text-ink hover:bg-panel"
          }`}
        >
          📚 Editorial Collections {hasLoadedCollections ? `(${collections.length})` : ""}
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {/* Tab 1: Clicks & Analytics Dashboard */}
        {activeTab === "dashboard" && (
          <ClicksDashboard
            products={products}
            onNavigateToPublish={() => setActiveTab("publish")}
            onNavigateToProducts={() => setActiveTab("published")}
          />
        )}

        {/* Tab 2: Published Products Manager with Search, Edit & Delete */}
        {activeTab === "published" && (
          <div>
            {loadingProducts ? (
              <div className="border-2 border-line bg-paper p-16 text-center shadow-hard">
                <p className="font-mono text-xs uppercase tracking-widest2 text-muted animate-pulse">
                  Loading published products from Supabase...
                </p>
              </div>
            ) : (
              <ProductManager
                products={products}
                onDeleted={(msg) => {
                  handleSuccess(msg);
                  loadProducts();
                }}
                onError={handleError}
                onRefresh={loadProducts}
                onProductUpdated={() => loadProducts()}
              />
            )}
          </div>
        )}

        {/* Tab 3: Publish a Product Form */}
        {activeTab === "publish" && (
          <div className="max-w-4xl mx-auto">
            <AddProductForm
              onSuccess={(msg) => {
                handleSuccess(msg);
                loadProducts();
                setActiveTab("published");
              }}
              onError={handleError}
              onInserted={() => loadProducts()}
            />
          </div>
        )}

        {/* Tab 4: Editorial Collections Manager */}
        {activeTab === "collections" && (
          <div>
            <CollectionManager
              collections={collections}
              catalogProducts={products}
              loading={loadingCollections}
              loadError={collectionsError}
              onRefresh={loadCollections}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </div>
        )}
      </div>

      {/* Toast Feedback */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}