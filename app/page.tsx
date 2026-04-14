import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FaAndroid, FaGithub, FaMicrochip, FaMugHot } from "react-icons/fa6";
import BrandWordmark from "@/components/BrandWordmark";
import DailyVerseCard from "@/components/DailyVerseCard";
import JsonLd from "@/components/JsonLd";
import MoodGrid from "@/components/MoodGrid";
import ThemeToggle from "@/components/ThemeToggle";
import {
  allahNames,
  getDailyVerse,
  getFormattedDate,
  hadithCollection,
  moodNames,
  quranByMood,
} from "@/lib/content";
import { createSeoMetadata } from "@/lib/seo";
import { getWebPageJsonLd } from "@/lib/structured-data";
import { siteDescription, siteName } from "@/lib/site";

const featuredMood = "Anxious";
const featuredVerse = quranByMood[featuredMood][0];
const previewMoods = [
  "Sad",
  "Anxious",
  "Lonely",
  "Heartbroken",
  "Grateful",
  "Seeking Peace",
  "Low Iman",
  "Tawakkul",
];

const sectionLinks = [
  {
    href: "/quran",
    label: "Quran by mood",
    count: `${moodNames.length} moods`,
    summary: "Find verses grouped around what your heart is carrying.",
  },
  {
    href: "/hadith",
    label: "Hadith",
    count: `${hadithCollection.length} narrations`,
    summary: "Short reminders you can return to without friction.",
  },
  {
    href: "/names",
    label: "99 Names",
    count: `${allahNames.length} names`,
    summary: "Reflect through the names, meanings, and mercy of Allah.",
  },
];

export const metadata: Metadata = createSeoMetadata({
  description: siteDescription,
  path: "/",
  imagePath: "/opengraph-image",
  keywords: ["Quran by mood", "Hadith", "99 Names of Allah"],
});

function SectionLinkCard({
  href,
  label,
  count,
  summary,
}: {
  href: string;
  label: string;
  count: string;
  summary: string;
}) {
  return (
    <Link
      href={href}
      className="surface-section cursor-pointer rounded-[28px] p-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--sage-700)]">{label}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-700)]">{summary}</p>
        </div>
        <span className="pill-soft shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold">
          {count}
        </span>
      </div>
    </Link>
  );
}

const dailyVerse = getDailyVerse();
const dailyDate = getFormattedDate();

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
          <div className="flex items-center gap-2">
            <Link
              href="/app"
              className="theme-toggle-shell flex min-h-[3.05rem] shrink-0 cursor-pointer items-center gap-2 rounded-full px-4.5 py-3 text-[1.02rem] font-semibold whitespace-nowrap"
            >
              <FaAndroid />
              <span>Download app</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle variant="inline" iconOnly />
            <Link
              href="https://github.com/moayaan1911/imanvibes"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="theme-toggle-shell flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-sm"
            >
              <FaGithub />
            </Link>

            <Link
              href="https://moayaan.com/donate"
              target="_blank"
              rel="noreferrer"
              aria-label="Support"
              className="theme-toggle-shell flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-sm"
            >
              <FaMugHot />
            </Link>
          </div>
        </section>

        <section className="surface-panel rounded-[32px] p-5">
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

          <div className="mt-6 space-y-4">
            <h1 className="max-w-xs text-[2rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[var(--ink-900)]">
              A quiet place for Quran, Hadith, and the 99 Names of Allah.
            </h1>
            <p className="max-w-sm text-sm leading-6 text-[var(--ink-700)]">
              Open the mood you are carrying, read content exactly as stored,
              and move through reminders without noise, sign-ups, or clutter.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link
              href="/quran"
              className="button-primary flex min-h-[3.5rem] cursor-pointer items-center justify-center rounded-[22px] px-4 py-2 text-center text-sm font-semibold"
            >
              Browse moods
            </Link>
            <Link
              href="/alif"
              className="button-secondary relative flex min-h-[3.5rem] cursor-pointer items-center overflow-visible rounded-[22px] px-4 py-2 text-left"
            >
              <span className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-[var(--gold-400)] bg-[color:rgba(232,216,173,0.18)] px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-[var(--gold-400)] shadow-[0_8px_18px_rgba(200,169,107,0.2)] backdrop-blur">
                Our first AI model
              </span>
              <span className="flex w-full items-center justify-center gap-3">
                <span className="pill-soft inline-flex size-7 shrink-0 items-center justify-center rounded-full text-sm">
                  <FaMicrochip />
                </span>
                <span className="block">
                  <span className="block whitespace-nowrap text-base font-semibold text-[var(--ink-900)]">
                    Alif-1.0
                  </span>
                </span>
              </span>
            </Link>
          </div>
        </section>

        <section className="mt-5 grid gap-3">
          {sectionLinks.map((section) => (
            <SectionLinkCard key={section.href} {...section} />
          ))}
        </section>

        <div className="mt-5">
          <DailyVerseCard
            arabic={dailyVerse.arabic}
            translation={dailyVerse.translation}
            source={dailyVerse.source}
            mood={dailyVerse.mood}
            date={dailyDate}
          />
        </div>

        <section className="surface-soft-block mt-5 rounded-[32px] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage-700)]">
                Featured Ayah
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--ink-900)]">
                Quran for {featuredMood.toLowerCase()} hearts
              </h2>
            </div>
            <span className="rounded-full bg-[var(--gold-200)] px-3 py-1 text-xs font-semibold text-[var(--gold-400)]">
              {featuredMood}
            </span>
          </div>

          <article className="surface-card mt-4 rounded-[28px] p-5">
            <p
              dir="rtl"
              lang="ar"
              className="text-right text-[1.8rem] leading-[1.9] text-[var(--ink-900)] [font-family:var(--font-arabic)]"
            >
              {featuredVerse.arabic}
            </p>
            <p className="mt-4 text-base leading-7 text-[var(--ink-900)]">
              {featuredVerse.translation}
            </p>
            <p className="mt-3 text-sm font-medium text-[var(--sage-700)]">
              {featuredVerse.source}
            </p>
          </article>
        </section>

        <section className="surface-section mt-5 rounded-[32px] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage-700)]">
                Start Here
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--ink-900)]">
                Browse by mood
              </h2>
            </div>
            <Link
              href="/quran"
              className="pill-soft cursor-pointer rounded-full px-3 py-1 text-xs font-semibold"
            >
              See all
            </Link>
          </div>

          <MoodGrid moods={previewMoods} className="mt-4" />
        </section>
      </main>
    </div>
  );
}
