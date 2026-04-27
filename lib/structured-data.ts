import {
  absoluteUrl,
  siteAlternateNames,
  siteDescription,
  siteName,
  siteSameAs,
} from "@/lib/site";

type BreadcrumbItem = {
  name: string;
  path: string;
};

export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${absoluteUrl("/")}#organization`,
    name: siteName,
    alternateName: siteAlternateNames,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/icon2Circular.png"),
    sameAs: siteSameAs,
  };
}

export function getWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${absoluteUrl("/")}#website`,
    name: siteName,
    alternateName: siteAlternateNames,
    url: absoluteUrl("/"),
    description: siteDescription,
    publisher: {
      "@id": `${absoluteUrl("/")}#organization`,
    },
    inLanguage: "en",
  };
}

export function getWebPageJsonLd({
  title,
  description,
  path,
  type = "WebPage",
}: {
  title: string;
  description: string;
  path: string;
  type?: "WebPage" | "CollectionPage";
}) {
  const url = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${url}#page`,
    name: title,
    url,
    description,
    isPartOf: {
      "@id": `${absoluteUrl("/")}#website`,
    },
    inLanguage: "en",
  };
}

export function getBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function getQuoteJsonLd({
  urlPath,
  title,
  text,
  source,
  arabic,
  parentPath,
  genre,
}: {
  urlPath: string;
  title: string;
  text: string;
  source?: string;
  arabic: string;
  parentPath: string;
  genre: string;
}) {
  const url = absoluteUrl(urlPath);

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${url}#quote`,
    name: title,
    url,
    genre,
    text,
    inLanguage: ["en", "ar"],
    abstract: text,
    citation: source,
    alternateName: arabic,
    isPartOf: {
      "@id": `${absoluteUrl(parentPath)}#page`,
    },
  };
}

export function getNameJsonLd({
  urlPath,
  transliteration,
  meaning,
  arabic,
  parentPath,
}: {
  urlPath: string;
  transliteration: string;
  meaning: string;
  arabic: string;
  parentPath: string;
}) {
  const url = absoluteUrl(urlPath);

  return {
    "@context": "https://schema.org",
    "@type": "Thing",
    "@id": `${url}#name`,
    name: transliteration,
    alternateName: arabic,
    description: meaning,
    url,
    isPartOf: {
      "@id": `${absoluteUrl(parentPath)}#page`,
    },
  };
}
