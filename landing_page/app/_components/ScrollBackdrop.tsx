"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

// Eases the page background between brand colours as each [data-backdrop] section scrolls in.
// The value names a --color-* token from globals.css. The tweens are scrubbed to the scroll
// position, so the colour follows the reader both ways; reduced motion keeps the surface.
export default function ScrollBackdrop() {
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tokens = getComputedStyle(document.documentElement);
      let previous = getComputedStyle(document.body).backgroundColor;
      for (const section of document.querySelectorAll<HTMLElement>("[data-backdrop]")) {
        const next = tokens.getPropertyValue(`--color-${section.dataset.backdrop}`).trim();
        gsap.fromTo(
          document.body,
          { backgroundColor: previous },
          {
            backgroundColor: next,
            ease: "none",
            immediateRender: false,
            // A short window as the section's top crosses the middle of the screen; the slight
            // scrub lag smooths out wheel steps.
            scrollTrigger: { trigger: section, start: "top 70%", end: "top 30%", scrub: 0.8 },
          },
        );
        previous = next;
      }
    });
    // Removes the inline background, so other pages keep the default surface.
    return () => mm.revert();
  }, []);

  return null;
}
