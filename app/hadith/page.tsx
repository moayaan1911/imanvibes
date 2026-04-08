import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import BrandWordmark from "@/components/BrandWordmark";
import ContentCard, { type ContentCardItem } from "@/components/ContentCard";
import JsonLd from "@/components/JsonLd";
import { hadithCollection } from "@/lib/content";
import { createSeoMetadata } from "@/lib/seo";
import { getBreadcrumbJsonLd, getWebPageJsonLd } from "@/lib/structured-data";

const items: ContentCardItem[] = hadithCollection.map((entry) => ({
  id: String(entry.id),
  arabic: entry.arabic,
  translation: entry.translation,
  source: entry.source,
}));

const pageTitle = "Hadith";
const pageDescription = "Short hadith reminders to return to without friction.";

export const metadata: Metadata = createSeoMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/hadith",
  imagePath: `/og/hadith/${hadithCollection[0].id}/opengraph-image`,
  keywords: ["Hadith", "Islamic reminders", "Prophetic sayings"],
});

export default function HadithPage() {
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
            <ContentCard items={items} kind="hadith" />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
