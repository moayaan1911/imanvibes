"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Capacitor } from "@capacitor/core";
import { usePathname, useRouter } from "next/navigation";

function getFallbackPath(pathname: string) {
  if (pathname === "/") {
    return null;
  }

  const firstSegment = pathname.split("/").filter(Boolean)[0];

  if (!firstSegment) {
    return "/";
  }

  const sectionRoot = `/${firstSegment}`;

  if (
    ["quran", "hadith", "names", "duas", "prayer"].includes(firstSegment) &&
    pathname !== sectionRoot
  ) {
    return sectionRoot;
  }

  return "/";
}

export default function AndroidBackHandler() {
  const pathname = usePathname();
  const router = useRouter();

  const isAndroidNativeApp = useMemo(
    () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android",
    [],
  );

  const shouldHideFloatingBack = pathname === "/prayer/qibla";
  const fallbackPath = shouldHideFloatingBack ? null : getFallbackPath(pathname);
  const goBack = useCallback(() => {
    if (!isAndroidNativeApp || !fallbackPath) {
      return;
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
      return;
    }

    router.replace(fallbackPath);
  }, [fallbackPath, isAndroidNativeApp, router]);

  useEffect(() => {
    if (!isAndroidNativeApp || typeof window === "undefined") {
      return;
    }

    window.__imanvibesHandleNativeBack = goBack;

    return () => {
      if (window.__imanvibesHandleNativeBack === goBack) {
        window.__imanvibesHandleNativeBack = undefined;
      }
    };
  }, [goBack, isAndroidNativeApp]);

  return null;
}

declare global {
  interface Window {
    __imanvibesHandleNativeBack?: () => void;
  }
}
