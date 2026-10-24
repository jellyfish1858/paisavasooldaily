import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="container-page flex flex-col items-start gap-5 py-24">
      <span className="border-2 border-line px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest2">
        404
      </span>
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
        That product doesn&apos;t exist
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-muted">
        The listing you&apos;re looking for may have been removed or the link is
        out of date.
      </p>
      <Link
        href="/"
        className="border-2 border-line bg-ink px-5 py-3 font-mono text-xs uppercase tracking-widest2 text-paper transition-colors hover:bg-accent hover:text-ink"
      >
        ← Back to all products
      </Link>
    </div>
  );
}
