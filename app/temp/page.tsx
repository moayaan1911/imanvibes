import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { allahNames, duas, hadithCollection, quranByMood } from "@/lib/content";
import { createSeoMetadata } from "@/lib/seo";

const sampleQuran = quranByMood.Anxious[0];
const sampleHadith = hadithCollection[0];
const sampleName = allahNames[0];
const sampleDua = duas[0];

const previewCards = [
  {
    title: "Landing OG",
    src: "/opengraph-image",
    href: "/opengraph-image",
  },
  {
    title: "Quran Quote OG",
    src: `/og/quran/anxious/${sampleQuran.entry}/opengraph-image`,
    href: `/og/quran/anxious/${sampleQuran.entry}/opengraph-image`,
  },
  {
    title: "Hadith Quote OG",
    src: `/og/hadith/${sampleHadith.id}/opengraph-image`,
    href: `/og/hadith/${sampleHadith.id}/opengraph-image`,
  },
  {
    title: "99 Names Quote OG",
    src: `/og/names/${sampleName.id}/opengraph-image`,
    href: `/og/names/${sampleName.id}/opengraph-image`,
  },
  {
    title: "Duas Quote OG",
    src: `/og/duas/${sampleDua.id}/opengraph-image`,
    href: `/og/duas/${sampleDua.id}/opengraph-image`,
  },
];

export const metadata: Metadata = createSeoMetadata({
  title: "Temp Preview",
  description: "Internal preview page for Open Graph image development.",
  path: "/temp",
  imagePath: "/opengraph-image",
  noIndex: true,
});

export default function TempPage() {
  return (
    <div className="page-bg min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6">
        <section className="surface-panel rounded-[32px] p-6">
          <p className="text-sm font-semibold uppercase text-[var(--sage-700)]">
            Temp Preview
          </p>
          <h1 className="mt-3 text-[2rem] font-semibold text-[var(--ink-900)]">
            Open Graph previews
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-700)]">
            These are the actual generated OG image endpoints. If they look good
            here, they will look the same when wired into route metadata.
          </p>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          {previewCards.map((card) => (
            <article key={card.href} className="surface-section rounded-[32px] p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-[var(--ink-900)]">
                  {card.title}
                </h2>
                <Link
                  href={card.href}
                  target="_blank"
                  rel="noreferrer"
                  className="pill-soft cursor-pointer rounded-full px-3 py-1 text-xs font-semibold"
                >
                  Open raw
                </Link>
              </div>

              <div className="mt-4 overflow-hidden rounded-[24px] border border-[var(--surface-line)] bg-[var(--surface-solid)]">
                <Image
                  src={card.src}
                  alt={card.title}
                  width={1200}
                  height={630}
                  unoptimized
                  className="h-auto w-full"
                />
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
