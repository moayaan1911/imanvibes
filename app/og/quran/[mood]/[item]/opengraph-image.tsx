import { getMoodFromSlug, getQuranEntryByMoodAndId } from "@/lib/content";
import { contentType, createQuoteOgImage, ogSize } from "@/lib/og";

export const runtime = "nodejs";
export const size = ogSize;
export { contentType };

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
