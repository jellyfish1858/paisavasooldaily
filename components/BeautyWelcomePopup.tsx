"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BEAUTY_WELCOME_POPUP_STORAGE_KEY } from "@/lib/validation";

export { BEAUTY_WELCOME_POPUP_STORAGE_KEY };

export default function BeautyWelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Do not show on admin panel
    if (pathname?.startsWith("/secure-admin-panel")) return;

    try {
      const alreadySeen = localStorage.getItem(BEAUTY_WELCOME_POPUP_STORAGE_KEY);
      if (!alreadySeen) {
        // Smooth ~800ms delay after page load for elegant entry
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // Storage access blocked or restricted
    }
  }, [pathname]);

  const markSeen = () => {
    try {
      localStorage.setItem(BEAUTY_WELCOME_POPUP_STORAGE_KEY, "true");
    } catch {
      // Ignore storage errors in restricted contexts
    }
    setIsOpen(false);
  };

  const handleVisitBeauty = () => {
    markSeen();

    if (pathname === "/") {
      // On homepage: dispatch custom event to switch to Beauty & Fashion tab directly
      window.dispatchEvent(
        new CustomEvent("smartchoice:select-tab", { detail: "beauty" })
      );
      const grid = document.getElementById("products-grid");
      grid?.scrollIntoView({ behavior: "smooth" });
    } else {
      // On subpage: navigate to homepage with beauty tab preselected
      router.push("/?tab=beauty#products-grid");
    }
  };

  const handleDismiss = () => {
    markSeen();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-popup-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-pink-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-2xl shadow-purple-950/50">
        {/* Ambient Glow Orbs */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-purple-500/20 blur-3xl" />

        {/* Top-Right Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close welcome modal"
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          ✕
        </button>

        <div className="relative z-10">
          {/* Header Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-pink-500/10 border border-pink-500/30 text-pink-300 mb-4 shadow-sm">
            <span>✨</span>
            <span>NEW ON SMARTCHOICE • FOR MEN &amp; WOMEN</span>
          </div>

          {/* Headline */}
          <h2
            id="welcome-popup-title"
            className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug mb-3"
          >
            Discover Our Verified Beauty, Grooming &amp; Fashion Hub
          </h2>

          {/* Persuasive Anti-Adulteration Hook */}
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-body">
            When marketplace brand stores go out of stock, checkout often <strong>silently routes orders to unverified third-party sellers</strong> shipping adulterated or fake formulas. On SmartChoice, every skincare, haircare, grooming, and style link is strictly verified to point only to 100% legitimate, original brand stock.
          </p>

          {/* 3 Quick Visual Highlights */}
          <div className="space-y-3 mb-6 bg-slate-950/60 border border-white/10 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-base shrink-0">🛡️</span>
              <div>
                <p className="text-xs font-bold text-white">Zero-Adulteration Seller Links</p>
                <p className="text-[11px] text-slate-400">Strictly authorized brand stores &amp; verified official distributors only.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-base shrink-0">✨</span>
              <div>
                <p className="text-xs font-bold text-white">Curated for Everyone</p>
                <p className="text-[11px] text-slate-400">Bath bars, barrier skincare, beard care, grooming &amp; daily style essentials.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-base shrink-0">🔄</span>
              <div>
                <p className="text-xs font-bold text-white">Your Monthly Restock Shortcut</p>
                <p className="text-[11px] text-slate-400">Skip risky marketplace search clutter—reorder verified originals in 1 click.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleVisitBeauty}
              className="w-full py-3.5 px-6 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 text-white hover:scale-[1.01] active:scale-[0.99] transition-transform shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>✨ Visit Beauty &amp; Fashion Section</span>
              <span aria-hidden="true">→</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="w-full py-2.5 text-center font-mono text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Explore All Universal Picks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
