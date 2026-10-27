'use client';

import { useState } from 'react';
import Link from 'next/link';
import { REVIEW_EVALUATION_QUESTIONS, QuizQuestion, QuizOption } from '@/lib/guides';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Award, Lightbulb, ShieldAlert } from 'lucide-react';

interface Props {
  ctaCollectionSlug?: string;
  ctaCollectionName?: string;
}

export default function QuizCard({
  ctaCollectionSlug = 'best-value',
  ctaCollectionName = 'Browse Authentically Rated Picks',
}: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ [qId: number]: { selectedIdx: number; isCorrect: boolean } }>({});
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = REVIEW_EVALUATION_QUESTIONS[currentIdx];
  const hasAnsweredCurrent = selectedOptionIdx !== null;

  const handleSelectOption = (optIdx: number) => {
    if (hasAnsweredCurrent) return; // Prevent changing after revealing
    setSelectedOptionIdx(optIdx);

    const isCorrect = currentQ.options[optIdx].isCorrect;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: { selectedIdx: optIdx, isCorrect },
    }));
  };

  const handleNext = () => {
    if (currentIdx < REVIEW_EVALUATION_QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOptionIdx(null);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOptionIdx(null);
    setAnswers({});
    setIsFinished(false);
  };

  const score = Object.values(answers).filter((a) => a.isCorrect).length;
  const total = REVIEW_EVALUATION_QUESTIONS.length;

  // End of Quiz View
  if (isFinished) {
    let resultBadge = 'Review Detective';
    let resultTitle = 'Sharp Consumer Instincts!';
    let resultDesc =
      'You spotted most deceptive review patterns with high accuracy. You know how to filter out velocity surges and focus on balanced 3-star and 4-star consensus.';
    let badgeColor = 'text-blue-300 border-blue-400/30 bg-blue-500/10';

    if (score === total) {
      resultBadge = 'Master Review Sleuth (Perfect Score)';
      resultTitle = 'Immune to Review Manipulation!';
      resultDesc =
        'Flawless evaluation. You understand review velocity surges, reciprocity bias, ASIN recycling, and verified purchase limitations like a seasoned investigator.';
      badgeColor = 'text-emerald-300 border-emerald-400/30 bg-emerald-500/10';
    } else if (score <= 2) {
      resultBadge = 'Vulnerable to Manipulation';
      resultTitle = 'Review Traps Detected!';
      resultDesc =
        'Marketplaces actively use artificial review surges and free-gift disclosures to build false trust. Review the takeaways below before making your next purchase.';
      badgeColor = 'text-amber-300 border-amber-400/30 bg-amber-500/10';
    }

    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8 animate-reveal-up">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider border">
            <span className={badgeColor}>{resultBadge}</span>
          </div>

          <div className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight">
            {score} / {total}
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold text-white">
            {resultTitle}
          </h3>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-body">
            {resultDesc}
          </p>
        </div>

        {/* Detailed Question Review Breakdown */}
        <div className="space-y-4 border-t border-white/10 pt-6">
          <h4 className="text-sm font-mono uppercase tracking-widest text-slate-400 font-bold mb-4">
            Question Breakdown
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {REVIEW_EVALUATION_QUESTIONS.map((q, idx) => {
              const record = answers[q.id];
              const isPassed = record?.isCorrect;
              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border flex items-start gap-3.5 text-xs ${
                    isPassed
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                      : 'bg-red-950/20 border-red-500/30 text-red-200'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isPassed ? (
                      <CheckCircle2 size={18} className="text-emerald-400" />
                    ) : (
                      <XCircle size={18} className="text-red-400" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-white">
                      Scenario {idx + 1}: {q.question}
                    </p>
                    <p className="text-slate-300">
                      {q.options.find((o) => o.isCorrect)?.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls & Collection Link */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={handleRestart}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
          >
            <RotateCcw size={15} />
            Retake Quiz
          </button>

          <Link
            href={`/collections/${ctaCollectionSlug}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-mono text-xs uppercase tracking-widest font-bold transition-all transform hover:scale-105 shadow-lg shadow-blue-600/30"
          >
            {ctaCollectionName} →
          </Link>
        </div>
      </div>
    );
  }

  // Active Quiz View
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-6">
      {/* Progress & Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-blue-400 font-bold uppercase tracking-wider">
            Step {currentIdx + 1} of {total}
          </span>
          <span className="text-slate-400">
            Score: {score} of {total}
          </span>
        </div>

        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-500 h-full transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Real-World Scenario Box */}
      <div className="p-5 rounded-xl bg-slate-950/70 border border-white/10 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
          <Lightbulb size={14} />
          Real-World Marketplace Scenario
        </div>
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-body">
          {currentQ.scenario}
        </p>
      </div>

      {/* Main Question */}
      <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
        {currentQ.question}
      </h3>

      {/* Interactive Options */}
      <div className="space-y-3">
        {currentQ.options.map((opt, oIdx) => {
          const isSelected = selectedOptionIdx === oIdx;
          let btnStyle =
            'bg-slate-950/50 border-white/10 hover:border-blue-400/50 hover:bg-slate-800/80 text-slate-200';

          if (hasAnsweredCurrent) {
            if (opt.isCorrect) {
              btnStyle = 'bg-emerald-950/40 border-emerald-500 text-white shadow-md shadow-emerald-500/20';
            } else if (isSelected && !opt.isCorrect) {
              btnStyle = 'bg-red-950/40 border-red-500 text-white shadow-md shadow-red-500/20';
            } else {
              btnStyle = 'opacity-40 border-white/5 bg-slate-950 text-slate-500';
            }
          }

          return (
            <button
              key={oIdx}
              type="button"
              disabled={hasAnsweredCurrent}
              onClick={() => handleSelectOption(oIdx)}
              className={`w-full p-4 sm:p-5 rounded-xl border text-left transition-all flex items-start gap-3.5 cursor-pointer text-sm font-medium ${btnStyle}`}
            >
              <div className="mt-0.5 shrink-0">
                {hasAnsweredCurrent && opt.isCorrect ? (
                  <CheckCircle2 size={18} className="text-emerald-400" />
                ) : hasAnsweredCurrent && isSelected && !opt.isCorrect ? (
                  <XCircle size={18} className="text-red-400" />
                ) : (
                  <span className="h-5 w-5 rounded-full border border-white/20 flex items-center justify-center text-[11px] font-mono font-bold text-slate-400">
                    {String.fromCharCode(65 + oIdx)}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <span>{opt.text}</span>
                {hasAnsweredCurrent && isSelected && (
                  <p className={`text-xs mt-2 pt-2 border-t border-white/10 ${opt.isCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
                    {opt.explanation}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Context Tip & Next Button */}
      {hasAnsweredCurrent && (
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 animate-reveal-up">
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <span className="text-blue-400 font-bold font-mono uppercase">Pro Tip:</span>
            {currentQ.contextTip}
          </p>

          <button
            type="button"
            onClick={handleNext}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs uppercase tracking-wider font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer"
          >
            {currentIdx < total - 1 ? 'Next Scenario' : 'View Final Results'}
            <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
