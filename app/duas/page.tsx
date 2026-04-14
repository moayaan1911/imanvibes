import type { Metadata } from "next";
import Image from "next/image";
import BrandWordmark from "@/components/BrandWordmark";
import JsonLd from "@/components/JsonLd";
import SearchableGrid from "@/components/SearchableGrid";
import {
  duas,
  duasByOccasion,
  getOccasionHref,
  occasionNames,
  slugifyOccasion,
  totalDuas,
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
            Duas
          </h1>
          <p className="mt-3 text-xs leading-6 text-[var(--ink-700)]">
            Supplications for every occasion.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="stat-sage rounded-[24px] p-4">
              <p className="text-2xl font-semibold text-[var(--ink-900)]">
                {occasionNames.length}
              </p>
              <p className="mt-1 text-sm text-[var(--ink-700)]">Occasions</p>
            </div>
            <div className="stat-sand rounded-[24px] p-4">
              <p className="text-2xl font-semibold text-[var(--ink-900)]">
                {totalDuas}
              </p>
              <p className="mt-1 text-sm text-[var(--ink-700)]">Total duas</p>
            </div>
          </div>
        </section>

        <section className="surface-section mt-5 rounded-[32px] p-5">
          <h2 className="text-lg font-semibold text-[var(--ink-900)]">
            Pick an occasion
          </h2>
          <SearchableGrid
            categories={categories}
            items={searchableItems}
            categoryLabel="Occasions"
            itemLabel="duas"
            placeholder="Search occasions or duas (e.g. Bukhari, sleep)..."
          />
        </section>
      </main>
    </div>
  );
}
