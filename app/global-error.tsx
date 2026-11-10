"use client";
import "./globals.css";
import { StandaloneError } from "@/components/marketing/status-pages";

/** An error in the root layout itself: this replaces the whole document. */
export default function GlobalError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <StandaloneError error={error} retry={retry} />
      </body>
    </html>
  );
}
