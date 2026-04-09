import { getHadithById, hadithCollection } from "@/lib/content";
import { contentType, createQuoteOgImage, ogSize } from "@/lib/og";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = ogSize;
export { contentType };

export function generateStaticParams() {
  return hadithCollection.map((entry) => ({
    item: String(entry.id),
  }));
}

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
