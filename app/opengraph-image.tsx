import { contentType, createLandingOgImage, ogSize } from "@/lib/og";

export const runtime = "nodejs";
export const size = ogSize;
export { contentType };

export default async function OpenGraphImage() {
  return createLandingOgImage();
}
