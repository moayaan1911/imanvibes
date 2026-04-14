"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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

type SearchableGridProps = {
  categories: SearchCategory[];
  items: SearchItem[];
  categoryLabel: string;
  itemLabel: string;
  placeholder: string;
};

export default function SearchableGrid({
  categories,
  items,
  categoryLabel,
  itemLabel,
  placeholder,
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

  const showResults = normalizedQuery.length > 0;

  return (
    <>
      <div className="mt-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-full border border-[var(--sage-200)] bg-[var(--surface-solid)] px-4 py-3 text-sm text-[var(--ink-900)] placeholder:text-[var(--ink-700)] focus:outline-none focus:ring-2 focus:ring-[var(--sage-400)]"
        />
      </div>

      {showResults ? (
        <>
          {filteredCategories.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sage-700)]">
                {categoryLabel}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {filteredCategories.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    className="surface-item cursor-pointer rounded-[24px] px-4 py-4"
                  >
                    <p className="text-sm font-semibold text-[var(--ink-900)]">
                      {cat.name}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--ink-700)]">
                      {cat.count} {cat.count === 1 ? itemLabel.replace(/s$/, "") : itemLabel}
                    </p>
                  </Link>
                ))}
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
        <div className="mt-4 grid grid-cols-2 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="surface-item cursor-pointer rounded-[24px] px-4 py-4"
            >
              <p className="text-sm font-semibold text-[var(--ink-900)]">
                {cat.name}
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--ink-700)]">
                {cat.count} {cat.count === 1 ? itemLabel.replace(/s$/, "") : itemLabel}
              </p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
