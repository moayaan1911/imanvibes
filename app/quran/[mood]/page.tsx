import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ContentCard, { type ContentCardItem } from "@/components/ContentCard";
import JsonLd from "@/components/JsonLd";
import MoodGrid from "@/components/MoodGrid";
import {
  getMoodFromSlug,
  moodNames,
  quranByMood,
  slugifyMood,
} from "@/lib/content";
import { createSeoMetadata } from "@/lib/seo";
import { getBreadcrumbJsonLd, getWebPageJsonLd } from "@/lib/structured-data";

export function generateStaticParams() {
  return moodNames.map((mood) => ({
    mood: slugifyMood(mood),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mood: string }>;
}): Promise<Metadata> {
  const { mood: moodSlug } = await params;
  const mood = getMoodFromSlug(moodSlug);

  if (!mood) {
    return createSeoMetadata({
      title: "Quran by Mood",
      description: "Browse Quran verses by mood on ImanVibes.",
      path: "/quran",
    });
  }

  return createSeoMetadata({
    title: `Quran for ${mood}`,
    description: `Browse ${quranByMood[mood].length} Quran verses selected for ${mood.toLowerCase()} hearts.`,
    path: `/quran/${moodSlug}`,
    imagePath: `/og/quran/${moodSlug}/${quranByMood[mood][0].entry}/opengraph-image`,
    keywords: ["Quran", "Quran by mood", mood],
  });
}

export default async function QuranMoodPage({
  params,
}: {
  params: Promise<{ mood: string }>;
}) {
  const { mood: moodSlug } = await params;
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
            <ContentCard items={items} kind="quran" />
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
