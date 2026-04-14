import { duas, getDuaById } from "@/lib/content";
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
  const entry = getDuaById(item) ?? duas[0];

  return createQuoteOgImage({
    kind: "duas",
    arabic: entry.arabic,
    transliteration: entry.transliteration,
    translation: entry.translation,
    source: entry.source,
  });
}
