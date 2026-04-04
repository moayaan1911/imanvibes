import { allahNames, getAllahNameById } from "@/lib/content";
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
  const entry = getAllahNameById(item) ?? allahNames[0];

  return createQuoteOgImage({
    kind: "names",
    arabic: entry.arabic,
    transliteration: entry.transliteration,
    meaning: entry.meaning,
  });
}
