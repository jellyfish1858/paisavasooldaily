import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: null,
  },
};

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-start gap-5 py-24 max-w-4xl mx-auto">
      <span className="border-2 border-line bg-panel px-3 py-1 font-mono text-[11px] uppercase tracking-widest2 font-bold text-accent">
        404 — Not Found
      </span>
      <h1 className="font-display text-3xl sm:text-5xl font-bold uppercase tracking-tight text-ink leading-tight">
        Page Not Found
      </h1>
      <p className="max-w-lg text-sm sm:text-base leading-relaxed text-muted">
        The page you are looking for does not exist, has been moved, or the link is out of date.
      </p>
      <Link
        href="/"
        className="border-2 border-line bg-accent px-6 py-3.5 font-mono text-xs uppercase tracking-widest2 font-bold text-ink shadow-hard-sm hover:bg-ink hover:text-paper transition-all"
      >
        ← Return to Storefront
      </Link>
    </div>
  );
}
