"use client";

import { useEffect, useRef } from "react";
import { X, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
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

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      void videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      void videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
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
              AMORTRAV · {t("landing.filmLabel", "Product film")}
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
        <div className="relative aspect-video w-full bg-black">
          <video
            ref={videoRef}
            src="/video/trace-film.mp4"
            autoPlay
            playsInline
            controls={false}
            loop
            muted={isMuted}
            poster="/media/amortv-luggage-poster.webp"
            className="size-full object-contain"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src="/video/trace-film.mp4" type="video/mp4" />
            <source src="/video/amortrav-spot.mp4" type="video/mp4" />
          </video>

          {/* Interactive Play/Mute Overlay Controls */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? t("landing.pause", "Pause") : t("landing.resume", "Play")}
                className="flex size-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-sky hover:text-navy active:scale-95"
              >
                {isPlaying ? <Pause className="size-5" /> : <Play className="size-5 ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
                className="flex size-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-sky hover:text-navy active:scale-95"
              >
                {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
              </button>
            </div>
            <p className="hidden text-caption text-white/80 sm:block">
              {t("landing.filmDescription", "15-second product experience")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
