"use client";

import React from "react";
import { Search } from "lucide-react";

export default function ProductSearchBox() {
  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      <form
        action="/go"
        method="GET"
        className="flex flex-col sm:flex-row items-stretch gap-2 p-2 bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur focus-within:border-blue-500/50 transition-all"
      >
        <div className="relative flex-1 flex items-center">
          <Search
            className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            name="q"
            placeholder="Search any product, e.g. sunscreen for oily skin"
            required
            maxLength={100}
            className="w-full bg-transparent pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none"
            aria-label="Search any product"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="store-select" className="sr-only">
            Store
          </label>
          <select
            id="store-select"
            name="store"
            defaultValue="amazon"
            className="bg-slate-800 text-slate-200 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer w-full sm:w-auto"
            aria-label="Retailer Store"
          >
            <option value="amazon">Amazon</option>
            <option value="flipkart">Flipkart</option>
            <option value="meesho">Meesho</option>
          </select>

          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Search
          </button>
        </div>
      </form>
      <p className="mt-2 text-xs text-slate-400 text-center">
        As an Amazon Associate and affiliate partner, we earn from qualifying purchases.
      </p>
    </div>
  );
}

