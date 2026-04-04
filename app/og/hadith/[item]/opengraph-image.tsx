import { getHadithById, hadithCollection } from "@/lib/content";
import { contentType, createQuoteOgImage, ogSize } from "@/lib/og";

export const runtime = "nodejs";
export const size = ogSize;
export { contentType };

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ item: string }>;
}) {
  const { item } = await params;
  const entry = getHadithById(item) ?? hadithCollection[0];

  return createQuoteOgImage({
    kind: "hadith",
    arabic: entry.arabic,
    translation: entry.translation,
    source: entry.source,
  });
}
