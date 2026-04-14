"use client";

import { toBlob } from "html-to-image";
import { useRef, useState, useSyncExternalStore } from "react";
import { FaDownload, FaShareNodes } from "react-icons/fa6";
import ShareButton from "@/components/ShareButton";

type DailyVerseCardProps = {
  arabic: string;
  translation: string;
  source: string;
  mood: string;
  date: string;
};

export default function DailyVerseCard({
  arabic,
  translation,
  source,
  mood,
  date,
}: DailyVerseCardProps) {
  const [shareImageLabel, setShareImageLabel] = useState("Share image");
  const [downloadImageLabel, setDownloadImageLabel] = useState("Download image");
  const shareCardRef = useRef<HTMLDivElement>(null);
  const runtimeOrigin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );

  const shareHomeUrl = runtimeOrigin
    ? runtimeOrigin.replace(/^https?:\/\//, "")
    : "";

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
      file: new File([blob], `daily-verse-${date}.png`, {
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
    setShareImageLabel("Preparing...");

    try {
      const { blob, file } = await createImageAsset();

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "ImanVibes",
          text: "Today's verse from ImanVibes",
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

  async function handleDownloadImage() {
    setDownloadImageLabel("Preparing...");

    try {
      const { blob, file } = await createImageAsset();
      downloadImage(blob, file.name);
      setDownloadImageLabel("Downloaded");
      window.setTimeout(() => setDownloadImageLabel("Download image"), 1400);
    } catch {
      setDownloadImageLabel("Try again");
      window.setTimeout(() => setDownloadImageLabel("Download image"), 1400);
    }
  }

  return (
    <section className="surface-panel rounded-[32px] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage-700)]">
            Daily Verse
          </p>
          <p className="mt-1 text-xs text-[var(--ink-700)]">{date}</p>
        </div>
        <span className="pill-soft whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold">
          {mood}
        </span>
      </div>

      <div className="surface-card mt-4 rounded-[28px] p-5">
        <p
          dir="rtl"
          lang="ar"
          className="text-right text-[1.8rem] leading-[1.9] text-[var(--ink-900)] [font-family:var(--font-arabic)]"
        >
          {arabic}
        </p>
        <p className="mt-4 text-base leading-7 text-[var(--ink-900)]">
          {translation}
        </p>
        <p className="mt-3 text-sm font-medium text-[var(--sage-700)]">
          {source}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3" data-nosnippet>
        <ShareButton
          label={shareImageLabel}
          icon={<FaShareNodes />}
          onClick={handleShareImage}
        />
        <ShareButton
          label={downloadImageLabel}
          icon={<FaDownload />}
          onClick={handleDownloadImage}
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
              Daily Verse — {date}
            </p>
          </div>

          <div className="mt-6 rounded-[30px] border border-[rgba(111,143,123,0.12)] bg-white p-8 shadow-[0_10px_24px_rgba(111,143,123,0.06)]">
            <p
              dir="rtl"
              lang="ar"
              className="text-right text-[3rem] leading-[1.9] text-[#2f342f] [font-family:var(--font-arabic)]"
            >
              {arabic}
            </p>

            <p className="mt-6 text-[1.65rem] leading-[1.7] text-[#2f342f]">
              {translation}
            </p>

            <p className="mt-6 text-lg font-medium text-[#6f8f7b]">
              {source}
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <p className="text-right text-xs leading-5 text-[#566056]">
              {shareHomeUrl}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
