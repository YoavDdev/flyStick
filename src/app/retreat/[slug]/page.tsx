import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRetreatBySlug, getAllRetreatSlugs } from "@/config/retreats";
import RetreatLanding from "@/app/components/retreat/RetreatLanding";

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllRetreatSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const retreat = getRetreatBySlug(params.slug);
  if (!retreat) return {};

  return {
    title: retreat.metaTitle,
    description: retreat.metaDescription,
    openGraph: {
      title: retreat.metaTitle,
      description: retreat.metaDescription,
      type: "website",
      locale: "he_IL",
      images: retreat.ogImage
        ? [{ url: retreat.ogImage, width: 1200, height: 630 }]
        : retreat.heroImage
        ? [{ url: retreat.heroImage, width: 1200, height: 630 }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: retreat.metaTitle,
      description: retreat.metaDescription,
    },
  };
}

export default function RetreatPage({ params }: PageProps) {
  const retreat = getRetreatBySlug(params.slug);

  if (!retreat) {
    notFound();
  }

  return <RetreatLanding retreat={retreat} />;
}
