import type { Metadata } from "next";
import Link from "next/link";
import { getAllGuides } from "@/data/guides";
import { getAllInteractiveGuides } from "@/lib/guides";
import { getSiteUrl } from "@/config/site";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import { ShieldCheck, Search, TrendingUp, Calendar, FileText, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export function generateMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  const ogImage = `${siteUrl}/og-default.jpg`;
  return {
    title: "Interactive Buying Guides & Decision Frameworks | SmartChoice",
    description:
      "Interactive checklists, review evaluation quizzes, decision trees, shopping calendars, and warranty comparison tools to make confident purchasing decisions.",
    openGraph: {
      title: "Interactive Buying Guides & Decision Frameworks | SmartChoice",
      description:
        "Interactive decision tools, quality inspection checklists, and trade-off calculators to avoid buyer regret.",
      url: `${siteUrl}/guides`,
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "SmartChoice Storefront - Interactive Buying Guides & Decision Frameworks",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Interactive Buying Guides & Decision Frameworks | SmartChoice",
      description:
        "Interactive decision tools, quality inspection checklists, and trade-off calculators to avoid buyer regret.",
      images: [ogImage],
    },
    alternates: {
      canonical: `${siteUrl}/guides`,
    },
  };
}

export default function BuyingGuidesDirectoryPage() {
  const technicalGuides = getAllGuides();
  const interactiveGuides = getAllInteractiveGuides();
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

  const getGuideIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck size={28} className="text-blue-400" />;
      case 'Search':
        return <Search size={28} className="text-purple-400" />;
      case 'TrendingUp':
        return <TrendingUp size={28} className="text-emerald-400" />;
      case 'Calendar':
        return <Calendar size={28} className="text-amber-400" />;
      case 'FileText':
        return <FileText size={28} className="text-cyan-400" />;
      default:
        return <Sparkles size={28} className="text-blue-400" />;
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white selection:bg-blue-500 selection:text-white py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li className="text-blue-400 font-bold">Buying Guides</li>
            </ol>
          </nav>

          {/* Hero Header */}
          <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-8 sm:p-14 shadow-2xl">
            <div className="pointer-events-none absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl animate-pulse" />
              <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl animate-pulse delay-700" />
            </div>

            <div className="relative max-w-3xl space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider bg-blue-500/10 border border-blue-400/30 text-blue-300">
                <Sparkles size={14} className="text-blue-400" />
                Interactive Decision-Support Library
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Smart Buying Guides: <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-indigo-300">
                  What Actually Matters Before You Buy
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-body">
                Explore interactive checklists, review evaluation quizzes, decision trees, seasonal pricing calendars, and warranty breakdowns. We replace sales hype with mathematical decision frameworks so you never suffer buyer remorse.
              </p>
            </div>
          </header>

          {/* Section 1: 5 Interactive Non-Category Guides */}
          <section aria-labelledby="interactive-guides-heading" className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-bold block mb-1">
                  Interactive Tools & Frameworks
                </span>
                <h2
                  id="interactive-guides-heading"
                  className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight"
                >
                  Essential Consumer Guides (5 Interactive Tools)
                </h2>
              </div>
              <span className="font-mono text-xs text-slate-400">
                Client-side tools • Zero sales fluff
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {interactiveGuides.map((guide) => (
                <article
                  key={guide.slug}
                  className="bg-slate-900/60 border border-white/10 rounded-2xl p-7 shadow-xl flex flex-col justify-between space-y-6 group hover:border-blue-500/50 hover:bg-slate-900/90 transition-all transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 group-hover:border-blue-400/30 transition-all">
                        {getGuideIcon(guide.iconName)}
                      </div>
                      <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider bg-blue-500/10 border border-blue-400/30 text-blue-300">
                        {guide.badge}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors leading-snug">
                        <Link href={`/guides/${guide.slug}`}>{guide.title}</Link>
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-body">
                        {guide.subtitle}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
                      <span>{guide.category}</span>
                      <span>•</span>
                      <span>{guide.readingTime}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <Link
                      href={`/guides/${guide.slug}`}
                      className="inline-flex w-full items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-mono text-xs uppercase tracking-widest font-bold shadow-md shadow-blue-600/30 group-hover:shadow-blue-600/50 transition-all"
                    >
                      <span>Launch Interactive Guide</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Section 2: Technical Product Hardware Guides */}
          {technicalGuides.length > 0 && (
            <section aria-labelledby="technical-guides-heading" className="space-y-8 pt-8 border-t border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold block mb-1">
                    Hardware Engineering Teardowns
                  </span>
                  <h2
                    id="technical-guides-heading"
                    className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight"
                  >
                    Category Deep Dives
                  </h2>
                </div>
                <span className="font-mono text-xs text-slate-400">
                  Grounded in lab specifications
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {technicalGuides.map((guide) => (
                  <article
                    key={guide.slug}
                    className="bg-slate-900/60 border border-white/10 rounded-2xl p-7 shadow-xl flex flex-col justify-between space-y-6 group hover:border-white/30 hover:bg-slate-900 transition-all"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 font-mono text-[11px] uppercase tracking-wider text-slate-300">
                          {guide.category}
                        </span>
                        <span className="font-mono text-xs text-slate-400">
                          {guide.readingTime}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors leading-snug">
                        <Link href={`/guides/${guide.slug}`}>{guide.title}</Link>
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-body">
                        {guide.subtitle}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <Link
                        href={`/guides/${guide.slug}`}
                        className="inline-flex w-full items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-widest font-bold transition-all"
                      >
                        <span>Read Technical Teardown</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Affiliate Disclosure */}
          <AffiliateDisclosure />
        </div>
      </div>
    </>
  );
}
