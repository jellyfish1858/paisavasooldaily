import type { Metadata } from 'next';
import { getSiteUrl } from '@/config/site';
import CollectionsClient from '@/components/CollectionsClient';

export function generateMetadata(): Metadata {
  const baseUrl = getSiteUrl();
  const title = 'Curated Product Collections — Top Picks & Recommendations | Paisavasooldaily';
  const description =
    'Explore curated product collections across Best Value, Premium Picks, Everyday Essentials, and Smart Buys researched from customer reviews and technical specs in India.';
  const canonical = `${baseUrl}/collections`;
  const ogImage = `${baseUrl}/og-default.jpg`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Paisavasooldaily',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Curated Product Collections — Paisavasooldaily',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default function CollectionsPage() {
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
        name: "Collections",
        item: `${baseUrl}/collections`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CollectionsClient />
    </>
  );
}
