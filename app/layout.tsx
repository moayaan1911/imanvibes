import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import AndroidBackHandler from "@/components/AndroidBackHandler";
import AndroidNotificationBootstrap from "@/components/AndroidNotificationBootstrap";
import JsonLd from "@/components/JsonLd";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import {
  Amiri,
  Manrope,
  Newsreader,
  Noto_Naskh_Arabic,
} from "next/font/google";
import BottomNav from "@/components/BottomNav";
import { createSeoMetadata } from "@/lib/seo";
import { getOrganizationJsonLd, getWebsiteJsonLd } from "@/lib/structured-data";
import { getSiteUrl, siteDescription, siteName } from "@/lib/site";
import "./globals.css";

const isCapacitorExport = process.env.CAPACITOR_EXPORT === "1";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: "--font-naskh-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  applicationName: siteName,
  creator: "moayaan.eth",
  publisher: siteName,
  category: "Religion & spirituality",
  ...createSeoMetadata({
    description: siteDescription,
    path: "/",
    imagePath: "/opengraph-image",
  }),
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icon2Circular.png",
  },
  appleWebApp: {
    capable: true,
    title: "ImanVibes",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff9ef" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1512" },
  ],
};

const themeInitScript = `
(() => {
  try {
    const stored = localStorage.getItem("theme");
    const theme = stored === "dark" || stored === "light" ? stored : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? "#0f1512" : "#fff9ef");
    }
  } catch {
    document.documentElement.dataset.theme = "light";
    document.documentElement.style.colorScheme = "light";
    document.documentElement.classList.remove("dark");
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${newsreader.variable} ${amiri.variable} ${notoNaskhArabic.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col pb-[7.25rem]">
        {isCapacitorExport ? null : <ServiceWorkerRegistration />}
        <JsonLd data={[getOrganizationJsonLd(), getWebsiteJsonLd()]} />
        {isCapacitorExport ? <AndroidNotificationBootstrap /> : null}
        <div className="flex-1">{children}</div>
        {isCapacitorExport ? <AndroidBackHandler /> : null}
        <BottomNav />
        {isCapacitorExport ? null : <Analytics />}
      </body>
    </html>
  );
}
