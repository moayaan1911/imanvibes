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
    `- Alif-1.0: ${absoluteUrl("/alif")}`,
    `- Quran by Mood: ${absoluteUrl("/quran")}`,
    `- Hadith: ${absoluteUrl("/hadith")}`,
    `- 99 Names: ${absoluteUrl("/names")}`,
    "",
    "## Alif-1.0",
    "- Alif-1.0 is the first Islamic AI model by ImanVibes.",
    "- It is fine-tuned on Quran, Hadith, and Islamic history.",
    "- The current landing page is informational and points users to the public model listing.",
    "",
    "## Content notes",
    "- Quran verses and Hadith are rendered exactly as stored.",
    "- Shareable item URLs use the `?item=` query parameter on Quran mood, Hadith, and 99 Names pages.",
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
