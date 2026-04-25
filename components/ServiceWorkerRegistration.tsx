"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const hostname = window.location.hostname;
    const isLocalPreview =
      process.env.NODE_ENV !== "production" ||
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1";

    if (isLocalPreview) {
      navigator.serviceWorker
        .getRegistrations()
        .then(async (registrations) => {
          await Promise.all(
            registrations.map((registration) => registration.unregister()),
          );

          if ("caches" in window) {
            const cacheKeys = await caches.keys();
            await Promise.all(
              cacheKeys
                .filter((key) => key.startsWith("imanvibes-"))
                .map((key) => caches.delete(key)),
            );
          }
        })
        .catch(() => {});
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}
