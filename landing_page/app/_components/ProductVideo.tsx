"use client";

import { useEffect, useRef, useState } from "react";
import useReducedMotion from "./useReducedMotion";

const VIDEO = "/media/amortv-luggage.mp4";

export default function ProductVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    let visible = false;
    // Save-Data users and reduced-motion users see the poster.
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const allowed = !reducedMotion && !connection?.saveData;
    const update = () => {
      if (visible && !document.hidden && allowed) {
        if (!element.getAttribute("src")) element.src = VIDEO;
        void element.play().catch(() => { /* Autoplay may be denied. */ });
      } else element.pause();
    };

    // Ensure Picture-in-Picture is disabled at the DOM property level as well
    if ("disablePictureInPicture" in element) {
      element.disablePictureInPicture = true;
    }

    const onEnterPiP = () => {
      if (document.pictureInPictureElement) {
        void document.exitPictureInPicture().catch(() => {});
      }
    };
    element.addEventListener("enterpictureinpicture", onEnterPiP);

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    }, { threshold: 0.15 });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      element.removeEventListener("enterpictureinpicture", onEnterPiP);
      element.pause();
    };
  }, [reducedMotion]);

  return (
    <div className="pointer-events-none absolute inset-0 bg-navy select-none" aria-hidden="true">
      <video
        ref={video}
        width={1280}
        height={720}
        muted
        loop
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        controlsList="nodownload noplaybackrate nofullscreen noremoteplayback"
        tabIndex={-1}
        preload="none"
        poster="/media/amortv-luggage-poster.webp"
        aria-label="AMORTRAV suitcase in airport and terminal scenes. Silent product film."
        aria-describedby="product-video-description"
        onError={() => setFailed(true)}
        className="pointer-events-none size-full object-cover select-none"
      >
        Your browser cannot play this film. The poster shows the AMORTRAV suitcase.
      </video>
      <p id="product-video-description" className="sr-only">
        Silent product footage showing the suitcase, an airport trolley, a traveller, and a bag handle. Decorative background film; all page information is available as text.
      </p>
      {failed && (
        <p
          role="status"
          className="absolute inset-x-3 top-3 z-20 rounded-xl bg-navy px-4 py-3 text-body-m text-white"
        >
          The film could not load. The product image is still available.
        </p>
      )}
    </div>
  );
}
