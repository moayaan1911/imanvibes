import type { Metadata } from "next";
import Image from "next/image";
import BrandWordmark from "@/components/BrandWordmark";
import JsonLd from "@/components/JsonLd";
import MoodGrid from "@/components/MoodGrid";
import { moodNames, totalVerses } from "@/lib/content";
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
            Quran by Mood
          </h1>
          <p className="mt-3 text-xs leading-6 text-[var(--ink-700)]">
            Read what meets your heart right now.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="stat-sage rounded-[24px] p-4">
              <p className="text-2xl font-semibold text-[var(--ink-900)]">
                {moodNames.length}
              </p>
              <p className="mt-1 text-sm text-[var(--ink-700)]">Available moods</p>
            </div>
            <div className="stat-sand rounded-[24px] p-4">
              <p className="text-2xl font-semibold text-[var(--ink-900)]">
                {totalVerses}
              </p>
              <p className="mt-1 text-sm text-[var(--ink-700)]">Total verses</p>
            </div>
          </div>
        </section>

        <section className="surface-section mt-5 rounded-[32px] p-5">
          <h2 className="text-lg font-semibold text-[var(--ink-900)]">
            Pick a mood
          </h2>
          <MoodGrid moods={moodNames} className="mt-4" />
        </section>
      </main>
    </div>
  );
}
