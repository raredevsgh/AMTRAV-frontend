"use client";
import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, RotateCw } from "lucide-react";
import { brand } from "@/lib/brand";
import { format, type Messages } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/client";
import { defaultLocale, localize } from "@/lib/i18n/config";
import { en } from "@/lib/i18n/messages/en";
import "@/app/trace.css";

/** The reference support can match to the server's logs, when the error carries one. */
function digestOf(error: unknown) {
  return error instanceof Error && "digest" in error && typeof error.digest === "string"
    ? error.digest
    : null;
}

/**
 * A not-found or error page: what happened, the way back, and the site's main pages as
 * cards. Takes its words and links as props, so it also works outside the language context.
 */
function StatusContent({
  m,
  path,
  kind,
  retry,
  digest,
}: {
  m: Messages;
  /** Turns a site path into this language's URL. */
  path: (to: string) => string;
  kind: "not-found" | "error";
  retry?: () => void;
  digest?: string | null;
}) {
  const missing = kind === "not-found";
  const title = missing ? m.errors.notFoundTitle : m.errors.errorTitle;
  const elsewhere = [
    { to: "/features", label: m.nav.features },
    { to: "/how-it-works", label: m.nav.how },
    { to: "/shop", label: m.nav.shop },
  ];
  return (
    <section className="trace-panel status-page" aria-labelledby="status-title">
      <title>{`${title} · ${brand.company}`}</title>
      <span className="trace-eyebrow">
        {missing ? m.errors.notFoundCode : m.errors.errorCode}
      </span>
      <h1 id="status-title">{title}</h1>
      <p>{missing ? m.errors.notFoundBody : m.errors.errorBody}</p>
      <div className="trace-buttons">
        {retry ? (
          <button type="button" className="trace-button ink" onClick={() => retry()}>
            <RotateCw size={14} /> {m.errors.retry}
          </button>
        ) : (
          <Link className="trace-button ink" href={path("/")}>
            {m.errors.home}
          </Link>
        )}
        {retry ? (
          <Link className="trace-button ghost-ink" href={path("/")}>
            {m.errors.home}
          </Link>
        ) : (
          <Link className="trace-button ghost-ink" href={path("/contact")}>
            {m.errors.contact}
          </Link>
        )}
      </div>
      {digest ? (
        <p className="status-reference">{format(m.errors.reference, { digest })}</p>
      ) : null}
      <nav className="status-links" aria-label={m.errors.goTo}>
        <span>{m.errors.goTo}</span>
        <ul>
          {elsewhere.map((link) => (
            <li key={link.to}>
              <Link href={path(link.to)}>
                {link.label} <ArrowRight size={14} />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}

/** A page that isn't there, in the visitor's language. */
export function NotFoundView() {
  const { m, href } = useI18n();
  return (
    <div className="trace page">
      <StatusContent m={m} path={href} kind="not-found" />
    </div>
  );
}

/** An error inside a page, in the visitor's language; the header and footer stay. */
export function ErrorView({ error, retry }: { error: unknown; retry: () => void }) {
  const { m, href } = useI18n();
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="trace page">
      <StatusContent
        m={m}
        path={href}
        kind="error"
        retry={retry}
        digest={digestOf(error)}
      />
    </div>
  );
}

/**
 * An error outside the language pages (the console, sign-in, or the site's frame itself),
 * in English, with the design system's styles but none of the site's chrome.
 */
export function StandaloneError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const path = (to: string) => localize(defaultLocale, to);
  return (
    <div className="site-shell">
      <main className="trace page">
        <StatusContent
          m={en}
          path={path}
          kind="error"
          retry={retry}
          digest={digestOf(error)}
        />
      </main>
    </div>
  );
}
