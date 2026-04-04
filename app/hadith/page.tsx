import { Suspense } from "react";
import ContentCard, { type ContentCardItem } from "@/components/ContentCard";
import { hadithCollection } from "@/lib/content";

const items: ContentCardItem[] = hadithCollection.map((entry) => ({
  id: String(entry.id),
  arabic: entry.arabic,
  translation: entry.translation,
  source: entry.source,
}));

export default function HadithPage() {
  return (
    <div className="page-bg min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-5">
        <section className="surface-panel rounded-[32px] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage-700)]">
            Hadith
          </p>
          <h1 className="mt-3 text-[2rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[var(--ink-900)]">
            Short reminders to return to.
          </h1>
          <p className="mt-4 text-sm leading-6 text-[var(--ink-700)]">
            Move through the collection one card at a time, copy the text, or
            share it directly.
          </p>
        </section>

        <section className="mt-5">
          <Suspense fallback={null}>
            <ContentCard items={items} kind="hadith" />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
