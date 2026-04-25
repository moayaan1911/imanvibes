import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ContentCard, { type ContentCardItem } from "@/components/ContentCard";
import DetailBrandRow from "@/components/DetailBrandRow";
import JsonLd from "@/components/JsonLd";
import {
  getMoodHref,
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
    transliteration: entry.transliteration,
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
        <DetailBrandRow />
        <section className="mt-7">
          <Suspense fallback={null}>
            <ContentCard
              items={items}
              kind="quran"
              quranMood={mood}
              relatedMoodLinks={relatedMoods.map((relatedMood) => ({
                label: relatedMood,
                href: getMoodHref(relatedMood),
              }))}
            />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
