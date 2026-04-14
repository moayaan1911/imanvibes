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

export type DuaEntry = {
  id: number;
  arabic: string;
  transliteration: string;
  translation: string;
  source: string;
  occasion: string;
};

type ContentDataset = {
  quranByMood: Record<string, QuranEntry[]>;
  hadithCollection: HadithEntry[];
  allahNames: AllahName[];
  duas: DuaEntry[];
};

const content = dataset as ContentDataset;

export const quranByMood = content.quranByMood;
export const hadithCollection = content.hadithCollection;
export const allahNames = content.allahNames;
export const duas = content.duas;
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

export function getDuaById(itemId: string) {
  return duas.find((entry) => String(entry.id) === itemId) ?? null;
}

const occasionSet = new Set<string>();
export const duasByOccasion: Record<string, DuaEntry[]> = {};

for (const dua of duas) {
  occasionSet.add(dua.occasion);
  (duasByOccasion[dua.occasion] ??= []).push(dua);
}

export const occasionNames = Array.from(occasionSet).sort(
  (a, b) => (duasByOccasion[b]?.length ?? 0) - (duasByOccasion[a]?.length ?? 0),
);
export const totalDuas = duas.length;

export function slugifyOccasion(occasion: string) {
  return occasion
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getOccasionHref(occasion: string) {
  return `/duas/${slugifyOccasion(occasion)}`;
}

export function getOccasionFromSlug(slug: string) {
  return occasionNames.find((occasion) => slugifyOccasion(occasion) === slug) ?? null;
}

export function getDuaByOccasionAndId(occasion: string, itemId: string) {
  return duasByOccasion[occasion]?.find((entry) => String(entry.id) === itemId) ?? null;
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
