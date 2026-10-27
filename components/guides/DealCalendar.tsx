'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DEAL_CALENDAR_DATA, DealMonthData } from '@/lib/guides';
import {
  CalendarDays,
  Star,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Sparkles,
  ArrowRight,
  Clock,
  Tag,
  AlertCircle,
} from 'lucide-react';

interface Props {
  ctaCollectionSlug?: string;
  ctaCollectionName?: string;
}

export default function DealCalendar({
  ctaCollectionSlug = 'trending-now',
  ctaCollectionName = 'Explore Current Seasonal Deals',
}: Props) {
  // Default to current calendar month
  const currentMonthNum = new Date().getMonth() + 1;
  const [selectedMonthNum, setSelectedMonthNum] = useState<number>(currentMonthNum);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const selectedMonth: DealMonthData =
    DEAL_CALENDAR_DATA.find((m) => m.monthNum === selectedMonthNum) ||
    DEAL_CALENDAR_DATA[10];

  const renderStars = (score: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={14}
            className={`${
              s <= score ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* 12-Month Interactive Grid Selector */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-white/10 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-semibold">
              12-Month Retail Promotional Calendar
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Select Any Month to Reveal Seasonal Promotional Windows
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400 px-3 py-1 rounded-full bg-white/5 border border-white/10 shrink-0">
            Current Calendar Cycle
          </span>
        </div>

        {/* Month Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {DEAL_CALENDAR_DATA.map((m) => {
            const isSelected = selectedMonthNum === m.monthNum;
            const isCurrent = currentMonthNum === m.monthNum;

            return (
              <button
                key={m.monthNum}
                onClick={() => setSelectedMonthNum(m.monthNum)}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/10 scale-102 ring-1 ring-blue-500/40'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-sm font-bold ${isSelected ? 'text-blue-300' : 'text-white'}`}>
                    {m.month.slice(0, 3)}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500 text-white font-bold">
                      Now
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    {renderStars(m.savingsScore)}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 block truncate">
                    {m.averageDiscount}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Month Spotlight */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-blue-500/30 shadow-2xl space-y-8 animate-in fade-in duration-200">
        {/* Month Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <CalendarDays size={24} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                {selectedMonth.month} Deal Forecast
              </h3>
            </div>
            <p className="text-sm font-mono text-blue-400">
              Season: {selectedMonth.seasonName}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-white/5">
            <div>
              <span className="text-[11px] font-mono uppercase text-slate-400 block">
                Savings Potential:
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                {renderStars(selectedMonth.savingsScore)}
                <span className="text-xs font-mono font-bold text-white">
                  ({selectedMonth.savingsScore}/5 Stars)
                </span>
              </div>
            </div>
            <div className="border-l border-white/10 pl-4">
              <span className="text-[11px] font-mono uppercase text-slate-400 block">
                Avg. Discount:
              </span>
              <span className="text-sm font-mono font-black text-emerald-400">
                {selectedMonth.averageDiscount}
              </span>
            </div>
          </div>
        </div>

        {/* Best Categories vs Categories to Avoid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Best Categories to Buy */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-4">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={20} className="text-emerald-400" />
              <h4 className="text-base font-extrabold text-white">
                Top Categories to Buy in {selectedMonth.month}
              </h4>
            </div>

            <div className="space-y-3">
              {selectedMonth.bestCategories.map((cat, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/90 border border-white/5 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-white font-body">
                      {cat.name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shrink-0">
                      {cat.discountRange} off
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-body leading-relaxed">
                    {cat.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Categories to Avoid */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-rose-500/30 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <XCircle size={20} className="text-rose-400" />
                <h4 className="text-base font-extrabold text-white">
                  Categories to Strictly Avoid This Month
                </h4>
              </div>

              <div className="space-y-3">
                {selectedMonth.avoidCategories.map((cat, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-white/5 space-y-1.5"
                  >
                    <span className="text-sm font-bold text-rose-300 font-body block">
                      ⚠️ {cat.name}
                    </span>
                    <p className="text-xs text-slate-300 font-body leading-relaxed">
                      {cat.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Events in this Month */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                Major Retail Events in {selectedMonth.month}:
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedMonth.keyEvents.map((evt, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20"
                  >
                    {evt}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Insider Timing Tip */}
        <div className="p-4 sm:p-5 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-start gap-3.5">
          <Sparkles size={20} className="text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-blue-300 font-bold block">
              {selectedMonth.month} Insider Timing Secret:
            </span>
            <p className="text-xs sm:text-sm text-slate-200 font-body leading-relaxed">
              {selectedMonth.insiderTip}
            </p>
          </div>
        </div>
      </div>

      {/* Category Buying Cheat Sheet */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-white/10 space-y-5">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Tag size={20} className="text-blue-400" />
          Category Buying Cheat Sheet at a Glance
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5">
            <span className="font-bold text-white block text-sm">📺 4K Smart TVs & Displays</span>
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-emerald-400">Best:</strong> Festive-season sales (September/October) & Republic Day windows.<br />
              <strong className="text-rose-400">Avoid:</strong> March through May when new model lineups launch at full retail pricing.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5">
            <span className="font-bold text-white block text-sm">💻 Laptops & Computing</span>
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-emerald-400">Best:</strong> Mid-year student/back-to-college periods (July/August) & festive events.<br />
              <strong className="text-rose-400">Avoid:</strong> January to March preceding financial year-end prior to new silicon availability.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5">
            <span className="font-bold text-white block text-sm">📱 Flagship Smartphones</span>
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-emerald-400">Best:</strong> September / October festive period (preceding generation models see notable discounts).<br />
              <strong className="text-rose-400">Avoid:</strong> July & August immediately preceding annual flagship refresh announcements.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5">
            <span className="font-bold text-white block text-sm">❄️ Cooling & Major Appliances</span>
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-emerald-400">Best:</strong> Pre-summer clearance (February/March) for ACs and refrigerators; festive sales for washing machines.<br />
              <strong className="text-rose-400">Avoid:</strong> Peak summer heat (May/June) when surge demand eliminates promotional incentives.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5">
            <span className="font-bold text-white block text-sm">🎧 Audio & Personal Tech</span>
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-emerald-400">Best:</strong> Festive-season sale period (October) & early-year clearance.<br />
              <strong className="text-rose-400">Avoid:</strong> March to April during standard catalog transitions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5">
            <span className="font-bold text-white block text-sm">🏠 Kitchen & Home Upgrades</span>
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-emerald-400">Best:</strong> Festive home refresh season (September/October) & Republic Day clearance.<br />
              <strong className="text-rose-400">Avoid:</strong> Mid-monsoon when outdoor hardware promotions taper off.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900/30 via-slate-900 to-amber-900/30 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <h4 className="text-lg font-extrabold text-white">
            Looking for deals right now?
          </h4>
          <p className="text-xs sm:text-sm text-slate-300">
            Check out our algorithmically tracked trending picks with verified historical discounts.
          </p>
        </div>
        <Link
          href={`/collections/${ctaCollectionSlug}`}
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold tracking-wider uppercase transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 shrink-0"
        >
          {ctaCollectionName}
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
