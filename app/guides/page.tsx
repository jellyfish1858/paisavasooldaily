import type { Metadata } from "next";
import Link from "next/link";
import { getAllGuides } from "@/data/guides";
import { getSiteUrl } from "@/config/site";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";

export function generateMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  const ogImage = `${siteUrl}/og-default.jpg`;
  return {
    title: "Product Buying Guides & Decision Frameworks",
    description:
      "Independent editorial buying guides, technical standard breakdowns, and trade-off analysis to help you make informed purchasing decisions.",
    openGraph: {
      title: "Product Buying Guides & Decision Frameworks",
      description:
        "Independent editorial buying guides, technical standard breakdowns, and trade-off analysis before purchasing.",
      url: `${siteUrl}/guides`,
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "SmartChoice Storefront - Product Buying Guides & Decision Frameworks",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Product Buying Guides & Decision Frameworks",
      description:
        "Independent editorial buying guides, technical standard breakdowns, and trade-off analysis before purchasing.",
      images: [ogImage],
    },
    alternates: {
      canonical: `${siteUrl}/guides`,
    },
  };
}

export default function BuyingGuidesDirectoryPage() {
  const guides = getAllGuides();
  const baseUrl = getSiteUrl();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Buying Guides",
        item: `${baseUrl}/guides`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="container-page py-10 sm:py-16 max-w-5xl mx-auto space-y-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest2 text-muted">
            <li>
              <Link href="/" className="hover:text-ink transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="text-ink font-bold">Buying Guides</li>
          </ol>
        </nav>

        {/* Directory Header */}
        <header className="border-2 border-line bg-paper p-8 sm:p-12 shadow-hard space-y-4">
          <div className="inline-flex items-center gap-2 border-2 border-line bg-panel px-3 py-1 font-mono text-[11px] uppercase tracking-widest2 font-bold text-ink">
            <span className="h-2 w-2 bg-accent inline-block" />
            Decision-Support Library
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-bold uppercase tracking-tight text-ink leading-tight">
            Research Guides: <br className="hidden sm:inline" />
            What Actually Matters Before You Buy
          </h1>

          <p className="font-body text-sm sm:text-base text-muted max-w-2xl leading-relaxed">
            Independent editorial decision frameworks, technical standard breakdowns, and practical pre-purchase checklists. We explain the engineering trade-offs so you can choose the right gear without the marketing fluff.
          </p>
        </header>

        {/* Guides Grid */}
        <section aria-labelledby="guides-list-heading" className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-line pb-3">
            <h2
              id="guides-list-heading"
              className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-ink"
            >
              Published Guides ({guides.length})
            </h2>
            <span className="font-mono text-xs text-muted">
              Grounded in published technical specifications
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {guides.map((guide) => (
              <article
                key={guide.slug}
                className="border-2 border-line bg-paper p-6 sm:p-8 shadow-hard flex flex-col justify-between space-y-6 group hover:-translate-y-1 hover:shadow-hard-lg transition-all"
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="border border-line bg-panel px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider font-bold text-ink">
                      {guide.category}
                    </span>
                    <span className="font-mono text-[11px] text-muted">
                      {guide.readingTime}
                    </span>
                  </div>

                  <h3 className="font-display text-2xl font-bold leading-snug text-ink group-hover:text-accent transition-colors">
                    <Link href={`/guides/${guide.slug}`}>{guide.title}</Link>
                  </h3>

                  <p className="font-body text-xs sm:text-sm text-muted leading-relaxed">
                    {guide.subtitle}
                  </p>

                  <div className="pt-2 border-t border-line/10 flex flex-wrap gap-2 text-[11px] font-mono text-muted">
                    <span>Updated: {new Date(guide.lastUpdated).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                    <span>•</span>
                    <span>{guide.whatMatters.length} Key Evaluation Factors</span>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-line">
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="inline-flex w-full items-center justify-center gap-2 border-2 border-line bg-accent px-5 py-3 font-mono text-xs uppercase tracking-widest2 font-bold text-ink shadow-hard-sm group-hover:bg-ink group-hover:text-paper transition-all"
                  >
                    <span>Read Decision Guide</span>
                    <span aria-hidden="true">→</span >
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Affiliate Disclosure */}
        <AffiliateDisclosure />
      </div>
    </>
  );
}
