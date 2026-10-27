'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { AUTHENTICATION_CHECKLIST_ITEMS, AuthChecklistItem } from '@/lib/guides';
import {
  ShieldAlert,
  ShieldCheck,
  CheckSquare,
  Square,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  QrCode,
  Package,
  Cpu,
  Scale,
} from 'lucide-react';

interface Props {
  ctaCollectionSlug?: string;
  ctaCollectionName?: string;
}

export default function AuthenticationChecklist({
  ctaCollectionSlug = 'smart-buys',
  ctaCollectionName = 'Browse Authentic Verified Products',
}: Props) {
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [hasLoadedSaved, setHasLoadedSaved] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('smartchoice_auth_checklist');
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
        localStorage.setItem('smartchoice_auth_checklist', JSON.stringify(checkedIds));
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
    setCheckedIds(AUTHENTICATION_CHECKLIST_ITEMS.map((item) => item.id));
  };

  const handleReset = () => {
    setCheckedIds([]);
    try {
      localStorage.removeItem('smartchoice_auth_checklist');
    } catch {
      // Ignore storage errors
    }
  };

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return AUTHENTICATION_CHECKLIST_ITEMS;
    return AUTHENTICATION_CHECKLIST_ITEMS.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const scoreData = useMemo(() => {
    const totalMax = AUTHENTICATION_CHECKLIST_ITEMS.reduce((sum, item) => sum + item.weight, 0);
    const currentScore = AUTHENTICATION_CHECKLIST_ITEMS.filter((item) =>
      checkedIds.includes(item.id)
    ).reduce((sum, item) => sum + item.weight, 0);

    const percentage = Math.round((currentScore / totalMax) * 100);
    const count = checkedIds.length;

    let tier: {
      label: string;
      color: string;
      borderColor: string;
      textColor: string;
      bgBadge: string;
      summary: string;
    };

    if (percentage >= 85) {
      tier = {
        label: 'Verified Authentic Hardware',
        color: 'from-emerald-500 to-teal-500',
        borderColor: 'border-emerald-500/40',
        textColor: 'text-emerald-400',
        bgBadge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        summary: 'Excellent! Product passes comprehensive forensic checks across packaging, hardware weight tolerances, and cryptographic app registration.',
      };
    } else if (percentage >= 60) {
      tier = {
        label: 'Probable Authentic / Minor Anomalies',
        color: 'from-blue-500 to-indigo-500',
        borderColor: 'border-blue-500/40',
        textColor: 'text-blue-400',
        bgBadge: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
        summary: 'Solid score, but missing a few critical verification pillars. Double-check official companion app handshake or serial portal lookups.',
      };
    } else if (percentage >= 35) {
      tier = {
        label: 'Suspicious / Inconclusive Authenticity',
        color: 'from-amber-500 to-orange-500',
        borderColor: 'border-amber-500/40',
        textColor: 'text-amber-400',
        bgBadge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        summary: 'Caution! Significant physical or serial red flags detected. Do not discard retail packaging; prepare to request return documentation.',
      };
    } else {
      tier = {
        label: 'High Counterfeit Risk Detected',
        color: 'from-rose-500 to-red-600',
        borderColor: 'border-rose-500/40',
        textColor: 'text-rose-400',
        bgBadge: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
        summary: 'Danger: Product fails essential physical, weight, and regulatory checks. High probability of knockoff or counterfeit clone.',
      };
    }

    return { percentage, currentScore, totalMax, count, tier };
  }, [checkedIds]);

  return (
    <div className="space-y-8">
      {/* Real-Time Authenticity Score Card */}
      <div className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border ${scoreData.tier.borderColor} shadow-2xl relative overflow-hidden space-y-6 transition-all duration-300`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
              15-Point Forensic Inspection Score
            </span>
            <div className="flex items-center gap-3">
              <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                {scoreData.percentage}%
              </span>
              <div className="space-y-0.5">
                <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${scoreData.tier.bgBadge}`}>
                  {scoreData.tier.label}
                </span>
                <span className="text-xs font-mono text-slate-400 block">
                  {scoreData.count} of 15 Verification Points Confirmed ({scoreData.currentScore} / {scoreData.totalMax} pts)
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-mono transition-colors cursor-pointer"
            >
              Verify All
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-300 border border-white/10 text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={13} />
              Reset
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-3 rounded-full bg-slate-800/80 overflow-hidden p-0.5 border border-white/5">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${scoreData.tier.color} transition-all duration-500`}
              style={{ width: `${scoreData.percentage}%` }}
            />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-body">
            {scoreData.tier.summary}
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        {[
          { id: 'all', label: 'All 15 Points', icon: Sparkles },
          { id: 'packaging', label: '1. Packaging & Print (4)', icon: Package },
          { id: 'serial', label: '2. QR & Serial (4)', icon: QrCode },
          { id: 'physical', label: '3. Weight & Density (4)', icon: Scale },
          { id: 'firmware', label: '4. Software & Compliance Marks (3)', icon: Cpu },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const isChecked = checkedIds.includes(item.id);
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isChecked
                  ? 'bg-slate-900/80 border-blue-500/30'
                  : 'bg-slate-900/40 hover:bg-slate-900/60 border-white/5'
              }`}
            >
              <div className="p-4 sm:p-5 flex items-start gap-4">
                {/* Checkbox Button */}
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-label={`Toggle ${item.title}`}
                  className="mt-0.5 text-blue-400 hover:text-blue-300 shrink-0 cursor-pointer focus:outline-none"
                >
                  {isChecked ? (
                    <CheckSquare size={22} className="text-blue-400" />
                  ) : (
                    <Square size={22} className="text-slate-600 hover:text-slate-400" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 space-y-1 cursor-pointer" onClick={() => toggleItem(item.id)}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4
                      className={`text-sm sm:text-base font-bold transition-colors ${
                        isChecked ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {item.title}
                    </h4>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                      +{item.weight} pts
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 font-body leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Expand / Details Button */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="text-xs font-mono text-blue-400 hover:underline shrink-0 pt-1 cursor-pointer"
                >
                  {isExpanded ? 'Less ▲' : 'Inspection Tips ▼'}
                </button>
              </div>

              {/* Expanded Inspection Guide */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-white/5 bg-slate-950/60 space-y-4 animate-in fade-in duration-150">
                  <div className="space-y-1.5">
                    <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Verification Step:
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-body">
                      {item.verificationStep}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-mono text-rose-400 font-semibold flex items-center gap-1.5">
                      <AlertTriangle size={14} /> Counterfeit Red Flags:
                    </span>
                    <ul className="space-y-1">
                      {item.redFlags.map((flag, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-rose-400 leading-none mt-1">•</span>
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Practical Verification Signals Advisory */}
      <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/20 text-xs font-mono text-slate-300 flex items-start gap-2.5">
        <Sparkles size={16} className="text-blue-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-blue-300">Verification note:</strong> Individual checks (such as QR codes, barcodes, or serial validation lookups) are a useful verification signal, not proof on its own. Replicas frequently clone real serial numbers. Always evaluate the full spectrum of packaging quality, weight tolerances, seller tax invoice, and official companion app registration.
        </p>
      </div>

      {/* Emergency Escort Protocol */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <ShieldAlert size={20} className="text-rose-400" />
          What to Do If You Suspect an Inauthentic Item
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5">
            <span className="font-bold text-white block font-mono text-xs text-rose-400">
              1. Stop Charging / Using
            </span>
            <p className="leading-relaxed text-slate-300">
              Substandard electronics and clone batteries often lack thermal fuses and over-voltage protection circuits. Disconnect from power immediately.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5">
            <span className="font-bold text-white block font-mono text-xs text-blue-400">
              2. Preserve Evidence & Outer Packaging
            </span>
            <p className="leading-relaxed text-slate-300">
              Photograph all barcode labels, shipping waybills, packaging anomalies, and the registered tax invoice. Platform grievance channels require clear evidence.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5">
            <span className="font-bold text-white block font-mono text-xs text-emerald-400">
              3. Escalate Platform Dispute
            </span>
            <p className="leading-relaxed text-slate-300">
              Raise a formal return ticket with your evidence under &quot;Counterfeit / Substandard item&quot;. If the seller is unresponsive, escalate through official consumer grievance channels.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900/30 via-slate-900 to-emerald-900/30 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <h4 className="text-lg font-extrabold text-white">
            Skip the clone lottery with 100% genuine picks
          </h4>
          <p className="text-xs sm:text-sm text-slate-300">
            Every product showcased on SmartChoice links directly to verified manufacturer brand stores.
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
