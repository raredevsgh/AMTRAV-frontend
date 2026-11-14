// Response headers for every page and route. Partial prerendering rules out per-request
// CSP nonces, so scripts allow 'unsafe-inline'; the policy still blocks foreign scripts,
// framing, plugins and data exfiltration to hosts outside connect-src.
export function securityHeaders({
  production,
  locationSocketUrl,
}: {
  production: boolean;
  locationSocketUrl?: string;
}) {
  let socketOrigin = "";
  try {
    const url = new URL(locationSocketUrl || "");
    if (url.protocol === "ws:" || url.protocol === "wss:") {
      socketOrigin = `${url.protocol}//${url.host}`;
    }
  } catch {
    // Unset or invalid: the map shows its setup state and no socket origin is allowed.
  }
  const mapbox =
    "https://api.mapbox.com https://events.mapbox.com https://*.tiles.mapbox.com";
  // Cloudflare Web Analytics: the edge adds its beacon script to each page, and the beacon
  // reports page-load timings back to Cloudflare.
  const analytics = {
    script: "https://static.cloudflareinsights.com",
    connect: "https://cloudflareinsights.com",
  };
  const directives = [
    "default-src 'self'",
    // 'wasm-unsafe-eval' lets the local SQLite database compile its WebAssembly; it
    // does not permit JavaScript eval.
    `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' ${analytics.script}${production ? "" : " 'unsafe-eval'"}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${mapbox}`,
    "font-src 'self' data:",
    `connect-src 'self' ${mapbox} ${analytics.connect}${socketOrigin ? ` ${socketOrigin}` : ""}${production ? "" : " ws:"}`,
    "worker-src 'self' blob:",
    "child-src blob:",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(production ? ["upgrade-insecure-requests"] : []),
  ];
  return [
    { key: "Content-Security-Policy", value: directives.join("; ") },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    {
      key: "Permissions-Policy",
      value:
        "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
    },
    ...(production
      ? [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ]
      : []),
  ];
}
