'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  RETURN_SCENARIOS,
  ReturnScenario,
  RETURN_POLICY_TERMS,
  PolicyTerm,
  CONSUMER_GRIEVANCE_CHANNELS,
  ConsumerGrievanceChannel,
} from '@/lib/guides';
import {
  GitBranch,
  Shield,
  FileText,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  Sparkles,
  Scale,
  Camera,
  PackageCheck,
  Send,
  HelpCircle,
  Info,
} from 'lucide-react';

interface Props {
  ctaCollectionSlug?: string;
  ctaCollectionName?: string;
}

export default function ReturnFlowchart({
  ctaCollectionSlug = 'everyday-essentials',
  ctaCollectionName = 'Browse Guaranteed Return Products',
}: Props) {
  const [activeTab, setActiveTab] = useState<'scenarios' | 'terms' | 'rights' | 'walkthrough'>('scenarios');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(RETURN_SCENARIOS[0].id);

  const selectedScenario =
    RETURN_SCENARIOS.find((s) => s.id === selectedScenarioId) || RETURN_SCENARIOS[0];

  return (
    <div className="space-y-8">
      {/* Legal & Policy Disclaimer Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-blue-500/20 text-xs text-slate-300 flex items-start gap-3">
        <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-white">
            Practical Shopping Information, Not Legal Advice
          </p>
          <p className="leading-relaxed text-slate-400 font-body">
            This guide is practical shopping information, not legal advice. Policies vary by seller, product, and location. Check the seller&apos;s return window before ordering, and keep the invoice, packaging, photos, and unboxing evidence. Review the marketplace, seller, manufacturer, and payment-provider policies. For unresolved issues, consider the official consumer grievance channels available in your jurisdiction.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        {[
          { id: 'scenarios', label: '1. Interactive Scenario Flowchart', icon: GitBranch },
          { id: 'terms', label: '2. Policy Fine-Print Decoder', icon: FileText },
          { id: 'rights', label: '3. Official Grievance Channels', icon: Scale },
          { id: 'walkthrough', label: '4. Step-by-Step Return Protocol', icon: PackageCheck },
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

      {/* VIEW 1: INTERACTIVE RETURN SCENARIOS FLOWCHART */}
      {activeTab === 'scenarios' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-blue-500/30 shadow-2xl space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-semibold">
                Interactive Branching Flowchart
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Select Your Specific Return Situation
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 font-body">
                Click any scenario below to see the legal resolution path, evidence required, and fine-print fee traps.
              </p>
            </div>

            {/* Scenario Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {RETURN_SCENARIOS.map((scen) => {
                const isSelected = selectedScenarioId === scen.id;
                return (
                  <button
                    key={scen.id}
                    type="button"
                    onClick={() => setSelectedScenarioId(scen.id)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/40'
                        : 'bg-slate-900/60 hover:bg-slate-900 border-white/5'
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block">
                        {scen.timeframe}
                      </span>
                      <h4 className="text-sm font-bold text-white font-body leading-snug">
                        {scen.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] font-mono">
                      <span className="text-slate-400">Resolution:</span>
                      <span className={isSelected ? 'text-blue-300 font-bold' : 'text-slate-300'}>
                        {scen.difficulty} Path
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Scenario Detailed Action Plan */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-white/10 space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  Target Outcome
                </span>
                <h4 className="text-lg sm:text-xl font-bold text-white">
                  {selectedScenario.bestOutcome}
                </h4>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 self-start sm:self-auto">
                Timeframe: {selectedScenario.timeframe}
              </span>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-3">
              <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                Step-by-Step Resolution Protocol:
              </h5>
              <div className="space-y-2.5">
                {selectedScenario.stepByStepAction.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-white/5 flex items-start gap-3 text-xs sm:text-sm text-slate-200"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed font-body">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Evidence & Fine Print Traps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/20 space-y-2">
                <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                  <Camera size={14} /> Required Evidence to Collect:
                </span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {selectedScenario.requiredEvidence.map((ev, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">•</span>
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-rose-500/20 space-y-2">
                <span className="text-xs font-mono text-rose-400 font-bold flex items-center gap-1.5">
                  <AlertTriangle size={14} /> The Fine-Print Restocking Trap:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-body">
                  {selectedScenario.finePrintTrap}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: POLICY FINE-PRINT DECODER */}
      {activeTab === 'terms' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {RETURN_POLICY_TERMS.map((term, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-white/10 space-y-4"
              >
                <div className="space-y-1 border-b border-white/10 pb-3">
                  <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">
                    Policy Term
                  </span>
                  <h4 className="text-base sm:text-lg font-bold text-white">
                    {term.term}
                  </h4>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                    What It Actually Means:
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-body">
                    {term.plainMeaning}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-1">
                  <span className="text-xs font-mono text-rose-400 font-semibold block">
                    Financial Impact:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {term.consumerImpact}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                  <span className="text-xs font-mono text-emerald-400 font-semibold block">
                    How to Legally Bypass It:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {term.howToBypass}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: CONSUMER GRIEVANCE CHANNELS */}
      {activeTab === 'rights' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-white/10 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-semibold">
                Official Grievance Support
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Consumer Grievance Channels & Resolution Paths
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 font-body">
                When standard customer support reaches an impasse, these structured grievance channels provide clear avenues to resolve legitimate delivery and warranty claims.
              </p>
            </div>

            <div className="space-y-4">
              {CONSUMER_GRIEVANCE_CHANNELS.map((channel, idx) => (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-white/5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Scale size={18} className="text-blue-400 shrink-0" />
                      {channel.channelName}
                    </h4>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 self-start sm:self-auto">
                      {channel.scope}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                      Resolution Mechanism:
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-body">
                      {channel.guidanceSummary}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/20 space-y-1">
                    <span className="text-xs font-mono text-emerald-400 font-semibold block">
                      Practical Application:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed font-body">
                      {channel.practicalApplication}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: STEP-BY-STEP RETURN WALKTHROUGH */}
      {activeTab === 'walkthrough' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-white/10 space-y-8">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-semibold">
                5-Stage Protocol
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Practical Return & Refund Protocol
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 font-body">
                Execute these five steps to ensure your return or replacement request is processed smoothly with complete documentation.
              </p>
            </div>

            <div className="relative border-l-2 border-blue-500/30 ml-3 sm:ml-6 pl-6 sm:pl-8 space-y-8">
              {/* Step 1 */}
              <div className="relative space-y-2">
                <span className="absolute -left-[35px] sm:-left-[43px] top-0.5 w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center ring-4 ring-slate-950">
                  1
                </span>
                <h4 className="text-base font-bold text-white">
                  Day 0: Unboxing & Evidence Documentation
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-body">
                  Take a 10-second smartphone video cutting the package open and photograph the shipping label and box serial numbers. If the product arrives damaged or wrong, unboxing evidence eliminates disputes about when the damage occurred.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative space-y-2">
                <span className="absolute -left-[35px] sm:-left-[43px] top-0.5 w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center ring-4 ring-slate-950">
                  2
                </span>
                <h4 className="text-base font-bold text-white">
                  Days 1–7: Raising the Official Return / Replacement Request
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-body">
                  Check the seller&apos;s return window before ordering and report issues immediately upon delivery. Log into your account under Orders, select the exact reason (&quot;Damaged on Delivery&quot; or &quot;Wrong Item Received&quot;), and upload your unboxing evidence.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative space-y-2">
                <span className="absolute -left-[35px] sm:-left-[43px] top-0.5 w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center ring-4 ring-slate-950">
                  3
                </span>
                <h4 className="text-base font-bold text-white">
                  Repacking: Preserve All Original Inclusions
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-body">
                  Keep the invoice, packaging, photos, and unboxing evidence. Never stick courier tape directly onto the manufacturer retail box. Place the retail box inside an outer carton with bubble wrap, including all original cables, chargers, manuals, and warranty cards.
                </p>
              </div>

              {/* Step 4 */}
              <div className="relative space-y-2">
                <span className="absolute -left-[35px] sm:-left-[43px] top-0.5 w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center ring-4 ring-slate-950">
                  4
                </span>
                <h4 className="text-base font-bold text-white">
                  Courier Handover: Obtain Verification Receipt
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-body">
                  Hand the parcel directly to the pickup courier executive only after they scan the return barcode. Ensure you receive an official pickup acknowledgment receipt, SMS confirmation, or digital airway bill scan showing the handover.
                </p>
              </div>

              {/* Step 5 */}
              <div className="relative space-y-2">
                <span className="absolute -left-[35px] sm:-left-[43px] top-0.5 w-6 h-6 rounded-full bg-emerald-600 text-white font-mono text-xs font-bold flex items-center justify-center ring-4 ring-slate-950">
                  5
                </span>
                <h4 className="text-base font-bold text-white">
                  Refund Tracking & Official Grievance Escalation
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-body">
                  Review the marketplace, seller, manufacturer, and payment-provider policies. Track the return shipment until received at the fulfillment facility. If refund settlement stalls past published timelines, file a transaction dispute with your payment provider, or escalate to the platform Grievance Officer and official consumer grievance channels.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Footer */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900/30 via-slate-900 to-indigo-900/30 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <h4 className="text-lg font-extrabold text-white">
            Shop with clear return policy expectations
          </h4>
          <p className="text-xs sm:text-sm text-slate-300">
            Review return windows and warranty terms before buying to avoid unexpected policy restrictions.
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
