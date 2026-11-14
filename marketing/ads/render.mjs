// Renders the Amortrav ads (ad.html) to H.264 MP4: headless Chrome draws each frame from the
// time alone (window.seek), and the frames are piped straight into ffmpeg.
//
//   node render.mjs <tools dir> <out dir> [cuts] [formats] [--stills=1.5,4.4]
//
// <tools dir> holds node_modules with puppeteer-core and three (npm install puppeteer-core
// three@0.187.0). cuts: spot,bumper. formats: landscape,portrait,square. --stills writes PNGs
// at those times instead of videos. Chrome draws WebGL on the GPU (ANGLE=metal); set
// ANGLE=swiftshader to render in software. CHROME_PATH and FFMPEG override the defaults.
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => a.slice(2).split("=")));
const [tools, out, cuts = "spot,bumper", formats = "landscape,portrait,square"] = args.filter((a) => !a.startsWith("--"));
if (!tools || !out) {
  throw new Error("Usage: node render.mjs <tools dir> <out dir> [spot,bumper] [landscape,portrait,square] [--stills=t1,t2]");
}
const FPS = 30;
const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(here, "../../public");
const require = createRequire(path.resolve(tools, "package.json"));
const puppeteer = require("puppeteer-core");
const threeRoot = path.dirname(path.dirname(require.resolve("three")));
const ffmpeg = process.env.FFMPEG ?? "ffmpeg";

const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".ttf": "font/ttf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".glb": "model/gltf-binary",
};
// URL prefix → folder. Everything the page loads comes from the repo or the tools folder.
const roots = [
  ["/ad/", here],
  ["/three/", threeRoot],
  ["/app/", path.join(site, "images/app")],
  ["/models/", path.join(site, "models")],
  ["/images/", path.join(site, "images")],
];
const server = createServer(async (request, response) => {
  const url = decodeURIComponent(new URL(request.url, "http://x").pathname);
  const match = roots.find(([prefix]) => url.startsWith(prefix));
  const file = match && path.join(match[1], path.normalize(url.slice(match[0].length)));
  if (!file || !file.startsWith(match[1])) return response.writeHead(404).end();
  try {
    const body = await readFile(file);
    response.writeHead(200, { "content-type": types[path.extname(file)] ?? "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const launch = () =>
  puppeteer.launch({
    executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
    protocolTimeout: 600_000,
    args: [
      `--use-angle=${process.env.ANGLE || "metal"}`,
      "--enable-gpu",
      "--enable-unsafe-swiftshader",
      "--ignore-gpu-blocklist",
      "--force-color-profile=srgb",
      "--hide-scrollbars",
    ],
  });
let browser = await launch();

async function open(cut, format) {
  // Chrome can be killed under memory pressure: start it again if it's gone.
  if (!browser.connected) browser = await launch();
  const page = await browser.newPage();
  page.on("pageerror", (error) => console.error(`page error (${cut} ${format}):`, error.message));
  page.on("console", (message) => message.type() === "error" && console.error("console:", message.text()));
  const size = { landscape: [1920, 1080], portrait: [1080, 1920], square: [1080, 1080] }[format];
  await page.setViewport({ width: size[0], height: size[1], deviceScaleFactor: 1 });
  await page.goto(`${origin}/ad/ad.html?format=${format}&cut=${cut}`, { waitUntil: "load" });
  await page.waitForFunction("window.ready === true", { timeout: 120_000 });
  return { page, width: size[0], height: size[1], duration: await page.evaluate("window.DURATION") };
}

async function frame(page, t) {
  await page.evaluate((time) => window.seek(time), t);
  return page.screenshot({ type: "png" });
}

await mkdir(out, { recursive: true });
try {
  for (const cut of cuts.split(",")) {
    for (const format of formats.split(",")) {
      const { page, width, height, duration } = await open(cut, format);
      if (flags.stills) {
        for (const t of flags.stills.split(",").map(Number)) {
          if (t > duration) continue;
          await writeFile(path.join(out, `still-${cut}-${format}-${t.toFixed(2)}.png`), await frame(page, t));
        }
        console.log(`stills ${cut} ${format}`);
        await page.close();
        continue;
      }
      const name = `amortrav-${cut}-${duration}s-${format}-${width}x${height}.mp4`;
      const started = Date.now();
      const encoder = spawn(
        ffmpeg,
        [
          "-y", "-v", "error",
          "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "png", "-i", "-",
          "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-profile:v", "high",
          "-pix_fmt", "yuv420p", "-r", String(FPS), "-movflags", "+faststart",
          path.join(out, name),
        ],
        { stdio: ["pipe", "inherit", "inherit"] },
      );
      const done = new Promise((resolve, reject) =>
        encoder.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`)))),
      );
      const total = Math.round(duration * FPS);
      // Frames depend on time alone, so a crashed tab is reopened and the video carries on
      // from the same frame into the same ffmpeg stream.
      let current = page;
      let crashes = 0;
      for (let i = 0; i < total; ) {
        let png;
        try {
          png = await frame(current, i / FPS);
        } catch (error) {
          if (++crashes > 8) throw error;
          console.error(`${name}: frame ${i}: ${error.message.split("\n")[0]}; reopening`);
          await current.close().catch(() => {});
          current = (await open(cut, format)).page;
          continue;
        }
        if (!encoder.stdin.write(png)) await new Promise((resolve) => encoder.stdin.once("drain", resolve));
        i++;
        if (i % 150 === 0) console.log(`${name}: ${i}/${total}`);
      }
      encoder.stdin.end();
      await done;
      // A thumbnail from the end card, for YouTube and the ad libraries.
      await writeFile(path.join(out, `thumbnail-${cut}-${format}.png`), await frame(current, duration - 0.4));
      console.log(`${name}: ${total} frames in ${((Date.now() - started) / 1000).toFixed(0)} s${crashes ? `, ${crashes} restarts` : ""}`);
      await current.close();
    }
  }
} finally {
  await browser.close().catch(() => {});
  server.close();
}
