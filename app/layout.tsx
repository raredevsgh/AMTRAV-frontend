import type { Metadata } from "next";
import { Montserrat, JetBrains_Mono } from "next/font/google";
import "./globals.css";
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
export const metadata: Metadata = {
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
      className={`${montserrat.variable} ${mono.variable}`}
      // Browser extensions add attributes here before React loads; this element only.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
