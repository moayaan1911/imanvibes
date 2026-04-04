import Link from "next/link";
import { getMoodHref, quranByMood } from "@/lib/content";

type MoodGridProps = {
  moods: string[];
  className?: string;
  showCounts?: boolean;
};

export default function MoodGrid({
  moods,
  className = "",
  showCounts = true,
}: MoodGridProps) {
  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`.trim()}>
      {moods.map((mood) => (
        <Link
          key={mood}
          href={getMoodHref(mood)}
          className="surface-item cursor-pointer rounded-[24px] px-4 py-4"
        >
          <p className="text-sm font-semibold text-[var(--ink-900)]">{mood}</p>
          {showCounts ? (
            <p className="mt-1 text-xs leading-5 text-[var(--ink-700)]">
              {quranByMood[mood].length} verse
              {quranByMood[mood].length === 1 ? "" : "s"}
            </p>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
