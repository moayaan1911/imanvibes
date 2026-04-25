import type { StoredLocation } from "@/lib/location";

export type PrayerName = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";

export type PrayerTimes = Record<PrayerName, string>;

export type FullPrayerTimes = PrayerTimes & {
  Sunrise: string;
  Sunset: string;
};

export type HijriDate = {
  day: string;
  month: { en: string; ar: string };
  year: string;
  weekday: { en: string };
};

export const PRAYER_ORDER: PrayerName[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

export const PRAYER_LABELS: Record<PrayerName, string> = {
  Fajr: "Fajr",
  Dhuhr: "Dhuhr",
  Asr: "Asr",
  Maghrib: "Maghrib",
  Isha: "Isha",
};

export function getDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function getAladhanDate(date = new Date()) {
  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
}

export function getTimeParts(time: string) {
  const match = time.match(/(\d{1,2}):(\d{2})/);
  if (!match) {
    return null;
  }

  return {
    hours: Number(match[1]),
    minutes: Number(match[2]),
  };
}

export async function fetchPrayerTimesForDate(
  location: Pick<StoredLocation, "lat" | "lng">,
  date = new Date(),
) {
  const response = await fetch(
    `https://api.aladhan.com/v1/timings/${getAladhanDate(date)}?latitude=${location.lat}&longitude=${location.lng}&method=2`,
  );

  if (!response.ok) {
    throw new Error("Prayer API failed");
  }

  const payload = await response.json();
  const timings = payload.data?.timings;

  if (!timings) {
    throw new Error("Missing timings");
  }

  const prayerTimes: FullPrayerTimes = {
    Fajr: timings.Fajr,
    Sunrise: timings.Sunrise,
    Dhuhr: timings.Dhuhr,
    Asr: timings.Asr,
    Maghrib: timings.Maghrib,
    Sunset: timings.Sunset,
    Isha: timings.Isha,
  };

  return {
    dateKey: getDateKey(date),
    timings: prayerTimes,
    hijri: payload.data?.date?.hijri as HijriDate | undefined,
  };
}
