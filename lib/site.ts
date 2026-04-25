export const siteName = "ImanVibes";
export const siteTagline = "Quranic comfort for every mood";
export const siteDomain = "imanvibes.vercel.app";
export const defaultSiteUrl = `https://${siteDomain}`;
export const appVersion = "0.0.12";
export const githubRepoUrl = "https://github.com/moayaan1911/imanvibes";
export const developerWebsiteUrl = "https://moayaan.com";
export const playStoreUrl =
  "https://play.google.com/store/apps/details?id=com.moayaan.imanvibes";
export const siteDescription =
  "Quranic comfort for every mood. Read Quran by mood, browse Hadith, and reflect on the 99 Names of Allah in a calm, text-first Islamic web app.";

export const siteKeywords = [
  "ImanVibes",
  "Quran by mood",
  "Quran verses",
  "Hadith",
  "99 Names of Allah",
  "Islamic reminders",
  "Muslim web app",
  "Islamic PWA",
  "Quranic comfort",
];

export function getSiteUrl() {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? defaultSiteUrl;
  const normalized = configured.trim().replace(/\/+$/, "");

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  return `https://${normalized}`;
}

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const baseUrl = getSiteUrl();

  if (path === "/") {
    return baseUrl;
  }

  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function withItemParam(path: string, itemId?: string | null) {
  if (!itemId) {
    return path;
  }

  const url = new URL(path, defaultSiteUrl);
  url.searchParams.set("item", itemId);
  return `${url.pathname}${url.search}`;
}

export function summarizeText(text: string, maxLength = 160) {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}
