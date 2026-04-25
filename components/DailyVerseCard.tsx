"use client";

import { toBlob } from "html-to-image";
import { useRef, useState } from "react";
import { FaShareNodes } from "react-icons/fa6";
import { MdAutoStories } from "react-icons/md";
import AudioPlayer from "@/components/AudioPlayer";
import { siteDomain } from "@/lib/site";

type DailyVerseCardProps = {
  arabic: string;
  translation: string;
  source: string;
  transliteration?: string;
  date?: string;
};

type ShareState = "idle" | "preparing" | "shared" | "downloaded" | "error";

export default function DailyVerseCard({
  arabic,
  translation,
  source,
  transliteration,
  date,
}: DailyVerseCardProps) {
  const [shareState, setShareState] = useState<ShareState>("idle");
  const shareCardRef = useRef<HTMLDivElement>(null);

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
      file: new File([blob], `daily-verse-${date ?? "home"}.png`, {
        type: "image/png",
      }),
    };
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
    setShareState("preparing");

    try {
      const { blob, file } = await createImageAsset();

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
        setShareState("shared");
        window.setTimeout(() => setShareState("idle"), 1400);
        return;
      }

      downloadImage(blob, file.name);
      setShareState("downloaded");
      window.setTimeout(() => setShareState("idle"), 1400);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setShareState("idle");
        return;
      }

      setShareState("error");
      window.setTimeout(() => setShareState("idle"), 1400);
    }
  }

  const shareLabel =
    shareState === "preparing"
      ? "Preparing daily verse image"
      : shareState === "shared"
        ? "Daily verse image shared"
        : shareState === "downloaded"
          ? "Daily verse image downloaded"
          : shareState === "error"
            ? "Daily verse image share failed"
            : "Share daily verse image";

  return (
    <section className="relative mt-8 overflow-hidden rounded-[24px] border border-[var(--surface-line)] bg-[var(--surface-soft)] p-6">
      <div className="absolute right-0 top-0 p-4 opacity-10">
        <MdAutoStories className="text-[4rem]" />
      </div>

      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-[var(--sage-500)]">✦</span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--sage-700)]">
          Daily Verse
        </span>
      </div>

      <div
        dir="rtl"
        lang="ar"
        className="mb-2 text-right text-[2rem] leading-[1.8] text-[var(--ink-900)] [font-family:var(--font-arabic)]"
      >
        {arabic}
      </div>

      {transliteration ? (
        <div className="mb-6 text-right text-sm text-[var(--ink-700)]" dir="ltr">
          {transliteration}
        </div>
      ) : null}

      <p className="mb-4 border-l-2 border-[rgba(68,99,81,0.3)] pl-4 text-[1.05rem] italic leading-7 text-[var(--ink-700)]">
        “{translation}”
      </p>

      <div className="mt-6 flex items-center justify-between border-t border-[var(--surface-line)] pt-4">
        <span className="text-[11px] font-medium text-[var(--ink-700)]">
          {source}
        </span>
        <div className="flex items-center gap-2" data-nosnippet>
          <div className="origin-center scale-[0.72]">
            <AudioPlayer arabicText={arabic} variant="icon" />
          </div>
          <button
            type="button"
            onClick={() => void handleShareImage()}
            aria-label={shareLabel}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-strong)] text-[var(--ink-700)] transition-colors hover:bg-[rgba(68,99,81,0.1)] hover:text-[var(--sage-700)]"
          >
            <FaShareNodes className="text-sm" />
          </button>
        </div>
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
            <p className="mt-2 text-sm text-[#566056]">Daily Verse</p>
          </div>

          <div className="mt-6 rounded-[30px] border border-[rgba(111,143,123,0.12)] bg-white p-8 shadow-[0_10px_24px_rgba(111,143,123,0.06)]">
            <p
              dir="rtl"
              lang="ar"
              className="text-right text-[3rem] leading-[1.9] text-[#2f342f] [font-family:var(--font-arabic)]"
            >
              {arabic}
            </p>
            {transliteration ? (
              <p className="mt-6 text-lg text-[#566056]">{transliteration}</p>
            ) : null}
            <p className="mt-6 text-[1.65rem] leading-[1.7] text-[#2f342f]">
              {translation}
            </p>
            <p className="mt-6 text-lg font-medium text-[#6f8f7b]">
              {source}
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <p className="text-right text-xs leading-5 text-[#566056]">
              {siteDomain}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
