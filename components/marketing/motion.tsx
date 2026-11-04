"use client";
// Subtle motion for the site: things rise into place as they scroll into view, a few
// float or drift. All of it stops for people who ask for less motion (system setting) or
// who pause it on the site.
import {
  inView,
  motion,
  MotionConfig,
  stagger,
  useAnimate,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { createElement, useEffect, useRef, type ReactNode } from "react";
import { useSiteStore } from "@/stores/site-store";

/** The site's easing: quick out of the gate, soft landing. */
export const ease = [0.22, 1, 0.36, 1] as const;

export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

function useStill() {
  const reduce = useReducedMotion();
  const paused = useSiteStore((s) => s.motionPaused);
  return !!reduce || paused;
}

export function Float({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const still = useStill();
  return (
    <motion.div
      className={className}
      animate={{ y: still ? 0 : [0, -10, 0] }}
      transition={
        still
          ? { duration: 0 }
          : { duration: 5, repeat: Infinity, ease: "easeInOut", delay }
      }
    >
      {children}
    </motion.div>
  );
}

type StaggerTag = "div" | "header" | "ol" | "ul" | "section";

/**
 * Its children rise and fade in, one after another, when it scrolls into view. Anything
 * already on screen when the page opens is left alone, so nothing flickers on load and
 * the page reads fine before scripts run.
 */
export function Stagger({
  as = "div",
  className,
  children,
  gap = 0.07,
  ...rest
}: {
  as?: StaggerTag;
  className?: string;
  children: ReactNode;
  /** Seconds between children. */
  gap?: number;
} & Partial<Record<`aria-${string}` | "id", string>>) {
  const [scope, animate] = useAnimate<HTMLElement>();
  const still = useStill();
  useEffect(() => {
    const element = scope.current;
    if (!element || still) return;
    if (element.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    const items = [...element.children] as HTMLElement[];
    animate(items, { opacity: 0, y: 18 }, { duration: 0 });
    const stop = inView(
      element,
      () => {
        animate(
          items,
          { opacity: 1, y: 0 },
          { duration: 0.6, ease, delay: stagger(gap) },
        );
        stop();
      },
      { amount: 0.15 },
    );
    return () => {
      stop();
      // Leave the content visible if this unmounts or motion is turned off midway.
      animate(items, { opacity: 1, y: 0 }, { duration: 0 });
    };
  }, [animate, gap, scope, still]);
  return createElement(as, { ref: scope, className, ...rest }, children);
}

/** A background image that drifts a little slower than the page as it scrolls past. */
export function Parallax({
  children,
  className,
  distance = 48,
}: {
  children: ReactNode;
  className?: string;
  /** Total drift, in pixels, across the scroll. */
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const still = useStill();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-distance / 2, distance / 2]);
  return (
    <motion.div ref={ref} className={className} style={still ? undefined : { y }}>
      {children}
    </motion.div>
  );
}
