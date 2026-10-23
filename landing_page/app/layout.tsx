import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import AppSignup from "./_components/AppSignup";
import Footer from "./_components/Footer";
import Header from "./_components/Header";
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
    <html lang="en" className={`${jetbrainsMono.variable} antialiased`}>
      <body className="font-sans">
        <div className="relative mx-auto flex max-w-[1440px] flex-col gap-4 px-3 pt-[88px] pb-3 xl:gap-5 xl:px-5 xl:pt-[108px] xl:pb-5">
          <Header />
          <main className="flex flex-col gap-4 xl:gap-5">{children}</main>
          <AppSignup />
          <Footer />
        </div>
      </body>
    </html>
  );
}
