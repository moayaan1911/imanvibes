import { Suspense } from "react";
import ContentCard, { type ContentCardItem } from "@/components/ContentCard";
import { allahNames } from "@/lib/content";

const items: ContentCardItem[] = allahNames.map((entry) => ({
  id: String(entry.id),
  arabic: entry.arabic,
  transliteration: entry.transliteration,
  meaning: entry.meaning,
}));

export default function NamesPage() {
  return (
    <div className="page-bg min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-5">
        <section className="surface-panel rounded-[32px] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage-700)]">
            99 Names
          </p>
          <h1 className="mt-3 text-[2rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[var(--ink-900)]">
            Reflect through the names of Allah.
          </h1>
          <p className="mt-4 text-sm leading-6 text-[var(--ink-700)]">
            Read the Arabic, transliteration, and meaning, then move to the
            next name when you are ready.
          </p>
        </section>

        <section className="mt-5">
          <Suspense fallback={null}>
            <ContentCard items={items} kind="names" />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
