// The Amortrav ad. Every element is laid out for the chosen format, and window.seek(t) sets
// the whole frame from the time alone, so render.mjs can step through it frame by frame.
//
//   spot (15 s): where your bag goes → how it's handled → what it weighs → the bag → end card
//   bumper (6 s): the hook, three features, end card (YouTube's 6-second format)
//
// The phones show the app's real screens (my-app/public/images/app). Where a screen was
// captured empty, a layer in the app's own style shows sample data, and the ad says so.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const query = new URLSearchParams(location.search);
const FORMAT = ["landscape", "portrait", "square"].includes(query.get("format"))
  ? query.get("format")
  : "landscape";
const CUT = query.get("cut") === "bumper" ? "bumper" : "spot";
const [W, H] = { landscape: [1920, 1080], portrait: [1080, 1920], square: [1080, 1080] }[FORMAT];
const DURATION = CUT === "bumper" ? 6 : 15;
Object.assign(window, { FORMAT, CUT, DURATION, WIDTH: W, HEIGHT: H });

// ---------------------------------------------------------------- time
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const span = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = {
  outExpo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  outCubic: (x) => 1 - Math.pow(1 - x, 3),
  inCubic: (x) => x * x * x,
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  outBack: (x) => {
    const c1 = 1.5;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  },
};

// ---------------------------------------------------------------- layout per format
const LAYOUTS = {
  landscape: {
    s: 1.08,
    bug: { x: 96, y: 70, size: 26 },
    copy: { x: 140, y: 250, width: 960, eb: 22, hl: 112, sb: 34 },
    phone: { cx: 1450, cy: 548, h: 900 },
    route: { x: 140, y: 612, w: 900, h: 250, code: 28, city: 19 },
    chips: { c1: [985, 296], c2: [955, 600], c3: [955, 720] },
    feats: { x: 140, y: 610, gap: 20 },
    bag: { cx: 1390, cy: 548, size: 920 },
    swatches: { x: 140, y: 790, size: 26 },
    end: { align: "left", x: 140, y: 236, mark: 92, word: 124, tag: 36, cta: 32, bag: { cx: 1430, cy: 540, size: 900 } },
    note: { x: 1830, y: 1016, size: 18, align: "right" },
  },
  portrait: {
    s: 1.32,
    bug: { x: 80, y: 110, size: 30 },
    copy: { x: 80, y: 250, width: 920, eb: 26, hl: 122, sb: 40 },
    phone: { cx: 540, cy: 1310, h: 1100 },
    route: { x: 60, y: 600, w: 960, h: 230, code: 30, city: 20 },
    chips: { c1: [52, 1160], c2: [52, 1370], c3: [52, 1250] },
    feats: { x: 52, y: 1010, gap: 26 },
    bag: { cx: 540, cy: 1320, size: 1000 },
    swatches: { x: 80, y: 760, size: 28 },
    end: { align: "center", x: 540, y: 1040, mark: 80, word: 120, tag: 38, cta: 34, bag: { cx: 540, cy: 640, size: 780 } },
    note: { x: 80, y: 164, size: 20, align: "left" },
  },
  square: {
    s: 0.92,
    bug: { x: 64, y: 56, size: 22 },
    copy: { x: 72, y: 190, width: 600, eb: 18, hl: 76, sb: 26 },
    phone: { cx: 812, cy: 650, h: 820 },
    route: { x: 60, y: 460, w: 540, h: 200, code: 24, city: 16 },
    chips: { c1: [60, 760], c2: [60, 540], c3: [60, 580] },
    feats: { x: 72, y: 520, gap: 16 },
    bag: { cx: 790, cy: 620, size: 760 },
    swatches: { x: 72, y: 600, size: 20 },
    end: { align: "center", x: 540, y: 610, mark: 70, word: 96, tag: 30, cta: 28, bag: { cx: 540, cy: 330, size: 560 } },
    note: { x: 1016, y: 1030, size: 16, align: "right" },
  },
};
const L = LAYOUTS[FORMAT];

// ---------------------------------------------------------------- the story
const SPOT = {
  copy: [
    { eyebrow: "01 · Location history", lines: ["Know where", "your bag goes."], in: 0.35, out: 2.78 },
    { eyebrow: "02 · Impact detection", lines: ["See how", "it’s handled."], in: 3.12, out: 5.78 },
    { eyebrow: "03 · Built-in weighing", lines: ["Know what", "it weighs."], in: 6.12, out: 8.78 },
    {
      eyebrow: "Smart luggage",
      lines: ["Meet", "Amortrav."],
      sub: "The Smart Core inside every bag, in four finishes.",
      in: 9.15,
      out: 12.3,
    },
  ],
  phones: [
    { src: "/app/bag.jpg", in: 0.85, out: 2.8, kind: "bag" },
    { src: "/app/impacts.jpg", in: 3.2, out: 5.8, kind: "impacts", hit: 4.25 },
    { src: "/app/weight.jpg", in: 6.2, out: 8.8, kind: "weight", weigh: [6.95, 8.05] },
  ],
  chips: [
    { at: "c1", icon: "pin", k: "On a journey", v: "Accra → London", d: "Seen 2 min ago · ±12 m", in: 1.6, out: 2.8 },
    { at: "c2", icon: "zap", tone: "amber", k: "Impact detected", v: "11.8 g", d: "Baggage handling · Heathrow", in: 4.3, out: 5.8 },
    { at: "c3", icon: "check", k: "Travel-Ready", v: "21.4 kg", d: "Under your 23 kg limit", in: 7.75, out: 8.8 },
  ],
  feats: [],
  route: { in: 0.3, out: 2.7 },
  bag: { in: 9.05, toEnd: [12.4, 13.2] },
  finishes: [
    [10.25, 10.65, "navy"],
    [11.0, 11.4, "graphite"],
    [11.75, 12.15, "black"],
    [12.55, 13.15, "silver"],
  ],
  swatches: { in: 9.9, out: 12.3 },
  end: 12.65,
  bug: [0.4, 12.4],
  note: [0.9, 8.8],
};
const BUMPER = {
  copy: [{ eyebrow: "Amortrav smart luggage", lines: ["Know where", "your bag goes."], in: 0.12, out: 2.3 }],
  phones: [{ src: "/app/bag.jpg", in: 0.3, out: 2.32, kind: "bag" }],
  chips: [],
  feats: [
    { icon: "pin", label: "Location history", in: 0.95 },
    { icon: "zap", label: "Impact detection", in: 1.18 },
    { icon: "scale", label: "Built-in weighing", in: 1.41 },
  ],
  featsOut: 2.25,
  route: null,
  bag: { in: 2.42 },
  finishes: [],
  swatches: null,
  end: 2.6,
  bug: [0.25, 2.45],
  note: [0.6, 2.3],
};
const STORY = CUT === "bumper" ? BUMPER : SPOT;

// ---------------------------------------------------------------- DOM helpers
const stage = document.getElementById("stage");
stage.style.width = `${W}px`;
stage.style.height = `${H}px`;
stage.style.setProperty("--s", L.s);
const make = (tag, cls, parent = stage, html) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (html != null) node.innerHTML = html;
  parent.append(node);
  return node;
};
const at = (node, x, y) => {
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
};
const ICONS = {
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  zap: '<path d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z"/>',
  scale:
    '<path d="M12 3v18"/><path d="m19 8 3 8a5 5 0 0 1-6 0zV7"/><path d="M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1"/><path d="m5 8 3 8a5 5 0 0 1-6 0zV7"/><path d="M7 21h10"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  plane:
    '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
};
const icon = (name, size, stroke = 2.2) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
const masked = (text) => `<span class="line"><span class="w">${text}</span></span>`;

// ---------------------------------------------------------------- backdrop and brand
const glow = stage.querySelector(".glow");
const bug = make("div", "bug abs", stage, `<img src="/images/brand-mark.png" alt="" /><span>AMORTRAV</span>`);
at(bug, L.bug.x, L.bug.y);
bug.style.fontSize = `${L.bug.size}px`;
const note = make("div", "note abs", stage, "App screens show sample data.");
note.style.fontSize = `${L.note.size}px`;
if (L.note.align === "right") Object.assign(note.style, { left: "auto", right: `${W - L.note.x}px`, top: `${L.note.y}px` });
else at(note, L.note.x, L.note.y);

// ---------------------------------------------------------------- the route (spot, scene 1)
let route = null;
if (STORY.route) {
  const R = L.route;
  const svg = make(
    "div",
    "route abs",
    stage,
    `<svg width="${R.w}" height="${R.h + R.code * 2.6}" viewBox="0 0 ${R.w} ${R.h + R.code * 2.6}" fill="none" overflow="visible">
      <path class="base" stroke="rgba(255,255,255,0.32)" stroke-width="2" stroke-dasharray="2 12" stroke-linecap="round"/>
      <path class="flown" stroke="#4a91f2" stroke-width="4" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1"/>
      <circle class="dot-a" r="9" fill="#fff"/>
      <circle class="dot-b" r="9" fill="#4a91f2"/>
      <circle class="ring-b" r="18" stroke="#4a91f2" stroke-width="3"/>
      <g class="plane"><g transform="translate(-18 -18) scale(1.5)" fill="#fff" stroke="#fff" stroke-width="1.2" stroke-linejoin="round">${ICONS.plane}</g></g>
      <text class="code-a" font-size="${R.code}" text-anchor="middle">ACC</text>
      <text class="city city-a" font-size="${R.city}" text-anchor="middle">Accra</text>
      <text class="code-b" font-size="${R.code}" text-anchor="middle">LHR</text>
      <text class="city city-b" font-size="${R.city}" text-anchor="middle">London</text>
    </svg>`,
  );
  at(svg, R.x, R.y);
  const ax = R.w * 0.05;
  const bx = R.w * 0.95;
  const ay = R.h * 0.9;
  const d = `M${ax} ${ay} C ${R.w * 0.32} ${R.h * 0.0}, ${R.w * 0.68} ${R.h * 0.0}, ${bx} ${ay}`;
  for (const p of svg.querySelectorAll("path.base, path.flown")) p.setAttribute("d", d);
  const q = (s) => svg.querySelector(s);
  for (const [c, x] of [
    ["a", ax],
    ["b", bx],
  ]) {
    q(`.dot-${c}`).setAttribute("cx", x);
    q(`.dot-${c}`).setAttribute("cy", ay);
    q(`.code-${c}`).setAttribute("x", x);
    q(`.code-${c}`).setAttribute("y", ay + R.code * 1.55);
    q(`.city-${c}`).setAttribute("x", x);
    q(`.city-${c}`).setAttribute("y", ay + R.code * 1.55 + R.city * 1.45);
  }
  q(".ring-b").setAttribute("cx", bx);
  q(".ring-b").setAttribute("cy", ay);
  const flown = q("path.flown");
  route = { el: svg, flown, base: q("path.base"), length: flown.getTotalLength(), plane: q(".plane"), ring: q(".ring-b"), dotB: q(".dot-b") };
}

// ---------------------------------------------------------------- copy
for (const block of STORY.copy) {
  const box = make("div", "copy abs");
  at(box, L.copy.x, L.copy.y);
  box.style.width = `${L.copy.width}px`;
  const eyebrow = make("div", "eyebrow", box, masked(block.eyebrow));
  eyebrow.style.fontSize = `${L.copy.eb}px`;
  const hl = make("div", "hl", box);
  hl.style.fontSize = `${L.copy.hl}px`;
  block.lines.forEach((text, i) => {
    const line = make("span", `line${i === block.lines.length - 1 ? " accent" : ""}`, hl);
    const words = text.split(" ");
    words.forEach((word, j) => make("span", "w", line, word + (j < words.length - 1 ? " " : "")));
  });
  if (block.sub) {
    const sub = make("p", "sub", box, masked(block.sub));
    sub.style.fontSize = `${L.copy.sb}px`;
  }
  block.el = box;
  block.eyebrow = eyebrow.querySelector(".w");
  block.words = [...hl.querySelectorAll(".w")];
  block.sub = box.querySelector(".sub .w");
}

// ---------------------------------------------------------------- phones
const SHOT_W = 780;
const SHOT_H = 1688;
for (const phone of STORY.phones) {
  const h = L.phone.h;
  const bezel = Math.round(h * 0.017);
  const screenH = h - bezel * 2;
  const screenW = Math.round((screenH * SHOT_W) / SHOT_H);
  const w = screenW + bezel * 2;
  const el = make("div", "phone abs");
  Object.assign(el.style, {
    width: `${w}px`,
    height: `${h}px`,
    padding: `${bezel}px`,
    borderRadius: `${Math.round(w * 0.16)}px`,
  });
  at(el, L.phone.cx - w / 2, L.phone.cy - h / 2);
  const screen = make("div", "screen", el);
  screen.style.borderRadius = `${Math.round(w * 0.16 - bezel)}px`;
  screen.style.setProperty("--u", screenW / SHOT_W);
  make("img", "", screen).src = phone.src;
  const box = (x, y, bw, bh, cls, html = "") => {
    const node = make("div", `ov ${cls}`, screen, html);
    Object.assign(node.style, {
      left: `calc(var(--u) * ${x}px)`,
      top: `calc(var(--u) * ${y}px)`,
    });
    // Sizes left out keep the class's own (the pings are sized in CSS).
    if (bw != null) node.style.width = `calc(var(--u) * ${bw}px)`;
    if (bh != null) node.style.height = `calc(var(--u) * ${bh}px)`;
    return node;
  };
  if (phone.kind === "bag") {
    // Pings on the map pin (measured at 389, 1430 in the capture).
    phone.pings = [0, 1].map(() => box(389, 1430, null, null, "ping"));
  }
  if (phone.kind === "impacts") {
    // The Moderate tile's count (its "0" sits at 306–333 × 437–470).
    phone.count = box(300, 430, 48, 48, "tile-count", "1");
    phone.count.style.paddingTop = "calc(var(--u) * 6px)";
    phone.count.style.paddingLeft = "calc(var(--u) * 6px)";
    // "No impacts yet" fills 690–1180; an event takes its place.
    phone.events = box(
      0,
      680,
      780,
      500,
      "events",
      `<div class="lbl">Latest</div>
       <div class="event"><div class="ic">${icon("zap", 22, 2.4).replace(/width="22" height="22"/, 'width="45%" height="45%"')}</div>
         <div><b>Moderate impact</b><span>11.8 g · Baggage handling</span></div><em>Just now</em></div>`,
    );
  }
  if (phone.kind === "weight") {
    // The dark "Not weighed yet" card is 40–739 × 358–669 with 52px corners.
    phone.card = box(40, 358, 700, 312, "weigh", `<div class="lbl">Weighing…</div><div class="val"><b>0.0</b><small>kg</small></div><div class="bar"><i></i></div><div class="foot">of your 23 kg limit</div>`);
    phone.card.style.borderRadius = "calc(var(--u) * 52px)";
    phone.label = phone.card.querySelector(".lbl");
    phone.value = phone.card.querySelector(".val b");
    phone.fill = phone.card.querySelector(".bar i");
  }
  phone.el = el;
  phone.w = w;
  phone.h = h;
}

// Shock rings for the impact, centred on the impacts phone.
const rings = STORY.phones
  .filter((p) => p.hit)
  .flatMap((p) =>
    [0, 1, 2].map((i) => {
      const ring = make("div", "abs");
      stage.insertBefore(ring, p.el);
      Object.assign(ring.style, { border: "4px solid #ffb547", borderRadius: "50%", width: `${p.w}px`, height: `${p.w}px` });
      at(ring, L.phone.cx - p.w / 2, L.phone.cy - p.w / 2);
      return { el: ring, phone: p, delay: i * 0.13 };
    }),
  );

// ---------------------------------------------------------------- floating cards
for (const chip of STORY.chips) {
  chip.el = make(
    "div",
    `chip abs${chip.tone ? ` ${chip.tone}` : ""}`,
    stage,
    `<div class="ic">${icon(chip.icon, Math.round(28 * L.s), 2.3)}</div><div><div class="k">${chip.k}</div><div class="v">${chip.v}</div><div class="d">${chip.d}</div></div>`,
  );
  at(chip.el, ...L.chips[chip.at]);
  chip.el.style.transformOrigin = "0% 50%";
}
STORY.feats.forEach((feat, i) => {
  feat.el = make("div", "feat abs", stage, `<span class="ic">${icon(feat.icon, Math.round(24 * L.s), 2.3)}</span>${feat.label}`);
  at(feat.el, L.feats.x, L.feats.y + i * (L.feats.gap + 76 * L.s));
  feat.el.style.transformOrigin = "0% 50%";
});

// ---------------------------------------------------------------- finishes
const FINISHES = {
  silver: { name: "Brushed silver", color: "#c4c9d0", metalness: 0.9, roughness: 0.3, clearcoat: 0.1, clearcoatRoughness: 0.3 },
  navy: { name: "Navy", color: "#12305e", metalness: 0.05, roughness: 0.48, clearcoat: 0.25, clearcoatRoughness: 0.3 },
  graphite: { name: "Graphite", color: "#3a3f47", metalness: 0.05, roughness: 0.45, clearcoat: 0.25, clearcoatRoughness: 0.3 },
  black: { name: "Gloss black", color: "#141518", metalness: 0.05, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05 },
};
let swatches = null;
if (STORY.swatches) {
  const row = make(
    "div",
    "swatches abs",
    stage,
    ["silver", "navy", "graphite", "black"]
      .map((key) => `<span class="swatch" data-key="${key}"><i style="background:${FINISHES[key].color}"></i>${FINISHES[key].name}</span>`)
      .join(""),
  );
  at(row, L.swatches.x, L.swatches.y);
  row.style.fontSize = `${L.swatches.size}px`;
  if (FORMAT !== "landscape") Object.assign(row.style, { flexWrap: "wrap", width: `${FORMAT === "square" ? 540 : 920}px`, rowGap: "0.7em" });
  swatches = { el: row, items: [...row.querySelectorAll(".swatch")] };
}

// ---------------------------------------------------------------- the 3D bag
const CS = Math.max(STORY.bag && CUT === "spot" ? L.bag.size : 0, L.end.bag.size);
const bagLight = make("div", "bag-light abs");
const canvas = make("canvas", "abs");
canvas.id = "bag";
canvas.width = CS;
canvas.height = CS;
Object.assign(canvas.style, { width: `${CS}px`, height: `${CS}px` });
const three = {};

async function setupBag() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(CS, CS, false);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = pmrem.fromScene(room, 0.04).texture;
  scene.environmentIntensity = 0.85;
  const key = new THREE.DirectionalLight(0xfff5e8, 2.4);
  key.position.set(-1.5, 2.2, 2);
  const fill = new THREE.DirectionalLight(0xdde9ff, 0.9);
  fill.position.set(2, 0.8, 1);
  const rim = new THREE.DirectionalLight(0xffffff, 2.4);
  rim.position.set(0.5, 1.8, -2);
  scene.add(key, fill, rim, new THREE.AmbientLight(0xffffff, 0.3));

  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync("/models/check-in.glb");
  const bag = gltf.scene;
  const shells = [];
  bag.traverse((object) => {
    if (!object.isMesh) return;
    const material = object.material;
    // The model files still call it "Lime", from before the signal colour changed.
    if (material.name === "Lime") {
      material.color.set("#8fc3ff");
      material.toneMapped = false;
    }
    if (material.name === "Shell" || material.name === "Rib") {
      object.material = material.clone();
      shells.push(object.material);
    }
  });
  const size = new THREE.Box3().setFromObject(bag).getSize(new THREE.Vector3());
  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = shadowCanvas.height = 256;
  const context = shadowCanvas.getContext("2d");
  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, "rgba(0,0,0,0.55)");
  gradient.addColorStop(0.55, "rgba(0,0,0,0.22)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  const shadowMaterial = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(size.x * 1.9, size.z * 2.6), shadowMaterial);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.001;
  const turntable = new THREE.Group();
  turntable.add(bag, shadow);
  scene.add(turntable);

  const camera = new THREE.PerspectiveCamera(24, 1, 0.05, 20);
  const slope = Math.tan(THREE.MathUtils.degToRad(12));
  const distance = 1.12 / 2 / slope;
  const elevation = THREE.MathUtils.degToRad(11);
  camera.position.set(0, 0.49 + Math.sin(elevation) * distance, Math.cos(elevation) * distance);
  camera.lookAt(0, 0.47, 0);
  camera.updateProjectionMatrix();

  const colors = Object.fromEntries(Object.entries(FINISHES).map(([k, f]) => [k, new THREE.Color(f.color)]));
  Object.assign(three, { renderer, scene, camera, turntable, shells, shadowMaterial, colors });
}

function finishAt(t) {
  const now = { ...FINISHES.silver, color: three.colors.silver.clone() };
  let active = "silver";
  for (const [a, b, name] of STORY.finishes) {
    if (t <= a) break;
    const k = ease.inOutCubic(span(t, a, b));
    const to = FINISHES[name];
    now.color.lerp(three.colors[name], k);
    for (const prop of ["metalness", "roughness", "clearcoat", "clearcoatRoughness"]) now[prop] = lerp(now[prop], to[prop], k);
    if (k >= 0.5) active = name;
  }
  return { now, active };
}

function drawBag(t) {
  const start = STORY.bag.in;
  const visible = t >= start - 0.01;
  canvas.style.visibility = bagLight.style.visibility = visible ? "visible" : "hidden";
  if (!visible || !three.renderer) return;
  const arrive = ease.outExpo(span(t, start, start + 1.3));
  let P = CUT === "spot" ? L.bag : L.end.bag;
  if (CUT === "spot") {
    const m = ease.inOutCubic(span(t, ...STORY.bag.toEnd));
    P = { cx: lerp(L.bag.cx, L.end.bag.cx, m), cy: lerp(L.bag.cy, L.end.bag.cy, m), size: lerp(L.bag.size, L.end.bag.size, m) };
  }
  const k = P.size / CS;
  const rise = (1 - arrive) * 140;
  canvas.style.transform = `translate(${P.cx - (CS * k) / 2}px, ${P.cy - (CS * k) / 2 + rise}px) scale(${k})`;
  const fade = clamp((t - start) / 0.4);
  canvas.style.opacity = fade;
  const light = P.size * 1.25;
  Object.assign(bagLight.style, { width: `${light}px`, height: `${light}px`, opacity: fade });
  bagLight.style.transform = `translate(${P.cx - light / 2}px, ${P.cy - light / 2 + rise * 0.5}px)`;

  const { turntable, shells, renderer, scene, camera, shadowMaterial } = three;
  // A steady turn that lands three-quarters on, the way bags are photographed, on the last frame.
  const speed = CUT === "spot" ? 0.7 : 0.45;
  turntable.rotation.y = THREE.MathUtils.degToRad(-32) - (DURATION - t) * speed - (1 - arrive) * 1.1;
  turntable.position.y = -(1 - arrive) * 0.05;
  turntable.scale.setScalar(0.94 + 0.06 * arrive);
  shadowMaterial.opacity = arrive;
  const { now, active } = finishAt(t);
  for (const material of shells) {
    material.color.copy(now.color);
    material.metalness = now.metalness;
    material.roughness = now.roughness;
    material.clearcoat = now.clearcoat;
    material.clearcoatRoughness = now.clearcoatRoughness;
  }
  renderer.render(scene, camera);
  if (swatches) {
    for (const item of swatches.items) {
      const on = item.dataset.key === active;
      item.style.opacity = on ? 1 : 0.42;
      item.querySelector("i").style.boxShadow = on
        ? "0 0 0 3px #071226, 0 0 0 5px rgba(255,255,255,0.9)"
        : "inset 0 0 0 1px rgba(255,255,255,0.3)";
    }
  }
}

// ---------------------------------------------------------------- end card
const E = L.end;
const end = make(
  "div",
  `end abs${E.align === "center" ? " center" : ""}`,
  stage,
  `<img class="end-mark" src="/images/brand-mark.png" alt="" />
   <div class="end-word">${[..."AMORTRAV"].map((c) => `<span>${c}</span>`).join("")}</div>
   <p class="end-tag">${masked("Travel with a better sense of control.")}</p>
   <div class="end-cta">Become a Founding Traveller ${icon("arrow", Math.round(E.cta * 0.9), 2.6)}</div>
   <div class="end-url">amortrav.com</div>`,
);
if (E.align === "center") {
  at(end, 0, E.y);
  end.style.width = `${W}px`;
} else at(end, E.x, E.y);
end.style.fontSize = `${E.cta}px`;
end.querySelector(".end-mark").style.height = `${E.mark}px`;
end.querySelector(".end-word").style.fontSize = `${E.word}px`;
end.querySelector(".end-word").style.marginTop = `${E.mark * 0.28}px`;
end.querySelector(".end-tag").style.fontSize = `${E.tag}px`;
const endParts = {
  mark: end.querySelector(".end-mark"),
  letters: [...end.querySelectorAll(".end-word span")],
  tag: end.querySelector(".end-tag .w"),
  cta: end.querySelector(".end-cta"),
  url: end.querySelector(".end-url"),
};

// ---------------------------------------------------------------- the frame at time t
function copyAt(block, t) {
  const visible = t >= block.in - 0.05 && t < block.out + 0.9;
  block.el.style.visibility = visible ? "visible" : "hidden";
  if (!visible) return;
  const out = (delay) => ease.inCubic(span(t, block.out + delay, block.out + delay + 0.42)) * 112;
  const rise = (delay, length = 0.85) => (1 - ease.outExpo(span(t, block.in + delay, block.in + delay + length))) * 112;
  block.eyebrow.style.transform = `translateY(${rise(0, 0.7) - out(0)}%)`;
  block.words.forEach((w, i) => {
    w.style.transform = `translateY(${rise(0.08 + i * 0.07) - out(0.03 + i * 0.03)}%)`;
  });
  if (block.sub) block.sub.style.transform = `translateY(${rise(0.5, 0.9) - out(0.12)}%)`;
}

function phoneAt(phone, t) {
  const visible = t >= phone.in - 0.02 && t <= phone.out + 0.7;
  phone.el.style.visibility = visible ? "visible" : "hidden";
  if (!visible) return;
  const i = ease.outExpo(span(t, phone.in, phone.in + 1.0));
  const o = ease.inCubic(span(t, phone.out, phone.out + 0.55));
  let shakeX = 0;
  let shakeR = 0;
  if (phone.hit && t > phone.hit) {
    const d = t - phone.hit;
    const damp = Math.exp(-d * 6.5);
    shakeX = Math.sin(d * 58) * 16 * damp;
    shakeR = Math.sin(d * 47) * 1.8 * damp;
  }
  const float = Math.sin((t - phone.in) * 1.3) * 6;
  const x = -o * W * 0.05 + shakeX;
  const y = (1 - i) * H * 0.42 + float - o * H * 0.04;
  const rotate = (1 - i) * 7 - o * 3 + shakeR;
  const scale = 0.92 + 0.08 * i - 0.05 * o;
  phone.el.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`;
  phone.el.style.opacity = clamp(i * 1.6) * (1 - o);

  if (phone.pings) {
    phone.pings.forEach((ping, n) => {
      const phase = (((t - phone.in - 0.5 - n * 0.7) % 1.4) + 1.4) % 1.4 / 1.4;
      const live = t > phone.in + 0.5 + n * 0.7;
      ping.style.transform = `scale(${0.5 + phase * 2.2})`;
      ping.style.opacity = live ? (1 - phase) * 0.95 : 0;
    });
  }
  if (phone.events) {
    const k = ease.outExpo(span(t, phone.hit + 0.12, phone.hit + 0.8));
    const shown = t >= phone.hit + 0.12;
    phone.events.style.opacity = shown ? 1 : 0;
    phone.events.querySelector(".event").style.transform = `translateY(${(1 - k) * -30}px)`;
    phone.events.querySelector(".event").style.opacity = k;
    phone.count.style.opacity = shown ? 1 : 0;
    phone.count.style.transform = `scale(${shown ? 0.6 + 0.4 * ease.outBack(span(t, phone.hit + 0.12, phone.hit + 0.5)) : 1})`;
  }
  if (phone.card) {
    const [a, b] = phone.weigh;
    const kg = 21.4 * ease.outCubic(span(t, a, b));
    phone.value.textContent = kg.toFixed(1);
    phone.fill.style.width = `${(kg / 23) * 100}%`;
    phone.label.textContent = t < b ? "Weighing…" : "Weighed just now";
  }
}

function popAt(node, t, tin, tout, fromX = -40) {
  const visible = t >= tin - 0.02 && t <= tout + 0.6;
  node.style.visibility = visible ? "visible" : "hidden";
  if (!visible) return;
  const i = ease.outBack(span(t, tin, tin + 0.6));
  const shown = clamp(span(t, tin, tin + 0.22));
  const o = ease.inCubic(span(t, tout, tout + 0.4));
  node.style.transform = `translate(${(1 - i) * fromX}px, ${(1 - shown) * 20 - o * 24}px) scale(${0.86 + 0.14 * i})`;
  node.style.opacity = shown * (1 - o);
}

function routeAt(t) {
  if (!route) return;
  const { in: tin, out: tout } = STORY.route;
  const visible = t >= tin - 0.02 && t <= tout + 0.5;
  route.el.style.visibility = visible ? "visible" : "hidden";
  if (!visible) return;
  const appear = clamp(span(t, tin, tin + 0.4)) * (1 - span(t, tout, tout + 0.35));
  route.el.style.opacity = appear;
  const p = ease.inOutCubic(span(t, tin + 0.15, tin + 1.9));
  route.flown.style.strokeDashoffset = String(1 - p);
  const point = route.flown.getPointAtLength(p * route.length);
  const ahead = route.flown.getPointAtLength(Math.min(route.length, p * route.length + 1));
  const behind = route.flown.getPointAtLength(Math.max(0, p * route.length - 1));
  const angle = (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI;
  route.plane.setAttribute("transform", `translate(${point.x} ${point.y}) rotate(${angle + 45})`);
  route.plane.style.opacity = p >= 1 ? 1 - span(t, tin + 1.9, tin + 2.1) : 1;
  const land = span(t, tin + 1.9, tin + 2.5);
  route.ring.setAttribute("r", String(10 + land * 26));
  route.ring.style.opacity = land > 0 ? 1 - land : 0;
}

function endAt(t) {
  const start = STORY.end;
  const visible = t >= start - 0.02;
  end.style.visibility = visible ? "visible" : "hidden";
  if (!visible) return;
  const m = ease.outExpo(span(t, start, start + 0.6));
  endParts.mark.style.clipPath = `inset(${(1 - m) * 100}% 0 0 0)`;
  endParts.mark.style.transform = `translateY(${(1 - m) * 25}%)`;
  endParts.letters.forEach((letter, i) => {
    const k = ease.outExpo(span(t, start + 0.12 + i * 0.035, start + 0.12 + i * 0.035 + 0.6));
    letter.style.transform = `translateY(${(1 - k) * 115}%)`;
  });
  const tag = ease.outExpo(span(t, start + 0.45, start + 1.2));
  endParts.tag.style.transform = `translateY(${(1 - tag) * 112}%)`;
  const cta = ease.outBack(span(t, start + 0.8, start + 1.35));
  endParts.cta.style.transform = `scale(${0.85 + 0.15 * cta})`;
  endParts.cta.style.opacity = clamp(span(t, start + 0.8, start + 1.0));
  const url = clamp(span(t, start + 1.05, start + 1.5));
  endParts.url.style.opacity = url;
  endParts.url.style.transform = `translateY(${(1 - url) * 12}px)`;
}

function fadeAt(node, t, [a, b], length = 0.4) {
  const k = clamp(span(t, a, a + length)) * (1 - span(t, b, b + length));
  node.style.opacity = k;
  node.style.visibility = k > 0 ? "visible" : "hidden";
}

function backdropAt(t) {
  const cx = W * (FORMAT === "portrait" ? 0.5 : 0.62) + Math.sin(t * 0.35) * W * 0.05;
  const cy = H * 0.45 + Math.cos(t * 0.3) * H * 0.04;
  glow.style.transform = `translate(${cx - 800}px, ${cy - 800}px)`;
}

window.seek = (t) => {
  backdropAt(t);
  fadeAt(bug, t, STORY.bug);
  fadeAt(note, t, STORY.note);
  routeAt(t);
  for (const block of STORY.copy) copyAt(block, t);
  for (const phone of STORY.phones) phoneAt(phone, t);
  for (const ring of rings) {
    const d = t - ring.phone.hit - ring.delay;
    const k = clamp(d / 0.9);
    ring.el.style.visibility = d > 0 && k < 1 ? "visible" : "hidden";
    ring.el.style.transform = `scale(${0.4 + ease.outCubic(k) * 1.5})`;
    ring.el.style.opacity = (1 - k) * 0.85;
  }
  for (const chip of STORY.chips) popAt(chip.el, t, chip.in, chip.out);
  for (const feat of STORY.feats) popAt(feat.el, t, feat.in, STORY.featsOut, -30);
  if (swatches) {
    const k = clamp(span(t, STORY.swatches.in, STORY.swatches.in + 0.5)) * (1 - span(t, STORY.swatches.out, STORY.swatches.out + 0.4));
    swatches.el.style.opacity = k;
    swatches.el.style.visibility = k > 0 ? "visible" : "hidden";
    swatches.el.style.transform = `translateY(${(1 - clamp(span(t, STORY.swatches.in, STORY.swatches.in + 0.5))) * 18}px)`;
  }
  drawBag(t);
  endAt(t);
  return true;
};

// ---------------------------------------------------------------- ready
await setupBag();
const fonts = [500, 600, 700, 800].map((weight) => document.fonts.load(`${weight} 40px Montserrat`));
await Promise.all(fonts);
await document.fonts.ready;
await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
window.seek(0);
window.ready = true;
