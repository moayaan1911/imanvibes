import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/temp", "/test"],
      },
      {
        userAgent: [
          "Googlebot",
          "Bingbot",
          "Google-Extended",
          "OAI-SearchBot",
          "GPTBot",
          "ClaudeBot",
          "Claude-SearchBot",
          "PerplexityBot",
        ],
        allow: "/",
        disallow: ["/temp", "/test"],
      },
      {
        userAgent: ["ChatGPT-User", "Claude-User", "Perplexity-User"],
        allow: "/",
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
