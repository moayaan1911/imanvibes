import type { Metadata } from "next";
import Link from "next/link";
import {
  FaChartSimple,
  FaGithub,
  FaGlobe,
  FaMoon,
  FaShieldHalved,
  FaTrashCan,
} from "react-icons/fa6";
import AppHeader from "@/components/AppHeader";
import JsonLd from "@/components/JsonLd";
import { createSeoMetadata } from "@/lib/seo";
import { siteName, siteTagline } from "@/lib/site";
import { getBreadcrumbJsonLd, getWebPageJsonLd } from "@/lib/structured-data";

const pageTitle = "Privacy Policy";
const pageDescription =
  "Privacy policy for the ImanVibes website, Android app, and browser extension.";
const githubRepoUrl = "https://github.com/moayaan1911/imanvibes";
const developerWebsiteUrl = "https://moayaan.com";

const productScope = [
  {
    label: "Website",
    body: "The ImanVibes website provides Quran by mood, Hadith, Duas, the 99 Names of Allah, and related Islamic content without requiring an account or login.",
  },
  {
    label: "Android app",
    body: "The ImanVibes Android app brings the same Islamic content into an installable app experience.",
  },
  {
    label: "Browser extension",
    body: "The ImanVibes browser extension is planned as a lightweight companion for quick access and local preferences in Chrome.",
  },
] as const;

const policySections = [
  {
    title: "Information we do not collect",
    icon: FaShieldHalved,
    body: [
      "ImanVibes does not require an account, password, profile, payment method, or sign-in to use the website, Android app, or browser extension.",
      "ImanVibes does not collect browsing history, personal communications, website content, financial information, health information, or authentication information.",
    ],
  },
  {
    title: "Local storage and preferences",
    icon: FaMoon,
    body: [
      "The website may store simple local preferences such as theme so the experience feels consistent between sessions.",
      "The Android app and browser extension may also store simple local preferences on your device.",
      "Local data can be cleared by removing the extension, clearing browser storage, clearing site data, or uninstalling the app.",
    ],
  },
  {
    title: "External services used",
    icon: FaGlobe,
    body: [
      "The website may use Vercel Analytics to understand basic site performance and usage. ImanVibes does not require user accounts or collect payment information.",
      "Arabic audio is generated on demand through the app's text-to-speech route when you press Listen.",
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
    "Chrome extension privacy policy",
  ],
});

export default function PrivacyPage() {
  return (
    <div className="page-bg min-h-screen">
      <main className="app-shell">
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

        <AppHeader />

        <section className="app-hero-card rounded-[30px] p-5">
          <p className="text-xs font-bold uppercase text-[var(--sage-700)]">
            Effective date: April 25, 2026
          </p>
          <h1 className="mt-3 text-[2.2rem] font-semibold leading-[1.02] text-[var(--ink-900)]">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm leading-6 text-[var(--ink-700)]">
            This policy explains how {siteName} handles data across the
            website, Android app, and browser extension. The goal is simple:
            provide Quranic comfort and Islamic content without unnecessary
            data collection.
          </p>
        </section>

        <section className="surface-section mt-5 rounded-[28px] p-4">
          <h2 className="text-base font-semibold text-[var(--ink-900)]">
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
                    <h2 className="text-base font-semibold text-[var(--ink-900)]">
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
              <h2 className="text-lg font-semibold text-[var(--ink-900)]">
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
          their Islamic content.
        </p>
      </main>
    </div>
  );
}
