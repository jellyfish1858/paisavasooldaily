'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WARRANTY_TIERS, WarrantyTierData } from '@/lib/guides';
import { Shield, ShieldAlert, ShieldCheck, CheckCircle2, AlertOctagon, HelpCircle, ArrowRight } from 'lucide-react';

interface Props {
  ctaCollectionSlug?: string;
  ctaCollectionName?: string;
}

export default function WarrantySlider({
  ctaCollectionSlug = 'everyday-essentials',
  ctaCollectionName = 'Explore Reliable Everyday Essentials',
}: Props) {
  const [selectedTierIdx, setSelectedTierIdx] = useState<number>(1); // Default to Tier 1

  const currentTier: WarrantyTierData =
    WARRANTY_TIERS.find((t) => t.tierIndex === selectedTierIdx) || WARRANTY_TIERS[0];

  const getVerdictBadgeStyle = (verdict: string) => {
    switch (verdict) {
      case 'Always Use (Included)':
        return 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300';
      case 'Excellent Card Perk':
        return 'bg-blue-500/10 border-blue-400/30 text-blue-300';
      case 'Frequently Overpriced':
        return 'bg-amber-500/10 border-amber-400/30 text-amber-300';
      case 'Niche Emergency Value':
        return 'bg-purple-500/10 border-purple-400/30 text-purple-300';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="space-y-8">
      {/* Slider Control Box */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-blue-400" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
              Protection Level Slider (Drag to Compare)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Selected Tier: <strong className="text-white">{currentTier.tierIndex} of 5</strong>
          </span>
        </div>

        {/* The Range Slider */}
        <div className="space-y-3 px-2">
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={selectedTierIdx}
            onChange={(e) => setSelectedTierIdx(parseInt(e.target.value, 10))}
            className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Warranty protection level slider"
          />

          {/* Stepper Labels */}
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span className={selectedTierIdx === 1 ? 'text-blue-400 font-bold' : ''}>1. Return Window</span>
            <span className={selectedTierIdx === 2 ? 'text-blue-400 font-bold' : ''}>2. OEM Warranty</span>
            <span className={selectedTierIdx === 3 ? 'text-blue-400 font-bold' : ''}>3. Credit Card</span>
            <span className={selectedTierIdx === 4 ? 'text-blue-400 font-bold' : ''}>4. Extended Store</span>
            <span className={selectedTierIdx === 5 ? 'text-blue-400 font-bold' : ''}>5. ADH Accident</span>
          </div>
        </div>

        {/* Quick Clickable Pill Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
          {WARRANTY_TIERS.map((tier) => (
            <button
              key={tier.tierIndex}
              type="button"
              onClick={() => setSelectedTierIdx(tier.tierIndex)}
              className={`p-2.5 rounded-xl text-center text-xs border transition-all cursor-pointer ${
                selectedTierIdx === tier.tierIndex
                  ? 'bg-blue-600 border-blue-400 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="block font-mono text-[10px] text-slate-300">Tier {tier.tierIndex}</span>
              <span className="truncate block">{tier.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Tier Breakdown Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8 animate-reveal-up">
        {/* Tier Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider border ${getVerdictBadgeStyle(currentTier.verdict)}`}>
                {currentTier.verdict}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Duration: <strong className="text-white">{currentTier.durationLabel}</strong>
              </span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {currentTier.name}
            </h3>
            <p className="text-sm text-slate-300 max-w-2xl font-body leading-relaxed">
              {currentTier.coverageSummary}
            </p>
          </div>

          {/* Cost & Value Dial */}
          <div className="flex md:flex-col items-center justify-between p-4 rounded-xl bg-slate-950/80 border border-white/10 min-w-[170px] text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-slate-400 block mb-1">
              Estimated Cost
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-white font-mono block">
              {currentTier.costLabel}
            </span>
            <span className="text-[11px] font-mono text-blue-300 mt-1 block">
              Value Score: {currentTier.riskRewardScore} / 10
            </span>
          </div>
        </div>

        {/* Dual Matrix: What's Covered vs The Hidden Catch */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Covered */}
          <div className="p-6 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-4">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm font-mono uppercase tracking-wider">
              <CheckCircle2 size={16} />
              What Is Covered
            </div>
            <ul className="space-y-2.5">
              {currentTier.coveredItems.map((item, i) => (
                <li key={i} className="text-xs sm:text-sm text-slate-200 flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Excluded / The Catch */}
          <div className="p-6 rounded-xl bg-red-950/20 border border-red-500/30 space-y-4">
            <div className="flex items-center gap-2 text-red-300 font-bold text-sm font-mono uppercase tracking-wider">
              <AlertOctagon size={16} />
              The Catch & Exclusions
            </div>
            <ul className="space-y-2.5">
              {currentTier.excludedItems.map((item, i) => (
                <li key={i} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2.5">
                  <span className="text-red-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Editorial Strategy Tip */}
        <div className="p-5 rounded-xl bg-slate-950/70 border border-blue-500/30 flex items-start gap-3.5">
          <HelpCircle size={20} className="text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h5 className="font-bold text-white uppercase font-mono tracking-wider">
              Editorial Strategic Recommendation
            </h5>
            <p className="text-slate-300 leading-relaxed font-body">
              {currentTier.strategicAdvice}
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h5 className="text-sm font-bold text-white">
              Shop pre-screened products with solid warranties
            </h5>
            <p className="text-xs text-slate-400">
              We reject manufacturers with high defect rates or hostile return practices.
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
