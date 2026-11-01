"use client";

import { useEffect, useState } from "react";

// Subtle scroll depth progress indicator at the top of the viewport.
export default function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) {
        setProgress(Math.min(100, Math.max(0, (window.scrollY / total) * 100)));
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      style={{ width: `${progress}%` }}
      className="pointer-events-none fixed top-0 left-0 z-50 h-[2.5px] bg-linear-to-r from-sky via-brand to-navy-deep opacity-90 transition-[width] duration-75 ease-out"
    />
  );
}

