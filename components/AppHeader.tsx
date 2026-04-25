"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import BrandWordmark from "@/components/BrandWordmark";

type AppHeaderProps = {
  className?: string;
  showBackButton?: boolean;
  wordmarkClassName?: string;
};

function getBackHref(pathname: string) {
  if (pathname === "/") {
    return null;
  }

  const firstSegment = pathname.split("/").filter(Boolean)[0];
  if (!firstSegment) {
    return "/";
  }

  const basePath = `/${firstSegment}`;
  return ["quran", "hadith", "names", "duas"].includes(firstSegment) &&
    pathname !== basePath
    ? basePath
    : "/";
}

export default function AppHeader({
  className = "",
  showBackButton = false,
  wordmarkClassName = "text-[1.45rem]",
}: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const backHref = getBackHref(pathname);
  const canGoBack = showBackButton && backHref !== null;

  const handleBack = useCallback(() => {
    if (!backHref) {
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    router.replace(backHref);
  }, [backHref, router]);

  return (
    <div className={`flex items-center gap-3 ${className}`.trim()} data-nosnippet>
      {canGoBack ? (
        <button
          type="button"
          aria-label="Go back"
          onClick={handleBack}
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
