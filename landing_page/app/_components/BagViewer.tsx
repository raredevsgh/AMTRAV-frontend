"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { Rotate3d, Check, ChevronLeft, ChevronRight, Palette, ShoppingBag, Eye, Layers, User, Camera, Sparkles } from "lucide-react";
import type * as Three from "three";
import type { GLTF } from "three/addons/loaders/GLTFLoader.js";
import { addToCart } from "@/lib/shop";
import { useRegion } from "@/lib/region";
import CartDrawer from "./CartDrawer";
import ARProjectionModal from "./ARProjectionModal";
import { createUltraRealisticDuffel } from "./Realistic3DModels";

export type LuggageTier = "essential" | "pro" | "executive" | "flagship";
export type LuggageType = "cabin" | "checkin" | "duffel" | "both";
export type Active3DModel = "carry-on" | "check-in" | "duffel";

export interface BagFinish {
  id: string;
  name: string;
  color: string;
  metalness: number;
  roughness: number;
  posterImage: string;
}

// Handcrafted Italian Suede Swatches
export const SUEDE_SWATCHES: BagFinish[] = [
  { id: "cognac-brown", name: "Cognac Brown", color: "#6e3b1b", metalness: 0.05, roughness: 0.85, posterImage: "/images/trace/duffel-cognac-brown.jpg" },
  { id: "onyx-black", name: "Onyx Black", color: "#1a1a1a", metalness: 0.05, roughness: 0.85, posterImage: "/images/trace/duffel-onyx-black.jpg" },
  { id: "midnight-navy", name: "Midnight Navy", color: "#10213b", metalness: 0.05, roughness: 0.85, posterImage: "/images/trace/duffel-midnight-navy.jpg" },
  { id: "sand-beige", name: "Sand Beige", color: "#c2b29d", metalness: 0.05, roughness: 0.85, posterImage: "/images/trace/duffel-sand-beige.jpg" },
  { id: "charcoal-grey", name: "Charcoal Grey", color: "#424449", metalness: 0.05, roughness: 0.85, posterImage: "/images/trace/duffel-charcoal-grey.jpg" },
];

// Photo 1: Essential Colors: Midnight Black, Space Grey, Navy Blue
export const ESSENTIAL_SWATCHES: BagFinish[] = [
  { id: "midnight-black", name: "Midnight Black", color: "#1a1a1c", metalness: 0.2, roughness: 0.45, posterImage: "/images/trace/range-essential.png" },
  { id: "space-grey", name: "Space Grey", color: "#7d828a", metalness: 0.35, roughness: 0.38, posterImage: "/images/trace/range-pro.png" },
  { id: "navy-blue", name: "Navy Blue", color: "#1e2d42", metalness: 0.25, roughness: 0.4, posterImage: "/images/trace/range-flagship.png" },
];

// Photo 2: Pro, Executive, Flagship Colors: Graphite Black, Midnight Blue, Titanium Silver, Pearl White, Champagne Gold, Forest Green
export const PRO_FLAGSHIP_SWATCHES: BagFinish[] = [
  { id: "graphite-black", name: "Graphite Black", color: "#2b2d2f", metalness: 0.6, roughness: 0.3, posterImage: "/images/trace/range-essential.png" },
  { id: "midnight-blue", name: "Midnight Blue", color: "#1d3356", metalness: 0.55, roughness: 0.32, posterImage: "/images/trace/range-flagship.png" },
  { id: "titanium-silver", name: "Titanium Silver", color: "#c5cbd3", metalness: 0.85, roughness: 0.22, posterImage: "/images/trace/range-pro.png" },
  { id: "pearl-white", name: "Pearl White", color: "#f4f5f7", metalness: 0.3, roughness: 0.25, posterImage: "/images/trace/range-essential.png" },
  { id: "champagne-gold", name: "Champagne Gold", color: "#d8b888", metalness: 0.75, roughness: 0.28, posterImage: "/images/trace/range-executive.png" },
  { id: "forest-green", name: "Forest Green", color: "#3e533e", metalness: 0.5, roughness: 0.35, posterImage: "/images/trace/range-flagship.png" },
];

// Curated luxury accents for the custom color palette
export const LUXURY_PALETTE_PRESETS = [
  { name: "Bordeaux Burgundy", hex: "#581825" },
  { name: "British Racing Green", hex: "#1b3b2b" },
  { name: "Desert Dune Gold", hex: "#c2a87d" },
  { name: "Royal Amethyst", hex: "#3b1d4a" },
  { name: "Monaco Crimson", hex: "#9c2424" },
  { name: "Arctic Ice Blue", hex: "#8faecc" },
  { name: "Nordic Slate", hex: "#3a4856" },
  { name: "Rose Gold Mirage", hex: "#c99385" },
];

const MODELS: Record<"carry-on" | "check-in", string> = {
  "carry-on": "/models/carry-on.glb",
  "check-in": "/models/check-in.glb",
};

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
  ]).then(async ([THREE, { GLTFLoader }, { MeshoptDecoder }, { RoomEnvironment }]) => {
    if (MeshoptDecoder?.ready) {
      await MeshoptDecoder.ready;
    }
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
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

const modelCache = new Map<Active3DModel, Promise<any>>();
function getModel(name: Active3DModel): Promise<any> {
  if (name === "duffel") {
    return getKit().then(({ THREE }) => {
      const duffel = createUltraRealisticDuffel(THREE, "#6e3b1b");
      return { scene: duffel.group } as any;
    });
  }
  let model = modelCache.get(name);
  if (!model) {
    model = getKit().then(({ load }) => load(MODELS[name as "carry-on" | "check-in"]));
    modelCache.set(name, model);
    model.catch(() => modelCache.delete(name));
  }
  return model;
}

export default function BagViewer({
  defaultTier = "essential",
  defaultLuggageType = "cabin",
  className = "",
}: {
  defaultTier?: LuggageTier;
  defaultLuggageType?: LuggageType;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const { formatPrice, isEcommerce } = useRegion();

  // Tier (Essential, Pro, Executive, Flagship)
  const [selectedTier, setSelectedTier] = useState<LuggageTier>(defaultTier);

  // Luggage Type: Cabin, Check-In, or Both
  const [selectedLuggageType, setSelectedLuggageType] = useState<LuggageType>(defaultLuggageType);

  // Which model is currently actively rendered in 3D (carry-on or check-in)
  const [activeModel, setActiveModel] = useState<Active3DModel>(
    defaultLuggageType === "checkin" ? "check-in" : "carry-on"
  );

  // Active swatches based on collection or duffel bag
  const availableSwatches = useMemo(() => {
    if (selectedLuggageType === "duffel") return SUEDE_SWATCHES;
    return selectedTier === "essential" ? ESSENTIAL_SWATCHES : PRO_FLAGSHIP_SWATCHES;
  }, [selectedTier, selectedLuggageType]);

  // Selected Finish / Color
  const [selectedFinish, setSelectedFinish] = useState<BagFinish>(availableSwatches[0]);
  const [isCustomColor, setIsCustomColor] = useState(false);
  const [customHex, setCustomHex] = useState("#c2a87d");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [studioTheme, setStudioTheme] = useState<"light" | "dark">("light");
  const isLight = studioTheme === "light";

  // Update selected finish if tier or luggage type changes
  useEffect(() => {
    if (!isCustomColor) {
      setSelectedFinish(availableSwatches[0]);
    }
  }, [selectedTier, availableSwatches, isCustomColor]);

  // When luggage type changes:
  const handleLuggageTypeSelect = (type: LuggageType) => {
    setSelectedLuggageType(type);
    if (type === "cabin") setActiveModel("carry-on");
    else if (type === "checkin") setActiveModel("check-in");
    else if (type === "duffel") setActiveModel("duffel");
    // If 'both', keep the currently viewed model
  };

  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [touched, setTouched] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);
  const [showHumanScale, setShowHumanScale] = useState(false);
  const [arRoomOpen, setArRoomOpen] = useState(false);

  const rotateActionRef = useRef<((delta: number) => void) | null>(null);
  const shellMaterialsRef = useRef<Three.MeshPhysicalMaterial[]>([]);

  const rotateBy = useCallback((deltaRadians: number) => {
    if (rotateActionRef.current) {
      rotateActionRef.current(deltaRadians);
    }
  }, []);

  // Compute active color and material properties
  const activeColor = isCustomColor ? customHex : selectedFinish.color;
  const activeMetalness = selectedLuggageType === "duffel" ? 0.04 : selectedTier === "essential" ? 0.25 : 0.7;
  const activeRoughness = selectedLuggageType === "duffel" ? 0.86 : selectedTier === "essential" ? 0.45 : 0.28;

  // Real-time material update without GLTF reloading
  useEffect(() => {
    if (shellMaterialsRef.current.length > 0) {
      shellMaterialsRef.current.forEach((mat) => {
        mat.color.set(activeColor);
        mat.metalness = activeMetalness;
        mat.roughness = activeRoughness;
        mat.needsUpdate = true;
      });
    }
  }, [activeColor, activeMetalness, activeRoughness]);

  // 3D Scene Initialization
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let animationFrameId = 0;
    let cleanupStage: (() => void) | null = null;

    setIsReady(false);
    setHasError(false);

    Promise.all([getKit(), getModel(activeModel)])
      .then(([kit, gltf]) => {
        if (cancelled) return;
        const { THREE, RoomEnvironment } = kit;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x000000, 0);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;

        const canvas = renderer.domElement;
        canvas.style.display = "block";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.cursor = "grab";
        canvas.style.touchAction = "pan-y";
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
        const ownedMaterials: Three.MeshPhysicalMaterial[] = [];
        bag.traverse((child: any) => {
          const mesh = child as Three.Mesh;
          if (!mesh.isMesh) return;
          const mat = mesh.material as Three.MeshPhysicalMaterial;
          if (mat.name === "Lime") {
            mat.color.set("#8fc3ff");
            mat.toneMapped = false;
          }
          if (mat.name === "Shell" || mat.name === "Rib") {
            const shell = mat.clone();
            shell.color.set(activeColor);
            shell.metalness = activeMetalness;
            shell.roughness = activeRoughness;
            mesh.material = shell;
            ownedMaterials.push(shell);
          }
        });
        shellMaterialsRef.current = ownedMaterials;

        // Ground shadow
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
        let pitchAngle = 0;
        let dragging = false;
        let lastX = 0;
        let lastY = 0;
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
          lastY = e.clientY;
          canvas.setPointerCapture(e.pointerId);
          canvas.style.cursor = "grabbing";
          clearTimeout(spinResumeTimeout);
          setTouched(true);
        };

        const onPointerMove = (e: PointerEvent) => {
          if (!dragging) return;
          const dx = e.clientX - lastX;
          const dy = e.clientY - lastY;
          lastX = e.clientX;
          lastY = e.clientY;
          angle += dx * RAD_PER_PX;
          // Pitch: allows examining top handle (+85°) and wheels underneath (-85°)
          pitchAngle = Math.max(-1.5, Math.min(1.5, pitchAngle + dy * RAD_PER_PX));
        };

        const onPointerUp = () => {
          if (!dragging) return;
          dragging = false;
          canvas.style.cursor = "grab";
          spinResumeTimeout = setTimeout(() => {
            autoSpin = true;
          }, 2500);
        };

        canvas.addEventListener("pointerdown", onPointerDown);
        canvas.addEventListener("pointermove", onPointerMove);
        canvas.addEventListener("pointerup", onPointerUp);
        canvas.addEventListener("pointercancel", onPointerUp);

        fit();
        const ro = new ResizeObserver(fit);
        ro.observe(host);

        let lastTime = performance.now();
        const tick = (now: number) => {
          const dt = Math.min((now - lastTime) / 1000, 0.1);
          lastTime = now;
          if (autoSpin) {
            angle += 0.25 * dt;
          }
          turntable.rotation.y = angle;
          turntable.rotation.x = pitchAngle;
          renderer.render(scene, camera);
          animationFrameId = requestAnimationFrame(tick);
        };
        animationFrameId = requestAnimationFrame(tick);

        setIsReady(true);

        cleanupStage = () => {
          cancelAnimationFrame(animationFrameId);
          clearTimeout(spinResumeTimeout);
          ro.disconnect();
          canvas.removeEventListener("pointerdown", onPointerDown);
          canvas.removeEventListener("pointermove", onPointerMove);
          canvas.removeEventListener("pointerup", onPointerUp);
          canvas.removeEventListener("pointercancel", onPointerUp);
          renderer.dispose();
          environment.dispose();
          shadowTexture.dispose();
          shadowGeo.dispose();
          shadowMaterial.dispose();
          ownedMaterials.forEach((m) => m.dispose());
          host.innerHTML = "";
          shellMaterialsRef.current = [];
        };
      })
      .catch((err) => {
        console.error("Three.js Model load failed:", err);
        if (!cancelled) setHasError(true);
      });

    return () => {
      cancelled = true;
      if (cleanupStage) cleanupStage();
    };
  }, [activeModel]);

  // Pricing calculation
  const basePriceMinor = useMemo(() => {
    if (selectedLuggageType === "duffel") {
      return 44400; // 444 € / $480
    }
    const tierMultiplier: Record<LuggageTier, number> = {
      essential: 32900,
      pro: 38900,
      executive: 44900,
      flagship: 49900,
    };
    const sizeMultiplier: Record<LuggageType, number> = {
      cabin: 1.0,
      checkin: 1.25,
      both: 2.0, // Bundle pricing advantage
      duffel: 1.0,
    };
    return Math.round(tierMultiplier[selectedTier] * sizeMultiplier[selectedLuggageType]);
  }, [selectedTier, selectedLuggageType]);

  // Add to cart handler
  const handleReserve = () => {
    if (selectedLuggageType === "duffel") {
      const colorName = isCustomColor ? `Custom Suede` : selectedFinish.name;
      const cleanHex = activeColor.replace("#", "");
      const compoundSku = `duffel-side-bag__${encodeURIComponent(colorName)}__${cleanHex}`;
      addToCart(compoundSku, 1);
    } else {
      const sizeKey = selectedLuggageType === "both" ? "the-pair" : selectedLuggageType === "checkin" ? "checkin-68" : "cabin-55";
      const colorName = isCustomColor ? `Custom Color` : selectedFinish.name;
      const cleanHex = activeColor.replace("#", "");
      const compoundSku = `${selectedTier}-${sizeKey}__${encodeURIComponent(colorName)}__${cleanHex}`;
      addToCart(compoundSku, 1);
    }
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
    setCartOpen(true);
  };

  return (
    <div
      className={`relative flex flex-col gap-4 rounded-3xl p-4 transition-colors duration-300 xl:p-6 ${
        isLight
          ? "border border-divider bg-white text-navy shadow-card"
          : "border border-white/10 bg-navy text-white shadow-2xl"
      } ${className}`}
    >
      {/* Top Header: Collection & Luggage Type Selectors + Real-World Simulation Toggles */}
      <div
        className={`flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 border-b pb-4 ${
          isLight ? "border-divider" : "border-white/10"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          {/* Collection / Tier Tabs */}
          <div>
            <span
              className={`block text-[10px] sm:text-[11px] font-mono uppercase tracking-wider mb-1 ${
                isLight ? "text-brand" : "text-sky"
              }`}
            >
              Luggage Collection
            </span>
            <div
              className={`flex items-center gap-1 rounded-full p-1 border overflow-x-auto ${
                isLight ? "border-divider bg-surface" : "border-white/10 bg-navy-deep"
              }`}
            >
              {(["essential", "pro", "executive", "flagship"] as LuggageTier[]).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedTier(tier)}
                  className={`rounded-full px-2.5 sm:px-3 py-1 text-[10.5px] sm:text-caption-m font-semibold capitalize transition-all ${
                    selectedTier === tier
                      ? isLight
                        ? "bg-navy text-white shadow-xs"
                        : "bg-sky text-navy shadow-sm"
                      : isLight
                      ? "text-mid hover:text-navy"
                      : "text-blue-pale hover:text-white"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Luggage Type: Cabin, Check-In, Suede Duffel, Both */}
          <div>
            <span
              className={`block text-[10px] sm:text-[11px] font-mono uppercase tracking-wider mb-1 ${
                isLight ? "text-brand" : "text-sky"
              }`}
            >
              Luggage Type
            </span>
            <div
              className={`flex items-center gap-1 rounded-full p-1 border overflow-x-auto ${
                isLight ? "border-divider bg-surface" : "border-white/10 bg-navy-deep"
              }`}
            >
              <button
                type="button"
                onClick={() => handleLuggageTypeSelect("cabin")}
                className={`rounded-full px-2.5 sm:px-3 py-1 text-[10.5px] sm:text-caption-m font-semibold transition-all ${
                  selectedLuggageType === "cabin"
                    ? isLight
                      ? "bg-navy text-white shadow-xs"
                      : "bg-sky text-navy shadow-sm"
                    : isLight
                    ? "text-mid hover:text-navy"
                    : "text-blue-pale hover:text-white"
                }`}
              >
                Cabin 55
              </button>
              <button
                type="button"
                onClick={() => handleLuggageTypeSelect("checkin")}
                className={`rounded-full px-2.5 sm:px-3 py-1 text-[10.5px] sm:text-caption-m font-semibold transition-all ${
                  selectedLuggageType === "checkin"
                    ? isLight
                      ? "bg-navy text-white shadow-xs"
                      : "bg-sky text-navy shadow-sm"
                    : isLight
                    ? "text-mid hover:text-navy"
                    : "text-blue-pale hover:text-white"
                }`}
              >
                Check-In 68
              </button>
              <button
                type="button"
                onClick={() => handleLuggageTypeSelect("duffel")}
                className={`rounded-full px-2.5 sm:px-3 py-1 text-[10.5px] sm:text-caption-m font-semibold transition-all ${
                  selectedLuggageType === "duffel"
                    ? isLight
                      ? "bg-navy text-white shadow-xs"
                      : "bg-sky text-navy shadow-sm"
                    : isLight
                    ? "text-mid hover:text-navy"
                    : "text-blue-pale hover:text-white"
                }`}
              >
                Suede Duffel
              </button>
              <button
                type="button"
                onClick={() => handleLuggageTypeSelect("both")}
                className={`rounded-full px-2.5 sm:px-3 py-1 text-[10.5px] sm:text-caption-m font-semibold transition-all ${
                  selectedLuggageType === "both"
                    ? isLight
                      ? "bg-navy text-white shadow-xs"
                      : "bg-sky text-navy shadow-sm"
                    : isLight
                    ? "text-mid hover:text-navy"
                    : "text-blue-pale hover:text-white"
                }`}
              >
                Both (Duo)
              </button>
            </div>
          </div>
        </div>

        {/* Right: Human Scale, WebAR Room Projection & Studio Switcher */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* Traveller Size Guide */}
          <div className="flex flex-col items-start">
            <span
              className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${
                isLight ? "text-mid" : "text-blue-pale"
              }`}
            >
              Size Guide
            </span>
            <button
              type="button"
              onClick={() => setShowHumanScale(!showHumanScale)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold border transition-all ${
                showHumanScale
                  ? "bg-brand text-white border-brand shadow-xs"
                  : isLight
                  ? "border-divider bg-surface text-navy hover:border-mid"
                  : "border-white/10 bg-navy-deep text-white hover:border-white/30"
              }`}
              title="Compare bag size against real traveller height (178 cm)"
            >
              <User className="size-3.5" />
              <span>Traveller Height</span>
            </button>
          </div>

          {/* WebAR Camera Room Projection */}
          <div className="flex flex-col items-start">
            <span
              className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${
                isLight ? "text-mid" : "text-blue-pale"
              }`}
            >
              Room AR
            </span>
            <button
              type="button"
              onClick={() => setArRoomOpen(true)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold border transition-all ${
                isLight
                  ? "border-divider bg-surface text-navy hover:border-navy hover:bg-navy hover:text-white shadow-xs"
                  : "border-sky/40 bg-sky/15 text-sky hover:bg-sky hover:text-navy shadow-xs"
              }`}
              title="Project 3D suitcase in your room via Camera (WebAR)"
            >
              <Camera className="size-3.5" />
              <span>In Room</span>
            </button>
          </div>

          {/* Studio View */}
          <div className="flex flex-col items-start">
            <span
              className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${
                isLight ? "text-mid" : "text-blue-pale"
              }`}
            >
              Studio
            </span>
            <div
              className={`flex items-center gap-0.5 rounded-full p-1 border ${
                isLight ? "border-divider bg-surface" : "border-white/10 bg-navy-deep"
              }`}
            >
              <button
                type="button"
                onClick={() => setStudioTheme("light")}
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-all ${
                  isLight ? "bg-white text-navy shadow-xs" : "text-blue-pale hover:text-white"
                }`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setStudioTheme("dark")}
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-all ${
                  !isLight ? "bg-navy-deep text-white shadow-xs" : "text-mid hover:text-navy"
                }`}
              >
                Dark
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Canvas / Poster Container */}
      <div
        className={`relative h-[380px] w-full cursor-grab overflow-hidden rounded-2xl active:cursor-grabbing sm:h-[440px] transition-colors duration-300 ${
          isLight
            ? "border border-divider/60 bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]"
            : "border border-white/10 bg-radial from-navy-deep/80 to-navy"
        }`}
      >
        {/* Visual Fallback Poster */}
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
              <span
                className={`mt-2 text-caption font-mono animate-pulse ${
                  isLight ? "text-navy" : "text-sky"
                }`}
              >
                Initializing 3D Interactive Model...
              </span>
            )}
          </div>
        )}

        {/* Real-time 3D Canvas Mount Point */}
        <div ref={hostRef} className="absolute inset-0 w-full h-full" />

        {/* When 'Both' is selected, toggle which bag is in active 3D view */}
        {selectedLuggageType === "both" && (
          <div
            className={`absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] backdrop-blur-md shadow-md border ${
              isLight
                ? "border-divider/60 bg-white/90 text-navy"
                : "border-white/10 bg-navy-deep/90 text-white"
            }`}
          >
            <Layers className={`size-3 ${isLight ? "text-brand" : "text-sky"}`} />
            <span className={`mr-1 ${isLight ? "text-mid" : "text-light-white"}`}>3D View:</span>
            <button
              type="button"
              onClick={() => setActiveModel("carry-on")}
              className={`rounded-full px-2 py-0.5 font-semibold transition-all ${
                activeModel === "carry-on"
                  ? isLight
                    ? "bg-navy text-white"
                    : "bg-sky text-navy"
                  : isLight
                  ? "text-mid hover:text-navy"
                  : "text-mid hover:text-white"
              }`}
            >
              Cabin
            </button>
            <button
              type="button"
              onClick={() => setActiveModel("check-in")}
              className={`rounded-full px-2 py-0.5 font-semibold transition-all ${
                activeModel === "check-in"
                  ? isLight
                    ? "bg-navy text-white"
                    : "bg-sky text-navy"
                  : isLight
                  ? "text-mid hover:text-navy"
                  : "text-mid hover:text-white"
              }`}
            >
              Check-In
            </button>
          </div>
        )}

        {/* 360 Spin Hint & Manual Turn Controls */}
        <div className="pointer-events-auto absolute bottom-3 inset-x-4 z-20 flex items-center justify-between">
          <button
            type="button"
            onClick={() => rotateBy(-KEY_TURN)}
            className={`flex size-9 items-center justify-center rounded-full backdrop-blur-md border transition-colors active:scale-95 ${
              isLight
                ? "border-divider/60 bg-white/90 text-navy shadow-sm hover:bg-navy hover:text-white"
                : "border-white/10 bg-navy-deep/80 text-white hover:bg-sky hover:text-navy"
            }`}
            aria-label="Rotate left"
          >
            <ChevronLeft className="size-5" />
          </button>

          <div
            className={`pointer-events-none flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-caption-m backdrop-blur-md border shadow-lg transition-opacity duration-300 ${
              isLight
                ? "border-divider/60 bg-white/90 text-navy"
                : "border-white/10 bg-navy-deep/90 text-sky"
            } ${touched ? "opacity-75" : "opacity-100"}`}
          >
            <Rotate3d className="size-3.5 animate-pulse" />
            <span className="hidden sm:inline">Drag or swipe to rotate 360°</span>
            <span className="sm:hidden">Swipe to rotate 360°</span>
          </div>

          <button
            type="button"
            onClick={() => rotateBy(KEY_TURN)}
            className={`flex size-9 items-center justify-center rounded-full backdrop-blur-md border transition-colors active:scale-95 ${
              isLight
                ? "border-divider/60 bg-white/90 text-navy shadow-sm hover:bg-navy hover:text-white"
                : "border-white/10 bg-navy-deep/80 text-white hover:bg-sky hover:text-navy"
            }`}
            aria-label="Rotate right"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        {/* Human Scale Anthropometric Reality Anchor Graphic Overlay */}
        {showHumanScale && (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-end justify-between p-3 sm:p-5 overflow-hidden bg-black/5 backdrop-blur-[1px] animate-in fade-in duration-200">
            {/* Left: Adult Human Silhouette & Height Scale Markers */}
            <div className="relative h-full flex items-end">
              <div className="relative h-[88%] w-20 sm:w-28 opacity-85 transition-opacity">
                <svg viewBox="0 0 100 240" fill="none" className="size-full">
                  <circle cx="50" cy="22" r="14" fill={isLight ? "#0B1B3D" : "#8FAECC"} opacity="0.45" />
                  <path
                    d="M32 46 C32 40, 68 40, 68 46 L76 100 L70 160 L65 235 L53 235 L50 165 L47 235 L35 235 L30 160 L24 100 Z"
                    fill={isLight ? "#0B1B3D" : "#8FAECC"}
                    opacity="0.35"
                  />
                  <circle cx="76" cy="98" r="4" fill={isLight ? "#2A4BD7" : "#38BDF8"} opacity="0.85" />
                </svg>

                {/* 178 cm Traveller Label */}
                <div className="absolute top-0 left-full ml-1 whitespace-nowrap">
                  <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs ${isLight ? "bg-white/95 text-navy border border-divider" : "bg-black/70 text-white border border-white/10"}`}>
                    178 cm (5'10")
                  </span>
                </div>

                {/* 105 cm Ergonomic Handle Label */}
                <div className="absolute top-[41%] left-full ml-1 whitespace-nowrap">
                  <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand text-white shadow-xs">
                    105 cm Handle
                  </span>
                </div>

                {/* Bag Height marker */}
                <div className="absolute bottom-[28%] left-full ml-1 whitespace-nowrap">
                  <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border shadow-xs ${isLight ? "bg-white text-navy border-brand" : "bg-navy-deep text-sky border-sky"}`}>
                    {activeModel === "carry-on" ? "55 cm Cabin" : activeModel === "duffel" ? "32L Suede Duffel" : "68 cm Check-In"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: IATA Overhead Bin Clearance & Specs Badge */}
            <div className="absolute top-2.5 right-2.5 max-w-[155px] sm:relative sm:top-auto sm:right-auto sm:max-w-[220px] flex flex-col gap-2">
              <div className={`rounded-xl p-2 sm:p-2.5 border shadow-lg backdrop-blur-md ${isLight ? "bg-white/95 border-divider text-navy" : "bg-navy-deep/95 border-white/10 text-white"}`}>
                <div className="flex items-center gap-1.5 text-brand font-bold text-[9px] sm:text-[9.5px] uppercase font-mono mb-0.5 sm:mb-1">
                  <Check className="size-2.5 sm:size-3 text-emerald-600 shrink-0" />
                  <span className="truncate">{activeModel === "carry-on" ? "Overhead Bin Compliant" : activeModel === "duffel" ? "Cabin & Underseat Carry" : "Maximum Checked Standard"}</span>
                </div>
                <p className="text-[9.5px] sm:text-[10.5px] leading-tight text-mid">
                  {activeModel === "carry-on"
                    ? "55 × 40 × 23 cm complies with IATA guidelines for global airlines (Lufthansa, British Airways, Air France, Delta & United)."
                    : activeModel === "duffel"
                    ? "Handcrafted Italian suede side bag designed to slot over luggage telescopic handle and fit under airline seats."
                    : "68 × 45 × 28 cm full week capacity with 65L packing volume and built-in drop impact sensors."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Color Selection Bar & Custom Palette Tool */}
      <div
        className={`mt-2 flex flex-col gap-3 border-t pt-4 ${
          isLight ? "border-divider" : "border-line/40"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Active Color Info */}
          <div className="flex items-center gap-2">
            <span
              className={`size-4 rounded-full border shadow-sm ${
                isLight ? "border-navy/30" : "border-white/40"
              }`}
              style={{ backgroundColor: activeColor }}
            />
            <span className={`text-small font-semibold ${isLight ? "text-navy" : "text-white"}`}>
              {isCustomColor ? `Custom Finish (${activeColor.toUpperCase()})` : selectedFinish.name}
            </span>
            <span
              className={`text-[11px] font-mono capitalize ${
                isLight ? "text-mid" : "text-blue-pale/80"
              }`}
            >
              · {selectedTier} Finish
            </span>
          </div>

          {/* Color Swatch Dots + Custom Palette Trigger */}
          <div className="flex items-center gap-2">
            {/* Primary Swatches (Photo 1 for Essential, Photo 2 for Pro/Executive/Flagship) */}
            {availableSwatches.map((finish) => {
              const isSelected = !isCustomColor && selectedFinish.id === finish.id;
              const isLightColor = finish.color === "#f4f5f7" || finish.color === "#c5cbd3";
              return (
                <button
                  key={finish.id}
                  type="button"
                  title={finish.name}
                  onClick={() => {
                    setIsCustomColor(false);
                    setSelectedFinish(finish);
                    setPaletteOpen(false);
                  }}
                  className={`relative flex size-7 items-center justify-center rounded-full border-2 transition-all ${
                    isSelected
                      ? isLight
                        ? "scale-125 border-navy shadow-md ring-2 ring-navy/20"
                        : "scale-125 border-sky shadow-md ring-2 ring-sky/40"
                      : isLight
                      ? "border-divider hover:scale-110"
                      : "border-white/30 hover:scale-110"
                  }`}
                  style={{ backgroundColor: finish.color }}
                >
                  {isSelected && (
                    <Check
                      className={`size-3 drop-shadow ${
                        isLightColor ? "text-navy" : "text-white"
                      }`}
                    />
                  )}
                </button>
              );
            })}

            {/* Custom Color Palette Button */}
            <button
              type="button"
              onClick={() => setPaletteOpen(!paletteOpen)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition-all ${
                isCustomColor || paletteOpen
                  ? isLight
                    ? "border-navy bg-navy text-white shadow-xs"
                    : "border-sky bg-sky text-navy shadow-sm"
                  : isLight
                  ? "border-divider bg-surface text-navy hover:border-mid"
                  : "border-white/20 bg-navy-deep text-blue-pale hover:border-white/40 hover:text-white"
              }`}
            >
              <Palette className="size-3.5" />
              <span>Custom Palette</span>
            </button>
          </div>
        </div>

        {/* Expandable Custom Color Palette Studio */}
        {paletteOpen && (
          <div
            className={`mt-1 rounded-2xl border p-4 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 ${
              isLight
                ? "border-divider bg-surface/90 text-navy shadow-md"
                : "border-sky/30 bg-navy-deep/95 text-white"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4
                  className={`text-caption font-bold uppercase tracking-wider ${
                    isLight ? "text-brand" : "text-sky"
                  }`}
                >
                  Bespoke Color Configurator
                </h4>
                <p className={`text-[12px] ${isLight ? "text-mid" : "text-light-white"}`}>
                  Pick any custom shade for the aerospace shell. Real-time 3D updates live.
                </p>
              </div>

              {/* Native HTML5 Color Wheel Picker & Hex Input */}
              <div className="flex items-center gap-3">
                <label
                  className={`relative flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-1.5 text-caption font-mono ${
                    isLight
                      ? "border-divider bg-white text-navy hover:border-navy"
                      : "border-white/20 bg-navy text-white hover:border-sky"
                  }`}
                >
                  <span
                    className="size-4 rounded-full border border-black/20 shadow-xs"
                    style={{ backgroundColor: customHex }}
                  />
                  <span>{customHex.toUpperCase()}</span>
                  <input
                    type="color"
                    value={customHex}
                    onChange={(e) => {
                      setCustomHex(e.target.value);
                      setIsCustomColor(true);
                    }}
                    className="absolute inset-0 size-full cursor-pointer opacity-0"
                  />
                </label>
              </div>
            </div>

            {/* Curated Luxury Preset Accents */}
            <div
              className={`mt-3 flex flex-wrap items-center gap-2 border-t pt-3 ${
                isLight ? "border-divider" : "border-white/10"
              }`}
            >
              <span
                className={`text-[11px] font-mono mr-1 ${
                  isLight ? "text-mid" : "text-blue-pale"
                }`}
              >
                Curated Shades:
              </span>
              {LUXURY_PALETTE_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  title={p.name}
                  onClick={() => {
                    setCustomHex(p.hex);
                    setIsCustomColor(true);
                  }}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-all ${
                    isCustomColor && customHex === p.hex
                      ? isLight
                        ? "border-navy bg-navy/10 font-bold text-navy shadow-xs"
                        : "border-sky bg-white/10 font-semibold text-white"
                      : isLight
                      ? "border-divider text-mid hover:border-navy/40 hover:text-navy"
                      : "border-white/10 text-light-white hover:border-white/30 hover:text-white"
                  }`}
                >
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: p.hex }} />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar: Specs Summary, Price & Reserve CTA */}
      <div
        className={`mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t pt-4 ${
          isLight ? "border-divider" : "border-white/10"
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-h3 font-bold ${isLight ? "text-navy" : "text-white"}`}>
              {formatPrice(basePriceMinor)}
            </span>
            <span className={`text-[11px] ${isLight ? "text-mid" : "text-blue-pale"}`}>
              incl. VAT & global shipping
            </span>
          </div>
          <span className={`text-[12px] ${isLight ? "text-mid" : "text-light-white"}`}>
            {selectedLuggageType === "duffel"
              ? "ITALIAN SUEDE & ALUMINIUM · Suede Duffel Side Bag (32L) · Lifetime Guarantee"
              : `${selectedTier.toUpperCase()} · ${
                  selectedLuggageType === "both"
                    ? "Cabin 55 + Check-In 68 Duo Set (100L)"
                    : selectedLuggageType === "checkin"
                    ? "Check-In 68 (65L)"
                    : "Cabin 55 (35L)"
                } · Lifetime Guarantee`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {addedNotice && (
            <span className="text-caption font-semibold text-success animate-in fade-in">
              ✓ Added to Cart!
            </span>
          )}
          <button
            type="button"
            onClick={handleReserve}
            className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-small font-bold shadow-md active:scale-95 transition-all ${
              isLight
                ? "bg-navy text-white hover:bg-navy-deep"
                : "bg-sky text-navy hover:bg-white"
            }`}
          >
            <ShoppingBag className="size-4" />
            <span>
              {isEcommerce
                ? selectedLuggageType === "duffel"
                  ? "Reserve Suede Duffel"
                  : "Reserve Luggage"
                : "Inquire Now"}
            </span>
          </button>
        </div>
      </div>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Real-World WebAR Camera Projection Modal */}
      <ARProjectionModal
        isOpen={arRoomOpen}
        onClose={() => setArRoomOpen(false)}
        activeModel={activeModel}
        colorHex={activeColor}
        metalness={selectedFinish.metalness}
        roughness={selectedFinish.roughness}
      />
    </div>
  );
}
