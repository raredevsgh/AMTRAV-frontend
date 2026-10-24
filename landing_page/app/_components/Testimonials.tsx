"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export type Testimonial = {
  quote: string;
  name: string;
  label: string;
  avatar: string;
  avatarMobile: string;
};

// Figma "Landing page" testimonial (120:126 / 2005:396): a vertical carousel. Up/down arrows on
// desktop, swipe on mobile, dots on both, and arrow keys while focus is inside. Nothing plays by
// itself. The arrows disable at either end, as the design's greyed-out "up" arrow shows.
export default function Testimonials({ items }: { items: readonly Testimonial[] }) {
  const [index, setIndex] = useState(0);
  // 1 = moving to a later slide (content rises), -1 = earlier (content drops), 0 = first render.
  const [direction, setDirection] = useState(0);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const item = items[index];
  const last = items.length - 1;

  const go = (next: number) => {
    if (next < 0 || next > last || next === index) return;
    setDirection(next > index ? 1 : -1);
    setIndex(next);
  };

  // The new slide eases in from the side it came from; nothing animates on first render.
  const slideMotion = direction === 0 ? {} : { "data-enter": "" };
  const slideClass = `[--motion-delay:0ms] ${direction < 0 ? "[--motion-rise:-16px]" : "[--motion-rise:16px]"}`;
  const slideLabel = { role: "group", "aria-roledescription": "slide", "aria-label": `${index + 1} of ${items.length}` } as const;

  return (
    <section
      aria-labelledby="testimonials-heading"
      aria-roledescription="carousel"
      onKeyDown={(e) => {
        const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (!step || !(e.target instanceof HTMLButtonElement)) return;
        e.preventDefault();
        go(index + step);
      }}
      className="flex flex-col gap-6 px-5 py-8 xl:h-[455px] xl:justify-center xl:px-[calc((100%-1120px)/2)] xl:py-2.5"
    >
      {/* Announces a change of slide; the slides themselves are re-created on each change. */}
      <p aria-live="polite" className="sr-only">
        {direction === 0 ? "" : `Testimonial ${index + 1} of ${items.length}: ${item.quote} ${item.name}`}
      </p>

      {/* Mobile */}
      <h2 id="testimonials-heading" data-reveal className="text-h1-m font-bold text-mid xl:hidden">
        Why we’re obsessed with the problem
      </h2>
      <figure
        data-reveal
        className="flex touch-pan-y flex-col rounded-3xl bg-white p-6 shadow-card xl:hidden"
        onPointerDown={(e) => (swipeStart.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={(e) => {
          const start = swipeStart.current;
          swipeStart.current = null;
          if (!start) return;
          const dx = e.clientX - start.x;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - start.y)) go(index + (dx < 0 ? 1 : -1));
        }}
      >
        <div key={index} {...slideMotion} {...slideLabel} className={`flex flex-col gap-5 ${slideClass}`}>
          <Image src={item.avatarMobile} alt="" width={56} height={56} />
          <blockquote className="text-h3-m font-semibold text-navy">{item.quote}</blockquote>
          <figcaption className="flex flex-col gap-1">
            <span className="text-body-m text-navy">{item.name}</span>
            <span className="text-caption-m text-mid">{item.label}</span>
          </figcaption>
        </div>
      </figure>
      <Dots count={items.length} current={index} onSelect={go} size="mobile" />

      {/* Desktop */}
      <div data-stagger className="hidden items-center gap-[87px] xl:flex">
        <div data-reveal className="flex w-[409px] shrink-0 flex-col gap-[102px]">
          <h2 className="text-h1 font-bold whitespace-nowrap text-mid">
            Why we’re obsessed
            <br />
            with the problem
          </h2>
          <Dots count={items.length} current={index} onSelect={go} size="desktop" />
        </div>
        <figure data-reveal className="relative h-[328px] w-[664px] shrink-0">
          <div className="absolute top-[34px] left-[36.72px] h-[294px] w-[500.23px] rounded-3xl bg-white shadow-card" />
          <div key={index} {...slideMotion} {...slideLabel} className={`absolute inset-0 ${slideClass}`}>
            <Image src={item.avatar} alt="" width={71} height={72} className="absolute top-0 left-0 h-[72px] w-[71.46px]" />
            <blockquote className="absolute top-[84px] left-[83.37px] w-[399px] text-h3 font-semibold text-navy">{item.quote}</blockquote>
            <figcaption className="absolute top-[227.5px] left-[83px] flex flex-col gap-1">
              <span className="text-body text-navy">{item.name}</span>
              <span className="text-small text-mid">{item.label}</span>
            </figcaption>
          </div>
          {/* The design's 16 × 74 pagination column: chevrons centred 5px and 69px from its top. */}
          <div className="absolute top-[139.08px] left-[649.1px] h-[74.34px] w-[15.9px]">
            <ArrowButton direction="up" disabled={index === 0} onClick={() => go(index - 1)} className="-top-[11px]" />
            <ArrowButton direction="down" disabled={index === last} onClick={() => go(index + 1)} className="top-[53.4px]" />
          </div>
        </figure>
      </div>
    </section>
  );
}

function ArrowButton({
  direction,
  disabled,
  onClick,
  className,
}: {
  direction: "up" | "down";
  disabled: boolean;
  onClick: () => void;
  className: string;
}) {
  return (
    <button
      type="button"
      aria-label={direction === "up" ? "Previous testimonial" : "Next testimonial"}
      disabled={disabled}
      onClick={onClick}
      className={`absolute left-1/2 flex size-8 -translate-x-1/2 items-center justify-center rounded-full text-[#050b16] transition-[color,background-color,scale] duration-200 ease-out-soft hover:bg-blue-pale focus-visible:outline-2 focus-visible:outline-brand disabled:text-stale disabled:hover:bg-transparent motion-safe:enabled:active:scale-90 ${className}`}
    >
      <svg width="16" height="9" viewBox="0 0 16 9" fill="none" aria-hidden className={direction === "down" ? "rotate-180" : ""}>
        <path d="M1 8L7.95 1L14.9 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}

// Desktop dots are 12px on a 38px pitch, mobile 8px on 16px (Figma). Each dot is a button; the
// negative margins keep the rows the size the design drew them.
function Dots({
  count,
  current,
  onSelect,
  size,
}: {
  count: number;
  current: number;
  onSelect: (i: number) => void;
  size: "desktop" | "mobile";
}) {
  const desktop = size === "desktop";
  return (
    <div className={desktop ? "-my-1.5 -ml-1.5 flex gap-[14px]" : "-my-2 -ml-1 flex xl:hidden"}>
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Show testimonial ${i + 1} of ${count}`}
          aria-current={i === current ? "true" : undefined}
          onClick={() => onSelect(i)}
          className={`group flex items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-brand ${desktop ? "size-6" : "h-6 w-4"}`}
        >
          <span
            className={`rounded-full transition-[background-color,scale] duration-300 ease-out-soft ${desktop ? "size-3" : "size-2"} ${
              i === current ? "bg-[#050b16]" : "bg-stale group-hover:bg-mid"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
