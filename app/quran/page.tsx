import type { Metadata } from "next";
import AppBrandRow from "@/components/AppBrandRow";
import JsonLd from "@/components/JsonLd";
import SearchableGrid from "@/components/SearchableGrid";
import {
  getMoodHref,
  moodNames,
  quranByMood,
  slugifyMood,
} from "@/lib/content";
import { createSeoMetadata } from "@/lib/seo";
import { getBreadcrumbJsonLd, getWebPageJsonLd } from "@/lib/structured-data";

const pageTitle = "Quran by Mood";
const pageDescription =
  "Browse Quran verses organized around moods like sadness, anxiety, gratitude, loneliness, tawakkul, and seeking peace.";

export const metadata: Metadata = createSeoMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/quran",
  imagePath: "/og/quran/anxious/1/opengraph-image",
  keywords: ["Quran", "Quran by mood", "Anxious", "Sad", "Seeking peace"],
});

const categories = moodNames.map((mood) => ({
  name: mood,
  href: getMoodHref(mood),
  count: quranByMood[mood].length,
}));

const searchableItems = moodNames.flatMap((mood) => {
  const moodSlug = slugifyMood(mood);
  return quranByMood[mood].map((entry) => ({
    id: String(entry.entry),
    categoryName: mood,
    categoryHref: `/quran/${moodSlug}`,
    text: `${entry.translation} ${entry.source}`,
  }));
});

export default function QuranPage() {
  return (
    <div className="page-bg min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-5">
        <JsonLd
          data={[
            getWebPageJsonLd({
              title: pageTitle,
              description: pageDescription,
              path: "/quran",
              type: "CollectionPage",
            }),
            getBreadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Quran by Mood", path: "/quran" },
            ]),
          ]}
        />
        <AppBrandRow showBackButton />

        <h1 className="mt-7 max-w-[18rem] text-[3.45rem] leading-[0.92] tracking-[-0.05em] text-[var(--foreground)] [font-family:var(--font-display)]">
          Find Solace in the Quran
        </h1>
        <p className="mt-5 max-w-[21rem] text-[1.08rem] leading-[1.6] text-[var(--ink-700)]">
          How is your heart feeling today? Select a mood to discover guiding
          verses.
        </p>

        <div className="mt-6">
          <SearchableGrid
            categories={categories}
            items={searchableItems}
            categoryLabel="Moods"
            itemLabel="verses"
            placeholder="Search for a mood..."
            categoryStyle="mood-grid"
            showCategoryCounts={false}
          />
        </div>
      </main>
    </div>
  );
}
