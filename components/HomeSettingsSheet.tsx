"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Geolocation } from "@capacitor/geolocation";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Share } from "@capacitor/share";
import {
  FaArrowUpRightFromSquare,
  FaBell,
  FaCircleInfo,
  FaGear,
  FaGithub,
  FaGlobe,
  FaLocationArrow,
  FaRotate,
  FaShareNodes,
  FaXmark,
} from "react-icons/fa6";
import ThemeToggle from "@/components/ThemeToggle";
import {
  REMINDER_SETUP_KEY,
  getDefaultPrayerNotificationPreferences,
  getPrayerNotificationPreferences,
  savePrayerNotificationPreferences,
  scheduleDailyReminders,
  syncPrayerNotifications,
  type PrayerNotificationPreferences,
} from "@/lib/android-notifications";
import AndroidSystem from "@/lib/android-system";
import {
  formatLocationLabel,
  getStoredLocation,
  requestAndStoreCurrentLocation,
  type StoredLocation,
} from "@/lib/location";
import { PRAYER_LABELS, PRAYER_ORDER, type PrayerName } from "@/lib/prayer-times";
import {
  absoluteUrl,
  appVersion,
  developerWebsiteUrl,
  githubRepoUrl,
  playStoreUrl,
} from "@/lib/site";

type PermissionState = "loading" | "granted" | "prompt" | "denied" | "unavailable";
type BusyTarget = "notifications" | "location" | "update" | "share" | PrayerName | null;

function SettingsCard({
  icon: Icon,
  title,
  body,
  children,
}: {
  icon: typeof FaBell;
  title: string;
  body?: string;
  children?: ReactNode;
}) {
  return (
    <article className="surface-card rounded-[24px] p-4">
      <div className="flex items-start gap-3">
        <span className="pill-soft inline-flex size-10 shrink-0 items-center justify-center rounded-full text-sm text-[var(--sage-700)]">
          <Icon />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[var(--ink-900)]">{title}</h3>
          {body ? (
            <p className="mt-1 text-[0.82rem] leading-5 text-[var(--ink-700)]">
              {body}
            </p>
          ) : null}
          {children ? <div className="mt-3">{children}</div> : null}
        </div>
      </div>
    </article>
  );
}

function StatusPill({ label }: { label: string }) {
  return (
    <span className="pill-soft inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold">
      {label}
    </span>
  );
}

export default function HomeSettingsSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [busyTarget, setBusyTarget] = useState<BusyTarget>(null);
  const [notificationPermission, setNotificationPermission] =
    useState<PermissionState>("loading");
  const [locationPermission, setLocationPermission] =
    useState<PermissionState>("loading");
  const [storedLocation, setStoredLocation] = useState<StoredLocation | null>(null);
  const [prayerPrefs, setPrayerPrefs] = useState<PrayerNotificationPreferences>(
    () => getDefaultPrayerNotificationPreferences(),
  );
  const [shareState, setShareState] = useState<
    "idle" | "preparing" | "shared" | "copied" | "error"
  >("idle");

  const isAndroidApp = useMemo(
    () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android",
    [],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setPrayerPrefs(getPrayerNotificationPreferences());
    setStoredLocation(getStoredLocation());
    void refreshState();
  }, [isOpen]);

  async function refreshState() {
    await Promise.all([refreshNotificationState(), refreshLocationState()]);
  }

  async function refreshNotificationState() {
    if (!isAndroidApp) {
      setNotificationPermission("unavailable");
      return;
    }

    try {
      const [permission, enabled] = await Promise.all([
        LocalNotifications.checkPermissions(),
        LocalNotifications.areEnabled(),
      ]);

      if (permission.display === "granted" && enabled.value) {
        setNotificationPermission("granted");
        return;
      }

      if (permission.display === "prompt") {
        setNotificationPermission("prompt");
        return;
      }

      setNotificationPermission("denied");
    } catch {
      setNotificationPermission("unavailable");
    }
  }

  async function refreshLocationState() {
    if (!isAndroidApp) {
      setLocationPermission("unavailable");
      return;
    }

    try {
      const permission = await Geolocation.checkPermissions();
      const granted =
        permission.location === "granted" || permission.coarseLocation === "granted";

      if (granted) {
        setLocationPermission("granted");
        setStoredLocation(getStoredLocation());
        return;
      }

      if (permission.location === "prompt" || permission.coarseLocation === "prompt") {
        setLocationPermission("prompt");
        return;
      }

      setLocationPermission("denied");
    } catch {
      setLocationPermission("unavailable");
    }
  }

  async function ensureNotificationPermission() {
    if (!isAndroidApp) {
      return false;
    }

    const current = await LocalNotifications.checkPermissions();
    let granted = current.display === "granted";

    if (!granted && current.display === "prompt") {
      const requested = await LocalNotifications.requestPermissions();
      granted = requested.display === "granted";
    }

    if (!granted) {
      await AndroidSystem.openNotificationSettings();
      await refreshNotificationState();
      return false;
    }

    await scheduleDailyReminders();
    localStorage.setItem(REMINDER_SETUP_KEY, "done");
    setNotificationPermission("granted");
    return true;
  }

  async function handleNotifications() {
    setBusyTarget("notifications");

    try {
      await ensureNotificationPermission();
    } catch {
      await refreshNotificationState();
    } finally {
      setBusyTarget(null);
    }
  }

  async function ensureStoredLocation() {
    const location = getStoredLocation();
    if (location) {
      setStoredLocation(location);
      return location;
    }

    const requested = await requestAndStoreCurrentLocation();
    setStoredLocation(requested);
    return requested;
  }

  async function handleLocation() {
    setBusyTarget("location");

    try {
      const location = await requestAndStoreCurrentLocation();
      setStoredLocation(location);
      await syncPrayerNotifications(location, prayerPrefs);
      await refreshLocationState();
    } catch {
      const permission = await Geolocation.checkPermissions().catch(() => null);
      if (permission?.location === "denied" || permission?.coarseLocation === "denied") {
        await AndroidSystem.openAppSettings();
      } else {
        await AndroidSystem.openLocationSettings();
      }
    } finally {
      setBusyTarget(null);
    }
  }

  async function handlePrayerToggle(prayer: PrayerName) {
    setBusyTarget(prayer);

    try {
      const notificationsAllowed = await ensureNotificationPermission();
      if (!notificationsAllowed) {
        return;
      }

      let location: StoredLocation | null = null;

      try {
        location = await ensureStoredLocation();
      } catch {
        const permission = await Geolocation.checkPermissions().catch(() => null);
        if (permission?.location === "denied" || permission?.coarseLocation === "denied") {
          await AndroidSystem.openAppSettings();
        } else {
          await AndroidSystem.openLocationSettings();
        }
      }

      if (!location) {
        return;
      }

      const nextPrefs = {
        ...prayerPrefs,
        [prayer]: !prayerPrefs[prayer],
      };

      savePrayerNotificationPreferences(nextPrefs);
      setPrayerPrefs(nextPrefs);
      await syncPrayerNotifications(location, nextPrefs);
    } catch {
      await refreshState();
    } finally {
      setBusyTarget(null);
    }
  }

  async function handlePlayStoreOpen() {
    setBusyTarget("update");

    try {
      if (isAndroidApp) {
        await AndroidSystem.openPlayStorePage();
      } else {
        window.open(playStoreUrl, "_blank", "noopener,noreferrer");
      }
    } finally {
      setBusyTarget(null);
    }
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

  async function createShareAsset() {
    const response = await fetch("/opengraph-image");

    if (!response.ok) {
      throw new Error("Could not load OG image");
    }

    const blob = await response.blob();

    return {
      blob,
      file: new File([blob], "imanvibes-home-og.png", {
        type: blob.type || "image/png",
      }),
    };
  }

  async function handleShare() {
    setBusyTarget("share");
    setShareState("preparing");

    const homepageUrl = absoluteUrl("/");
    const shareText = `Check out ImanVibes\nQuranic comfort for every mood.\nWebsite: ${homepageUrl}\nPlay Store: ${playStoreUrl}`;

    try {
      if (isAndroidApp) {
        const { blob } = await createShareAsset();
        const base64Data = await blobToBase64(blob);
        const saved = await Filesystem.writeFile({
          path: "shares/imanvibes-home-og.png",
          data: base64Data,
          directory: Directory.Cache,
          recursive: true,
        });

        await Share.share({
          title: "ImanVibes",
          text: shareText,
          files: [saved.uri],
          dialogTitle: "Share ImanVibes",
        });

        setShareState("shared");
        window.setTimeout(() => setShareState("idle"), 1400);
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: "ImanVibes",
          text: `Check out ImanVibes\nQuranic comfort for every mood.\nPlay Store: ${playStoreUrl}`,
          url: homepageUrl,
        });

        setShareState("shared");
        window.setTimeout(() => setShareState("idle"), 1400);
        return;
      }

      await navigator.clipboard.writeText(shareText);
      setShareState("copied");
      window.setTimeout(() => setShareState("idle"), 1400);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setShareState("idle");
        return;
      }

      setShareState("error");
      window.setTimeout(() => setShareState("idle"), 1400);
    } finally {
      setBusyTarget(null);
    }
  }

  const notificationsAllowed = notificationPermission === "granted";
  const notificationLabel = notificationsAllowed ? "Allowed" : "Not allowed";

  const locationLabel =
    locationPermission === "granted"
      ? formatLocationLabel(storedLocation)
      : locationPermission === "prompt"
        ? "Ask first"
        : locationPermission === "denied"
          ? "Blocked"
          : "Android only";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open ImanVibes settings"
        title="Settings"
        className="theme-toggle-shell flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-sm"
      >
        <FaGear />
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/35 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-6 backdrop-blur-[8px]"
          onClick={() => setIsOpen(false)}
        >
          <section
            className="surface-panel max-h-[88vh] w-full max-w-md overflow-y-auto rounded-[30px] p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--sage-700)]">
                  Settings
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[var(--ink-900)]">
                  App controls
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close settings"
                className="theme-toggle-shell flex size-10 shrink-0 items-center justify-center rounded-full text-sm"
              >
                <FaXmark />
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <SettingsCard
                icon={FaBell}
                title="Notifications"
              >
                <div className="flex items-center justify-between gap-3">
                  <StatusPill label={notificationLabel} />

                  {!notificationsAllowed ? (
                    <button
                      type="button"
                      onClick={handleNotifications}
                      disabled={
                        busyTarget === "notifications" ||
                        notificationPermission === "unavailable"
                      }
                      className="button-secondary rounded-full px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busyTarget === "notifications"
                        ? "Working..."
                        : notificationPermission === "denied"
                          ? "Open settings"
                          : "Allow"}
                    </button>
                  ) : null}
                </div>

                <div className="mt-4 space-y-2">
                  {PRAYER_ORDER.map((prayer) => {
                    const active = notificationsAllowed && prayerPrefs[prayer];
                    const disabled = !notificationsAllowed || busyTarget === prayer;

                    return (
                      <button
                        key={prayer}
                        type="button"
                        onClick={() => void handlePrayerToggle(prayer)}
                        role="switch"
                        aria-checked={active}
                        disabled={disabled}
                        className={`flex w-full items-center justify-between rounded-[18px] border px-3 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${
                          active
                            ? "border-[rgba(111,143,123,0.28)] bg-[rgba(230,240,232,0.72)] text-[var(--ink-900)]"
                            : "border-[var(--surface-line)] bg-[var(--surface-solid)] text-[var(--ink-700)] opacity-65"
                        }`}
                      >
                        <span>{busyTarget === prayer ? "Syncing..." : PRAYER_LABELS[prayer]}</span>
                        <span
                          className={`flex h-7 w-12 items-center rounded-full p-1 transition-colors ${
                            active ? "bg-[var(--sage-500)]" : "bg-[rgba(86,96,86,0.16)]"
                          }`}
                        >
                          <span
                            className={`size-5 rounded-full bg-white shadow-sm transition-transform ${
                              active ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </SettingsCard>

              <SettingsCard
                icon={FaLocationArrow}
                title="Location"
                body="Saved location is used for prayer times and selected Salah reminders."
              >
                <div className="flex items-center justify-between gap-3">
                  <StatusPill label={locationLabel} />
                  <button
                    type="button"
                    onClick={handleLocation}
                    disabled={busyTarget === "location" || locationPermission === "unavailable"}
                    className="button-secondary inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FaRotate className="text-[11px]" />
                    {busyTarget === "location"
                      ? "Working..."
                      : locationPermission === "denied"
                        ? "Open settings"
                        : "Refresh"}
                  </button>
                </div>
              </SettingsCard>

              <article className="surface-card rounded-[24px] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="pill-soft inline-flex size-10 shrink-0 items-center justify-center rounded-full text-sm text-[var(--sage-700)]">
                      <FaGlobe />
                    </span>
                    <h3 className="text-sm font-semibold text-[var(--ink-900)]">
                      Appearance
                    </h3>
                  </div>
                  <ThemeToggle variant="inline" iconOnly />
                </div>
              </article>

              <article className="surface-card rounded-[24px] p-4">
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={busyTarget === "share"}
                  className="flex w-full items-center justify-between gap-3 text-left disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="pill-soft inline-flex size-10 shrink-0 items-center justify-center rounded-full text-sm text-[var(--sage-700)]">
                      <FaShareNodes />
                    </span>
                    <span className="text-sm font-semibold text-[var(--ink-900)]">
                      {shareState === "preparing"
                        ? "Preparing..."
                        : shareState === "shared"
                          ? "Shared"
                          : shareState === "copied"
                            ? "Copied"
                            : shareState === "error"
                              ? "Try again"
                              : "Share ImanVibes"}
                    </span>
                  </span>
                  <FaShareNodes className="shrink-0 text-[var(--sage-700)]" />
                </button>
              </article>

              <SettingsCard
                icon={FaCircleInfo}
                title="About"
                body="Version and update path for the Android app."
              >
                <div className="flex items-center justify-between gap-3">
                  <StatusPill label={`v${appVersion}`} />
                  <button
                    type="button"
                    onClick={handlePlayStoreOpen}
                    disabled={busyTarget === "update"}
                    className="button-secondary inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FaRotate className="text-[11px]" />
                    {busyTarget === "update" ? "Opening..." : "Check updates"}
                  </button>
                </div>
              </SettingsCard>

              <SettingsCard
                icon={FaGlobe}
                title="Links"
                body="Quick links for the app, repo, and your website."
              >
                <div className="grid grid-cols-3 gap-2">
                  <Link
                    href={absoluteUrl("/")}
                    target="_blank"
                    rel="noreferrer"
                    className="button-secondary flex min-h-20 flex-col items-center justify-center gap-2 rounded-[20px] px-3 py-3 text-center text-[11px] font-semibold"
                  >
                    <FaGlobe className="text-sm" />
                    ImanVibes
                  </Link>
                  <Link
                    href={githubRepoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="button-secondary flex min-h-20 flex-col items-center justify-center gap-2 rounded-[20px] px-3 py-3 text-center text-[11px] font-semibold"
                  >
                    <FaGithub className="text-sm" />
                    GitHub
                  </Link>
                  <Link
                    href={developerWebsiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="button-secondary flex min-h-20 flex-col items-center justify-center gap-2 rounded-[20px] px-3 py-3 text-center text-[11px] font-semibold"
                  >
                    <FaArrowUpRightFromSquare className="text-sm" />
                    moayaan.com
                  </Link>
                </div>
              </SettingsCard>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
