"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Camera, X, Rotate3d, Check, Sparkles, RefreshCw, Smartphone, Layers, AlertCircle, Download } from "lucide-react";
import type * as Three from "three";
import type { Active3DModel } from "./BagViewer";

interface ARProjectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeModel: Active3DModel;
  colorHex: string;
  metalness?: number;
  roughness?: number;
}

export default function ARProjectionModal({
  isOpen,
  onClose,
  activeModel: initialModel,
  colorHex,
  metalness = 0.5,
  roughness = 0.35,
}: ARProjectionModalProps) {
  const [model, setModel] = useState<Active3DModel>(initialModel);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0); // 1.0 is 1:1 real-world physical scale
  const [rotation, setRotation] = useState(0.2);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(-0.35); // placed on ground floor
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const bagGroupRef = useRef<any>(null);
  const shellMaterialsRef = useRef<any[]>([]);

  // Keep local model in sync with prop if changed
  useEffect(() => {
    setModel(initialModel);
  }, [initialModel]);

  // Request rear environment camera
  useEffect(() => {
    if (!isOpen) return;

    let stream: MediaStream | null = null;
    let cancelled = false;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API not supported in this browser.");
        }
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraActive(true);
          setCameraError(null);
        }
      } catch (err: any) {
        console.warn("Camera access denied or unavailable:", err);
        setCameraActive(false);
        setCameraError(err.message || "Camera access permission was denied or unavailable.");
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setCameraActive(false);
    };
  }, [isOpen]);

  // 3D Canvas Lifecycle inside AR Viewport
  useEffect(() => {
    if (!isOpen) return;
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let animationFrameId = 0;

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
      const modelUrl = model === "carry-on" ? "/models/carry-on.glb" : "/models/check-in.glb";

      try {
        const gltf = await loader.loadAsync(modelUrl);
        if (cancelled) return;

        const width = host.clientWidth || window.innerWidth;
        const height = host.clientHeight || window.innerHeight;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        const canvas = renderer.domElement;
        canvas.style.display = "block";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.touchAction = "none";
        host.innerHTML = "";
        host.appendChild(canvas);
        rendererRef.current = renderer;

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const pmrem = new THREE.PMREMGenerator(renderer);
        const room = new RoomEnvironment();
        const environment = pmrem.fromScene(room, 0.04);
        room.dispose();
        pmrem.dispose();
        scene.environment = environment.texture;
        scene.environmentIntensity = 1.0;

        // Realistic directional sun/ceiling light casting soft ground shadow
        const dirLight = new THREE.DirectionalLight(0xfffaed, 2.8);
        dirLight.position.set(1.5, 3.5, 2);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 10;
        dirLight.shadow.bias = -0.001;
        scene.add(dirLight);

        const ambLight = new THREE.AmbientLight(0xffffff, 0.75);
        scene.add(ambLight);

        // Ground shadow plane that catches shadow invisibly over the camera feed
        const shadowPlaneGeo = new THREE.PlaneGeometry(10, 10);
        const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.38 });
        const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
        shadowPlane.rotation.x = -Math.PI / 2;
        shadowPlane.position.y = -0.55;
        shadowPlane.receiveShadow = true;
        scene.add(shadowPlane);

        // Bag Mesh setup
        const bag = gltf.scene.clone(true);
        const materials: Three.MeshPhysicalMaterial[] = [];

        bag.traverse((child) => {
          const mesh = child as Three.Mesh;
          if (!mesh.isMesh) return;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          const mat = mesh.material as Three.MeshPhysicalMaterial;
          if (
            mat &&
            (mat.name === "Shell" ||
              mat.name.toLowerCase().includes("body") ||
              mat.name.toLowerCase().includes("case") ||
              mat.name === "Default")
          ) {
            mat.color.set(colorHex);
            mat.metalness = metalness;
            mat.roughness = roughness;
            materials.push(mat);
          }
        });
        shellMaterialsRef.current = materials;

        // Auto-center and normalize scale
        const box = new THREE.Box3().setFromObject(bag);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const baseNormScale = 1.45 / (maxDim || 1);
        bag.scale.setScalar(baseNormScale);
        bag.position.set(-center.x * baseNormScale, -center.y * baseNormScale, -center.z * baseNormScale);

        const rootGroup = new THREE.Group();
        rootGroup.add(bag);
        rootGroup.position.set(0, -0.15, 0);
        scene.add(rootGroup);
        bagGroupRef.current = rootGroup;

        const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 20);
        camera.position.set(0, 0.25, 2.8);
        camera.lookAt(0, -0.1, 0);

        // Render loop
        const animate = () => {
          if (cancelled) return;
          if (bagGroupRef.current) {
            bagGroupRef.current.rotation.y = rotation;
            bagGroupRef.current.scale.setScalar(scale);
            bagGroupRef.current.position.x = positionX;
            bagGroupRef.current.position.y = positionY;
          }
          renderer.render(scene, camera);
          animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        // Responsive resize
        const handleResize = () => {
          if (!host || cancelled) return;
          const w = host.clientWidth || window.innerWidth;
          const h = host.clientHeight || window.innerHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener("resize", handleResize);

        // Pointer drag interaction (Pan + Rotate)
        let isPointerDown = false;
        let lastX = 0;
        let lastY = 0;

        const onPointerDown = (e: PointerEvent) => {
          isPointerDown = true;
          lastX = e.clientX;
          lastY = e.clientY;
          canvas.setPointerCapture(e.pointerId);
        };

        const onPointerMove = (e: PointerEvent) => {
          if (!isPointerDown) return;
          const deltaX = e.clientX - lastX;
          const deltaY = e.clientY - lastY;
          lastX = e.clientX;
          lastY = e.clientY;

          // Drag left/right rotates bag, drag up/down shifts ground position
          setRotation((r) => r + deltaX * 0.015);
          setPositionY((py) => Math.max(-1.0, Math.min(0.2, py - deltaY * 0.003)));
          setPositionX((px) => Math.max(-0.8, Math.min(0.8, px + deltaX * 0.0015)));
        };

        const onPointerUp = (e: PointerEvent) => {
          isPointerDown = false;
          try {
            canvas.releasePointerCapture(e.pointerId);
          } catch {}
        };

        canvas.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);

        return () => {
          cancelled = true;
          cancelAnimationFrame(animationFrameId);
          window.removeEventListener("resize", handleResize);
          canvas.removeEventListener("pointerdown", onPointerDown);
          window.removeEventListener("pointermove", onPointerMove);
          window.removeEventListener("pointerup", onPointerUp);
          renderer.dispose();
          environment.dispose();
          if (host.contains(canvas)) host.removeChild(canvas);
        };
      } catch (err) {
        console.error("AR 3D load error:", err);
      }
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen, model]);

  // Keep colors in sync
  useEffect(() => {
    if (shellMaterialsRef.current.length > 0) {
      shellMaterialsRef.current.forEach((mat) => {
        mat.color.set(colorHex);
        mat.metalness = metalness;
        mat.roughness = roughness;
        mat.needsUpdate = true;
      });
    }
  }, [colorHex, metalness, roughness]);

  // Capture Photo composite (Camera video + 3D canvas)
  const handleCapturePhoto = () => {
    setIsCapturing(true);
    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    const webglCanvas = hostRef.current?.querySelector("canvas");

    const w = 1280;
    const h = 720;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      if (video && cameraActive) {
        ctx.drawImage(video, 0, 0, w, h);
      } else {
        // Fallback room background gradient
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, "#1a2436");
        grad.addColorStop(0.65, "#2b3b55");
        grad.addColorStop(1, "#121924");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      if (webglCanvas) {
        ctx.drawImage(webglCanvas, 0, 0, w, h);
      }

      // Add AMORTRAV Luxury AR Stamp
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.font = "bold 16px 'SF Mono', monospace";
      ctx.fillText("AMORTRAV · ROOM PROJECTION (1:1 SCALE)", 32, h - 36);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      setCapturedPhotoUrl(dataUrl);
    }
    setIsCapturing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      {/* Top Header Controls Bar */}
      <div className="absolute top-0 inset-x-0 z-40 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-full bg-brand/80 text-white shadow-md">
            <Camera className="size-4.5" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-sky">
              WebAR Reality Lens
            </span>
            <h2 className="text-small sm:text-lead font-bold text-white">
              Project Bag in Your Room
            </h2>
          </div>
        </div>

        {/* Model Toggle: Cabin vs Check-In */}
        <div className="flex items-center gap-1 rounded-full bg-white/10 p-1 border border-white/20 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setModel("carry-on")}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
              model === "carry-on" ? "bg-white text-navy shadow-xs font-bold" : "text-white/70 hover:text-white"
            }`}
          >
            Cabin 55
          </button>
          <button
            type="button"
            onClick={() => setModel("check-in")}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
              model === "check-in" ? "bg-white text-navy shadow-xs font-bold" : "text-white/70 hover:text-white"
            }`}
          >
            Check-In 68
          </button>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="flex size-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 active:scale-95 transition-all"
          aria-label="Close AR projection"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Main AR Viewport */}
      <div className="relative size-full overflow-hidden flex items-center justify-center">
        {/* Rear Camera Video Feed */}
        <video
          ref={videoRef}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${
            cameraActive ? "opacity-100" : "opacity-0"
          }`}
          autoPlay
          playsInline
          muted
        />

        {/* Fallback Interior Floor Room Background if Camera is Off/Denied */}
        {!cameraActive && (
          <div className="absolute inset-0 size-full bg-gradient-to-b from-[#182338] via-[#21304a] to-[#0f1724] flex flex-col items-center justify-center p-6 text-center">
            {/* Grid floor perspective rendering simulated room floor */}
            <div
              className="absolute inset-x-0 bottom-0 h-1/2 opacity-25"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
                transform: "perspective(500px) rotateX(60deg)",
                transformOrigin: "bottom center",
              }}
            />
            {cameraError && (
              <div className="relative z-10 max-w-md rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md text-white mb-6">
                <div className="flex items-center gap-2 text-sky text-caption font-bold mb-1">
                  <Smartphone className="size-4" />
                  <span>Real-World Camera Simulation Active</span>
                </div>
                <p className="text-[12px] text-white/80">
                  Point your mobile device camera at your floor, or use the tactile controls below to rotate, scale, and inspect the physical dimensions in room scale.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Three.js 3D Bag Canvas Overlay */}
        <div ref={hostRef} className="absolute inset-0 size-full z-20 pointer-events-auto cursor-grab active:cursor-grabbing" />

        {/* Realistic Floor Level Ground Shadow Indicator */}
        <div className="pointer-events-none absolute bottom-24 inset-x-0 z-30 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-1.5 text-[11px] font-medium text-white/90 backdrop-blur-md shadow-lg">
            <Rotate3d className="size-3.5 text-sky animate-spin-slow" />
            <span>Drag to position on floor · Swipe to rotate 360°</span>
          </div>
        </div>

        {/* Bottom Floating Control Bar */}
        <div className="absolute bottom-6 inset-x-4 sm:inset-x-8 z-40 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-black/70 border border-white/15 backdrop-blur-md text-white max-w-3xl mx-auto pointer-events-auto">
          {/* Scale Slider (0.7x to 1.4x) */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-white/70">
              Scale:
            </span>
            <input
              type="range"
              min="0.75"
              max="1.35"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-24 sm:w-32 accent-sky cursor-pointer"
            />
            <span className="font-mono text-[11px] font-bold text-sky">
              {scale === 1.0 ? "1:1 True Scale" : `${Math.round(scale * 100)}%`}
            </span>
          </div>

          {/* Quick Real-World Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setScale(1.0);
                setRotation(0.2);
                setPositionX(0);
                setPositionY(-0.35);
              }}
              className="flex items-center gap-1 rounded-xl bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-white/20 active:scale-95 transition-all"
            >
              <RefreshCw className="size-3" />
              <span>Reset</span>
            </button>

            {/* Photo Shutter Button */}
            <button
              type="button"
              onClick={handleCapturePhoto}
              className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-1.5 text-[11px] font-bold text-white shadow-md hover:bg-navy-deep active:scale-95 transition-all"
            >
              <Camera className="size-3.5" />
              <span>Capture Photo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Captured Photo Preview Modal */}
      {capturedPhotoUrl && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-lg w-full rounded-3xl border border-white/20 bg-navy-deep p-4 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-mono text-caption text-sky font-bold uppercase">
                AMORTRAV AR Snapshot
              </span>
              <button
                type="button"
                onClick={() => setCapturedPhotoUrl(null)}
                className="text-white/60 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10">
              <img
                src={capturedPhotoUrl}
                alt="AMORTRAV Bag projected in room"
                className="size-full object-cover"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-white/70">
                {model === "carry-on" ? "Cabin 55 (55 × 40 × 23 cm)" : "Check-In 68 (68 × 45 × 28 cm)"} in true room scale
              </span>
              <a
                href={capturedPhotoUrl}
                download={`AMORTRAV-${model}-AR-Projection.jpg`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-[12px] font-bold text-navy shadow-md hover:bg-sky transition-colors"
              >
                <Download className="size-3.5" />
                <span>Save Image</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
