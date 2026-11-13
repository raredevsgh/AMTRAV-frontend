// How OpenNext runs the site on Cloudflare. Pages are prerendered at build time and nothing is
// revalidated at runtime, so the prerendered pages are served straight from the static assets:
// no R2 bucket or KV namespace to set up.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
