// Sends marketing pages without a language in the URL to the visitor's language: the one
// they picked before (cookie), else their browser's, else English. /shop → /fr/shop. Links
// from emails and the payment page (/shop/orders/…) keep working, query string included.
import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, isLocale, negotiate } from "@/lib/i18n/config";

export function proxy(request: NextRequest) {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(saved)
    ? saved
    : negotiate(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Only the marketing pages; the console, sign-in, API and files are left alone.
  matcher: [
    "/",
    "/shop/:path*",
    "/features",
    "/how-it-works",
    "/for-brands",
    "/about",
    "/privacy",
    "/terms",
    "/cookies",
    "/shipping-returns",
    "/warranty",
    "/contact",
    "/photo-credits",
    "/app",
  ],
};
