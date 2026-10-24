"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Reveals [data-reveal] elements as they scroll into view (see "Motion" in globals.css).
// It drives the Web Animations API and never changes attributes or classes: parts of the page
// can still be hydrating when this runs, and React reports anything it did not render as a
// hydration mismatch.
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const RISE: Keyframe[] = [
  { opacity: 0, translate: "0 24px" },
  { opacity: 1, translate: "0 0" },
];
const GROW: Keyframe[] = [{ scale: "0 1" }, { scale: "1 1" }];

// Survives route changes: Next.js keeps visited pages mounted, so their elements come back.
const handled = new WeakSet<Element>();
let hydrated = false;

// "--motion-delay" is set by data-stagger or a class, as "80ms" or (once minified) ".16s".
function delayOf(el: Element) {
  const value = getComputedStyle(el).getPropertyValue("--motion-delay").trim();
  const n = parseFloat(value);
  if (Number.isNaN(n)) return 0;
  return value.endsWith("ms") ? n : n * 1000;
}

// Creates the reveal animation(s) paused on their first frame, which hides the content.
function hold(el: HTMLElement) {
  const targets = el.dataset.reveal === "group" ? Array.from(el.children) : [el];
  return targets.map((target) => {
    const grow = target instanceof HTMLElement && target.dataset.reveal === "grow";
    const animation = target.animate(grow ? GROW : RISE, {
      duration: grow ? 900 : 700,
      delay: delayOf(target),
      easing: EASE,
      fill: "backwards",
    });
    animation.pause();
    return animation;
  });
}

export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const pending = new Map<Element, Animation[]>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          pending.get(entry.target)?.forEach((animation) => animation.play());
          pending.delete(entry.target);
          observer.unobserve(entry.target);
        }
      },
      // Start once the element is a little way into the viewport, not at its very edge.
      { rootMargin: "0px 0px -8% 0px" },
    );

    for (const el of document.querySelectorAll<HTMLElement>("[data-reveal]")) {
      if (handled.has(el)) continue;
      handled.add(el);
      // On first load, content on or above the screen has already been painted: leave it.
      if (!hydrated && el.getBoundingClientRect().top < window.innerHeight) continue;
      pending.set(el, hold(el));
      observer.observe(el);
    }
    hydrated = true;

    return () => {
      observer.disconnect();
      // Show anything still waiting, and let the next run pick it up again.
      for (const [el, animations] of pending) {
        animations.forEach((animation) => animation.cancel());
        handled.delete(el);
      }
    };
  }, [pathname]);

  return null;
}
