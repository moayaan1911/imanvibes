import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";

export type StoredLocation = {
  lat: number;
  lng: number;
  label?: string;
  updatedAt: string;
};

export const LOCATION_STORAGE_KEY = "imanvibes-location-v1";
export const LOCATION_UPDATED_EVENT = "imanvibes-location-updated";

export function isAndroidNativeApp() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

export function getStoredLocation(): StoredLocation | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as Partial<StoredLocation>;

    if (typeof parsed.lat !== "number" || typeof parsed.lng !== "number") {
      return null;
    }

    return {
      lat: parsed.lat,
      lng: parsed.lng,
      label: typeof parsed.label === "string" ? parsed.label : undefined,
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function formatLocationLabel(location: StoredLocation | null) {
  if (!location) {
    return "Tap to fetch location";
  }

  return location.label || `${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}`;
}

export function saveStoredLocation(location: Omit<StoredLocation, "updatedAt">) {
  if (typeof window === "undefined") {
    return null;
  }

  const storedLocation: StoredLocation = {
    ...location,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(storedLocation));
    window.dispatchEvent(
      new CustomEvent<StoredLocation>(LOCATION_UPDATED_EVENT, {
        detail: storedLocation,
      }),
    );
  } catch {}

  return storedLocation;
}

export async function resolveLocationLabel(lat: number, lng: number) {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
    );

    if (!response.ok) {
      throw new Error("Reverse geocode failed");
    }

    const data = await response.json();
    const locality =
      data.city ||
      data.locality ||
      data.principalSubdivision ||
      data.countryName;
    const country = data.countryName || data.countryCode;

    if (locality && country && locality !== country) {
      return `${locality}, ${country}`;
    }

    return locality || country || undefined;
  } catch {
    return undefined;
  }
}

export async function requestAndStoreCurrentLocation() {
  const androidApp = isAndroidNativeApp();

  if (androidApp) {
    const permission = await Geolocation.requestPermissions();
    const granted =
      permission.location === "granted" || permission.coarseLocation === "granted";

    if (!granted) {
      throw new Error("Location permission denied");
    }
  }

  const position = await Geolocation.getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 10000,
  });

  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  const label = await resolveLocationLabel(lat, lng);

  return saveStoredLocation({
    lat,
    lng,
    label,
  });
}

export function addStoredLocationListener(callback: (location: StoredLocation) => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<StoredLocation>;
    callback(customEvent.detail);
  };

  window.addEventListener(LOCATION_UPDATED_EVENT, listener);
  return () => window.removeEventListener(LOCATION_UPDATED_EVENT, listener);
}
