'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { SPEC_DECODER_ITEMS, SpecDecoderItem } from '@/lib/guides';
import {
  Search,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  SlidersHorizontal,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface Props {
  ctaCollectionSlug?: string;
  ctaCollectionName?: string;
}

export default function SpecDecoder({
  ctaCollectionSlug = 'premium-picks',
  ctaCollectionName = 'View Curated High-Spec Hardware',
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedImportance, setSelectedImportance] = useState<string>('all');
  const [expandedSpecId, setExpandedSpecId] = useState<string>(SPEC_DECODER_ITEMS[0]?.id || '');
  const [customInput, setCustomInput] = useState('');

  // Quick prompt presets for custom decoder
  const quickTestSpecs = [
    '2000W Peak Power',
    '10,000,000:1 Dynamic Contrast',
    'IP68 Submersion',
    'Military-Grade MIL-STD-810G',
    '7500 MB/s SSD Sequential',
    '24K Gold Plated HDMI',
    'THD < 0.1%',
  ];

  // Filtered catalog
  const filteredSpecs = useMemo(() => {
    return SPEC_DECODER_ITEMS.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.marketingJargon.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.plainEnglishTranslation.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      const matchesImportance =
        selectedImportance === 'all' || item.importance === selectedImportance;

      return matchesSearch && matchesCategory && matchesImportance;
    });
  }, [searchQuery, selectedCategory, selectedImportance]);

  // Real-time custom query match
  const customAnalysis = useMemo(() => {
    if (!customInput.trim()) return null;
    const lower = customInput.toLowerCase();

    // Find closest matching item from catalog or provide dynamic evaluation
    const matched = SPEC_DECODER_ITEMS.find(
      (item) =>
        lower.includes(item.term.toLowerCase().slice(0, 5)) ||
        lower.includes(item.category) ||
        item.marketingJargon.toLowerCase().includes(lower) ||
        lower.split(' ').some((word) => word.length > 3 && item.marketingJargon.toLowerCase().includes(word))
    );

    if (matched) {
      return {
        matched: true,
        item: matched,
      };
    }

    // Heuristic analysis for unknown custom specs
    const isFluff =
      lower.includes('peak') ||
      lower.includes('gold') ||
      lower.includes('military') ||
      lower.includes('dynamic') ||
      lower.includes('quantum') ||
      lower.includes('extreme') ||
      lower.includes('mega') ||
      lower.includes('ai-powered') ||
      lower.includes('unbreakable');

    const isCrucial =
      lower.includes('rms') ||
      lower.includes('ip6') ||
      lower.includes('thd') ||
      lower.includes('wh') ||
      lower.includes('cycle') ||
      lower.includes('dci-p3') ||
      lower.includes('oled') ||
      lower.includes('iops');

    return {
      matched: false,
      heuristic: {
        term: customInput,
        verdict: isFluff
          ? 'Marketing-heavy; verify the underlying measurement'
          : isCrucial
          ? 'Usually important'
          : 'Depends on your use',
        importance: isFluff ? 'marketing-heavy' : isCrucial ? 'usually-important' : 'depends-on-use',
        translation: isFluff
          ? 'Contains high-frequency marketing superlatives often designed to inflate perceived performance without strict standardized lab testing.'
          : isCrucial
          ? 'Represents a measurable, standardized metric with direct physical implications on reliability, safety, or daily fidelity.'
          : 'Useful operational feature, but ensure you are not paying an exorbitant premium if your daily usage does not require this tier.',
        recommendation: isFluff
          ? 'Request the continuous, native, or RMS bench test equivalent from the manufacturer before purchasing.'
          : isCrucial
          ? 'Verify the manufacturer provides an exact laboratory certificate (BIS, CE, or standard compliance).'
          : 'Compare against baseline alternatives to determine personal value return.',
      },
    };
  }, [customInput]);

  const getVerdictBadge = (importance: SpecDecoderItem['importance']) => {
    switch (importance) {
      case 'usually-important':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            <CheckCircle size={14} className="text-emerald-400" />
            Usually important
          </span>
        );
      case 'depends-on-use':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300">
            <Info size={14} className="text-amber-400" />
            Depends on your use
          </span>
        );
      case 'marketing-heavy':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/10 border border-rose-500/30 text-rose-300">
            <AlertTriangle size={14} className="text-rose-400" />
            Marketing-heavy; verify the underlying measurement
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Interactive Spec Analyzer Input Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-blue-500/20 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Live Spec Decoder & Fluff Detector</h3>
              <p className="text-xs text-slate-400 font-mono">
                Type or paste any product spec to reveal the plain-English translation
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-blue-900/30 text-blue-300 border border-blue-800/40">
            Instant Analysis Engine
          </span>
        </div>

        {/* Input input */}
        <div className="relative">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="e.g. 2000W Peak Power, IP68, 10,000,000:1 Dynamic Contrast, Military Grade..."
            className="w-full px-4 py-3.5 pl-11 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
          />
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          {customInput && (
            <button
              onClick={() => setCustomInput('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 hover:text-white px-2 py-0.5 rounded bg-white/5"
            >
              Clear
            </button>
          )}
        </div>

        {/* Preset chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-mono text-slate-400 mr-1">Try quick specs:</span>
          {quickTestSpecs.map((spec) => (
            <button
              key={spec}
              onClick={() => setCustomInput(spec)}
              className="text-xs px-3 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-white/5 text-slate-300 hover:text-white transition-colors font-mono cursor-pointer"
            >
              {spec}
            </button>
          ))}
        </div>

        {/* Live Analysis Output Card */}
        {customAnalysis && (
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-950 border border-blue-400/30 animate-in fade-in duration-200 space-y-4">
            {customAnalysis.matched && customAnalysis.item ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">
                      {customAnalysis.item.category} specification
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-white">
                      {customAnalysis.item.term}
                    </h4>
                  </div>
                  {getVerdictBadge(customAnalysis.item.importance)}
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                    Plain-English Translation
                  </span>
                  <p className="text-sm text-slate-200 leading-relaxed font-body">
                    {customAnalysis.item.plainEnglishTranslation}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                    <span className="text-xs font-mono text-emerald-400 font-semibold block">
                      Target Benchmark:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {customAnalysis.item.baselineBenchmark}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                    <span className="text-xs font-mono text-rose-400 font-semibold block">
                      Watch Out For:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {customAnalysis.item.trapWarning}
                    </p>
                  </div>
                </div>
              </div>
            ) : customAnalysis.heuristic ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">
                      Heuristic Evaluation
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-white font-mono">
                      &quot;{customAnalysis.heuristic.term}&quot;
                    </h4>
                  </div>
                  {getVerdictBadge(customAnalysis.heuristic.importance as SpecDecoderItem['importance'])}
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                    Evaluation & Diagnostic
                  </span>
                  <p className="text-sm text-slate-200 leading-relaxed font-body">
                    {customAnalysis.heuristic.translation}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                  <span className="text-xs font-mono text-blue-300 font-semibold block">
                    Buyer Protocol:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {customAnalysis.heuristic.recommendation}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Catalog Search & Category Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={20} className="text-blue-400 shrink-0" />
            <h3 className="text-xl font-extrabold text-white">
              Essential Tech Spec Encyclopedia ({filteredSpecs.length})
            </h3>
          </div>

          {/* Search bar inside catalog */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog terms..."
              className="w-full px-3.5 py-2 pl-9 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 transition-colors font-mono"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400 mr-2">Category:</span>
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'power', label: 'Power & Batteries' },
            { id: 'displays', label: 'Displays & TVs' },
            { id: 'audio', label: 'Audio & Acoustics' },
            { id: 'computing', label: 'Computing & Storage' },
            { id: 'durability', label: 'Materials & Durability' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Importance Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-mono text-slate-400 mr-2">Verdict:</span>
          {[
            { id: 'all', label: 'All Verdicts' },
            { id: 'usually-important', label: 'Usually important' },
            { id: 'depends-on-use', label: 'Depends on your use' },
            { id: 'marketing-heavy', label: 'Marketing-heavy' },
          ].map((imp) => (
            <button
              key={imp.id}
              onClick={() => setSelectedImportance(imp.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                selectedImportance === imp.id
                  ? 'bg-slate-700 text-white font-bold border border-white/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {imp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Spec Catalog Accordion / Grid */}
      <div className="space-y-4">
        {filteredSpecs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-white/5 space-y-3">
            <HelpCircle size={36} className="text-slate-500 mx-auto" />
            <p className="text-slate-400 text-sm font-mono">
              No specifications found matching &quot;{searchQuery}&quot;. Try typing in the Live Spec Decoder above!
            </p>
          </div>
        ) : (
          filteredSpecs.map((item) => {
            const isExpanded = expandedSpecId === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'bg-slate-900/90 border-blue-500/40 shadow-xl'
                    : 'bg-slate-900/40 hover:bg-slate-900/70 border-white/5'
                }`}
              >
                {/* Header row: clickable to toggle translation */}
                <button
                  type="button"
                  onClick={() => setExpandedSpecId(isExpanded ? '' : item.id)}
                  className="w-full p-5 sm:p-6 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                        {item.category}
                      </span>
                      <h4 className="text-base sm:text-lg font-bold text-white hover:text-blue-300 transition-colors">
                        {item.term}
                      </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400 font-mono italic">
                      Seen on boxes as: <span className="text-slate-300">{item.marketingJargon}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {getVerdictBadge(item.importance)}
                    <span className="text-xs font-mono text-blue-400 hover:underline">
                      {isExpanded ? 'Hide Translation ▲' : 'Decode Spec ▼'}
                    </span>
                  </div>
                </button>

                {/* Expanded Translation Body */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-white/5 space-y-5 animate-in fade-in duration-150">
                    <div className="space-y-2">
                      <span className="text-xs font-mono text-blue-400 uppercase tracking-widest font-bold block">
                        Plain-English Translation
                      </span>
                      <p className="text-sm text-slate-200 leading-relaxed font-body">
                        {item.plainEnglishTranslation}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/20 space-y-1.5">
                        <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                          <CheckCircle size={14} /> Realistic Benchmark:
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed font-body">
                          {item.baselineBenchmark}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950/70 border border-rose-500/20 space-y-1.5">
                        <span className="text-xs font-mono text-rose-400 font-bold flex items-center gap-1.5">
                          <AlertTriangle size={14} /> The Marketing Trap:
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed font-body">
                          {item.trapWarning}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Spec Reading Golden Rules */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <ShieldAlert size={20} className="text-blue-400" />
          The 3 Golden Rules of Spec Reading
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5">
            <span className="font-bold text-white block font-mono text-xs text-blue-400">
              1. Never Buy Peak
            </span>
            <p className="leading-relaxed text-slate-300">
              Peak wattage, peak lumens, and peak contrast are burst spikes lasting milliseconds. Only continuous RMS metrics matter.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5">
            <span className="font-bold text-white block font-mono text-xs text-emerald-400">
              2. Demand Standard Numbers
            </span>
            <p className="leading-relaxed text-slate-300">
              Look for official standard codes like IP68, USB-PD 3.1, or DCI-P3 rather than trademarked brand superlatives.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5">
            <span className="font-bold text-white block font-mono text-xs text-amber-400">
              3. Check the Fine Print
            </span>
            <p className="leading-relaxed text-slate-300">
              If a spec footnote says &quot;*tested under ideal laboratory conditions&quot;, reduce the advertised figure by 30-40% for real life.
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic CTA Footer */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900/30 via-slate-900 to-purple-900/30 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <h4 className="text-lg font-extrabold text-white">
            Ready to find hardware with clear, realistic specs?
          </h4>
          <p className="text-xs sm:text-sm text-slate-300">
            Every product in our curated collection is researched from customer reviews and product specifications for realistic continuous ratings.
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
