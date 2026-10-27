"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// Reuse the landing AppSignup footer's plane silhouette and 12-second native SVG motion.
// The route is relative to the login artwork's lower-left starting point.
const ROUTE = "M 0 0 C 130 -160 240 -220 395 -270 S 580 -370 675 -570";
const PLANE =
  "M12 0 C12 -1.5 10.5 -2 9 -2 L3 -2 L-4 -10 L-7 -10 L-3 -2 L-8 -2 L-10 -5 L-12 -5 L-11 0 L-12 5 L-10 5 L-8 2 L-3 2 L-7 10 L-4 10 L3 2 L9 2 C10.5 2 12 1.5 12 0 Z";
const preference = "(prefers-reduced-motion: reduce)";
function subscribe(onChange: () => void) {
  const query = matchMedia(preference);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
export function LoginFlight() {
  const svg = useRef<SVGSVGElement>(null);
  const started = useRef(false);
  const [paused, setPaused] = useState(false);
  const reduced = useSyncExternalStore(
    subscribe,
    () => matchMedia(preference).matches,
    () => true,
  );
  useEffect(() => {
    const scene = svg.current;
    if (!scene) return;
    if (reduced || paused) scene.pauseAnimations();
    else {
      if (!started.current) {
        scene
          .querySelector<SVGAnimationElement>("animateMotion")
          ?.beginElement();
        started.current = true;
      }
      scene.unpauseAnimations();
    }
  }, [paused, reduced]);
  return (
    <>
      <svg
        ref={svg}
        aria-hidden="true"
        className="login-route"
        viewBox="0 0 720 900"
        preserveAspectRatio="none"
      >
        <g transform="translate(40 760)">
          <path
            data-flight-route
            d={ROUTE}
            fill="none"
            stroke="#536b9d"
            strokeWidth="2"
            strokeDasharray="2 10"
            strokeLinecap="round"
          />
          <circle r="4" fill="#a9c1ff" />
          <g data-flight-plane>
            <path d={PLANE} fill="#fff" transform="scale(1.1)" />
            <animateMotion
              begin="indefinite"
              dur="12s"
              repeatCount="indefinite"
              rotate="auto"
              path={ROUTE}
            />
          </g>
        </g>
      </svg>
      {!reduced && (
        <button
          type="button"
          className="flight-toggle"
          aria-label={paused ? "Play plane animation" : "Pause plane animation"}
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? "Play animation" : "Pause animation"}
        </button>
      )}
    </>
  );
}
