import type { Metadata } from "next";
import Link from "next/link";
import { getAllCategories } from "@/data/categories";
import { getSiteUrl } from "@/config/site";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";

export function generateMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  const title = "Product Categories & Decision Frameworks";
  const description =
    "Explore independent product research, technical standards, Anti-Regret matrix breakdowns, and decision-support catalogs across curated gear categories.";

  const ogImage = `${siteUrl}/og-default.jpg`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/category`,
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "Paisavasooldaily - Product Categories & Decision Frameworks",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImage],
    },
    alternates: {
      canonical: `${siteUrl}/category`,
    },
  };
}

export default function CategoriesDirectoryPage() {
  const categories = getAllCategories();
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
        name: "Categories",
        item: `${baseUrl}/category`,
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
            <li className="text-ink font-bold">Categories</li>
          </ol>
        </nav>

        {/* Directory Header */}
        <header className="border-2 border-line bg-paper p-8 sm:p-12 shadow-hard space-y-4">
          <div className="inline-flex items-center gap-2 border-2 border-line bg-panel px-3 py-1 font-mono text-[11px] uppercase tracking-widest2 font-bold text-ink">
            <span className="h-2 w-2 bg-accent inline-block" />
            Decision-Support Architecture
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-bold uppercase tracking-tight text-ink leading-tight">
            Research Categories: <br className="hidden sm:inline" />
            What to Evaluate Before You Buy
          </h1>

          <p className="font-body text-sm sm:text-base text-muted max-w-2xl leading-relaxed">
            Paisavasooldaily organizes product research into focused categories. Each category synthesizes published manufacturer specifications, common buyer trade-offs, and curated catalogs to help you evaluate options.
          </p>
        </header>

        {/* Categories Grid */}
        <section aria-labelledby="categories-list-heading" className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-line pb-3">
            <h2
              id="categories-list-heading"
              className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-ink"
            >
              Curated Research Categories ({categories.length})
            </h2>
            <span className="font-mono text-xs text-muted">
              Based on published manufacturer specifications
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <article
                key={cat.slug}
                className="border-2 border-line bg-paper p-6 sm:p-8 shadow-hard flex flex-col justify-between space-y-6 group hover:-translate-y-1 hover:shadow-hard-lg transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="border border-line bg-panel px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider font-bold text-ink">
                      {cat.shortName}
                    </span>
                    <span className="font-mono text-[11px] text-muted">
                      {cat.featuredProductIds.length} Models Researched
                    </span>
                  </div>

                  <h3 className="font-display text-2xl font-bold leading-snug text-ink group-hover:text-accent transition-colors">
                    <Link href={`/category/${cat.slug}`}>{cat.name}</Link>
                  </h3>

                  <p className="font-body text-xs sm:text-sm text-muted leading-relaxed">
                    {cat.tagline}
                  </p>

                  <div className="pt-2 border-t border-line/10 space-y-1 text-[11px] font-mono text-muted">
                    <span className="font-bold text-ink block">Key Considerations:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-muted/80">
                      {cat.whatMatters.slice(0, 2).map((m, i) => (
                        <li key={i} className="line-clamp-1">
                          {m.factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-line">
                  <Link
                    href={`/category/${cat.slug}`}
                    className="inline-flex w-full items-center justify-center gap-2 border-2 border-line bg-accent px-5 py-3 font-mono text-xs uppercase tracking-widest2 font-bold text-ink shadow-hard-sm group-hover:bg-ink group-hover:text-paper transition-all"
                  >
                    <span>Explore Category Hub</span>
                    <span aria-hidden="true">→</span>
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
