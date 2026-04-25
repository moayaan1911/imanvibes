import type { Metadata } from "next";
import Link from "next/link";
import {
  FaBell,
  FaChartSimple,
  FaGithub,
  FaGlobe,
  FaLocationDot,
  FaMoon,
  FaShieldHalved,
  FaTrashCan,
} from "react-icons/fa6";
import BrandWordmark from "@/components/BrandWordmark";
import JsonLd from "@/components/JsonLd";
import { createSeoMetadata } from "@/lib/seo";
import { siteName, siteTagline } from "@/lib/site";
import { getBreadcrumbJsonLd, getWebPageJsonLd } from "@/lib/structured-data";

const pageTitle = "Privacy Policy";
const pageDescription =
  "Privacy policy for the ImanVibes website, Android app, and Salah Companion browser extension.";
const githubRepoUrl = "https://github.com/moayaan1911/imanvibes";
const developerWebsiteUrl = "https://moayaan.com";

const productScope = [
  {
    label: "Website",
    body: "The ImanVibes website provides Quran by mood, Hadith, Duas, the 99 Names of Allah, and related Islamic content without requiring an account or login.",
  },
  {
    label: "Android app",
    body: "The ImanVibes Android app brings the same Islamic content into an installable app experience and may use local device permissions such as notifications only when needed for app features.",
  },
  {
    label: "Browser extension",
    body: "The ImanVibes Salah Companion browser extension focuses on Salah timings, city search, prayer tracking, theme preferences, and optional prayer reminders in Chrome.",
  },
] as const;

const policySections = [
  {
    title: "Information we do not collect",
    icon: FaShieldHalved,
    body: [
      "ImanVibes does not require an account, password, profile, payment method, or sign-in to use the website, Android app, or Salah Companion extension.",
      "ImanVibes does not collect browsing history, personal communications, website content, financial information, health information, or authentication information.",
    ],
  },
  {
    title: "Location and city data",
    icon: FaLocationDot,
    body: [
      "The Salah Companion extension may use your browser location only when you choose to fetch your current location for local Salah timings. Future app prayer-time features may similarly ask for location only to calculate local Salah timings.",
      "You can avoid browser geolocation by searching for a city manually where city search is available. City search is used only to find prayer time coordinates.",
      "Location or city data is used only for prayer timings and is not sold, used for advertising, or used for unrelated purposes.",
    ],
  },
  {
    title: "Local storage and preferences",
    icon: FaMoon,
    body: [
      "The extension stores your selected location, daily prayer tracker state, notification preferences, and light or dark theme preference locally in your browser.",
      "The website and Android app may also store simple local preferences such as theme, saved settings, or app state so the experience feels consistent between sessions.",
      "Local data can be cleared by removing the extension, clearing browser storage, clearing site data, or uninstalling the app.",
    ],
  },
  {
    title: "Notifications and alarms",
    icon: FaBell,
    body: [
      "If you enable reminders, the extension uses Chrome notifications and alarms to send optional Salah reminders for selected prayers.",
      "The Android app may also use local notifications for reminders if you allow notification permission.",
      "Prayer reminder preferences are controlled by you and are used only for Islamic reminders such as Fajr, Dhuhr, Asr, Maghrib, and Isha.",
    ],
  },
  {
    title: "External services used",
    icon: FaGlobe,
    body: [
      "The extension uses AlAdhan to fetch prayer timings and Open-Meteo Geocoding to search for cities. Future app prayer-time features may use similar prayer-time or geocoding services.",
      "The website may use Vercel Analytics to understand basic site performance and usage. ImanVibes does not require user accounts or collect payment information.",
    ],
  },
  {
    title: "Data control and deletion",
    icon: FaTrashCan,
    body: [
      "Because ImanVibes stores preferences locally where possible, you can delete local data by uninstalling the extension, clearing browser/site storage, or uninstalling the Android app.",
      "ImanVibes does not provide user accounts, so there is no account profile to delete.",
    ],
  },
] as const;

export const metadata: Metadata = createSeoMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/privacy",
  imagePath: "/opengraph-image",
  keywords: [
    "ImanVibes privacy policy",
    "Salah Companion privacy",
    "Chrome extension privacy policy",
  ],
});

export default function PrivacyPage() {
  return (
    <div className="page-bg min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-5">
        <JsonLd
          data={[
            getWebPageJsonLd({
              title: `${siteName} ${pageTitle}`,
              description: pageDescription,
              path: "/privacy",
            }),
            getBreadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Privacy Policy", path: "/privacy" },
            ]),
          ]}
        />

        <section className="surface-panel rounded-[32px] p-5">
          <div className="flex items-center justify-between gap-3">
            <BrandWordmark showTagline wordmarkClassName="text-[1.45rem]" />
            <span className="pill-soft inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[11px] font-semibold text-[var(--sage-700)]">
              Privacy
            </span>
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.24em] text-[var(--sage-700)]">
            Effective date: April 25, 2026
          </p>
          <h1 className="mt-3 text-[2.2rem] font-semibold leading-[1.02] tracking-[-0.04em] text-[var(--ink-900)]">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm leading-6 text-[var(--ink-700)]">
            This policy explains how {siteName} handles data across the
            website, Android app, and ImanVibes Salah Companion browser
            extension. The goal is simple: provide Quranic comfort, Islamic
            content, Salah timings, prayer tracking, and reminders without
            unnecessary data collection.
          </p>
        </section>

        <section className="surface-section mt-5 rounded-[28px] p-4">
          <h2 className="text-base font-semibold tracking-[-0.02em] text-[var(--ink-900)]">
            What this policy covers
          </h2>
          <div className="mt-3 space-y-3">
            {productScope.map((item) => (
              <p key={item.label} className="text-sm leading-6 text-[var(--ink-700)]">
                <strong className="font-semibold text-[var(--ink-900)]">
                  {item.label}:
                </strong>{" "}
                {item.body}
              </p>
            ))}
          </div>
        </section>

        <section className="mt-5 grid gap-3">
          {policySections.map((section) => {
            const Icon = section.icon;

            return (
              <article key={section.title} className="surface-section rounded-[28px] p-4">
                <div className="flex items-start gap-3">
                  <span className="pill-soft inline-flex size-10 shrink-0 items-center justify-center rounded-full text-sm text-[var(--sage-700)]">
                    <Icon />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold tracking-[-0.02em] text-[var(--ink-900)]">
                      {section.title}
                    </h2>
                    <div className="mt-2 space-y-2">
                      {section.body.map((paragraph) => (
                        <p key={paragraph} className="text-sm leading-6 text-[var(--ink-700)]">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="surface-panel mt-5 rounded-[32px] p-5">
          <div className="flex items-start gap-3">
            <span className="pill-soft inline-flex size-10 shrink-0 items-center justify-center rounded-full text-sm text-[var(--sage-700)]">
              <FaChartSimple />
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.03em] text-[var(--ink-900)]">
                Contact and links
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-700)]">
                Questions about this privacy policy can be sent to the creator
                of ImanVibes.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2" data-nosnippet>
            <Link
              href="mailto:moayaan.eth@gmail.com"
              className="button-primary flex cursor-pointer items-center justify-center rounded-full px-4 py-3 text-sm font-semibold"
            >
              Contact: moayaan.eth@gmail.com
            </Link>
            <Link
              href={githubRepoUrl}
              target="_blank"
              rel="noreferrer"
              className="button-secondary flex cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold"
            >
              <FaGithub className="text-sm" />
              GitHub repository
            </Link>
            <Link
              href={developerWebsiteUrl}
              target="_blank"
              rel="noreferrer"
              className="button-secondary flex cursor-pointer items-center justify-center rounded-full px-4 py-3 text-sm font-semibold"
            >
              Creator website: moayaan.com
            </Link>
          </div>
        </section>

        <p className="mx-auto mt-5 max-w-sm text-center text-xs leading-5 text-[var(--ink-700)]">
          {siteTagline}. This policy may be updated as ImanVibes grows, but the
          website, Android app, and browser extension will remain focused on
          their Islamic content and prayer-support purposes.
        </p>
      </main>
    </div>
  );
}
