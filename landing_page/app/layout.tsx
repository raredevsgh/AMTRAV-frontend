import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import AppSignup from "./_components/AppSignup";
import Footer from "./_components/Footer";
import Header from "./_components/Header";
import Preloader from "./_components/Preloader";
import RevealObserver from "./_components/RevealObserver";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: "500",
});

export const viewport: Viewport = {
  themeColor: "#0B1B3D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://amortrav.com"),
  title: {
    default: "AMORTRAV · Smart Luggage, Paired to Your Phone",
    template: "%s · AMORTRAV",
  },
  description:
    "AMORTRAV connects your suitcase to your phone with a simple claim card in the box. No Bluetooth menus, one-touch flight-safe mode, and audit trails.",
  keywords: [
    "smart luggage",
    "smart bag",
    "AMORTRAV",
    "luggage tracking",
    "flight safe mode",
    "travel gear",
    "bag claim",
  ],
  authors: [{ name: "AMORTRAV" }],
  creator: "AMORTRAV",
  publisher: "AMORTRAV",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://amortrav.com",
    siteName: "AMORTRAV",
    title: "AMORTRAV · Smart Luggage, Paired to Your Phone",
    description:
      "A card in the box and the app do the work. Box to boarding in three simple steps.",
    images: [
      {
        url: "/img/tile-gate.jpg",
        width: 1200,
        height: 630,
        alt: "AMORTRAV smart luggage at an airport gate",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AMORTRAV · Smart Luggage, Paired to Your Phone",
    description:
      "A card in the box and the app do the work. Box to boarding in three simple steps.",
    images: ["/img/tile-gate.jpg"],
  },
  alternates: {
    canonical: "/",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://amortrav.com/#organization",
      name: "AMORTRAV",
      url: "https://amortrav.com",
      logo: "https://amortrav.com/img/logo.png",
      description: "Smart luggage paired to your phone.",
    },
    {
      "@type": "WebSite",
      "@id": "https://amortrav.com/#website",
      url: "https://amortrav.com",
      name: "AMORTRAV",
      publisher: {
        "@id": "https://amortrav.com/#organization",
      },
    },
  ],
};

// sessionStorage key for the first-visit preloader; the inline script below reads it.
const PRELOADER_KEY = "amortrav-preloaded";
const preloaderScript = `try{if(sessionStorage.getItem("${PRELOADER_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.setAttribute("data-preloaded","")}catch(e){document.documentElement.setAttribute("data-preloaded","")}`;

// Every page shares the header, the app signup and the footer (Figma "Page sections", 2020:497).
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-scroll-behavior lets Next.js turn smooth scrolling off during route changes.
    // suppressHydrationWarning: the preloader script sets data-preloaded before hydration.
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning className={`${jetbrainsMono.variable} antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preloaderScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="font-sans">
        <Preloader storageKey={PRELOADER_KEY} />
        <Header />
        <div className="relative mx-auto flex max-w-[1440px] flex-col gap-4 px-3 pt-[88px] pb-3 xl:gap-5 xl:px-5 xl:pt-[108px] xl:pb-5">
          <main id="main-content" className="flex flex-col gap-4 xl:gap-5">{children}</main>
          <AppSignup />
          <Footer />
        </div>
        <RevealObserver />
      </body>
    </html>
  );
}
