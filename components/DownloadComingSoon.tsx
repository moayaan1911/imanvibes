import Link from "next/link";
import { FaChrome, FaGooglePlay } from "react-icons/fa6";

const storeButtons = [
  {
    label: "Play Store",
    note: "Android app",
    description: "Full app with Quran, Hadith, Duas, and Names.",
    icon: FaGooglePlay,
    href: null,
  },
  {
    label: "Chrome Store",
    note: "Extension",
    description: "Browser companion for Salah reminders.",
    icon: FaChrome,
    href: "https://chromewebstore.google.com/detail/mdgclabcabbbikdgmihabnaeplkfnnkb?utm_source=item-share-cb",
  },
] as const;

export default function DownloadComingSoon() {
  return (
    <section
      className="relative mt-6 min-h-[220px] overflow-hidden rounded-[28px] bg-[#f3ede4] p-6 text-[#2f342f]"
      style={{
        backgroundImage:
          "linear-gradient(to right bottom, rgba(237, 231, 223, 0.92), rgba(243, 237, 228, 0.92)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuAzefQMOqz0SOjlFykAoyMhM-M0fUyqEDNznlVIaWY9AUuZ7VB6aofv8jqOGEVH7SoRmyyojrSRz2lkVYLh8DXhSlUzFR34HTHpAGqBkPU3BNbWGsuOkh7_YBsNa1Df6r7t734K8t34HaLns8yFWdrqbBL0i44V0G6Jx_O1INrA_NKrUnNjjujBj9SzJc1e6hHQlbJfxp5VGbvoG0Ok5MDizKZwEpaXEoSedfgQNKBSmllb51F3VW9SlFbg5DUOmrDB0P73cN5YPm0')",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
      data-nosnippet
    >
      <div className="relative z-10">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#4d6556]">
            Download ImanVibes
          </span>
        </div>
      </div>

      <div className="relative z-10 mt-5 rounded-[20px] border border-white/30 bg-[rgba(255,249,239,0.68)] p-4 text-[#2f342f] backdrop-blur-[16px]">
        <div className="grid grid-cols-2 gap-3">
          {storeButtons.map((button) => {
            const Icon = button.icon;

            const content = (
              <>
                <Icon className="text-[1.35rem]" />
                <span className="mt-2 text-[0.82rem] font-semibold">
                  {button.label}
                </span>
                <span className="mt-1 text-[11px] text-[#566056]">
                  {button.note}
                </span>
              </>
            );

            if (!button.href) {
              return (
                <div key={button.label} className="flex flex-col gap-2">
                  <p className="min-h-[2.4rem] text-center text-[11px] font-medium leading-5 text-[#566056]">
                    {button.description}
                  </p>
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="relative flex min-h-[4.8rem] cursor-not-allowed flex-col items-center justify-center overflow-hidden rounded-[18px] border border-[rgba(68,99,81,0.12)] bg-[rgba(255,249,239,0.5)] px-3 py-3 text-center text-[#4d6556] opacity-70 shadow-[inset_0_4px_20px_rgba(0,0,0,0.03)]"
                  >
                    {content}
                    <span className="pointer-events-none absolute left-1/2 top-1/2 w-[125%] -translate-x-1/2 -translate-y-1/2 -rotate-[12deg] bg-[#777d76] py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_8px_22px_rgba(47,52,47,0.28)]">
                      Coming Soon
                    </span>
                  </button>
                </div>
              );
            }

            return (
              <div key={button.label} className="flex flex-col gap-2">
                <p className="min-h-[2.4rem] text-center text-[11px] font-medium leading-5 text-[#566056]">
                  {button.description}
                </p>
                <Link
                  href={button.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-[4.8rem] flex-col items-center justify-center rounded-[18px] border border-[rgba(68,99,81,0.12)] bg-[rgba(255,249,239,0.62)] px-3 py-3 text-center text-[#4d6556] shadow-[0_10px_30px_-20px_rgba(68,99,81,0.5)] transition-colors hover:bg-[rgba(255,249,239,0.88)]"
                >
                  {content}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
