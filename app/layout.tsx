import type { Metadata } from "next";
import {
  Montserrat,
  JetBrains_Mono,
  Geist,
  Geist_Mono,
  Inter,
  Manrope,
} from "next/font/google";
import "./globals.css";
import "./font-trial.css";
import { FontTrial, fontTrialScript } from "@/components/font-trial";
import { siteUrl } from "@/lib/i18n/seo";
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});
const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: "500",
  display: "swap",
});
// Typefaces under trial (components/font-trial.tsx): downloaded only when picked.
const trial = process.env.NODE_ENV === "development";
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
const trialFonts = trial
  ? ` ${geist.variable} ${geistMono.variable} ${inter.variable} ${manrope.variable}`
  : "";

export const metadata: Metadata = {
  // Resolves relative addresses in canonical, hreflang and preview tags.
  metadataBase: new URL(siteUrl),
  title: {
    default: "Amortrav — luggage that keeps up with you",
    template: "%s · Amortrav",
  },
  description:
    "Smart luggage, paired to your phone. Discover Amortrav, claim your bag, and keep your travel documents together.",
  icons: { icon: "/images/brand-mark.png" },
};
/**
 * Applies the saved theme (or the system's) before the first paint, so dark pages never flash
 * white, and follows the system when the choice is "system". The switcher writes the choice.
 */
const themeScript = `(function(){try{var k="amortrav_theme",h=document.documentElement,m=matchMedia("(prefers-color-scheme: dark)");function a(){var c=localStorage.getItem(k)||"system";var d=c==="dark"||(c==="system"&&m.matches);h.dataset.theme=d?"dark":"light";h.style.colorScheme=d?"dark":"light"}a();m.addEventListener("change",a);window.addEventListener("amortrav-theme",a)}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      data-scroll-behavior="smooth"
      lang="en"
      className={`${montserrat.variable} ${mono.variable}${trialFonts}`}
      // Browser extensions add attributes here before React loads; this element only.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {trial ? <script dangerouslySetInnerHTML={{ __html: fontTrialScript }} /> : null}
      </head>
      <body>
        {children}
        {trial ? <FontTrial montserrat={montserrat.style.fontFamily} /> : null}
      </body>
    </html>
  );
}
