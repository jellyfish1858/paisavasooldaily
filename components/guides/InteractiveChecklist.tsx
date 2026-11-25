'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { QUALITY_CHECKLIST_ITEMS, ChecklistItem } from '@/lib/guides';
import { CheckSquare, Square, RotateCcw, ShieldCheck, AlertTriangle, Award, CheckCircle2 } from 'lucide-react';

interface Props {
  ctaCollectionSlug?: string;
  ctaCollectionName?: string;
}

export default function InteractiveChecklist({
  ctaCollectionSlug = 'premium-picks',
  ctaCollectionName = 'View Curated High-Quality Picks',
}: Props) {
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [hasLoadedSaved, setHasLoadedSaved] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('smartchoice_quality_checklist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCheckedIds(parsed);
        }
      }
    } catch {
      // Ignore storage errors
    } finally {
      setHasLoadedSaved(true);
    }
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    if (hasLoadedSaved) {
      try {
        localStorage.setItem('smartchoice_quality_checklist', JSON.stringify(checkedIds));
      } catch {
        // Ignore storage errors
      }
    }
  }, [checkedIds, hasLoadedSaved]);

  const toggleItem = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setCheckedIds(QUALITY_CHECKLIST_ITEMS.map((item) => item.id));
  };

  const handleReset = () => {
    setCheckedIds([]);
    try {
      localStorage.removeItem('smartchoice_quality_checklist');
    } catch {
      // Ignore storage errors
    }
  };

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return QUALITY_CHECKLIST_ITEMS;
    return QUALITY_CHECKLIST_ITEMS.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const scoreData = useMemo(() => {
    const totalMax = QUALITY_CHECKLIST_ITEMS.reduce((sum, item) => sum + item.weight, 0);
    const currentScore = QUALITY_CHECKLIST_ITEMS.filter((item) =>
      checkedIds.includes(item.id)
    ).reduce((sum, item) => sum + item.weight, 0);

    const percentage = Math.round((currentScore / totalMax) * 100);
    const count = checkedIds.length;
    const totalCount = QUALITY_CHECKLIST_ITEMS.length;

    let tierBadge = 'Needs Inspection';
    let tierColor = 'text-amber-400 border-amber-400/30 bg-amber-500/10';
    let progressBg = 'bg-amber-500';
    let verdictTitle = 'Unverified or High-Risk Build';
    let verdictDesc =
      'This product misses key quality indicators. If buying, inspect return policies closely and anticipate potential compromises in longevity.';

    if (percentage >= 85) {
      tierBadge = 'Buy-It-For-Life (BIFL) Grade';
      tierColor = 'text-emerald-300 border-emerald-400/30 bg-emerald-500/10';
      progressBg = 'bg-gradient-to-r from-emerald-500 to-teal-400';
      verdictTitle = 'True Premium Engineering';
      verdictDesc =
        'Exceptional build standards across materials, fasteners, and brand support. Extremely low likelihood of premature failure or buyer regret.';
    } else if (percentage >= 65) {
      tierBadge = 'Superior Quality Grade';
      tierColor = 'text-blue-300 border-blue-400/30 bg-blue-500/10';
      progressBg = 'bg-gradient-to-r from-blue-500 to-indigo-500';
      verdictTitle = 'Durable Workhorse Benchmark';
      verdictDesc =
        'Meets the 80/20 benchmark for dependable everyday utility. Balances substantial durability without paying luxury branding premiums.';
    } else if (percentage >= 40) {
      tierBadge = 'Average Casual Utility';
      tierColor = 'text-yellow-300 border-yellow-400/30 bg-yellow-500/10';
      progressBg = 'bg-yellow-500';
      verdictTitle = 'Moderate Everyday Build';
      verdictDesc =
        'Acceptable for light or periodic use. Avoid high-stress mission-critical roles where unexpected breakdown creates safety or workflow disruptions.';
    }

    return {
      percentage,
      count,
      totalCount,
      tierBadge,
      tierColor,
      progressBg,
      verdictTitle,
      verdictDesc,
    };
  }, [checkedIds]);

  const categories = [
    { id: 'all', label: 'All Criteria (12)' },
    { id: 'materials', label: 'Materials (3)' },
    { id: 'construction', label: 'Hardware & Build (3)' },
    { id: 'safety', label: 'Safety & Thermal (3)' },
    { id: 'brand', label: 'Brand & Warranty (3)' },
  ];

  return (
    <div className="space-y-8">
      {/* Live Interactive Scoreboard Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider border ${scoreData.tierColor}`}>
                {scoreData.tierBadge}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {scoreData.count} of {scoreData.totalCount} standards checked
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              {scoreData.verdictTitle}
            </h3>
            <p className="text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              {scoreData.verdictDesc}
            </p>
          </div>

          {/* Big Score Dial */}
          <div className="flex items-center md:flex-col justify-between md:justify-center p-4 rounded-xl bg-slate-950/80 border border-white/10 min-w-[140px] text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-slate-400">Quality Score</span>
            <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              {scoreData.percentage}%
            </span>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-white/5">
          <div
            className={`h-full transition-all duration-500 ease-out ${scoreData.progressBg}`}
            style={{ width: `${Math.max(5, scoreData.percentage)}%` }}
            role="progressbar"
            aria-valuenow={scoreData.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Quality score progress"
          />
        </div>

        {/* Quick Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-white/10 text-xs">
          <span className="text-slate-400">
            Tip: Tick each item as you inspect product photos, specs, and teardowns.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
            >
              Check All
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RotateCcw size={13} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Checklist Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const isChecked = checkedIds.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  toggleItem(item.id);
                }
              }}
              tabIndex={0}
              role="checkbox"
              aria-checked={isChecked}
              aria-label={item.title}
              className={`p-5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-4 ${
                isChecked
                  ? 'bg-blue-950/30 border-blue-500/40 shadow-md shadow-blue-500/10'
                  : 'bg-slate-900/60 border-white/10 hover:border-white/25 hover:bg-slate-900'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isChecked ? (
                  <CheckSquare size={22} className="text-blue-400" />
                ) : (
                  <Square size={22} className="text-slate-500" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className={`text-base font-semibold leading-snug ${isChecked ? 'text-white' : 'text-slate-200'}`}>
                    {item.title}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 uppercase tracking-wider">
                    +{item.weight} pts
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-body">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Recommendation & CTA */}
      <div className="bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-slate-950 border border-blue-500/30 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-blue-400 font-mono text-xs uppercase tracking-wider font-bold">
            <CheckCircle2 size={16} />
            Paisavasooldaily Curated Catalog
          </div>
          <h4 className="text-xl font-bold text-white">
            Looking for products that already pass this 12-point audit?
          </h4>
          <p className="text-sm text-slate-300 max-w-xl">
            Our curated catalog highlights products with strong build quality, clear specifications, and customer-tested reliability.
          </p>
        </div>
        <Link
          href={`/collections/${ctaCollectionSlug}`}
          className="shrink-0 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-mono text-xs uppercase tracking-widest font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-blue-600/30 text-center"
        >
          {ctaCollectionName} →
        </Link>
      </div>
    </div>
  );
}
