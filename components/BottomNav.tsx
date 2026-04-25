"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaRegHand } from "react-icons/fa6";
import {
  MdAutoStories,
  MdDiamond,
  MdHome,
  MdMenuBook,
} from "react-icons/md";

const items = [
  { href: "/", label: "Home", icon: MdHome },
  { href: "/quran", label: "Quran", icon: MdMenuBook },
  { href: "/hadith", label: "Hadith", icon: MdAutoStories },
  { href: "/names", label: "Names", icon: MdDiamond },
  { href: "/duas", label: "Duas", icon: FaRegHand },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="nav-shell fixed inset-x-0 bottom-0 z-20 px-4 pb-[calc(0.9rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur"
      data-nosnippet
    >
      <div className="mx-auto grid w-full max-w-md grid-cols-5 items-center gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-w-0 flex-col items-center gap-2 px-1 py-1 text-center"
            >
              <span
                className={`flex h-11 min-w-[3.7rem] items-center justify-center rounded-[1.25rem] px-3 transition-all ${
                  active
                    ? "bg-[var(--sage-100)] text-[var(--sage-500)] shadow-[var(--shadow-item)]"
                    : "text-[var(--sage-700)]/95"
                }`}
              >
                <Icon className={item.label === "Duas" ? "text-[1.2rem]" : "text-[1.45rem]"} />
              </span>
              <span
                className={`min-w-0 text-[0.72rem] font-semibold uppercase tracking-[0.14em] ${
                  active ? "text-[var(--sage-500)]" : "text-[var(--ink-700)]"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
