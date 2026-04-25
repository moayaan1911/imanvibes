"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { IconType } from "react-icons";
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
  MdCloud,
  MdDarkMode,
  MdDiamond,
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
  MdSearch,
  MdSentimentDissatisfied,
  MdSentimentSatisfied,
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

type SearchCategory = {
  name: string;
  href: string;
  count: number;
};

type SearchItem = {
  id: string;
  categoryName: string;
  categoryHref: string;
  text: string;
};

type CategoryStyle = "default" | "mood-grid" | "dua-grid";

type SearchableGridProps = {
  categories: SearchCategory[];
  items: SearchItem[];
  categoryLabel: string;
  itemLabel: string;
  placeholder: string;
  categoryStyle?: CategoryStyle;
  showCategoryCounts?: boolean;
};

type MoodStyle = {
  icon: IconType;
  cardClassName: string;
  iconClassName: string;
  titleClassName: string;
  metaClassName: string;
};

const defaultMoodStyle: MoodStyle = {
  icon: MdVolunteerActivism,
  cardClassName: "bg-[#f3ede4] hover:bg-[#ede7df]",
  iconClassName: "text-[var(--sage-500)]",
  titleClassName: "text-[#2f342f]",
  metaClassName: "text-[#566056]",
};

const moodStyles: Record<string, MoodStyle> = {
  Sad: {
    icon: MdWaterDrop,
    cardClassName: "bg-[#f3ede4] hover:bg-[#ede7df]",
    iconClassName: "text-[var(--sage-500)]",
    titleClassName: "text-[#2f342f]",
    metaClassName: "text-[#566056]",
  },
  Anxious: {
    icon: MdTsunami,
    cardClassName: "bg-[#ede7df] hover:bg-[#e7e2d9]",
    iconClassName: "text-[#566056]",
    titleClassName: "text-[#2f342f]",
    metaClassName: "text-[#566056]",
  },
  Lonely: {
    icon: MdPerson,
    cardClassName: "bg-[#fbdc99] hover:bg-[#f3d28a]",
    iconClassName: "text-[#725b25]",
    titleClassName: "text-[#58440e]",
    metaClassName: "text-[#725b25]",
  },
  Angry: {
    icon: MdLocalFireDepartment,
    cardClassName: "bg-[#f9f3ea] hover:bg-[#f3ede4]",
    iconClassName: "text-[#9b3d22]",
    titleClassName: "text-[#2f342f]",
    metaClassName: "text-[#566056]",
  },
  Grateful: defaultMoodStyle,
  Thankful: {
    icon: MdFavorite,
    cardClassName: "bg-[#f3ede4] hover:bg-[#ede7df]",
    iconClassName: "text-[var(--sage-500)]",
    titleClassName: "text-[#2f342f]",
    metaClassName: "text-[#566056]",
  },
  Happy: {
    icon: MdSentimentSatisfied,
    cardClassName: "bg-[#f3ede4] hover:bg-[#ede7df]",
    iconClassName: "text-[#48624c]",
    titleClassName: "text-[#2f342f]",
    metaClassName: "text-[#566056]",
  },
  Celebration: {
    icon: MdCelebration,
    cardClassName: "bg-[#e7e2d9] hover:bg-[#dfd9d1]",
    iconClassName: "text-[#725b25]",
    titleClassName: "text-[#2f342f]",
    metaClassName: "text-[#566056]",
  },
  Hopeful: {
    icon: MdWbSunny,
    cardClassName: "bg-[#fedf9b] hover:bg-[#f7d685]",
    iconClassName: "text-[#725b25]",
    titleClassName: "text-[#251a00]",
    metaClassName: "text-[#58440e]",
  },
  Depressed: {
    icon: MdCloud,
    cardClassName: "bg-[#e7e2d9] hover:bg-[#dfd9d1]",
    iconClassName: "text-[#566056]",
    titleClassName: "text-[#2f342f]",
    metaClassName: "text-[#566056]",
  },
  Stressed: {
    icon: MdBolt,
    cardClassName: "bg-[#f9f3ea] hover:bg-[#f3ede4]",
    iconClassName: "text-[#566056]",
    titleClassName: "text-[#2f342f]",
    metaClassName: "text-[#566056]",
  },
  Lost: {
    icon: MdExplore,
    cardClassName: "bg-[#f3ede4] hover:bg-[#ede7df]",
    iconClassName: "text-[#48624c]",
    titleClassName: "text-[#2f342f]",
    metaClassName: "text-[#566056]",
  },
  Guilty: {
    icon: MdHistory,
    cardClassName: "bg-[#f3ede4] hover:bg-[#ede7df]",
    iconClassName: "text-[#566056]",
    titleClassName: "text-[#2f342f]",
    metaClassName: "text-[#566056]",
  },
  Heartbroken: {
    icon: MdHeartBroken,
    cardClassName: "bg-[#ede7df] hover:bg-[#e7e2d9]",
    iconClassName: "text-[#ba1a1a]",
    titleClassName: "text-[#2f342f]",
    metaClassName: "text-[#566056]",
  },
  Fearful: {
    icon: MdNightsStay,
    cardClassName: "bg-[#f3ede4] hover:bg-[#ede7df]",
    iconClassName: "text-[#566056]",
    titleClassName: "text-[#2f342f]",
    metaClassName: "text-[#566056]",
  },
  "Seeking Peace": {
    icon: MdSpa,
    cardClassName: "bg-[#5c7c68] hover:bg-[#53715d]",
    iconClassName: "text-[#f6fff6]",
    titleClassName: "text-[#f6fff6]",
    metaClassName: "text-[#dce8df]",
  },
  "Seeking Forgiveness": {
    icon: MdCleanHands,
    cardClassName: "bg-[#607b63] hover:bg-[#56715a]",
    iconClassName: "text-[#f7fff3]",
    titleClassName: "text-[#f7fff3]",
    metaClassName: "text-[#dde8de]",
  },
  "Low Iman": {
    icon: MdTrendingDown,
    cardClassName: "bg-[#f3ede4] hover:bg-[#ede7df]",
    iconClassName: "text-[#48624c]",
    titleClassName: "text-[#2f342f]",
    metaClassName: "text-[#566056]",
  },
  "Need Motivation": {
    icon: MdTrendingUp,
    cardClassName: "bg-[#f9f3ea] hover:bg-[#f3ede4]",
    iconClassName: "text-[var(--sage-500)]",
    titleClassName: "text-[#2f342f]",
    metaClassName: "text-[#566056]",
  },
  Patience: {
    icon: MdHourglassEmpty,
    cardClassName: "bg-[#f3ede4] hover:bg-[#ede7df]",
    iconClassName: "text-[#566056]",
    titleClassName: "text-[#2f342f]",
    metaClassName: "text-[#566056]",
  },
  Tawakkul: {
    icon: MdAnchor,
    cardClassName: "bg-[#446351] hover:bg-[#3d5949]",
    iconClassName: "text-white",
    titleClassName: "text-white",
    metaClassName: "text-[#dce8df]",
  },
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

export default function SearchableGrid({
  categories,
  items,
  categoryLabel,
  itemLabel,
  placeholder,
  categoryStyle = "default",
  showCategoryCounts = true,
}: SearchableGridProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!normalizedQuery) {
      return categories;
    }

    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(normalizedQuery),
    );
  }, [categories, normalizedQuery]);

  const filteredItems = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return items.filter((item) =>
      item.text.toLowerCase().includes(normalizedQuery),
    );
  }, [items, normalizedQuery]);

  const singleItemLabel = itemLabel.replace(/s$/, "");
  const showResults = normalizedQuery.length > 0;

  function renderCategory(cat: SearchCategory) {
    if (categoryStyle === "mood-grid") {
      const style = moodStyles[cat.name] ?? defaultMoodStyle;
      const Icon = style.icon;

      return (
        <Link
          key={cat.href}
          href={cat.href}
          className={`group relative flex aspect-square cursor-pointer flex-col justify-between overflow-hidden rounded-[20px] p-3.5 transition-colors ${style.cardClassName}`.trim()}
        >
          <Icon className={`text-[1.25rem] ${style.iconClassName}`.trim()} />
          <div className="mt-3">
            <p
              className={`text-[0.94rem] font-semibold leading-tight ${style.titleClassName}`.trim()}
            >
              {cat.name}
            </p>
            {showCategoryCounts ? (
              <p
                className={`mt-1 text-[11px] leading-4 ${style.metaClassName}`.trim()}
              >
                {cat.count} {cat.count === 1 ? singleItemLabel : itemLabel}
              </p>
            ) : null}
          </div>
        </Link>
      );
    }

    if (categoryStyle === "dua-grid") {
      const Icon = duaIcons[cat.name] ?? MdAutoStories;

      return (
        <Link
          key={cat.href}
          href={cat.href}
          className="group flex aspect-square flex-col items-center justify-center rounded-[20px] border border-transparent bg-[var(--surface-soft)] px-3 py-3 text-center transition-all hover:border-[color:rgba(111,143,123,0.3)] hover:bg-[var(--surface-strong)]"
        >
          <Icon className="mb-2 text-[1.55rem] text-[var(--sage-500)] transition-transform group-hover:scale-110" />
          <p className="min-h-[2.7rem] text-[11px] font-medium leading-snug text-[var(--ink-900)]">
            {cat.name}
          </p>
          {showCategoryCounts ? (
            <p className="mt-1 text-[10px] font-medium text-[var(--ink-700)]">
              {cat.count} {cat.count === 1 ? singleItemLabel : itemLabel}
            </p>
          ) : null}
        </Link>
      );
    }

    return (
      <Link
        key={cat.href}
        href={cat.href}
        className="surface-item cursor-pointer rounded-[24px] px-4 py-4"
      >
        <p className="text-sm font-semibold text-[var(--ink-900)]">
          {cat.name}
        </p>
        {showCategoryCounts ? (
          <p className="mt-1 text-xs leading-5 text-[var(--ink-700)]">
            {cat.count} {cat.count === 1 ? singleItemLabel : itemLabel}
          </p>
        ) : null}
      </Link>
    );
  }

  const gridClassName =
    categoryStyle === "mood-grid" || categoryStyle === "dua-grid"
      ? "mt-4 grid grid-cols-3 gap-3"
      : "mt-4 grid grid-cols-2 gap-3";

  const resultsGridClassName =
    categoryStyle === "mood-grid"
      ? "mt-3 grid grid-cols-3 gap-3"
      : categoryStyle === "dua-grid"
        ? "mt-4 grid grid-cols-3 gap-3"
        : "mt-3 grid grid-cols-2 gap-3";

  return (
    <>
      <div className="mt-4">
        {categoryStyle === "mood-grid" ? (
          <label className="relative block">
            <MdSearch className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-[1.55rem] text-[#7b817b] dark:text-[var(--ink-700)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-full border border-[#c6ccc4] bg-[#ede7dd] py-4 pl-14 pr-5 text-[1.05rem] text-[#5f6660] shadow-[0_2px_8px_rgba(97,120,108,0.08)] outline-none placeholder:text-[#7b817b] focus:border-[#aab7aa] focus:ring-2 focus:ring-[#d7ddd6] dark:border-[var(--surface-border)] dark:bg-[var(--surface-soft)] dark:text-[var(--ink-900)] dark:placeholder:text-[var(--ink-700)] dark:focus:ring-[var(--surface-line)]"
            />
          </label>
        ) : categoryStyle === "dua-grid" ? (
          <label className="relative block">
            <MdSearch className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[1.35rem] text-[var(--ink-700)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-full border border-[var(--surface-line)] bg-[var(--surface-solid)] py-3.5 pl-14 pr-6 text-[0.98rem] text-[var(--ink-900)] shadow-[0_2px_8px_rgba(97,120,108,0.06)] outline-none placeholder:text-[var(--ink-700)] focus:border-[var(--sage-400)] focus:ring-1 focus:ring-[var(--sage-400)]"
            />
          </label>
        ) : (
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-full border border-[var(--sage-200)] bg-[var(--surface-solid)] px-4 py-3 text-sm text-[var(--ink-900)] placeholder:text-[var(--ink-700)] focus:outline-none focus:ring-2 focus:ring-[var(--sage-400)]"
          />
        )}
      </div>

      {showResults ? (
        <>
          {filteredCategories.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sage-700)]">
                {categoryLabel}
              </p>
              <div className={resultsGridClassName}>
                {filteredCategories.map(renderCategory)}
              </div>
            </div>
          ) : null}

          {filteredItems.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sage-700)]">
                Matching {itemLabel}
              </p>
              <div className="mt-3 grid gap-3">
                {filteredItems.slice(0, 10).map((item) => (
                  <Link
                    key={`${item.categoryHref}-${item.id}`}
                    href={`${item.categoryHref}?item=${item.id}`}
                    className="surface-item cursor-pointer rounded-[24px] px-4 py-4"
                  >
                    <p className="text-xs font-medium text-[var(--sage-700)]">
                      {item.categoryName}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--ink-900)]">
                      {item.text}
                    </p>
                  </Link>
                ))}
                {filteredItems.length > 10 ? (
                  <p className="text-center text-xs text-[var(--ink-700)]">
                    +{filteredItems.length - 10} more results
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {filteredCategories.length === 0 && filteredItems.length === 0 ? (
            <p className="mt-6 text-center text-sm text-[var(--ink-700)]">
              No results found.
            </p>
          ) : null}
        </>
      ) : (
        <div className={gridClassName}>{categories.map(renderCategory)}</div>
      )}
    </>
  );
}
