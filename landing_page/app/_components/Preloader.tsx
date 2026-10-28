"use client";

import { gsap } from "gsap";
import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";

// First-visit preloader: a LOS → LHR flight whose progress is the page load, then the
// AMORTRAV lockup, then a two-layer curtain that lifts off the hero. Shown once per tab
// session (`storageKey` in sessionStorage). The inline script in layout.tsx sets
// `html[data-preloaded]` before first paint on repeat visits and for reduced motion, and
// globals.css hides the preloader for it.

const ROUTE = "M60 200 C 300 10, 700 10, 940 200";
const WORDMARK = "AMORTRAV".split("");
const STEPS = ["Unbox", "Pair", "Fly"] as const;
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
// The page's first section played its entrances (data-enter) under the curtain: replay them.
const HERO_ENTRANCES = "main > :first-child [data-enter]";
const CLOSED = "inset(0% 0% 0% 0%)";
const LIFTED = "inset(0% 0% 100% 0%)";

export default function Preloader({ storageKey }: { storageKey: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useLayoutEffect(() => {
    const html = document.documentElement;
    const el = root.current;
    // Skipped: globals.css already hides it, and it stays inert.
    if (!el || html.hasAttribute("data-preloaded")) return;

    const path = el.querySelector<SVGPathElement>("[data-flight-path]")!;
    const plane = el.querySelector<SVGGElement>("[data-plane]")!;
    const counter = el.querySelector<HTMLElement>("[data-counter]")!;
    const from = el.querySelector<HTMLElement>("[data-code='from']")!;
    const to = el.querySelector<HTMLElement>("[data-code='to']")!;
    const steps = Array.from(el.querySelectorAll<HTMLElement>("[data-step]"));
    const length = path.getTotalLength();

    html.style.overflow = "hidden";

    // Window load gates the last 10% of the flight, so a slow connection holds on approach.
    let loaded = document.readyState === "complete";
    let waiting = false;
    let tl: gsap.core.Timeline | undefined;
    const onLoad = () => {
      loaded = true;
      if (waiting) tl?.play();
    };
    window.addEventListener("load", onLoad, { once: true });

    // Progress 0 → 1 drives the plane, the drawn route, the counter and the step labels.
    const flight = { p: 0 };
    const renderFlight = () => {
      const at = flight.p * length;
      const point = path.getPointAtLength(at);
      const ahead = path.getPointAtLength(Math.min(at + 1, length));
      const angle = (Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI;
      // The plane glyph points up-right (-45deg), so add 45 to align it with the route.
      plane.setAttribute("transform", `translate(${point.x} ${point.y}) rotate(${angle + 45})`);
      path.style.strokeDashoffset = String(1 - flight.p);
      counter.textContent = String(Math.round(flight.p * 100)).padStart(3, "0");
      const active = Math.min(STEPS.length - 1, Math.floor(flight.p * STEPS.length));
      steps.forEach((step, i) => step.toggleAttribute("data-active", i <= active));
    };

    // Split-flap board: random letters that lock in from left to right.
    const flap = (target: HTMLElement, final: string, duration: number) => {
      const state = { t: 0 };
      return gsap.to(state, {
        t: 1,
        duration,
        ease: "none",
        onUpdate() {
          const locked = Math.floor(state.t * (final.length + 1));
          target.textContent = Array.from(final, (ch, i) =>
            i < locked ? ch : LETTERS[Math.floor(Math.random() * LETTERS.length)],
          ).join("");
        },
        onComplete: () => void (target.textContent = final),
      });
    };

    // Scoped to the preloader: selector strings resolve inside it, and revert() cleans up.
    const ctx = gsap.context(() => {
      renderFlight();
      gsap.set("[data-curtain]", { clipPath: CLOSED });

      tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete() {
          try {
            sessionStorage.setItem(storageKey, "1");
          } catch {}
          html.style.overflow = "";
          setDone(true);
        },
      });

      // 1. Boarding: meta lines rise, the dashed route fades in, the airport codes flip.
      tl.from("[data-meta]", { yPercent: 120, opacity: 0, duration: 0.7, stagger: 0.06 })
        .from("[data-route-base]", { opacity: 0, duration: 0.6 }, "<")
        .add(flap(from, "LOS", 0.7), "<0.1")
        .add(flap(to, "LHR", 0.9), "<0.15")
        .from("[data-step], [data-counter-wrap]", { opacity: 0, y: 16, duration: 0.6, stagger: 0.05 }, "<")

        // 2. Flight: 0 → 90% on a fixed clock, the rest once the page has loaded.
        .to(flight, { p: 0.9, duration: 1.7, ease: "power2.inOut", onUpdate: renderFlight }, "-=0.3")
        .call(() => {
          if (!loaded) {
            waiting = true;
            tl?.pause();
          }
        })
        .to(flight, { p: 1, duration: 0.55, onUpdate: renderFlight })

        // 3. Touchdown: the plane settles at LHR and a ring pulses out.
        .to("[data-plane-glyph]", { scale: 0, svgOrigin: "0 0", duration: 0.35, ease: "back.in(2)" })
        .fromTo(
          "[data-landing-ring]",
          { scale: 0.2, opacity: 0.9, transformOrigin: "50% 50%" },
          { scale: 2.6, opacity: 0, duration: 0.8, ease: "expo.out" },
          "<0.15",
        )
        .to(to, { color: "#4a91f2", duration: 0.3 }, "<")

        // 4. Brand: the route clears and the lockup rises letter by letter.
        .to("[data-stage]", { yPercent: -12, opacity: 0, duration: 0.6, ease: "power3.in" }, "+=0.15")
        .set("[data-lockup]", { opacity: 1 })
        .fromTo(
          "[data-mark]",
          { clipPath: "inset(100% 0% 0% 0%)", yPercent: 30 },
          { clipPath: CLOSED, yPercent: 0, duration: 0.9, ease: "expo.out" },
          "-=0.1",
        )
        .fromTo("[data-letter]", { yPercent: 115 }, { yPercent: 0, duration: 0.9, stagger: 0.045, ease: "expo.out" }, "<0.08")
        .fromTo("[data-tagline]", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7 }, "<0.35")

        // 5. Lift-off: navy then sky curtains wipe up while the hero plays its entrance.
        .addLabel("exit", "+=0.45")
        .to("[data-lockup]", { yPercent: -40, opacity: 0, duration: 0.8, ease: "power3.in" }, "exit")
        .to("[data-meta-bar]", { opacity: 0, duration: 0.4 }, "exit")
        .to("[data-curtain='navy']", { clipPath: LIFTED, duration: 1.15, ease: "expo.inOut" }, "exit+=0.1")
        .to("[data-curtain='sky']", { clipPath: LIFTED, duration: 1.15, ease: "expo.inOut" }, "exit+=0.22")
        .call(
          () => {
            for (const node of document.querySelectorAll(HERO_ENTRANCES)) {
              for (const animation of node.getAnimations()) {
                animation.currentTime = 0;
                animation.play();
              }
            }
          },
          undefined,
          "exit+=0.45",
        );
    }, el);

    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
      html.style.overflow = "";
    };
  }, [storageKey]);

  if (done) return null;

  return (
    <div ref={root} className="preloader fixed inset-0 z-110 select-none" aria-hidden="true">
      <div data-curtain="sky" className="absolute inset-0 bg-sky" />
      <div data-curtain="navy" className="absolute inset-0 overflow-hidden bg-navy text-white">
        {/* Atmosphere: a sky glow behind the route and a faint radar grid. */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_45%,rgb(74_145_242/0.22),transparent_70%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(70%_60%_at_50%_45%,black,transparent)]" />

        {/* Top bar, in the voice of the hero's route pill. */}
        <div
          data-meta-bar
          className="absolute inset-x-5 top-5 flex items-center justify-between font-mono text-caption-m tracking-wide text-light-white uppercase xl:inset-x-10 xl:top-8 xl:text-caption"
        >
          <span className="overflow-hidden">
            <span data-meta className="block">
              Amortrav · Boarding
            </span>
          </span>
          <span className="overflow-hidden">
            <span data-meta className="flex items-center gap-2">
              <span className="size-2 animate-pulse rounded-full bg-sky" />
              Flight-safe mode
            </span>
          </span>
        </div>

        {/* The flight: LOS → LHR along an arc; its progress is the page load. */}
        <div data-stage className="absolute inset-0 flex flex-col items-center justify-center px-5 xl:px-16">
          <div className="relative w-full max-w-275">
            <svg viewBox="0 0 1000 240" className="w-full overflow-visible" fill="none">
              <path
                data-route-base
                d={ROUTE}
                stroke="white"
                strokeOpacity="0.25"
                strokeWidth="1.5"
                strokeDasharray="2 10"
                strokeLinecap="round"
              />
              <path
                data-flight-path
                d={ROUTE}
                pathLength={1}
                stroke="#4a91f2"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="1 1"
                strokeDashoffset="1"
              />
              <circle cx="60" cy="200" r="6" fill="white" />
              <circle cx="940" cy="200" r="6" fill="#4a91f2" />
              <circle data-landing-ring cx="940" cy="200" r="14" stroke="#4a91f2" strokeWidth="2" opacity="0" />
              {/* /icons/plane.svg, centred on the origin that renderFlight moves along the route. */}
              <g data-plane transform="translate(60 200)">
                <g data-plane-glyph>
                  <path
                    transform="translate(-15 -15) scale(1.5)"
                    d="M14.8333 16L13.3333 9.16667L16.25 6.25C17.5 5 17.9167 3.33333 17.5 2.5C16.6667 2.08333 15 2.5 13.75 3.75L10.8333 6.66667L4 5.16667C3.58333 5.08333 3.25 5.25 3.08333 5.58333L2.83333 6C2.66667 6.41667 2.75 6.83333 3.08333 7.08333L7.5 10L5.83333 12.5H3.33333L2.5 13.3333L5 15L6.66667 17.5L7.5 16.6667V14.1667L10 12.5L12.9167 16.9167C13.1667 17.25 13.5833 17.3333 14 17.1667L14.4167 17C14.75 16.75 14.9167 16.4167 14.8333 16Z"
                    fill="white"
                    stroke="white"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                </g>
              </g>
            </svg>

            <div className="mt-4 flex justify-between font-mono xl:mt-6">
              <div>
                <span data-code="from" className="block text-[44px] leading-none font-medium tracking-tight sm:text-[72px] xl:text-[112px]">
                  LOS
                </span>
                <span className="mt-2 block text-caption-m text-light-white uppercase xl:text-caption">Lagos · Departed</span>
              </div>
              <div className="text-right">
                <span data-code="to" className="block text-[44px] leading-none font-medium tracking-tight sm:text-[72px] xl:text-[112px]">
                  LHR
                </span>
                <span className="mt-2 block text-caption-m text-light-white uppercase xl:text-caption">London · On board</span>
              </div>
            </div>
          </div>

          {/* Load counter and the three steps of "Box to boarding in three steps". */}
          <div className="absolute inset-x-5 bottom-5 flex items-end justify-between xl:inset-x-10 xl:bottom-8">
            <div data-counter-wrap className="font-mono leading-none">
              <span className="block text-caption-m text-light-white uppercase xl:text-caption">Flight progress</span>
              <span className="mt-2 flex items-baseline gap-1">
                <span data-counter className="text-[56px] font-medium tracking-tighter tabular-nums xl:text-[96px]">
                  000
                </span>
                <span className="text-h3-m text-sky xl:text-h3">%</span>
              </span>
            </div>
            <ol className="flex gap-4 font-mono text-caption-m uppercase xl:gap-8 xl:text-caption">
              {STEPS.map((step, i) => (
                <li key={step} data-step className="flex items-center gap-2 text-white/35 transition-colors duration-300 data-active:text-white">
                  <span className="text-sky">0{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Lockup: mark, wordmark and the hero line. Hidden until step 4. */}
        <div data-lockup className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-6 px-5 text-center opacity-0">
          <div data-mark>
            <Image src="/img/cta-mark.png" alt="" width={92} height={74} preload />
          </div>
          <p className="flex overflow-hidden text-[48px] leading-[1.05] font-bold tracking-[-0.02em] sm:text-[80px] xl:text-[128px]">
            {WORDMARK.map((letter, i) => (
              <span key={i} data-letter className="inline-block">
                {letter}
              </span>
            ))}
          </p>
          <p data-tagline className="text-body-m text-light-white xl:text-lead">
            Travel with a better sense of control
          </p>
        </div>
      </div>
    </div>
  );
}
