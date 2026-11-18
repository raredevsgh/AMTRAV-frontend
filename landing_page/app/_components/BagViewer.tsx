"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Rotate3D, Sparkles } from "lucide-react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export type BagModelName = "carry-on" | "check-in";

export interface BagFinish {
  name: string;
  color: string;
  metalness: number;
  roughness: number;
}

const FINISHES: BagFinish[] = [
  { name: "Navy Polycarbonate", color: "#001f4d", metalness: 0.1, roughness: 0.35 },
  { name: "Graphite Matte", color: "#22252a", metalness: 0.15, roughness: 0.5 },
  { name: "Brushed Aluminum", color: "#b0b7c3", metalness: 0.85, roughness: 0.2 },
  { name: "Executive Obsidian", color: "#0d0f12", metalness: 0.3, roughness: 0.15 },
];

const MODELS: Record<BagModelName, string> = {
  "carry-on": "/models/carry-on.glb",
  "check-in": "/models/check-in.glb",
};

function checkWebGL(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export default function BagViewer({
  defaultModel = "carry-on",
  className = "",
}: {
  defaultModel?: BagModelName;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [modelName, setModelName] = useState<BagModelName>(defaultModel);
  const [selectedFinish, setSelectedFinish] = useState<BagFinish>(FINISHES[0]);
  const [loading, setLoading] = useState(true);
  const [hasWebGL] = useState(checkWebGL);
  const rotationYRef = useRef<number>((-30 * Math.PI) / 180);
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const sceneGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!hasWebGL) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    let isDisposed = false;
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.45, 1.85);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment()).texture;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(2, 3, 2);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8fc3ff, 0.8);
    fillLight.position.set(-2, 1, -1);
    scene.add(fillLight);

    const group = new THREE.Group();
    scene.add(group);
    sceneGroupRef.current = group;

    const loader = new GLTFLoader();

    loader.load(
      MODELS[modelName],
      (gltf) => {
        if (isDisposed) return;
        group.clear();

        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (
              mesh.material &&
              (mesh.name.toLowerCase().includes("shell") ||
                mesh.name.toLowerCase().includes("body") ||
                mesh.name.toLowerCase().includes("case"))
            ) {
              const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
              mat.color = new THREE.Color(selectedFinish.color);
              mat.metalness = selectedFinish.metalness;
              mat.roughness = selectedFinish.roughness;
              mesh.material = mat;
            }
          }
        });

        group.add(model);
        setLoading(false);
      },
      undefined,
      (err) => {
        console.warn("Could not load 3D GLB model", err);
        if (!isDisposed) setLoading(false);
      },
    );

    let animationFrameId: number;
    let autoSpin = true;
    let autoSpinTimeout: ReturnType<typeof setTimeout> | undefined;

    const animate = () => {
      if (isDisposed) return;
      animationFrameId = requestAnimationFrame(animate);

      if (group) {
        if (autoSpin && !isDraggingRef.current) {
          rotationYRef.current += 0.004;
        }
        group.rotation.y = rotationYRef.current;
      }
      renderer.render(scene, camera);
    };
    animate();

    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      lastXRef.current = e.clientX;
      autoSpin = false;
      clearTimeout(autoSpinTimeout);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - lastXRef.current;
      lastXRef.current = e.clientX;
      rotationYRef.current += (deltaX / 180) * Math.PI;
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
      autoSpinTimeout = setTimeout(() => {
        autoSpin = true;
      }, 3000);
    };

    const dom = renderer.domElement;
    dom.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const onResize = () => {
      if (!container || isDisposed) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      clearTimeout(autoSpinTimeout);
      dom.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", onResize);
      pmremGenerator.dispose();
      renderer.dispose();
    };
  }, [modelName, selectedFinish, hasWebGL]);

  return (
    <div
      className={`relative flex flex-col items-center rounded-3xl border border-line bg-gradient-to-b from-navy-deep to-navy p-5 text-white shadow-hero ${className}`}
    >
      {/* 3D Canvas Container */}
      <div className="relative h-[380px] w-full cursor-grab overflow-hidden active:cursor-grabbing sm:h-[440px]">
        {loading && hasWebGL && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-navy-deep/60 backdrop-blur-sm">
            <div className="size-8 animate-spin rounded-full border-2 border-sky border-t-transparent" />
            <span className="text-caption text-blue-pale">Loading 3D Smart Luggage...</span>
          </div>
        )}

        {!hasWebGL && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <Image
              src="/images/trace/range-flagship.png"
              alt="AMORTRAV Luggage"
              width={280}
              height={280}
              className="object-contain"
            />
            <p className="text-caption text-mid">
              WebGL is disabled in your browser. Showing static product preview.
            </p>
          </div>
        )}

        <div ref={containerRef} className="size-full" />

        {/* Drag Hint */}
        <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-navy-deep/80 px-3 py-1.5 text-caption-m text-sky backdrop-blur-md">
          <Rotate3D className="size-3.5 animate-pulse" />
          <span>Drag or swipe to rotate 360°</span>
        </div>
      </div>

      {/* Model & Finish Controls */}
      <div className="mt-4 flex w-full flex-col gap-4 border-t border-line/40 pt-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Model switcher */}
        <div className="flex items-center gap-1.5 rounded-full bg-navy-deep p-1">
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setModelName("carry-on");
            }}
            className={`rounded-full px-3.5 py-1.5 text-caption font-medium transition-all ${
              modelName === "carry-on"
                ? "bg-sky text-navy shadow-sm"
                : "text-blue-pale hover:text-white"
            }`}
          >
            Cabin 55
          </button>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setModelName("check-in");
            }}
            className={`rounded-full px-3.5 py-1.5 text-caption font-medium transition-all ${
              modelName === "check-in"
                ? "bg-sky text-navy shadow-sm"
                : "text-blue-pale hover:text-white"
            }`}
          >
            Check-in 68
          </button>
        </div>

        {/* Finish selectors */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-caption-m text-blue-pale">
            <Sparkles className="size-3 text-sky" /> Finish:
          </span>
          <div className="flex items-center gap-1.5">
            {FINISHES.map((finish) => (
              <button
                key={finish.name}
                type="button"
                title={finish.name}
                onClick={() => setSelectedFinish(finish)}
                className={`size-6 rounded-full border-2 transition-all ${
                  selectedFinish.name === finish.name
                    ? "scale-110 border-sky ring-2 ring-sky/30"
                    : "border-white/30 hover:scale-105"
                }`}
                style={{ backgroundColor: finish.color }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
