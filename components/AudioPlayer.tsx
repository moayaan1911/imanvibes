"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FaPlay, FaPause, FaVolumeHigh } from "react-icons/fa6";

interface AudioPlayerProps {
  arabicText: string;
  variant?: "full" | "icon";
}

type PlaybackState = "idle" | "loading" | "playing" | "paused" | "error";

export default function AudioPlayer({
  arabicText,
  variant = "full",
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const speechEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechDurationRef = useRef<number | null>(null);
  const [state, setState] = useState<PlaybackState>("idle");
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const stopPlayback = useCallback(() => {
    if (speechEndTimerRef.current) {
      clearTimeout(speechEndTimerRef.current);
      speechEndTimerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setState("idle");
    setProgress(0);
    setCurrentTime(0);
  }, []);

  const cleanupAudio = useCallback(() => {
    if (speechEndTimerRef.current) {
      clearTimeout(speechEndTimerRef.current);
      speechEndTimerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current.onloadedmetadata = null;
      audioRef.current.onerror = null;
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    speechDurationRef.current = null;
  }, []);

  const playWithWebSpeech = useCallback(() => {
    if (!("speechSynthesis" in window)) {
      setErrorMsg("Not supported");
      setState("error");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(arabicText);
    utterance.lang = "ar-SA";
    utterance.rate = 0.85;

    const voices = speechSynthesis.getVoices();
    const arabicVoice = voices.find(
      (v) =>
        v.lang.startsWith("ar") &&
        (v.name.includes("Naayf") ||
          v.name.includes("Maged") ||
          v.name.includes("Tarik") ||
          v.name.includes("Google")),
    );
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    setState("playing");
    setProgress(0);
    setCurrentTime(0);

    utterance.onend = () => {
      setState("idle");
      setProgress(0);
      setCurrentTime(0);
    };

    utterance.onerror = () => {
      setErrorMsg("Playback failed");
      setState("error");
    };

    window.speechSynthesis.speak(utterance);
  }, [arabicText]);

  const togglePlay = useCallback(async () => {
    if (state === "playing") {
      if (audioRef.current) {
        audioRef.current.pause();
      } else if ("speechSynthesis" in window && speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      setState("paused");
      return;
    }

    if (state === "paused" && audioRef.current) {
      audioRef.current.play();
      setState("playing");

      const remaining = (speechDurationRef.current || audioRef.current.duration) - audioRef.current.currentTime;
      if (speechEndTimerRef.current) {
        clearTimeout(speechEndTimerRef.current);
      }
      speechEndTimerRef.current = setTimeout(stopPlayback, remaining * 1000 + 200);
      return;
    }

    setState("loading");
    setErrorMsg(null);

    try {
      const response = await fetch(
        `/api/tts?text=${encodeURIComponent(arabicText)}`,
      );

      if (!response.ok) {
        throw new Error("TTS fetch failed");
      }

      const speechDurationHeader = response.headers.get("X-Speech-Duration");
      if (speechDurationHeader) {
        speechDurationRef.current = parseFloat(speechDurationHeader);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      cleanupAudio();

      audioUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onloadedmetadata = () => {
        const totalDuration = audio.duration;
        setDuration(speechDurationRef.current || totalDuration);
      };

      audio.ontimeupdate = () => {
        const effectiveDuration = speechDurationRef.current || audio.duration;
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / effectiveDuration) * 100 || 0);

        if (
          speechDurationRef.current &&
          audio.currentTime >= speechDurationRef.current
        ) {
          stopPlayback();
        }
      };

      audio.onended = () => {
        stopPlayback();
      };

      audio.onerror = () => {
        cleanupAudio();
        playWithWebSpeech();
      };

      await audio.play();
      setState("playing");

      if (speechDurationRef.current) {
        speechEndTimerRef.current = setTimeout(
          stopPlayback,
          speechDurationRef.current * 1000 + 300,
        );
      }
    } catch {
      cleanupAudio();
      playWithWebSpeech();
    }
  }, [state, arabicText, cleanupAudio, playWithWebSpeech, stopPlayback]);

  useEffect(() => {
    return () => {
      cleanupAudio();
      if ("speechSynthesis" in window) {
        speechSynthesis.cancel();
      }
    };
  }, [cleanupAudio]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(clickPosition * 100);
  };

  const isDisabled = state === "loading" || state === "error";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={togglePlay}
        disabled={isDisabled}
        className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[var(--sage-200)] text-[var(--sage-700)] shadow-[0_8px_30px_rgba(92,124,104,0.2)] transition-colors hover:bg-[var(--sage-100)] disabled:opacity-50"
        aria-label={state === "playing" ? "Pause" : "Listen"}
      >
        {state === "loading" ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : state === "playing" ? (
          <FaPause className="h-4 w-4" />
        ) : (
          <FaPlay className="ml-0.5 h-4 w-4" />
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-full bg-[var(--sage-100)] px-3 py-2 cursor-pointer">
      <button
        type="button"
        onClick={togglePlay}
        disabled={isDisabled}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#2f342f] text-white transition-colors hover:bg-[#1a1d1a] disabled:opacity-50 dark:bg-[var(--sage-500)] dark:hover:bg-[var(--sage-500)]"
        aria-label={
          state === "playing" ? "Pause" : "Listen"
        }
      >
        {state === "loading" ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : state === "playing" ? (
          <FaPause className="h-4 w-4" />
        ) : (
          <FaPlay className="h-4 w-4 ml-0.5" />
        )}
      </button>

      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <div
          className="h-2 w-full cursor-pointer rounded-full bg-[rgba(86,96,86,0.16)] dark:bg-[rgba(255,255,255,0.12)]"
          onClick={handleProgressClick}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-[var(--sage-500)] transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs font-medium text-[var(--ink-700)]">
          <span>{errorMsg || formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <FaVolumeHigh className="h-4 w-4 text-[var(--ink-700)] dark:text-[var(--sage-500)]" />
    </div>
  );
}
