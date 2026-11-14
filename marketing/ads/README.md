# Amortrav ads

Motion-design videos for Google Ads (YouTube, Performance Max, App campaigns) and social.
`ad.html` + `ad.js` are one deterministic animation: `window.seek(t)` draws the frame at time
`t`, and `render.mjs` steps through it in headless Chrome and pipes every frame to ffmpeg.

| Cut | Length | Story |
|---|---|---|
| `spot` | 15 s | Know where your bag goes → see how it's handled → know what it weighs → meet Amortrav (the bag in four finishes) → end card |
| `bumper` | 6 s | The hook, three features, end card (YouTube's 6-second bumper format) |

Each cut renders in three formats:

| Format | Size | Use |
|---|---|---|
| `landscape` | 1920 × 1080 | YouTube in-stream, Performance Max, App campaigns |
| `portrait` | 1080 × 1920 | YouTube Shorts, Instagram/Facebook Reels and Stories, TikTok |
| `square` | 1080 × 1080 | In-feed placements |

## Render

```sh
# Once: a tools folder with Chrome automation and three.js (Chrome itself is the installed one).
mkdir -p /tmp/ad-tools && npm install --prefix /tmp/ad-tools puppeteer-core three@0.187.0

# Everything (6 videos + an end-card thumbnail each) into renders/:
node render.mjs /tmp/ad-tools renders

# One cut and format, or stills to check a layout:
node render.mjs /tmp/ad-tools renders spot portrait
node render.mjs /tmp/ad-tools renders spot landscape --stills=1.9,4.7,7.9,10.6,14.4
```

Needs ffmpeg with libx264 (`brew install ffmpeg`). Output: H.264 High, 30 fps, yuv420p,
`+faststart` MP4s named `amortrav-<cut>-<seconds>s-<format>-<size>.mp4`. Chrome draws the 3D
bag on the GPU (`ANGLE=metal`); `ANGLE=swiftshader` renders it in software.

## What it uses

- The app's real screens from `public/images/app` (`bag`, `impacts`, `weight`). Where a
  screen was captured empty, a layer in the app's own style shows sample data (an impact of
  11.8 g, a 21.4 kg weigh-in), measured to sit exactly on the capture. The ad says
  "App screens show sample data." while those screens are on.
- The 3D check-in bag (`public/models/check-in.glb`) with the range's four shell finishes.
- The brand mark (`public/images/brand-mark.png`), the site's colours, and Montserrat
  (`fonts/`, SIL Open Font License, see `fonts/OFL.txt`).
- Claims are the site's own: location history, impact detection, built-in weighing, the
  Smart Core inside every bag. The call to action is the site's ("Become a Founding
  Traveller", amortrav.com); the app isn't in the stores yet, so the ad doesn't say so.

## Editing

Copy, timings and the chips are in `STORY` (`SPOT` / `BUMPER`) at the top of `ad.js`; positions
per format are in `LAYOUTS`. Check changes with `--stills` before a full render.

The videos are silent. Add a licensed music bed before running them as YouTube ads (for
example from the YouTube Audio Library), e.g.
`ffmpeg -i video.mp4 -i music.mp3 -c:v copy -c:a aac -shortest out.mp4`.
