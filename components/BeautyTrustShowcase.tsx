interface BeautyTrustShowcaseProps {
  onSwitchToAll?: () => void;
  productCount?: number;
}

export default function BeautyTrustShowcase({
  onSwitchToAll,
  productCount = 0,
}: BeautyTrustShowcaseProps) {
  return (
    <div className="mb-10 space-y-6">
      {/* Main Guarantee Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-pink-500/30 bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900 p-6 sm:p-8 shadow-2xl backdrop-blur">
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative z-10">
          {/* Top Trust Badge Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/40 bg-pink-500/10 px-3.5 py-1 text-xs font-mono font-bold tracking-wide text-pink-300 mb-4 shadow-sm">
            <span>🛡️</span>
            <span>VERIFIED AUTHENTIC SUPPLY CHAIN • ZERO COUNTERFEIT RISK</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-snug mb-3">
            100% Legit Links Only — <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 via-rose-200 to-amber-200">Zero Adulterated or Counterfeit Stock</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl mb-8">
            Why buy beauty, grooming, and skincare through SmartChoice? We eliminate the biggest hidden risk on mega-marketplaces: silent seller hijacking and counterfeit formula substitution.
          </p>

          {/* 3 Core Trust Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="rounded-xl border border-white/10 bg-slate-900/80 p-5 shadow-lg transition-transform hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-xl mb-3 text-rose-300 shadow-sm">
                🛡️
              </div>
              <h3 className="text-base font-bold text-white mb-2 tracking-tight">
                Out-of-Stock Seller Protection
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                When official brand stores run out of inventory on large marketplaces, product listings often <strong>silently auto-route checkout</strong> to unauthorized third-party resellers carrying diluted, expired, or counterfeit formulas. SmartChoice actively curates and verifies retailer links strictly for genuine, brand-authorized stock.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-xl border border-white/10 bg-slate-900/80 p-5 shadow-lg transition-transform hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-xl mb-3 text-pink-300 shadow-sm">
                ✨
              </div>
              <h3 className="text-base font-bold text-white mb-2 tracking-tight">
                For Every Routine (Men &amp; Women)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Skincare essentials, clarifying bath bars, gentle haircare, beard care, grooming tools, and signature fragrances. Every pick is vetted through our objective Anti-Regret framework—analyzing true surfactant bases, active ingredient integrity, verified strengths, and real trade-offs with zero hype.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-xl border border-white/10 bg-slate-900/80 p-5 shadow-lg transition-transform hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-xl mb-3 text-purple-300 shadow-sm">
                🔄
              </div>
              <h3 className="text-base font-bold text-white mb-2 tracking-tight">
                Your Monthly Restock &amp; Upgrade Hub
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Stop wasting valuable time sifting through hundreds of risky, sponsored marketplace search results. <em>Bookmark SmartChoice</em>: whenever you need your monthly routine refill or a wardrobe upgrade, just visit, choose your essential, and buy the verified original every time.
              </p>
            </div>
          </div>

          {/* Guarantee Footer Strip */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-pink-300 font-semibold">
              <span className="text-green-400">✓</span> Verified Authorized Sellers Only
            </span>
            <span className="flex items-center gap-1.5 text-purple-300 font-semibold">
              <span className="text-green-400">✓</span> No Paid Brand Placements
            </span>
            <span className="flex items-center gap-1.5 text-blue-300 font-semibold">
              <span className="text-green-400">✓</span> Zero Fabricated 5-Star Reviews
            </span>
          </div>
        </div>
      </div>

      {/* Empty State Card if no products currently match */}
      {productCount === 0 && (
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-8 text-center backdrop-blur">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-xl font-bold text-white mb-2">
            New Verified Beauty &amp; Fashion Picks Dropping Soon
          </h3>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed mb-6 font-body">
            Our editorial desk is currently auditing ingredient transparency, patch-test histories, and authorized distribution channels for upcoming skincare, bath, and grooming additions.
          </p>
          {onSwitchToAll && (
            <button
              type="button"
              onClick={onSwitchToAll}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono text-xs uppercase tracking-wider font-bold rounded-lg transition-all shadow-md"
            >
              ← Browse All Verified Picks
            </button>
          )}
        </div>
      )}
    </div>
  );
}

