import { isYouTubeUrl, isInstagramUrl, getYouTubeEmbedUrl } from "@/lib/validation";

interface ProductMediaProps {
  mediaUrl: string;
  productTitle: string;
}

export default function ProductMedia({ mediaUrl, productTitle }: ProductMediaProps) {
  if (!mediaUrl || !mediaUrl.trim()) return null;

  const trimmedUrl = mediaUrl.trim();
  const isYt = isYouTubeUrl(trimmedUrl);
  const isIg = isInstagramUrl(trimmedUrl);
  const ytEmbed = isYt ? getYouTubeEmbedUrl(trimmedUrl) : null;

  // 1. YouTube Video Embed + Link
  if (isYt) {
    return (
      <div className="mt-4 rounded-2xl overflow-hidden border border-white/10 bg-slate-900/90 p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider text-slate-300 font-bold">
              Video Overview &amp; Demo
            </span>
          </div>
          <a
            href={trimmedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 font-mono inline-flex items-center gap-1 transition-colors"
          >
            Watch on YouTube ↗
          </a>
        </div>
        {ytEmbed ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-black">
            <iframe
              src={ytEmbed}
              title={`${productTitle} Video Review & Demo`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <a
            href={trimmedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-red-600/20 border border-red-500/40 text-red-300 hover:bg-red-600/30 font-mono text-xs font-bold uppercase tracking-wider transition-colors"
          >
            ▶ Watch Video Review on YouTube ↗
          </a>
        )}
      </div>
    );
  }

  // 2. Instagram Reel / Post Social Proof Card
  if (isIg) {
    return (
      <div className="mt-4 rounded-2xl border border-pink-500/20 bg-gradient-to-br from-slate-900 via-purple-950/20 to-slate-900 p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-pink-300 font-bold block">
                Product Showcase
              </span>
              <span className="text-[11px] text-slate-400">
                Real-world product demonstration &amp; breakdown
              </span>
            </div>
          </div>
          <span className="bg-pink-500/10 border border-pink-500/30 text-pink-300 font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
            Instagram
          </span>
        </div>
        <a
          href={trimmedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 px-4 py-3 font-mono text-xs uppercase tracking-wider font-bold text-white shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          <span>Watch Product Reel / Video ↗</span>
        </a>
      </div>
    );
  }

  // 3. Fallback for other video/social proof links
  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/90 p-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="font-mono text-xs uppercase tracking-wider text-slate-300 font-bold">
            Media Overview
          </span>
        </div>
        <a
          href={trimmedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:text-blue-300 font-mono inline-flex items-center gap-1 transition-colors"
        >
          Watch Video Overview ↗
        </a>
      </div>
    </div>
  );
}

