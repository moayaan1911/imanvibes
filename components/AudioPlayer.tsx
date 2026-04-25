"use client";

import { absoluteUrl } from "@/lib/site";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaPlay, FaPause, FaVolumeHigh } from "react-icons/fa6";

interface AudioPlayerProps {
  arabicText: string;
  variant?: "default" | "icon";
}

type PlaybackState = "idle" | "loading" | "playing" | "paused" | "error";

export default function AudioPlayer({
  arabicText,
  variant = "default",
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  }, []);

  const playRemoteAudio = useCallback(async () => {
    cleanupAudio();

    const audio = new Audio(
      absoluteUrl(`/api/tts?text=${encodeURIComponent(arabicText)}`),
    );
    audio.preload = "auto";
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };

    audio.ontimeupdate = () => {
      const effectiveDuration = audio.duration;
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / effectiveDuration) * 100 || 0);
    };

    audio.onended = () => {
      stopPlayback();
    };

    audio.onerror = () => {
      cleanupAudio();
      setErrorMsg("Playback failed");
      setState("error");
    };

    await audio.play();
    setState("playing");
  }, [arabicText, cleanupAudio, stopPlayback]);

  const togglePlay = useCallback(async () => {
    if (state === "playing") {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setState("paused");
      return;
    }

    if (state === "paused" && audioRef.current) {
      audioRef.current.play();
      setState("playing");

      const remaining = audioRef.current.duration - audioRef.current.currentTime;
      if (speechEndTimerRef.current) {
        clearTimeout(speechEndTimerRef.current);
      }
      speechEndTimerRef.current = setTimeout(stopPlayback, remaining * 1000 + 200);
      return;
    }

    setState("loading");
    setErrorMsg(null);
    setDuration(0);

    try {
      await playRemoteAudio();
    } catch {
      cleanupAudio();
      setErrorMsg("Playback failed");
      setState("error");
    }
  }, [state, arabicText, cleanupAudio, playRemoteAudio, stopPlayback]);

  useEffect(() => {
    return () => {
      cleanupAudio();
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

  const isDisabled = state === "loading";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={() => void togglePlay()}
        disabled={isDisabled}
        className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[var(--sage-200)] text-[var(--sage-700)] shadow-[0_8px_30px_rgba(92,124,104,0.2)] transition-colors hover:bg-[var(--sage-100)] disabled:opacity-50"
        aria-label={state === "playing" ? "Pause" : "Listen"}
      >
        {state === "loading" ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : state === "playing" ? (
          <FaPause className="h-5 w-5" />
        ) : (
          <FaPlay className="ml-0.5 h-5 w-5" />
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
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#2f342f] text-white transition-colors hover:bg-[#1a1d1a] disabled:opacity-50 dark:bg-[var(--sage-600)] dark:hover:bg-[var(--sage-600)]"
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
          className="h-2 w-full cursor-pointer rounded-full bg-[var(--ink-300)] dark:bg-[var(--ink-600)]"
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

        <div className="flex items-center justify-between text-xs font-medium text-[var(--ink-800)] dark:text-[var(--ink-300)]">
          <span>{errorMsg || formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <FaVolumeHigh className="h-4 w-4 text-[var(--ink-700)] dark:text-[var(--sage-600)]" />
    </div>
  );
}
