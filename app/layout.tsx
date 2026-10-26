import type { Metadata, Viewport } from "next";
import Navbar from "@/components/Navbar";
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
    default: "SmartChoice Storefront — Curated Product Picks",
    template: "%s | SmartChoice Storefront",
  },
  description:
    "Unbiased editorial product research, comprehensive Anti-Regret matrix analysis, and curated recommendations across all categories.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
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
      <body className="flex flex-col min-h-screen bg-canvas text-ink antialiased">
        <Navbar />
        <main className="flex-grow">{children}</main>

      <footer className="border-t border-white/10 px-4 py-12 bg-slate-950/50 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h4 className="text-white font-bold text-lg mb-3">SmartChoice</h4>
              <p className="text-gray-400 text-sm">Handpicked essentials. Zero regrets.</p>
            </div>

            {/* Links */}
            <div>
              <h5 className="text-white font-semibold mb-3">Browse</h5>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/collections" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Collections
                  </Link>
                </li>
                <li>
                  <Link href="/compare" className="text-gray-400 hover:text-white transition-colors text-sm">
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
                  <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Affiliate Disclosure
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h5 className="text-white font-semibold mb-3">Contact</h5>
              <p className="text-gray-400 text-sm mb-2">Questions? We&apos;re here to help.</p>
              <a href="mailto:hello@smartchoice.com" className="text-blue-400 hover:text-blue-300 text-sm">
                hello@smartchoice.com
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 pt-8">
            <div className="text-center text-gray-500 text-sm">
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
