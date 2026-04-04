import type { Metadata } from "next";
import { absoluteUrl, siteDescription, siteKeywords, siteName } from "@/lib/site";

type MetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
  imagePath?: string;
  keywords?: string[];
  noIndex?: boolean;
};

function createRobots(noIndex = false): NonNullable<Metadata["robots"]> {
  if (noIndex) {
    return {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    };
  }

  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  };
}

export function createSeoMetadata({
  title,
  description = siteDescription,
  path = "/",
  imagePath = "/opengraph-image",
  keywords = [],
  noIndex = false,
}: MetadataOptions): Metadata {
  const canonicalUrl = absoluteUrl(path);
  const imageUrl = absoluteUrl(imagePath);
  const fullTitle = title ? `${title} | ${siteName}` : siteName;

  return {
    ...(title ? { title } : {}),
    description,
    keywords: [...siteKeywords, ...keywords],
    alternates: {
      canonical: canonicalUrl,
    },
    robots: createRobots(noIndex),
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonicalUrl,
      siteName,
      title: fullTitle,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${fullTitle} preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
    },
  };
}
