# Landing fidelity review

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
