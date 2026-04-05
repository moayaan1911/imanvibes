"use client";

import { toBlob } from "html-to-image";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FaTelegramPlane, FaWhatsapp } from "react-icons/fa";
import { FaCopy, FaDownload, FaShareNodes, FaXTwitter } from "react-icons/fa6";
import ShareButton from "@/components/ShareButton";

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
  kind: "quran" | "hadith" | "names";
  initialItemId?: string;
};

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
} as const;

export default function ContentCard({
  items,
  kind,
  initialItemId,
}: ContentCardProps) {
  const [copyLabel, setCopyLabel] = useState("Copy link");
  const [shareImageLabel, setShareImageLabel] = useState("Share image");
  const [downloadImageLabel, setDownloadImageLabel] = useState("Download image");
  const shareCardRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedItem = searchParams.get("item");
  const activeItemId = requestedItem ?? initialItemId ?? null;
  const runtimeOrigin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
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
    const params = new URLSearchParams(searchParams.toString());

    if (params.get("item") === item.id) {
      return;
    }

    params.set("item", item.id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [item.id, pathname, router, searchParams]);

  const shareUrl = useMemo(() => {
    if (!runtimeOrigin) {
      return "";
    }

    const url = new URL(pathname, runtimeOrigin);
    url.searchParams.set("item", item.id);
    return url.toString();
  }, [item.id, pathname, runtimeOrigin]);

  const shareHomeUrl = useMemo(() => {
    if (!runtimeOrigin) {
      return "";
    }

    return runtimeOrigin.replace(/^https?:\/\//, "");
  }, [runtimeOrigin]);

  function resolveShareUrl() {
    if (shareUrl) {
      return shareUrl;
    }

    if (typeof window === "undefined") {
      return "";
    }

    const url = new URL(pathname, window.location.origin);
    url.searchParams.set("item", item.id);
    return url.toString();
  }

  const longShareText = useMemo(() => {
    const lines =
      kind === "names"
        ? [
            kindLabels[kind].shareIntro,
            "",
            item.arabic,
            item.transliteration,
            item.meaning,
            "",
            `Read it here: ${shareUrl}`,
          ]
        : [
            kindLabels[kind].shareIntro,
            "",
            item.arabic,
            item.translation,
            item.source ? `- ${item.source}` : undefined,
            "",
            `Read it here: ${shareUrl}`,
          ];

    return lines.filter(Boolean).join("\n");
  }, [item, kind, shareUrl]);

  const shortShareText = useMemo(() => {
    const summary =
      kind === "names"
        ? `${item.transliteration} - ${item.meaning}`
        : `${item.translation}${item.source ? ` - ${item.source}` : ""}`;

    const condensed = summary.length > 180 ? `${summary.slice(0, 177)}...` : summary;

    return `${kindLabels[kind].shareIntro} ${condensed} ${shareUrl}`.trim();
  }, [item, kind, shareUrl]);

  async function handleCopy() {
    const urlToCopy = resolveShareUrl();

    if (!urlToCopy) {
      setCopyLabel("Copy failed");
      window.setTimeout(() => setCopyLabel("Copy link"), 1400);
      return;
    }

    try {
      await navigator.clipboard.writeText(urlToCopy);
      setCopyLabel("Link copied");
      window.setTimeout(() => setCopyLabel("Copy link"), 1400);
    } catch {
      setCopyLabel("Copy failed");
      window.setTimeout(() => setCopyLabel("Copy link"), 1400);
    }
  }

  function handleNext() {
    const nextItem = items[(index + 1) % items.length];
    const params = new URLSearchParams(searchParams.toString());
    params.set("item", nextItem.id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setCopyLabel("Copy link");
  }

  function openShareWindow(platform: "whatsapp" | "x" | "telegram") {
    const resolvedShareUrl = resolveShareUrl();
    const text =
      platform === "whatsapp" || platform === "telegram"
        ? longShareText.replace(shareUrl, resolvedShareUrl)
        : shortShareText.replace(shareUrl, resolvedShareUrl);
    const href =
      platform === "whatsapp"
        ? `https://wa.me/?text=${encodeURIComponent(text)}`
        : platform === "telegram" && resolvedShareUrl
          ? `https://t.me/share/url?url=${encodeURIComponent(resolvedShareUrl)}&text=${encodeURIComponent(
              kindLabels[kind].shareIntro,
            )}`
          : `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;

    window.open(href, "_blank", "noopener,noreferrer");
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

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "ImanVibes",
          text: `${kindLabels[kind].shareIntro} ${resolvedShareUrl}`.trim(),
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
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--sage-700)]">
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
          className="button-primary cursor-pointer rounded-full px-4 py-3 text-sm font-semibold"
        >
          {kindLabels[kind].next}
        </button>
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="button-secondary cursor-not-allowed rounded-full px-4 py-3 text-sm font-semibold opacity-55"
        >
          Coming soon
        </button>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-3" data-nosnippet>
        <ShareButton
          label="WhatsApp"
          icon={<FaWhatsapp />}
          onClick={() => openShareWindow("whatsapp")}
          iconOnly
        />
        <ShareButton
          label="X"
          icon={<FaXTwitter />}
          onClick={() => openShareWindow("x")}
          iconOnly
        />
        <ShareButton
          label="Telegram"
          icon={<FaTelegramPlane />}
          onClick={() => openShareWindow("telegram")}
          iconOnly
        />
        <ShareButton
          label={copyLabel}
          icon={<FaCopy />}
          onClick={handleCopy}
          iconOnly
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3" data-nosnippet>
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
              {shareHomeUrl}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
