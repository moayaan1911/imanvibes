"use client";

import { toBlob } from "html-to-image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { IconType } from "react-icons";
import { FaArrowRight, FaImage, FaShareNodes } from "react-icons/fa6";
import {
  MdAccountBalance,
  MdAllInclusive,
  MdAnchor,
  MdAutoStories,
  MdBed,
  MdBolt,
  MdCelebration,
  MdCheckroom,
  MdCleanHands,
  MdDarkMode,
  MdDining,
  MdDirectionsCar,
  MdDiversity1,
  MdExitToApp,
  MdExplore,
  MdFace,
  MdFavorite,
  MdFilter3,
  MdFlightTakeoff,
  MdHealthAndSafety,
  MdHeartBroken,
  MdHistory,
  MdHome,
  MdHourglassEmpty,
  MdLightMode,
  MdLocalDrink,
  MdLocalFireDepartment,
  MdMeetingRoom,
  MdMenuBook,
  MdNightsStay,
  MdPerson,
  MdRestaurant,
  MdSentimentDissatisfied,
  MdSetMeal,
  MdSick,
  MdSingleBed,
  MdSpa,
  MdSupport,
  MdThunderstorm,
  MdTrendingDown,
  MdTrendingUp,
  MdTsunami,
  MdVolunteerActivism,
  MdWaterDrop,
  MdWbSunny,
  MdWbTwilight,
} from "react-icons/md";
import AudioPlayer from "@/components/AudioPlayer";
import ShareButton from "@/components/ShareButton";
import { siteDomain } from "@/lib/site";

export type ContentCardItem = {
  id: string;
  arabic: string;
  translation?: string;
  source?: string;
  transliteration?: string;
  meaning?: string;
};

type RelatedLink = {
  href: string;
  label: string;
};

type ContentCardProps = {
  items: ContentCardItem[];
  kind: "quran" | "hadith" | "names" | "duas";
  initialItemId?: string;
  quranMood?: string;
  relatedMoodLinks?: RelatedLink[];
  duaOccasion?: string;
  relatedOccasionLinks?: RelatedLink[];
};

type FeatureCardProps = {
  articleId: string;
  badgeLabel: string;
  badgeIcon?: IconType;
  source?: string;
  arabic: string;
  transliteration?: string;
  bodyContent?: ReactNode;
  audioControl: ReactNode;
  actionButtons: ReactNode;
  nextAction: ReactNode;
  relatedTitle?: string;
  relatedLinks?: (RelatedLink & { icon?: IconType })[];
  shareCard: ReactNode;
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
  Celebration: MdCelebration,
  Heartbroken: MdHeartBroken,
  Guilty: MdHistory,
  "Low Iman": MdTrendingDown,
  "Need Motivation": MdTrendingUp,
  "Seeking Peace": MdSpa,
  "Seeking Forgiveness": MdCleanHands,
  Tawakkul: MdAnchor,
};

const duaIcons: Record<string, IconType> = {
  "Morning and evening": MdWbTwilight,
  "Before studying / facing difficulty": MdMenuBook,
  "For parents": MdDiversity1,
  "General supplication": MdVolunteerActivism,
  "Morning and evening (100 times)": MdAllInclusive,
  "Morning and evening (3 times)": MdFilter3,
  "After drinking milk": MdLocalDrink,
  "After eating": MdRestaurant,
  "After eating (alternative)": MdDining,
  "After rainfall": MdWaterDrop,
  "After tashahhud before salam": MdAccountBalance,
  "Before eating": MdSetMeal,
  "Before sleep": MdBed,
  "Before sleep (alternative)": MdSingleBed,
  "Before studying / seeking knowledge": MdMenuBook,
  "Before travel": MdFlightTakeoff,
  "Before travel / boarding transport": MdDirectionsCar,
  "Entering home": MdHome,
  "Entering mosque": MdAccountBalance,
  "Evening remembrance": MdDarkMode,
  "For anxiety and stress": MdHealthAndSafety,
  "For anxiety, stress, and worry": MdSpa,
  "For distress and hardship": MdSentimentDissatisfied,
  "For stress and difficulty": MdSupport,
  "Forgetting to say Bismillah before eating": MdRestaurant,
  "Hearing thunder": MdThunderstorm,
  "Leaving home": MdMeetingRoom,
  "Leaving mosque": MdExitToApp,
  "Morning and evening (Sayyidul Istighfar)": MdCleanHands,
  "Morning remembrance": MdWbSunny,
  "Responding to someone's sneeze": MdHealthAndSafety,
  "Response when sneezer says Alhamdulillah": MdVolunteerActivism,
  "Upon waking up": MdLightMode,
  "Wearing new clothes": MdCheckroom,
  "When it rains": MdWaterDrop,
  "When looking in mirror": MdFace,
  "When sneezing (sneezer says)": MdSick,
};

function FeatureCard({
  articleId,
  badgeLabel,
  badgeIcon: BadgeIcon,
  source,
  arabic,
  transliteration,
  bodyContent,
  audioControl,
  actionButtons,
  nextAction,
  relatedTitle,
  relatedLinks = [],
  shareCard,
}: FeatureCardProps) {
  return (
    <article id={articleId} className="mt-4">
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-soft)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-700)]">
          {BadgeIcon ? (
            <BadgeIcon className="text-[1rem] text-[var(--sage-500)]" />
          ) : null}
          {badgeLabel}
        </span>
      </div>

      <div className="relative mt-4 overflow-hidden rounded-[28px] bg-[var(--surface-soft)] px-6 py-8 text-center shadow-[var(--shadow-soft)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--sage-200)] to-transparent" />

        {source ? (
          <div className="mb-6">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--sage-500)]">
              {source}
            </span>
          </div>
        ) : null}

        <div className="mb-6">
          <p
            dir="rtl"
            lang="ar"
            className="text-right text-[2.35rem] leading-[1.85] text-[var(--ink-900)] [font-family:var(--font-arabic)] sm:text-[3rem]"
          >
            {arabic}
          </p>
        </div>

        <div className="mb-6 flex justify-center">{audioControl}</div>

        {transliteration ? (
          <p className="mx-auto mb-6 max-w-xl text-base italic leading-8 text-[var(--ink-700)]">
            {transliteration}
          </p>
        ) : null}

        <div className="mx-auto mb-6 h-px w-12 bg-[color:rgba(114,121,115,0.45)]" />

        {bodyContent}
      </div>

      {actionButtons}
      {nextAction}

      {relatedLinks.length > 0 ? (
        <div className="mt-8 text-center">
          {relatedTitle ? (
            <h2 className="text-[1.6rem] font-medium tracking-[-0.03em] text-[var(--ink-900)] [font-family:var(--font-display)]">
              {relatedTitle}
            </h2>
          ) : null}
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {relatedLinks.map((link) => {
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-strong)] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-700)]"
                >
                  {Icon ? (
                    <Icon className="text-[1rem] text-[var(--sage-500)]" />
                  ) : null}
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      {shareCard}
    </article>
  );
}

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
  }, [
    item.id,
    kind,
    pathname,
    requestedItem,
    router,
    searchParams,
    searchParamsString,
  ]);

  const shareUrl = useMemo(() => {
    if (!runtimeOrigin) {
      return "";
    }

    return new URL(buildItemHref(kind, pathname, item.id), runtimeOrigin).toString();
  }, [item.id, kind, pathname, runtimeOrigin]);

  function resolveShareUrl() {
    if (shareUrl) {
      return shareUrl;
    }

    if (typeof window === "undefined") {
      return "";
    }

    return new URL(
      buildItemHref(kind, pathname, item.id),
      window.location.origin,
    ).toString();
  }

  const shareText = useMemo(() => {
    const summary =
      kind === "names"
        ? `${item.transliteration} - ${item.meaning}`.trim()
        : `${item.translation ?? ""}${item.source ? `\n${item.source}` : ""}`.trim();

    return `${kindLabels[kind].shareIntro}\n\n${summary}\n\n${shareUrl}`.trim();
  }, [item, kind, shareUrl]);

  async function handleShareLink() {
    setShareLinkLabel("Sharing...");
    const resolvedShareUrl = resolveShareUrl();
    const resolvedText = shareText.replace(shareUrl, resolvedShareUrl);

    try {
      if (navigator.share) {
        await navigator.share({
          title: "ImanVibes",
          text: resolvedText,
          url: resolvedShareUrl,
        });
        setShareLinkLabel("Shared");
      } else {
        await navigator.clipboard.writeText(resolvedShareUrl);
        setShareLinkLabel("Link copied");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setShareLinkLabel("Share link");
        return;
      }

      setShareLinkLabel("Try again");
    } finally {
      window.setTimeout(() => setShareLinkLabel("Share link"), 1400);
    }
  }

  function handleNext() {
    const nextItem = items[(index + 1) % items.length];
    router.replace(buildItemHref(kind, pathname, nextItem.id), { scroll: false });
    setShareLinkLabel("Share link");
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

    try {
      const { blob, file } = await createImageAsset();

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
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

  const bodyText = item.translation ?? item.meaning ?? "";
  const commonActions = (
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
        onClick={() => void handleShareLink()}
        className="!border-transparent !bg-[var(--sage-500)] !text-white rounded-[16px] px-5 py-4 text-sm font-semibold"
      />
    </div>
  );
  const nextAction = (
    <button
      type="button"
      onClick={handleNext}
      disabled={items.length <= 1}
      className={`mt-6 flex w-full items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--sage-500)] ${
        items.length <= 1 ? "cursor-not-allowed opacity-55" : "cursor-pointer"
      }`}
      data-nosnippet
    >
      {kindLabels[kind].next}
      <FaArrowRight className="text-xs" />
    </button>
  );

  const shareCardSubtitle =
    kind === "hadith"
      ? "Short reminders to return to"
      : kind === "names"
        ? "Reflect through the names of Allah"
        : kind === "duas"
          ? "Supplications for every occasion"
          : "Quranic comfort for every mood";

  const shareCard = (
    <div className="pointer-events-none fixed left-[-9999px] top-0 w-[720px]">
      <div
        ref={shareCardRef}
        className="rounded-[38px] border border-[#f1e5c8] bg-[#fffdf8] p-8 shadow-[0_24px_60px_rgba(77,101,86,0.08)]"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6f8f7b]">
            ImanVibes
          </p>
          <p className="mt-2 text-sm text-[#566056]">{shareCardSubtitle}</p>
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
            <p
              className={`mt-6 text-lg ${
                kind === "quran" || kind === "duas" || kind === "hadith"
                  ? "italic leading-8 text-[#566056]"
                  : "italic leading-8 text-[#566056]"
              }`}
            >
              {item.transliteration}
            </p>
          ) : null}
          {bodyText ? (
            <p className="mt-6 text-[1.65rem] leading-[1.7] text-[#2f342f]">
              {bodyText}
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
  );

  if (kind === "quran" && quranMood) {
    const relatedLinks = relatedMoodLinks.map((link) => ({
      ...link,
      icon: moodIcons[link.label] ?? MdFavorite,
    }));
    const BadgeIcon = moodIcons[quranMood] ?? MdFavorite;

    return (
      <FeatureCard
        articleId={`${kind}-item-${item.id}`}
        badgeLabel={quranMood}
        badgeIcon={BadgeIcon}
        source={item.source}
        arabic={item.arabic}
        transliteration={item.transliteration}
        bodyContent={
          bodyText ? (
            <p className="mx-auto max-w-xl text-[1.5rem] leading-[1.65] text-[var(--ink-900)] [font-family:var(--font-display)]">
              {bodyText}
            </p>
          ) : null
        }
        audioControl={<AudioPlayer arabicText={item.arabic} variant="icon" />}
        actionButtons={commonActions}
        nextAction={nextAction}
        relatedTitle="Explore more moods"
        relatedLinks={relatedLinks}
        shareCard={shareCard}
      />
    );
  }

  if (kind === "duas" && duaOccasion) {
    const relatedLinks = relatedOccasionLinks.map((link) => ({
      ...link,
      icon: duaIcons[link.label] ?? MdAutoStories,
    }));

    return (
      <FeatureCard
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
        actionButtons={commonActions}
        nextAction={nextAction}
        relatedTitle="Explore more categories"
        relatedLinks={relatedLinks}
        shareCard={shareCard}
      />
    );
  }

  return (
    <FeatureCard
      articleId={`${kind}-item-${item.id}`}
      badgeLabel={kindLabels[kind].badge}
      source={item.source}
      arabic={item.arabic}
      transliteration={item.transliteration}
      bodyContent={
        bodyText ? (
          <p className="mx-auto max-w-xl text-[1.5rem] leading-[1.65] text-[var(--ink-900)] [font-family:var(--font-display)]">
            {bodyText}
          </p>
        ) : null
      }
      audioControl={<AudioPlayer arabicText={item.arabic} variant="icon" />}
      actionButtons={commonActions}
      nextAction={nextAction}
      shareCard={shareCard}
    />
  );
}
