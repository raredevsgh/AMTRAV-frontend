"use client";
import { StandaloneError } from "@/components/marketing/status-pages";

/** An error outside the language pages (the console and sign-in), or in the site's frame. */
export default function RootError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return <StandaloneError error={error} retry={retry} />;
}
