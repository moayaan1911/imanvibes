"use client";

import { FaCompass } from "react-icons/fa6";
import AppBrandRow from "@/components/AppBrandRow";

export default function QiblaPage() {
  return (
    <div className="page-bg min-h-screen overflow-x-hidden">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-24 pt-5">
        <AppBrandRow showBackButton />

        <div className="flex flex-1 flex-col justify-center py-10">
          <section className="overflow-hidden rounded-[2rem] border border-[rgba(111,143,123,0.18)] bg-[var(--surface-solid)] shadow-[var(--shadow-card)]">
            <div className="relative flex h-60 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(173,206,184,0.34),_transparent_58%),linear-gradient(180deg,_rgba(255,249,239,0.98),_rgba(243,237,228,0.96))]">
              <div className="absolute h-56 w-56 rounded-full border border-[rgba(194,200,193,0.42)] bg-[rgba(255,255,255,0.62)]" />
              <div className="absolute h-44 w-44 rounded-full border border-[rgba(194,200,193,0.28)]" />
              <div className="absolute h-28 w-28 rounded-full border border-[rgba(194,200,193,0.2)]" />
              <div className="absolute h-px w-36 bg-[rgba(68,99,81,0.18)]" />
              <div className="absolute h-36 w-px bg-[rgba(68,99,81,0.18)]" />
              <div className="absolute flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(68,99,81,0.12)] bg-[rgba(255,255,255,0.88)] text-[var(--sage-500)] shadow-[0_10px_30px_-18px_rgba(68,99,81,0.5)]">
                <FaCompass className="text-lg" />
              </div>

              <div className="absolute inset-0 bg-[rgba(255,249,239,0.5)] backdrop-blur-[1.5px]" />

              <div className="absolute inset-0 flex items-center justify-center">
                <span className="rounded-full bg-[rgba(255,255,255,0.92)] px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[var(--sage-500)] shadow-[0_12px_30px_-18px_rgba(68,99,81,0.5)]">
                  Coming Soon
                </span>
              </div>
            </div>

            <div className="space-y-5 px-6 pb-7 pt-6 text-center">
              <div className="space-y-2">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[var(--sage-500)]">
                  Prayer Tools
                </p>
                <h1 className="font-display text-[2rem] tracking-[-0.04em] text-[var(--ink-900)]">
                  Qibla Finder
                </h1>
                <p className="mx-auto max-w-[290px] text-sm leading-6 text-[var(--ink-700)]">
                  This screen is temporarily disabled while we rework the compass experience.
                  The route stays reserved and the earlier native implementation is preserved in
                  the codebase for future work.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-[rgba(111,143,123,0.14)] bg-[var(--sand-100)] px-5 py-4 text-left">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--sage-500)]">
                  Planned Return
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--ink-700)]">
                  <li>Live device heading with a cleaner reliability pass</li>
                  <li>Location-based Qibla bearing and calibration flow</li>
                  <li>Re-enable after the native compass behavior is stable</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
