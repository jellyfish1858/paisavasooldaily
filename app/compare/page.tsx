import type { Metadata } from "next";
import { getSiteUrl } from "@/config/site";
import CompareClient from "./CompareClient";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const resolved = await searchParams;
  const hasIds = Boolean(resolved?.ids);
  const baseUrl = getSiteUrl();

  return {
    title: "Product Comparison & Decision Arena",
    description:
      "Side-by-side product comparisons evaluating qualitative Anti-Regret matrix factors, technical specifications, and trade-offs without declaring arbitrary winners.",
    alternates: {
      canonical: `${baseUrl}/compare`,
    },
    openGraph: {
      title: "Product Comparison & Decision Arena",
      description:
        "Benchmark technical specifications, Anti-Regret matrix assessments, and trade-offs side-by-side.",
      url: `${baseUrl}/compare`,
      type: "website",
    },
    robots: {
      index: !hasIds,
      follow: true,
    },
  };
}

export default function ComparePage() {
  return <CompareClient />;
}
