'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SEASONAL_SHOPPING_MONTHS, MonthShoppingData } from '@/lib/guides';
import { Calendar, TrendingDown, AlertTriangle, CheckCircle, Sparkles, Star, Tag } from 'lucide-react';

interface Props {
  ctaCollectionSlug?: string;
  ctaCollectionName?: string;
}

export default function ShoppingCalendar({
  ctaCollectionSlug = 'trending-now',
  ctaCollectionName = 'Browse Current Seasonal Trends',
}: Props) {
  // Default to current calendar month (0-indexed)
  const currentCalendarMonth = new Date().getMonth();
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(currentCalendarMonth);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const selectedMonth: MonthShoppingData = SEASONAL_SHOPPING_MONTHS[selectedMonthIdx];

  const filterCategories = [
    { id: 'all', label: 'All Categories' },
    { id: 'tech', label: 'Tech & Electronics' },
    { id: 'appliances', label: 'Appliances & Mattresses' },
    { id: 'travel', label: 'Travel & Luggage' },
    { id: 'apparel', label: 'Apparel & Fitness' },
  ];

  return (
    <div className="space-y-8">
      {/* 12-Month Interactive Horizontal Selector */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-blue-400" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
              12-Month Retail Wave Selector
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Active: <strong className="text-white">{selectedMonth.monthName} ({selectedMonth.season})</strong>
          </span>
        </div>

        {/* Month Buttons Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-2">
          {SEASONAL_SHOPPING_MONTHS.map((m) => {
            const isSelected = selectedMonthIdx === m.monthIndex;
            const isCurrentMonth = currentCalendarMonth === m.monthIndex;

            return (
              <button
                key={m.monthIndex}
                type="button"
                onClick={() => setSelectedMonthIdx(m.monthIndex)}
                className={`py-3 px-2 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center justify-between gap-1 relative ${
                  isSelected
                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30 font-bold scale-105 z-10'
                    : 'bg-slate-950/60 border-white/5 text-slate-300 hover:border-white/20 hover:bg-slate-800'
                }`}
              >
                {isCurrentMonth && (
                  <span className="absolute -top-1.5 right-1 h-2 w-2 rounded-full bg-emerald-400" title="Current Month" />
                )}
                <span className="text-xs font-mono uppercase tracking-wider">
                  {m.monthName.slice(0, 3)}
                </span>
                <span className={`text-[10px] font-mono ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                  {m.avgDiscount.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Month Detail Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8 animate-reveal-up">
        {/* Month Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider bg-blue-500/10 border border-blue-400/30 text-blue-300">
                {selectedMonth.season} Season
              </span>
              {currentCalendarMonth === selectedMonth.monthIndex && (
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider bg-emerald-500/10 border border-emerald-400/30 text-emerald-300">
                  Current Month Right Now
                </span>
              )}
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {selectedMonth.monthName} Purchasing Strategy
            </h3>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl font-body leading-relaxed">
              {selectedMonth.strategyTip}
            </p>
          </div>

          {/* Savings Gauge */}
          <div className="flex md:flex-col items-center justify-between p-4 rounded-xl bg-slate-950/80 border border-white/10 min-w-[160px] text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-slate-400 block mb-1">
              Savings Potential
            </span>
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < selectedMonth.savingsScore ? 'fill-amber-400' : 'text-slate-700'}
                />
              ))}
            </div>
            <span className="font-mono text-xs text-slate-300 font-bold mt-1">
              Avg. {selectedMonth.avgDiscount} Off
            </span>
          </div>
        </div>

        {/* Dual Matrix: Best Things to Buy vs Things to Avoid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Best Things to Buy */}
          <div className="p-6 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-4">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-base font-mono uppercase tracking-wider">
              <CheckCircle size={18} />
              Best Value Opportunities
            </div>
            <ul className="space-y-2.5">
              {selectedMonth.bestToBuy.map((item, i) => (
                <li key={i} className="text-xs sm:text-sm text-slate-200 flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Things to Strictly Avoid */}
          <div className="p-6 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-4">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-base font-mono uppercase tracking-wider">
              <AlertTriangle size={18} />
              Peak Markup (Avoid Right Now)
            </div>
            <ul className="space-y-2.5">
              {selectedMonth.strictlyAvoid.map((item, i) => (
                <li key={i} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2.5">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Category Breakdown Highlights */}
        <div className="space-y-3">
          <h4 className="text-sm font-mono uppercase tracking-widest text-slate-400 font-bold">
            Sector Discount Drivers in {selectedMonth.monthName}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedMonth.categoryHighlights.map((cat, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-slate-950/60 border border-white/5 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <span className="font-bold text-white block">{cat.category}</span>
                  <span className="text-slate-400">{cat.reason}</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 font-mono font-bold shrink-0">
                  {cat.discountRange}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA to Trending Collections */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h5 className="text-sm font-bold text-white">
              Want verified real-time prices?
            </h5>
            <p className="text-xs text-slate-400">
              Browse our live collections where pricing history is checked daily against seasonal benchmarks.
            </p>
          </div>
          <Link
            href={`/collections/${ctaCollectionSlug}`}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-mono text-xs uppercase tracking-widest font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-blue-600/30 text-center"
          >
            {ctaCollectionName} →
          </Link>
        </div>
      </div>
    </div>
  );
}
