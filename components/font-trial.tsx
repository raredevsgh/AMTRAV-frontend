"use client";

// While choosing the site's typeface: a switcher pinned to the corner, in development only.
// The choice is kept in this browser and applied before the first paint (app/layout.tsx), by
// pointing --font-montserrat (and the mono face, for Geist) at the font picked; see
// app/font-trial.css. Remove this, the extra fonts and the CSS once one is chosen.
import { useEffect, useState } from "react";

export const FONT_TRIAL_KEY = "amortrav_font_trial";
const faces = [
  { value: "montserrat", label: "Montserrat" },
  { value: "geist", label: "Geist" },
  { value: "inter", label: "Inter" },
  { value: "manrope", label: "Manrope" },
] as const;

/** Applies the saved choice before the page paints, so the page never flashes another font. */
export const fontTrialScript = `(function(){try{var f=localStorage.getItem("${FONT_TRIAL_KEY}");if(f&&f!=="montserrat")document.documentElement.dataset.font=f}catch(e){}})()`;

/** `montserrat` is its family name, for its own button while another face is applied. */
export function FontTrial({ montserrat }: { montserrat: string }) {
  const [face, setFace] = useState<string>("montserrat");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing with browser storage once on mount
    setFace(document.documentElement.dataset.font ?? "montserrat");
  }, []);
  function choose(value: string) {
    setFace(value);
    localStorage.setItem(FONT_TRIAL_KEY, value);
    const root = document.documentElement;
    if (value === "montserrat") root.removeAttribute("data-font");
    else root.setAttribute("data-font", value);
  }
  return (
    <div className="font-trial" role="group" aria-label="Typeface (trial)">
      <span>Font</span>
      {faces.map((item) => (
        <button
          key={item.value}
          type="button"
          aria-pressed={face === item.value}
          onClick={() => choose(item.value)}
          style={{
            fontFamily:
              item.value === "montserrat" ? montserrat : `var(--font-${item.value})`,
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
