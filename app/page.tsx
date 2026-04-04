import Image from "next/image";
import Link from "next/link";
import { FaGithub, FaMugHot } from "react-icons/fa6";
import AddToHomeButton from "@/components/AddToHomeButton";
import MoodGrid from "@/components/MoodGrid";
import ThemeToggle from "@/components/ThemeToggle";
import {
  allahNames,
  hadithCollection,
  moodNames,
  quranByMood,
} from "@/lib/content";

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

export default function Home() {
  return (
    <div className="page-bg relative min-h-screen overflow-x-hidden">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-5">
        <section className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AddToHomeButton variant="inline" />
            <ThemeToggle variant="inline" />
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/moayaan1911/imanvibes"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="theme-toggle-shell flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-sm"
            >
              <FaGithub />
            </a>

            <a
              href="https://moayaan.com/donate"
              target="_blank"
              rel="noreferrer"
              aria-label="Support"
              className="theme-toggle-shell flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-sm"
            >
              <FaMugHot />
            </a>
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
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--sage-700)]">
                ImanVibes
              </p>
              <p className="mt-1 max-w-xs text-sm leading-6 text-[var(--ink-700)]">
                Quranic comfort for every mood
              </p>
            </div>
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
              className="button-primary cursor-pointer rounded-full px-4 py-3 text-center text-sm font-semibold"
            >
              Browse moods
            </Link>
            <Link
              href="/hadith"
              className="button-secondary cursor-pointer rounded-full px-4 py-3 text-center text-sm font-semibold"
            >
              Read hadith
            </Link>
          </div>
        </section>

        <section className="mt-5 grid gap-3">
          {sectionLinks.map((section) => (
            <SectionLinkCard key={section.href} {...section} />
          ))}
        </section>

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
