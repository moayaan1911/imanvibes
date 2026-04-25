"use client";

import { toBlob } from "html-to-image";
import Link from "next/link";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaArrowRight,
  FaLocationArrow,
  FaShareNodes,
  FaRegHand,
} from "react-icons/fa6";
import {
  MdAnchor,
  MdAutoStories,
  MdDiamond,
  MdFavorite,
  MdHourglassEmpty,
  MdMenuBook,
  MdSpa,
  MdTsunami,
  MdWbSunny,
} from "react-icons/md";
import AudioPlayer from "@/components/AudioPlayer";
import { cachePrayerTimesForDate } from "@/lib/android-notifications";
import {
  addStoredLocationListener,
  getStoredLocation,
  isAndroidNativeApp,
  requestAndStoreCurrentLocation,
  type StoredLocation,
} from "@/lib/location";
import { fetchPrayerTimesForDate } from "@/lib/prayer-times";
import { siteDomain } from "@/lib/site";

type PrayerTimes = {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

type DailyVerseData = {
  arabic: string;
  translation: string;
  transliteration?: string;
  source: string;
  href: string;
};

type DashboardMood = {
  label: string;
  href: string;
  icon: "peace" | "anxious" | "grateful" | "hopeful" | "patience" | "tawakkul";
};

type HomeDashboardProps = {
  dailyVerse: DailyVerseData;
  moods: DashboardMood[];
};

type PrayerName = keyof PrayerTimes;

const prayerOrder: PrayerName[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const moodIcons = {
  peace: MdSpa,
  anxious: MdTsunami,
  grateful: MdFavorite,
  hopeful: MdWbSunny,
  patience: MdHourglassEmpty,
  tawakkul: MdAnchor,
} as const;

function getTimeParts(time: string) {
  const match = time.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;

  return {
    hours: Number(match[1]),
    minutes: Number(match[2]),
  };
}

function formatTimeLabel(time: string) {
  const parts = getTimeParts(time);
  if (!parts) return time;

  const value = new Date();
  value.setHours(parts.hours, parts.minutes, 0, 0);

  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(value);
}

function getNextPrayer(times: PrayerTimes, now = new Date()) {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const prayer of prayerOrder) {
    const parts = getTimeParts(times[prayer]);
    if (!parts) continue;

    const prayerMinutes = parts.hours * 60 + parts.minutes;
    if (prayerMinutes > currentMinutes) {
      return {
        name: prayer,
        time: times[prayer],
      };
    }
  }

  return {
    name: "Fajr" as PrayerName,
    time: times.Fajr,
  };
}

function getTimeUntil(time: string, now = new Date()) {
  const parts = getTimeParts(time);
  if (!parts) return "--:--:--";

  const target = new Date(now);
  target.setHours(parts.hours, parts.minutes, 0, 0);

  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  const diff = target.getTime() - now.getTime();
  const totalSeconds = Math.max(0, Math.floor(diff / 1000));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

export default function HomeDashboard({
  dailyVerse,
  moods,
}: HomeDashboardProps) {
  const [loadingPrayerCard, setLoadingPrayerCard] = useState(false);
  const [prayerCardError, setPrayerCardError] = useState<string | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [shareState, setShareState] = useState<
    "idle" | "preparing" | "shared" | "downloaded" | "error"
  >("idle");
  const [storedLocation, setStoredLocation] = useState<StoredLocation | null>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const isAndroidApp = useMemo(() => isAndroidNativeApp(), []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const savedLocation = getStoredLocation();
    if (savedLocation) {
      setStoredLocation(savedLocation);
    }

    return addStoredLocationListener((location) => {
      setStoredLocation(location);
    });
  }, []);

  const loadPrayerTimes = useCallback(async (location: StoredLocation) => {
    setLoadingPrayerCard(true);
    setPrayerCardError(null);

    try {
      const { dateKey, timings } = await fetchPrayerTimesForDate(location);
      cachePrayerTimesForDate(location, dateKey, timings);

      setPrayerTimes({
        Fajr: timings.Fajr,
        Dhuhr: timings.Dhuhr,
        Asr: timings.Asr,
        Maghrib: timings.Maghrib,
        Isha: timings.Isha,
      });
    } catch {
      setPrayerTimes(null);
      setPrayerCardError("Enable Location access to See timings");
    } finally {
      setLoadingPrayerCard(false);
    }
  }, []);

  useEffect(() => {
    if (!storedLocation) {
      return;
    }

    void loadPrayerTimes(storedLocation);
  }, [loadPrayerTimes, storedLocation]);

  const fetchPrayerTimes = useCallback(async () => {
    setLoadingPrayerCard(true);
    setPrayerCardError(null);

    try {
      const location = await requestAndStoreCurrentLocation();
      if (!location) {
        throw new Error("Location unavailable");
      }

      setStoredLocation(location);
      await loadPrayerTimes(location);
    } catch {
      setPrayerTimes(null);
      setPrayerCardError("Enable Location access to See timings");
    } finally {
      setLoadingPrayerCard(false);
    }
  }, [loadPrayerTimes]);

  const nextPrayer = useMemo(() => {
    if (!prayerTimes) return null;
    return getNextPrayer(prayerTimes, now);
  }, [now, prayerTimes]);
  const featuredMoods = useMemo(() => moods.slice(0, 5), [moods]);

  async function createDailyVerseImageAsset() {
    if (!shareCardRef.current) {
      throw new Error("Share card missing");
    }

    const blob = await toBlob(shareCardRef.current, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: "#fffdf8",
    });

    if (!blob) {
      throw new Error("Image generation failed");
    }

    return {
      blob,
      file: new File([blob], "daily-verse-home.png", {
        type: "image/png",
      }),
    };
  }

  async function blobToBase64(blob: Blob) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        if (typeof reader.result !== "string") {
          reject(new Error("Could not convert image"));
          return;
        }

        const [, base64 = ""] = reader.result.split(",");
        resolve(base64);
      };

      reader.onerror = () => reject(reader.error ?? new Error("Could not convert image"));
      reader.readAsDataURL(blob);
    });
  }

  function downloadImage(blob: Blob, filename: string) {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(blobUrl);
  }

  async function handleShareDailyVerse() {
    setShareState("preparing");

    try {
      const { blob, file } = await createDailyVerseImageAsset();

      if (isAndroidApp) {
        const base64Data = await blobToBase64(blob);
        const path = "shares/daily-verse-home.png";
        const saved = await Filesystem.writeFile({
          path,
          data: base64Data,
          directory: Directory.Cache,
          recursive: true,
        });

        await Share.share({
          files: [saved.uri],
          dialogTitle: "Share image from ImanVibes",
        });

        setShareState("shared");
        window.setTimeout(() => setShareState("idle"), 1400);
        return;
      }

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
        });

        setShareState("shared");
        window.setTimeout(() => setShareState("idle"), 1400);
        return;
      }

      downloadImage(blob, file.name);
      setShareState("downloaded");
      window.setTimeout(() => setShareState("idle"), 1400);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setShareState("idle");
        return;
      }

      setShareState("error");
      window.setTimeout(() => setShareState("idle"), 1400);
    }
  }

  return (
    <div className="pb-10">
      <section
        className="relative mt-6 min-h-[220px] overflow-hidden rounded-[28px] bg-[#f3ede4] p-6 text-[#2f342f]"
        style={{
          backgroundImage:
            "linear-gradient(to right bottom, rgba(237, 231, 223, 0.92), rgba(243, 237, 228, 0.92)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuAzefQMOqz0SOjlFykAoyMhM-M0fUyqEDNznlVIaWY9AUuZ7VB6aofv8jqOGEVH7SoRmyyojrSRz2lkVYLh8DXhSlUzFR34HTHpAGqBkPU3BNbWGsuOkh7_YBsNa1Df6r7t734K8t34HaLns8yFWdrqbBL0i44V0G6Jx_O1INrA_NKrUnNjjujBj9SzJc1e6hHQlbJfxp5VGbvoG0Ok5MDizKZwEpaXEoSedfgQNKBSmllb51F3VW9SlFbg5DUOmrDB0P73cN5YPm0')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#4d6556]">
              {prayerTimes ? "Next Prayer" : "Prayer Times"}
            </span>
            <h2 className="mt-1 text-[3rem] leading-none tracking-[-0.05em] text-[#2f342f] [font-family:var(--font-display)]">
              {prayerTimes && nextPrayer ? nextPrayer.name : "Disabled"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {prayerTimes && nextPrayer ? (
              <div className="whitespace-nowrap rounded-full bg-[rgba(68,99,81,0.1)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4d6556]">
                {formatTimeLabel(nextPrayer.time)}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => void fetchPrayerTimes()}
              disabled={loadingPrayerCard}
              aria-label="Fetch location for prayer timings"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-[#6f8f7b] text-white shadow-[0_10px_24px_rgba(111,143,123,0.28)] transition-colors hover:bg-[#4d6556] disabled:opacity-60"
            >
              <FaLocationArrow className="text-[1.15rem]" />
            </button>
          </div>
        </div>

        <div className="relative z-10 mt-8 rounded-[20px] border border-white/30 bg-[rgba(255,249,239,0.68)] p-4 text-[#2f342f] backdrop-blur-[16px]">
          {prayerTimes && nextPrayer ? (
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-medium text-[#566056]">
                  Remaining Time
                </span>
                <div className="mt-1 text-[1.55rem] tracking-[-0.04em] text-[#4d6556] [font-family:var(--font-display)]">
                  {getTimeUntil(nextPrayer.time, now)}
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-[rgba(68,99,81,0.18)] border-t-[#6f8f7b]">
                <span className="text-[#6f8f7b]">⌛</span>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-[#2f342f]">
                Enable Location access to See timings
              </p>
              <p className="mt-2 text-sm leading-6 text-[#566056]">
                Tap the location icon to fetch your live prayer times.
              </p>
              {loadingPrayerCard ? (
                <p className="mt-3 text-xs font-medium text-[#4d6556]">
                  Fetching location...
                </p>
              ) : null}
              {prayerCardError ? (
                <p className="mt-3 text-xs font-medium text-red-500">
                  {prayerCardError}
                </p>
              ) : null}
            </div>
          )}
        </div>

        <Link
          href="/prayer"
          className="relative z-10 mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#4d6556] transition-colors hover:text-[#2f342f]"
        >
          Go To Prayer
          <FaArrowRight className="text-xs" />
        </Link>
      </section>

      <section className="mt-6 grid grid-cols-4 gap-4">
        <Link href="/quran" className="flex flex-col items-center gap-3">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--sage-700)] shadow-sm transition-all hover:bg-[var(--sage-200)]">
            <MdMenuBook className="text-[1.7rem]" />
          </span>
          <span className="text-[11px] font-medium text-[var(--ink-700)]">Quran</span>
        </Link>
        <Link href="/hadith" className="flex flex-col items-center gap-3">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--sage-700)] shadow-sm transition-all hover:bg-[var(--sage-200)]">
            <MdAutoStories className="text-[1.7rem]" />
          </span>
          <span className="text-[11px] font-medium text-[var(--ink-700)]">Hadith</span>
        </Link>
        <Link href="/names" className="flex flex-col items-center gap-3">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--sage-700)] shadow-sm transition-all hover:bg-[var(--sage-200)]">
            <MdDiamond className="text-[1.7rem]" />
          </span>
          <span className="text-[11px] font-medium text-[var(--ink-700)]">Names</span>
        </Link>
        <Link href="/duas" className="flex flex-col items-center gap-3">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--sage-700)] shadow-sm transition-all hover:bg-[var(--sage-200)]">
            <FaRegHand className="text-[1.35rem]" />
          </span>
          <span className="text-[11px] font-medium text-[var(--ink-700)]">Duas</span>
        </Link>
      </section>

      <section className="mt-8">
        <h3 className="max-w-[16rem] text-[1.6rem] leading-[1.15] tracking-[-0.03em] text-[var(--ink-900)] [font-family:var(--font-display)]">
          How is your heart today?
        </h3>

        <div className="mt-4 flex flex-wrap gap-3">
          {featuredMoods.map((mood) => {
            const Icon = moodIcons[mood.icon];
            return (
              <Link
                key={mood.href}
                href={mood.href}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--surface-line)] bg-[var(--surface-strong)] px-5 py-2.5 text-sm text-[var(--ink-700)] transition-colors hover:border-[var(--sage-500)] hover:bg-[var(--sage-500)] hover:text-white"
              >
                <Icon className="text-sm" />
                {mood.label}
              </Link>
            );
          })}

          <Link
            href="/quran"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--sage-200)] bg-[var(--surface-soft)] px-5 py-2.5 text-sm font-medium text-[var(--sage-700)] transition-colors hover:border-[var(--sage-500)] hover:bg-[var(--sage-500)] hover:text-white"
          >
            Show More Moods
            <FaArrowRight className="text-xs" />
          </Link>
        </div>
      </section>

      <section className="relative mt-8 overflow-hidden rounded-[24px] border border-[var(--surface-line)] bg-[var(--surface-soft)] p-6">
        <div className="absolute right-0 top-0 p-4 opacity-10">
          <MdAutoStories className="text-[4rem]" />
        </div>
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-[var(--sage-500)]">✦</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--sage-700)]">
            Daily Verse
          </span>
        </div>

        <div
          dir="rtl"
          lang="ar"
          className="mb-2 text-right text-[2rem] leading-[1.8] text-[var(--ink-900)] [font-family:var(--font-arabic)]"
        >
          {dailyVerse.arabic}
        </div>

        {dailyVerse.transliteration ? (
          <div className="mb-6 text-right text-sm text-[var(--ink-700)]" dir="ltr">
            {dailyVerse.transliteration}
          </div>
        ) : null}

        <p className="mb-4 border-l-2 border-[rgba(68,99,81,0.3)] pl-4 text-[1.05rem] italic leading-7 text-[var(--ink-700)]">
          “{dailyVerse.translation}”
        </p>

        <div className="mt-6 flex items-center justify-between border-t border-[var(--surface-line)] pt-4">
          <span className="text-[11px] font-medium text-[var(--ink-700)]">
            {dailyVerse.source}
          </span>
          <div className="flex items-center gap-2">
            <div className="origin-center scale-[0.72]">
              <AudioPlayer arabicText={dailyVerse.arabic} variant="icon" />
            </div>
            <button
              type="button"
              onClick={() => void handleShareDailyVerse()}
              aria-label={
                shareState === "preparing"
                  ? "Preparing daily verse image"
                  : shareState === "shared"
                    ? "Daily verse image shared"
                    : shareState === "downloaded"
                      ? "Daily verse image downloaded"
                      : shareState === "error"
                        ? "Daily verse image share failed"
                        : "Share daily verse image"
              }
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-strong)] text-[var(--ink-700)] transition-colors hover:bg-[rgba(68,99,81,0.1)] hover:text-[var(--sage-700)]"
            >
              <FaShareNodes className="text-sm" />
            </button>
          </div>
        </div>
      </section>

      <div className="pointer-events-none fixed left-[-9999px] top-0 w-[720px]">
        <div
          ref={shareCardRef}
          className="rounded-[38px] border border-[#f1e5c8] bg-[#fffdf8] p-8 shadow-[0_24px_60px_rgba(77,101,86,0.08)]"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6f8f7b]">
              ImanVibes
            </p>
            <p className="mt-2 text-sm text-[#566056]">Daily Verse</p>
          </div>

          <div className="mt-6 rounded-[30px] border border-[rgba(111,143,123,0.12)] bg-white p-8 shadow-[0_10px_24px_rgba(111,143,123,0.06)]">
            <p
              dir="rtl"
              lang="ar"
              className="text-right text-[3rem] leading-[1.9] text-[#2f342f] [font-family:var(--font-arabic)]"
            >
              {dailyVerse.arabic}
            </p>

            {dailyVerse.transliteration ? (
              <p className="mt-6 text-lg text-[#566056]">{dailyVerse.transliteration}</p>
            ) : null}

            <p className="mt-6 text-[1.65rem] leading-[1.7] text-[#2f342f]">
              {dailyVerse.translation}
            </p>

            <p className="mt-6 text-lg font-medium text-[#6f8f7b]">
              {dailyVerse.source}
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <p className="text-right text-xs leading-5 text-[#566056]">
              {siteDomain}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
