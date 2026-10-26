"use client";

import { useEffect, useRef, useState } from "react";
import useReducedMotion from "../_components/useReducedMotion";

const VIDEO = "/media/amortv-luggage.mp4";

export default function ProductVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();
  const [requested, setRequested] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    let visible = false;
    // Save-Data users and reduced-motion users see the poster until they choose Play.
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const allowed = requested ?? (!reducedMotion && !connection?.saveData);
    const update = () => {
      if (visible && !document.hidden && allowed) {
        if (!element.getAttribute("src")) element.src = VIDEO;
        void element.play().catch(() => { /* Autoplay may be denied; the Play control remains available. */ });
      } else element.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    }, { threshold: 0.15 });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      element.pause();
    };
  }, [reducedMotion, requested]);

  return (
    <div className="relative aspect-video w-full bg-navy">
      <video
        ref={video}
        width={1280}
        height={720}
        muted
        loop
        playsInline
        preload="none"
        poster="/media/amortv-luggage-poster.webp"
        aria-label="AMORTRAV suitcase in airport and terminal scenes. Silent product film."
        aria-describedby="product-video-description"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => { setFailed(true); setPlaying(false); }}
        className="size-full object-contain"
      >
        Your browser cannot play this film. The poster shows the AMORTRAV suitcase.
      </video>
      <p id="product-video-description" className="sr-only">Silent product footage showing the suitcase, an airport trolley, a traveller, and a bag handle. Product preview only; purchasing is unavailable.</p>
      {!failed && <button
        type="button"
        aria-label={playing ? "Pause product video" : "Play product video"}
        onClick={() => setRequested(!playing)}
        className="absolute right-3 bottom-3 flex min-h-11 items-center gap-2 rounded-full bg-navy px-4 text-btn-sm font-semibold text-white shadow-card hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white xl:right-5 xl:bottom-5"
      >
        <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
        {playing ? "Pause video" : "Play video"}
      </button>}
      {failed && <p role="status" className="absolute inset-x-3 bottom-3 rounded-xl bg-navy px-4 py-3 text-body-m text-white">The film could not load. The product image is still available.</p>}
    </div>
  );
}
