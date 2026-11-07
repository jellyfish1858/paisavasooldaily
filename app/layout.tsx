import type { Metadata, Viewport } from "next";
import Navbar from "@/components/Navbar";
import BeautyWelcomePopup from "@/components/BeautyWelcomePopup";
import InstagramFollowCard from "@/components/InstagramFollowCard";
import Link from "next/link";
import Image from "next/image";
import { getSiteUrl } from "@/config/site";
import { getOrganizationSchema } from "@/lib/structured-data";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#020617",
};

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "SmartChoice Storefront — Curated Product Picks & Anti-Regret Research",
    template: "%s | SmartChoice Storefront",
  },
  description:
    "Unbiased editorial product research, comprehensive Anti-Regret matrix analysis, and verified recommendations across Beauty, Grooming & Fashion lifestyle for men and women, plus Tech & Accessories in India.",
  keywords: [
    "SmartChoice Storefront",
    "Verified Beauty and Fashion picks",
    "Zero-adulteration seller guarantee India",
    "Daily skincare grooming lifestyle for women and men",
    "Electronics and tech accessories India",
    "Anti-regret buying guides",
    "Best value INR",
  ],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  verification: {
    google: "OBLUySHXK_7EiNkxlTYKoSKvj12e2zyk_VrxoKNro7k",
  },
  openGraph: {
    title: "SmartChoice Storefront — Curated Product Picks & Anti-Regret Research",
    description:
      "Unbiased editorial product research, comprehensive Anti-Regret matrix analysis, and verified recommendations across Beauty, Fashion, Grooming, and Tech Accessories in India.",
    url: getSiteUrl(),
    siteName: "SmartChoice Storefront",
    locale: "en_IN",
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
    title: "SmartChoice Storefront — Curated Product Picks & Anti-Regret Research",
    description:
      "Unbiased editorial product research, comprehensive Anti-Regret matrix analysis, and verified recommendations across Beauty, Fashion, Grooming, and Tech Accessories in India.",
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
  const organizationSchema = getOrganizationSchema();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="flex flex-col min-h-screen bg-slate-950 text-slate-100 antialiased font-body">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <BeautyWelcomePopup />

        <footer className="border-t border-white/10 px-4 py-12 bg-gradient-to-b from-slate-900 to-slate-950 mt-auto">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Brand */}
              <div>
                <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group focus:outline-none" aria-label="SmartChoice Homepage">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/15 shadow-sm shrink-0">
                    <Image
                      src="/brand/logo-full.png"
                      alt="SmartChoice"
                      fill
                      sizes="32px"
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <span className="text-white font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-300">
                    SmartChoice
                  </span>
                </Link>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Handpicked essentials. Zero regrets.
                </p>
              </div>

              {/* Browse */}
              <div>
                <h5 className="text-white font-semibold mb-3">Browse</h5>
                <ul className="space-y-2">
                  <li>
                    <Link href="/" className="text-slate-400 hover:text-blue-300 transition-colors text-sm">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/collections" className="text-slate-400 hover:text-blue-300 transition-colors text-sm">
                      Collections
                    </Link>
                  </li>
                  <li>
                    <Link href="/guides" className="text-slate-400 hover:text-blue-300 transition-colors text-sm">
                      Guides
                    </Link>
                  </li>
                  <li>
                    <Link href="/compare" className="text-slate-400 hover:text-blue-300 transition-colors text-sm">
                      Compare
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h5 className="text-white font-semibold mb-3">Legal</h5>
                <ul className="space-y-2">
                  <li>
                    <Link href="/privacy-policy" className="text-slate-400 hover:text-blue-300 transition-colors text-sm">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy-policy" className="text-slate-400 hover:text-blue-300 transition-colors text-sm">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy-policy" className="text-slate-400 hover:text-blue-300 transition-colors text-sm">
                      Affiliate Disclosure
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h5 className="text-white font-semibold mb-3">Contact</h5>
                <p className="text-slate-400 text-sm mb-2">Questions? We&apos;re here to help.</p>
                <a href="mailto:hello@smartchoice.com" className="text-blue-400 hover:text-blue-300 transition-colors text-sm">
                  hello@smartchoice.com
                </a>
                <InstagramFollowCard />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 pt-8">
              <div className="text-center text-slate-500 text-sm">
                <p>© 2026 SmartChoice. All rights reserved.</p>
                <p className="mt-2">We earn affiliate commissions to provide free, unbiased product recommendations.</p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
