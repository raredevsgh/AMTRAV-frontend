// Everything the TRACE landing page says about who makes it and what it's called, in one
// place. Rename the company or product, swap logos, recolour, or rename the range here
// (or with the NEXT_PUBLIC_BRAND_* variables at build time) without touching the page.

export interface RangeItem {
  key: "essential" | "flagship" | "pro" | "executive";
  name: string;
  shell: string;
  size: string;
  summary: string;
  image: string;
}

// Each variable is read by name, so Next.js can inline it into the browser bundle.
const pick = (value: string | undefined, fallback: string) => value?.trim() || fallback;

export const brand = {
  company: pick(process.env.NEXT_PUBLIC_BRAND_COMPANY, "Amortrav"),
  /** The full product name, used in headings and the page title. */
  product: pick(process.env.NEXT_PUBLIC_BRAND_PRODUCT, "AMTRAV TRACE"),
  /** The short name used in running text ("TRACE logs…"). */
  shortProduct: pick(process.env.NEXT_PUBLIC_BRAND_SHORT_PRODUCT, "TRACE"),
  /** The removable module inside every bag. */
  core: pick(process.env.NEXT_PUBLIC_BRAND_CORE, "Smart Core"),
  app: pick(process.env.NEXT_PUBLIC_BRAND_APP, "the Amortrav app"),
  tagline: "Every journey. Every impact. Every kilogram. In one view.",
  /** The footer's line under the logo. */
  footerLine: pick(process.env.NEXT_PUBLIC_BRAND_FOOTER_LINE, "Smart luggage, paired to your phone."),
  email: pick(process.env.NEXT_PUBLIC_BRAND_EMAIL, "hello@amortrav.com"),
  /** The copyright year in the footer; set here, not from the clock, so pages can be built ahead. */
  year: pick(process.env.NEXT_PUBLIC_BRAND_YEAR, "2026"),
  /** Social profiles for the footer; each icon shows only once its address is set. */
  social: {
    facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK?.trim() || null,
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM?.trim() || null,
    x: process.env.NEXT_PUBLIC_SOCIAL_X?.trim() || null,
  },
  logos: {
    wordmark: pick(process.env.NEXT_PUBLIC_BRAND_WORDMARK, "/images/wordmark.png"),
    mark: pick(process.env.NEXT_PUBLIC_BRAND_MARK, "/images/brand-mark.png"),
  },
  colors: {
    /** Headlines, primary buttons, dark panels. */
    ink: pick(process.env.NEXT_PUBLIC_BRAND_INK, "#001f4d"),
    /** Night panels behind the product film and the Smart Core. */
    night: pick(process.env.NEXT_PUBLIC_BRAND_NIGHT, "#071226"),
    /** The signal colour: live, ready, "look here". */
    signal: pick(process.env.NEXT_PUBLIC_BRAND_SIGNAL, "#d5f45b"),
    accent: pick(process.env.NEXT_PUBLIC_BRAND_ACCENT, "#0047ad"),
  },
  film: {
    mp4: "/video/trace-film.mp4",
    webm: "/video/trace-film.webm",
    poster: "/images/trace/film-poster.jpg",
  },
  range: [
    {
      key: "essential",
      name: pick(process.env.NEXT_PUBLIC_BRAND_RANGE_ESSENTIAL, "Essential"),
      shell: "Graphite polycarbonate carry-on",
      size: "55 × 40 × 23 cm",
      summary: "Everything TRACE does, in a cabin-size shell that fits most overhead bins.",
      image: "/images/trace/range-essential.png",
    },
    {
      key: "flagship",
      name: pick(process.env.NEXT_PUBLIC_BRAND_RANGE_FLAGSHIP, "Flagship"),
      shell: "Navy polycarbonate check-in",
      size: "70 × 47 × 28 cm",
      summary: "The bag you check in, and the one that most needs watching on the way.",
      image: "/images/trace/range-flagship.png",
    },
    {
      key: "pro",
      name: pick(process.env.NEXT_PUBLIC_BRAND_RANGE_PRO, "Pro"),
      shell: "Brushed-silver carry-on",
      size: "55 × 40 × 23 cm",
      summary: "A metallic finish for frequent flyers who live out of a carry-on.",
      image: "/images/trace/range-pro.png",
    },
    {
      key: "executive",
      name: pick(process.env.NEXT_PUBLIC_BRAND_RANGE_EXECUTIVE, "Executive"),
      shell: "Black check-in, gloss finish",
      size: "70 × 47 × 28 cm",
      summary: "Understated and large enough for a long trip, with the same Smart Core inside.",
      image: "/images/trace/range-executive.png",
    },
  ] satisfies RangeItem[],
};
