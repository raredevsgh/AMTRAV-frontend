# Landing fidelity review

The first sections record PR #51. The Shop follow-up at the end records the current branch and supersedes the initial cart and WebKit limitations.

## Scope and evidence

Date: 26 October 2026. Base: `origin/main` at `e9f2153`.
PR #50 remains open; this branch preserves the same landing Inter configuration without changing Admin files or the PR's branch.

The supplied desktop screenshots show a rounded inset glass header, a Join the list CTA, and three exploration cards with different labels/content/actions. They also show the existing B. Young testimonial layout. The user separately authorized three original illustrative traveller stories and a four-second carousel interval.

Live Figma inspection is unavailable: the connector reports its View-seat call limit, and the authorized Chrome view returns CloudFront HTTP 403. Current layer geometry, components, interactions and assets could not be revalidated. The supplied screenshots and existing approved exports support the changes below; full current-file parity is not claimed.

## Initial discrepancy matrix

| Area | Evidence | Severity | Correction |
| --- | --- | --- | --- |
| Header | Screenshot has inset rounded glass and CTA; source uses an opaque full-width bar without CTA | High | Reuse glass pseudo-element, restore inset layout and signup action |
| Mobile navigation | PR #49 describes a right drawer; current source uses a top sheet without focus containment or inert background | High | Preserve portal; implement accessible right drawer using the reviewed direction, pending current Figma confirmation |
| Exploration | Screenshot has Journey Log/Weight/Theft Mode and Location/Security/Ownership tags; actions are Explore/Find more/Talk to us | High | Update each card from supplied reference; use minimum heights for text wrapping |
| Testimonials | One record and no automatic timer; user requests three additional authored entries and four seconds | High | Add clearly illustrative stories; automatic loop plus accessible manual/pause controls |
| Brand preview | Embedded dashboard renders a second `main`; autoplay ignores reduced motion | High | Use a div, preserve preview interactions and clean up/pause timers |
| Reduced motion | Existing SVG animateMotion and float classes run regardless of preference | Medium | Suppress decorative motion under reduced motion |
| Features cards | Browser screenshot at 1280px shows clipped copy and overflowing power-mode chips | High | Use content-driven minimum heights, contain artwork, and add radio keyboard behavior |
| Text contrast | Axe reports 4.0:1 for gray pairing copy on the pale-blue panel | High | Use the existing ink token; also strengthen sample weight-badge subtitle contrast |
| Other marketing screens | Current source differs from historic Figma-derived versions; live design unavailable | Unverified | Browser-test existing routes; avoid speculative redesign |
| Shop cart | Visible in screenshot; exact exported icon and intended destination are absent | Blocked | Obtain approved icon export and destination; do not invent a store or dead link |

## GitHub feedback matrix

| PR / feedback | Source / concern | State and action |
| --- | --- | --- |
| [#28](https://github.com/raredevsgh/AMTRAV-frontend/pull/28#discussion_r4365832374): dynamic params, Suspense, sanitized identifiers | Admin device detail | Already implemented; preserved without editing Admin |
| #28: single main landmark | Admin shell and nested preview landmarks | Admin fix resides in pending #50; remove duplicate landmark in marketing dashboard preview |
| #28: type mock device records with transport DTOs | Admin fixtures | Implemented in #50; no contract edits in this task |
| [#48](https://github.com/raredevsgh/AMTRAV-frontend/pull/48#pullrequestreview-5636653037): native WAAPI, safe glass layering, inert/ARIA/reduced motion | RevealObserver, header, menu, carousel | Preserve native architecture; repair navigation focus/isolation and remaining motion gaps |
| #48: complete PR checklist | PR handoff | Use repository template with actual results and limitations |
| [#49](https://github.com/raredevsgh/AMTRAV-frontend/pull/49): fixed header and right drawer | Header/MobileMenu | Keep viewport anchoring; recover reference glass and reviewed drawer direction |
| [#50](https://github.com/raredevsgh/AMTRAV-frontend/pull/50): Inter/F0 foundation | Landing font and Admin/API modules | Open, no review comments at inspection; protect worktree and reuse identical landing Inter setup |

PR #29 has no discussion comments at inspection. Issues #31/#32 (footer/social URLs), #33 (app stores), #35 (waitlist endpoint), and #37 (firmware version) remain owner-dependent. Do not imply successful waitlist submission or fabricate destinations. The existing localhost console link is a product configuration gap, not a production dashboard URL.

## Figma inventory requiring live revalidation

- Landing `120:126` / `2005:396`
- Features `124:298` / `124:539`
- How it works `124:776` / `124:976`
- For brands `124:1179` / `124:1375`
- Components `119:126`, shared sections `2020:497`, mobile menu `2020:1076`

These are reference IDs from the brief, not a claim that current nodes were inspected successfully. The Admin Dashboard stays outside this marketing fidelity task.

## Implemented design and interaction details

- The header stays viewport-fixed inside the existing 1440px column. Browser measurements at 1440px are 20px outer insets and a 68px header; at 390px, 12px insets and a 60px header. The existing 150px/116px logo artwork is retained.
- The existing glass pseudo-element supplies a 60% white surface and 50px blur with saturation. Browsers without backdrop filtering receive 94% white. The modal is portaled to `body` and promoted with `showModal()`, keeping it outside filter containing blocks.
- The right drawer follows PR #49's reviewed direction. Its current Figma geometry remains unverified. Native background isolation is supplemented with explicit forward/backward Tab wrapping, trigger focus restoration, prior overflow restoration, and route-key reset for browser history.
- The desktop hero uses Inter at 66px to keep the supplied reference's two-line heading; mobile retains its existing 42px scale. The sample weight and six-event labels come directly from the supplied screenshot, and remain static marketing illustrations.
- Exploration cards use distinct reference text, tags and actions, with minimum heights to prevent text clipping. The three newly authored stories use monograms and the visible label “Illustrative traveller story”; the original B. Young quote/photo remain intact.
- Testimonials loop every 4000ms while visible, pause on hover, stop on keyboard focus, and resume only through the control. Reduced motion disables automatic rotation and decorative movement. Stable card heights prevent slide changes from moving following sections.
- The existing palette remains centralized: brand `#0047ad`, navy `#001f4d`, sky `#4a91f2`, surface `#f4f4f5`, pale blue `#d5e3f9`, and ink `#1b2840`. No new package or animation library was added.

## Executed verification

All application checks used Node 24.22.0 and pnpm 11.20.0:

| Check | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Passed; dependency graph and lockfile unchanged |
| `pnpm lint:landing`, `pnpm lint:admin` | Passed |
| `pnpm --filter landing_page exec tsc --noEmit` | Passed |
| `pnpm --filter admin_panel exec tsc --noEmit` | Passed |
| `pnpm build:landing`, `pnpm build:admin` | Passed |
| `pnpm sprint:test` | 15/15 passed; dry-run adapter, no issue writes |
| `pnpm sprint validate` | Six sprint definitions validated |
| `git diff --check` | Passed |
| `git merge-tree --write-tree HEAD origin/feat/frontend-f0-consolidated` | Clean merge tree with pending PR #50; neither branch/worktree was merged or modified |
| Final production Chrome regression matrix | 321 checks passed; four routes at 375/390/430/768/1024/1280/1440/1920px |
| Focused final interaction regression | 33 checks passed, including pointer pause and history after the fixes |
| Axe-core 4.10.3 WCAG A/AA audit | Zero violations across eight route/viewport combinations and the open mobile menu |

The complete matrix checked initial/scrolled/footer screenshots, Inter loading, one main and h1, fixed header positioning, active routes, page overflow, visible image loading, failed requests and console/page errors. The focused run checked native modal isolation, initial focus, Tab/Shift+Tab, Escape, focus and scroll-style restoration, navigation, browser back/forward, backdrop dismissal and resizing. Carousel checks used the real four-second timer, pointer/keyboard controls, hover/focus stopping, explicit resume, loop wrapping, stable desktop height, swipe and reduced motion. Features checks cover radio keyboard selection and card/chip containment.

Axe's remaining `incomplete` entries require manual assessment of image/translucent backgrounds and conditional ARIA references. Zero automated violations is not a claim of full WCAG certification. The actual keyboard and screenshot checks complement that audit.

Safari WebDriver was attempted but could not create a session because “Allow remote automation” is disabled in Safari settings. No settings were changed. Safari/WebKit rendering is not verified.

### Reproduce the browser checks

Build and start the production app on port 3130 (`pnpm --filter landing_page start --port 3130`). Start a local Chrome instance with a disposable profile and `--remote-debugging-port=9223`, then run:

```sh
node scripts/landing-browser-qa.mjs
node scripts/landing-browser-qa.mjs --interactions-only
```

Requires Node 24's built-in WebSocket. `AMTRAV_QA_URL`, `AMTRAV_CDP_URL` and `AMTRAV_QA_OUTPUT` override the local server, CDP endpoint and temporary output folder. The script creates its own browser target and closes it afterwards. It does not navigate or close existing user tabs. Screenshots/results default to temporary storage.

## Visual and performance evidence

Curated, unedited production browser PNGs are included for review:

| View | Before | After |
| --- | --- | --- |
| Desktop 1440px | [Before](screenshots/before-desktop.png) | [After](screenshots/after-desktop.png) |
| Mobile 390px | [Before](screenshots/before-mobile.png) | [After](screenshots/after-mobile.png) |

[Mobile drawer](screenshots/mobile-menu.png), [testimonials](screenshots/testimonials.png), [exploration cards](screenshots/exploration.png), [Features at 1280px](screenshots/features-cards.png).

These are browser screenshots, not Figma renders. Comparison to the supplied desktop images supports the changed composition, labels and styling; a current full-file Figma pixel comparison could not be performed.

Single local production samples (unthrottled; mixed cold/warm cache, so not a controlled speed comparison):

| View | Before LCP / CLS | After LCP / CLS | Decoded JS resource bytes before / after |
| --- | --- | --- | --- |
| Home 390px | 1072ms / 0 | 44ms / 0 | 500,309 / 502,940 |
| Home 1440px | 140ms / 0 | 56ms / 0 | 522,334 / 525,865 |

No performance improvement, field INP, mobile hardware score, or 60fps guarantee is claimed from these samples. The hero heading no longer fades from zero opacity; the native motion architecture is retained, and the small JS increase supports modal/carousel accessibility. No new application dependency was added.

## Remaining requirements

- Restore authorized Figma access to inspect every current desktop/mobile frame, component, interaction and exact asset. The screenshot-supported scope is implemented; full design parity remains unverified.
- Supply the exact shop/cart SVG export and its intended action/destination. The unavailable asset was not substituted and no fake checkout or dead cart link was added.
- Safari/WebKit visual verification requires an authorized automation session or manual browser access.
- Existing footer/social/app-store URLs, waitlist endpoint, firmware version and production console URL remain product configuration dependencies. The illustrative stories can be replaced with real approved quotes and photos later.

## Technical references

[WAI modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [WAI carousel pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/), [MDN backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter), and [Web Vitals](https://web.dev/articles/vitals). The installed Next.js guides for fonts, images, Server/Client Components and accessibility were read before implementation.


## Shop and product-film follow-up — 26 October 2026

Branch `fix/landing-designer-fidelity` is stacked on PR #51 (`56c5019`), which remains open, so this PR targets `feat/landing-figma-fidelity`. PR #50 remains open and untouched. Review/merge #51 first, then retarget this PR to `main`; no branch was merged by this task. Admin/F0 implementation stays in its original PR.

The owner approved `/shop` with a video hero and purchasing unavailable, and explicitly approved recreating the missing cart from the supplied screenshot. This supersedes the earlier cart blocker above. The recreated icon is local at `public/icons/shop-cart.svg`; it is **not** described as an exact Figma export. Header/mobile navigation and sitemap now connect all five screens. The supplied screenshot’s silver gradient sheen is restored in the existing glass pseudo-element with an opaque gradient fallback; these screenshot-derived values are not claimed as current Figma measurements. At narrow widths the cart/menu remain visible; Join the list remains in the drawer and appears in the header when there is room.

### Reference matrix and traceability

| Reference / element | Inspection and selected implementation | File / test |
| --- | --- | --- |
| Shop Figma `2181:1307` | Design context, screenshot and read-only Plugin API all return seat call-limit errors; browser returns CloudFront 403. Full geometry/mobile frame/prototype connections unverified. Supplied crop establishes shared header + rounded media surface only. | `/shop` is deliberately limited to the owner-approved preview; no invented storefront |
| [Claude artifact](https://claude.ai/artifact/RNpk6Npjxjp7q9FdpaGre1#c610026b-7daa) | Web tool cannot access it; local Chrome renders a blank artifact page. No export/source found in the local reference search. Contents/interactions remain unknown. | No prototype-specific interaction fabricated |
| Source MP4 / GIF | Both inspected; MP4 native frame extraction plus GIF decoding covers the product-film sequence. These contain no website header, navigation or page transition. Use as page media, not a UI recording. | `shop/ProductVideo.tsx`; timestamped contact sheets outside Git |
| Header cart | Screenshot-authorized recreation on pale-blue circle, 44px target, visible on desktop/mobile. Active cart uses aria-current. | Header/SiteNav/nav/MobileMenu; nine-width overlap checks |
| Shared screens | Existing marketing navigation preserved; header cart and drawer Shop item reach preview; Shop links back to all three marketing detail pages and logo returns Home. | Browser route/navigation and history checks |
| Silent product film | H.264 MP4 + WebP poster; 16:9 reserved space, muted/loop/playsInline, no film request under reduced motion or Save-Data until explicit Play; pause offscreen/hidden; visible pause/play control; readable failure state. | ProductVideo; media/browser checks |
| Narrow-screen callouts | Real 320px screenshot exposed clipped weight check/route text; move only mobile callouts inward. | Landing HeroVisual; 320/375/390 screenshots |
| Existing accessibility/motion | Native dialog isolation/focus/scroll restoration and 4000ms carousel preserved. PR #48 native motion and glass-layering feedback rechecked; #49/#50/#51 have no submitted reviews at follow-up. | Existing interaction suite; React/codebase-discipline review |

### Media inventory and motion

| Asset | Technical result | Use |
| --- | --- | --- |
| `amortv.mp4` | 11,756,952 bytes; 1920×1080 landscape, 16:9, 11.7s, HEVC `hvc1`, 30fps / 351 video frames; AAC track has 1,032,192 decoded PCM samples with peak 0.0 | Original preserved in parent folder and original frontend checkout; SHA-256 `b05192625504bbcaea72bb7b1be0b78a0b8465b171b8f369743a9f26bf00a0f1` |
| `amortv (1).gif` | 7,842,891 bytes; 540×304, 140 frames, decoded frame-duration sum 11.66s (about 12fps); no audio; same scene sequence at lower resolution / slightly different sample timing | Reference only; not shipped as a duplicate download |
| `media/amortv-luggage.mp4` | 2,568,424 bytes; 1280×720 H.264, 30fps / 351 frames, silent; 78.2% smaller than source MP4 by file bytes | Runtime Shop hero; browser playback verified |
| `media/amortv-luggage-poster.webp` | 22,216 bytes; 1280×720, actual opening source frame | Poster / reduced-motion / loading fallback |

Original HEVC parsed metadata in Chrome but produced no decoded video dimensions; the H.264 derivative plays in Chrome and WebKit. Native AVFoundation supplied the permitted ffprobe/ffmpeg equivalent because the installed Playwright FFmpeg lacks these input decoders and a temporary standalone download was unreliable. No media tool became an application dependency. Encoding uses H.264 High profile, 1.8Mbps target, 1280×720, 60-frame maximum keyframe interval and network-optimized MP4; the confirmed silent audio track is omitted.

The actual film cuts between a terminal suitcase (~0–2.4s), moving luggage (~2.4–5s), an airport trolley (~5–6s), a traveller with phone (~6–9.3s), and a hand lifting a handle (~9.3–11.7s). These are compressed-footage observations, not frame-perfect animation specifications. The camera/subjects move within the film; no website scroll/hover/header motion is demonstrated. Source extraction uses zero time tolerance and records actual frame times rather than nearest-keyframe estimates. Thirteen MP4 samples span opening to closing; all 140 GIF frames are decoded, with thirteen timestamped visual samples. Playback retains the original 30fps sequence and timing.

External evidence: `/private/tmp/amtrav-designer-evidence/` contains source/GIF contact sheets, exact source frame timestamps, AVFoundation metadata, browser screenshots, media-frame comparisons and JSON results. Raw references and generated evidence are not application assets. Current Figma screenshot/overlay comparisons cannot be produced without access; browser-vs-source film comparisons are kept separate and are not claimed as Figma parity.

### Follow-up validation

Final results and curated screenshots are recorded below after the production checks. Browser tests cover 320/375/390/430/768/1024/1280/1440/1920px, all five routes, active cart/navigation, exact header hit-area containment, desktop/mobile initial/scrolled states, one-main/heading semantics, Inter, errors, images, drawer keyboard/history behavior and existing carousel/power modes. Media tests cover decoding, dimensions, muted inline looping, reduced motion, Save-Data, manual pause/resume, offscreen pause, network failure and source-frame capture. Source access limits remain open; pricing, purchase and checkout remain unavailable by owner instruction.


| Final check | Result |
| --- | --- |
| Locked install, Node 24.22.0 / pnpm 11.20.0 | Passed; lockfile and app dependencies unchanged |
| `pnpm lint:landing`, `pnpm lint:admin` | Passed |
| `pnpm --filter landing_page exec tsc --noEmit`, `pnpm --filter admin_panel exec tsc --noEmit` | Passed |
| `pnpm build:landing`, `pnpm build:admin` | Passed; `/shop` statically generated |
| `pnpm sprint:test`, `pnpm sprint validate` | 15/15 tests passed using dry-run adapters; six definitions valid |
| Production Chrome 155 | 541/541 checks passed; nine widths × five routes plus interaction/media checks |
| Playwright WebKit | 344/344 checks passed; same route/width matrix plus drawer/media/reduced-motion interactions |
| Axe-core 4.10.3 | Zero automated violations across 11 Chrome states before the final sheen adjustment and 11 final WebKit states |
| Dark preference / no JavaScript | 11/11 WebKit checks passed; brand colors remain consistent, and Shop content/poster/navigation remain available without JS |
| Slow-network / visibility handler | Five checks passed; 512kbps / 150ms latency retains media aspect ratio and content; synthetic hidden/visible events verify pause/resume handlers |
| Frame comparison | 13 actual WebKit-decoded frames matched to native source timestamps; RGB MAE 0.97–1.95/255, PSNR 39.28–43.44dB against 720p-resized source; differences include scaling, browser color conversion and compression |
| Actual recordings | Hero/header scroll, mobile open/close/navigation and full product playback captured as WebM outside Git |
| Git and architecture | `git diff --check` passed; pre-commit secret scan required; Admin, workspace dependencies and CI files unchanged; both backend Git states preserved |

Manual inspection includes the final Shop desktop/mobile screenshots, mobile dialog, reduced-motion poster, media-failure poster/status, 320px callout fix, source/GIF sheets and runtime film frames. Axe `incomplete` results require manual review for translucent/image backgrounds, conditional ARIA and video captions. The source has verified digital silence and the film has a text description, so it does not need dialogue captions. Automated results are not a full WCAG certification or a hardware frame-rate guarantee. Playwright WebKit is verified; a direct Safari/iPhone session is not claimed.

Curated browser evidence:

| View | Before | After |
| --- | --- | --- |
| Header / Home desktop 1440px | [Before](screenshots/header-before-desktop.png) | [After](screenshots/header-after-desktop.png) |
| Header / Home mobile 390px | [Before](screenshots/header-before-mobile.png) | [After](screenshots/header-after-mobile.png) |
| Shop desktop / mobile | New approved route | [Desktop](screenshots/shop-desktop.png), [Mobile](screenshots/shop-mobile.png) |
| Shop mobile states | — | [Drawer](screenshots/shop-menu.png), [Reduced-motion poster](screenshots/shop-poster.png) |

Single local Chrome samples, unthrottled and mixed cold/warm cache (not a controlled speed comparison):

| Route / width | Before LCP / CLS | After LCP / CLS | Decoded JS before / after |
| --- | --- | --- | --- |
| Home 390 | 1292ms / 0 | 56ms / 0 | 502,940 / 506,038 bytes |
| Home 1440 | 196ms / 0 | 64ms / 0 | 525,865 / 528,963 bytes |
| New Shop 390 | N/A | 144ms / 0.000495 | 528,963 bytes |
| New Shop 1440 | N/A | 80ms / 0.000095 | 528,963 bytes |

The byte reduction is a measured file-size change, not a field-speed improvement. No field INP, device-specific FPS, current Figma pixel parity or successful waitlist/checkout claim is made. Essential cart/menu images load eagerly after throttled testing exposed a briefly blank menu icon. The source film is never fetched on the other marketing routes by the video component.

Reproduce Chrome acceptance after building/starting on port 3140:

```sh
AMTRAV_QA_URL=http://localhost:3140 node scripts/landing-browser-qa.mjs
AMTRAV_QA_URL=http://localhost:3140 node scripts/landing-browser-qa.mjs --interactions-only
```

The external WebKit scripts/results live under `/private/tmp/amtrav-designer-*.mjs` and `/private/tmp/amtrav-designer-evidence/`; they use the previously installed Playwright tooling, not a new project dependency. Source contact sheets are `source-contact-sheet.png` and `gif-contact-sheet.png`; `film-side-by-side.png`, `film-difference.json` and `diff-*.png` compare actual playback against the source at corresponding timestamps. `recordings/` holds the three browser recordings. Those temporary paths are local evidence, not permanent public links.

Current remaining dependencies: full current Figma/Claude access and Shop mobile/export comparisons; approved pricing/inventory/checkout if purchasing is later desired; existing footer/social/app-store URLs, waitlist endpoint, firmware version and production console URL. Backend and Admin contracts/authentication remain outside this task.
