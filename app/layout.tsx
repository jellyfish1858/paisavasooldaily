import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Image from "next/image";
import { getSiteUrl } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "SmartChoice Storefront — Curated Product Picks",
    template: "%s | SmartChoice Storefront",
  },
  description:
    "Unbiased editorial product research, comprehensive Anti-Regret matrix analysis, and curated recommendations across all categories.",
  icons: {
    icon: "/icon.svg",
  },
  verification: {
    google: "OBLUySHXK_7EiNkxlTYKoSKvj12e2zyk_VrxoKNro7k",
  },
  openGraph: {
    title: "SmartChoice Storefront — Curated Product Picks",
    description:
      "Unbiased editorial product research, comprehensive Anti-Regret matrix analysis, and curated product recommendations.",
    url: getSiteUrl(),
    siteName: "SmartChoice Storefront",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${getSiteUrl()}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: "SmartChoice Storefront — Curated Product Picks & Editorial Research",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartChoice Storefront — Curated Product Picks",
    description:
      "Unbiased editorial product research, comprehensive Anti-Regret matrix analysis, and curated product recommendations.",
    images: [`${getSiteUrl()}/og-default.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-canvas text-ink antialiased">
        <Navbar />
        <main className="flex-grow">{children}</main>

        {/* Amazon Associates Mandatory Compliance Global Footer */}
        <footer className="border-t-2 border-line bg-paper py-10 px-4 text-center mt-16 shadow-hard-sm">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex justify-center pb-1">
              <Link
                href="/"
                className="inline-block transition-opacity hover:opacity-90"
                aria-label="SmartChoice Storefront — Anti-Regret Matrix"
              >
                <Image
                  src="/brand/logo-full.png"
                  alt="SmartChoice Storefront — Anti-Regret Matrix"
                  width={33}
                  height={32}
                  className="h-8 w-auto object-contain"
                />
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 font-mono text-xs uppercase tracking-widest font-bold text-ink">
              <Link href="/" className="hover:text-accent transition-colors">
                Home
              </Link>
              <span>•</span>
              <Link href="/category" className="hover:text-accent transition-colors">
                Categories
              </Link>
              <span>•</span>
              <Link href="/guides" className="hover:text-accent transition-colors">
                Buying Guides
              </Link>
              <span>•</span>
              <Link href="/collections" className="hover:text-accent transition-colors">
                Collections
              </Link>
              <span>•</span>
              <Link href="/compare" className="hover:text-accent transition-colors">
                Compare
              </Link>
              <span>•</span>
              <Link href="/privacy-policy" className="hover:text-accent transition-colors underline">
                Privacy Policy & Disclosures
              </Link>
            </div>

            {/* Global Affiliate Disclosures (Platform-Neutral + Amazon Associates Mandatory Statement) */}
            <div className="space-y-1.5 max-w-2xl mx-auto">
              <p className="font-mono text-xs text-ink font-bold leading-relaxed">
                As an affiliate, I earn commissions from qualifying purchases made through links on this website.
              </p>
              <p className="font-mono text-xs text-muted leading-relaxed">
                As an Amazon Associate I earn from qualifying purchases.
              </p>
            </div>

            <p className="font-mono text-[11px] text-muted/70">
              © {new Date().getFullYear()} SmartChoice Storefront. Independent reviews and buying guides. Product names, logos, and brands are property of their respective owners.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
