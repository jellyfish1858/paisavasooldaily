"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { fetchProductsAction } from "@/app/secure-admin-panel/actions";
import AddProductForm from "./AddProductForm";
import ProductManager from "./ProductManager";
import Toast, { type ToastData } from "./Toast";
import type { DbProduct } from "@/utils/supabase/types";

interface AdminDashboardProps {
  userEmail: string;
  initialProducts: DbProduct[];
  loadError: string | null;
}

export default function AdminDashboard({
  userEmail,
  initialProducts,
  loadError,
}: AdminDashboardProps) {
  const [products, setProducts] = useState<DbProduct[]>(initialProducts);
  const [loggingOut, setLoggingOut] = useState(false);
  const [toast, setToast] = useState<ToastData>(null);

  const refreshProducts = async () => {
    const res = await fetchProductsAction();
    if (res.success && res.data) {
      setProducts(res.data as DbProduct[]);
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.clear();
        window.location.href = "/secure-admin-panel";
      }
    }
  };

  return (
    <div className="container-page py-12 space-y-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            Authenticated as
          </span>
          <h1 className="font-mono text-sm font-bold tracking-tight text-text mt-1">
            {userEmail}
          </h1>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full sm:w-auto px-6 py-3 bg-text text-bg font-mono text-xs uppercase tracking-widest font-bold hover:bg-accent hover:text-white transition-colors disabled:opacity-50"
        >
          {loggingOut ? "Signing out..." : "Logout"}
        </button>
      </div>

      {loadError && (
        <div className="p-4 bg-red-500/10 border border-red-500 text-red-500 font-mono text-xs">
          Error loading products: {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <AddProductForm
            onSuccess={(msg) => {
              setToast({ type: "success", message: msg });
              refreshProducts();
            }}
            onError={(err) => setToast({ type: "error", message: err })}
            onInserted={() => refreshProducts()}
          />
        </div>
        <div className="lg:col-span-5">
          <ProductManager
            products={products}
            onDeleted={(msg) => setToast({ type: "success", message: msg })}
            onError={(err) => setToast({ type: "error", message: err })}
            onRefresh={refreshProducts}
          />
        </div>
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}