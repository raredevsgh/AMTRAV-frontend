"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Rotate3D, Sparkles, Check, ChevronLeft, ChevronRight } from "lucide-react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

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
  const [modelReady, setModelReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const rotationRef = useRef<number>(-0.5);
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const groupRef = useRef<THREE.Group | null>(null);

  const rotateBy = useCallback((deltaRadians: number) => {
    rotationRef.current += deltaRadians;
    if (groupRef.current) {
      groupRef.current.rotation.y = rotationRef.current;
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDisposed = false;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.3, 2.1);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2));
      renderer.setSize(width, height);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      container.innerHTML = "";
      container.appendChild(renderer.domElement);
    } catch {
      setTimeout(() => setLoadError(true), 0);
      return;
    }

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment()).texture;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xbad7ff, 1.2);
    fillLight.position.set(-3, 2, -2);
    scene.add(fillLight);

    const group = new THREE.Group();
    group.rotation.y = rotationRef.current;
    scene.add(group);
    groupRef.current = group;

    let autoSpin = true;
    let autoSpinTimer: ReturnType<typeof setTimeout> | undefined;

    // Load meshopt-ready model
    const loadModel = async () => {
      try {
        await MeshoptDecoder.ready;
        const loader = new GLTFLoader();
        loader.setMeshoptDecoder(MeshoptDecoder);

        loader.load(
          MODELS[modelName],
          (gltf) => {
            if (isDisposed) return;
            group.clear();

            const model = gltf.scene;

            // Compute bounds and scale
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            if (maxDim > 0) {
              const targetScale = modelName === "carry-on" ? 1.05 / maxDim : 1.22 / maxDim;
              model.scale.setScalar(targetScale);
            }

            // Recalculate center after scale
            const scaledBox = new THREE.Box3().setFromObject(model);
            const center = scaledBox.getCenter(new THREE.Vector3());
            model.position.sub(center);

            // Apply selected finish exclusively to the shell/rib surfaces
            model.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                const matName = (mesh.material as THREE.Material)?.name?.toLowerCase() || "";
                if (matName.includes("shell") || matName.includes("rib")) {
                  const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
                  mat.color = new THREE.Color(selectedFinish.color);
                  mat.metalness = selectedFinish.metalness;
                  mat.roughness = selectedFinish.roughness;
                  mesh.material = mat;
                }
              }
            });

            group.add(model);
            setModelReady(true);
            setLoadError(false);
          },
          undefined,
          (err) => {
            console.warn("Failed to load 3D model, displaying high-res visual fallback", err);
            setLoadError(true);
          }
        );
      } catch (err) {
        console.warn("MeshoptDecoder initialization failed", err);
        setLoadError(true);
      }
    };

    loadModel();

    let animationFrameId: number;
    const animate = () => {
      if (isDisposed) return;
      animationFrameId = requestAnimationFrame(animate);

      if (autoSpin && !isDraggingRef.current) {
        rotationRef.current += 0.005;
        group.rotation.y = rotationRef.current;
      }
      renderer?.render(scene, camera);
    };
    animate();

    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      lastXRef.current = e.clientX;
      autoSpin = false;
      clearTimeout(autoSpinTimer);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - lastXRef.current;
      lastXRef.current = e.clientX;
      rotationRef.current += deltaX * 0.01;
      group.rotation.y = rotationRef.current;
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
      autoSpinTimer = setTimeout(() => {
        autoSpin = true;
      }, 4000);
    };

    const dom = renderer.domElement;
    dom.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const onResize = () => {
      if (!container || isDisposed || !renderer) return;
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
      clearTimeout(autoSpinTimer);
      dom.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", onResize);
      pmremGenerator.dispose();
      renderer?.dispose();
    };
  }, [modelName, selectedFinish]);

  return (
    <div
      className={`relative flex flex-col items-center rounded-3xl border border-line bg-gradient-to-b from-[#051126] to-navy p-5 text-white shadow-hero ${className}`}
    >
      {/* 3D Canvas / Fallback Container */}
      <div className="relative h-[380px] w-full cursor-grab overflow-hidden active:cursor-grabbing sm:h-[440px]">
        {/* Visual Fallback Poster (rendered while loading or on WebGL error) */}
        {(!modelReady || loadError) && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
            <div className="relative h-72 w-72 transition-transform duration-500">
              <Image
                src={selectedFinish.posterImage}
                alt={selectedFinish.name}
                fill
                sizes="320px"
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
            {!loadError && (
              <span className="mt-2 text-caption text-sky font-mono animate-pulse">
                Initializing 3D Interactive Model...
              </span>
            )}
          </div>
        )}

        {/* Real-time 3D Canvas */}
        <div ref={containerRef} className="size-full" />

        {/* 360 Spin Hint & Manual Turn Controls */}
        <div className="pointer-events-auto absolute bottom-3 inset-x-4 z-20 flex items-center justify-between">
          <button
            type="button"
            onClick={() => rotateBy(-0.4)}
            className="flex size-9 items-center justify-center rounded-full bg-navy-deep/80 text-white backdrop-blur-md transition-colors hover:bg-sky hover:text-navy active:scale-95"
            aria-label="Rotate left"
          >
            <ChevronLeft className="size-5" />
          </button>

          <div className="pointer-events-none flex items-center gap-1.5 rounded-full bg-navy-deep/90 px-3.5 py-1.5 text-caption-m text-sky backdrop-blur-md border border-white/10 shadow-lg">
            <Rotate3D className="size-3.5 animate-pulse" />
            <span>Drag or swipe to rotate 360°</span>
          </div>

          <button
            type="button"
            onClick={() => rotateBy(0.4)}
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
            onClick={() => {
              setModelReady(false);
              setModelName("carry-on");
            }}
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
            onClick={() => {
              setModelReady(false);
              setModelName("check-in");
            }}
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
            <Sparkles className="size-3.5 text-sky" /> {selectedFinish.name}
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
