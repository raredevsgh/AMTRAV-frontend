# Frontend UI standards

Apply these checks to changes in `landing_page` and `admin_panel`.

- Inspect the current worktree, uncommitted changes, existing components, tokens and tests first. Preserve other branches and pending PRs.
- Read the installed Next.js documentation before using unfamiliar routing, font, image or Server/Client Component APIs. Keep interactive client boundaries small.
- Inspect the current Figma frame and its desktop/mobile variants before changing geometry or artwork. Record the frame IDs and access limitations. Never describe an unverified result as pixel-perfect.
- Reuse exported artwork and shared components. Do not invent brand icons, product capabilities, testimonials presented as real customers, or navigation destinations.
- Preserve Inter in `landing_page`, Manrope in `admin_panel` (owner correction on 27 October), and deliberate monospaced content. Use established Tailwind tokens; keep repeated values centralized.
- Render one `main` landmark per route. Previews nested inside it use sections or divs. Await dynamic route params and preserve appropriate Suspense boundaries.
- Type mock records with transport DTOs, keep UI roles distinct from API roles, and identify mock data clearly. Backend contracts need source or live-schema evidence.
- Prefer CSS, Web Animations API and IntersectionObserver before adding animation dependencies. Support reduced motion and clean up timers, listeners and animations.
- Modal navigation must move and contain focus, dismiss on Escape, restore trigger focus, isolate the background, and restore previous scroll styles. Verify route changes and resizing while open.
- Keep viewport-fixed overlays outside filtered/transformed ancestors. A glass pseudo-element or a body portal avoids changing the overlay's containing block. Provide a readable no-blur fallback.
- Carousels need manual controls, meaningful slide labels, and pause/resume. Stop automatic rotation on focus, pause on hover, and disable automatic motion for reduced-motion preferences.
- Verify production output in a real browser at phone, tablet and desktop widths. Check keyboard interactions, active routes, overflow, font/image loading, console errors and one-main semantics.
- Capture and inspect actual before/after screenshots. Record measured performance with its test conditions; do not infer field performance or frame rate from appearance.
- Run the repository's lint/build checks, TypeScript and applicable tests. Review the full diff, including untracked files, for unrelated changes, generated artifacts and unnecessary dependencies.
- Complete the PR template with actual test results, screenshots, affected app, dependencies and remaining limitations. Do not mark unexecuted checks as passed.
- For frontend-only assignments, both Rust backend checkouts stay read-only: no edits, builds, formatting, migrations or services.

For product films, inspect the source codec, dimensions, timing, audio and file weight before placing an optimized copy in `landing_page/public/media/`. Preserve raw references outside runtime assets. Reserve aspect ratio, provide a lightweight poster and a keyboard-accessible pause control, use muted inline playback, stop offscreen/hidden playback, and honor reduced motion/Save-Data before fetching. Verify actual decoding in Chromium and WebKit; metadata alone does not prove compatibility. Use `node scripts/landing-browser-qa.mjs` against a production server to check all marketing routes plus `/shop`, header controls, modal navigation and video states. Keep reference contact sheets, recordings and raw performance logs outside Git; include only curated review screenshots.

The Shop cart is an owner-authorized recreation of the supplied header screenshot, not a Figma-exported asset. `/shop` is an approved product preview with purchasing unavailable. Do not add pricing, inventory or checkout until those product decisions are supplied. Its full current Figma frame still needs comparison when access is restored.
