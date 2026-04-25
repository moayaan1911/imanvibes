import type { Metadata } from "next";
import { Suspense } from "react";
import ContentCard, { type ContentCardItem } from "@/components/ContentCard";
import DetailBrandRow from "@/components/DetailBrandRow";
import JsonLd from "@/components/JsonLd";
import { allahNames } from "@/lib/content";
import { createSeoMetadata } from "@/lib/seo";
import { getBreadcrumbJsonLd, getWebPageJsonLd } from "@/lib/structured-data";

const items: ContentCardItem[] = allahNames.map((entry) => ({
  id: String(entry.id),
  arabic: entry.arabic,
  transliteration: entry.transliteration,
  meaning: entry.meaning,
}));

const pageTitle = "99 Names";
const pageDescription = "Reflect through the names of Allah, their meanings, and their mercy.";

export const metadata: Metadata = createSeoMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/names",
  imagePath: `/og/names/${allahNames[0].id}/opengraph-image`,
  keywords: ["99 Names of Allah", "Asma ul Husna", "Islamic reflection"],
});

export default function NamesPage() {
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
  ];

  return (
    <div className="page-bg min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-5">
        <JsonLd data={structuredData} />
        <DetailBrandRow />
        <section className="mt-7">
          <Suspense fallback={null}>
            <ContentCard items={items} kind="names" />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
