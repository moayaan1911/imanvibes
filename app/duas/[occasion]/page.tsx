import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ContentCard, { type ContentCardItem } from "@/components/ContentCard";
import JsonLd from "@/components/JsonLd";
import {
  duasByOccasion,
  getDuaByOccasionAndId,
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

  const relatedOccasions = occasionNames
    .filter((o) => o !== occasion)
    .slice(0, 6);

  return (
    <div className="page-bg min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-5">
        <JsonLd data={structuredData} />
        <section className="surface-panel rounded-[32px] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage-700)]">
            Duas
          </p>
          <h1 className="mt-3 text-[2rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[var(--ink-900)]">
            {occasion}
          </h1>
          <p className="mt-4 text-sm leading-6 text-[var(--ink-700)]">
            Browse {duasByOccasion[occasion].length} duas for this occasion.
          </p>
        </section>

        <section className="mt-5">
          <Suspense fallback={null}>
            <ContentCard
              items={items}
              kind="duas"
              initialItemId={currentItemId}
            />
          </Suspense>
        </section>

        {relatedOccasions.length > 0 ? (
          <section className="surface-section mt-5 rounded-[32px] p-5">
            <h2 className="text-lg font-semibold text-[var(--ink-900)]">
              More occasions
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {relatedOccasions.map((o) => (
                <Link
                  key={o}
                  href={`/duas/${slugifyOccasion(o)}`}
                  className="surface-item cursor-pointer rounded-[24px] px-4 py-4"
                >
                  <p className="text-sm font-semibold text-[var(--ink-900)]">
                    {o}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--ink-700)]">
                    {duasByOccasion[o].length} dua
                    {duasByOccasion[o].length === 1 ? "" : "s"}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
