"use client";

import { useEffect, useRef, useState } from "react";
import { FaArrowUpFromBracket, FaMobileScreenButton } from "react-icons/fa6";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type InstallMode = "hidden" | "prompt" | "ios" | "fallback";

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

type AddToHomeButtonProps = {
  variant?: "floating" | "inline";
};

export default function AddToHomeButton({
  variant = "floating",
}: AddToHomeButtonProps) {
  const installPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [installMode, setInstallMode] = useState<InstallMode>("fallback");
  const [buttonLabel, setButtonLabel] = useState("Add to Home");
  const [showHelp, setShowHelp] = useState(false);
  const [fallbackHelpText, setFallbackHelpText] = useState(
    "If no prompt appears, open the browser menu and tap Install app or Add to Home Screen.",
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const userAgent = window.navigator.userAgent;
    const isArc = /\bArc\//i.test(userAgent);
    const isIPhoneLike = /iphone|ipad|ipod/i.test(userAgent);
    const isSafariDesktop =
      /Safari/i.test(userAgent) &&
      !/Chrome|CriOS|Edg|OPR|Arc/i.test(userAgent) &&
      !isIPhoneLike;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as NavigatorWithStandalone).standalone === true;

    const nextMode = isStandalone
      ? "hidden"
      : isIPhoneLike
        ? "ios"
        : "fallback";

    const frame = window.requestAnimationFrame(() => {
      setInstallMode(nextMode);
      setFallbackHelpText(
        isArc
          ? "Arc on desktop does not support installing PWAs. Open this site in Chrome or Edge to install it."
          : isSafariDesktop
            ? "In Safari on Mac, open the File menu and choose Add to Dock."
            : "If no prompt appears, open the browser menu and choose Install app or Add to Home Screen.",
      );
    });

    if (isStandalone) {
      return () => window.cancelAnimationFrame(frame);
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      installPromptRef.current = event as BeforeInstallPromptEvent;
      setInstallMode("prompt");
      setButtonLabel("Add to Home");
    }

    function handleInstalled() {
      installPromptRef.current = null;
      setInstallMode("hidden");
      setShowHelp(false);
      setButtonLabel("Add to Home");
    }

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener,
    );
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener,
      );
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function handleInstallClick() {
    if (installMode === "ios") {
      setShowHelp((currentValue) => !currentValue);
      return;
    }

    if (installMode === "fallback") {
      setShowHelp((currentValue) => !currentValue);
      return;
    }

    if (!installPromptRef.current) {
      return;
    }

    const promptEvent = installPromptRef.current;
    installPromptRef.current = null;
    setButtonLabel("Opening...");

    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;

    if (choice.outcome === "dismissed") {
      installPromptRef.current = promptEvent;
      setButtonLabel("Add to Home");
      return;
    }

    setButtonLabel("Installing...");
    window.setTimeout(() => setButtonLabel("Add to Home"), 1800);
  }

  if (installMode === "hidden") {
    return null;
  }

  const wrapperClassName =
    variant === "floating"
      ? "pointer-events-none fixed left-4 top-[max(1rem,env(safe-area-inset-top))] z-30"
      : "relative shrink-0";

  const buttonClassName =
    variant === "floating"
      ? "theme-toggle-shell pointer-events-auto flex cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold"
      : "theme-toggle-shell flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-semibold whitespace-nowrap";

  const helpClassName =
    variant === "floating"
      ? "surface-item pointer-events-auto mt-3 max-w-[15rem] rounded-[24px] px-4 py-3"
      : "surface-item absolute left-0 top-full z-40 mt-2 w-[15rem] rounded-[20px] px-4 py-3";

  return (
    <div className={wrapperClassName}>
      <button
        type="button"
        onClick={handleInstallClick}
        className={buttonClassName}
        data-nosnippet
      >
        {installMode === "ios" ? <FaArrowUpFromBracket /> : <FaMobileScreenButton />}
        <span>{buttonLabel}</span>
      </button>

      {showHelp ? (
        <div className={helpClassName} data-nosnippet>
          <p className="text-sm leading-6 text-[var(--ink-700)]">
            {installMode === "ios"
              ? "On iPhone or iPad, open the Share menu and tap Add to Home Screen."
              : fallbackHelpText}
          </p>
        </div>
      ) : null}
    </div>
  );
}
