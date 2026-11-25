import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllGuides, getGuideBySlug } from "@/data/guides";
import { getInteractiveGuideBySlug, getAllInteractiveGuides, InteractiveGuideMeta } from "@/lib/guides";
import { fetchProductsAction } from "@/app/secure-admin-panel/actions";
import ProductCard from "@/components/ProductCard";
import { CompareProvider } from "@/components/CompareProvider";
import CompareArena from "@/components/CompareArena";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import { getSiteUrl } from "@/config/site";
import { getCategoryByGuideSlug } from "@/data/categories";
import type { DbProduct } from "@/utils/supabase/types";

// Interactive Component Imports
import InteractiveChecklist from "@/components/guides/InteractiveChecklist";
import QuizCard from "@/components/guides/QuizCard";
import DecisionTree from "@/components/guides/DecisionTree";
import ShoppingCalendar from "@/components/guides/ShoppingCalendar";
import WarrantySlider from "@/components/guides/WarrantySlider";
import SpecDecoder from "@/components/guides/SpecDecoder";
import AuthenticationChecklist from "@/components/guides/AuthenticationChecklist";
import DealCalendar from "@/components/guides/DealCalendar";
import WarrantyCalculator from "@/components/guides/WarrantyCalculator";
import ReturnFlowchart from "@/components/guides/ReturnFlowchart";
import {
  ShieldCheck,
  Search,
  TrendingUp,
  Calendar,
  FileText,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Cpu,
  ShieldAlert,
  CalendarDays,
  Scale,
  Undo2,
} from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const technicalGuides = getAllGuides();
  const interactiveGuides = getAllInteractiveGuides();

  return [
    ...technicalGuides.map((g) => ({ slug: g.slug })),
    ...interactiveGuides.map((g) => ({ slug: g.slug })),
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const interactiveGuide = getInteractiveGuideBySlug(slug);
  const technicalGuide = getGuideBySlug(slug);

  if (!interactiveGuide && !technicalGuide) {
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

  const baseUrl = getSiteUrl();
  const canonicalUrl = `${baseUrl}/guides/${slug}`;
  const ogImage = `${baseUrl}/og-default.jpg`;

  if (interactiveGuide) {
    const title = `${interactiveGuide.title} — Interactive Buying Guide`;
    const description = interactiveGuide.description;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        url: canonicalUrl,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${interactiveGuide.title} - Paisavasooldaily Interactive Guide`,
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

  if (technicalGuide) {
    const title = `${technicalGuide.title} — Buying Guide`;
    const description = technicalGuide.subtitle;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        url: canonicalUrl,
        modifiedTime: technicalGuide.lastUpdated,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${technicalGuide.title} - Paisavasooldaily Buying Guide`,
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

  return { title: "Buying Guide" };
}

export default async function BuyingGuideDetailPage({ params }: Props) {
  const { slug } = await params;
  const interactiveGuide = getInteractiveGuideBySlug(slug);
  const technicalGuide = getGuideBySlug(slug);

  if (!interactiveGuide && !technicalGuide) {
    notFound();
  }

  const baseUrl = getSiteUrl();
  const canonicalUrl = `${baseUrl}/guides/${slug}`;

  // =========================================================================
  // VIEW 1: INTERACTIVE BUYING GUIDE (5 Core Non-Category Guides)
  // =========================================================================
  if (interactiveGuide) {
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: interactiveGuide.title,
      description: interactiveGuide.description,
      url: canonicalUrl,
      publisher: {
        "@type": "Organization",
        name: "Paisavasooldaily",
        url: baseUrl,
        logo: `${baseUrl}/brand/logo-full.png`,
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonicalUrl,
      },
    };

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
        {
          "@type": "ListItem",
          position: 3,
          name: interactiveGuide.shortTitle,
          item: canonicalUrl,
        },
      ],
    };

    const renderInteractiveComponent = (guide: InteractiveGuideMeta) => {
      switch (guide.interactiveType) {
        case 'checklist':
          return (
            <InteractiveChecklist
              ctaCollectionSlug={guide.ctaCollectionSlug}
              ctaCollectionName={guide.ctaCollectionName}
            />
          );
        case 'quiz':
          return (
            <QuizCard
              ctaCollectionSlug={guide.ctaCollectionSlug}
              ctaCollectionName={guide.ctaCollectionName}
            />
          );
        case 'decision-tree':
          return (
            <DecisionTree
              ctaCollectionSlug={guide.ctaCollectionSlug}
              ctaCollectionName={guide.ctaCollectionName}
            />
          );
        case 'calendar':
          return (
            <ShoppingCalendar
              ctaCollectionSlug={guide.ctaCollectionSlug}
              ctaCollectionName={guide.ctaCollectionName}
            />
          );
        case 'warranty-slider':
          return (
            <WarrantySlider
              ctaCollectionSlug={guide.ctaCollectionSlug}
              ctaCollectionName={guide.ctaCollectionName}
            />
          );
        case 'spec-decoder':
          return (
            <SpecDecoder
              ctaCollectionSlug={guide.ctaCollectionSlug}
              ctaCollectionName={guide.ctaCollectionName}
            />
          );
        case 'auth-checklist':
          return (
            <AuthenticationChecklist
              ctaCollectionSlug={guide.ctaCollectionSlug}
              ctaCollectionName={guide.ctaCollectionName}
            />
          );
        case 'deal-calendar':
          return (
            <DealCalendar
              ctaCollectionSlug={guide.ctaCollectionSlug}
              ctaCollectionName={guide.ctaCollectionName}
            />
          );
        case 'warranty-calc':
          return (
            <WarrantyCalculator
              ctaCollectionSlug={guide.ctaCollectionSlug}
              ctaCollectionName={guide.ctaCollectionName}
            />
          );
        case 'return-flowchart':
          return (
            <ReturnFlowchart
              ctaCollectionSlug={guide.ctaCollectionSlug}
              ctaCollectionName={guide.ctaCollectionName}
            />
          );
        default:
          return null;
      }
    };

    const getGuideIcon = (iconName: string) => {
      switch (iconName) {
        case 'ShieldCheck':
          return <ShieldCheck size={32} className="text-blue-400" />;
        case 'Search':
          return <Search size={32} className="text-purple-400" />;
        case 'TrendingUp':
          return <TrendingUp size={32} className="text-emerald-400" />;
        case 'Calendar':
          return <Calendar size={32} className="text-amber-400" />;
        case 'FileText':
          return <FileText size={32} className="text-cyan-400" />;
        case 'Cpu':
          return <Cpu size={32} className="text-blue-400" />;
        case 'ShieldAlert':
          return <ShieldAlert size={32} className="text-rose-400" />;
        case 'CalendarDays':
          return <CalendarDays size={32} className="text-amber-400" />;
        case 'Scale':
          return <Scale size={32} className="text-emerald-400" />;
        case 'Undo2':
          return <Undo2 size={32} className="text-cyan-400" />;
        default:
          return <Sparkles size={32} className="text-blue-400" />;
      }
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />

        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white selection:bg-blue-500 selection:text-white py-10 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-slate-400">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link href="/guides" className="hover:text-white transition-colors">
                    Guides
                  </Link>
                </li>
                <li>/</li>
                <li className="text-blue-400 font-bold truncate max-w-[200px] sm:max-w-none">
                  {interactiveGuide.shortTitle}
                </li>
              </ol>
            </nav>

            {/* Hero Section */}
            <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 sm:p-12 shadow-2xl">
              <div className="pointer-events-none absolute inset-0 opacity-20">
                <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl animate-pulse" />
                <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl animate-pulse delay-700" />
              </div>

              <div className="relative space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shrink-0">
                      {getGuideIcon(interactiveGuide.iconName)}
                    </div>
                    <div>
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider bg-blue-500/10 border border-blue-400/30 text-blue-300">
                        {interactiveGuide.badge}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-slate-400">
                    ⏱ {interactiveGuide.readingTime}
                  </span>
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                    {interactiveGuide.title}
                  </h1>
                  <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-body max-w-3xl">
                    {interactiveGuide.subtitle}
                  </p>
                </div>
              </div>
            </header>

            {/* Core Evaluation Takeaways Card */}
            <section aria-labelledby="takeaways-heading" className="space-y-4">
              <h2 id="takeaways-heading" className="text-sm font-mono uppercase tracking-widest text-slate-400 font-bold">
                Core Evaluation Principles
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {interactiveGuide.keyTakeaways.map((point, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 flex items-start gap-3.5 text-xs sm:text-sm"
                  >
                    <CheckCircle2 size={18} className="text-blue-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300 font-body leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Interactive Tool Container */}
            <main aria-label="Interactive guide tool" className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Interactive Evaluation Tool
                </h2>
                <span className="text-xs font-mono text-blue-400 font-semibold">
                  Live Client-Side Session
                </span>
              </div>

              {renderInteractiveComponent(interactiveGuide)}
            </main>

            {/* Affiliate Disclosure */}
            <AffiliateDisclosure />
          </div>
        </div>
      </>
    );
  }

  // =========================================================================
  // VIEW 2: TECHNICAL PRODUCT HARDWARE GUIDE (Existing Categories)
  // =========================================================================
  const guide = technicalGuide!;
  const parentCategory = getCategoryByGuideSlug(guide.slug);

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

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.subtitle,
    dateModified: guide.lastUpdated,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Paisavasooldaily",
      url: baseUrl,
      logo: `${baseUrl}/brand/logo-full.png`,
    },
  };

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
      {
        "@type": "ListItem",
        position: 3,
        name: guide.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <CompareProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="container-page py-10 sm:py-16 max-w-4xl mx-auto space-y-12">
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
            <li>/</li>
            <li className="text-ink font-bold truncate max-w-[200px] sm:max-w-none">
              {guide.title}
            </li>
          </ol>
        </nav>

        {/* Guide Header */}
        <header className="border-2 border-line bg-paper p-8 sm:p-12 shadow-hard space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="border-2 border-line bg-accent px-3 py-1 font-mono text-xs uppercase tracking-widest2 font-bold text-ink shadow-hard-sm">
              {guide.category} Decision Guide
            </span>
            <div className="flex items-center gap-3 font-mono text-xs text-muted">
              <span>Updated: {new Date(guide.lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              <span>•</span>
              <span>{guide.readingTime}</span>
            </div>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-bold uppercase tracking-tight text-ink leading-tight">
            {guide.title}
          </h1>

          <p className="font-body text-base sm:text-lg text-muted leading-relaxed">
            {guide.subtitle}
          </p>
        </header>

        {/* Lead Intro */}
        <section aria-labelledby="intro-heading" className="border-2 border-line bg-panel p-6 sm:p-8 space-y-4">
          <h2 id="intro-heading" className="font-display text-xl font-bold uppercase text-ink">
            Executive Summary & Problem Statement
          </h2>
          <p className="font-body text-sm sm:text-base font-semibold text-ink leading-relaxed">
            {guide.intro.lead}
          </p>
          <div className="space-y-3 pt-2 text-xs sm:text-sm text-muted leading-relaxed font-body">
            {guide.intro.context.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* Target Audience */}
        <section aria-labelledby="audience-heading" className="border-2 border-line bg-paper p-6 sm:p-8 shadow-hard space-y-4">
          <div className="border-b-2 border-line pb-3">
            <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold block mb-1">
              Suitability
            </span>
            <h2 id="audience-heading" className="font-display text-2xl font-bold uppercase tracking-tight text-ink">
              Who This Guide Is Written For
            </h2>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {guide.whoThisIsFor.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm font-body text-ink">
                <span className="font-bold text-accent shrink-0">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* What Matters */}
        <section aria-labelledby="factors-heading" className="space-y-6">
          <div className="border-b-2 border-line pb-3">
            <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold block mb-1">
              Evaluation Criteria
            </span>
            <h2 id="factors-heading" className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-ink">
              The Physical Specifications That Actually Matter
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {guide.whatMatters.map((factor, i) => (
              <div key={i} className="border-2 border-line bg-paper p-6 shadow-hard space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-ink text-paper px-2 py-0.5">
                    0{i + 1}
                  </span>
                  <h3 className="font-display text-lg sm:text-xl font-bold uppercase text-ink">
                    {factor.factor}
                  </h3>
                </div>
                <p className="font-body text-xs sm:text-sm text-muted leading-relaxed">
                  {factor.explanation}
                </p>
                <div className="border-t border-line/10 pt-2 flex items-start gap-2 text-xs font-mono text-ink">
                  <span className="font-bold text-accent">KEY TAKEAWAY:</span>
                  <span>{factor.keyDetail}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trade-Offs */}
        <section aria-labelledby="tradeoffs-heading" className="border-2 border-line bg-paper p-6 sm:p-8 shadow-hard space-y-6">
          <div className="border-b-2 border-line pb-3">
            <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold block mb-1">
              Compromises & Physics
            </span>
            <h2 id="tradeoffs-heading" className="font-display text-2xl font-bold uppercase tracking-tight text-ink">
              Inherent Engineering Trade-Offs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {guide.tradeOffs.map((to, i) => (
              <div key={i} className="border border-line/20 bg-panel p-5 space-y-2 flex flex-col justify-between">
                <h3 className="font-display text-sm font-bold uppercase text-ink">
                  {to.compromise}
                </h3>
                <p className="font-body text-xs text-muted leading-relaxed">
                  {to.explanation}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Researched Products */}
        {researchedProducts.length > 0 && (
          <section aria-labelledby="products-heading" className="space-y-6">
            <div className="border-b-2 border-line pb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold block mb-1">
                  Catalog Alignments
                </span>
                <h2 id="products-heading" className="font-display text-2xl font-bold uppercase tracking-tight text-ink">
                  Hardware Researched in This Guide
                </h2>
              </div>
              {parentCategory && (
                <Link
                  href={`/category/${parentCategory.slug}`}
                  className="font-mono text-xs uppercase font-bold text-accent hover:underline"
                >
                  View All {parentCategory.name} →
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {researchedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Checklist */}
        <section aria-labelledby="checklist-heading" className="border-2 border-line bg-paper p-6 sm:p-8 shadow-hard space-y-4">
          <div className="border-b-2 border-line pb-3">
            <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold block mb-1">
              Checklist Steps
            </span>
            <h2 id="checklist-heading" className="font-display text-2xl font-bold uppercase tracking-tight text-ink">
              Practical Pre-Purchase Checklist
            </h2>
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

        {/* FAQs */}
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

        {/* Affiliate Disclosure */}
        <AffiliateDisclosure />
      </article>
      <CompareArena />
    </CompareProvider>
  );
}
