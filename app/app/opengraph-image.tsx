import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { contentType, ogSize } from "@/lib/og";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = ogSize;
export { contentType };

let iconDataPromise: Promise<string> | null = null;
let fontDataPromise: Promise<
  {
    name: string;
    data: ArrayBuffer;
    style: "normal";
    weight: 400 | 600 | 700;
  }[]
> | null = null;

async function getIconDataUri() {
  if (!iconDataPromise) {
    iconDataPromise = readFile(join(process.cwd(), "public", "icon2Circular.png")).then(
      (buffer) => `data:image/png;base64,${buffer.toString("base64")}`,
    );
  }

  return iconDataPromise;
}

async function getOgFonts() {
  if (!fontDataPromise) {
    fontDataPromise = Promise.all([
      fetch(
        "https://fonts.gstatic.com/s/manrope/v20/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk79FO_F.ttf",
      ).then((response) => response.arrayBuffer()),
      fetch(
        "https://fonts.gstatic.com/s/manrope/v20/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk4jE-_F.ttf",
      ).then((response) => response.arrayBuffer()),
      fetch(
        "https://fonts.gstatic.com/s/manrope/v20/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk4aE-_F.ttf",
      ).then((response) => response.arrayBuffer()),
    ]).then(
      ([regular, semibold, bold]) => [
        {
          name: "Manrope",
          data: regular,
          weight: 400 as const,
          style: "normal" as const,
        },
        {
          name: "Manrope",
          data: semibold,
          weight: 600 as const,
          style: "normal" as const,
        },
        {
          name: "Manrope",
          data: bold,
          weight: 700 as const,
          style: "normal" as const,
        },
      ],
    );
  }

  return fontDataPromise;
}

export default async function OpenGraphImage() {
  const [iconDataUri, fonts] = await Promise.all([getIconDataUri(), getOgFonts()]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        padding: 22,
        background: "#fffdf8",
        color: "#2f342f",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 38,
          border: "2px solid #f1e5c8",
          background:
            "linear-gradient(180deg, #f7f1e8 0%, #efe6d8 52%, #e6f0e8 100%)",
          padding: "46px 54px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            flex: 1,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 156,
              height: 156,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 28,
            }}
          >
            <img
              src={iconDataUri}
              alt=""
              width={156}
              height={156}
              style={{ objectFit: "contain" }}
            />
          </div>

          <div
            style={{
              fontFamily: "Manrope",
              fontSize: 86,
              fontWeight: 700,
              lineHeight: 0.96,
              letterSpacing: "-0.04em",
              color: "#4d6556",
              marginBottom: 18,
            }}
          >
            ImanVibes
          </div>

          <div
            style={{
              fontFamily: "Manrope",
              fontSize: 34,
              fontWeight: 600,
              lineHeight: 1.2,
              color: "#566056",
              marginBottom: 18,
            }}
          >
            Android app
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              fontFamily: "Manrope",
              fontSize: 18,
              fontWeight: 600,
              lineHeight: 1.25,
              color: "#566056",
              marginBottom: 18,
            }}
          >
            <span>Quran by mood</span>
            <span>•</span>
            <span>Hadith</span>
            <span>•</span>
            <span>99 Names</span>
            <span>•</span>
            <span>Alif</span>
          </div>
        </div>

        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            fontFamily: "Manrope",
            fontSize: 24,
            color: "#6f8f7b",
            letterSpacing: "0.02em",
          }}
        >
          imanvibes.vercel.app/app
        </div>
      </div>
    </div>,
    {
      ...ogSize,
      fonts,
    },
  );
}
