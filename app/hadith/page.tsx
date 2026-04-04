import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import BrandWordmark from "@/components/BrandWordmark";
import ContentCard, { type ContentCardItem } from "@/components/ContentCard";
import JsonLd from "@/components/JsonLd";
import { getHadithById, hadithCollection } from "@/lib/content";
import { createSeoMetadata } from "@/lib/seo";
import {
  getBreadcrumbJsonLd,
  getQuoteJsonLd,
  getWebPageJsonLd,
} from "@/lib/structured-data";
import { summarizeText, withItemParam } from "@/lib/site";

const items: ContentCardItem[] = hadithCollection.map((entry) => ({
  id: String(entry.id),
  arabic: entry.arabic,
  translation: entry.translation,
  source: entry.source,
}));

const pageTitle = "Hadith";
const pageDescription = "Short hadith reminders to return to without friction.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ item?: string }>;
}): Promise<Metadata> {
  const { item } = await searchParams;
  const entry = item ? getHadithById(item) : null;
  const path = withItemParam("/hadith", entry ? String(entry.id) : null);

  return createSeoMetadata({
    title: entry?.source ? `Hadith - ${entry.source}` : pageTitle,
    description: entry
      ? `${summarizeText(entry.translation, 150)}${entry.source ? ` Source: ${entry.source}.` : ""}`
      : pageDescription,
    path,
    imagePath: `/og/hadith/${entry?.id ?? hadithCollection[0].id}/opengraph-image`,
    keywords: ["Hadith", "Islamic reminders", "Prophetic sayings"],
  });
}

export default async function HadithPage({
  searchParams,
}: {
  searchParams: Promise<{ item?: string }>;
}) {
  const { item } = await searchParams;
  const currentEntry = item ? getHadithById(item) : null;
  const currentItemId = currentEntry ? String(currentEntry.id) : items[0]?.id;
  const currentPath = withItemParam("/hadith", currentItemId);
  const structuredData = [
    getWebPageJsonLd({
      title: pageTitle,
      description: pageDescription,
      path: "/hadith",
      type: "CollectionPage",
    }),
    getBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Hadith", path: "/hadith" },
    ]),
    ...(currentEntry
      ? [
          getQuoteJsonLd({
            urlPath: currentPath,
            title: currentEntry.source || pageTitle,
            text: currentEntry.translation,
            source: currentEntry.source,
            arabic: currentEntry.arabic,
            parentPath: "/hadith",
            genre: "Hadith",
          }),
        ]
      : []),
  ];

  return (
    <div className="page-bg min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-5">
        <JsonLd data={structuredData} />
        <section className="surface-panel rounded-[32px] p-5">
          <div className="flex items-center gap-4">
            <Image
              src="/icon2Circular.png"
              alt="ImanVibes icon"
              width={64}
              height={64}
              priority
              className="icon-ring rounded-full border"
            />
            <BrandWordmark wordmarkClassName="text-[1.45rem]" />
          </div>

          <h1 className="mt-5 text-[2rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[var(--ink-900)]">
            Hadith
          </h1>
          <p className="mt-3 text-xs leading-6 text-[var(--ink-700)]">
            Short reminders to return to.
          </p>
        </section>

        <section className="mt-5">
          <Suspense fallback={null}>
            <ContentCard items={items} kind="hadith" initialItemId={currentItemId} />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
