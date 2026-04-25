import { LocalNotifications } from "@capacitor/local-notifications";
import { getDailyVerse } from "@/lib/content";
import type { StoredLocation } from "@/lib/location";
import {
  PRAYER_LABELS,
  PRAYER_ORDER,
  fetchPrayerTimesForDate,
  getDateKey,
  getTimeParts,
  type PrayerName,
  type PrayerTimes,
} from "@/lib/prayer-times";

export const REMINDER_SETUP_KEY = "android-reminders-setup-v1";
export const PRAYER_NOTIFICATION_PREFS_KEY = "imanvibes-prayer-notifications-v2";
export const PRAYER_TIMINGS_CACHE_KEY = "imanvibes-prayer-timings-cache-v1";

const MORNING_NOTIFICATION_ID = 4101;
const EVENING_NOTIFICATION_ID = 4102;
const DAILY_VERSE_NOTIFICATION_ID = 4103;
const REMINDER_CHANNEL_ID = "daily-reflection";
const PRAYER_NOTIFICATION_CHANNEL_ID = "prayer-times";
const PRAYER_NOTIFICATION_BASE_ID = 5200;
const PRAYER_NOTIFICATION_DAYS = 7;
const DAILY_REMINDER_IDS = [
  MORNING_NOTIFICATION_ID,
  EVENING_NOTIFICATION_ID,
  DAILY_VERSE_NOTIFICATION_ID,
] as const;
const PRAYER_NOTIFICATION_COPY: Record<PrayerName, { title: string; body: string }> = {
  Fajr: {
    title: "Fajr time",
    body: "It is time for Fajr. Begin the day with prayer and calm.",
  },
  Dhuhr: {
    title: "Dhuhr time",
    body: "It is time for Dhuhr. Step away for a few quiet minutes of prayer.",
  },
  Asr: {
    title: "Asr time",
    body: "It is time for Asr. Return to prayer before the day slips away.",
  },
  Maghrib: {
    title: "Maghrib time",
    body: "It is time for Maghrib. Let the evening begin with prayer.",
  },
  Isha: {
    title: "Isha time",
    body: "It is time for Isha. End the night with prayer and reflection.",
  },
};

export type PrayerNotificationPreferences = Record<PrayerName, boolean>;

type PrayerTimingsCache = {
  location: {
    lat: number;
    lng: number;
  };
  days: Record<string, PrayerTimes>;
  updatedAt: string;
};

export function getDefaultPrayerNotificationPreferences(): PrayerNotificationPreferences {
  return {
    Fajr: true,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true,
  };
}

export function getPrayerNotificationPreferences(): PrayerNotificationPreferences {
  if (typeof window === "undefined") {
    return getDefaultPrayerNotificationPreferences();
  }

  try {
    const stored = localStorage.getItem(PRAYER_NOTIFICATION_PREFS_KEY);
    if (!stored) {
      return getDefaultPrayerNotificationPreferences();
    }

    const parsed = JSON.parse(stored) as Partial<PrayerNotificationPreferences>;
    return PRAYER_ORDER.reduce<PrayerNotificationPreferences>((prefs, prayer) => {
      prefs[prayer] = parsed[prayer] === true;
      return prefs;
    }, getDefaultPrayerNotificationPreferences());
  } catch {
    return getDefaultPrayerNotificationPreferences();
  }
}

export function savePrayerNotificationPreferences(
  preferences: PrayerNotificationPreferences,
) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(PRAYER_NOTIFICATION_PREFS_KEY, JSON.stringify(preferences));
}

export function hasAnyPrayerNotificationPreference(
  preferences = getPrayerNotificationPreferences(),
) {
  return PRAYER_ORDER.some((prayer) => preferences[prayer]);
}

function getPrayerNotificationIds() {
  const ids: number[] = [];

  for (let dayIndex = 0; dayIndex < PRAYER_NOTIFICATION_DAYS; dayIndex += 1) {
    PRAYER_ORDER.forEach((_, prayerIndex) => {
      ids.push(PRAYER_NOTIFICATION_BASE_ID + dayIndex * 10 + prayerIndex);
    });
  }

  return ids;
}

function readPrayerTimingsCache(): PrayerTimingsCache | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(PRAYER_TIMINGS_CACHE_KEY);
    return stored ? (JSON.parse(stored) as PrayerTimingsCache) : null;
  } catch {
    return null;
  }
}

function writePrayerTimingsCache(cache: PrayerTimingsCache) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(PRAYER_TIMINGS_CACHE_KEY, JSON.stringify(cache));
}

export function cachePrayerTimesForDate(
  location: Pick<StoredLocation, "lat" | "lng">,
  dateKey: string,
  timings: PrayerTimes,
) {
  const existing = readPrayerTimingsCache();
  const sameLocation =
    existing &&
    Math.abs(existing.location.lat - location.lat) < 0.001 &&
    Math.abs(existing.location.lng - location.lng) < 0.001;

  writePrayerTimingsCache({
    location: {
      lat: location.lat,
      lng: location.lng,
    },
    days: {
      ...(sameLocation ? existing.days : {}),
      [dateKey]: timings,
    },
    updatedAt: new Date().toISOString(),
  });
}

export function getCachedPrayerTimesForDate(dateKey = getDateKey()) {
  return readPrayerTimingsCache()?.days[dateKey] ?? null;
}

export async function ensureReminderChannel() {
  await LocalNotifications.createChannel({
    id: REMINDER_CHANNEL_ID,
    name: "Daily reflections",
    description: "Morning and evening ImanVibes reminders.",
    importance: 4,
    visibility: 1,
    vibration: true,
    lights: true,
    lightColor: "#6f8f7b",
  });
}

export async function clearDailyReminders() {
  await LocalNotifications.cancel({
    notifications: DAILY_REMINDER_IDS.map((id) => ({ id })),
  });
  await LocalNotifications.removeAllDeliveredNotifications();
}

export async function scheduleDailyReminders() {
  await ensureReminderChannel();
  await clearDailyReminders();

  const dailyVerse = getDailyVerse();

  await LocalNotifications.schedule({
    notifications: [
      {
        id: MORNING_NOTIFICATION_ID,
        title: "🌤️ Start with a little calm",
        body: "Open ImanVibes and read a verse, hadith, or name that steadies your heart.",
        channelId: REMINDER_CHANNEL_ID,
        schedule: {
          on: {
            hour: 8,
            minute: 0,
          },
          repeats: true,
          allowWhileIdle: true,
        },
      },
      {
        id: EVENING_NOTIFICATION_ID,
        title: "🌙 End the day with reflection",
        body: "Close the day with remembrance, reflection, and a few quiet moments with Allah.",
        channelId: REMINDER_CHANNEL_ID,
        schedule: {
          on: {
            hour: 20,
            minute: 0,
          },
          repeats: true,
          allowWhileIdle: true,
        },
      },
      {
        id: DAILY_VERSE_NOTIFICATION_ID,
        title: "📖 A verse for your afternoon pause",
        body: `Take a short pause with ${dailyVerse.source}.`,
        channelId: REMINDER_CHANNEL_ID,
        schedule: {
          on: {
            hour: 14,
            minute: 0,
          },
          repeats: true,
          allowWhileIdle: true,
        },
      },
    ],
  });
}

export async function hasScheduledDailyReminders() {
  const pending = await LocalNotifications.getPending();
  return pending.notifications.some((notification) =>
    DAILY_REMINDER_IDS.includes(notification.id as (typeof DAILY_REMINDER_IDS)[number]),
  );
}

export async function ensurePrayerNotificationChannel() {
  await LocalNotifications.createChannel({
    id: PRAYER_NOTIFICATION_CHANNEL_ID,
    name: "Prayer times",
    description: "Prayer time reminders from ImanVibes.",
    importance: 4,
    visibility: 1,
    vibration: true,
    lights: true,
    lightColor: "#6f8f7b",
  });
}

export async function clearPrayerNotifications() {
  await LocalNotifications.cancel({
    notifications: getPrayerNotificationIds().map((id) => ({ id })),
  });
}

export async function syncPrayerNotifications(
  location: Pick<StoredLocation, "lat" | "lng"> | null,
  preferences = getPrayerNotificationPreferences(),
) {
  const permission = await LocalNotifications.checkPermissions();
  if (permission.display !== "granted") {
    return;
  }

  await clearPrayerNotifications();

  if (!location || !hasAnyPrayerNotificationPreference(preferences)) {
    return;
  }

  await ensurePrayerNotificationChannel();

  const notifications = [];
  const today = new Date();

  for (let dayIndex = 0; dayIndex < PRAYER_NOTIFICATION_DAYS; dayIndex += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + dayIndex);

    const { dateKey, timings } = await fetchPrayerTimesForDate(location, date);
    cachePrayerTimesForDate(location, dateKey, timings);

    for (const [prayerIndex, prayer] of PRAYER_ORDER.entries()) {
      if (!preferences[prayer]) {
        continue;
      }

      const parts = getTimeParts(timings[prayer]);
      if (!parts) {
        continue;
      }

      const scheduleAt = new Date(date);
      scheduleAt.setHours(parts.hours, parts.minutes, 0, 0);

      if (scheduleAt.getTime() <= Date.now() + 60_000) {
        continue;
      }

      const copy = PRAYER_NOTIFICATION_COPY[prayer];

      notifications.push({
        id: PRAYER_NOTIFICATION_BASE_ID + dayIndex * 10 + prayerIndex,
        title: copy.title,
        body: copy.body,
        channelId: PRAYER_NOTIFICATION_CHANNEL_ID,
        schedule: {
          at: scheduleAt,
          allowWhileIdle: true,
        },
        extra: {
          prayer,
          dateKey,
        },
      });
    }
  }

  if (notifications.length === 0) {
    return;
  }

  await LocalNotifications.schedule({
    notifications,
  });
}

export function getPrayerPreferenceSummary(preferences = getPrayerNotificationPreferences()) {
  const enabled = PRAYER_ORDER.filter((prayer) => preferences[prayer]);

  if (enabled.length === 0) {
    return "No Salah reminders selected";
  }

  return enabled.map((prayer) => PRAYER_LABELS[prayer]).join(", ");
}
