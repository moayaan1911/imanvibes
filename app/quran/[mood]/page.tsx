import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ContentCard, { type ContentCardItem } from "@/components/ContentCard";
import JsonLd from "@/components/JsonLd";
import MoodGrid from "@/components/MoodGrid";
import {
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

  const relatedMoods = moodNames.filter((item) => item !== mood).slice(0, 6);

  return (
    <div className="page-bg min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-5">
        <JsonLd data={structuredData} />
        <section className="surface-panel rounded-[32px] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage-700)]">
            Quran by Mood
          </p>
          <h1 className="mt-3 text-[2rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[var(--ink-900)]">
            {mood}
          </h1>
          <p className="mt-4 text-sm leading-6 text-[var(--ink-700)]">
            Browse {quranByMood[mood].length} verses selected for this feeling.
            Use the next button to move through them one by one.
          </p>
        </section>

        <section className="mt-5">
          <Suspense fallback={null}>
            <ContentCard items={items} kind="quran" initialItemId={currentItemId} />
          </Suspense>
        </section>

        <section className="surface-section mt-5 rounded-[32px] p-5">
          <h2 className="text-lg font-semibold text-[var(--ink-900)]">
            Explore more moods
          </h2>
          <MoodGrid moods={relatedMoods} className="mt-4" />
        </section>
      </main>
    </div>
  );
}
