// Production browser regression checks with an existing local Chrome CDP endpoint; no packages.
// Start the landing production server and Chrome with --remote-debugging-port=9223 first.
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const base = process.env.AMTRAV_QA_URL ?? "http://localhost:3130";
const endpoint = process.env.AMTRAV_CDP_URL ?? "http://127.0.0.1:9223";
const output = process.env.AMTRAV_QA_OUTPUT ?? join(tmpdir(), "amtrav-landing-fidelity-qa");
mkdirSync(output, { recursive: true });
const browser = await (await fetch(`${endpoint}/json/version`)).json();
const socket = new WebSocket(browser.webSocketDebuggerUrl);
const requests = new Map();
const events = [];
let sequence = 0;
socket.onmessage = ({ data }) => {
  const message = JSON.parse(data);
  const request = requests.get(message.id);
  if (request) {
    requests.delete(message.id);
    clearTimeout(request.timeout);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
  } else events.push(message);
};
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
function raw(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timeout = setTimeout(() => { requests.delete(id); reject(new Error(`${method} timed out`)); }, 20000);
    requests.set(id, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id, method, params, sessionId }));
  });
}
const { targetId } = await raw("Target.createTarget", { url: "about:blank" });
const { sessionId } = await raw("Target.attachToTarget", { targetId, flatten: true });
const call = (method, params = {}) => raw(method, params, sessionId);
async function evaluate(expression) {
  const result = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  assert.ok(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const results = [];
function check(name, condition, detail) { results.push({ name, passed: Boolean(condition), detail }); }
async function screenshot(name) {
  const image = await call("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(output, `${name}.png`), Buffer.from(image.data, "base64"));
}
async function navigate(route) {
  await call("Page.bringToFront");
  events.length = 0;
  const { loaderId } = await call("Page.navigate", { url: `${base}${route}` });
  for (let count = 0; count < 100; count++) {
    if (events.some((event) => event.method === "Page.lifecycleEvent" && event.params.loaderId === loaderId && event.params.name === "load")) break;
    await wait(100);
  }
  await evaluate("document.fonts.ready.then(() => true)");
  await wait(750);
}
async function click(selector) {
  const point = await evaluate(`(() => {
    const element = [...document.querySelectorAll(${JSON.stringify(selector)})].find(e => e.getBoundingClientRect().width && e.getBoundingClientRect().height);
    if (!element) return null;
    element.scrollIntoView({ block: 'center', behavior: 'instant' });
    const rect = element.getBoundingClientRect(); return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  })()`);
  assert.ok(point, `Missing visible ${selector}`);
  await call("Input.dispatchMouseEvent", { type: "mouseMoved", ...point });
  await call("Input.dispatchMouseEvent", { type: "mousePressed", ...point, button: "left", clickCount: 1 });
  await call("Input.dispatchMouseEvent", { type: "mouseReleased", ...point, button: "left", clickCount: 1 });
  await wait(100);
}
async function key(key, modifiers = 0) {
  const windowsVirtualKeyCode = { Tab: 9, Escape: 27, ArrowRight: 39 }[key];
  await call("Input.dispatchKeyEvent", { type: "keyDown", key, code: key, windowsVirtualKeyCode, modifiers });
  await call("Input.dispatchKeyEvent", { type: "keyUp", key, code: key, windowsVirtualKeyCode, modifiers });
  await wait(100);
}
async function viewport(width) {
  await call("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: false });
}
const currentSlide = () => evaluate("document.querySelector('[aria-roledescription=slide]').getAttribute('aria-label')");

try {
  await Promise.all(["Page.enable", "Runtime.enable", "Network.enable", "Log.enable"].map((method) => call(method)));
  await call("Page.setLifecycleEventsEnabled", { enabled: true });
  await call("Page.addScriptToEvaluateOnNewDocument", { source: `window.qaMetrics={lcp:0,cls:0};new PerformanceObserver(l=>{for(const e of l.getEntries())window.qaMetrics.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.qaMetrics.cls+=e.value}).observe({type:'layout-shift',buffered:true});` });

  if (!process.argv.includes("--interactions-only")) {
  for (const width of [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
    await viewport(width);
    for (const route of ["/", "/features", "/how-it-works", "/for-brands", "/shop"]) {
      await navigate(route);
      const name = `${width}-${route.slice(1) || "home"}`;
      const snapshot = await evaluate(`(() => ({
        font: getComputedStyle(document.body).fontFamily,
        width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        mainCount: document.querySelectorAll('main').length,
        h1Count: document.querySelectorAll('h1').length,
        header: document.querySelector('header').getBoundingClientRect().toJSON(),
        metrics: window.qaMetrics,
        jsBytes: performance.getEntriesByType('resource').filter(e=>e.name.includes('.js')).reduce((a,e)=>a+e.decodedBodySize,0),
      }))()`);
      check(`${name}: Inter`, snapshot.font.startsWith("Inter"), snapshot.font);
      check(`${name}: no overflow`, snapshot.scrollWidth === width, snapshot.scrollWidth);
      check(`${name}: one main and h1`, snapshot.mainCount === 1 && snapshot.h1Count === 1);
      check(`${name}: inset header`, snapshot.header.left >= 11 && snapshot.header.right <= width - 11, snapshot.header);
      check(`${name}: active route`, await evaluate(`(() => { const active=${JSON.stringify(route)}==='/shop' ? [...document.querySelectorAll('header a[aria-label="Shop"]')].find(e=>e.getBoundingClientRect().width) : document.querySelector('nav[aria-label="Main navigation"] [aria-current="page"]'); return ${JSON.stringify(route)} === '/' ? !active : active?.getAttribute('href')===${JSON.stringify(route)}; })()`));
      check(`${name}: visible connected cart`, await evaluate("[...document.querySelectorAll('header a[aria-label=Shop]')].filter(e=>e.getBoundingClientRect().width>0).length===1"));
      check(`${name}: header controls fit`, await evaluate("(() => {const h=document.querySelector('header').getBoundingClientRect();const a=[...document.querySelectorAll('header a,header button')].filter(e=>e.getBoundingClientRect().width>0).map(e=>e.getBoundingClientRect());return a.every(r=>r.left>=h.left&&r.right<=h.right)&&a.every((r,i)=>a.every((b,j)=>i===j||r.right<=b.left+1||b.right<=r.left+1))})()"));
      results.push({ name: `${name}: local measurements`, ...snapshot.metrics, jsBytes: snapshot.jsBytes });
      await screenshot(`${name}-top`);
      await evaluate("scrollTo({top:600,behavior:'instant'})");
      await wait(800);
      check(`${name}: fixed header during scroll`, await evaluate("document.querySelector('header').getBoundingClientRect().top") === snapshot.header.top);
      await screenshot(`${name}-scrolled`);
      await evaluate("scrollTo({top:document.body.scrollHeight,behavior:'instant'})");
      await wait(800);
      await screenshot(`${name}-footer`);
      check(`${name}: loaded visible images`, await evaluate("[...document.images].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight}).every(e=>e.complete&&e.naturalWidth>0)"));
      const errors = events.filter((event) => event.method === "Runtime.exceptionThrown" || (event.method === "Runtime.consoleAPICalled" && event.params.type === "error") || (event.method === "Log.entryAdded" && event.params.entry.level === "error"));
      const failedResponses = events.filter((event) => event.method === "Network.responseReceived" && event.params.response.status >= 400);
      check(`${name}: no console/page errors`, errors.length === 0, errors);
      check(`${name}: no failed requests`, failedResponses.length === 0, failedResponses);
    }
  }
  }

  await viewport(390);
  await navigate("/");
  await screenshot("390-home-final");
  await click('button[aria-label="Open menu"]');
  check("menu: native modal and scroll lock", await evaluate("Boolean(document.querySelector('dialog:modal')) && document.body.style.overflow === 'hidden'"));
  check("menu: initial focus", await evaluate("document.activeElement.getAttribute('aria-label') === 'Close menu'"));
  check("menu: right drawer geometry", await evaluate("(() => {const r=document.querySelector('dialog > div').getBoundingClientRect();return r.left>0 && Math.abs(r.right-innerWidth)<1})()"));
  await screenshot("390-menu-open");
  await evaluate("document.querySelector('header a').focus()");
  check("menu: background focus isolated", await evaluate("document.querySelector('dialog').contains(document.activeElement)"));
  await evaluate("document.querySelector('dialog a[href=\"#signup\"]').focus()");
  await key("Tab");
  check("menu: forward Tab wraps", await evaluate("document.activeElement === document.querySelector('dialog a')"));
  await key("Tab", 8);
  check("menu: Shift+Tab wraps", await evaluate("document.activeElement === document.querySelector('dialog a[href=\"#signup\"]')"));
  await key("Escape");
  check("menu: Escape and focus restoration", await evaluate("!document.querySelector('dialog') && document.activeElement.getAttribute('aria-label')==='Open menu' && document.body.style.overflow===''"));
  await evaluate("document.body.style.overflow='clip'");
  await click('button[aria-label="Open menu"]');
  await key("Escape");
  check("menu: previous scroll style restored", await evaluate("document.body.style.overflow==='clip'"));
  await evaluate("document.body.style.overflow=''");
  await click('button[aria-label="Open menu"]');
  await click('dialog a[href="/features"]');
  await wait(800);
  check("menu: link navigation closes", await evaluate("location.pathname==='/features' && !document.querySelector('dialog')"));
  await click('button[aria-label="Open menu"]');
  check("menu: active route", await evaluate("document.querySelector('dialog [aria-current=page]').textContent.trim()==='Features'"));
  const history = await call("Page.getNavigationHistory");
  await call("Page.navigateToHistoryEntry", { entryId: history.entries[history.currentIndex - 1].id });
  await wait(700);
  check("menu: browser back closes modal", await evaluate("location.pathname==='/' && !document.querySelector('dialog')"));
  await call("Page.navigateToHistoryEntry", { entryId: history.entries[history.currentIndex].id });
  await wait(700);
  check("menu: browser forward stays closed", await evaluate("location.pathname==='/features' && !document.querySelector('dialog')"));
  await click('button[aria-label="Open menu"]');
  await call("Input.dispatchMouseEvent", { type: "mousePressed", x: 5, y: 450, button: "left", clickCount: 1 });
  await call("Input.dispatchMouseEvent", { type: "mouseReleased", x: 5, y: 450, button: "left", clickCount: 1 });
  await wait(100);
  check("menu: backdrop dismissal", await evaluate("!document.querySelector('dialog')"));
  await click('button[aria-label="Open menu"]');
  await viewport(1440);
  await wait(150);
  check("menu: resize closes modal and restores scroll", await evaluate("!document.querySelector('dialog') && document.body.style.overflow===''"));

  await navigate("/");
  await screenshot("1440-home-final");
  await evaluate("document.querySelector('[aria-roledescription=carousel]').scrollIntoView({block:'center',behavior:'instant'})");
  await call("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
  const first = await currentSlide();
  await wait(4250);
  check("carousel: four-second advance", first === "1 of 4" && await currentSlide() === "2 of 4");
  await screenshot("1440-testimonials");
  const beforePause = await currentSlide();
  await click('[aria-roledescription=carousel] > button');
  check("carousel: pointer pause control", await evaluate("document.querySelector('[aria-roledescription=carousel] > button').textContent.trim()==='Resume autoplay'"));
  await call("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
  await wait(4250);
  check("carousel: paused after pointer leaves", await currentSlide() === beforePause);
  await click('[aria-roledescription=carousel] > button');
  const hoveredSlide = await currentSlide();
  const hoverPoint = await evaluate("(() => {const r=document.querySelector('[aria-roledescription=carousel]').getBoundingClientRect();return {x:r.x+20,y:r.y+100}})()");
  await call("Input.dispatchMouseEvent", { type: "mouseMoved", ...hoverPoint });
  await wait(4250);
  check("carousel: hover pauses autoplay", await currentSlide() === hoveredSlide);
  await click('[aria-label="Next testimonial"]');
  check("carousel: manual next", await currentSlide() === "3 of 4");
  const manual = await currentSlide();
  await call("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
  await wait(4250);
  check("carousel: focus stops autoplay", await currentSlide() === manual);
  await click('[aria-label="Show testimonial 4 of 4"]');
  await click('[aria-label="Previous testimonial"]');
  check("carousel: dots and previous", await currentSlide() === "3 of 4");
  await key("ArrowRight");
  check("carousel: keyboard arrow", await currentSlide() === "4 of 4");
  await evaluate("[...document.querySelectorAll('button')].find(e=>e.textContent.trim()==='Resume autoplay').click()");
  await call("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
  await wait(4250);
  check("carousel: resume wraps to first", await currentSlide() === "1 of 4");
  const heights = [];
  for (const slide of [1, 2, 3, 4]) {
    await click(`[aria-label="Show testimonial ${slide} of 4"]`);
    await wait(800);
    heights.push(await evaluate("document.querySelector('[aria-roledescription=carousel]').getBoundingClientRect().height"));
    await screenshot(`1440-testimonial-${slide}`);
  }
  check("carousel: stable desktop height", Math.max(...heights) - Math.min(...heights) <= 1, heights);
  await evaluate("(() => {const section=[...document.querySelectorAll('section')].find(e=>e.querySelector('h2')?.textContent.includes('Find more'));scrollTo({top:section.getBoundingClientRect().top+scrollY-108,behavior:'instant'})})()");
  await wait(800);
  await screenshot("1440-explore");
  check("exploration: distinct actions", await evaluate("(() => {const s=[...document.querySelectorAll('section')].find(e=>e.querySelector('h2')?.textContent.includes('Find more'));return ['Explore','Find more','Talk to us'].every(t=>[...s.querySelectorAll('a')].some(a=>a.textContent.trim()===t))})()"));

  await viewport(390);
  await navigate("/");
  await evaluate("document.querySelector('[aria-roledescription=carousel]').scrollIntoView({block:'center',behavior:'instant'})");
  await wait(800);
  await screenshot("390-testimonials");
  const swipePoint = await evaluate("(() => {const r=document.querySelector('[aria-roledescription=carousel] figure').getBoundingClientRect();return {x:r.x+200,y:r.y+100}})()");
  await call("Input.dispatchMouseEvent", { type: "mousePressed", ...swipePoint, button: "left", clickCount: 1 });
  await call("Input.dispatchMouseEvent", { type: "mouseMoved", x: swipePoint.x-90, y: swipePoint.y, button: "left", buttons: 1 });
  await call("Input.dispatchMouseEvent", { type: "mouseReleased", x: swipePoint.x-90, y: swipePoint.y, button: "left", clickCount: 1 });
  await wait(100);
  check("carousel: horizontal pointer swipe", await currentSlide() === "2 of 4");
  await navigate("/features");
  await evaluate("document.querySelector('[role=radiogroup]').scrollIntoView({block:'center',behavior:'instant'})");
  await click('[role=radio][aria-checked=true]');
  await key("ArrowRight");
  check("power modes: keyboard selection", await evaluate("document.querySelector('[role=radio][aria-checked=true]').textContent.trim()==='Backup'"));
  await viewport(1280);
  await navigate("/features");
  check("features: copy fits cards", await evaluate("[...document.querySelectorAll('h3')].filter(e=>['Know where it is','Opens for you only','Flight-safe by design','Gets better over time'].includes(e.textContent)).every(e=>{const card=e.closest('.shadow-card');return card.scrollHeight<=card.clientHeight+1})"));
  check("features: power chips fit panel", await evaluate("(() => {const p=document.querySelector('[role=radiogroup]');const r=p.getBoundingClientRect();return [...p.children].every(e=>{const b=e.getBoundingClientRect();return b.top>=r.top&&b.bottom<=r.bottom&&b.left>=r.left&&b.right<=r.right})})()"));
  await evaluate("document.querySelector('[role=radiogroup]').scrollIntoView({block:'center',behavior:'instant'})");
  await wait(800);
  await screenshot("1280-features-cards");

  await call("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await navigate("/");
  await evaluate("document.querySelector('[aria-roledescription=carousel]').scrollIntoView({block:'center',behavior:'instant'})");
  const reducedFirst = await currentSlide();
  await wait(4250);
  check("reduced motion: no autoplay", await currentSlide() === reducedFirst);
  check("reduced motion: no rotation control", await evaluate("![...document.querySelectorAll('button')].some(e=>e.textContent.includes('autoplay'))"));
  check("reduced motion: decorative SVG stopped", await evaluate("[...document.querySelectorAll('animateMotion')].every(e=>getComputedStyle(e.parentElement).display==='none')"));
  await navigate("/for-brands");
  const tour = await evaluate("document.querySelector('[aria-label=\"Amortrav brand dashboard preview\"] button[aria-pressed=true]').textContent");
  await wait(5500);
  check("reduced motion: dashboard tour stopped", tour === await evaluate("document.querySelector('[aria-label=\"Amortrav brand dashboard preview\"] button[aria-pressed=true]').textContent"));
  await call("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "dark" }] });
  await screenshot("1440-brands-dark-reduced-motion");

  await viewport(390);
  await call("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await navigate("/shop");
  check("shop: reduced motion leaves poster without fetching film", await evaluate("document.querySelector('video').paused && !document.querySelector('video').getAttribute('src')") && !events.some(e=>e.method==='Network.requestWillBeSent'&&e.params.request.url.endsWith('.mp4')));
  await screenshot("390-shop-reduced-motion");
  await click('button[aria-label="Play product video"]');
  await wait(1000);
  check("shop: reduced-motion explicit playback", await evaluate("document.querySelector('video').videoWidth===1280 && !document.querySelector('video').paused"));
  await click('button[aria-label="Pause product video"]');
  const pausedTime = await evaluate("document.querySelector('video').currentTime");
  await wait(350);
  check("shop: pause control holds frame", await evaluate("document.querySelector('video').paused") && Math.abs(await evaluate("document.querySelector('video').currentTime")-pausedTime)<0.1);
  await call("Emulation.setEmulatedMedia", { features: [] });
  await navigate("/shop");
  await wait(1000);
  check("shop: compatible inline muted loop", await evaluate("(() => {const v=document.querySelector('video');return v.videoWidth===1280&&v.videoHeight===720&&!v.paused&&v.muted&&v.loop&&v.playsInline&&!v.error})()"));
  await evaluate("scrollTo({top:document.body.scrollHeight,behavior:'instant'})");
  await wait(350);
  check("shop: offscreen pause", await evaluate("document.querySelector('video').paused"));
  await evaluate("scrollTo({top:0,behavior:'instant'})");
  await wait(350);
  check("shop: resumes when visible", await evaluate("!document.querySelector('video').paused"));
  await click('button[aria-label="Pause product video"]');
  await evaluate("scrollTo({top:document.body.scrollHeight,behavior:'instant'})");
  await wait(150);
  await evaluate("scrollTo({top:0,behavior:'instant'})");
  await wait(350);
  check("shop: manual pause survives scrolling", await evaluate("document.querySelector('video').paused"));
  await click('button[aria-label="Play product video"]');
  await wait(200);
  check("shop: explicit resume", await evaluate("!document.querySelector('video').paused"));
  await click('button[aria-label="Pause product video"]');
  for (const time of [0, 3, 5.5, 7.5, 10.5]) {
    const png = await evaluate(`new Promise(resolve=>{const v=document.querySelector('video');v.onseeked=()=>{const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);resolve(c.toDataURL('image/png').split(',')[1])};v.currentTime=${time+0.001}})`);
    writeFileSync(join(output, `product-frame-${time}.png`), Buffer.from(png, "base64"));
  }
  check("shop: no checkout or invented prices", await evaluate("!document.querySelector('a[href*=checkout],form[action*=checkout]') && document.querySelector('main').textContent.includes('Purchasing is not available yet.')"));
  await click('button[aria-label="Open menu"]');
  check("shop: mobile active route", await evaluate("document.querySelector('dialog a[href=\"/shop\"]').getAttribute('aria-current')==='page'"));
  await click('dialog a[href="/features"]');
  await wait(400);
  await click('header a[aria-label="Shop"]');
  await wait(500);
  check("shop: cart returns from another screen", await evaluate("location.pathname==='/shop'&&!document.querySelector('dialog')"));
  const saveData = await call("Page.addScriptToEvaluateOnNewDocument", { source: "Object.defineProperty(navigator,'connection',{value:{saveData:true},configurable:true})" });
  await navigate("/shop");
  check("shop: Save-Data avoids film request", await evaluate("!document.querySelector('video').getAttribute('src')") && !events.some(e=>e.method==='Network.requestWillBeSent'&&e.params.request.url.endsWith('.mp4')));
  await call("Page.removeScriptToEvaluateOnNewDocument", { identifier: saveData.identifier });
  await call("Network.setCacheDisabled", { cacheDisabled: true });
  await call("Network.setBlockedURLs", { urls: ["*amortv-luggage.mp4"] });
  await navigate("/shop");
  await wait(500);
  check("shop: failed film leaves poster and status", await evaluate("document.querySelector('main [role=status]')?.textContent.includes('film could not load') && Boolean(document.querySelector('video').poster)"));
  await screenshot("390-shop-media-unavailable");
  await call("Network.setBlockedURLs", { urls: [] });
  await call("Network.setCacheDisabled", { cacheDisabled: false });

} finally {
  const failures = results.filter((result) => result.passed === false);
  writeFileSync(join(output, "results.json"), JSON.stringify({ browser: browser.Browser, base, results }, null, 2));
  console.log(JSON.stringify({ checks: results.filter(r=>"passed" in r).length, failed: failures.length, failures, output }, null, 2));
  await raw("Target.closeTarget", { targetId });
  socket.close();
  if (failures.length) process.exitCode = 1;
}
