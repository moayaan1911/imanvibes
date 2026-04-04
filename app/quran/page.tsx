import MoodGrid from "@/components/MoodGrid";
import { moodNames, totalVerses } from "@/lib/content";

export default function QuranPage() {
  return (
    <div className="page-bg min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-5">
        <section className="surface-panel rounded-[32px] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage-700)]">
            Quran by Mood
          </p>
          <h1 className="mt-3 text-[2rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[var(--ink-900)]">
            Read what meets your heart right now.
          </h1>
          <p className="mt-4 text-sm leading-6 text-[var(--ink-700)]">
            Choose a mood and open a small set of verses, rendered exactly as
            stored in your local collection.
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
