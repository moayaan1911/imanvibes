import type { MetadataRoute } from "next";
import {
  allahNames,
  hadithCollection,
  moodNames,
  quranByMood,
  slugifyMood,
} from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/quran"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/hadith"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/names"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
  ];

  for (const mood of moodNames) {
    const moodPath = `/quran/${slugifyMood(mood)}`;

    entries.push({
      url: absoluteUrl(moodPath),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });

    for (const entry of quranByMood[mood]) {
      entries.push({
        url: absoluteUrl(`${moodPath}?item=${entry.entry}`),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  for (const entry of hadithCollection) {
    entries.push({
      url: absoluteUrl(`/hadith?item=${entry.id}`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    });
  }

  for (const entry of allahNames) {
    entries.push({
      url: absoluteUrl(`/names?item=${entry.id}`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    });
  }

  return entries;
}
