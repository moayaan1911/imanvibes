import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import ContentCard, { type ContentCardItem } from "@/components/ContentCard";
import JsonLd from "@/components/JsonLd";
import {
  getMoodHref,
  getMoodFromSlug,
  getQuranEntryByMoodAndId,
  moodNames,
  quranByMood,
  slugifyMood,
} from "@/lib/content";
import { createSeoMetadata } from "@/lib/seo";
import {
  getBreadcrumbJsonLd,
  getQuoteJsonLd,
  getWebPageJsonLd,
} from "@/lib/structured-data";
import { summarizeText, withItemParam } from "@/lib/site";

export function generateStaticParams() {
  return moodNames.map((mood) => ({
    mood: slugifyMood(mood),
  }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ mood: string }>;
  searchParams: Promise<{ item?: string }>;
}): Promise<Metadata> {
  const { mood: moodSlug } = await params;
  const { item } = await searchParams;
  const mood = getMoodFromSlug(moodSlug);

  if (!mood) {
    return createSeoMetadata({
      title: "Quran by Mood",
      description: "Browse Quran verses by mood on ImanVibes.",
      path: "/quran",
    });
  }

  const entry = item ? getQuranEntryByMoodAndId(mood, item) : null;
  const basePath = `/quran/${moodSlug}`;
  const path = withItemParam(basePath, entry ? String(entry.entry) : null);

  return createSeoMetadata({
    title: entry?.source ? `${mood} - ${entry.source}` : `Quran for ${mood}`,
    description: entry
      ? `${summarizeText(entry.translation, 150)}${entry.source ? ` Source: ${entry.source}.` : ""}`
      : `Browse ${quranByMood[mood].length} Quran verses selected for ${mood.toLowerCase()} hearts.`,
    path,
    imagePath: `/og/quran/${moodSlug}/${entry?.entry ?? quranByMood[mood][0].entry}/opengraph-image`,
    keywords: ["Quran", "Quran by mood", mood],
  });
}

export default async function QuranMoodPage({
  params,
  searchParams,
}: {
  params: Promise<{ mood: string }>;
  searchParams: Promise<{ item?: string }>;
}) {
  const { mood: moodSlug } = await params;
  const { item } = await searchParams;
  const mood = getMoodFromSlug(moodSlug);

  if (!mood) {
    notFound();
  }

  const items: ContentCardItem[] = quranByMood[mood].map((entry) => ({
    id: String(entry.entry),
    arabic: entry.arabic,
    transliteration: entry.transliteration,
    translation: entry.translation,
    source: entry.source,
  }));
  const currentEntry = item ? getQuranEntryByMoodAndId(mood, item) : null;
  const currentItemId = currentEntry ? String(currentEntry.entry) : items[0]?.id;
  const currentPath = withItemParam(`/quran/${moodSlug}`, currentItemId);
  const structuredData = [
    getWebPageJsonLd({
      title: `Quran for ${mood}`,
      description: `Browse ${quranByMood[mood].length} Quran verses selected for ${mood.toLowerCase()} hearts.`,
      path: `/quran/${moodSlug}`,
      type: "CollectionPage",
    }),
    getBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Quran by Mood", path: "/quran" },
      { name: mood, path: `/quran/${moodSlug}` },
    ]),
    ...(currentEntry
      ? [
          getQuoteJsonLd({
            urlPath: currentPath,
            title: currentEntry.source || `Quran for ${mood}`,
            text: currentEntry.translation,
            source: currentEntry.source,
            arabic: currentEntry.arabic,
            parentPath: `/quran/${moodSlug}`,
            genre: "Quran",
          }),
        ]
      : []),
  ];

  const relatedMoodLinks = moodNames
    .filter((item) => item !== mood)
    .slice(0, 6)
    .map((item) => ({
      href: getMoodHref(item),
      label: item,
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
              kind="quran"
              initialItemId={currentItemId}
              quranMood={mood}
              relatedMoodLinks={relatedMoodLinks}
            />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
