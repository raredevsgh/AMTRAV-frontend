"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import useReducedMotion from "./useReducedMotion";

export type Testimonial = {
  quote: string;
  name: string;
  label: string;
  avatar?: string;
  avatarMobile?: string;
  initials?: string;
};

// Figma "Landing page" testimonial (120:126 / 2005:396): a vertical carousel. Up/down arrows on
// desktop, swipe on mobile, dots on both, and arrow keys while focus is inside. Autoplay loops
// every four seconds while visible. Keyboard focus stops it until the user explicitly resumes.
export default function Testimonials({ items }: { items: readonly Testimonial[] }) {
  const [index, setIndex] = useState(0);
  // 1 = moving to a later slide (content rises), -1 = earlier (content drops), 0 = first render.
  const [direction, setDirection] = useState(0);
  const [focusPaused, setFocusPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const section = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const item = items[index];
  const last = items.length - 1;
  const rotating = !focusPaused && !reducedMotion;

  useEffect(() => {
    const element = section.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.25 });
    observer.observe(element);
    const onVisibilityChange = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!rotating || hovered || !visible || !pageVisible || items.length < 2) return;
    const timer = setTimeout(() => {
      if (document.hidden) return;
      setDirection(1);
      setIndex((current) => (current + 1) % items.length);
    }, 4000);
    return () => clearTimeout(timer);
  }, [rotating, hovered, visible, pageVisible, index, items.length]);

  if (!item) return null;

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
      ref={section}
      aria-labelledby="testimonials-heading"
      aria-roledescription="carousel"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocusPaused(true)}
      onBlurCapture={() => setFocusPaused(false)}
      onKeyDown={(e) => {
        const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (!step || !(e.target instanceof HTMLButtonElement)) return;
        e.preventDefault();
        go(index + step);
      }}
      className="relative flex flex-col gap-6 px-5 py-8 xl:min-h-[455px] xl:justify-center xl:px-[max(40px,calc((100%-1120px)/2))] xl:py-10"
    >
      {/* Announces a change of slide; the slides themselves are re-created on each change. */}
      <p aria-live={rotating ? "off" : "polite"} aria-atomic="true" className="sr-only">
        {direction === 0 ? "" : `Testimonial ${index + 1} of ${items.length}: ${item.quote} ${item.name}`}
      </p>

      {/* Mobile */}
      <h2 id="testimonials-heading" data-reveal className="text-h1-m font-bold text-mid xl:hidden">
        Why we’re obsessed with the problem
      </h2>
      <figure
        data-reveal
        className="flex min-h-[370px] touch-pan-y flex-col rounded-3xl bg-white p-6 shadow-card xl:hidden"
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
          <Avatar item={item} mobile />
          <blockquote className="text-h3-m font-semibold text-navy">{item.quote}</blockquote>
          <figcaption className="flex flex-col gap-1">
            <span className="text-body-m text-navy">{item.name}</span>
            <span className="text-caption-m text-mid">{item.label}</span>
          </figcaption>
        </div>
      </figure>
      <Dots count={items.length} current={index} onSelect={go} size="mobile" />

      {/* Desktop */}
      <div data-stagger className="hidden items-center gap-12 xl:grid xl:grid-cols-[minmax(0,409px)_minmax(0,1fr)]">
        <div data-reveal className="flex min-w-0 flex-col gap-[102px]">
          <h2 className="text-[42px] leading-[1.1] font-bold tracking-[-0.03em] text-mid">
            Why we’re obsessed
            <br />
            with the problem
          </h2>
          <Dots count={items.length} current={index} onSelect={go} size="desktop" />
        </div>
        <figure data-reveal className="relative min-h-[328px] pt-[34px] pr-16 pl-9">
          <div key={index} {...slideMotion} {...slideLabel} className={`relative flex min-h-[320px] flex-col gap-5 rounded-3xl bg-white px-9 pt-12 pb-10 shadow-card ${slideClass}`}>
            <div className="absolute top-[-34px] left-[-36px]"><Avatar item={item} /></div>
            <blockquote className="text-h3 font-semibold text-navy">{item.quote}</blockquote>
            <figcaption className="mt-auto flex flex-col gap-1">
              <span className="text-body text-navy">{item.name}</span>
              <span className="text-small text-mid">{item.label}</span>
            </figcaption>
          </div>
          <div className="absolute top-1/2 right-0 h-[74.34px] w-4 -translate-y-1/2">
            <ArrowButton direction="up" disabled={index === 0} onClick={() => go(index - 1)} className="-top-[11px]" />
            <ArrowButton direction="down" disabled={index === last} onClick={() => go(index + 1)} className="top-[53.4px]" />
          </div>
        </figure>
      </div>
    </section>
  );
}

function Avatar({ item, mobile = false }: { item: Testimonial; mobile?: boolean }) {
  const size = mobile ? 56 : 72;
  const source = mobile ? item.avatarMobile ?? item.avatar : item.avatar;
  return source ? (
    <Image src={source} alt="" width={size} height={size} className={`shrink-0 rounded-full object-cover ${mobile ? "size-14" : "size-[72px]"}`} />
  ) : (
    <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-full bg-blue-pale font-semibold text-navy ${mobile ? "size-14 text-body" : "size-[72px] text-h4"}`}>
      {item.initials}
    </span>
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
          className="group flex size-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-brand"
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
