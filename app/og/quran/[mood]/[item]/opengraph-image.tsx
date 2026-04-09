import {
  getMoodFromSlug,
  getQuranEntryByMoodAndId,
  moodNames,
  quranByMood,
  slugifyMood,
} from "@/lib/content";
import { contentType, createQuoteOgImage, ogSize } from "@/lib/og";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = ogSize;
export { contentType };

export function generateStaticParams() {
  return moodNames.flatMap((mood) =>
    quranByMood[mood].map((entry) => ({
      mood: slugifyMood(mood),
      item: String(entry.entry),
    })),
  );
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ mood: string; item: string }>;
}) {
  const { mood: moodSlug, item } = await params;
  const mood = getMoodFromSlug(moodSlug);
  const entry =
    (mood ? getQuranEntryByMoodAndId(mood, item) : null) ??
    getQuranEntryByMoodAndId("Anxious", "1");

  return createQuoteOgImage({
    kind: "quran",
    arabic: entry?.arabic ?? "",
    translation: entry?.translation ?? "",
    source: entry?.source ?? "",
  });
}
