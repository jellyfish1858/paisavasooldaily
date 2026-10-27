'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DECISION_TREE_NODES, DECISION_CONCLUSIONS, DecisionTreeNode, DecisionConclusion } from '@/lib/guides';
import { GitBranch, ArrowRight, RotateCcw, CheckCircle2, ChevronRight, Calculator, Sparkles } from 'lucide-react';

interface Props {
  ctaCollectionSlug?: string;
  ctaCollectionName?: string;
}

export default function DecisionTree({
  ctaCollectionSlug = 'smart-buys',
  ctaCollectionName = 'Explore Smart Buys',
}: Props) {
  const [currentNodeId, setCurrentNodeId] = useState<string>('root');
  const [history, setHistory] = useState<{ nodeId: string; chosenLabel: string }[]>([]);

  const currentNode: DecisionTreeNode | undefined = DECISION_TREE_NODES[currentNodeId];
  const conclusion: DecisionConclusion | undefined = DECISION_CONCLUSIONS[currentNodeId];

  const handleSelectOption = (nextNodeId: string, chosenLabel: string) => {
    setHistory((prev) => [...prev, { nodeId: currentNodeId, chosenLabel }]);
    setCurrentNodeId(nextNodeId);
  };

  const handleBackToStep = (index: number) => {
    const target = history[index];
    if (target) {
      setCurrentNodeId(target.nodeId);
      setHistory((prev) => prev.slice(0, index));
    }
  };

  const handleReset = () => {
    setCurrentNodeId('root');
    setHistory([]);
  };

  // Conclusion View
  if (conclusion) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8 animate-reveal-up">
        {/* Breadcrumb Path History */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
          <button
            type="button"
            onClick={handleReset}
            className="hover:text-blue-400 transition-colors cursor-pointer"
          >
            Start
          </button>
          {history.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <ChevronRight size={12} className="text-slate-600" />
              <button
                type="button"
                onClick={() => handleBackToStep(idx)}
                className="hover:text-blue-400 transition-colors cursor-pointer text-slate-300"
              >
                {step.chosenLabel}
              </button>
            </div>
          ))}
          <ChevronRight size={12} className="text-slate-600" />
          <span className="text-blue-400 font-bold">Conclusion</span>
        </div>

        {/* Conclusion Badge & Title */}
        <div className="space-y-4">
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-blue-500/10 border border-blue-400/30 text-blue-300">
            {conclusion.badge}
          </span>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {conclusion.title}
          </h3>
          <p className="text-base text-slate-300 leading-relaxed max-w-3xl">
            {conclusion.summary}
          </p>
        </div>

        {/* Cost-Per-Use (CPU) Formula Callout */}
        <div className="p-5 rounded-xl bg-slate-950/80 border border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
              <Calculator size={20} />
            </div>
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-slate-400 block">
                Calculated Value Metric
              </span>
              <span className="font-mono text-sm sm:text-base font-bold text-white">
                {conclusion.formula}
              </span>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400 max-w-xs text-right">
            True economics measure cost divided by lifetime utility, not checkout sticker price.
          </span>
        </div>

        {/* Strategic Buying Rules */}
        <div className="space-y-3 pt-2">
          <h4 className="text-sm font-mono uppercase tracking-widest text-slate-400 font-bold">
            Actionable Rules For This Tier
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {conclusion.recommendations.map((rec, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1 text-xs"
              >
                <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                  <CheckCircle2 size={14} />
                  <span>Rule #{i + 1}</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-body">
                  {rec}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
          >
            <RotateCcw size={15} />
            Restart Decision Tree
          </button>

          <Link
            href={`/collections/${conclusion.recommendedCollection || ctaCollectionSlug}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-mono text-xs uppercase tracking-widest font-bold transition-all transform hover:scale-105 shadow-lg shadow-blue-600/30"
          >
            {conclusion.recommendedCollectionName || ctaCollectionName} →
          </Link>
        </div>
      </div>
    );
  }

  // Active Decision Tree Node View
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8">
      {/* Header & Breadcrumb Trail */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-blue-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <GitBranch size={15} />
            Interactive Branching Node
          </span>
          <span className="text-slate-400">
            Step {history.length + 1}
          </span>
        </div>

        {history.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
            <button
              type="button"
              onClick={handleReset}
              className="hover:text-blue-400 transition-colors cursor-pointer"
            >
              Start
            </button>
            {history.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <ChevronRight size={12} className="text-slate-600" />
                <button
                  type="button"
                  onClick={() => handleBackToStep(idx)}
                  className="hover:text-blue-400 transition-colors cursor-pointer text-slate-300"
                >
                  {step.chosenLabel}
                </button>
              </div>
            ))}
          </div>
        )}

        <div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            {currentNode?.prompt}
          </h3>
          <p className="text-sm text-slate-300 mt-2 font-body leading-relaxed max-w-2xl">
            {currentNode?.subtitle}
          </p>
        </div>
      </div>

      {/* Decision Options */}
      <div className="grid grid-cols-1 gap-4">
        {currentNode?.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSelectOption(opt.nextNodeId, opt.label)}
            className="w-full p-5 sm:p-6 rounded-xl bg-slate-950/60 border border-white/10 hover:border-blue-400/50 hover:bg-slate-900/80 transition-all text-left flex items-center justify-between gap-4 group cursor-pointer"
          >
            <div className="space-y-1">
              <span className="text-base sm:text-lg font-bold text-white group-hover:text-blue-300 transition-colors block">
                {opt.label}
              </span>
              <p className="text-xs sm:text-sm text-slate-400 font-body leading-relaxed">
                {opt.description}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/5 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-400 shrink-0 transition-all">
              <ArrowRight size={18} />
            </div>
          </button>
        ))}
      </div>

      {history.length > 0 && (
        <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs">
          <button
            type="button"
            onClick={() => handleBackToStep(history.length - 1)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ← Previous Question
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            Reset Tree
          </button>
        </div>
      )}
    </div>
  );
}
