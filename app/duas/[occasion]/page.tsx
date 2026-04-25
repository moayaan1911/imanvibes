import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import ContentCard, { type ContentCardItem } from "@/components/ContentCard";
import JsonLd from "@/components/JsonLd";
import {
  duasByOccasion,
  getDuaByOccasionAndId,
  getOccasionHref,
  getOccasionFromSlug,
  occasionNames,
  slugifyOccasion,
} from "@/lib/content";
import { createSeoMetadata } from "@/lib/seo";
import {
  getBreadcrumbJsonLd,
  getQuoteJsonLd,
  getWebPageJsonLd,
} from "@/lib/structured-data";
import { summarizeText, withItemParam } from "@/lib/site";

export function generateStaticParams() {
  return occasionNames.map((occasion) => ({
    occasion: slugifyOccasion(occasion),
  }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ occasion: string }>;
  searchParams: Promise<{ item?: string }>;
}): Promise<Metadata> {
  const { occasion: occasionSlug } = await params;
  const { item } = await searchParams;
  const occasion = getOccasionFromSlug(occasionSlug);

  if (!occasion) {
    return createSeoMetadata({
      title: "Duas",
      description: "Browse duas by occasion on ImanVibes.",
      path: "/duas",
    });
  }

  const entry = item ? getDuaByOccasionAndId(occasion, item) : null;
  const basePath = `/duas/${occasionSlug}`;
  const path = withItemParam(basePath, entry ? String(entry.id) : null);

  return createSeoMetadata({
    title: entry?.source
      ? `${occasion} - ${entry.source}`
      : `Duas for ${occasion}`,
    description: entry
      ? `${summarizeText(entry.translation, 150)}${entry.source ? ` Source: ${entry.source}.` : ""}`
      : `Browse ${duasByOccasion[occasion].length} duas for ${occasion.toLowerCase()}.`,
    path,
    imagePath: `/og/duas/${entry?.id ?? duasByOccasion[occasion][0].id}/opengraph-image`,
    keywords: ["Duas", "Islamic supplications", occasion],
  });
}

export default async function DuasOccasionPage({
  params,
  searchParams,
}: {
  params: Promise<{ occasion: string }>;
  searchParams: Promise<{ item?: string }>;
}) {
  const { occasion: occasionSlug } = await params;
  const { item } = await searchParams;
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
  const currentEntry = item ? getDuaByOccasionAndId(occasion, item) : null;
  const currentItemId = currentEntry
    ? String(currentEntry.id)
    : items[0]?.id;
  const currentPath = withItemParam(`/duas/${occasionSlug}`, currentItemId);
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
    ...(currentEntry
      ? [
          getQuoteJsonLd({
            urlPath: currentPath,
            title: currentEntry.source || `Dua for ${occasion}`,
            text: currentEntry.translation,
            source: currentEntry.source,
            arabic: currentEntry.arabic,
            parentPath: `/duas/${occasionSlug}`,
            genre: "Dua",
          }),
        ]
      : []),
  ];

  const relatedOccasionLinks = occasionNames
    .filter((o) => o !== occasion)
    .slice(0, 6)
    .map((o) => ({
      href: getOccasionHref(o),
      label: o,
    }));

  return (
    <div className="page-bg min-h-screen">
      <main className="app-shell">
        <JsonLd data={structuredData} />
        <AppHeader showBackButton />

        <section className="mt-7">
          <Suspense fallback={null}>
            <ContentCard
              items={items}
              kind="duas"
              initialItemId={currentItemId}
              duaOccasion={occasion}
              relatedOccasionLinks={relatedOccasionLinks}
            />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
