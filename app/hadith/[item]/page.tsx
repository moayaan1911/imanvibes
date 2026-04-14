import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { notFound } from "next/navigation";
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
import { summarizeText } from "@/lib/site";

const items: ContentCardItem[] = hadithCollection.map((entry) => ({
  id: String(entry.id),
  arabic: entry.arabic,
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
