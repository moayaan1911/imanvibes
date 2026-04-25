import { allahNames, hadithCollection, moodNames } from "@/lib/content";
import { absoluteUrl, siteDescription, siteName, siteTagline } from "@/lib/site";

export const runtime = "nodejs";

export async function GET() {
  const body = [
    `# ${siteName}`,
    `> ${siteTagline}`,
    "",
    siteDescription,
    "",
    "## Main routes",
    `- Home: ${absoluteUrl("/")}`,
    `- Quran by Mood: ${absoluteUrl("/quran")}`,
    `- Hadith: ${absoluteUrl("/hadith")}`,
    `- 99 Names: ${absoluteUrl("/names")}`,
    `- Duas: ${absoluteUrl("/duas")}`,
    "",
    "## Content notes",
    "- Quran verses and Hadith are rendered exactly as stored.",
    "- Quran shareable item URLs use the `?item=` query parameter on mood pages.",
    "- Hadith and 99 Names shareable item URLs use path segments such as `/hadith/1` and `/names/1`.",
    "- Sources are shown directly on the page for citation and reference.",
    "",
    "## Collections",
    `- Quran moods available: ${moodNames.length}`,
    `- Hadith entries available: ${hadithCollection.length}`,
    `- 99 Names entries available: ${allahNames.length}`,
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
