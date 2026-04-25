"use client";

import { useEffect, useMemo } from "react";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";
import { LocalNotifications } from "@capacitor/local-notifications";
import {
  REMINDER_SETUP_KEY,
  getPrayerNotificationPreferences,
  hasScheduledDailyReminders,
  scheduleDailyReminders,
  syncPrayerNotifications,
} from "@/lib/android-notifications";
import { getStoredLocation, requestAndStoreCurrentLocation } from "@/lib/location";

function isAndroidNative() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

export default function AndroidNotificationBootstrap() {
  const isAndroidApp = useMemo(() => isAndroidNative(), []);

  useEffect(() => {
    if (!isAndroidApp) {
      return;
    }

    let cancelled = false;

    async function setupPermissionsAndNotifications() {
      try {
        const current = await LocalNotifications.checkPermissions();

        if (cancelled) {
          return;
        }

        let notificationsGranted = current.display === "granted";

        if (current.display === "prompt") {
          const requested = await LocalNotifications.requestPermissions();
          notificationsGranted = requested.display === "granted";
        }

        if (notificationsGranted && !cancelled) {
          const scheduled = await hasScheduledDailyReminders();
          if (!scheduled) {
            await scheduleDailyReminders();
          }

          localStorage.setItem(REMINDER_SETUP_KEY, "done");
        }

        if (cancelled) {
          return;
        }

        let storedLocation = getStoredLocation();

        if (!storedLocation) {
          const locationPermission = await Geolocation.checkPermissions();
          const shouldAskLocation =
            locationPermission.location === "prompt" ||
            locationPermission.coarseLocation === "prompt" ||
            locationPermission.location === "granted" ||
            locationPermission.coarseLocation === "granted";

          if (shouldAskLocation && !cancelled) {
            storedLocation = await requestAndStoreCurrentLocation();
          }
        }

        if (!cancelled && notificationsGranted) {
          await syncPrayerNotifications(
            storedLocation,
            getPrayerNotificationPreferences(),
          );
        }
      } catch {
        // Best-effort bootstrap only; no user-facing UI in final Android build.
      }
    }

    void setupPermissionsAndNotifications();

    return () => {
      cancelled = true;
    };
  }, [isAndroidApp]);

  return null;
}
