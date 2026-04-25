import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ContentCard, { type ContentCardItem } from "@/components/ContentCard";
import DetailBrandRow from "@/components/DetailBrandRow";
import JsonLd from "@/components/JsonLd";
import {
  duasByOccasion,
  getOccasionFromSlug,
  occasionNames,
  slugifyOccasion,
} from "@/lib/content";
import { createSeoMetadata } from "@/lib/seo";
import {
  getBreadcrumbJsonLd,
  getWebPageJsonLd,
} from "@/lib/structured-data";

export function generateStaticParams() {
  return occasionNames.map((occasion) => ({
    occasion: slugifyOccasion(occasion),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ occasion: string }>;
}): Promise<Metadata> {
  const { occasion: occasionSlug } = await params;
  const occasion = getOccasionFromSlug(occasionSlug);

  if (!occasion) {
    return createSeoMetadata({
      title: "Duas",
      description: "Browse duas by occasion on ImanVibes.",
      path: "/duas",
    });
  }

  const basePath = `/duas/${occasionSlug}`;

  return createSeoMetadata({
    title: `Duas for ${occasion}`,
    description: `Browse ${duasByOccasion[occasion].length} duas for ${occasion.toLowerCase()}.`,
    path: basePath,
    imagePath: `/og/duas/${duasByOccasion[occasion][0].id}/opengraph-image`,
    keywords: ["Duas", "Islamic supplications", occasion],
  });
}

export default async function DuasOccasionPage({
  params,
}: {
  params: Promise<{ occasion: string }>;
}) {
  const { occasion: occasionSlug } = await params;
  const occasion = getOccasionFromSlug(occasionSlug);

  if (!occasion) {
    notFound();
  }

  const items: ContentCardItem[] = duasByOccasion[occasion].map((entry) => ({
    id: String(entry.id),
    arabic: entry.arabic,
    transliteration: entry.transliteration,
    translation: entry.translation,
    source: entry.source,
  }));
  const currentItemId = items[0]?.id;
  const structuredData = [
    getWebPageJsonLd({
      title: `Duas for ${occasion}`,
      description: `Browse ${duasByOccasion[occasion].length} duas for ${occasion.toLowerCase()}.`,
      path: `/duas/${occasionSlug}`,
      type: "CollectionPage",
    }),
    getBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Duas", path: "/duas" },
      { name: occasion, path: `/duas/${occasionSlug}` },
    ]),
  ];

  const relatedOccasions = occasionNames
    .filter((o) => o !== occasion)
    .slice(0, 6);

  return (
    <div className="page-bg min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-5">
        <JsonLd data={structuredData} />
        <DetailBrandRow />
        <section className="mt-7">
          <Suspense fallback={null}>
            <ContentCard
              items={items}
              kind="duas"
              initialItemId={currentItemId}
              duaOccasion={occasion}
              relatedOccasionLinks={relatedOccasions.map((relatedOccasion) => ({
                label: relatedOccasion,
                href: `/duas/${slugifyOccasion(relatedOccasion)}`,
              }))}
            />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
