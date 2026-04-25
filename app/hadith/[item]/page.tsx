import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ContentCard, { type ContentCardItem } from "@/components/ContentCard";
import DetailBrandRow from "@/components/DetailBrandRow";
import JsonLd from "@/components/JsonLd";
import { getHadithById, hadithCollection } from "@/lib/content";
import { createSeoMetadata } from "@/lib/seo";
import {
  getBreadcrumbJsonLd,
  getQuoteJsonLd,
  getWebPageJsonLd,
} from "@/lib/structured-data";
import { summarizeText } from "@/lib/site";

const items: ContentCardItem[] = hadithCollection.map((entry) => ({
  id: String(entry.id),
  arabic: entry.arabic,
  transliteration: entry.transliteration,
  translation: entry.translation,
  source: entry.source,
}));

const pageTitle = "Hadith";
const pageDescription = "Short hadith reminders to return to without friction.";

export function generateStaticParams() {
  return hadithCollection.map((entry) => ({
    item: String(entry.id),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ item: string }>;
}): Promise<Metadata> {
  const { item } = await params;
  const entry = getHadithById(item);

  if (!entry) {
    return createSeoMetadata({
      title: pageTitle,
      description: pageDescription,
      path: "/hadith",
      imagePath: `/og/hadith/${hadithCollection[0].id}/opengraph-image`,
      keywords: ["Hadith", "Islamic reminders", "Prophetic sayings"],
    });
  }

  const path = `/hadith/${entry.id}`;

  return createSeoMetadata({
    title: `Hadith - ${entry.source}`,
    description: `${summarizeText(entry.translation, 150)}${entry.source ? ` Source: ${entry.source}.` : ""}`,
    path,
    imagePath: `/og/hadith/${entry.id}/opengraph-image`,
    keywords: ["Hadith", "Islamic reminders", "Prophetic sayings"],
  });
}

export default async function HadithItemPage({
  params,
}: {
  params: Promise<{ item: string }>;
}) {
  const { item } = await params;
  const currentEntry = getHadithById(item);

  if (!currentEntry) {
    notFound();
  }

  const currentPath = `/hadith/${currentEntry.id}`;
  const structuredData = [
    getWebPageJsonLd({
      title: currentEntry.source || pageTitle,
      description: `${summarizeText(currentEntry.translation, 150)}${currentEntry.source ? ` Source: ${currentEntry.source}.` : ""}`,
      path: currentPath,
    }),
    getBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Hadith", path: "/hadith" },
      { name: currentEntry.source || pageTitle, path: currentPath },
    ]),
    getQuoteJsonLd({
      urlPath: currentPath,
      title: currentEntry.source || pageTitle,
      text: currentEntry.translation,
      source: currentEntry.source,
      arabic: currentEntry.arabic,
      parentPath: "/hadith",
      genre: "Hadith",
    }),
  ];

  return (
    <div className="page-bg min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-5">
        <JsonLd data={structuredData} />
        <DetailBrandRow />
        <section className="mt-7">
          <Suspense fallback={null}>
            <ContentCard
              items={items}
              kind="hadith"
              initialItemId={String(currentEntry.id)}
            />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
