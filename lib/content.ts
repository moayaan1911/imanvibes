import dataset from "@/imanvibes_dataset.json";

export type QuranEntry = {
  entry: number;
  arabic: string;
  translation: string;
  source: string;
};

export type HadithEntry = {
  id: number;
  arabic: string;
  translation: string;
  source: string;
};

export type AllahName = {
  id: number;
  arabic: string;
  transliteration: string;
  meaning: string;
};

type ContentDataset = {
  quranByMood: Record<string, QuranEntry[]>;
  hadithCollection: HadithEntry[];
  allahNames: AllahName[];
};

const content = dataset as ContentDataset;

export const quranByMood = content.quranByMood;
export const hadithCollection = content.hadithCollection;
export const allahNames = content.allahNames;
export const moodNames = Object.keys(quranByMood);
export const totalVerses = moodNames.reduce(
  (count, mood) => count + quranByMood[mood].length,
  0,
);

export function slugifyMood(mood: string) {
  return mood
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getMoodHref(mood: string) {
  return `/quran/${slugifyMood(mood)}`;
}

export function getMoodFromSlug(slug: string) {
  return moodNames.find((mood) => slugifyMood(mood) === slug) ?? null;
}
