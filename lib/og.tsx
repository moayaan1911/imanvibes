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

function getQuoteTextLayout(data: QuoteOgData, arabicHeight: number) {
  const transliterationLength = data.transliteration?.length ?? 0;
  const bodyLength = (data.translation ?? data.meaning ?? "").length;
  const dense =
    transliterationLength > 90 || bodyLength > 150 || arabicHeight > 155;
  const veryDense =
    transliterationLength > 135 || bodyLength > 230 || arabicHeight > 205;

  return {
    headerGap: dense ? 18 : 26,
    cardPadding: veryDense ? "24px 34px" : dense ? "28px 36px" : "34px 40px",
    arabicMaxHeight: veryDense ? 118 : dense ? 138 : 170,
    arabicGap: data.kind === "names" ? 12 : dense ? 14 : 24,
    transliterationFontSize:
      transliterationLength > 150
        ? 16
        : transliterationLength > 115
          ? 18
          : transliterationLength > 80
            ? 20
            : 24,
    transliterationLineHeight: transliterationLength > 100 ? 1.25 : 1.32,
    transliterationTracking:
      transliterationLength > 110
        ? "0.06em"
        : transliterationLength > 80
          ? "0.1em"
          : "0.16em",
    transliterationGap: veryDense ? 10 : dense ? 12 : 18,
    bodyFontSize: bodyLength > 230 ? 19 : bodyLength > 155 ? 21 : 26,
    bodyLineHeight: bodyLength > 155 ? 1.32 : 1.45,
    bodyGap: veryDense ? 10 : dense ? 12 : 22,
    sourceFontSize: dense ? 18 : 21,
    sourcePaddingTop: dense ? 10 : 18,
    footerGap: dense ? 14 : 22,
  };
}

export async function createLandingOgImage() {
  const iconDataUri = await getIconDataUri();
  const fonts = await getOgFonts();
  const availabilityPills: { label: string; icon: ReactNode }[] = [
    {
      label: "Web",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#4d6556" strokeWidth="2" />
          <path
            d="M3.5 12h17M12 3c2.4 2.5 3.7 5.5 3.7 9S14.4 18.5 12 21M12 3c-2.4 2.5-3.7 5.5-3.7 9S9.6 18.5 12 21"
            stroke="#4d6556"
            strokeLinecap="round"
            strokeWidth="1.6"
          />
        </svg>
      ),
    },
    {
      label: "Play Store",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M6 4.2v15.6L18.4 12 6 4.2Z" fill="#4d6556" />
          <path
            d="m6 4.2 7.2 7.8L6 19.8"
            stroke="#fff9ef"
            strokeLinecap="round"
            strokeWidth="1.4"
          />
        </svg>
      ),
    },
    {
      label: "Chrome",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" fill="#4d6556" />
          <path
            d="M12 3h7.8M4.2 7.5l4 6.9M16 14.4 12 21"
            stroke="#fff9ef"
            strokeLinecap="round"
            strokeWidth="1.5"
          />
          <circle cx="12" cy="12" r="4" fill="#fff9ef" />
          <circle cx="12" cy="12" r="2.2" fill="#4d6556" />
        </svg>
      ),
    },
  ];
  const featureBullets = [
    "Quran by Mood",
    "Hadith",
    "Duas",
    "99 Names",
    "Salah Timings",
  ];

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
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              maxWidth: 820,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 26,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  width: 150,
                  height: 150,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 999,
                  border: "1px solid rgba(111,143,123,0.18)",
                  background: "rgba(255,253,248,0.82)",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={iconDataUri}
                  alt=""
                  width={136}
                  height={136}
                  style={{
                    objectFit: "contain",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 86,
                  lineHeight: 0.95,
                  color: "#4d6556",
                  fontFamily: "Manrope",
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                }}
              >
                ImanVibes
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                marginBottom: 14,
              }}
            >
              {availabilityPills.map((pill) => (
                <div
                  key={pill.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    borderRadius: 999,
                    border: "1px solid rgba(111,143,123,0.18)",
                    background: "rgba(255,253,248,0.76)",
                    padding: "9px 16px",
                    fontSize: 18,
                    fontFamily: "Manrope",
                    fontWeight: 700,
                    color: "#4d6556",
                    boxShadow: "0 10px 24px rgba(77,101,86,0.08)",
                  }}
                >
                  {pill.icon}
                  <span>{pill.label}</span>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                marginBottom: 20,
                color: "#4d6556",
                fontFamily: "Manrope",
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "0.02em",
              }}
            >
              {featureBullets.map((feature, index) => (
                <div
                  key={feature}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  {index > 0 ? <span style={{ color: "#c6aa6b" }}>•</span> : null}
                  <span>{feature}</span>
                </div>
              ))}
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
  const layout = getQuoteTextLayout(data, arabicImage.height);
  const arabicScale = Math.min(
    1,
    layout.arabicMaxHeight / Math.max(arabicImage.height, 1),
  );
  const displayedArabicWidth = Math.round(arabicImage.width * arabicScale);
  const displayedArabicHeight = Math.round(arabicImage.height * arabicScale);

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
            marginBottom: layout.headerGap,
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
            padding: layout.cardPadding,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: layout.arabicGap,
              flexShrink: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={arabicImage.dataUri}
              alt=""
              width={displayedArabicWidth}
              height={displayedArabicHeight}
              style={{
                objectFit: "contain",
              }}
            />
          </div>

          {data.transliteration ? (
            <div
              style={{
                fontSize: layout.transliterationFontSize,
                lineHeight: layout.transliterationLineHeight,
                fontWeight: 700,
                fontFamily: "Manrope",
                letterSpacing: layout.transliterationTracking,
                textTransform: "uppercase",
                color: "#6f8f7b",
                marginBottom: layout.transliterationGap,
                flexShrink: 0,
              }}
            >
              {data.transliteration}
            </div>
          ) : null}

          {data.translation ? (
            <div
              style={{
                fontSize: layout.bodyFontSize,
                lineHeight: layout.bodyLineHeight,
                color: "#2f342f",
                fontFamily: "Manrope",
                marginBottom: data.source ? layout.bodyGap : 0,
                flexShrink: 1,
              }}
            >
              {data.translation}
            </div>
          ) : null}

          {data.meaning ? (
            <div
              style={{
                fontSize: layout.bodyFontSize,
                lineHeight: layout.bodyLineHeight,
                color: "#2f342f",
                fontFamily: "Manrope",
                marginBottom: data.source ? layout.bodyGap : 0,
                flexShrink: 1,
              }}
            >
              {data.meaning}
            </div>
          ) : null}

          {data.source ? (
            <div
              style={{
                fontSize: layout.sourceFontSize,
                fontWeight: 600,
                color: "#6f8f7b",
                fontFamily: "Manrope",
                paddingTop: layout.sourcePaddingTop,
                flexShrink: 0,
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
            marginTop: layout.footerGap,
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
