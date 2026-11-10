"use client";
import { ErrorView } from "@/components/marketing/status-pages";

/** An error in a page: the header and footer stay, with a way to try again. */
export default function PageError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return <ErrorView error={error} retry={retry} />;
}
