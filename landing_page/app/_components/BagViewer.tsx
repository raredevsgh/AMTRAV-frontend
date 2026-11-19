"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Rotate3d, Check, ChevronLeft, ChevronRight } from "lucide-react";
import type * as Three from "three";
import type { GLTF } from "three/addons/loaders/GLTFLoader.js";

export type BagModelName = "carry-on" | "check-in";

export interface BagFinish {
  id: string;
  name: string;
  color: string;
  metalness: number;
  roughness: number;
  posterImage: string;
}

export const FINISHES: BagFinish[] = [
  { id: "navy", name: "Navy Flagship", color: "#001f4d", metalness: 0.15, roughness: 0.35, posterImage: "/images/trace/range-flagship.png" },
  { id: "graphite", name: "Graphite Essential", color: "#22252a", metalness: 0.2, roughness: 0.5, posterImage: "/images/trace/range-essential.png" },
  { id: "silver", name: "Brushed Aluminum Pro", color: "#b8c0cc", metalness: 0.85, roughness: 0.22, posterImage: "/images/trace/range-pro.png" },
  { id: "obsidian", name: "Executive Obsidian", color: "#0d0f12", metalness: 0.4, roughness: 0.15, posterImage: "/images/trace/range-executive.png" },
];

const MODELS: Record<BagModelName, string> = {
  "carry-on": "/models/carry-on.glb",
  "check-in": "/models/check-in.glb",
};

const START_ROTATION = (-32 * Math.PI) / 180;
const VIEW_HEIGHT = 1.16;
const VIEW_WIDTH = 0.8;
const TARGET_Y = 0.49;
const RAD_PER_PX = (Math.PI * 2) / 500;
const KEY_TURN = Math.PI / 6;

type Kit = {
  THREE: typeof Three;
  load: (url: string) => Promise<GLTF>;
  RoomEnvironment: typeof import("three/addons/environments/RoomEnvironment.js").RoomEnvironment;
};

let kitPromise: Promise<Kit> | undefined;
function getKit(): Promise<Kit> {
  kitPromise ??= Promise.all([
    import("three"),
    import("three/addons/loaders/GLTFLoader.js"),
    import("three/addons/libs/meshopt_decoder.module.js"),
    import("three/addons/environments/RoomEnvironment.js"),
  ]).then(([THREE, { GLTFLoader }, { MeshoptDecoder }, { RoomEnvironment }]) => {
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    // Register TextureLoader for CSP compliance with embedded wordmark textures
    loader.register((parser) => {
      const images = new THREE.TextureLoader(parser.options.manager);
      images.setCrossOrigin(parser.options.crossOrigin);
      parser.textureLoader = images;
      return { name: "amortrav_img_textures" };
    });
    return { THREE, load: (url: string) => loader.loadAsync(url), RoomEnvironment };
  });
  kitPromise.catch(() => {
    kitPromise = undefined;
  });
  return kitPromise;
}

const modelCache = new Map<BagModelName, Promise<GLTF>>();
function getModel(name: BagModelName): Promise<GLTF> {
  let model = modelCache.get(name);
  if (!model) {
    model = getKit().then(({ load }) => load(MODELS[name]));
    modelCache.set(name, model);
    model.catch(() => modelCache.delete(name));
  }
  return model;
}

export default function BagViewer({
  defaultModel = "carry-on",
  className = "",
}: {
  defaultModel?: BagModelName;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [modelName, setModelName] = useState<BagModelName>(defaultModel);
  const [selectedFinish, setSelectedFinish] = useState<BagFinish>(FINISHES[0]);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [touched, setTouched] = useState(false);

  const rotateActionRef = useRef<((delta: number) => void) | null>(null);

  const rotateBy = useCallback((deltaRadians: number) => {
    if (rotateActionRef.current) {
      rotateActionRef.current(deltaRadians);
    }
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let animationFrameId = 0;
    let cleanupStage: (() => void) | null = null;

    setIsReady(false);
    setHasError(false);

    Promise.all([getKit(), getModel(modelName)])
      .then(([kit, gltf]) => {
        if (cancelled) return;
        const { THREE, RoomEnvironment } = kit;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x000000, 0);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;

        const canvas = renderer.domElement;
        canvas.className = "ld-modelCanvas";
        host.innerHTML = "";
        host.appendChild(canvas);

        const scene = new THREE.Scene();
        const pmrem = new THREE.PMREMGenerator(renderer);
        const room = new RoomEnvironment();
        const environment = pmrem.fromScene(room, 0.04);
        room.dispose();
        pmrem.dispose();
        scene.environment = environment.texture;
        scene.environmentIntensity = 0.85;

        const key = new THREE.DirectionalLight(0xfff5e8, 2.4);
        key.position.set(-1.5, 2.2, 2);
        const fill = new THREE.DirectionalLight(0xdde9ff, 0.9);
        fill.position.set(2, 0.8, 1);
        const rim = new THREE.DirectionalLight(0xffffff, 1.8);
        rim.position.set(0.5, 1.8, -2);
        scene.add(key, fill, rim, new THREE.AmbientLight(0xffffff, 0.4));

        // Clone model and recolor finishes
        const bag = gltf.scene.clone(true);
        const ownedMaterials: Three.Material[] = [];
        bag.traverse((child) => {
          const mesh = child as Three.Mesh;
          if (!mesh.isMesh) return;
          const mat = mesh.material as Three.MeshPhysicalMaterial;
          if (mat.name === "Lime") {
            mat.color.set("#8fc3ff");
            mat.toneMapped = false;
          }
          if (mat.name === "Shell" || mat.name === "Rib") {
            const shell = mat.clone();
            shell.color.set(selectedFinish.color);
            shell.metalness = selectedFinish.metalness;
            shell.roughness = selectedFinish.roughness;
            mesh.material = shell;
            ownedMaterials.push(shell);
          }
        });

        // Realistic ground contact shadow
        const size = new THREE.Box3().setFromObject(bag).getSize(new THREE.Vector3());
        const shadowCanvas = document.createElement("canvas");
        shadowCanvas.width = shadowCanvas.height = 256;
        const ctx = shadowCanvas.getContext("2d");
        if (ctx) {
          const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
          grad.addColorStop(0, "rgba(0,0,0,0.6)");
          grad.addColorStop(0.55, "rgba(0,0,0,0.25)");
          grad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 256, 256);
        }
        const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
        const shadowMaterial = new THREE.MeshBasicMaterial({
          map: shadowTexture,
          transparent: true,
          depthWrite: false,
        });
        const shadowGeo = new THREE.PlaneGeometry(size.x * 1.9, size.z * 2.6);
        const shadow = new THREE.Mesh(shadowGeo, shadowMaterial);
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
            VIEW_WIDTH / 2 / (slope * camera.aspect)
          );
          camera.position.set(
            0,
            TARGET_Y + Math.sin(elevation) * distance,
            Math.cos(elevation) * distance
          );
          camera.lookAt(0, TARGET_Y - 0.02, 0);
          camera.updateProjectionMatrix();
        };

        let angle = 0;
        let dragging = false;
        let lastX = 0;
        let autoSpin = true;
        let spinResumeTimeout: ReturnType<typeof setTimeout> | undefined;

        rotateActionRef.current = (delta: number) => {
          angle += delta;
          autoSpin = false;
          clearTimeout(spinResumeTimeout);
          spinResumeTimeout = setTimeout(() => {
            autoSpin = true;
          }, 3000);
          setTouched(true);
        };

        const onPointerDown = (e: PointerEvent) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          dragging = true;
          autoSpin = false;
          lastX = e.clientX;
          canvas.setPointerCapture(e.pointerId);
          clearTimeout(spinResumeTimeout);
          setTouched(true);
        };

        const onPointerMove = (e: PointerEvent) => {
          if (!dragging) return;
          const dx = e.clientX - lastX;
          lastX = e.clientX;
          angle += dx * RAD_PER_PX;
        };

        const onPointerUp = () => {
          if (!dragging) return;
          dragging = false;
          spinResumeTimeout = setTimeout(() => {
            autoSpin = true;
          }, 2500);
        };

        canvas.addEventListener("pointerdown", onPointerDown);
        canvas.addEventListener("pointermove", onPointerMove);
        canvas.addEventListener("pointerup", onPointerUp);
        canvas.addEventListener("pointercancel", onPointerUp);

        const resizeObserver = new ResizeObserver(() => {
          fit();
        });
        resizeObserver.observe(host);
        fit();

        const tick = () => {
          if (cancelled) return;
          if (autoSpin && !dragging) {
            angle += 0.005;
          }
          turntable.rotation.y = START_ROTATION + angle;
          renderer.render(scene, camera);
          animationFrameId = requestAnimationFrame(tick);
        };
        tick();

        setIsReady(true);

        cleanupStage = () => {
          cancelAnimationFrame(animationFrameId);
          clearTimeout(spinResumeTimeout);
          resizeObserver.disconnect();
          canvas.removeEventListener("pointerdown", onPointerDown);
          canvas.removeEventListener("pointermove", onPointerMove);
          canvas.removeEventListener("pointerup", onPointerUp);
          canvas.removeEventListener("pointercancel", onPointerUp);
          for (const m of ownedMaterials) m.dispose();
          shadowTexture.dispose();
          shadowMaterial.dispose();
          shadowGeo.dispose();
          environment.dispose();
          renderer.dispose();
          canvas.remove();
        };
      })
      .catch((err) => {
        console.warn("Failed to initialize 3D Model viewer, fallback to high-res poster:", err);
        if (!cancelled) setHasError(true);
      });

    return () => {
      cancelled = true;
      if (cleanupStage) cleanupStage();
    };
  }, [modelName, selectedFinish]);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center rounded-3xl border border-line bg-gradient-to-b from-[#051126] to-navy p-5 text-white shadow-hero ${className}`}
    >
      {/* 3D Canvas / Fallback Container */}
      <div className="relative h-[380px] w-full cursor-grab overflow-hidden active:cursor-grabbing sm:h-[440px]">
        {/* Visual Fallback Poster (rendered while loading or on WebGL error) */}
        {(!isReady || hasError) && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
            <div className="relative h-72 w-72 transition-transform duration-500">
              <Image
                src={selectedFinish.posterImage}
                alt={selectedFinish.name}
                fill
                sizes="(max-width: 800px) 280px, 320px"
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
            {!hasError && (
              <span className="mt-2 text-caption text-sky font-mono animate-pulse">
                Initializing 3D Interactive Model...
              </span>
            )}
          </div>
        )}

        {/* Real-time 3D Canvas Mount Point */}
        <div ref={hostRef} className="ld-modelHost" />

        {/* 360 Spin Hint & Manual Turn Controls */}
        <div className="pointer-events-auto absolute bottom-3 inset-x-4 z-20 flex items-center justify-between">
          <button
            type="button"
            onClick={() => rotateBy(-KEY_TURN)}
            className="flex size-9 items-center justify-center rounded-full bg-navy-deep/80 text-white backdrop-blur-md transition-colors hover:bg-sky hover:text-navy active:scale-95"
            aria-label="Rotate left"
          >
            <ChevronLeft className="size-5" />
          </button>

          <div
            className={`pointer-events-none flex items-center gap-1.5 rounded-full bg-navy-deep/90 px-3.5 py-1.5 text-caption-m text-sky backdrop-blur-md border border-white/10 shadow-lg transition-opacity duration-300 ${
              touched ? "opacity-75" : "opacity-100"
            }`}
          >
            <Rotate3d className="size-3.5 animate-pulse" />
            <span>Drag or swipe to rotate 360°</span>
          </div>

          <button
            type="button"
            onClick={() => rotateBy(KEY_TURN)}
            className="flex size-9 items-center justify-center rounded-full bg-navy-deep/80 text-white backdrop-blur-md transition-colors hover:bg-sky hover:text-navy active:scale-95"
            aria-label="Rotate right"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      {/* Model & Finish Controls */}
      <div className="mt-4 flex w-full flex-col gap-4 border-t border-line/40 pt-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Model switcher */}
        <div className="flex items-center gap-1.5 rounded-full bg-navy-deep p-1 border border-white/10">
          <button
            type="button"
            onClick={() => setModelName("carry-on")}
            className={`rounded-full px-4 py-1.5 text-caption font-semibold transition-all ${
              modelName === "carry-on"
                ? "bg-sky text-navy shadow-sm"
                : "text-blue-pale hover:text-white"
            }`}
          >
            Cabin 55
          </button>
          <button
            type="button"
            onClick={() => setModelName("check-in")}
            className={`rounded-full px-4 py-1.5 text-caption font-semibold transition-all ${
              modelName === "check-in"
                ? "bg-sky text-navy shadow-sm"
                : "text-blue-pale hover:text-white"
            }`}
          >
            Check-in 68
          </button>
        </div>

        {/* Finish selectors */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-caption font-medium text-blue-pale">
            <span className="size-2 rounded-full bg-sky inline-block" /> {selectedFinish.name}
          </span>
          <div className="flex items-center gap-2">
            {FINISHES.map((finish) => (
              <button
                key={finish.id}
                type="button"
                title={finish.name}
                onClick={() => setSelectedFinish(finish)}
                className={`relative flex size-7 items-center justify-center rounded-full border-2 transition-all ${
                  selectedFinish.id === finish.id
                    ? "scale-125 border-sky shadow-md ring-2 ring-sky/40"
                    : "border-white/30 hover:scale-110"
                }`}
                style={{ backgroundColor: finish.color }}
              >
                {selectedFinish.id === finish.id && <Check className="size-3 text-white drop-shadow" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
