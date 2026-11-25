import type { Metadata } from "next";
import Link from "next/link";
import { getSiteUrl } from "@/config/site";

export function generateMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  const title = "Privacy Policy & Disclosures";
  const description =
    "Privacy policy, tracking disclosures, and affiliate disclosures for Paisavasooldaily.";

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Paisavasooldaily`,
      description,
      url: `${siteUrl}/privacy-policy`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${title} | Paisavasooldaily`,
      description,
    },
    alternates: {
      canonical: `${siteUrl}/privacy-policy`,
    },
  };
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container-page py-12 max-w-4xl mx-auto space-y-8">
      <Link
        href="/"
        className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest2 font-bold text-accent hover:text-ink transition-colors"
      >
        <span className="transition-transform duration-150 group-hover:-translate-x-1">←</span> Back to Catalog
      </Link>

      <div className="border-2 border-line bg-paper p-8 sm:p-12 shadow-hard space-y-8">
        <div className="border-b-2 border-line pb-6">
          <span className="font-mono text-[11px] uppercase tracking-widest2 text-accent font-bold">
            Legal & Compliance
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-ink font-display mt-2">
            Privacy Policy & Disclosures
          </h1>
          <p className="font-mono text-xs text-muted mt-2">
            Last Updated: August 2026
          </p>
        </div>

        <section className="space-y-4 font-body text-sm leading-relaxed text-ink/90">
          <h2 className="font-display text-xl font-bold uppercase text-ink">
            1. Affiliate Disclosure & Programme Participation
          </h2>
          <div className="border-2 border-line bg-panel p-4 font-mono text-xs font-bold text-ink">
            As an affiliate, I earn commissions from qualifying purchases made through links on this website.
          </div>
          <div className="border-2 border-line bg-paper p-4 font-mono text-xs text-ink/90 space-y-2">
            <p className="font-bold text-ink">
              Amazon Associates Mandatory Identification:
            </p>
            <p>
              Paisavasooldaily is a participant in the Amazon Services LLC Associates Program (including Amazon.in and Amazon.com), an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.
            </p>
            <p className="font-bold text-ink">
              As an Amazon Associate I earn from qualifying purchases.
            </p>
          </div>
          <p>
            When you click on links to various merchants on this site and make a purchase, this can result in this site earning a commission. Affiliate programs and affiliations include the Amazon Associates Network. We do not receive free promotional items or direct compensation for positive reviews; our editorial verdicts are independent and based on objective performance benchmarks, technical specifications, and anti-regret analysis.
          </p>
        </section>

        <section className="space-y-4 font-body text-sm leading-relaxed text-ink/90">
          <h2 className="font-display text-xl font-bold uppercase text-ink">
            2. Cookies and Tracking Technologies
          </h2>
          <p>
            When you click outbound affiliate links leading to Amazon or third-party retailer platforms, those third-party sites use browser cookies to track referral traffic and attribute qualifying transactions within their standard attribution windows. Paisavasooldaily does not store identifying tracking data, credit card information, or personal profile records on our servers.
          </p>
        </section>

        <section className="space-y-4 font-body text-sm leading-relaxed text-ink/90">
          <h2 className="font-display text-xl font-bold uppercase text-ink">
            3. Pricing & Availability Disclaimer
          </h2>
          <p>
            Product prices and availability on Amazon are subject to frequent market changes. Any price or availability information displayed on Amazon.in / Amazon.com at the time of purchase will apply to the purchase of the product. We encourage buyers to verify the final live price on Amazon prior to completing checkout.
          </p>
        </section>

        <section className="space-y-4 font-body text-sm leading-relaxed text-ink/90">
          <h2 className="font-display text-xl font-bold uppercase text-ink">
            4. Third-Party Links
          </h2>
          <p>
            Our website contains links to external platforms. We are not responsible for the privacy practices, content, warranty fulfillment, or terms of service of third-party platforms.
          </p>
        </section>
      </div>

      {/* Bright CTA at the bottom to return to storefront */}
      <div className="border-2 border-line bg-panel p-6 sm:p-8 shadow-hard flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-accent inline-block animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-widest2 font-bold text-accent">
              Storefront Navigation
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-ink">
            Done Reading Disclosures?
          </h2>
          <p className="font-body text-xs sm:text-sm text-muted max-w-md">
            Return to the storefront to explore editorial product research, Anti-Regret matrix breakdowns, and decision support.
          </p>
        </div>

        <Link
          href="/"
          className="group inline-flex items-center justify-center gap-3 border-2 border-line bg-accent px-8 py-4 font-mono text-sm uppercase tracking-widest2 font-bold text-ink shadow-hard transition-all duration-150 hover:-translate-y-1 hover:bg-ink hover:text-paper hover:shadow-hard-lg shrink-0 w-full sm:w-auto text-center"
        >
          <span>Browse Our Catalogue</span>
          <span className="transition-transform duration-150 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </div>
  );
}
