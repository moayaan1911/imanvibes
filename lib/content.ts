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

export function getQuranEntryByMoodAndId(mood: string, itemId: string) {
  return quranByMood[mood]?.find((entry) => String(entry.entry) === itemId) ?? null;
}

export function getHadithById(itemId: string) {
  return hadithCollection.find((entry) => String(entry.id) === itemId) ?? null;
}

export function getAllahNameById(itemId: string) {
  return allahNames.find((entry) => String(entry.id) === itemId) ?? null;
}

const allVerses: (QuranEntry & { mood: string })[] = [];

for (const mood of moodNames) {
  for (const verse of quranByMood[mood]) {
    allVerses.push({ ...verse, mood });
  }
}

export function getDailyVerse() {
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const index = dayOfYear % allVerses.length;
  return allVerses[index];
}

export function getFormattedDate() {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
