import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRight, FaRegHand } from "react-icons/fa6";
import {
  MdAutoStories,
  MdDiamond,
  MdFavorite,
  MdHourglassEmpty,
  MdMenuBook,
  MdSpa,
  MdTsunami,
  MdWbSunny,
} from "react-icons/md";
import BrandWordmark from "@/components/BrandWordmark";
import DailyVerseCard from "@/components/DailyVerseCard";
import DownloadComingSoon from "@/components/DownloadComingSoon";
import JsonLd from "@/components/JsonLd";
import SettingsSheet from "@/components/SettingsSheet";
import {
  getDailyVerse,
  getFormattedDate,
  getMoodHref,
} from "@/lib/content";
import { createSeoMetadata } from "@/lib/seo";
import { getWebPageJsonLd } from "@/lib/structured-data";
import { siteDescription, siteName } from "@/lib/site";

const homeTitle = "ImanVibes | Quran by Mood";

const moodLinks = [
  { label: "Seeking Peace", href: getMoodHref("Seeking Peace"), icon: MdSpa },
  { label: "Anxious", href: getMoodHref("Anxious"), icon: MdTsunami },
  { label: "Grateful", href: getMoodHref("Grateful"), icon: MdFavorite },
  { label: "Hopeful", href: getMoodHref("Hopeful"), icon: MdWbSunny },
  { label: "Patience", href: getMoodHref("Patience"), icon: MdHourglassEmpty },
] as const;

const quickLinks = [
  { href: "/quran", label: "Quran", icon: MdMenuBook, className: "text-[1.7rem]" },
  {
    href: "/hadith",
    label: "Hadith",
    icon: MdAutoStories,
    className: "text-[1.7rem]",
  },
  { href: "/names", label: "Names", icon: MdDiamond, className: "text-[1.7rem]" },
  { href: "/duas", label: "Duas", icon: FaRegHand, className: "text-[1.35rem]" },
] as const;

const homeMetadata = createSeoMetadata({
  description: siteDescription,
  path: "/",
  imagePath: "/opengraph-image",
  keywords: ["Quran by mood", "Hadith", "99 Names of Allah"],
});

export const metadata: Metadata = {
  ...homeMetadata,
  title: {
    absolute: homeTitle,
  },
  openGraph: {
    ...homeMetadata.openGraph,
    title: homeTitle,
  },
  twitter: {
    ...homeMetadata.twitter,
    title: homeTitle,
  },
};

const dailyVerse = getDailyVerse();
const dailyDate = getFormattedDate();

export default function Home() {
  return (
    <div className="page-bg min-h-screen overflow-x-hidden">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-5">
        <JsonLd
          data={getWebPageJsonLd({
            title: homeTitle,
            description: siteDescription,
            path: "/",
          })}
        />

        <section className="mb-4 flex items-center justify-between gap-3" data-nosnippet>
          <div />
          <div className="flex items-center gap-2">
            <SettingsSheet />
          </div>
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
              as="h1"
              showTagline
              wordmarkClassName="text-[1.7rem]"
              taglineClassName="text-[11px] leading-4"
            />
          </div>
        </section>

        <div className="pb-10">
          <DownloadComingSoon />

          <section className="mt-6 grid grid-cols-4 gap-4" data-nosnippet>
            {quickLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center gap-3"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--sage-700)] shadow-sm transition-all hover:bg-[var(--sage-200)]">
                    <Icon className={item.className} />
                  </span>
                  <span className="text-[11px] font-medium text-[var(--ink-700)]">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </section>

          <section className="mt-8">
            <h3 className="max-w-[16rem] text-[1.6rem] leading-[1.15] tracking-[-0.03em] text-[var(--ink-900)] [font-family:var(--font-display)]">
              How is your heart today?
            </h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {moodLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--surface-line)] bg-[var(--surface-strong)] px-5 py-2.5 text-sm text-[var(--ink-700)] transition-colors hover:border-[var(--sage-500)] hover:bg-[var(--sage-500)] hover:text-white"
                  >
                    <Icon className="text-sm" />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/quran"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--sage-200)] bg-[var(--surface-soft)] px-5 py-2.5 text-sm font-medium text-[var(--sage-700)] transition-colors hover:border-[var(--sage-500)] hover:bg-[var(--sage-500)] hover:text-white"
              >
                Show More Moods
                <FaArrowRight className="text-xs" />
              </Link>
            </div>
          </section>

          <DailyVerseCard
            arabic={dailyVerse.arabic}
            transliteration={dailyVerse.transliteration}
            translation={dailyVerse.translation}
            source={dailyVerse.source}
            date={dailyDate}
          />
        </div>
      </main>
    </div>
  );
}
