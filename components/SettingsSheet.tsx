"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  FaCircleInfo,
  FaGithub,
  FaGear,
  FaGlobe,
  FaMugHot,
  FaShareNodes,
  FaShieldHalved,
  FaXmark,
} from "react-icons/fa6";
import ThemeToggle from "@/components/ThemeToggle";

function SettingsCard({
  icon,
  title,
  body,
  children,
}: {
  icon: ReactNode;
  title: string;
  body?: string;
  children?: ReactNode;
}) {
  return (
    <article className="surface-card rounded-[24px] p-4">
      <div className="flex items-start gap-3">
        <span className="pill-soft inline-flex size-10 shrink-0 items-center justify-center rounded-full text-sm text-[var(--sage-700)]">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[var(--ink-900)]">
            {title}
          </h3>
          {body ? (
            <p className="mt-1 text-[0.82rem] leading-5 text-[var(--ink-700)]">
              {body}
            </p>
          ) : null}
          {children ? <div className="mt-3">{children}</div> : null}
        </div>
      </div>
    </article>
  );
}

export default function SettingsSheet() {
  const [open, setOpen] = useState(false);
  const [shareLabel, setShareLabel] = useState("Share ImanVibes");

  async function handleShare() {
    const url = window.location.origin || "https://imanvibes.vercel.app";
    const text =
      "Find Quranic comfort for every mood with ImanVibes 🌙";

    try {
      if (navigator.share) {
        await navigator.share({ title: "ImanVibes", text, url });
        setShareLabel("Shared");
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setShareLabel("Link copied");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      setShareLabel("Try again");
    } finally {
      window.setTimeout(() => setShareLabel("Share ImanVibes"), 1400);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="theme-toggle-shell flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-sm"
        aria-label="Open settings"
      >
        <FaGear />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/35 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-6 backdrop-blur-[8px]"
          data-nosnippet
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close settings"
            onClick={() => setOpen(false)}
          />

          <section className="surface-panel relative z-10 max-h-[88vh] w-full max-w-md overflow-y-auto rounded-[30px] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sage-700)]">
                  Settings
                </p>
                <h2 className="mt-1 text-[1.7rem] leading-tight tracking-[-0.04em] text-[var(--ink-900)] [font-family:var(--font-display)]">
                  App controls
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="theme-toggle-shell flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-sm"
                aria-label="Close settings"
              >
                <FaXmark />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <SettingsCard
                icon={<FaGear />}
                title="Appearance"
                body="Switch between light and dark reading mode."
              >
                <ThemeToggle variant="inline" iconOnly />
              </SettingsCard>

              <SettingsCard
                icon={<FaShareNodes />}
                title={shareLabel}
                body="Send the website link."
              >
                <button
                  type="button"
                  onClick={handleShare}
                  className="button-secondary flex cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold"
                >
                  <FaShareNodes className="text-sm" />
                  Share now
                </button>
              </SettingsCard>

              <SettingsCard
                icon={<FaCircleInfo />}
                title="About"
                body="ImanVibes brings Quran by Mood, Hadith, Duas, and the 99 Names into one calm app-like space."
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <SettingsLink
                href="https://github.com/moayaan1911/imanvibes"
                label="GitHub"
                icon={<FaGithub />}
              />
              <SettingsLink
                href="https://moayaan.com"
                label="moayaan.com"
                icon={<FaGlobe />}
              />
              <SettingsLink
                href="/privacy"
                label="Privacy"
                icon={<FaShieldHalved />}
              />
              <SettingsLink
                href="https://moayaan.com/donate"
                label="Support"
                icon={<FaMugHot />}
              />
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function SettingsLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  const external = href.startsWith("http");

  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="surface-card flex min-h-20 flex-col justify-between rounded-[24px] p-4 text-sm font-semibold text-[var(--ink-900)]"
    >
      <span className="text-[var(--sage-700)]">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
