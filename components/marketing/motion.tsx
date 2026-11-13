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
  useScroll,
  useTransform,
} from "framer-motion";
import { usePathname } from "next/navigation";
import {
  createElement,
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useSiteStore } from "@/stores/site-store";
import { Pause, Play } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";

/** The site's easing: quick out of the gate, soft landing. */
export const ease = [0.22, 1, 0.36, 1] as const;

export function MotionProvider({ children }: { children: ReactNode }) {
  const paused = useSiteStore((s) => s.motionPaused);
  return (
    <MotionConfig reducedMotion={paused ? "always" : "user"}>{children}</MotionConfig>
  );
}

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(change: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", change);
  return () => query.removeEventListener("change", change);
}
const getMotionPreference = () => window.matchMedia(motionQuery).matches;
const serverMotionPreference = () => false;

/** Stable server snapshot prevents conditional SVG/video hydration mismatches. */
export function useReducedMotionPreference() {
  return useSyncExternalStore(
    subscribeMotion,
    getMotionPreference,
    serverMotionPreference,
  );
}

export function useMotionPaused() {
  const reduce = useReducedMotionPreference();
  const paused = useSiteStore((s) => s.motionPaused);
  return reduce || paused;
}

export function MotionControl() {
  const { m } = useI18n();
  const reduced = useReducedMotionPreference();
  const paused = useSiteStore((s) => s.motionPaused);
  const setPaused = useSiteStore((s) => s.setMotionPaused);
  return (
    <button
      type="button"
      className="site-motion-toggle"
      aria-pressed={reduced || paused}
      disabled={reduced}
      onClick={() => setPaused(!paused)}
    >
      {paused && !reduced ? (
        <Play size={14} aria-hidden="true" />
      ) : (
        <Pause size={14} aria-hidden="true" />
      )}
      {reduced ? m.landing.reduced : paused ? m.landing.resume : m.landing.pause}
    </button>
  );
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
  const still = useMotionPaused();
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

type StaggerTag = "div" | "dl" | "header" | "ol" | "ul" | "section";

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
  const still = useMotionPaused();
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
          { duration: 0.48, ease, delay: stagger(Math.min(gap, 0.08)) },
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
  const still = useMotionPaused();
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

/** Lists and grids whose items arrive one after another rather than as one block. */
const GROUPS = ".page-ticks, .page-cards, .faq-list, .contact-ways";
/** Cards that a soft light follows the cursor across (app/motion.css). */
const SPOTLIT =
  ".trace-feature, .trace-range-card, .contact-way, .feature-card, .explore-card";

/**
 * The site's scripted motion, next to the CSS in app/motion.css. On the inner pages, what's
 * below the fold when a page opens fades up as it scrolls into view; what's already on screen
 * is left alone, so nothing flickers and the page reads fine before scripts run. Over cards,
 * it moves the light that follows the cursor. Off for less motion, or while paused.
 */
export function SiteMotion() {
  const pathname = usePathname();
  const still = useMotionPaused();

  useEffect(() => {
    const page = document.querySelector<HTMLElement>(".site-shell .trace.page");
    if (still || !page) return;
    const targets: HTMLElement[] = [];
    // Everything after the hero: each section's parts, and a list's items one by one.
    for (const section of page.querySelectorAll<HTMLElement>(
      ":scope > section:not(:first-child)",
    )) {
      for (const part of section.children) {
        if (part.matches(GROUPS))
          targets.push(...(Array.from(part.children) as HTMLElement[]));
        else targets.push(part as HTMLElement);
      }
    }
    const fold = window.innerHeight * 0.92;
    const hidden = targets.filter((target) => target.getBoundingClientRect().top > fold);
    for (const target of hidden) {
      const order = Array.prototype.indexOf.call(
        target.parentElement?.children ?? [],
        target,
      );
      target.style.setProperty("--reveal-i", String(Math.min(order, 5)));
      target.dataset.reveal = "hidden";
    }
    const watcher = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.reveal = "shown";
          watcher.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    hidden.forEach((target) => watcher.observe(target));
    return () => {
      watcher.disconnect();
      // Leave everything visible if the page changes or motion stops midway.
      for (const target of hidden) {
        delete target.dataset.reveal;
        target.style.removeProperty("--reveal-i");
      }
    };
  }, [pathname, still]);

  useEffect(() => {
    if (still || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let frame = 0;
    let last: { card: HTMLElement; x: number; y: number } | null = null;
    const move = (event: PointerEvent) => {
      const card = (event.target as Element | null)?.closest?.<HTMLElement>(SPOTLIT);
      if (!card) return;
      const box = card.getBoundingClientRect();
      last = { card, x: event.clientX - box.left, y: event.clientY - box.top };
      // One style write per frame, however fast the pointer moves.
      frame ||= requestAnimationFrame(() => {
        frame = 0;
        last?.card.style.setProperty("--spot-x", `${last.x}px`);
        last?.card.style.setProperty("--spot-y", `${last.y}px`);
      });
    };
    document.addEventListener("pointermove", move, { passive: true });
    return () => {
      document.removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
    };
  }, [still]);

  return null;
}
