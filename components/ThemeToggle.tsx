"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FaMoon, FaSun } from "react-icons/fa6";

type Theme = "light" | "dark";
type ThemeToggleProps = {
  variant?: "floating" | "inline";
  hideOnHome?: boolean;
  iconOnly?: boolean;
};

const THEME_COLOR = {
  light: "#f7f1e8",
  dark: "#0f1512",
} as const;

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem("theme", theme);

  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute("content", THEME_COLOR[theme]);
}

export default function ThemeToggle({
  variant = "floating",
  hideOnHome = false,
  iconOnly = false,
}: ThemeToggleProps) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setTheme(
        document.documentElement.dataset.theme === "dark" ? "dark" : "light",
      );
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (hideOnHome && pathname === "/") {
    return null;
  }

  function handleToggle() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    setTheme(nextTheme);
  }

  const displayLabel = theme === "dark" ? "Light mode" : "Dark mode";

  const className =
    variant === "floating"
      ? "theme-toggle-shell fixed right-4 top-[max(1rem,env(safe-area-inset-top))] z-30 flex cursor-pointer items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold"
      : iconOnly
        ? "theme-toggle-shell flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-sm"
        : "theme-toggle-shell flex min-h-[2.55rem] shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.25 py-[0.55rem] text-[0.89rem] font-semibold whitespace-nowrap";

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={className}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      suppressHydrationWarning
      data-nosnippet
    >
      {theme === "dark" ? <FaSun /> : <FaMoon />}
      {iconOnly ? null : <span>{displayLabel}</span>}
    </button>
  );
}
