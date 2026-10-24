import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllGuides, getGuideBySlug } from "@/data/guides";
import { fetchProductsAction } from "@/app/secure-admin-panel/actions";
import ProductCard from "@/components/ProductCard";
import { CompareProvider } from "@/components/CompareProvider";
import CompareArena from "@/components/CompareArena";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import { getSiteUrl } from "@/config/site";
import { getCategoryByGuideSlug } from "@/data/categories";
import type { DbProduct } from "@/utils/supabase/types";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const guides = getAllGuides();
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return {
      title: "Buying Guide Not Found",
      description: "The requested decision guide could not be found.",
      robots: {
        index: false,
        follow: false,
      },
      alternates: {
        canonical: null,
      },
    };
  }

  const title = `${guide.title} — Buying Guide`;
  const description = guide.subtitle;
  const baseUrl = getSiteUrl();
  const canonicalUrl = `${baseUrl}/guides/${guide.slug}`;
  const ogImage = `${baseUrl}/og-default.jpg`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: canonicalUrl,
      modifiedTime: guide.lastUpdated,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${guide.title} - SmartChoice Storefront Buying Guide`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function BuyingGuideDetailPage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const baseUrl = getSiteUrl();
  const canonicalUrl = `${baseUrl}/guides/${guide.slug}`;
  const parentCategory = getCategoryByGuideSlug(guide.slug);

  // Fetch researched products for this guide from catalog
  let researchedProducts: DbProduct[] = [];
  try {
    const res = await fetchProductsAction();
    if (res.success && Array.isArray(res.data)) {
      researchedProducts = (res.data as DbProduct[]).filter((p) =>
        guide.researchedProductIds.includes(p.id)
      );
    }
  } catch (err) {
    console.error("Error loading products for guide:", err);
  }

  const compareQueryIds = researchedProducts.map((p) => p.id).join(",");
  const compareUrl = compareQueryIds ? `/compare?ids=${compareQueryIds}` : "/compare";

  const breadcrumbElements: Array<{ "@type": string; position: number; name: string; item: string }> = [
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
  ];

  if (parentCategory) {
    breadcrumbElements.push({
      "@type": "ListItem",
      position: 3,
      name: parentCategory.name,
      item: `${baseUrl}/category/${parentCategory.slug}`,
    });
  }

  breadcrumbElements.push({
    "@type": "ListItem",
    position: breadcrumbElements.length + 1,
    name: guide.title,
    item: canonicalUrl,
  });

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbElements,
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.subtitle,
    url: canonicalUrl,
    image: [`${baseUrl}/og-default.jpg`],
    dateModified: guide.lastUpdated,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    author: {
      "@type": "Organization",
      name: "SmartChoice Storefront",
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "SmartChoice Storefront",
      url: baseUrl,
    },
  };

  return (
    <CompareProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <article className="container-page py-10 sm:py-16 max-w-4xl mx-auto space-y-12 sm:space-y-16">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest2 text-muted">
            <li>
              <Link href="/" className="hover:text-ink transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/guides" className="hover:text-ink transition-colors">
                Buying Guides
              </Link>
            </li>
            {parentCategory && (
              <>
                <li>/</li>
                <li>
                  <Link href={`/category/${parentCategory.slug}`} className="hover:text-ink transition-colors">
                    {parentCategory.shortName}
                  </Link>
                </li>
              </>
            )}
            <li>/</li>
            <li className="text-ink font-bold truncate max-w-[220px] sm:max-w-md">
              {guide.title}
            </li>
          </ol>
        </nav>

        {/* =====================================================================
            1. TITLE & METADATA HEADER
            ===================================================================== */}
        <header className="border-2 border-line bg-paper p-6 sm:p-10 shadow-hard space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {parentCategory ? (
              <Link
                href={`/category/${parentCategory.slug}`}
                className="border-2 border-line bg-panel px-3 py-1 font-mono text-[11px] uppercase tracking-widest2 font-bold text-ink hover:bg-paper hover:border-accent transition-colors"
                title={`Explore ${parentCategory.name} Category Hub`}
              >
                {guide.category} Hub →
              </Link>
            ) : (
              <span className="border-2 border-line bg-panel px-3 py-1 font-mono text-[11px] uppercase tracking-widest2 font-bold text-ink">
                {guide.category}
              </span>
            )}
            <span className="border border-line bg-paper px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted">
              {guide.readingTime}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted/80">
              Updated: {new Date(guide.lastUpdated).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-bold uppercase tracking-tight text-ink leading-[1.08]">
            {guide.title}
          </h1>

          <p className="font-body text-base sm:text-lg text-muted leading-relaxed">
            {guide.subtitle}
          </p>
        </header>

        {/* =====================================================================
            2. INTRODUCTION
            ===================================================================== */}
        <section aria-labelledby="intro-heading" className="border-2 border-line bg-panel p-6 sm:p-8 shadow-hard space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold block">
              Category Context
            </span>
            {parentCategory && (
              <Link
                href={`/category/${parentCategory.slug}`}
                className="font-mono text-xs uppercase tracking-wider text-muted hover:text-ink hover:underline flex items-center gap-1"
              >
                All {parentCategory.shortName} Products →
              </Link>
            )}
          </div>
          <h2 id="intro-heading" className="font-display text-2xl font-bold uppercase tracking-tight text-ink">
            Understanding the Category
          </h2>
          <p className="font-display text-lg font-bold text-ink leading-snug">
            {guide.intro.lead}
          </p>
          <div className="space-y-3 font-body text-sm sm:text-base text-ink/90 leading-relaxed pt-2">
            {guide.intro.context.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* =====================================================================
            3. WHO THIS GUIDE IS FOR
            ===================================================================== */}
        <section aria-labelledby="target-heading" className="border-2 border-line bg-paper p-6 sm:p-8 shadow-hard space-y-4">
          <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold block">
            Target Audience
          </span>
          <h2 id="target-heading" className="font-display text-2xl font-bold uppercase tracking-tight text-ink">
            Who This Guide is For
          </h2>
          <ul className="space-y-2.5 pt-1">
            {guide.whoThisIsFor.map((persona, i) => (
              <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-ink">
                <span className="font-bold text-accent shrink-0">✓</span>
                <span>{persona}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* =====================================================================
            4. WHAT MATTERS WHEN CHOOSING
            ===================================================================== */}
        <section aria-labelledby="what-matters-heading" className="border-2 border-line bg-panel p-6 sm:p-8 shadow-hard space-y-6">
          <div className="border-b-2 border-line pb-3">
            <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold block mb-1">
              Engineering Factors
            </span>
            <h2 id="what-matters-heading" className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-ink">
              What Actually Matters
            </h2>
            <p className="font-mono text-xs text-muted mt-1">
              Key technical factors that dictate actual performance and longevity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guide.whatMatters.map((item, i) => (
              <div key={i} className="border-2 border-line bg-paper p-5 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-accent block">
                    Factor 0{i + 1}
                  </span>
                  <h3 className="font-display text-lg font-bold uppercase tracking-tight text-ink">
                    {item.factor}
                  </h3>
                  <p className="font-body text-xs sm:text-sm text-muted leading-relaxed">
                    {item.explanation}
                  </p>
                </div>
                <div className="pt-3 border-t border-line/15 font-mono text-[11px] text-ink font-bold">
                  Key Takeaway: <span className="font-normal text-muted">{item.keyDetail}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================================
            5. COMMON TRADE-OFFS
            ===================================================================== */}
        <section aria-labelledby="tradeoffs-heading" className="border-2 border-line bg-paper p-6 sm:p-8 shadow-hard space-y-6">
          <div className="border-b-2 border-line pb-3">
            <span className="font-mono text-[11px] uppercase tracking-widest2 text-red-800 font-bold block mb-1">
              Compromises
            </span>
            <h2 id="tradeoffs-heading" className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-red-900">
              Common Trade-offs to Consider
            </h2>
            <p className="font-mono text-xs text-muted mt-1">
              No product is universally perfect. Every architectural decision incurs trade-offs.
            </p>
          </div>

          <div className="space-y-4">
            {guide.tradeOffs.map((tradeoff, i) => (
              <div key={i} className="border border-line/20 bg-panel p-4 space-y-1.5">
                <h3 className="font-display text-base font-bold uppercase text-ink flex items-center gap-2">
                  <span className="font-mono text-red-700 font-bold">✕</span>
                  {tradeoff.compromise}
                </h3>
                <p className="font-body text-xs sm:text-sm text-muted leading-relaxed pl-5">
                  {tradeoff.explanation}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================================
            6. COMPATIBILITY CONSIDERATIONS
            ===================================================================== */}
        <section aria-labelledby="compatibility-heading" className="border-2 border-line bg-panel p-6 sm:p-8 shadow-hard space-y-4">
          <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold block">
            Ecosystem Standards
          </span>
          <h2 id="compatibility-heading" className="font-display text-2xl font-bold uppercase tracking-tight text-ink">
            Compatibility Considerations
          </h2>
          <ul className="space-y-3 pt-1">
            {guide.compatibilityConsiderations.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-ink">
                <span className="font-bold text-accent shrink-0">🔍</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* =====================================================================
            7. PRODUCTS RESEARCHED BY SMARTCHOICE
            ===================================================================== */}
        <section aria-labelledby="researched-products-heading" className="space-y-6">
          <div className="border-b-2 border-line pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold block">
                Catalog Integration
              </span>
              <h2
                id="researched-products-heading"
                className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-ink"
              >
                Products Researched by SmartChoice
              </h2>
            </div>
            <span className="font-mono text-xs text-muted">
              {researchedProducts.length} models in this guide
            </span>
          </div>

          {researchedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {researchedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="border-2 border-line bg-paper p-8 text-center font-mono text-xs text-muted shadow-hard">
              Detailed product dossiers for this category are being updated.
            </div>
          )}
        </section>

        {/* =====================================================================
            8. COMPARISON OPPORTUNITY
            ===================================================================== */}
        {researchedProducts.length >= 2 && (
          <section aria-labelledby="compare-opportunity-heading" className="border-2 border-line bg-paper p-6 sm:p-8 shadow-hard space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-accent border border-accent/40 bg-accent/10 px-2 py-0.5">
                  Side-by-Side Analysis
                </span>
                <h3 id="compare-opportunity-heading" className="font-display text-xl sm:text-2xl font-bold uppercase text-ink">
                  Compare These Models Head-to-Head
                </h3>
                <p className="font-body text-xs sm:text-sm text-muted leading-relaxed">
                  Evaluate Anti-Regret matrix assessments, power profiles, and physical dimensions side-by-side without declared winners.
                </p>
              </div>

              <Link
                href={compareUrl}
                className="border-2 border-line bg-accent px-6 py-3.5 font-mono text-xs sm:text-sm uppercase tracking-widest2 font-bold text-ink shadow-hard-sm hover:bg-ink hover:text-paper transition-all text-center shrink-0"
              >
                Launch Head-to-Head Comparison →
              </Link>
            </div>
          </section>
        )}

        {/* =====================================================================
            9. PRACTICAL PRE-PURCHASE CHECKLIST
            ===================================================================== */}
        <section aria-labelledby="checklist-heading" className="border-2 border-line bg-panel p-6 sm:p-8 shadow-hard space-y-6">
          <div className="border-b-2 border-line pb-3">
            <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold block mb-1">
              Verification Steps
            </span>
            <h2 id="checklist-heading" className="font-display text-2xl font-bold uppercase tracking-tight text-ink">
              Practical Pre-Purchase Checklist
            </h2>
            <p className="font-mono text-xs text-muted mt-1">
              Verify these items before finalizing your purchase on the retailer&apos;s site.
            </p>
          </div>

          <div className="space-y-2.5">
            {guide.checklist.map((item, i) => (
              <label
                key={i}
                className="flex items-start gap-3 border border-line/20 bg-paper p-3.5 cursor-pointer hover:border-line transition-colors"
              >
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded-none border-2 border-line text-accent focus:ring-0 focus:outline-none shrink-0"
                />
                <span className="font-body text-xs sm:text-sm text-ink leading-relaxed">
                  {item}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* =====================================================================
            10. LEGITIMATE FAQS
            ===================================================================== */}
        <section aria-labelledby="faq-heading" className="border-2 border-line bg-paper p-6 sm:p-8 shadow-hard space-y-6">
          <div className="border-b-2 border-line pb-3">
            <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold block mb-1">
              Common Questions
            </span>
            <h2 id="faq-heading" className="font-display text-2xl font-bold uppercase tracking-tight text-ink">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {guide.faqs.map((faq, i) => (
              <div key={i} className="border border-line/20 bg-panel p-5 space-y-2">
                <h3 className="font-display text-base sm:text-lg font-bold uppercase text-ink">
                  {faq.question}
                </h3>
                <p className="font-body text-xs sm:text-sm text-muted leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================================
            11. AFFILIATE DISCLOSURE & DISCLAIMER
            ===================================================================== */}
        <AffiliateDisclosure />
      </article>
      <CompareArena />
    </CompareProvider>
  );
}
