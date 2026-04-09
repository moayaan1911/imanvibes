import type { MetadataRoute } from "next";
import { siteDescription, siteName } from "@/lib/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: siteName,
    short_name: siteName,
    description: siteDescription,
    start_url: "/",
    scope: "/",
    lang: "en",
    dir: "ltr",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#f7f1e8",
    theme_color: "#6f8f7b",
    categories: ["education", "lifestyle", "books"],
    shortcuts: [
      {
        name: "Quran by Mood",
        short_name: "Quran",
        description: "Browse Quran verses by mood.",
        url: "/quran",
      },
      {
        name: "Hadith",
        short_name: "Hadith",
        description: "Open the Hadith collection.",
        url: "/hadith",
      },
      {
        name: "99 Names",
        short_name: "Names",
        description: "Reflect through the 99 Names of Allah.",
        url: "/names",
      },
    ],
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/home-light.png",
        sizes: "430x932",
        type: "image/png",
        form_factor: "narrow",
        label: "ImanVibes home screen",
      },
      {
        src: "/screenshots/quran-light.png",
        sizes: "430x932",
        type: "image/png",
        form_factor: "narrow",
        label: "Quran by mood screen",
      },
      {
        src: "/screenshots/quran-dark.png",
        sizes: "430x932",
        type: "image/png",
        form_factor: "narrow",
        label: "Quran by mood screen in dark mode",
      },
    ],
  };
}
