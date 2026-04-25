import type { Metadata } from "next";
import AppBrandRow from "@/components/AppBrandRow";
import JsonLd from "@/components/JsonLd";
import SearchableGrid from "@/components/SearchableGrid";
import {
  duas,
  duasByOccasion,
  getOccasionHref,
  occasionNames,
  slugifyOccasion,
} from "@/lib/content";
import { createSeoMetadata } from "@/lib/seo";
import { getBreadcrumbJsonLd, getWebPageJsonLd } from "@/lib/structured-data";

const pageTitle = "Duas";
const pageDescription =
  "Daily duas and supplications for every occasion — before eating, before sleep, for anxiety, travel, and more.";

export const metadata: Metadata = createSeoMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/duas",
  imagePath: `/og/duas/${duas[0].id}/opengraph-image`,
  keywords: ["Duas", "Islamic supplications", "Daily duas", "Dua collection"],
});

const categories = occasionNames.map((occasion) => ({
  name: occasion,
  href: getOccasionHref(occasion),
  count: duasByOccasion[occasion].length,
}));

const searchableItems = occasionNames.flatMap((occasion) => {
  const occasionSlug = slugifyOccasion(occasion);
  return duasByOccasion[occasion].map((entry) => ({
    id: String(entry.id),
    categoryName: occasion,
    categoryHref: `/duas/${occasionSlug}`,
    text: `${entry.translation} ${entry.source}`,
  }));
});

export default function DuasPage() {
  const structuredData = [
    getWebPageJsonLd({
      title: pageTitle,
      description: pageDescription,
      path: "/duas",
      type: "CollectionPage",
    }),
    getBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Duas", path: "/duas" },
    ]),
  ];

  return (
    <div className="page-bg min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-5">
        <JsonLd data={structuredData} />
        <AppBrandRow showBackButton />

        <section className="mx-auto mt-8 w-full max-w-2xl text-center">
          <h1 className="text-[2.85rem] leading-[0.98] tracking-[-0.05em] text-[var(--sage-700)] [font-family:var(--font-display)]">
            Supplications
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-[var(--ink-700)]">
            Find solace and strength in daily prayers and remembrance.
          </p>

          <SearchableGrid
            categories={categories}
            items={searchableItems}
            categoryLabel="Occasions"
            itemLabel="duas"
            placeholder="Search categories..."
            categoryStyle="dua-grid"
          />
        </section>
      </main>
    </div>
  );
}
