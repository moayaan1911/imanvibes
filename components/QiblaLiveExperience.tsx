"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";
import { FaLocationDot, FaRotate } from "react-icons/fa6";
import BrandWordmark from "@/components/BrandWordmark";
import AndroidCompass from "@/lib/android-compass";

const MECCA_LAT = 21.4225;
const MECCA_LNG = 39.8262;

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

  return (((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360;
}

function normalizeDegrees(value: number): number {
  return (value % 360 + 360) % 360;
}

function getTurnDelta(currentHeading: number, targetHeading: number): number {
  return ((targetHeading - currentHeading + 540) % 360) - 180;
}

function getDirectionLabel(bearing: number): string {
  if (bearing >= 337.5 || bearing < 22.5) return "N";
  if (bearing < 67.5) return "NE";
  if (bearing < 112.5) return "E";
  if (bearing < 157.5) return "SE";
  if (bearing < 202.5) return "S";
  if (bearing < 247.5) return "SW";
  if (bearing < 292.5) return "W";
  return "NW";
}

type OrientationPermissionEvent = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

export default function QiblaLiveExperience() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLabel, setLocationLabel] = useState("Tap to fetch location");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [headingSupported, setHeadingSupported] = useState(false);
  const [headingError, setHeadingError] = useState<string | null>(null);
  const [orientationEnabled, setOrientationEnabled] = useState(false);
  const [calibrationHint, setCalibrationHint] = useState<string | null>(null);

  const isAndroidNativeApp = useMemo(
    () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android",
    [],
  );

  const requestLocation = useCallback(async () => {
    setLoadingLocation(true);
    setLocationError(null);

    try {
      if (isAndroidNativeApp) {
        const permission = await Geolocation.requestPermissions();
        if (permission.location !== "granted") {
          setLocationError("Location permission denied.");
          setLoadingLocation(false);
          return;
        }
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    } catch {
      setLocationError("Could not fetch your live location.");
    }

    setLoadingLocation(false);
  }, [isAndroidNativeApp]);

  const enableCompass = useCallback(async (fromButton = false) => {
    if (isAndroidNativeApp) {
      setHeadingError(null);
      setOrientationEnabled(true);
      return;
    }

    if (typeof window === "undefined" || typeof DeviceOrientationEvent === "undefined") {
      setHeadingError("Compass is not supported on this device.");
      return;
    }

    const OrientationCtor = DeviceOrientationEvent as OrientationPermissionEvent;

    if (typeof OrientationCtor.requestPermission === "function") {
      if (!fromButton) {
        return;
      }

      try {
        const permission = await OrientationCtor.requestPermission();
        if (permission !== "granted") {
          setHeadingError("Compass permission denied.");
          return;
        }
      } catch {
        setHeadingError("Could not access the compass.");
        return;
      }
    }

    setHeadingError(null);
    setOrientationEnabled(true);
  }, [isAndroidNativeApp]);

  useEffect(() => {
    void enableCompass(false);
  }, [enableCompass]);

  useEffect(() => {
    if (!orientationEnabled || !isAndroidNativeApp) return;

    let mounted = true;
    let headingListener: PluginListenerHandle | null = null;

    async function startAndroidCompass() {
      try {
        headingListener = await AndroidCompass.addListener("heading", (event) => {
          if (typeof event.heading !== "number" || Number.isNaN(event.heading)) {
            return;
          }

          setHeadingSupported(true);
          setHeadingError(null);
          setDeviceHeading(normalizeDegrees(event.heading));
        });

        await AndroidCompass.start();
      } catch {
        if (mounted) {
          setHeadingError("Native compass is unavailable on this device.");
        }
      }
    }

    void startAndroidCompass();

    return () => {
      mounted = false;
      if (headingListener) {
        void headingListener.remove();
      }
      void AndroidCompass.stop().catch(() => undefined);
    };
  }, [isAndroidNativeApp, orientationEnabled]);

  useEffect(() => {
    if (!orientationEnabled || isAndroidNativeApp || typeof window === "undefined") return;

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
  }, [isAndroidNativeApp, orientationEnabled]);

  useEffect(() => {
    if (!location) return;

    let cancelled = false;
    const currentLocation = location;

    async function resolveLocationLabel() {
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${currentLocation.lat}&longitude=${currentLocation.lng}&localityLanguage=en`,
        );

        if (!response.ok) {
          throw new Error("Reverse geocode failed");
        }

        const data = await response.json();
        if (cancelled) return;

        const locality =
          data.city ||
          data.locality ||
          data.principalSubdivision ||
          data.countryName;
        const country = data.countryName || data.countryCode;

        setLocationLabel(
          locality && country && locality !== country
            ? `${locality}, ${country}`
            : locality || country || "Live location",
        );
      } catch {
        if (!cancelled) {
          setLocationLabel(`${currentLocation.lat.toFixed(2)}, ${currentLocation.lng.toFixed(2)}`);
        }
      }
    }

    void resolveLocationLabel();

    return () => {
      cancelled = true;
    };
  }, [location]);

  const qiblaBearing = useMemo(() => {
    if (!location) return null;
    return calculateQiblaBearing(location.lat, location.lng);
  }, [location]);

  const arrowRotation = useMemo(() => {
    if (qiblaBearing === null) return 0;
    if (deviceHeading === null) return qiblaBearing;
    return getTurnDelta(deviceHeading, qiblaBearing);
  }, [deviceHeading, qiblaBearing]);

  const compassDialRotation = useMemo(() => {
    return deviceHeading === null ? 0 : -deviceHeading;
  }, [deviceHeading]);

  const compassLabelRotation = useMemo(() => {
    return deviceHeading === null ? 0 : deviceHeading;
  }, [deviceHeading]);

  const qiblaReadout = useMemo(() => {
    if (qiblaBearing === null) return "--";
    return `${Math.round(qiblaBearing)}° ${getDirectionLabel(qiblaBearing)}`;
  }, [qiblaBearing]);

  return (
    <div className="page-bg min-h-screen overflow-x-hidden">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-24 pt-5">
        <div className="flex items-center gap-4">
          <Image
            src="/icon2Circular.png"
            alt="ImanVibes icon"
            width={64}
            height={64}
            priority
            className="icon-ring rounded-full border"
          />
          <BrandWordmark wordmarkClassName="text-[1.45rem]" />
        </div>

        <div className="flex flex-1 flex-col items-center px-2 pb-10 pt-8">
          <div className="flex w-full flex-col items-center gap-2 text-center">
            <h2 className="font-display text-[2rem] tracking-[-0.04em] text-[var(--ink-900)]">
              Qibla Finder
            </h2>
            <p className="max-w-[280px] text-sm leading-6 text-[var(--ink-700)]">
              Point your device to align with the sacred direction.
            </p>
          </div>

          <div className="relative my-10 flex aspect-square w-full max-w-[320px] items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center rounded-full border border-[rgba(194,200,193,0.35)] bg-[var(--sand-100)] shadow-[0_10px_40px_-10px_rgba(68,99,81,0.1)]">
              <div className="relative flex h-[85%] w-[85%] items-center justify-center rounded-full border border-[rgba(194,200,193,0.28)] bg-[var(--surface-solid)] shadow-[inset_0_4px_20px_rgba(0,0,0,0.03)]">
                <div
                  className="absolute inset-0 transition-transform duration-200 ease-out"
                  style={{ transform: `rotate(${compassDialRotation}deg)` }}
                >
                  {[
                    { label: "N", className: "left-1/2 top-4 -translate-x-1/2" },
                    { label: "E", className: "right-4 top-1/2 -translate-y-1/2" },
                    { label: "S", className: "bottom-4 left-1/2 -translate-x-1/2" },
                    { label: "W", className: "left-4 top-1/2 -translate-y-1/2" },
                  ].map((direction) => (
                    <span
                      key={direction.label}
                      className={`absolute ${direction.className} text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-700)]`}
                    >
                      <span
                        className="block transition-transform duration-200 ease-out"
                        style={{ transform: `rotate(${compassLabelRotation}deg)` }}
                      >
                        {direction.label}
                      </span>
                    </span>
                  ))}
                </div>

                <div className="absolute h-[60%] w-[60%] rounded-full border border-[rgba(194,200,193,0.22)]" />
                <div className="absolute h-[40%] w-[40%] rounded-full border border-[rgba(194,200,193,0.14)]" />

                <div
                  className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
                  style={{ transform: `rotate(${arrowRotation}deg)` }}
                >
                  <div className="absolute left-1/2 top-1/2 h-[40%] w-[2px] -translate-x-1/2 -translate-y-full rounded-full bg-gradient-to-t from-[rgba(68,99,81,0.12)] to-[var(--sage-500)]" />
                  <div className="absolute left-1/2 top-[15%] flex h-6 w-6 -translate-x-1/2 items-start justify-center overflow-hidden rounded-[4px] border border-[#32302a] bg-[#32302a]">
                    <div className="mt-1 h-1 w-full bg-[var(--gold-400)]" />
                  </div>
                </div>

                <div className="relative z-10 h-3 w-3 rounded-full border-2 border-[var(--surface-solid)] bg-[var(--sage-500)] shadow-[0_2px_8px_rgba(68,99,81,0.4)]" />
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-2 text-center">
            <div className="font-display text-[3rem] leading-none tracking-[-0.05em] text-[var(--sage-500)]">
              {qiblaReadout}
            </div>
            <button
              type="button"
              onClick={() => void requestLocation()}
              className="mt-2 flex items-center gap-2 rounded-full border border-[rgba(194,200,193,0.35)] bg-[var(--sand-100)] px-4 py-1.5 text-[var(--ink-700)]"
            >
              <FaLocationDot className="text-sm" />
              <span className="text-sm">{loadingLocation ? "Fetching..." : locationLabel}</span>
            </button>
            <p className="text-[11px] italic text-[var(--ink-700)]">
              Tap on the location to fetch latest location
            </p>
            {locationError ? (
              <p className="text-[11px] text-red-500">{locationError}</p>
            ) : null}
            {headingError ? (
              <p className="text-[11px] text-red-500">{headingError}</p>
            ) : null}
            {!headingSupported && !headingError ? (
              <p className="text-[11px] text-[var(--ink-700)]">
                Compass is waiting for live device orientation.
              </p>
            ) : null}
          </div>

          <div className="mt-10 flex w-full flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setCalibrationHint("Move your phone in a figure-eight to calibrate the compass.");
                void enableCompass(true);
              }}
              className="flex items-center justify-center gap-2 rounded-full border border-[var(--sage-500)] px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--sage-500)] transition-colors hover:bg-[rgba(68,99,81,0.05)]"
            >
              <FaRotate className="text-sm" />
              Calibrate Compass
            </button>
            {calibrationHint ? (
              <p className="max-w-[260px] text-center text-[11px] text-[var(--ink-700)]">
                {calibrationHint}
              </p>
            ) : null}
            {deviceHeading !== null ? (
              <p className="text-[11px] text-[var(--ink-700)]">
                Your heading: {Math.round(deviceHeading)}° {getDirectionLabel(deviceHeading)}
              </p>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
