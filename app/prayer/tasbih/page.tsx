"use client";

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { FaArrowRight, FaRotateRight } from "react-icons/fa6";
import AppBrandRow from "@/components/AppBrandRow";

const STORAGE_KEY = "imanvibes-tasbih-state-v2";
const DHIKR_OPTIONS = [
  "SubhanAllah",
  "Alhamdulillah",
  "Allahu Akbar",
  "Astaghfirullah",
  "Salawat",
] as const;
const PRESETS = [33, 99] as const;
const CIRCUMFERENCE = 301.59;

type DhikrOption = (typeof DHIKR_OPTIONS)[number];
type TasbihState = {
  dhikr: DhikrOption;
  count: number;
  preset: (typeof PRESETS)[number];
};

const DEFAULT_STATE: TasbihState = {
  dhikr: "SubhanAllah",
  count: 0,
  preset: 33,
};
const CONFETTI_PIECES = [
  { left: "10%", color: "#6f8f7b", delay: "0ms", x: "-88px", y: "-138px", rotate: "-36deg", width: "10px", height: "20px" },
  { left: "16%", color: "#c6aa6b", delay: "70ms", x: "-52px", y: "-164px", rotate: "28deg", width: "8px", height: "16px" },
  { left: "22%", color: "#8ca88e", delay: "20ms", x: "-104px", y: "-108px", rotate: "-20deg", width: "11px", height: "18px" },
  { left: "30%", color: "#e8d8ad", delay: "110ms", x: "-36px", y: "-176px", rotate: "34deg", width: "9px", height: "18px" },
  { left: "38%", color: "#6f8f7b", delay: "50ms", x: "-18px", y: "-148px", rotate: "-16deg", width: "10px", height: "20px" },
  { left: "46%", color: "#c6aa6b", delay: "145ms", x: "0px", y: "-186px", rotate: "20deg", width: "8px", height: "14px" },
  { left: "54%", color: "#8ca88e", delay: "40ms", x: "18px", y: "-154px", rotate: "-24deg", width: "12px", height: "18px" },
  { left: "62%", color: "#e8d8ad", delay: "100ms", x: "42px", y: "-176px", rotate: "32deg", width: "9px", height: "16px" },
  { left: "70%", color: "#6f8f7b", delay: "80ms", x: "84px", y: "-128px", rotate: "-30deg", width: "10px", height: "18px" },
  { left: "78%", color: "#c6aa6b", delay: "160ms", x: "102px", y: "-152px", rotate: "24deg", width: "8px", height: "14px" },
  { left: "86%", color: "#8ca88e", delay: "120ms", x: "68px", y: "-100px", rotate: "-22deg", width: "11px", height: "18px" },
  { left: "90%", color: "#e8d8ad", delay: "180ms", x: "110px", y: "-116px", rotate: "18deg", width: "9px", height: "16px" },
] as const;

function getStoredState(): TasbihState {
  if (typeof window === "undefined") return DEFAULT_STATE;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;

    const parsed = JSON.parse(raw) as Partial<TasbihState>;
    const dhikr = DHIKR_OPTIONS.includes(parsed.dhikr as DhikrOption)
      ? (parsed.dhikr as DhikrOption)
      : DEFAULT_STATE.dhikr;
    const preset = PRESETS.includes(parsed.preset as 33 | 99)
      ? (parsed.preset as 33 | 99)
      : DEFAULT_STATE.preset;
    const count =
      typeof parsed.count === "number" && parsed.count >= 0
        ? Math.floor(parsed.count)
        : DEFAULT_STATE.count;

    return { dhikr, preset, count: Math.min(count, preset) };
  } catch {
    return DEFAULT_STATE;
  }
}

export default function TasbihPage() {
  const [initialState] = useState(() => getStoredState());
  const [dhikr, setDhikr] = useState<DhikrOption>(initialState.dhikr);
  const [count, setCount] = useState(initialState.count);
  const [preset, setPreset] = useState<(typeof PRESETS)[number]>(initialState.preset);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const confettiTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ dhikr, count, preset }),
    );
  }, [count, dhikr, preset]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const updateHint = () => {
      setShowSwipeHint(slider.scrollWidth - slider.clientWidth - slider.scrollLeft > 8);
    };

    updateHint();
    slider.addEventListener("scroll", updateHint, { passive: true });
    window.addEventListener("resize", updateHint);

    return () => {
      slider.removeEventListener("scroll", updateHint);
      window.removeEventListener("resize", updateHint);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (confettiTimerRef.current) {
        window.clearTimeout(confettiTimerRef.current);
      }
    };
  }, []);

  const progressOffset = useMemo(() => {
    const progress = Math.max(0, Math.min(count / preset, 1));
    return CIRCUMFERENCE * (1 - progress);
  }, [count, preset]);
  const isComplete = count >= preset;

  function triggerConfetti() {
    setShowConfetti(false);

    if (confettiTimerRef.current) {
      window.clearTimeout(confettiTimerRef.current);
    }

    window.requestAnimationFrame(() => {
      setShowConfetti(true);
      confettiTimerRef.current = window.setTimeout(() => {
        setShowConfetti(false);
      }, 1500);
    });
  }

  return (
    <div className="page-bg min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-24 pt-5">
        <AppBrandRow showBackButton />

        <div className="flex flex-1 flex-col items-center justify-center gap-10 py-8">
          <div className="flex w-full flex-col items-center text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-700)]">
              Current Dhikr
            </p>
            <h2 className="mt-2 font-display text-[2.2rem] tracking-[-0.04em] text-[var(--sage-500)]">
              {dhikr}
            </h2>

            <div className="mt-4 flex w-full items-center justify-end gap-2 pr-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-700)]">
              <span>{showSwipeHint ? "Swipe for more" : "All dhikr visible"}</span>
              <FaArrowRight className={`text-[0.72rem] transition-transform ${showSwipeHint ? "translate-x-0" : "opacity-35"}`} />
            </div>

            <div className="relative w-full">
              <div
                ref={sliderRef}
                className="-mx-4 mt-2 flex w-screen max-w-md snap-x gap-2 overflow-x-auto px-4 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
              {DHIKR_OPTIONS.map((option) => {
                const active = option === dhikr;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setDhikr(option);
                      setCount(0);
                      setShowConfetti(false);
                    }}
                    className={`snap-center whitespace-nowrap rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${
                      active
                        ? "border-[var(--sage-500)] bg-[var(--sage-500)] text-white shadow-sm"
                        : "border-[var(--surface-line)] bg-[var(--sand-100)] text-[var(--ink-700)] hover:bg-[var(--sand-200)]"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
              </div>
              {showSwipeHint ? (
                <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-[var(--background)] to-transparent" />
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setCount((current) => {
                if (current >= preset) {
                  return current;
                }
                const next = current + 1;
                if (current < preset && next >= preset) {
                  triggerConfetti();
                }
                return next;
              })
            }
            disabled={isComplete}
            className={`group relative flex h-64 w-64 items-center justify-center rounded-full border border-[var(--surface-line)] bg-[var(--sand-100)] shadow-[0_0_40px_rgba(68,99,81,0.05)] transition-colors duration-300 md:h-80 md:w-80 ${
              isComplete
                ? "cursor-not-allowed ring-2 ring-[rgba(111,143,123,0.2)]"
                : "hover:bg-[var(--surface-strong)]"
            }`}
            aria-label="Increment tasbih count"
          >
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="rgba(194,200,193,0.75)"
                strokeWidth="1.5"
              />
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="var(--sage-500)"
                strokeWidth="2"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={progressOffset}
                strokeLinecap="round"
              />
            </svg>

            {showConfetti ? (
              <div className="pointer-events-none absolute inset-0 overflow-visible">
                {CONFETTI_PIECES.map((piece, index) => (
                  <span
                    key={`${piece.left}-${index}`}
                    className="tasbih-confetti-piece"
                    style={
                      {
                        left: piece.left,
                        backgroundColor: piece.color,
                        animationDelay: piece.delay,
                        "--confetti-x": piece.x,
                        "--confetti-y": piece.y,
                        "--confetti-rotate": piece.rotate,
                        width: piece.width,
                        height: piece.height,
                      } as CSSProperties
                    }
                  />
                ))}
                <span className="tasbih-confetti-ring" />
                <span className="tasbih-confetti-glow" />
              </div>
            ) : null}

            <div className="pointer-events-none relative z-10 flex flex-col items-center justify-center">
              <span className="font-display text-[5rem] leading-none tracking-[-0.06em] text-[var(--sage-500)]">
                {count}
              </span>
              <span className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-700)]">
                {isComplete ? `Completed ${preset}` : "Tap anywhere"}
              </span>
            </div>
          </button>

          <div className="mt-2 flex items-center gap-6">
            <button
              type="button"
              onClick={() => {
                setCount(0);
                setShowConfetti(false);
              }}
              aria-label="Reset"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--surface-line)] bg-[var(--sand-100)] text-[var(--ink-700)] transition-colors hover:bg-[var(--surface-strong)]"
            >
              <FaRotateRight className="text-base" />
            </button>

            <div className="flex items-center gap-1 rounded-full border border-[var(--surface-line)] bg-[var(--sand-100)] p-1">
              {PRESETS.map((value) => {
                const active = preset === value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setPreset(value);
                      setCount(0);
                      setShowConfetti(false);
                    }}
                    className={`rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${
                      active
                        ? "bg-[var(--sage-500)] text-white shadow-sm"
                        : "text-[var(--ink-700)] hover:bg-[var(--surface-strong)]"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <style jsx global>{`
        @keyframes tasbih-confetti-burst {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) translate3d(0, 0, 0) rotate(0deg) scale(0.4);
          }
          12% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%)
              translate3d(var(--confetti-x), var(--confetti-y), 0)
              rotate(var(--confetti-rotate))
              scale(1.08);
          }
        }

        @keyframes tasbih-confetti-ring {
          0% {
            opacity: 0.55;
            transform: translate(-50%, -50%) scale(0.58);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.24);
          }
        }

        @keyframes tasbih-confetti-glow {
          0% {
            opacity: 0.4;
            transform: translate(-50%, -50%) scale(0.42);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.18);
          }
        }

        .tasbih-confetti-piece {
          position: absolute;
          top: 50%;
          border-radius: 9999px;
          animation: tasbih-confetti-burst 1.25s cubic-bezier(0.16, 0.84, 0.32, 1) forwards;
          box-shadow: 0 4px 12px rgba(47, 52, 47, 0.12);
        }

        .tasbih-confetti-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 62%;
          height: 62%;
          border: 2px solid rgba(111, 143, 123, 0.32);
          border-radius: 9999px;
          animation: tasbih-confetti-ring 700ms ease-out forwards;
        }

        .tasbih-confetti-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 52%;
          height: 52%;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(232, 216, 173, 0.42), transparent 68%);
          animation: tasbih-confetti-glow 850ms ease-out forwards;
        }
      `}</style>
    </div>
  );
}
