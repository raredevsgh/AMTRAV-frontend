// How OpenNext runs the site on Cloudflare. Pages are prerendered at build time and nothing is
// revalidated at runtime, so the prerendered pages are served straight from the static assets:
// no R2 bucket or KV namespace to set up.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

export default {
  ...defineCloudflareConfig({
    incrementalCache: staticAssetsIncrementalCache,
    // Prerendered pages are answered from that cache before Next's server is loaded, which
    // cuts the time to first byte. Safe while the site doesn't use partial prerendering.
    enableCacheInterception: true,
  }),
  // `pnpm run build` is this OpenNext build (Workers Builds runs it, then `wrangler deploy`
  // hands over to `opennextjs-cloudflare deploy`), so it runs Next's build directly.
  buildCommand: "pnpm exec next build",
};
