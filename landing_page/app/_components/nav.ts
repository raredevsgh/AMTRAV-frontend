export const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/for-brands", label: "For brands" },
] as const;

// "Get the app" has no store link yet; it scrolls to the email signup on every page.
export const GET_THE_APP_HREF = "#signup";

// Product preview only; purchasing is not available.
export const SHOP_LINK = { href: "/shop", label: "Shop" } as const;
