import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from "@/lib/social";

export default function InstagramFollowCard() {
  return (
    <div className="mt-4">
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer me"
        aria-label="Follow SmartChoice on Instagram (opens in a new tab)"
        className="group inline-flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2.5 w-fit max-w-full transition-all duration-200 hover:border-pink-500/50 hover:bg-slate-800/80 hover:shadow-[0_0_20px_rgba(236,72,153,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/60"
      >
        {/* Left: 36x36 rounded-lg tile with Instagram brand gradient */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-white shadow-sm">
          <svg
            className="h-5 w-5 fill-current"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </div>

        {/* Middle text block */}
        <div className="flex flex-col text-left">
          <span className="text-sm font-semibold text-white leading-tight">
            Follow us on Instagram
          </span>
          <span className="text-xs text-slate-400 leading-tight">
            {INSTAGRAM_HANDLE}
          </span>
        </div>

        {/* Right: small arrow */}
        <span
          aria-hidden="true"
          className="text-slate-400 group-hover:text-pink-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-sm ml-auto pl-1"
        >
          ↗
        </span>
      </a>

      {/* Caption */}
      <p className="mt-2 text-xs text-slate-500">
        Support us for daily verified picks &amp; genuine-product alerts.
      </p>
    </div>
  );
}

