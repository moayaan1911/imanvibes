import { EdgeTTS } from "node-edge-tts";
import { NextRequest, NextResponse } from "next/server";
import { tmpdir } from "os";
import { join } from "path";
import { readFileSync, unlinkSync } from "fs";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get("text");

  if (!text || !text.trim()) {
    return NextResponse.json(
      { error: "Missing text parameter" },
      { status: 400 },
    );
  }

  const id = Date.now();
  const outputPath = join(tmpdir(), `tts-${id}.mp3`);
  const subPath = join(tmpdir(), `tts-${id}.mp3.json`);

  try {
    const tts = new EdgeTTS({
      voice: "ar-SA-HamedNeural",
      lang: "ar-SA",
      outputFormat: "audio-24khz-48kbitrate-mono-mp3",
      rate: "-30%",
      saveSubtitles: true,
    });

    await tts.ttsPromise(text.trim(), outputPath);

    const audioBuffer = readFileSync(outputPath);

    let speechDuration: number | null = null;

    try {
      const subtitles = JSON.parse(readFileSync(subPath, "utf-8"));
      if (Array.isArray(subtitles) && subtitles.length > 0) {
        const lastWord = subtitles[subtitles.length - 1];
        if (lastWord && typeof lastWord.end === "number") {
          speechDuration = lastWord.end / 1000;
        }
      }
    } catch {}

    try {
      unlinkSync(subPath);
    } catch {}

    try {
      unlinkSync(outputPath);
    } catch {}

    const headers: Record<string, string> = {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=2592000, s-maxage=2592000",
    };

    if (speechDuration !== null) {
      headers["X-Speech-Duration"] = speechDuration.toFixed(3);
    }

    return new NextResponse(audioBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("TTS error:", error);
    try {
      unlinkSync(subPath);
    } catch {}
    try {
      unlinkSync(outputPath);
    } catch {}
    return NextResponse.json(
      { error: "Failed to generate audio" },
      { status: 500 },
    );
  }
}