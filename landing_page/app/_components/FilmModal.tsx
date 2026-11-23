"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export default function FilmModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(78);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      void videoRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " " || e.key === "k") {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === "m") {
        toggleMute();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, togglePlay, toggleMute]);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      void videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 78;
      setCurrentTime(cur);
      setProgress((cur / dur) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const dur = videoRef.current.duration || 78;
    videoRef.current.currentTime = ratio * dur;
    setProgress(ratio * 100);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (!document.fullscreenElement) {
      void videoRef.current.requestFullscreen().catch(() => {});
    } else {
      void document.exitFullscreen().catch(() => {});
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="film-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-navy border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-navy-deep/80">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-sky animate-pulse" />
            <h2 id="film-title" className="text-caption font-semibold text-white tracking-wide">
              AMORTRAV · {t("landing.filmLabel", "Concept & Brand Film")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("landing.close", "Close film")}
            className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-sky"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video w-full bg-black group">
          <video
            ref={videoRef}
            src="/video/trace-film.mp4"
            autoPlay
            playsInline
            controls={false}
            loop={false}
            muted={isMuted}
            poster="/video/trace-film-poster.png"
            className="size-full object-contain cursor-pointer"
            onClick={togglePlay}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
          >
            <source src="/video/trace-film.mp4" type="video/mp4" />
            <source src="/video/amortrav-concept-film.mp4" type="video/mp4" />
          </video>

          {/* Interactive Play/Mute/Seek Overlay Controls */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 sm:p-5 pt-8">
            {/* Timeline Progress Bar */}
            <div
              className="relative h-1.5 w-full cursor-pointer rounded-full bg-white/25 hover:h-2 transition-all mb-3 group/bar"
              onClick={handleSeek}
            >
              <div
                className="h-full rounded-full bg-sky relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 size-3 rounded-full bg-white shadow-md opacity-0 group-hover/bar:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Bottom Controls Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? t("landing.pause", "Pause") : t("landing.resume", "Play")}
                  className="flex size-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-sky hover:text-navy active:scale-95"
                >
                  {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5 fill-white" />}
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                  className="flex size-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-sky hover:text-navy active:scale-95"
                >
                  {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                </button>
                <span className="font-mono text-[11px] text-white/80">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-block font-mono text-[11px] text-white/70">
                  Concept & Brand Film
                </span>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  aria-label="Fullscreen"
                  className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                  <Maximize className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
