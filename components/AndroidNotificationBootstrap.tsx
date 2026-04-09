"use client";

import { useEffect, useMemo } from "react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

const MORNING_NOTIFICATION_ID = 4101;
const EVENING_NOTIFICATION_ID = 4102;
const REMINDER_CHANNEL_ID = "daily-reflection";
const SETUP_KEY = "android-reminders-setup-v1";

function isAndroidNative() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

async function ensureReminderChannel() {
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

async function scheduleDailyReminders() {
  await ensureReminderChannel();

  await LocalNotifications.cancel({
    notifications: [
      { id: MORNING_NOTIFICATION_ID },
      { id: EVENING_NOTIFICATION_ID },
    ],
  });

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
        body: "Ask Alif something thoughtful tonight, or revisit a reminder before sleep.",
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
    ],
  });
}

export default function AndroidNotificationBootstrap() {
  const isAndroidApp = useMemo(() => isAndroidNative(), []);

  useEffect(() => {
    if (!isAndroidApp) {
      return;
    }

    let cancelled = false;

    async function setupNotifications() {
      try {
        if (localStorage.getItem(SETUP_KEY) === "done") {
          return;
        }

        const current = await LocalNotifications.checkPermissions();

        if (cancelled) {
          return;
        }

        let granted = current.display === "granted";

        if (current.display === "prompt") {
          const requested = await LocalNotifications.requestPermissions();
          granted = requested.display === "granted";
        }

        if (!granted || cancelled) {
          return;
        }

        await scheduleDailyReminders();

        if (cancelled) {
          return;
        }

        localStorage.setItem(SETUP_KEY, "done");
      } catch {
        // Best-effort bootstrap only; no user-facing UI in final Android build.
      }
    }

    void setupNotifications();

    return () => {
      cancelled = true;
    };
  }, [isAndroidApp]);

  return null;
}
