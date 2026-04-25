import type { Metadata } from "next";
import { Suspense } from "react";
import AppHeader from "@/components/AppHeader";
import ContentCard, { type ContentCardItem } from "@/components/ContentCard";
import JsonLd from "@/components/JsonLd";
import { hadithCollection } from "@/lib/content";
import { createSeoMetadata } from "@/lib/seo";
import { getBreadcrumbJsonLd, getWebPageJsonLd } from "@/lib/structured-data";

const items: ContentCardItem[] = hadithCollection.map((entry) => ({
  id: String(entry.id),
  arabic: entry.arabic,
  transliteration: entry.transliteration,
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
      <main className="app-shell">
        <JsonLd data={structuredData} />
        <AppHeader showBackButton />

        <section className="mt-7">
          <Suspense fallback={null}>
            <ContentCard items={items} kind="hadith" />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
