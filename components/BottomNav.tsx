"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home" },
  { href: "/quran", label: "Quran" },
  { href: "/hadith", label: "Hadith" },
  { href: "/names", label: "Names" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="nav-shell fixed inset-x-0 bottom-0 z-20 px-4 pb-[calc(0.9rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur"
      data-nosnippet
    >
      <div className="mx-auto flex w-full max-w-md items-center justify-between gap-2">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`cursor-pointer flex-1 rounded-full px-3 py-2 text-center text-sm font-semibold ${
                active
                  ? "button-primary"
                  : "text-[var(--sage-700)]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
