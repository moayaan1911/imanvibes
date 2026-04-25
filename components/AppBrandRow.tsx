"use client";

import Image from "next/image";
import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";
import BrandWordmark from "@/components/BrandWordmark";

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

type AppBrandRowProps = {
  className?: string;
  showBackButton?: boolean;
  wordmarkClassName?: string;
};

export default function AppBrandRow({
  className = "",
  showBackButton = false,
  wordmarkClassName = "text-[1.45rem]",
}: AppBrandRowProps) {
  const pathname = usePathname();
  const router = useRouter();
  const fallbackPath = getFallbackPath(pathname);
  const canGoBack = showBackButton && fallbackPath !== null;

  const goBack = useCallback(() => {
    if (!fallbackPath) {
      return;
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
      return;
    }

    router.replace(fallbackPath);
  }, [fallbackPath, router]);

  return (
    <div className={`flex items-center gap-3 ${className}`.trim()}>
      {canGoBack ? (
        <button
          type="button"
          aria-label="Go back"
          onClick={goBack}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgba(111,143,123,0.18)] bg-[var(--surface-solid)] text-[var(--sage-700)] shadow-[var(--shadow-card)]"
        >
          <FaArrowLeft className="text-base" />
        </button>
      ) : null}

      <div className="flex items-center gap-4">
        <Image
          src="/icon2Circular.png"
          alt="ImanVibes icon"
          width={64}
          height={64}
          priority
          className="icon-ring rounded-full border"
        />
        <BrandWordmark wordmarkClassName={wordmarkClassName} />
      </div>
    </div>
  );
}
