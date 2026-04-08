import type { Metadata } from "next";
import TempPage from "@/app/temp/page";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Test Preview",
  description: "Internal preview page for Open Graph image development.",
  path: "/test",
  imagePath: "/opengraph-image",
  noIndex: true,
});

export default TempPage;
