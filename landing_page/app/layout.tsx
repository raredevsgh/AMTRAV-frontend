import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import AppSignup from "./_components/AppSignup";
import Footer from "./_components/Footer";
import Header from "./_components/Header";
import RevealObserver from "./_components/RevealObserver";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: "500",
});

export const metadata: Metadata = {
  title: "AMORTRAV",
  description: "Smart luggage, paired to your phone.",
};

// Every page shares the header, the app signup and the footer (Figma "Page sections", 2020:497).
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-scroll-behavior lets Next.js turn smooth scrolling off during route changes.
    <html lang="en" data-scroll-behavior="smooth" className={`${jetbrainsMono.variable} antialiased`}>
      <body className="font-sans">
        <Header />
        <div className="relative mx-auto flex max-w-[1440px] flex-col gap-4 px-3 pt-[76px] pb-3 xl:gap-5 xl:px-5 xl:pt-[84px] xl:pb-5">
          <main className="flex flex-col gap-4 xl:gap-5">{children}</main>
          <AppSignup />
          <Footer />
        </div>
        <RevealObserver />
      </body>
    </html>
  );
}
