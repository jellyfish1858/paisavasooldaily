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
      {/* Main Showcase Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-pink-500/30 bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900 p-6 sm:p-8 shadow-2xl backdrop-blur">
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative z-10">
          {/* Top Trust Badge Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/40 bg-pink-500/10 px-3.5 py-1 text-xs font-mono font-bold tracking-wide text-pink-300 shadow-sm">
              <span>🛡️</span>
              <span>POPULAR PRODUCTS • REVIEW-BASED TRADE-OFFS</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3.5 py-1 text-xs font-mono font-bold tracking-wide text-amber-300 shadow-sm">
              <span>⭐</span>
              <span>MOST-USED DAILY LIFESTYLE PICKS</span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-snug mb-3">
            Direct Marketplace Links — <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 via-rose-200 to-amber-200">Review-Based Picks With Clear Trade-Offs</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl mb-8">
            Curated from what most women and men actually use in their daily beauty &amp; fashion lifestyle. We research customer reviews and specifications to highlight customer feedback and real-world trade-offs.
          </p>

          {/* 4 Core Trust & Social-Proof Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Pillar 1: Most-Used Daily Lifestyle Favorites */}
            <div className="rounded-xl border border-amber-500/20 bg-slate-900/80 p-5 shadow-lg transition-transform hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl mb-3 text-amber-300 shadow-sm">
                💎
              </div>
              <h3 className="text-base font-bold text-white mb-2 tracking-tight">
                Most-Used Daily Lifestyle Favorites (Females &amp; Males)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                We don&apos;t list random or obscure experiments. Our recommendations are strictly the proven, high-demand beauty, skincare, grooming, and fashion staples that most women and men genuinely use every single day in their lifestyle.
              </p>
            </div>

            {/* Pillar 2: Marketplace Seller Awareness */}
            <div className="rounded-xl border border-white/10 bg-slate-900/80 p-5 shadow-lg transition-transform hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-xl mb-3 text-rose-300 shadow-sm">
                🛡️
              </div>
              <h3 className="text-base font-bold text-white mb-2 tracking-tight">
                Marketplace Seller Awareness
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                When official brand stores run low on stock on large marketplaces, listings may change sellers. Paisavasooldaily links to established marketplace listings and recommends checking seller ratings and return policies before completing checkout.
              </p>
            </div>

            {/* Pillar 3: For Every Routine */}
            <div className="rounded-xl border border-white/10 bg-slate-900/80 p-5 shadow-lg transition-transform hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-xl mb-3 text-pink-300 shadow-sm">
                ✨
              </div>
              <h3 className="text-base font-bold text-white mb-2 tracking-tight">
                For Every Routine (Men &amp; Women)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Skincare essentials, clarifying bath bars, gentle haircare, beard care, grooming tools, and signature fragrances. Every pick is researched through our Anti-Regret framework—analyzing customer feedback, ingredient lists, key strengths, and real trade-offs with zero hype.
              </p>
            </div>

            {/* Pillar 4: Your Monthly Restock Hub */}
            <div className="rounded-xl border border-white/10 bg-slate-900/80 p-5 shadow-lg transition-transform hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-xl mb-3 text-purple-300 shadow-sm">
                🔄
              </div>
              <h3 className="text-base font-bold text-white mb-2 tracking-tight">
                Your Monthly Restock &amp; Upgrade Hub
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Stop wasting valuable time sifting through hundreds of unvetted marketplace search results. <em>Bookmark Paisavasooldaily</em>: whenever you need your routine refill or a wardrobe update, explore our product breakdowns and compare specs before buying.
              </p>
            </div>
          </div>

          {/* Feature Highlights Footer Strip */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <span className="text-green-400">✓</span> Real Daily Lifestyle Essentials
            </span>
            <span className="flex items-center gap-1.5 text-pink-300 font-semibold">
              <span className="text-green-400">✓</span> Direct Retailer Links
            </span>
            <span className="flex items-center gap-1.5 text-purple-300 font-semibold">
              <span className="text-green-400">✓</span> No Paid Brand Placements
            </span>
            <span className="flex items-center gap-1.5 text-blue-300 font-semibold">
              <span className="text-green-400">✓</span> Clear Customer Feedback
            </span>
          </div>
        </div>
      </div>

      {/* Empty State Card if no products currently match */}
      {productCount === 0 && (
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-8 text-center backdrop-blur">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-xl font-bold text-white mb-2">
            New Beauty &amp; Fashion Picks Dropping Soon
          </h3>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed mb-6 font-body">
            Our editorial desk is currently researching user feedback, ingredient profiles, and retailer availability for upcoming skincare, bath, and grooming additions.
          </p>
          {onSwitchToAll && (
            <button
              type="button"
              onClick={onSwitchToAll}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono text-xs uppercase tracking-wider font-bold rounded-lg transition-all shadow-md cursor-pointer"
            >
              ← Browse All Picks
            </button>
          )}
        </div>
      )}
    </div>
  );
}
