'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  WARRANTY_COMPARISON_TIERS,
  WarrantyComparisonTier,
  WARRANTY_DECISION_QUESTIONS,
  WarrantyDecisionStep,
} from '@/lib/guides';
import {
  Scale,
  Calculator,
  Shield,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react';

interface Props {
  ctaCollectionSlug?: string;
  ctaCollectionName?: string;
}

export default function WarrantyCalculator({
  ctaCollectionSlug = 'best-value',
  ctaCollectionName = 'Shop Verified Durable Equipment',
}: Props) {
  // Calculator State
  const [productPrice, setProductPrice] = useState<number>(15000);
  const [warrantyCost, setWarrantyCost] = useState<number>(2200);
  const [failureRatePercent, setFailureRatePercent] = useState<number>(12); // Industry average ~8-15%
  const [hasAccidentalCoverage, setHasAccidentalCoverage] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'calc' | 'matrix' | 'tree'>('calc');

  // Decision Tree State
  const [decisionAnswers, setDecisionAnswers] = useState<Record<string, number>>({});

  // Calculator Math: Expected Value (EV) calculation
  const calcResults = useMemo(() => {
    // Expected Loss without warranty = (Product Price * (Failure Rate / 100))
    const expectedLoss = Math.round(productPrice * (failureRatePercent / 100));
    // Cost difference = Warranty Cost - Expected Loss
    const costDifference = warrantyCost - expectedLoss;
    const warrantyCostPercent = Math.round((warrantyCost / productPrice) * 100);

    let recommendation: {
      action: 'skip' | 'consider' | 'buy';
      headline: string;
      badgeColor: string;
      textColor: string;
      rationale: string;
    };

    if (costDifference > Math.round(productPrice * 0.04) || warrantyCostPercent > 18) {
      recommendation = {
        action: 'skip',
        headline: 'Skip the Extended Warranty (Statistically Overpriced)',
        badgeColor: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
        textColor: 'text-rose-400',
        rationale: `You are paying ₹${warrantyCost.toLocaleString('en-IN')} for an expected statistical risk of only ₹${expectedLoss.toLocaleString('en-IN')}. Retail protection margins are steep. Put the ₹${warrantyCost.toLocaleString('en-IN')} into a personal self-insurance reserve instead.`,
      };
    } else if (costDifference < -Math.round(productPrice * 0.02) && hasAccidentalCoverage) {
      recommendation = {
        action: 'buy',
        headline: 'Extended Plan is Worth Considering (Elevated Risk)',
        badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        textColor: 'text-emerald-400',
        rationale: `Given your ${failureRatePercent}% estimated failure or drop probability on a ₹${productPrice.toLocaleString('en-IN')} item, the expected replacement risk (₹${expectedLoss.toLocaleString('en-IN')}) exceeds the upfront warranty cost (₹${warrantyCost.toLocaleString('en-IN')}).`,
      };
    } else {
      recommendation = {
        action: 'consider',
        headline: 'Check Payment Perks & Complimentary Coverage First',
        badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        textColor: 'text-amber-400',
        rationale: `The expected risk (₹${expectedLoss.toLocaleString('en-IN')}) roughly balances the plan cost (₹${warrantyCost.toLocaleString('en-IN')}). Before paying ₹${warrantyCost.toLocaleString('en-IN')}, verify whether your payment card or bank includes complimentary purchase protection or warranty extensions.`,
      };
    }

    return {
      expectedLoss,
      costDifference,
      warrantyCostPercent,
      recommendation,
    };
  }, [productPrice, warrantyCost, failureRatePercent, hasAccidentalCoverage]);

  // Decision Tree Score
  const totalDecisionScore = useMemo(() => {
    return Object.values(decisionAnswers).reduce((sum, val) => sum + val, 0);
  }, [decisionAnswers]);

  const decisionVerdict = useMemo(() => {
    const answeredCount = Object.keys(decisionAnswers).length;
    if (answeredCount < WARRANTY_DECISION_QUESTIONS.length) {
      return null;
    }

    if (totalDecisionScore >= 12) {
      return {
        verdict: 'Accidental Protection Justified',
        description: 'You carry this high-value device daily, rely on it for critical work, and pay without complimentary card perks. A competitive plan with accidental drop and liquid damage is defensible.',
        color: 'text-emerald-400',
        bg: 'border-emerald-500/30 bg-emerald-950/40',
      };
    } else if (totalDecisionScore >= 6) {
      return {
        verdict: 'Rely on Complimentary Card Perks / OEM Coverage',
        description: 'Your risk is moderate. Instead of paying an expensive store markup, verify if your payment card or banking perks offer complimentary warranty coverage, or rely on the standard manufacturer service network.',
        color: 'text-amber-400',
        bg: 'border-amber-500/30 bg-amber-950/40',
      };
    } else {
      return {
        verdict: 'Strictly Decline the Extended Warranty',
        description: 'Stationary gear in a home environment has a sub-5% failure probability. Paying 15-20% extra is pure retailer profit padding.',
        color: 'text-rose-400',
        bg: 'border-rose-500/30 bg-rose-950/40',
      };
    }
  }, [decisionAnswers, totalDecisionScore]);

  return (
    <div className="space-y-8">
      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        {[
          { id: 'calc', label: '1. Cost vs Risk Calculator', icon: Calculator },
          { id: 'matrix', label: '2. Standard vs Extended vs Card Table', icon: Scale },
          { id: 'tree', label: '3. Do You Need It? Decision Tree', icon: HelpCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* VIEW 1: INTERACTIVE CALCULATOR */}
      {activeTab === 'calc' && (
        <div className="space-y-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-blue-500/30 shadow-2xl space-y-8">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-semibold">
                Actuarial Math Engine
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Warranty Cost vs Replacement Risk Calculator
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 font-body">
                Adjust the sliders below to calculate your true statistical Expected Value (EV).
              </p>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Product Price Slider */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">Product Retail Price:</span>
                  <span className="text-lg font-mono font-bold text-white">₹{productPrice.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="150000"
                  step="1000"
                  value={productPrice}
                  onChange={(e) => setProductPrice(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>₹1,000</span>
                  <span>₹75,000</span>
                  <span>₹1,50,000</span>
                </div>
              </div>

              {/* Warranty Cost Slider */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">Warranty Price:</span>
                  <span className="text-lg font-mono font-bold text-white">
                    ₹{warrantyCost.toLocaleString('en-IN')}{' '}
                    <span className="text-xs text-slate-400 font-normal">
                      ({calcResults.warrantyCostPercent}%)
                    </span>
                  </span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="25000"
                  step="100"
                  value={warrantyCost}
                  onChange={(e) => setWarrantyCost(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>₹200</span>
                  <span>₹12,500</span>
                  <span>₹25,000</span>
                </div>
              </div>

              {/* Failure Probability Slider */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">Estimated Failure Risk:</span>
                  <span className="text-lg font-mono font-bold text-white">{failureRatePercent}%</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="35"
                  step="1"
                  value={failureRatePercent}
                  onChange={(e) => setFailureRatePercent(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>2% (Low Risk)</span>
                  <span>12% (Avg)</span>
                  <span>35% (Rough Use)</span>
                </div>
              </div>
            </div>

            {/* Checkbox for Accidental Damage */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/60 border border-white/5">
              <input
                type="checkbox"
                id="accidental"
                checked={hasAccidentalCoverage}
                onChange={(e) => setHasAccidentalCoverage(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
              />
              <label htmlFor="accidental" className="text-xs sm:text-sm text-slate-300 cursor-pointer">
                Does this plan include <strong className="text-white">Accidental Damage from Handling (drops & spills)</strong>?
              </label>
            </div>

            {/* Live Calculation Output Card */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-white/10 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-white/10 pb-5 text-center sm:text-left">
                <div className="space-y-1">
                  <span className="text-xs font-mono text-slate-400">Guaranteed Plan Cost:</span>
                  <div className="text-2xl font-mono font-black text-white">
                    ₹{warrantyCost.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">100% upfront loss</span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono text-slate-400">Expected Statistical Loss:</span>
                  <div className="text-2xl font-mono font-black text-amber-400">
                    ₹{calcResults.expectedLoss.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">₹{productPrice.toLocaleString('en-IN')} × {failureRatePercent}%</span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono text-slate-400">Merchant Markup Premium:</span>
                  <div className={`text-2xl font-mono font-black ${calcResults.costDifference > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {calcResults.costDifference > 0 ? `+₹${calcResults.costDifference.toLocaleString('en-IN')}` : `-₹${Math.abs(calcResults.costDifference).toLocaleString('en-IN')}`}
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">Cost minus risk</span>
                </div>
              </div>

              {/* Mathematical Recommendation */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Verdict:
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${calcResults.recommendation.badgeColor}`}>
                    {calcResults.recommendation.headline}
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-body">
                  {calcResults.recommendation.rationale}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: STANDARD VS EXTENDED VS CREDIT CARD MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {WARRANTY_COMPARISON_TIERS.map((tier) => (
              <div
                key={tier.tierId}
                className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-white/10 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-1 border-b border-white/10 pb-4">
                    <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">
                      {tier.provider}
                    </span>
                    <h4 className="text-lg font-extrabold text-white">
                      {tier.name}
                    </h4>
                    <span className="text-sm font-mono font-bold text-emerald-400 block pt-1">
                      {tier.costPercentage}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs font-mono">
                    <div className="flex justify-between text-slate-300 py-1 border-b border-white/5">
                      <span className="text-slate-400">Duration:</span>
                      <span className="text-white font-bold">{tier.coverageYears}</span>
                    </div>
                    <div className="flex justify-between text-slate-300 py-1 border-b border-white/5">
                      <span className="text-slate-400">Drops & Spills:</span>
                      <span className={tier.accidentalDamage ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                        {tier.accidentalDamage ? 'Included' : 'Excluded'}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300 py-1 border-b border-white/5">
                      <span className="text-slate-400">Deductible:</span>
                      <span className="text-white">{tier.deductible}</span>
                    </div>
                  </div>

                  {/* Pros & Cons */}
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1.5">
                      <span className="text-xs font-mono text-emerald-400 font-bold">Strengths:</span>
                      {tier.pros.map((pro, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span>{pro}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <span className="text-xs font-mono text-rose-400 font-bold">Limitations:</span>
                      {tier.cons.map((con, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <AlertTriangle size={13} className="text-rose-400 shrink-0 mt-0.5" />
                          <span>{con}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5 text-xs text-slate-300 italic">
                  &quot;{tier.verdict}&quot;
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: DECISION TREE */}
      {activeTab === 'tree' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-white/10 shadow-2xl space-y-8">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-semibold">
                Diagnostic Decision Tree
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Do You Really Need an Extended Warranty?
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 font-body">
                Answer these 4 questions to evaluate your physical exposure and financial risk profile.
              </p>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {WARRANTY_DECISION_QUESTIONS.map((q, idx) => (
                <div key={q.id} className="p-5 rounded-2xl bg-slate-950/80 border border-white/5 space-y-3">
                  <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-mono flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    {q.question}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = decisionAnswers[q.id] === opt.score;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() =>
                            setDecisionAnswers((prev) => ({
                              ...prev,
                              [q.id]: opt.score,
                            }))
                          }
                          className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                            isSelected
                              ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                              : 'bg-slate-900 text-slate-300 hover:text-white border-white/5'
                          }`}
                        >
                          <span className="text-xs font-body font-semibold">{opt.label}</span>
                          <span className="text-[11px] text-slate-400 font-normal leading-relaxed">
                            {opt.explanation}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Decision Verdict Output */}
            {decisionVerdict && (
              <div className={`p-6 rounded-2xl border ${decisionVerdict.bg} space-y-2 animate-in fade-in duration-200`}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                    Evaluation Verdict:
                  </span>
                  <span className={`text-sm font-mono font-bold ${decisionVerdict.color}`}>
                    {decisionVerdict.verdict}
                  </span>
                </div>
                <p className="text-sm text-slate-200 font-body leading-relaxed">
                  {decisionVerdict.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CTA Footer */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900/30 via-slate-900 to-purple-900/30 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <h4 className="text-lg font-extrabold text-white">
            Invest in quality hardware that doesn&apos;t break
          </h4>
          <p className="text-xs sm:text-sm text-slate-300">
            The best warranty is buying products built with high-tolerance components from day one.
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
