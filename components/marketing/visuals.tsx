"use client";
import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Fingerprint } from "lucide-react";
import { useSiteStore } from "@/stores/site-store";
export function FlightPath({ variant = "hero" }: { variant?: "hero" | "wide" }) {
  const id = useId().replaceAll(":", "");
  const reduce = useReducedMotion();
  const paused = useSiteStore((s) => s.motionPaused);
  const wide = variant === "wide";
  const path = wide
    ? "M-20 260 C 300 60, 900 300, 1320 60"
    : "M-10 300 C 120 60, 380 -10, 620 70";
  return (
    <svg
      aria-hidden="true"
      className={`flight-path ${wide ? "wide" : ""}`}
      viewBox={wide ? "0 0 1300 300" : "0 0 600 540"}
      preserveAspectRatio={wide ? "none" : "xMidYMid slice"}
    >
      <defs>
        <g id={id}>
          <path
            d="M-16 0 L10 -3 Q18 -2 20 0 Q18 2 10 3 Z M0 -1 L-8 -16 L-3 -16 L9 -1 Z M0 1 L-8 16 L-3 16 L9 1 Z M-13 -1 L-17 -8 L-14 -8 L-9 -1 Z M-13 1 L-17 8 L-14 8 L-9 1 Z"
            fill="white"
          />
        </g>
      </defs>
      <g className="cloud" opacity=".15">
        <ellipse cx="60" cy="70" rx="46" ry="16" fill="white" />
        <ellipse cx="84" cy="58" rx="28" ry="18" fill="white" />
      </g>
      <path
        d={path}
        fill="none"
        stroke={wide ? "#3D5C8C" : "#A9CCFF"}
        strokeWidth="2"
        strokeDasharray="4 12"
        className="dashed-path"
        opacity=".8"
      />
      {!reduce && !paused && (
        <use href={`#${id}`}>
          <animateMotion
            dur={wide ? "10s" : "8s"}
            repeatCount="indefinite"
            rotate="auto"
            path={path}
          />
        </use>
      )}
    </svg>
  );
}
export function PairCard() {
  return (
    <div className="pair-card">
      <div className="mono">AMT-CO55-00F3A1</div>
      <div className="mono secret-code">••••-••••</div>
      <div className="claimed">
        <Check size={18} />
        Claimed
      </div>
    </div>
  );
}
export function LocationVisual() {
  return (
    <svg aria-hidden="true" viewBox="0 0 280 140" className="location-visual">
      <path
        d="M0 35H280M0 70H280M0 105H280M70 0V140M140 0V140M210 0V140"
        stroke="#DCE5F2"
      />
      <path
        d="M20 120 C 80 120, 90 40, 150 50 S 230 90, 250 30"
        fill="none"
        stroke="#0047AD"
        strokeWidth="2.5"
        strokeDasharray="4 8"
        className="dashed-path"
      />
      <circle cx="250" cy="30" r="7" fill="#0047AD" />
    </svg>
  );
}
export function FingerprintVisual() {
  return (
    <div className="visual-surface fingerprint">
      <Fingerprint size={84} strokeWidth={1.4} />
    </div>
  );
}
export function Modes({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`modes visual-surface ${compact ? "compact" : ""}`}>
      {(compact
        ? ["Normal", "Economy", "Flight safe"]
        : ["Normal", "Economy", "Flight safe", "Backup", "Recovery sync"]
      ).map((mode) => (
        <span key={mode} className={mode === "Flight safe" ? "selected" : ""}>
          {mode}
        </span>
      ))}
    </div>
  );
}
export function FirmwareVisual() {
  const reduced = useReducedMotion();
  const paused = useSiteStore((s) => s.motionPaused);
  return (
    <div className="visual-surface firmware-visual">
      <div>
        <strong>Firmware update</strong>
        <span className="mono">Next release</span>
      </div>
      <div className="progress-track">
        <motion.span
          animate={{ width: reduced || paused ? "70%" : ["8%", "100%", "100%"] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>
      <small>Signed and verified before install</small>
    </div>
  );
}
