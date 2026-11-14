"use client";

// The range's bags in real-time 3D: the same GLB suitcases the mobile app renders
// (mobile-app/scripts/bag-models, compressed with `gltf-transform meshopt` into
// public/models). three.js loads only when the range comes near the viewport, and each
// bag turns in with an expo-out settle, like the brand lockup in the team's preloader.
// Drag (or use the arrow keys) to turn it; it spins slowly on its own unless the reader
// prefers reduced motion or has paused motion on the site.

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Rotate3d } from "lucide-react";
import type * as Three from "three";
import type { GLTF } from "three/addons/loaders/GLTFLoader.js";
import { useMotionPaused } from "./motion";

export type BagModelName = "carry-on" | "check-in";

/** A shell finish for the bag's Shell and Rib materials; anything left out keeps the model's. */
export interface BagFinish {
  color?: string;
  metalness?: number;
  roughness?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
}

const MODELS: Record<BagModelName, string> = {
  "carry-on": "/models/carry-on.glb",
  "check-in": "/models/check-in.glb",
};

/** Three-quarters on, the angle a bag is usually photographed from. */
const START = (-32 * Math.PI) / 180;
/** The turn a bag makes as it arrives. */
const ARRIVAL_TURN = 0.9;
const ENTER_MS = 1200;
/** Idle spin, radians a second: about twenty seconds a turn. */
const SPIN = 0.3;
/** How long after a drag or key press before it spins again. */
const RESUME_MS = 2500;
/** A full turn for about 500 px of drag. */
const RAD_PER_PX = (Math.PI * 2) / 500;
/** One arrow-key press turns it by 30°. */
const KEY_TURN = Math.PI / 6;
/**
 * The camera frames the same box for both models, a metre and a bit tall, so the
 * carry-on stands visibly shorter than the check-in.
 */
const VIEW_HEIGHT = 1.16;
const VIEW_WIDTH = 0.8;
const TARGET_Y = 0.49;

const expoOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

type Kit = {
  THREE: typeof Three;
  load: (url: string) => Promise<GLTF>;
  RoomEnvironment: typeof import("three/addons/environments/RoomEnvironment.js").RoomEnvironment;
};

let kit: Promise<Kit> | undefined;
function loadKit() {
  kit ??= Promise.all([
    import("three"),
    import("three/addons/loaders/GLTFLoader.js"),
    import("three/addons/libs/meshopt_decoder.module.js"),
    import("three/addons/environments/RoomEnvironment.js"),
  ]).then(([THREE, { GLTFLoader }, { MeshoptDecoder }, { RoomEnvironment }]) => {
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    // Decode the embedded wordmark through an <img> (as Safari does) rather than
    // fetch(): the site's CSP allows blob: images but not blob: connections.
    loader.register((parser) => {
      const images = new THREE.TextureLoader(parser.options.manager);
      images.setCrossOrigin(parser.options.crossOrigin);
      parser.textureLoader = images;
      return { name: "amortrav_img_textures" };
    });
    return { THREE, load: (url: string) => loader.loadAsync(url), RoomEnvironment };
  });
  kit.catch(() => (kit = undefined));
  return kit;
}

const models = new Map<BagModelName, Promise<GLTF>>();
function loadModel(name: BagModelName) {
  let model = models.get(name);
  if (!model) {
    model = loadKit().then(({ load }) => load(MODELS[name]));
    models.set(name, model);
    model.catch(() => models.delete(name));
  }
  return model;
}

type Stage = { dispose: () => void; wake: () => void };

/** Builds the scene in `host` and runs it; returns how to stop it. Throws without WebGL. */
function stage(
  { THREE, RoomEnvironment }: Kit,
  gltf: GLTF,
  host: HTMLElement,
  focus: HTMLElement,
  finish: BagFinish,
  still: () => boolean,
  onInteract: () => void,
  onLost: () => void,
): Stage {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const canvas = renderer.domElement;
  canvas.className = "ld-modelCanvas";
  host.append(canvas);

  // The lighting the app's turntables were rendered with.
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  room.dispose();
  pmrem.dispose();
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.8;
  const key = new THREE.DirectionalLight(0xfff5e8, 2.4);
  key.position.set(-1.5, 2.2, 2);
  const fill = new THREE.DirectionalLight(0xdde9ff, 0.9);
  fill.position.set(2, 0.8, 1);
  const rim = new THREE.DirectionalLight(0xffffff, 1.8);
  rim.position.set(0.5, 1.8, -2);
  scene.add(key, fill, rim, new THREE.AmbientLight(0xffffff, 0.3));

  // The cached model is shared between bags, so each one recolours its own shell.
  const bag = gltf.scene.clone(true);
  const owned: Three.Material[] = [];
  bag.traverse((object) => {
    const mesh = object as Three.Mesh;
    if (!mesh.isMesh) return;
    const material = mesh.material as Three.MeshPhysicalMaterial;
    // The brand lime stays exact, as in the app, so it reads as the signal colour.
    if (material.name === "Lime") material.toneMapped = false;
    if (material.name !== "Shell" && material.name !== "Rib") return;
    const shell = material.clone();
    if (finish.color) shell.color.set(finish.color);
    if (finish.metalness !== undefined) shell.metalness = finish.metalness;
    if (finish.roughness !== undefined) shell.roughness = finish.roughness;
    if (finish.clearcoat !== undefined) shell.clearcoat = finish.clearcoat;
    if (finish.clearcoatRoughness !== undefined)
      shell.clearcoatRoughness = finish.clearcoatRoughness;
    mesh.material = shell;
    owned.push(shell);
  });

  // A soft oval shadow under the wheels, drawn once.
  const size = new THREE.Box3().setFromObject(bag).getSize(new THREE.Vector3());
  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = shadowCanvas.height = 256;
  const context = shadowCanvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, "rgba(0,0,0,0.5)");
    gradient.addColorStop(0.55, "rgba(0,0,0,0.2)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
  }
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const shadowMaterial = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    depthWrite: false,
  });
  const shadowGeometry = new THREE.PlaneGeometry(size.x * 1.9, size.z * 2.6);
  const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.001;

  const turntable = new THREE.Group();
  turntable.add(bag, shadow);
  scene.add(turntable);

  const camera = new THREE.PerspectiveCamera(24, 1, 0.05, 20);
  const elevation = THREE.MathUtils.degToRad(11);
  const fit = () => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const slope = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const distance = Math.max(
      VIEW_HEIGHT / 2 / slope,
      VIEW_WIDTH / 2 / (slope * camera.aspect),
    );
    camera.position.set(
      0,
      TARGET_Y + Math.sin(elevation) * distance,
      Math.cos(elevation) * distance,
    );
    camera.lookAt(0, TARGET_Y - 0.02, 0);
    camera.updateProjectionMatrix();
  };

  const entered = performance.now();
  let angle = 0;
  let velocity = 0;
  let target: number | null = null;
  let dragging = false;
  let lastInput = -Infinity;
  let lastX = 0;
  let lastMove = 0;
  let visible = false;
  let frame = 0;
  let last = entered;
  let touched = false;

  const interact = () => {
    lastInput = performance.now();
    if (!touched) {
      touched = true;
      onInteract();
    }
  };

  const draw = (now: number) => {
    const quiet = still();
    const arrival = quiet ? 1 : expoOut(Math.min(1, (now - entered) / ENTER_MS));
    turntable.rotation.y = START + angle - (1 - arrival) * ARRIVAL_TURN;
    turntable.position.y = -(1 - arrival) * 0.05;
    turntable.scale.setScalar(0.94 + 0.06 * arrival);
    shadowMaterial.opacity = arrival;
    renderer.render(scene, camera);
    return arrival < 1;
  };

  const tick = (now: number) => {
    frame = 0;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const quiet = still();
    if (quiet) {
      // A reduced-motion preference also stops inertia and keyboard easing.
      velocity = 0;
      if (target !== null) {
        angle = target;
        target = null;
      }
    }
    if (target !== null) {
      // Ease towards the key press's angle.
      angle += (target - angle) * (1 - Math.pow(0.002, dt));
      if (Math.abs(target - angle) < 0.002) {
        angle = target;
        target = null;
      }
    } else if (!dragging && velocity) {
      // The flick carries on and slows to a stop.
      angle += velocity * dt;
      velocity *= Math.pow(0.03, dt);
      if (Math.abs(velocity) < 0.02) velocity = 0;
    }
    let spinning = false;
    if (!quiet && !dragging && target === null) {
      const from = Math.max(entered + ENTER_MS * 0.5, lastInput + RESUME_MS);
      const ramp = Math.min(1, Math.max(0, (now - from) / 1200));
      angle += SPIN * dt * ramp;
      spinning = true;
    }
    const arriving = draw(now);
    if (visible && (spinning || arriving || dragging || velocity || target !== null)) {
      frame = requestAnimationFrame(tick);
    }
  };

  const wake = () => {
    if (frame || !visible) return;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  };

  const onDown = (event: PointerEvent) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragging = true;
    velocity = 0;
    target = null;
    lastX = event.clientX;
    lastMove = event.timeStamp;
    canvas.setPointerCapture(event.pointerId);
    host.dataset.dragging = "";
    interact();
    wake();
  };
  const onMove = (event: PointerEvent) => {
    if (!dragging) return;
    const dx = event.clientX - lastX;
    const seconds = Math.max((event.timeStamp - lastMove) / 1000, 1 / 240);
    angle += dx * RAD_PER_PX;
    velocity = Math.max(-8, Math.min(8, (dx * RAD_PER_PX) / seconds));
    lastX = event.clientX;
    lastMove = event.timeStamp;
    interact();
  };
  const onUp = (event: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    delete host.dataset.dragging;
    // Only a flick keeps turning; a drag that stopped before release stays put.
    if (still() || event.timeStamp - lastMove > 80) velocity = 0;
    interact();
    wake();
  };
  const onKey = (event: KeyboardEvent) => {
    const base = target ?? angle;
    if (event.key === "ArrowLeft") target = base - KEY_TURN;
    else if (event.key === "ArrowRight") target = base + KEY_TURN;
    else if (event.key === "Home")
      target = Math.round(angle / (Math.PI * 2)) * Math.PI * 2;
    else return;
    event.preventDefault();
    velocity = 0;
    interact();
    wake();
  };
  const onLostContext = (event: Event) => {
    event.preventDefault();
    onLost();
  };

  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("webglcontextlost", onLostContext);
  focus.addEventListener("keydown", onKey);

  const resize = new ResizeObserver(() => {
    fit();
    draw(performance.now());
  });
  resize.observe(host);
  const onScreen = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    if (visible) wake();
    else if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  });
  onScreen.observe(host);
  fit();
  draw(entered);

  return {
    wake,
    dispose() {
      if (frame) cancelAnimationFrame(frame);
      resize.disconnect();
      onScreen.disconnect();
      canvas.removeEventListener("webglcontextlost", onLostContext);
      focus.removeEventListener("keydown", onKey);
      for (const material of owned) material.dispose();
      shadowTexture.dispose();
      shadowMaterial.dispose();
      shadowGeometry.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}

type Status = "waiting" | "loading" | "ready" | "failed";

/**
 * A bag from the range in 3D, filling its parent. `poster` shows if WebGL or the model
 * can't load. `label` names the bag for screen readers; `description` says how to turn it.
 * `paused` stops the idle spin while something covers it, such as the film dialog.
 */
export function BagViewer({
  model,
  finish,
  label,
  description,
  hint,
  poster,
  className,
  style,
  paused = false,
}: {
  model: BagModelName;
  finish: BagFinish;
  label: string;
  description: string;
  hint: string;
  poster: string;
  className?: string;
  style?: CSSProperties;
  paused?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const running = useRef<Stage | null>(null);
  const still = useMotionPaused();
  const stillNow = useRef(still || paused);
  const [status, setStatus] = useState<Status>("waiting");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    stillNow.current = still || paused;
    running.current?.wake();
  }, [still, paused]);

  useEffect(() => {
    const element = root.current;
    const host = canvasHost.current;
    if (!element || !host) return;
    let cancelled = false;
    let idle: number | undefined;
    let delay: ReturnType<typeof setTimeout> | undefined;
    // Start fetching a screen or so before the range scrolls into view.
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        near.disconnect();
        setStatus("loading");
        Promise.all([loadKit(), loadModel(model)])
          .then(([three, gltf]) => {
            if (cancelled) return;
            running.current = stage(
              three,
              gltf,
              host,
              element,
              finish,
              () => stillNow.current,
              () => setTouched(true),
              () => {
                if (cancelled) return;
                running.current?.dispose();
                running.current = null;
                setStatus("failed");
              },
            );
            setStatus("ready");
            // The other bags are a click away: fetch their model while the page is idle.
            const rest = () => {
              if (cancelled) return;
              for (const name of Object.keys(MODELS) as BagModelName[]) loadModel(name);
            };
            if ("requestIdleCallback" in window) idle = requestIdleCallback(rest);
            else delay = setTimeout(rest, 1500);
          })
          .catch(() => {
            if (!cancelled) setStatus("failed");
          });
      },
      { rootMargin: "600px 0px" },
    );
    near.observe(element);
    return () => {
      cancelled = true;
      if (idle !== undefined) cancelIdleCallback(idle);
      clearTimeout(delay);
      near.disconnect();
      running.current?.dispose();
      running.current = null;
    };
  }, [model, finish]);

  return (
    <div
      ref={root}
      className={`ld-model ${className ?? ""}`}
      style={style}
      data-status={status}
      data-still={still ? "" : undefined}
      role="img"
      aria-label={status === "ready" ? `${label}. ${description}` : label}
      tabIndex={status === "ready" ? 0 : undefined}
    >
      <div ref={canvasHost} className="ld-modelHost" />
      {status === "loading" && <span className="ld-modelLoading" aria-hidden="true" />}
      {status === "ready" && (
        <span
          className="ld-modelHint"
          data-hidden={touched ? "" : undefined}
          aria-hidden="true"
        >
          <Rotate3d size={14} aria-hidden="true" />
          {hint}
        </span>
      )}
      {status !== "ready" && (
        <Image
          src={poster}
          alt=""
          fill
          sizes="(max-width: 800px) 88vw, (max-width: 1440px) 48vw, 690px"
        />
      )}
    </div>
  );
}
