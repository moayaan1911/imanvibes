import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { ImageResponse } from "next/og";
import type { ReactNode } from "react";

type QuoteKind = "quran" | "hadith" | "names" | "duas";
type SharpFactory = typeof import("sharp");

type QuoteOgData = {
  kind: QuoteKind;
  arabic: string;
  translation?: string;
  source?: string;
  transliteration?: string;
  meaning?: string;
};

export const ogSize = {
  width: 1200,
  height: 630,
} as const;

export const contentType = "image/png";

let iconDataPromise: Promise<string> | null = null;
let arabicFontPathPromise: Promise<string> | null = null;
let sharpModulePromise: Promise<unknown> | null = null;
const arabicTextImagePromises = new Map<
  string,
  Promise<{ dataUri: string; width: number; height: number }>
>();
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
      ([manropeRegular, manropeSemibold, manropeBold]) => [
        {
          name: "Manrope",
          data: manropeRegular,
          weight: 400 as const,
          style: "normal" as const,
        },
        {
          name: "Manrope",
          data: manropeSemibold,
          weight: 600 as const,
          style: "normal" as const,
        },
        {
          name: "Manrope",
          data: manropeBold,
          weight: 700 as const,
          style: "normal" as const,
        },
      ],
    );
  }

  return fontDataPromise;
}

async function getSharp() {
  if (!sharpModulePromise) {
    const fontConfigDir = join(process.cwd(), ".fontconfig");
    process.env.FONTCONFIG_PATH ??= fontConfigDir;
    process.env.FONTCONFIG_FILE ??= join(fontConfigDir, "fonts.conf");

    sharpModulePromise = import("sharp");
  }

  const sharpModule = (await sharpModulePromise) as SharpFactory & {
    default?: SharpFactory;
  };

  return (sharpModule.default ?? sharpModule) as SharpFactory;
}

async function getArabicFontPath() {
  if (!arabicFontPathPromise) {
    arabicFontPathPromise = (async () => {
      const fontPath = join(tmpdir(), "imanvibes-og-noto-naskh-arabic.ttf");

      try {
        await access(fontPath);
        return fontPath;
      } catch {
        const fontArrayBuffer = await fetch(
          "https://fonts.gstatic.com/s/notonaskharabic/v44/RrQ5bpV-9Dd1b1OAGA6M9PkyDuVBePeKNaxcsss0Y7bwvc5krA.ttf",
        ).then((response) => response.arrayBuffer());
        const fontBuffer = Buffer.from(new Uint8Array(fontArrayBuffer));

        await writeFile(fontPath, fontBuffer);
        return fontPath;
      }
    })();
  }

  return arabicFontPathPromise;
}

async function createArabicTextImage(
  text: string,
  kind: QuoteKind,
) {
  const key = `v2:${kind}:${text}`;

  if (!arabicTextImagePromises.has(key)) {
    arabicTextImagePromises.set(
      key,
      (async () => {
        const fontPath = await getArabicFontPath();
        const sharp = await getSharp();
        const config =
          kind === "names"
            ? { width: 860, font: "ImanVibes Arabic 50", spacing: 8 }
            : kind === "hadith"
              ? { width: 900, font: "ImanVibes Arabic 40", spacing: 8 }
              : { width: 900, font: "ImanVibes Arabic 42", spacing: 8 };

        const pngBuffer = await sharp({
          text: {
            text,
            font: config.font,
            fontfile: fontPath,
            width: config.width,
            align: "right",
            rgba: true,
            spacing: config.spacing,
            wrap: "word-char",
          },
        })
          .png()
          .toBuffer();

        const metadata = await sharp(pngBuffer).metadata();

        return {
          dataUri: `data:image/png;base64,${pngBuffer.toString("base64")}`,
          width: metadata.width ?? config.width,
          height: metadata.height ?? 160,
        };
      })(),
    );
  }

  return arabicTextImagePromises.get(key)!;
}

function createFrame(
  children: ReactNode,
  background =
    "radial-gradient(circle at top, rgba(255,255,255,0.72), transparent 32%), linear-gradient(180deg, #f7f1e8 0%, #efe6d8 52%, #e6f0e8 100%)",
) {
  return (
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
          background,
          padding: "44px 54px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export async function createLandingOgImage() {
  const iconDataUri = await getIconDataUri();
  const fonts = await getOgFonts();

  return new ImageResponse(
    createFrame(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 420,
            height: 420,
            transform: "translate(-50%, -50%)",
            borderRadius: 999,
            background:
              "radial-gradient(circle, rgba(111,143,123,0.24) 0%, rgba(111,143,123,0.08) 44%, rgba(111,143,123,0) 74%)",
          }}
        />

        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            position: "relative",
            padding: "8px 16px",
          }}
        >
          <div
            style={{
              width: 196,
              height: 196,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              border: "1px solid rgba(111,143,123,0.18)",
              background: "rgba(255,253,248,0.82)",
              flexShrink: 0,
              overflow: "hidden",
              marginBottom: 28,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={iconDataUri}
              alt=""
              width={178}
              height={178}
              style={{
                objectFit: "contain",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              maxWidth: 820,
            }}
          >
            <div
              style={{
                fontSize: 86,
                lineHeight: 0.95,
                color: "#4d6556",
                fontFamily: "Manrope",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                marginBottom: 18,
              }}
            >
              ImanVibes
            </div>
            <div
              style={{
                fontSize: 34,
                lineHeight: 1.35,
                color: "#566056",
                fontFamily: "Manrope",
                marginBottom: 28,
                maxWidth: 760,
              }}
            >
              Quranic comfort for every mood
            </div>
            <div
              style={{
                fontSize: 24,
                color: "#6f8f7b",
                fontFamily: "Manrope",
                letterSpacing: "0.08em",
                textTransform: "lowercase",
              }}
            >
              imanvibes.vercel.app
            </div>
          </div>
        </div>
      </div>,
      "linear-gradient(180deg, #f7f1e8 0%, #efe6d8 52%, #e6f0e8 100%)",
    ),
    {
      ...ogSize,
      fonts,
    },
  );
}

export async function createQuoteOgImage(data: QuoteOgData) {
  const fonts = await getOgFonts();
  const arabicImage = await createArabicTextImage(data.arabic, data.kind);

  return new ImageResponse(
    createFrame(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: 26,
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              fontFamily: "Manrope",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#6f8f7b",
              marginBottom: 10,
            }}
          >
            ImanVibes
          </div>
          <div
            style={{
              fontSize: 20,
              color: "#566056",
              fontFamily: "Manrope",
            }}
          >
            Quranic comfort for every mood
          </div>
        </div>

        <div
          style={{
            width: "100%",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            borderRadius: 30,
            border: "1px solid rgba(111,143,123,0.12)",
            background: "#ffffff",
            boxShadow: "0 10px 24px rgba(111,143,123,0.06)",
            padding: "34px 40px",
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: data.kind === "names" ? 14 : 24,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={arabicImage.dataUri}
              alt=""
              width={arabicImage.width}
              height={arabicImage.height}
              style={{
                objectFit: "contain",
              }}
            />
          </div>

          {data.transliteration ? (
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                fontFamily: "Manrope",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#6f8f7b",
                marginBottom: 20,
              }}
            >
              {data.transliteration}
            </div>
          ) : null}

          {data.translation ? (
            <div
              style={{
                fontSize: 28,
                lineHeight: 1.5,
                color: "#2f342f",
                fontFamily: "Manrope",
                marginBottom: data.source ? 26 : 0,
              }}
            >
              {data.translation}
            </div>
          ) : null}

          {data.meaning ? (
            <div
              style={{
                fontSize: 28,
                lineHeight: 1.5,
                color: "#2f342f",
                fontFamily: "Manrope",
                marginBottom: data.source ? 26 : 0,
              }}
            >
              {data.meaning}
            </div>
          ) : null}

          {data.source ? (
            <div
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: "#6f8f7b",
                fontFamily: "Manrope",
                paddingTop: 22,
              }}
            >
              {data.source}
            </div>
          ) : null}
        </div>

        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 22,
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: "#566056",
              fontFamily: "Manrope",
            }}
          >
            imanvibes.vercel.app
          </div>
        </div>
      </div>,
      "linear-gradient(180deg, #f7f1e8 0%, #efe6d8 52%, #e6f0e8 100%)",
    ),
    {
      ...ogSize,
      fonts,
    },
  );
}
