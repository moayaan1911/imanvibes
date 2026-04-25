"use client";

import Link from "next/link";
import AppBrandRow from "@/components/AppBrandRow";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaCheck,
  FaCloudMoon,
  FaCloudSun,
  FaLocationArrow,
  FaMoon,
  FaSun,
} from "react-icons/fa6";
import {
  cachePrayerTimesForDate,
  getPrayerNotificationPreferences,
  syncPrayerNotifications,
} from "@/lib/android-notifications";
import {
  addStoredLocationListener,
  formatLocationLabel,
  getStoredLocation,
  requestAndStoreCurrentLocation,
  type StoredLocation,
} from "@/lib/location";
import { fetchPrayerTimesForDate } from "@/lib/prayer-times";

const MECCA_LAT = 21.4225;
const MECCA_LNG = 39.8262;
const PRAYER_COMPLETION_KEY = "imanvibes-prayers";

export type PrayerTimes = {
  Fajr: string;
  Sunrise: string;
  Sunset: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

type HijriDate = {
  day: string;
  month: { en: string; ar: string };
  year: string;
  weekday: { en: string };
};

type PrayerName = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";

const PRAYER_ORDER: PrayerName[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

type PrayerCompletion = {
  completedAt: string | null;
  legacyCompleted?: boolean;
};

export type DailyPrayers = Record<PrayerName, PrayerCompletion>;

export type PrayerHistory = Record<string, DailyPrayers>;

type ScheduleStatus =
  | "upcoming"
  | "now"
  | "completed"
  | "completed_qaza"
  | "qaza"
  | "missed";

function createEmptyDailyPrayers(): DailyPrayers {
  return {
    Fajr: { completedAt: null },
    Dhuhr: { completedAt: null },
    Asr: { completedAt: null },
    Maghrib: { completedAt: null },
    Isha: { completedAt: null },
  };
}

function normalizePrayerCompletion(value: unknown): PrayerCompletion {
  if (value === true) {
    return { completedAt: null, legacyCompleted: true };
  }

  if (!value || typeof value !== "object") {
    return { completedAt: null };
  }

  const parsed = value as Partial<PrayerCompletion>;
  const completedAt = typeof parsed.completedAt === "string" ? parsed.completedAt : null;

  return {
    completedAt,
    legacyCompleted: parsed.legacyCompleted === true,
  };
}

function normalizePrayerHistory(value: unknown): PrayerHistory {
  if (!value || typeof value !== "object") {
    return {};
  }

  const entries = Object.entries(value as Record<string, unknown>);

  return Object.fromEntries(
    entries.map(([dateKey, dailyValue]) => {
      const parsedDaily =
        dailyValue && typeof dailyValue === "object"
          ? (dailyValue as Partial<Record<PrayerName, unknown>>)
          : {};

      return [
        dateKey,
        {
          Fajr: normalizePrayerCompletion(parsedDaily.Fajr),
          Dhuhr: normalizePrayerCompletion(parsedDaily.Dhuhr),
          Asr: normalizePrayerCompletion(parsedDaily.Asr),
          Maghrib: normalizePrayerCompletion(parsedDaily.Maghrib),
          Isha: normalizePrayerCompletion(parsedDaily.Isha),
        } satisfies DailyPrayers,
      ];
    }),
  );
}

function isPrayerCompleted(prayer: PrayerCompletion) {
  return prayer.legacyCompleted === true || prayer.completedAt !== null;
}

function calculateQiblaBearing(lat: number, lng: number): number {
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const meccaLatRad = (MECCA_LAT * Math.PI) / 180;
  const meccaLngRad = (MECCA_LNG * Math.PI) / 180;

  const dLng = meccaLngRad - lngRad;

  const y = Math.sin(dLng);
  const x =
    Math.cos(latRad) * Math.tan(meccaLatRad) -
    Math.sin(latRad) * Math.cos(dLng);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  bearing = (bearing + 360) % 360;

  return bearing;
}

function normalizeDegrees(value: number): number {
  return (value % 360 + 360) % 360;
}

function getDirectionLabel(bearing: number): string {
  if (bearing >= 337.5 || bearing < 22.5) return "North";
  if (bearing < 67.5) return "Northeast";
  if (bearing < 112.5) return "East";
  if (bearing < 157.5) return "Southeast";
  if (bearing < 202.5) return "South";
  if (bearing < 247.5) return "Southwest";
  if (bearing < 292.5) return "West";
  return "Northwest";
}

function getTurnDelta(currentHeading: number, targetHeading: number): number {
  return ((targetHeading - currentHeading + 540) % 360) - 180;
}

function getTimeParts(time: string) {
  const match = time.match(/(\d{1,2}):(\d{2})/);
  if (!match) {
    return null;
  }

  return {
    hours: Number(match[1]),
    minutes: Number(match[2]),
  };
}

function getNextPrayer(times: PrayerTimes, now = new Date()): { name: PrayerName; time: string } {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const prayerOrder = PRAYER_ORDER.map((name) => ({ name, time: times[name] }));

  for (const prayer of prayerOrder) {
    const parts = getTimeParts(prayer.time);
    if (!parts) {
      continue;
    }
    const prayerMinutes = parts.hours * 60 + parts.minutes;
    if (prayerMinutes > currentMinutes) {
      return prayer;
    }
  }

  return prayerOrder[0];
}

function getMinutesFromTime(time: string) {
  const parts = getTimeParts(time);
  if (!parts) {
    return null;
  }

  return parts.hours * 60 + parts.minutes;
}

function getPrayerWindowEndTime(name: PrayerName, times: PrayerTimes) {
  switch (name) {
    case "Fajr":
      return times.Sunrise;
    case "Dhuhr":
      return times.Asr;
    case "Asr":
      return times.Maghrib;
    case "Maghrib":
      return times.Isha;
    case "Isha":
      return null;
  }
}

function getPrayerWindowEndMinutes(name: PrayerName, times: PrayerTimes) {
  const endTime = getPrayerWindowEndTime(name, times);
  return endTime ? getMinutesFromTime(endTime) : null;
}

function getDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getMostRecentOverduePrayer(
  times: PrayerTimes,
  prayers: DailyPrayers,
  now = new Date(),
): PrayerName | null {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const overdue = PRAYER_ORDER.filter((name) => {
    if (isPrayerCompleted(prayers[name])) {
      return false;
    }

    const endMinutes = getPrayerWindowEndMinutes(name, times);
    return endMinutes !== null && currentMinutes >= endMinutes;
  });

  return overdue.length > 0 ? overdue[overdue.length - 1] : null;
}

function didCompleteInQaza(
  name: PrayerName,
  completion: PrayerCompletion,
  times: PrayerTimes,
  today = new Date(),
) {
  if (completion.legacyCompleted || !completion.completedAt) {
    return false;
  }

  const completedAt = new Date(completion.completedAt);
  if (Number.isNaN(completedAt.getTime())) {
    return false;
  }

  const endTime = getPrayerWindowEndTime(name, times);
  if (!endTime) {
    return false;
  }

  const parts = getTimeParts(endTime);
  if (!parts) {
    return false;
  }

  const cutoff = new Date(today);
  cutoff.setHours(parts.hours, parts.minutes, 0, 0);

  return completedAt >= cutoff;
}

function getPrayerScheduleStatus(
  name: PrayerName,
  times: PrayerTimes,
  prayers: DailyPrayers,
  now = new Date(),
  latestOverduePrayer: PrayerName | null,
): ScheduleStatus {
  const completion = prayers[name];

  if (isPrayerCompleted(completion)) {
    return didCompleteInQaza(name, completion, times, now)
      ? "completed_qaza"
      : "completed";
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = getMinutesFromTime(times[name]);
  const endMinutes = getPrayerWindowEndMinutes(name, times);

  if (
    startMinutes !== null &&
    currentMinutes >= startMinutes &&
    (endMinutes === null || currentMinutes < endMinutes)
  ) {
    return "now";
  }

  if (latestOverduePrayer === name) {
    return "qaza";
  }

  if (endMinutes !== null && currentMinutes >= endMinutes) {
    return "missed";
  }

  return "upcoming";
}

function getTimeUntilDetailed(time: string, now = new Date()): string {
  const parts = getTimeParts(time);
  if (!parts) {
    return "--";
  }
  const target = new Date(now);
  target.setHours(parts.hours, parts.minutes, 0, 0);

  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  const diff = target.getTime() - now.getTime();
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

function getMoonPhaseEmoji(day: number): string {
  if (day <= 3) return "🌑";
  if (day <= 7) return "🌒";
  if (day <= 10) return "🌓";
  if (day <= 14) return "🌔";
  if (day <= 17) return "🌕";
  if (day <= 21) return "🌖";
  if (day <= 24) return "🌗";
  if (day <= 27) return "🌘";
  return "🌑";
}

function getMoonPhaseName(day: number): string {
  if (day <= 3) return "New Moon";
  if (day <= 7) return "Waxing Crescent";
  if (day <= 10) return "First Quarter";
  if (day <= 14) return "Waxing Gibbous";
  if (day <= 17) return "Full Moon";
  if (day <= 21) return "Waning Gibbous";
  if (day <= 24) return "Last Quarter";
  if (day <= 27) return "Waning Crescent";
  return "New Moon";
}

function getStoredPrayers(): PrayerHistory {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(PRAYER_COMPLETION_KEY);
    if (!stored) return {};
    return normalizePrayerHistory(JSON.parse(stored));
  } catch {
    return {};
  }
}

function storePrayers(history: PrayerHistory) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PRAYER_COMPLETION_KEY, JSON.stringify(history));
  } catch {}
}

function getLast7Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(getDateKey(d));
  }
  return days;
}

function formatDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const isToday = dateKey === getDateKey();

  if (isToday) return "Today";

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return `${days[date.getDay()]} ${day}`;
}

function formatPrayerTimeLabel(time: string): string {
  const parts = getTimeParts(time);
  if (!parts) return time;

  const value = new Date();
  value.setHours(parts.hours, parts.minutes, 0, 0);

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(value);
}

function getReadableLocationLabel(
  label: string | null,
  location: { lat: number; lng: number } | null,
) {
  if (label) return label;
  if (!location) return "Tap to fetch location";
  return `${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}`;
}

function getScheduleStatusLabel(status: ScheduleStatus) {
  switch (status) {
    case "now":
      return "Now";
    case "completed":
      return "Completed";
    case "completed_qaza":
      return "Completed in Qaza";
    case "qaza":
      return "Qaza";
    case "missed":
      return "Missed";
    case "upcoming":
      return null;
  }
}

function getScheduleRowClassName(status: ScheduleStatus) {
  switch (status) {
    case "now":
      return "border-transparent bg-[var(--sage-200)] text-[var(--ink-900)] shadow-lg shadow-[rgba(111,143,123,0.15)]";
    case "completed":
      return "border-[rgba(111,143,123,0.16)] bg-[var(--surface-strong)] text-[var(--ink-900)] shadow-sm";
    case "completed_qaza":
      return "border-[rgba(198,170,107,0.3)] bg-[rgba(232,216,173,0.18)] text-[var(--ink-900)] shadow-sm";
    case "qaza":
      return "border-[rgba(198,170,107,0.42)] bg-[rgba(232,216,173,0.26)] text-[var(--ink-900)] shadow-sm";
    case "missed":
      return "border-[rgba(198,170,107,0.22)] bg-[var(--surface-strong)] text-[var(--ink-700)] opacity-75";
    case "upcoming":
      return "border-[rgba(194,200,193,0.35)] bg-[var(--surface-solid)] text-[var(--ink-900)] shadow-sm";
  }
}

function getScheduleStatusPillClassName(status: ScheduleStatus) {
  switch (status) {
    case "now":
      return "bg-white/30 text-[var(--sage-700)]";
    case "completed":
      return "bg-[var(--sage-100)] text-[var(--sage-700)]";
    case "completed_qaza":
      return "bg-[rgba(198,170,107,0.2)] text-[var(--gold-400)]";
    case "qaza":
      return "bg-[rgba(198,170,107,0.26)] text-[var(--gold-400)]";
    case "missed":
      return "bg-[rgba(198,170,107,0.16)] text-[var(--gold-400)]";
    case "upcoming":
      return "";
  }
}

export default function PrayerPage() {
  const [location, setLocation] = useState<StoredLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [headingSupported, setHeadingSupported] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [prayerHistory, setPrayerHistory] = useState<PrayerHistory>(() => getStoredPrayers());
  const todayKey = useMemo(() => getDateKey(now), [now]);

  const requestLocation = useCallback(async () => {
    setLoading(true);
    setLocationError(null);

    try {
      const loc = await requestAndStoreCurrentLocation();
      setLocation(loc);
      setLocationLabel(formatLocationLabel(loc));
    } catch {
      setLocationError("Could not get location. Please enable GPS.");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const removeLocationListener = addStoredLocationListener((nextLocation) => {
      setLocation(nextLocation);
      setLocationLabel(formatLocationLabel(nextLocation));
    });

    const frame = window.requestAnimationFrame(() => {
      const storedLocation = getStoredLocation();
      if (storedLocation) {
        setLocation(storedLocation);
        setLocationLabel(formatLocationLabel(storedLocation));
      }
    });

    return () => {
      window.cancelAnimationFrame(frame);
      removeLocationListener();
    };
  }, []);

  useEffect(() => {
    if (!location) return;
    const currentLocation = location;
    const [year, month, day] = todayKey.split("-").map(Number);
    const currentDate = new Date(year, month - 1, day);

    async function fetchData() {
      try {
        const { dateKey, timings, hijri } =
          await fetchPrayerTimesForDate(currentLocation, currentDate);
        setPrayerTimes(timings);
        cachePrayerTimesForDate(currentLocation, dateKey, timings);

        if (hijri) {
          setHijriDate(hijri);
        }
      } catch {}
    }

    fetchData();
  }, [location, todayKey]);

  useEffect(() => {
    if (!location) {
      return;
    }

    let cancelled = false;

    async function syncSelectedPrayerNotifications() {
      try {
        if (cancelled || !location) {
          return;
        }

        await syncPrayerNotifications(
          location,
          getPrayerNotificationPreferences(),
        );
      } catch {}
    }

    void syncSelectedPrayerNotifications();

    return () => {
      cancelled = true;
    };
  }, [location]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    type DeviceOrientationEventWithWebkit = DeviceOrientationEvent & {
      webkitCompassHeading?: number;
    };

    const updateHeading = (event: DeviceOrientationEventWithWebkit) => {
      let nextHeading: number | null = null;

      if (typeof event.webkitCompassHeading === "number") {
        nextHeading = event.webkitCompassHeading;
      } else if (typeof event.alpha === "number") {
        nextHeading = 360 - event.alpha;
      }

      if (nextHeading === null || Number.isNaN(nextHeading)) {
        return;
      }

      setHeadingSupported(true);
      setDeviceHeading(normalizeDegrees(nextHeading));
    };

    const eventName = "ondeviceorientationabsolute" in window
      ? "deviceorientationabsolute"
      : "deviceorientation";

    window.addEventListener(eventName, updateHeading as EventListener, true);

    return () => {
      window.removeEventListener(eventName, updateHeading as EventListener, true);
    };
  }, []);

  const qiblaBearing = useMemo(() => {
    if (!location) return null;
    return calculateQiblaBearing(location.lat, location.lng);
  }, [location]);

  const nextPrayer = useMemo(() => {
    if (!prayerTimes) return null;
    return getNextPrayer(prayerTimes, now);
  }, [now, prayerTimes]);

  const qiblaTurnDelta = useMemo(() => {
    if (qiblaBearing === null || deviceHeading === null) return null;
    return getTurnDelta(deviceHeading, qiblaBearing);
  }, [deviceHeading, qiblaBearing]);

  const isQiblaAligned = qiblaTurnDelta !== null && Math.abs(qiblaTurnDelta) <= 10;

  const prayerGridEntries = useMemo(() => {
    if (!prayerTimes) return [];
    return PRAYER_ORDER.map((name) => ({ name, time: prayerTimes[name] }));
  }, [prayerTimes]);

  const todayPrayers = useMemo(() => {
    return prayerHistory[todayKey] || createEmptyDailyPrayers();
  }, [prayerHistory, todayKey]);

  const completedCount = useMemo(
    () => PRAYER_ORDER.filter((name) => isPrayerCompleted(todayPrayers[name])).length,
    [todayPrayers],
  );

  const scheduleEntries = useMemo(() => {
    if (!prayerTimes) return [];

    const latestOverduePrayer = getMostRecentOverduePrayer(prayerTimes, todayPrayers, now);

    return ([
      { name: "Fajr", time: prayerTimes.Fajr, icon: FaCloudMoon },
      { name: "Dhuhr", time: prayerTimes.Dhuhr, icon: FaSun },
      { name: "Asr", time: prayerTimes.Asr, icon: FaCloudSun },
      { name: "Maghrib", time: prayerTimes.Maghrib, icon: FaMoon },
      { name: "Isha", time: prayerTimes.Isha, icon: FaMoon },
    ] as const).map((entry) => ({
      ...entry,
      status: getPrayerScheduleStatus(
        entry.name,
        prayerTimes,
        todayPrayers,
        now,
        latestOverduePrayer,
      ),
    }));
  }, [now, prayerTimes, todayPrayers]);

  function togglePrayer(prayerName: PrayerName) {
    const current = prayerHistory[todayKey] || createEmptyDailyPrayers();
    const nextCompleted = !isPrayerCompleted(current[prayerName]);

    const updated = {
      ...prayerHistory,
      [todayKey]: {
        ...current,
        [prayerName]: nextCompleted
          ? { completedAt: new Date().toISOString() }
          : { completedAt: null },
      },
    };

    setPrayerHistory(updated);
    storePrayers(updated);
  }

  return (
    <div className="page-bg relative min-h-screen overflow-x-hidden">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-5 pb-24">
        <AppBrandRow showBackButton />

        <div className="space-y-10 pt-6">
          <section className="space-y-1 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-700)]">
              {hijriDate
                ? `${hijriDate.day} ${hijriDate.month.en} ${hijriDate.year}`
                : location
                  ? "Fetching date..."
                  : "Location needed"}
            </p>
            <div className="flex items-center justify-center gap-2">
              <h2 className="font-display text-[1.7rem] tracking-[-0.03em] text-[var(--ink-900)]">
                {getReadableLocationLabel(locationLabel, location)}
              </h2>
              <button
                type="button"
                onClick={() => void requestLocation()}
                disabled={loading}
                className="flex h-12 w-12 items-center justify-center rounded-full text-[var(--sage-700)] transition-colors hover:bg-[var(--surface-strong)] disabled:opacity-55"
                aria-label="Fetch latest location"
              >
                <FaLocationArrow className="text-[1.05rem]" />
              </button>
            </div>
            <p className="text-[10px] leading-4 text-[var(--ink-700)]">
              Saved location is used for prayer times.
            </p>
            {locationError ? (
              <p className="text-[10px] leading-4 text-red-500">{locationError}</p>
            ) : null}
          </section>

          <section className="relative overflow-hidden rounded-[32px] bg-[var(--sand-100)] px-8 py-8 text-center shadow-sm">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--sage-500)]/10 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[var(--gold-200)]/40 blur-3xl" />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <span className="rounded-full bg-[var(--sage-500)]/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--sage-700)]">
                {nextPrayer ? `Next: ${nextPrayer.name}` : "Loading prayer times"}
              </span>
              <h1 className="font-display text-[3.05rem] leading-none tracking-[-0.05em] text-[var(--ink-900)]">
                {nextPrayer ? getTimeUntilDetailed(nextPrayer.time, now) : "--:--:--"}
              </h1>
            </div>
          </section>

          <section className="rounded-[24px] border border-[var(--surface-line)] bg-[var(--surface-solid)] px-5 py-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-900)]">
                Daily Tracker
              </h3>
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--sage-700)]">
                {completedCount}/5 Completed
              </span>
            </div>
            <div className="flex items-center justify-between px-1">
              {prayerGridEntries.map(({ name }, index) => {
                const isCompleted = isPrayerCompleted(todayPrayers[name]);

                return (
                  <div key={name} className="flex items-center">
                    <div className="flex flex-col items-center gap-2">
                      <button
                        type="button"
                        onClick={() => togglePrayer(name)}
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] transition-colors ${
                          isCompleted
                            ? "border-[var(--sage-500)] bg-[var(--sage-500)] text-white"
                            : "border-[var(--surface-line)] text-[var(--ink-700)] hover:bg-[var(--sand-100)]"
                        }`}
                      >
                        {isCompleted ? <FaCheck className="text-sm" /> : null}
                      </button>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-900)]">
                        {name}
                      </span>
                    </div>
                    {index < prayerGridEntries.length - 1 ? (
                      <span className="mx-2 mt-[-18px] h-px w-4 bg-[var(--surface-line)]" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="pl-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-700)]">
              Schedule
            </h3>
            <div className="flex flex-col gap-3">
              {scheduleEntries.map(({ name, time, icon: Icon, status }) => {
                const statusLabel = getScheduleStatusLabel(status);
                const rowClassName = getScheduleRowClassName(status);
                const pillClassName = getScheduleStatusPillClassName(status);

                return (
                  <div
                    key={name}
                    className={`flex items-center justify-between rounded-[20px] border px-4 py-4 transition-colors ${rowClassName}`}
                  >
                    <div className="flex items-center gap-4">
                      <Icon
                        className={`text-base ${
                          status === "now"
                            ? "text-[var(--sage-700)]"
                            : status === "qaza" || status === "completed_qaza" || status === "missed"
                              ? "text-[var(--gold-400)]"
                              : "text-[var(--ink-700)]"
                        }`}
                      />
                      <span className="text-[1.05rem] text-current">
                        {name}
                      </span>
                    </div>
                    <div className="flex min-w-[8.75rem] flex-col items-end gap-1 text-right">
                      {statusLabel ? (
                        <span
                          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${pillClassName}`}
                        >
                          {statusLabel}
                        </span>
                      ) : null}
                      <span className="font-display text-[1.35rem] leading-none tracking-[-0.03em] text-current">
                        {formatPrayerTimeLabel(time)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4">
            <div
              aria-disabled="true"
              className="cursor-not-allowed overflow-hidden rounded-[24px] border border-[rgba(194,200,193,0.35)] bg-[var(--surface-solid)] opacity-70 shadow-sm"
            >
              <div className="relative h-32 w-full overflow-hidden bg-stone-100">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBw-y3wdi2POEX2ncunPlD6qlf5hP3etH3iJC20URsf-T6kEQjw5NNsaxqZn4bfGwsUJzbXtexzKhP_VyToTkAA6ZtBS8Bz-QfCvkKQcRU23fz6vDcr4b_7cmf6H6r8ZYEWskDgtiOLYUzhac6erzHrF4-ECYtiKLWBZUbFe2tmGbz3w2WQp0Czc5ANWQLsCFv2ek40n5eSfWzYY2CGNxs4oK9bXA0atm7_rUmrl_952Duq4GIL4t_YX1Xy5vzSfWUyhiDxltM-5II"
                  alt="Qibla Compass"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[rgba(255,249,239,0.34)] backdrop-blur-[1.5px]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="rounded-full bg-[rgba(255,255,255,0.94)] px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[var(--sage-500)] shadow-[0_10px_30px_-20px_rgba(0,0,0,0.45)]">
                    Coming Soon
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1 py-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-900)]">
                  Qibla
                </span>
                <span className="text-[10px] font-medium text-[var(--ink-700)]">
                  Find Direction
                </span>
              </div>
            </div>
            <Link
              href="/prayer/tasbih"
              className="overflow-hidden rounded-[24px] border border-[rgba(194,200,193,0.35)] bg-[var(--surface-solid)] shadow-sm transition-all hover:shadow-md"
            >
              <div className="h-32 w-full overflow-hidden bg-stone-100">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4HNvRGuHRaotObwKHFYRtu2TtwLLWvRcSNmzG1n579U2IhldriiwPRSwsCOCP2xkvy8FxjP0vFT1hOjJbZ4KoYuZWP7b2lbEQsPRRr9KG5nYXS9lP_3LLn5A7imNNGf6ymANR1BgS9GdPLCK9Qm001-xotuiZMVD4bdWJNuOw6ZEt_dEC-NEW0LxuOOeTV6I47NcrI34mXp8zP06lkXr0Nl6JU90VdaTkBlDMDj0newNyYR4gX1S8XZityYsHU_X5f_fJdrikVjQ"
                  alt="Tasbih Beads"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="flex flex-col items-center gap-1 py-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-900)]">
                  Tasbih
                </span>
                <span className="text-[10px] font-medium text-[var(--ink-700)]">
                  Digital Counter
                </span>
              </div>
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}
