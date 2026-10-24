import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllCategories, getCategoryBySlug, getCategoryForProduct } from "@/data/categories";
import { getGuideBySlug } from "@/data/guides";
import { fetchProductsAction } from "@/app/secure-admin-panel/actions";
import ProductCard from "@/components/ProductCard";
import { CompareProvider } from "@/components/CompareProvider";
import CompareArena from "@/components/CompareArena";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import { getSiteUrl } from "@/config/site";
import type { DbProduct } from "@/utils/supabase/types";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found",
      description: "The requested product category could not be found.",
      robots: {
        index: false,
        follow: false,
      },
      alternates: {
        canonical: null,
      },
    };
  }

  const siteUrl = getSiteUrl();
  const title = `${category.name} — Research, Trade-offs & Buying Guides`;
  const description = category.description;
  const canonicalUrl = `${siteUrl}/category/${category.slug}`;
  const ogImage = `${siteUrl}/og-default.jpg`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: canonicalUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${category.name} - Research, Trade-offs & Buying Guides`,
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

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const baseUrl = getSiteUrl();
  const canonicalUrl = `${baseUrl}/category/${category.slug}`;

  // Fetch catalog products and filter for this category
  let categoryProducts: DbProduct[] = [];
  try {
    const res = await fetchProductsAction();
    if (res.success && Array.isArray(res.data)) {
      categoryProducts = (res.data as DbProduct[]).filter((p) =>
        p.category === category.name ||
        category.featuredProductIds.includes(p.id) ||
        getCategoryForProduct(p.category, p.id)?.slug === category.slug
      );
    }
  } catch (err) {
    console.error("Error loading products for category:", err);
  }

  // Resolve linked buying guides
  const linkedGuides = category.guideSlugs
    .map((gSlug) => getGuideBySlug(gSlug))
    .filter(Boolean);

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
      {
        "@type": "ListItem",
        position: 3,
        name: category.name,
        item: canonicalUrl,
      },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category.name} Researched Products`,
    itemListElement: categoryProducts.map((p, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: p.title,
      url: `${baseUrl}/product/${p.slug || p.id}`,
    })),
  };

  return (
    <CompareProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <article className="container-page py-10 sm:py-16 max-w-5xl mx-auto space-y-12 sm:space-y-16">
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
              <Link href="/category" className="hover:text-ink transition-colors">
                Categories
              </Link>
            </li>
            <li>/</li>
            <li className="text-ink font-bold">{category.shortName}</li>
          </ol>
        </nav>

        {/* =====================================================================
            1. CATEGORY HEADER
            ===================================================================== */}
        <header className="border-2 border-line bg-paper p-8 sm:p-12 shadow-hard space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="border-2 border-line bg-panel px-3 py-1 font-mono text-[11px] uppercase tracking-widest2 font-bold text-ink">
              Category Decision Hub
            </span>
            <span className="font-mono text-xs text-muted">
              {categoryProducts.length} Models Researched
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-bold uppercase tracking-tight text-ink leading-tight">
            {category.name}
          </h1>

          <p className="font-mono text-xs sm:text-sm text-accent font-bold uppercase tracking-wider">
            {category.tagline}
          </p>

          <p className="font-body text-sm sm:text-base text-muted max-w-3xl leading-relaxed">
            {category.description}
          </p>
        </header>

        {/* =====================================================================
            1B. SUBCATEGORY ECOSYSTEMS
            ===================================================================== */}
        {category.subcategories && category.subcategories.length > 0 && (
          <section aria-labelledby="subcategories-heading" className="border-2 border-line bg-paper p-6 sm:p-8 shadow-hard space-y-4">
            <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold block mb-1">
              Category Sub-Ecosystems
            </span>
            <h2 id="subcategories-heading" className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-ink">
              Exploration Areas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {category.subcategories.map((sub) => (
                <div
                  key={sub.slug}
                  className="border border-line/30 bg-panel p-3.5 space-y-1"
                >
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink block">
                    {sub.name}
                  </span>
                  <span className="text-[11px] text-muted block font-body leading-relaxed">
                    {sub.description}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* =====================================================================
            2. CATEGORY INTRODUCTION
            ===================================================================== */}
        <section aria-labelledby="category-intro-heading" className="border-2 border-line bg-panel p-6 sm:p-8 shadow-hard space-y-4">
          <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold block mb-1">
            Category Context
          </span>
          <h2 id="category-intro-heading" className="font-display text-2xl font-bold uppercase tracking-tight text-ink">
            What the Market Looks Like
          </h2>
          <p className="font-body text-base font-semibold text-ink leading-relaxed">
            {category.intro.lead}
          </p>
          <div className="space-y-3 font-body text-sm text-muted leading-relaxed">
            {category.intro.details.map((detail, idx) => (
              <p key={idx}>{detail}</p>
            ))}
          </div>
        </section>

        {/* =====================================================================
            3. WHAT MATTERS WHEN CHOOSING
            ===================================================================== */}
        <section aria-labelledby="factors-heading" className="space-y-6">
          <div className="border-b-2 border-line pb-3">
            <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold block mb-1">
              Key Buying Factors
            </span>
            <h2 id="factors-heading" className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-ink">
              What to Consider When Choosing
            </h2>
            <p className="font-mono text-xs text-muted mt-1">
              Important technical considerations when comparing options based on published specifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {category.whatMatters.map((item, idx) => (
              <div
                key={idx}
                className="border-2 border-line bg-paper p-6 shadow-hard space-y-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-accent bg-accent/10 border border-accent/30 px-2 py-0.5">
                    Factor {idx + 1}
                  </span>
                  <h3 className="font-display text-lg font-bold uppercase text-ink">
                    {item.factor}
                  </h3>
                </div>
                <p className="font-body text-xs sm:text-sm text-muted leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================================
            4. ANTI-REGRET CONSIDERATIONS (WATCH-OUTS)
            ===================================================================== */}
        <section aria-labelledby="anti-regret-heading" className="border-2 border-line bg-paper p-6 sm:p-8 shadow-hard space-y-6">
          <div className="border-b-2 border-line pb-3">
            <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold block mb-1">
              Decision Considerations
            </span>
            <h2 id="anti-regret-heading" className="font-display text-2xl font-bold uppercase tracking-tight text-ink">
              Anti-Regret Considerations
            </h2>
            <p className="font-mono text-xs text-muted mt-1">
              Practical factors to review before committing to a purchase.
            </p>
          </div>

          <ul className="space-y-3 font-body text-xs sm:text-sm text-ink leading-relaxed">
            {category.antiRegretConsiderations.map((note, idx) => (
              <li key={idx} className="flex items-start gap-3 border border-line/20 bg-panel p-4">
                <span className="font-mono text-accent font-bold shrink-0 text-base leading-none">!</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* =====================================================================
            5. RELEVANT BUYING GUIDES
            ===================================================================== */}
        {linkedGuides.length > 0 && (
          <section aria-labelledby="guides-heading" className="space-y-6">
            <div className="border-b-2 border-line pb-3">
              <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold block mb-1">
                Deep-Dive Research
              </span>
              <h2 id="guides-heading" className="font-display text-2xl font-bold uppercase tracking-tight text-ink">
                Related Buying Guides
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {linkedGuides.map((guide: any) => (
                <div
                  key={guide.slug}
                  className="border-2 border-line bg-paper p-6 shadow-hard flex flex-col justify-between space-y-4 group hover:-translate-y-1 hover:shadow-hard-lg transition-all"
                >
                  <div className="space-y-2">
                    <span className="font-mono text-[10px] uppercase font-bold text-muted border border-line/20 px-2 py-0.5 bg-panel inline-block">
                      {guide.readingTime}
                    </span>
                    <h3 className="font-display text-xl font-bold uppercase text-ink group-hover:text-accent transition-colors">
                      <Link href={`/guides/${guide.slug}`}>{guide.title}</Link>
                    </h3>
                    <p className="font-body text-xs text-muted leading-relaxed line-clamp-2">
                      {guide.subtitle}
                    </p>
                  </div>

                  <Link
                    href={`/guides/${guide.slug}`}
                    className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest2 font-bold text-accent hover:text-ink transition-colors pt-2 border-t border-line/10"
                  >
                    Read Decision Guide →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* =====================================================================
            6. SUGGESTED HEAD-TO-HEAD COMPARISONS
            ===================================================================== */}
        {category.suggestedComparisons.length > 0 && (
          <section aria-labelledby="comparisons-heading" className="border-2 border-line bg-panel p-6 sm:p-8 shadow-hard space-y-6">
            <div className="border-b-2 border-line pb-3">
              <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold block mb-1">
                Side-by-Side Analysis
              </span>
              <h2 id="comparisons-heading" className="font-display text-2xl font-bold uppercase tracking-tight text-ink">
                Suggested Comparisons
              </h2>
              <p className="font-mono text-xs text-muted mt-1">
                Evaluate key trade-offs between popular models side-by-side without declared winners.
              </p>
            </div>

            <div className="space-y-4">
              {category.suggestedComparisons.map((comp, idx) => (
                <div
                  key={idx}
                  className="border border-line/20 bg-paper p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h3 className="font-display text-lg font-bold uppercase text-ink">
                      {comp.label}
                    </h3>
                    <p className="font-body text-xs text-muted leading-relaxed">
                      {comp.context}
                    </p>
                  </div>

                  <Link
                    href={comp.url}
                    className="border-2 border-line bg-accent px-5 py-2.5 font-mono text-xs uppercase tracking-widest2 font-bold text-ink shadow-hard-sm hover:bg-ink hover:text-paper transition-all text-center shrink-0"
                  >
                    Launch Comparison →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* =====================================================================
            7. RESEARCHED PRODUCT CATALOG
            ===================================================================== */}
        <section aria-labelledby="products-catalog-heading" className="space-y-6">
          <div className="border-b-2 border-line pb-3 flex items-center justify-between">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold block mb-1">
                Curated Inventory
              </span>
              <h2 id="products-catalog-heading" className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-ink">
                Researched Products in {category.shortName}
              </h2>
            </div>
            <span className="font-mono text-xs text-muted">
              {categoryProducts.length} Models
            </span>
          </div>

          {categoryProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="border-2 border-line bg-paper p-8 text-center font-mono text-xs text-muted shadow-hard">
              Product dossiers for this category are being updated.
            </div>
          )}
        </section>

        {/* =====================================================================
            8. AFFILIATE COMPLIANCE DISCLOSURE
            ===================================================================== */}
        <AffiliateDisclosure />
      </article>

      {/* Compare Arena Floating Dock & Modal */}
      <CompareArena />
    </CompareProvider>
  );
}
