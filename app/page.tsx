import type { Metadata } from "next";
import Image from "next/image";
import BrandWordmark from "@/components/BrandWordmark";
import HomeDashboard from "@/components/HomeDashboard";
import HomeTopActions from "@/components/HomeTopActions";
import JsonLd from "@/components/JsonLd";
import {
  getDailyVerse,
  getMoodHref,
} from "@/lib/content";
import { createSeoMetadata } from "@/lib/seo";
import { getWebPageJsonLd } from "@/lib/structured-data";
import { siteDescription, siteName } from "@/lib/site";

export const metadata: Metadata = createSeoMetadata({
  description: siteDescription,
  path: "/",
  imagePath: "/opengraph-image",
  keywords: ["Quran by mood", "Hadith", "99 Names of Allah"],
});

const dailyVerse = getDailyVerse();
const dashboardMoods = [
  { label: "Seeking Peace", href: getMoodHref("Seeking Peace"), icon: "peace" as const },
  { label: "Anxious", href: getMoodHref("Anxious"), icon: "anxious" as const },
  { label: "Grateful", href: getMoodHref("Grateful"), icon: "grateful" as const },
  { label: "Hopeful", href: getMoodHref("Hopeful"), icon: "hopeful" as const },
  { label: "Patience", href: getMoodHref("Patience"), icon: "patience" as const },
  { label: "Tawakkul", href: getMoodHref("Tawakkul"), icon: "tawakkul" as const },
];

export default function Home() {
  return (
    <div className="page-bg relative min-h-screen overflow-x-hidden">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-5">
        <JsonLd
          data={getWebPageJsonLd({
            title: siteName,
            description: siteDescription,
            path: "/",
          })}
        />

        <section
          className="mb-4 flex items-center justify-between gap-3"
          data-nosnippet
        >
          <div />
          <HomeTopActions />
        </section>

        <section className="mb-1 px-2">
          <div className="flex items-center gap-4">
            <Image
              src="/icon2Circular.png"
              alt="ImanVibes icon"
              width={84}
              height={84}
              priority
              className="icon-ring rounded-full border"
            />
            <BrandWordmark
              showTagline
              wordmarkClassName="text-[1.7rem]"
            />
          </div>
        </section>

        <HomeDashboard
          dailyVerse={{
            arabic: dailyVerse.arabic,
            translation: dailyVerse.translation,
            transliteration: dailyVerse.transliteration,
            source: dailyVerse.source,
            href: `${getMoodHref(dailyVerse.mood)}?item=${dailyVerse.entry}`,
          }}
          moods={dashboardMoods}
        />
      </main>
    </div>
  );
}
