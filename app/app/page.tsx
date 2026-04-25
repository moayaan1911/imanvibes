import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { IconType } from "react-icons";
import {
  FaApple,
  FaAndroid,
  FaBell,
  FaBookOpen,
  FaBoxArchive,
  FaDownload,
  FaGithub,
  FaRocket,
  FaShareNodes,
  FaShield,
  FaWandSparkles,
} from "react-icons/fa6";
import BrandWordmark from "@/components/BrandWordmark";
import JsonLd from "@/components/JsonLd";
import { createSeoMetadata } from "@/lib/seo";
import { absoluteUrl, appVersion, githubRepoUrl } from "@/lib/site";
import { getBreadcrumbJsonLd, getWebPageJsonLd } from "@/lib/structured-data";

const pageTitle = "Android App";
const pageDescription =
  "Download the Android APK for ImanVibes to get Quran by mood, Hadith, the 99 Names of Allah, Alif, daily reminders, and native sharing in one installable app.";

const apkUrl =
  "https://github.com/moayaan1911/imanvibes/releases/download/android-v1/imanvibes-v1.apk";
const releaseUrl =
  "https://github.com/moayaan1911/imanvibes/releases/tag/android-v1";

const quickHighlights = [
  { label: "6.34 MB", icon: FaBoxArchive },
  { label: "Daily reminders", icon: FaBell },
  { label: "Native", icon: FaAndroid },
] as const;

const featureCards = [
  {
    title: "Quran, Hadith, and Names",
    body: "Open the same calm ImanVibes experience as a dedicated Android app.",
    icon: FaBookOpen,
  },
  {
    title: "Daily reminders",
    body: "Morning and evening local notifications can bring users back gently.",
    icon: FaBell,
  },
  {
    title: "Native share flow",
    body: "Share links and images through Android’s real share sheet instead of browser popups.",
    icon: FaShareNodes,
  },
  {
    title: "Alif included",
    body: "The Android build also includes the Alif landing page inside the app.",
    icon: FaWandSparkles,
  },
] as const;

const installSteps = [
  {
    title: "Download the APK",
    body: "Use the direct download button below to fetch the latest Android build.",
    icon: FaDownload,
  },
  {
    title: "Allow the install",
    body: "If Android warns about installing from this source, allow it once for the browser or app you used to download.",
    icon: FaShield,
  },
  {
    title: "Open and allow reminders",
    body: "On first open, the app asks for notification permission and then schedules daily reminders automatically if allowed.",
    icon: FaRocket,
  },
] as const;

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${absoluteUrl("/app")}#software`,
  name: "ImanVibes Android App",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Android",
  url: absoluteUrl("/app"),
  downloadUrl: apkUrl,
  installUrl: apkUrl,
  releaseNotes: releaseUrl,
  softwareVersion: appVersion,
  isAccessibleForFree: true,
  fileSize: "6.34 MB",
  description: pageDescription,
  publisher: {
    "@id": `${absoluteUrl("/")}#organization`,
  },
  codeRepository: githubRepoUrl,
};

export const metadata: Metadata = createSeoMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/app",
  imagePath: "/app/opengraph-image",
  keywords: [
    "ImanVibes Android app",
    "ImanVibes APK",
    "Islamic Android app",
    "Quran by mood APK",
    "ImanVibes download",
  ],
});

function CardLabelIcon({ icon: Icon }: { icon: IconType }) {
  return (
    <span className="pill-soft inline-flex size-8 items-center justify-center rounded-full text-sm text-[var(--sage-700)]">
      <Icon />
    </span>
  );
}

export default function AppDownloadPage() {
  return (
    <div className="page-bg min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-5">
        <JsonLd
          data={[
            getWebPageJsonLd({
              title: `ImanVibes ${pageTitle}`,
              description: pageDescription,
              path: "/app",
            }),
            getBreadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Android App", path: "/app" },
            ]),
            softwareApplicationJsonLd,
          ]}
        />

        <section className="surface-panel rounded-[32px] p-5">
          <div className="flex items-center gap-4">
            <Image
              src="/icon2Circular.png"
              alt="ImanVibes icon"
              width={72}
              height={72}
              priority
              className="icon-ring rounded-full border"
            />
            <BrandWordmark wordmarkClassName="text-[1.35rem]" />
          </div>

          <h1 className="mt-5 text-[2rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[var(--ink-900)]">
            ImanVibes for Android
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-700)]">
            Download the Android APK to get ImanVibes, Alif, daily reminders,
            and a native install in one lightweight package.
          </p>

          <div className="mt-5 flex flex-nowrap gap-2 overflow-x-auto pb-1" data-nosnippet>
            {quickHighlights.map((item) => {
              const Icon = item.icon;

              return (
                <span
                  key={item.label}
                  className="pill-soft inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold"
                >
                  <Icon className="text-[11px]" />
                  {item.label}
                </span>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3" data-nosnippet>
            <Link
              href={apkUrl}
              target="_blank"
              rel="noreferrer"
              className="button-primary col-span-2 flex cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold"
            >
              <FaAndroid className="text-sm" />
              Download APK
            </Link>
            <Link
              href={releaseUrl}
              target="_blank"
              rel="noreferrer"
              className="button-secondary flex cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold"
            >
              <FaGithub className="text-sm" />
              View release
            </Link>
            <Link
              href="#ios-guide"
              className="button-secondary flex cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold"
            >
              <FaApple className="text-sm" />
              iOS guide
            </Link>
          </div>
        </section>

        <section className="surface-section mt-5 rounded-[32px] p-5">
          <h2 className="text-lg font-semibold tracking-[-0.03em] text-[var(--ink-900)]">
            What you get
          </h2>

          <div className="mt-4 grid gap-3">
            {featureCards.map((card) => {
              const Icon = card.icon;

              return (
                <article key={card.title} className="surface-card rounded-[26px] p-4">
                  <div className="flex items-start gap-3">
                    <CardLabelIcon icon={Icon} />
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--ink-900)]">
                        {card.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--ink-700)]">
                        {card.body}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="surface-section mt-5 rounded-[32px] p-5">
          <h2 className="text-lg font-semibold tracking-[-0.03em] text-[var(--ink-900)]">
            How to install
          </h2>

          <div className="mt-4 grid gap-3">
            {installSteps.map((step) => {
              const Icon = step.icon;

              return (
                <article key={step.title} className="surface-card rounded-[26px] p-4">
                  <div className="flex items-start gap-3">
                    <CardLabelIcon icon={Icon} />
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--ink-900)]">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--ink-700)]">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section
          id="ios-guide"
          className="surface-section mt-5 scroll-mt-20 rounded-[32px] p-5"
        >
          <h2 className="text-lg font-semibold tracking-[-0.03em] text-[var(--ink-900)]">
            Install on iPhone or iPad
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-700)]">
            ImanVibes works on iPhone and iPad as a web app. Open the main site
            in Safari, then add it to your Home Screen.
          </p>

          <div className="mt-4 grid gap-3">
            <article className="surface-card rounded-[26px] p-4">
              <div className="flex items-start gap-3">
                <CardLabelIcon icon={FaApple} />
                <div>
                  <h3 className="text-sm font-semibold text-[var(--ink-900)]">
                    Safari steps
                  </h3>
                  <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--ink-700)]">
                    <li>Open `https://imanvibes.vercel.app/` in Safari.</li>
                    <li>Tap the Share button in the Safari toolbar.</li>
                    <li>Scroll and tap `Add to Home Screen`.</li>
                    <li>
                      If `Open as Web App` appears, keep it enabled for the
                      best app-like experience.
                    </li>
                    <li>Tap `Add` to place ImanVibes on your Home Screen.</li>
                  </ul>
                </div>
              </div>
            </article>
          </div>

          <div className="mt-4 grid gap-3">
            <div className="surface-card overflow-hidden rounded-[26px] p-2">
              <Image
                src="/ios1.jpg"
                alt="iPhone Safari showing the Share action before adding ImanVibes to the Home Screen."
                width={1600}
                height={1600}
                className="h-auto w-full rounded-[20px]"
              />
            </div>
            <div className="surface-card overflow-hidden rounded-[26px] p-2">
              <Image
                src="/ios2.jpg"
                alt="iPhone Safari showing Add to Home Screen and Open as Web App during ImanVibes installation."
                width={1600}
                height={1600}
                className="h-auto w-full rounded-[20px]"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
