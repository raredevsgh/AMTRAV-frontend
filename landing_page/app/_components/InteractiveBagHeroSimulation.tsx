"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Rotate3d, Scale, Radio, Zap, ArrowRight } from "lucide-react";
import type * as Three from "three";

interface BagColor {
  id: string;
  name: string;
  hex: string;
  metalness: number;
  roughness: number;
}

const LUXURY_FINISHES: BagColor[] = [
  { id: "titanium", name: "Titanium Silver", hex: "#c5cbd3", metalness: 0.85, roughness: 0.22 },
  { id: "midnight", name: "Midnight Black", hex: "#1c1d1f", metalness: 0.35, roughness: 0.38 },
  { id: "gold", name: "Champagne Gold", hex: "#d8b888", metalness: 0.75, roughness: 0.28 },
  { id: "navy", name: "Deep Navy", hex: "#162842", metalness: 0.45, roughness: 0.32 },
];

export default function InteractiveBagHeroSimulation() {
  const hostRef = useRef<HTMLDivElement>(null);

  const [activeModel, setActiveModel] = useState<"carry-on" | "check-in">("carry-on");
  const [selectedColor, setSelectedColor] = useState<BagColor>(LUXURY_FINISHES[0]);
  const [isRotating, setIsRotating] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [simulatedImpact, setSimulatedImpact] = useState<number | null>(null);
  const [simulatedWeight, setSimulatedWeight] = useState(activeModel === "carry-on" ? 14.2 : 21.8);

  const rotateActionRef = useRef<((delta: number) => void) | null>(null);
  const shellMaterialsRef = useRef<Three.MeshPhysicalMaterial[]>([]);

  // Update weight when model toggles
  const handleModelChange = (model: "carry-on" | "check-in") => {
    setActiveModel(model);
    setSimulatedWeight(model === "carry-on" ? 14.2 : 21.8);
  };

  // Trigger simulated impact drop event
  const handleTriggerImpact = () => {
    const impactG = (Math.random() * 3.5 + 4.2).toFixed(1);
    setSimulatedImpact(parseFloat(impactG));
    setTimeout(() => {
      setSimulatedImpact(null);
    }, 3500);
  };

  // Real-time material update on color change
  useEffect(() => {
    if (shellMaterialsRef.current.length > 0) {
      shellMaterialsRef.current.forEach((mat) => {
        mat.color.set(selectedColor.hex);
        mat.metalness = selectedColor.metalness;
        mat.roughness = selectedColor.roughness;
        mat.needsUpdate = true;
      });
    }
  }, [selectedColor]);

  // Three.js 3D Canvas Lifecycle
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let animationFrameId = 0;

    setIsReady(false);

    Promise.all([
      import("three"),
      import("three/addons/loaders/GLTFLoader.js"),
      import("three/addons/libs/meshopt_decoder.module.js"),
      import("three/addons/environments/RoomEnvironment.js"),
    ]).then(async ([THREE, { GLTFLoader }, { MeshoptDecoder }, { RoomEnvironment }]) => {
      if (cancelled) return;

      if (MeshoptDecoder?.ready) {
        await MeshoptDecoder.ready;
      }
      const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
      const modelUrl = activeModel === "carry-on" ? "/models/carry-on.glb" : "/models/check-in.glb";

      try {
        const gltf = await loader.loadAsync(modelUrl);
        if (cancelled) return;

        const width = host.clientWidth || 320;
        const height = host.clientHeight || 280;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;

        const canvas = renderer.domElement;
        canvas.style.display = "block";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.cursor = "grab";
        canvas.style.touchAction = "none";
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

        // Studio lights
        const keyLight = new THREE.DirectionalLight(0xfff5e8, 2.5);
        keyLight.position.set(-1.5, 2.2, 2);
        const fillLight = new THREE.DirectionalLight(0xdde9ff, 1.0);
        fillLight.position.set(2, 0.8, 1);
        const rimLight = new THREE.DirectionalLight(0xffffff, 2.0);
        rimLight.position.set(0.5, 1.8, -2);
        scene.add(keyLight, fillLight, rimLight, new THREE.AmbientLight(0xffffff, 0.45));

        const bag = gltf.scene.clone(true);
        const materials: Three.MeshPhysicalMaterial[] = [];

        bag.traverse((child) => {
          const mesh = child as Three.Mesh;
          if (!mesh.isMesh) return;
          const mat = mesh.material as Three.MeshPhysicalMaterial;
          if (mat && (mat.name === "Shell" || mat.name.toLowerCase().includes("body") || mat.name.toLowerCase().includes("case") || mat.name === "Default")) {
            mat.color.set(selectedColor.hex);
            mat.metalness = selectedColor.metalness;
            mat.roughness = selectedColor.roughness;
            materials.push(mat);
          }
        });
        shellMaterialsRef.current = materials;

        // Center and scale bag
        const box = new THREE.Box3().setFromObject(bag);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.6 / (maxDim || 1);
        bag.scale.setScalar(scale);
        bag.position.set(-center.x * scale, -center.y * scale - 0.05, -center.z * scale);

        const rootGroup = new THREE.Group();
        rootGroup.add(bag);
        scene.add(rootGroup);

        const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 20);
        camera.position.set(0, 0.2, 2.6);
        camera.lookAt(0, 0, 0);

        let rotationAngle = 0.25;
        rootGroup.rotation.y = rotationAngle;

        rotateActionRef.current = (delta: number) => {
          rotationAngle += delta;
          rootGroup.rotation.y = rotationAngle;
        };

        // Pointer drag touch handling
        let isDragging = false;
        let prevX = 0;

        const onPointerDown = (e: PointerEvent) => {
          isDragging = true;
          prevX = e.clientX;
          canvas.style.cursor = "grabbing";
        };

        const onPointerMove = (e: PointerEvent) => {
          if (!isDragging) return;
          const deltaX = e.clientX - prevX;
          prevX = e.clientX;
          rotationAngle += (deltaX * Math.PI) / 250;
          rootGroup.rotation.y = rotationAngle;
        };

        const onPointerUp = () => {
          isDragging = false;
          canvas.style.cursor = "grab";
        };

        canvas.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);

        // Resize handler
        const onResize = () => {
          if (!host) return;
          const w = host.clientWidth;
          const h = host.clientHeight;
          if (w && h) {
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
          }
        };
        window.addEventListener("resize", onResize);

        setIsReady(true);

        const animate = () => {
          animationFrameId = requestAnimationFrame(animate);
          if (isRotating && !isDragging) {
            rotationAngle += 0.007;
            rootGroup.rotation.y = rotationAngle;
          }
          renderer.render(scene, camera);
        };
        animate();

        return () => {
          cancelled = true;
          cancelAnimationFrame(animationFrameId);
          window.removeEventListener("resize", onResize);
          canvas.removeEventListener("pointerdown", onPointerDown);
          window.removeEventListener("pointermove", onPointerMove);
          window.removeEventListener("pointerup", onPointerUp);
          renderer.dispose();
          environment.dispose();
          if (host.contains(canvas)) host.removeChild(canvas);
        };
      } catch (err) {
        console.error("Failed to load 3D model:", err);
      }
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeModel]);

  return (
    <div className="relative flex w-full flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 bg-gradient-to-b from-white/10 via-white/5 to-white/[0.02] p-4 sm:p-5 text-white backdrop-blur-xl shadow-2xl">
      {/* Simulation Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-blue-pale">
            3D Precision Simulation
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-navy-deep/80 px-2.5 py-1 border border-white/10">
          <Rotate3d className="size-3.5 text-sky" />
          <span className="text-[10px] font-medium text-white/90">360° Touch Orbit</span>
        </div>
      </div>

      {/* 3D Interactive Canvas Container */}
      <div className="relative mt-2 flex h-64 sm:h-72 w-full items-center justify-center">
        <div ref={hostRef} className="size-full" />

        {/* Loading Indicator */}
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-navy/60 backdrop-blur-xs">
            <div className="size-6 animate-spin rounded-full border-2 border-sky border-t-transparent" />
            <span className="font-mono text-[11px] text-blue-pale">Calibrating 3D Model...</span>
          </div>
        )}

        {/* Live Telemetry Floating HUD */}
        <div className="pointer-events-none absolute top-2 left-2 flex flex-col gap-1.5">
          {/* Integrated Load Cell HUD */}
          <div className="flex items-center gap-1.5 rounded-lg bg-navy-deep/85 px-2.5 py-1 border border-white/15 backdrop-blur-md shadow-md">
            <Scale className="size-3.5 text-sky" />
            <span className="font-mono text-[11px] font-bold text-white">
              {simulatedWeight.toFixed(1)} kg
            </span>
            <span className="text-[9px] text-blue-pale/80 font-medium">(Under 23kg limit)</span>
          </div>

          {/* GNSS + BLE Beacon Status */}
          <div className="flex items-center gap-1.5 rounded-lg bg-navy-deep/85 px-2.5 py-1 border border-white/15 backdrop-blur-md shadow-md">
            <Radio className="size-3.5 text-emerald-400" />
            <span className="font-mono text-[10px] text-white">TRACE GNSS Locked</span>
          </div>

          {/* Impact Event Toast (if triggered) */}
          {simulatedImpact && (
            <div className="flex items-center gap-1.5 rounded-lg bg-red-950/90 px-2.5 py-1 border border-red-500/50 backdrop-blur-md shadow-lg animate-bounce">
              <Zap className="size-3.5 text-amber-400" />
              <span className="font-mono text-[10px] font-bold text-white">
                {simulatedImpact}G Impact Logged
              </span>
            </div>
          )}
        </div>

        {/* Rotation Pause/Play Overlay Pill */}
        <button
          type="button"
          onClick={() => setIsRotating(!isRotating)}
          aria-label={isRotating ? "Pause automatic spin" : "Resume automatic spin"}
          className="absolute bottom-2 right-2 rounded-full bg-navy-deep/80 px-2.5 py-1 text-[10px] font-medium text-white/90 border border-white/10 hover:bg-navy-deep transition-all backdrop-blur-md"
        >
          {isRotating ? "Pause Spin" : "Auto Spin"}
        </button>
      </div>

      {/* Model & Color Selector Controls */}
      <div className="mt-3 flex flex-col gap-3 border-t border-white/10 pt-3">
        {/* Model Selector Tabs */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-full bg-navy-deep p-0.5 border border-white/10 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => handleModelChange("carry-on")}
              className={`rounded-full px-3 py-1 transition-all ${
                activeModel === "carry-on"
                  ? "bg-sky text-navy font-bold shadow-xs"
                  : "text-blue-pale hover:text-white"
              }`}
            >
              Cabin 55 (35L)
            </button>
            <button
              type="button"
              onClick={() => handleModelChange("check-in")}
              className={`rounded-full px-3 py-1 transition-all ${
                activeModel === "check-in"
                  ? "bg-sky text-navy font-bold shadow-xs"
                  : "text-blue-pale hover:text-white"
              }`}
            >
              Check-In 68 (65L)
            </button>
          </div>

          {/* Simulate Impact Trigger Button */}
          <button
            type="button"
            onClick={handleTriggerImpact}
            className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-blue-pale hover:bg-white/20 hover:text-white transition-all active:scale-95"
            title="Simulate airport handling impact alert"
          >
            <Zap className="size-3 text-amber-400" />
            <span>Test Drop</span>
          </button>
        </div>

        {/* Color Swatch Row */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-blue-pale">
            Finish: <span className="font-semibold text-white">{selectedColor.name}</span>
          </span>
          <div className="flex items-center gap-2">
            {LUXURY_FINISHES.map((color) => {
              const isSelected = selectedColor.id === color.id;
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  aria-label={`Select ${color.name}`}
                  className={`size-6 rounded-full border-2 transition-transform duration-200 ${
                    isSelected ? "scale-125 border-sky shadow-md" : "border-white/30 hover:scale-110"
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              );
            })}
          </div>
        </div>

        {/* Link to Full Customiser Studio */}
        <Link
          href="/customise"
          className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-sky/20 py-2 text-[12px] font-semibold text-sky hover:bg-sky/30 transition-all border border-sky/30 text-center"
        >
          <span>Open 3D Studio Configurator</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
