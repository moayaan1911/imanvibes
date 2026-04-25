"use client";

import { toBlob } from "html-to-image";
import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { IconType } from "react-icons";
import { FaArrowRight, FaImage, FaShareNodes } from "react-icons/fa6";
import {
  MdBolt,
  MdExplore,
  MdFavorite,
  MdHourglassEmpty,
  MdLocalFireDepartment,
  MdNightsStay,
  MdPerson,
  MdTsunami,
  MdVolunteerActivism,
  MdWaterDrop,
  MdWbSunny,
} from "react-icons/md";
import AudioPlayer from "@/components/AudioPlayer";
import FocusedContentDetail from "@/components/FocusedContentDetail";
import ShareButton from "@/components/ShareButton";
import { getDuaOccasionIcon } from "@/lib/dua-occasion-icons";
import { absoluteUrl, siteDomain } from "@/lib/site";

export type ContentCardItem = {
  id: string;
  arabic: string;
  translation?: string;
  source?: string;
  transliteration?: string;
  meaning?: string;
};

type ContentCardProps = {
  items: ContentCardItem[];
  kind: "quran" | "hadith" | "names" | "duas";
  initialItemId?: string;
  quranMood?: string;
  relatedMoodLinks?: { label: string; href: string }[];
  duaOccasion?: string;
  relatedOccasionLinks?: { label: string; href: string }[];
};

function buildItemHref(
  kind: ContentCardProps["kind"],
  pathname: string,
  itemId: string,
) {
  if (kind === "hadith") {
    return `/hadith/${itemId}`;
  }

  if (kind === "names") {
    return `/names/${itemId}`;
  }

  const params = new URLSearchParams();
  params.set("item", itemId);
  return `${pathname}?${params.toString()}`;
}

const kindLabels = {
  quran: {
    badge: "Quran",
    next: "Next verse",
    shareIntro: "I found this beautiful Quran verse on ImanVibes.",
  },
  hadith: {
    badge: "Hadith",
    next: "Next hadith",
    shareIntro: "I found this beautiful hadith on ImanVibes.",
  },
  names: {
    badge: "99 Names",
    next: "Next name",
    shareIntro: "I found this beautiful name of Allah on ImanVibes.",
  },
  duas: {
    badge: "Duas",
    next: "Next dua",
    shareIntro: "I found this beautiful dua on ImanVibes.",
  },
} as const;

const moodIcons: Record<string, IconType> = {
  Sad: MdWaterDrop,
  Anxious: MdTsunami,
  Lonely: MdPerson,
  Angry: MdLocalFireDepartment,
  Grateful: MdVolunteerActivism,
  Thankful: MdFavorite,
  Hopeful: MdWbSunny,
  Lost: MdExplore,
  Fearful: MdNightsStay,
  Patience: MdHourglassEmpty,
  Stressed: MdBolt,
};

export default function ContentCard({
  items,
  kind,
  initialItemId,
  quranMood,
  relatedMoodLinks = [],
  duaOccasion,
  relatedOccasionLinks = [],
}: ContentCardProps) {
  const [shareLinkLabel, setShareLinkLabel] = useState("Share link");
  const [shareImageLabel, setShareImageLabel] = useState("Share image");
  const shareCardRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const requestedItem = searchParams.get("item");
  const activeItemId = requestedItem ?? initialItemId ?? null;
  const isAndroidNativeApp = useMemo(
    () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android",
    [],
  );

  const index = useMemo(() => {
    if (!activeItemId) {
      return 0;
    }

    const matchedIndex = items.findIndex((entry) => entry.id === activeItemId);
    return matchedIndex >= 0 ? matchedIndex : 0;
  }, [activeItemId, items]);

  const item = items[index];

  useEffect(() => {
    if (kind === "hadith" || kind === "names") {
      if (!requestedItem) {
        return;
      }

      const nextPath = buildItemHref(kind, pathname, item.id);

      if (pathname === nextPath && !searchParamsString) {
        return;
      }

      router.replace(nextPath, { scroll: false });
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (params.get("item") === item.id) {
      return;
    }

    params.set("item", item.id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [item.id, kind, pathname, requestedItem, router, searchParams, searchParamsString]);

  const shareUrl = useMemo(() => {
    const url = new URL(absoluteUrl(pathname || "/"));
    url.searchParams.set("item", item.id);
    return url.toString();
  }, [item.id, pathname]);

  function resolveShareUrl() {
    return shareUrl;
  }

  const shareSummary = useMemo(() => {
    return kind === "names"
      ? `${item.transliteration} - ${item.meaning}`.trim()
      : `${item.translation ?? ""}${item.source ? `\n- ${item.source}` : ""}`.trim();
  }, [item, kind]);

  function handleNext() {
    const nextItem = items[(index + 1) % items.length];
    router.replace(buildItemHref(kind, pathname, nextItem.id), { scroll: false });
    setShareLinkLabel("Share link");
  }

  async function handleShareLink() {
    const resolvedShareUrl = resolveShareUrl();

    try {
      const sharePayload = {
        title: "ImanVibes",
        text: `${kindLabels[kind].shareIntro}\n\n${shareSummary}`.trim(),
        url: resolvedShareUrl,
      };

      if (isAndroidNativeApp) {
        await Share.share({
          ...sharePayload,
          dialogTitle: "Share from ImanVibes",
        });
        return;
      }

      if (navigator.share) {
        await navigator.share(sharePayload);
        return;
      }

      await navigator.clipboard.writeText(resolvedShareUrl);
      setShareLinkLabel("Link copied");
      window.setTimeout(() => setShareLinkLabel("Share link"), 1400);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setShareLinkLabel("Share link");
        return;
      }

      setShareLinkLabel("Try again");
      window.setTimeout(() => setShareLinkLabel("Share link"), 1400);
    }
  }

  async function createImageAsset() {
    if (!shareCardRef.current) {
      throw new Error("Share card missing");
    }
    const blob = await toBlob(shareCardRef.current, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: "#fffdf8",
    });

    if (!blob) {
      throw new Error("Image generation failed");
    }

    return {
      blob,
      file: new File([blob], `${kind}-${item.id}.png`, {
        type: "image/png",
      }),
    };
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

  function downloadImage(blob: Blob, filename: string) {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(blobUrl);
  }

  async function handleShareImage() {
    setShareImageLabel("Preparing...");
    const resolvedShareUrl = resolveShareUrl();

    try {
      const { blob, file } = await createImageAsset();

      if (isAndroidNativeApp) {
        const base64Data = await blobToBase64(blob);
        const path = `shares/${kind}-${item.id}.png`;
        const saved = await Filesystem.writeFile({
          path,
          data: base64Data,
          directory: Directory.Cache,
          recursive: true,
        });

        await Share.share({
          files: [saved.uri],
          dialogTitle: "Share image from ImanVibes",
        });

        setShareImageLabel("Shared");
        window.setTimeout(() => setShareImageLabel("Share image"), 1400);
        return;
      }

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
        });

        setShareImageLabel("Shared");
        window.setTimeout(() => setShareImageLabel("Share image"), 1400);
        return;
      }

      downloadImage(blob, file.name);
      setShareImageLabel("Downloaded");
      window.setTimeout(() => setShareImageLabel("Share image"), 1400);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setShareImageLabel("Share image");
        return;
      }

      setShareImageLabel("Try again");
      window.setTimeout(() => setShareImageLabel("Share image"), 1400);
    }
  }

  const MoodIcon = quranMood ? (moodIcons[quranMood] ?? MdFavorite) : null;
  const quranTranslation = item.translation ?? item.meaning ?? "";

  if (kind === "quran" && quranMood) {
    const relatedLinks = relatedMoodLinks.map((relatedMood) => ({
      href: relatedMood.href,
      label: relatedMood.label,
      icon: moodIcons[relatedMood.label] ?? MdFavorite,
    }));

    return (
      <FocusedContentDetail
        articleId={`${kind}-item-${item.id}`}
        badgeLabel={quranMood}
        badgeIcon={MoodIcon ?? undefined}
        source={item.source}
        arabic={item.arabic}
        transliteration={item.transliteration}
        bodyContent={
          quranTranslation ? (
            <p className="mx-auto max-w-xl text-[1.5rem] leading-[1.65] text-[var(--ink-900)] [font-family:var(--font-display)]">
              {quranTranslation}
            </p>
          ) : null
        }
        audioControl={<AudioPlayer arabicText={item.arabic} variant="icon" />}
        actionButtons={
          <div className="mt-4 grid grid-cols-2 gap-3" data-nosnippet>
            <ShareButton
              label={shareImageLabel}
              icon={<FaImage />}
              onClick={handleShareImage}
              className="rounded-[16px] px-5 py-4 text-sm font-semibold"
            />
            <ShareButton
              label={shareLinkLabel}
              icon={<FaShareNodes />}
              onClick={handleShareLink}
              className="!border-transparent !bg-[var(--sage-500)] !text-white rounded-[16px] px-5 py-4 text-sm font-semibold"
            />
          </div>
        }
        nextAction={
          <button
            type="button"
            onClick={handleNext}
            disabled={items.length <= 1}
            className={`mt-6 flex w-full items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--sage-500)] ${items.length <= 1 ? "cursor-not-allowed opacity-55" : "cursor-pointer"}`}
            data-nosnippet
          >
            {kindLabels[kind].next}
            <FaArrowRight className="text-xs" />
          </button>
        }
        relatedTitle="Explore more moods"
        relatedLinks={relatedLinks}
        shareCard={
          <div className="pointer-events-none fixed left-[-9999px] top-0 w-[720px]">
            <div
              ref={shareCardRef}
              className="rounded-[38px] border border-[#f1e5c8] bg-[#fffdf8] p-8 shadow-[0_24px_60px_rgba(77,101,86,0.08)]"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6f8f7b]">
                  ImanVibes
                </p>
                <p className="mt-2 text-sm text-[#566056]">
                  Quranic comfort for every mood
                </p>
              </div>

              <div className="mt-6 rounded-[30px] border border-[rgba(111,143,123,0.12)] bg-white p-8 shadow-[0_10px_24px_rgba(111,143,123,0.06)]">
                <p
                  dir="rtl"
                  lang="ar"
                  className="text-right text-[3rem] leading-[1.9] text-[#2f342f] [font-family:var(--font-arabic)]"
                >
                  {item.arabic}
                </p>

                {item.transliteration ? (
                  <p className="mt-6 text-lg italic leading-8 text-[#566056]">
                    {item.transliteration}
                  </p>
                ) : null}

                <p className="mt-6 text-[1.65rem] leading-[1.7] text-[#2f342f]">
                  {quranTranslation}
                </p>

                {item.source ? (
                  <p className="mt-6 text-lg font-medium text-[#6f8f7b]">
                    {item.source}
                  </p>
                ) : null}
              </div>

              <div className="mt-6 flex justify-end">
                <p className="text-right text-xs leading-5 text-[#566056]">
                  {siteDomain}
                </p>
              </div>
            </div>
          </div>
        }
      />
    );
  }

  if (kind === "duas" && duaOccasion) {
    const relatedLinks = relatedOccasionLinks.map((relatedOccasion) => ({
      href: relatedOccasion.href,
      label: relatedOccasion.label,
      icon: getDuaOccasionIcon(relatedOccasion.label),
    }));

    return (
      <FocusedContentDetail
        articleId={`${kind}-item-${item.id}`}
        badgeLabel={duaOccasion}
        source={item.source}
        arabic={item.arabic}
        transliteration={item.transliteration}
        bodyContent={
          item.translation ? (
            <p className="mx-auto max-w-xl text-[1.5rem] leading-[1.65] text-[var(--ink-900)] [font-family:var(--font-display)]">
              {item.translation}
            </p>
          ) : null
        }
        audioControl={<AudioPlayer arabicText={item.arabic} variant="icon" />}
        actionButtons={
          <div className="mt-4 grid grid-cols-2 gap-3" data-nosnippet>
            <ShareButton
              label={shareImageLabel}
              icon={<FaImage />}
              onClick={handleShareImage}
              className="rounded-[16px] px-5 py-4 text-sm font-semibold"
            />
            <ShareButton
              label={shareLinkLabel}
              icon={<FaShareNodes />}
              onClick={handleShareLink}
              className="!border-transparent !bg-[var(--sage-500)] !text-white rounded-[16px] px-5 py-4 text-sm font-semibold"
            />
          </div>
        }
        nextAction={
          <button
            type="button"
            onClick={handleNext}
            disabled={items.length <= 1}
            className={`mt-6 flex w-full items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--sage-500)] ${items.length <= 1 ? "cursor-not-allowed opacity-55" : "cursor-pointer"}`}
            data-nosnippet
          >
            {kindLabels[kind].next}
            <FaArrowRight className="text-xs" />
          </button>
        }
        relatedTitle="Explore more categories"
        relatedLinks={relatedLinks}
        shareCard={
          <div className="pointer-events-none fixed left-[-9999px] top-0 w-[720px]">
            <div
              ref={shareCardRef}
              className="rounded-[38px] border border-[#f1e5c8] bg-[#fffdf8] p-8 shadow-[0_24px_60px_rgba(77,101,86,0.08)]"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6f8f7b]">
                  ImanVibes
                </p>
                <p className="mt-2 text-sm text-[#566056]">
                  Supplications for every occasion
                </p>
              </div>

              <div className="mt-6 rounded-[30px] border border-[rgba(111,143,123,0.12)] bg-white p-8 shadow-[0_10px_24px_rgba(111,143,123,0.06)]">
                <p
                  dir="rtl"
                  lang="ar"
                  className="text-right text-[3rem] leading-[1.9] text-[#2f342f] [font-family:var(--font-arabic)]"
                >
                  {item.arabic}
                </p>

                {item.transliteration ? (
                  <p className="mt-6 text-lg italic leading-8 text-[#566056]">
                    {item.transliteration}
                  </p>
                ) : null}

                {item.translation ? (
                  <p className="mt-6 text-[1.65rem] leading-[1.7] text-[#2f342f]">
                    {item.translation}
                  </p>
                ) : null}

                {item.source ? (
                  <p className="mt-6 text-lg font-medium text-[#6f8f7b]">
                    {item.source}
                  </p>
                ) : null}
              </div>

              <div className="mt-6 flex justify-end">
                <p className="text-right text-xs leading-5 text-[#566056]">
                  {siteDomain}
                </p>
              </div>
            </div>
          </div>
        }
      />
    );
  }

  if (kind === "hadith") {
    return (
      <FocusedContentDetail
        articleId={`${kind}-item-${item.id}`}
        badgeLabel={kindLabels[kind].badge}
        source={item.source}
        arabic={item.arabic}
        transliteration={item.transliteration}
        bodyContent={
          item.translation ? (
            <p className="mx-auto max-w-xl text-[1.5rem] leading-[1.65] text-[var(--ink-900)] [font-family:var(--font-display)]">
              {item.translation}
            </p>
          ) : null
        }
        audioControl={<AudioPlayer arabicText={item.arabic} variant="icon" />}
        actionButtons={
          <div className="mt-4 grid grid-cols-2 gap-3" data-nosnippet>
            <ShareButton
              label={shareImageLabel}
              icon={<FaImage />}
              onClick={handleShareImage}
              className="rounded-[16px] px-5 py-4 text-sm font-semibold"
            />
            <ShareButton
              label={shareLinkLabel}
              icon={<FaShareNodes />}
              onClick={handleShareLink}
              className="!border-transparent !bg-[var(--sage-500)] !text-white rounded-[16px] px-5 py-4 text-sm font-semibold"
            />
          </div>
        }
        nextAction={
          <button
            type="button"
            onClick={handleNext}
            disabled={items.length <= 1}
            className={`mt-6 flex w-full items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--sage-500)] ${items.length <= 1 ? "cursor-not-allowed opacity-55" : "cursor-pointer"}`}
            data-nosnippet
          >
            {kindLabels[kind].next}
            <FaArrowRight className="text-xs" />
          </button>
        }
        shareCard={
          <div className="pointer-events-none fixed left-[-9999px] top-0 w-[720px]">
            <div
              ref={shareCardRef}
              className="rounded-[38px] border border-[#f1e5c8] bg-[#fffdf8] p-8 shadow-[0_24px_60px_rgba(77,101,86,0.08)]"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6f8f7b]">
                  ImanVibes
                </p>
                <p className="mt-2 text-sm text-[#566056]">
                  Short reminders to return to
                </p>
              </div>

              <div className="mt-6 rounded-[30px] border border-[rgba(111,143,123,0.12)] bg-white p-8 shadow-[0_10px_24px_rgba(111,143,123,0.06)]">
                <p
                  dir="rtl"
                  lang="ar"
                  className="text-right text-[3rem] leading-[1.9] text-[#2f342f] [font-family:var(--font-arabic)]"
                >
                  {item.arabic}
                </p>

                {item.transliteration ? (
                  <p className="mt-6 text-lg italic leading-8 text-[#566056]">
                    {item.transliteration}
                  </p>
                ) : null}

                {item.translation ? (
                  <p className="mt-6 text-[1.65rem] leading-[1.7] text-[#2f342f]">
                    {item.translation}
                  </p>
                ) : null}

                {item.source ? (
                  <p className="mt-6 text-lg font-medium text-[#6f8f7b]">
                    {item.source}
                  </p>
                ) : null}
              </div>

              <div className="mt-6 flex justify-end">
                <p className="text-right text-xs leading-5 text-[#566056]">
                  {siteDomain}
                </p>
              </div>
            </div>
          </div>
        }
      />
    );
  }

  if (kind === "names") {
    return (
      <FocusedContentDetail
        articleId={`${kind}-item-${item.id}`}
        badgeLabel={kindLabels[kind].badge}
        arabic={item.arabic}
        transliteration={item.transliteration}
        bodyContent={
          item.meaning ? (
            <p className="mx-auto max-w-xl text-[1.5rem] leading-[1.65] text-[var(--ink-900)] [font-family:var(--font-display)]">
              {item.meaning}
            </p>
          ) : null
        }
        audioControl={<AudioPlayer arabicText={item.arabic} variant="icon" />}
        actionButtons={
          <div className="mt-4 grid grid-cols-2 gap-3" data-nosnippet>
            <ShareButton
              label={shareImageLabel}
              icon={<FaImage />}
              onClick={handleShareImage}
              className="rounded-[16px] px-5 py-4 text-sm font-semibold"
            />
            <ShareButton
              label={shareLinkLabel}
              icon={<FaShareNodes />}
              onClick={handleShareLink}
              className="!border-transparent !bg-[var(--sage-500)] !text-white rounded-[16px] px-5 py-4 text-sm font-semibold"
            />
          </div>
        }
        nextAction={
          <button
            type="button"
            onClick={handleNext}
            disabled={items.length <= 1}
            className={`mt-6 flex w-full items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--sage-500)] ${items.length <= 1 ? "cursor-not-allowed opacity-55" : "cursor-pointer"}`}
            data-nosnippet
          >
            {kindLabels[kind].next}
            <FaArrowRight className="text-xs" />
          </button>
        }
        shareCard={
          <div className="pointer-events-none fixed left-[-9999px] top-0 w-[720px]">
            <div
              ref={shareCardRef}
              className="rounded-[38px] border border-[#f1e5c8] bg-[#fffdf8] p-8 shadow-[0_24px_60px_rgba(77,101,86,0.08)]"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6f8f7b]">
                  ImanVibes
                </p>
                <p className="mt-2 text-sm text-[#566056]">
                  Reflect through the names of Allah
                </p>
              </div>

              <div className="mt-6 rounded-[30px] border border-[rgba(111,143,123,0.12)] bg-white p-8 shadow-[0_10px_24px_rgba(111,143,123,0.06)]">
                <p
                  dir="rtl"
                  lang="ar"
                  className="text-right text-[3rem] leading-[1.9] text-[#2f342f] [font-family:var(--font-arabic)]"
                >
                  {item.arabic}
                </p>

                {item.transliteration ? (
                  <p className="mt-6 text-lg italic leading-8 text-[#566056]">
                    {item.transliteration}
                  </p>
                ) : null}

                {item.meaning ? (
                  <p className="mt-6 text-[1.65rem] leading-[1.7] text-[#2f342f]">
                    {item.meaning}
                  </p>
                ) : null}
              </div>

              <div className="mt-6 flex justify-end">
                <p className="text-right text-xs leading-5 text-[#566056]">
                  {siteDomain}
                </p>
              </div>
            </div>
          </div>
        }
      />
    );
  }

  return (
    <article
      id={`${kind}-item-${item.id}`}
      className="surface-section rounded-[30px] p-5"
    >
      <div className="flex items-center justify-between gap-3" data-nosnippet>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage-700)]">
          {kindLabels[kind].badge}
        </p>
        <span className="pill-soft whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold">
          {index + 1} / {items.length}
        </span>
      </div>

      <div className="surface-card mt-4 rounded-[26px] p-5">
        <p
          dir="rtl"
          lang="ar"
          className="text-right text-[1.9rem] leading-[1.9] text-[var(--ink-900)] [font-family:var(--font-arabic)]"
        >
          {item.arabic}
        </p>

        {item.transliteration ? (
          <p className={`mt-4 text-[var(--sage-700)] ${kind === "duas" ? "text-sm italic leading-6" : "text-sm font-semibold uppercase tracking-[0.16em]"}`}>
            {item.transliteration}
          </p>
        ) : null}

        {item.translation ? (
          <p className="mt-4 text-base leading-7 text-[var(--ink-900)]">
            {item.translation}
          </p>
        ) : null}

        {item.meaning ? (
          <p className="mt-3 text-base leading-7 text-[var(--ink-900)]">
            {item.meaning}
          </p>
        ) : null}

        {item.source ? (
          <p className="mt-3 text-sm font-medium text-[var(--sage-700)]">
            {item.source}
          </p>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3" data-nosnippet>
        <button
          type="button"
          onClick={handleNext}
          disabled={items.length <= 1}
          className={`button-primary rounded-full px-4 py-3 text-sm font-semibold ${items.length <= 1 ? "cursor-not-allowed opacity-55" : "cursor-pointer"}`}
        >
          {kindLabels[kind].next}
        </button>
        {item.arabic ? (
          <AudioPlayer arabicText={item.arabic} />
        ) : (
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="button-secondary cursor-not-allowed rounded-full px-4 py-3 text-sm font-semibold opacity-55"
          >
            Coming soon
          </button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3" data-nosnippet>
        <ShareButton
          label={shareImageLabel}
          icon={<FaImage />}
          onClick={handleShareImage}
        />
        <ShareButton
          label={shareLinkLabel}
          icon={<FaShareNodes />}
          onClick={handleShareLink}
          className="!border-transparent !bg-[var(--sage-500)] !text-white"
        />
      </div>

      <div className="pointer-events-none fixed left-[-9999px] top-0 w-[720px]">
        <div
          ref={shareCardRef}
          className="rounded-[38px] border border-[#f1e5c8] bg-[#fffdf8] p-8 shadow-[0_24px_60px_rgba(77,101,86,0.08)]"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6f8f7b]">
              ImanVibes
            </p>
            <p className="mt-2 text-sm text-[#566056]">
              Quranic comfort for every mood
            </p>
          </div>

          <div className="mt-6 rounded-[30px] border border-[rgba(111,143,123,0.12)] bg-white p-8 shadow-[0_10px_24px_rgba(111,143,123,0.06)]">
            <p
              dir="rtl"
              lang="ar"
              className="text-right text-[3rem] leading-[1.9] text-[#2f342f] [font-family:var(--font-arabic)]"
            >
              {item.arabic}
            </p>

            {item.transliteration ? (
              <p className="mt-6 text-lg font-semibold uppercase tracking-[0.18em] text-[#6f8f7b]">
                {item.transliteration}
              </p>
            ) : null}

            {item.translation ? (
              <p className="mt-6 text-[1.65rem] leading-[1.7] text-[#2f342f]">
                {item.translation}
              </p>
            ) : null}

            {item.meaning ? (
              <p className="mt-6 text-[1.65rem] leading-[1.7] text-[#2f342f]">
                {item.meaning}
              </p>
            ) : null}

            {item.source ? (
              <p className="mt-6 text-lg font-medium text-[#6f8f7b]">
                {item.source}
              </p>
            ) : null}
          </div>

          <div className="mt-6 flex justify-end">
            <p className="text-right text-xs leading-5 text-[#566056]">
              {siteDomain}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
