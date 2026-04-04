import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import BrandWordmark from "@/components/BrandWordmark";
import ContentCard, { type ContentCardItem } from "@/components/ContentCard";
import JsonLd from "@/components/JsonLd";
import { allahNames, getAllahNameById } from "@/lib/content";
import { createSeoMetadata } from "@/lib/seo";
import {
  getBreadcrumbJsonLd,
  getNameJsonLd,
  getWebPageJsonLd,
} from "@/lib/structured-data";
import { summarizeText, withItemParam } from "@/lib/site";

const items: ContentCardItem[] = allahNames.map((entry) => ({
  id: String(entry.id),
  arabic: entry.arabic,
  transliteration: entry.transliteration,
  meaning: entry.meaning,
}));

const pageTitle = "99 Names";
const pageDescription = "Reflect through the names of Allah, their meanings, and their mercy.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ item?: string }>;
}): Promise<Metadata> {
  const { item } = await searchParams;
  const entry = item ? getAllahNameById(item) : null;
  const path = withItemParam("/names", entry ? String(entry.id) : null);

  return createSeoMetadata({
    title: entry ? `${entry.transliteration} - 99 Names` : pageTitle,
    description: entry
      ? summarizeText(`${entry.transliteration}: ${entry.meaning}`, 155)
      : pageDescription,
    path,
    imagePath: `/og/names/${entry?.id ?? allahNames[0].id}/opengraph-image`,
    keywords: ["99 Names of Allah", "Asma ul Husna", "Islamic reflection"],
  });
}

export default async function NamesPage({
  searchParams,
}: {
  searchParams: Promise<{ item?: string }>;
}) {
  const { item } = await searchParams;
  const currentEntry = item ? getAllahNameById(item) : null;
  const currentItemId = currentEntry ? String(currentEntry.id) : items[0]?.id;
  const currentPath = withItemParam("/names", currentItemId);
  const structuredData = [
    getWebPageJsonLd({
      title: pageTitle,
      description: pageDescription,
      path: "/names",
      type: "CollectionPage",
    }),
    getBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "99 Names", path: "/names" },
    ]),
    ...(currentEntry
      ? [
          getNameJsonLd({
            urlPath: currentPath,
            transliteration: currentEntry.transliteration,
            meaning: currentEntry.meaning,
            arabic: currentEntry.arabic,
            parentPath: "/names",
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
            99 Names
          </h1>
          <p className="mt-3 text-xs leading-6 text-[var(--ink-700)]">
            Reflect through the names of Allah.
          </p>
        </section>

        <section className="mt-5">
          <Suspense fallback={null}>
            <ContentCard items={items} kind="names" initialItemId={currentItemId} />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
