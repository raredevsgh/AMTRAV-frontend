"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Camera,
  X,
  Rotate3d,
  Check,
  Sparkles,
  RefreshCw,
  Smartphone,
  Layers,
  AlertCircle,
  Download,
  Scale,
  Maximize2,
  FolderOpen,
  Sliders,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import type * as Three from "three";
import type { Active3DModel } from "./BagViewer";

export type ARModelType = "carry-on" | "check-in" | "duffel";

interface ARProjectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeModel: Active3DModel;
  colorHex: string;
  metalness?: number;
  roughness?: number;
}

const SUEDE_AR_SWATCHES = [
  { name: "Cognac Brown", hex: "#6e3b1b" },
  { name: "Onyx Black", hex: "#1a1a1a" },
  { name: "Midnight Navy", hex: "#10213b" },
  { name: "Sand Beige", hex: "#c2b29d" },
  { name: "Charcoal Grey", hex: "#424449" },
];

export default function ARProjectionModal({
  isOpen,
  onClose,
  activeModel: initialModel,
  colorHex,
  metalness = 0.5,
  roughness = 0.35,
}: ARProjectionModalProps) {
  const [model, setModel] = useState<ARModelType>(initialModel);
  const [suedeColorHex, setSuedeColorHex] = useState("#6e3b1b");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Local state for UI controls
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0.2);
  const [isCaseOpen, setIsCaseOpen] = useState(false);
  const [isHandleExtended, setIsHandleExtended] = useState(false);
  const [isWeighingActive, setIsWeighingActive] = useState(false);
  const [liveWeightKg, setLiveWeightKg] = useState(14.2);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);

  // Mutable refs for Three.js render loop (fixes stale closure)
  const rotationRef = useRef(0.2);
  const scaleRef = useRef(1.0);
  const posXRef = useRef(0);
  const posYRef = useRef(-0.35);
  const targetClamshellRef = useRef(0); // 0 = closed, 1.85 = open
  const targetHandleExtRef = useRef(0); // 0 = retracted, 0.42 = extended

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const bagGroupRef = useRef<any>(null);
  const clamshellGroupRef = useRef<any>(null);
  const handleGroupRef = useRef<any>(null);
  const shellMaterialsRef = useRef<any[]>([]);
  const duffelMaterialRef = useRef<any>(null);

  // Keep model updated if prop changes
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

  // Sync animation states to refs
  useEffect(() => {
    targetClamshellRef.current = isCaseOpen ? 1.75 : 0;
  }, [isCaseOpen]);

  useEffect(() => {
    targetHandleExtRef.current = isHandleExtended ? 0.38 : 0;
  }, [isHandleExtended]);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

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

      const width = host.clientWidth || window.innerWidth;
      const height = host.clientHeight || window.innerHeight;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.3;
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
      scene.environmentIntensity = 1.05;

      // Realistic directional sun/ceiling light casting soft ground shadow
      const dirLight = new THREE.DirectionalLight(0xfffaed, 2.9);
      dirLight.position.set(1.5, 3.8, 2.2);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = 10;
      dirLight.shadow.bias = -0.001;
      scene.add(dirLight);

      const ambLight = new THREE.AmbientLight(0xffffff, 0.85);
      scene.add(ambLight);

      // Floor shadow receiver plane
      const shadowPlaneGeo = new THREE.PlaneGeometry(10, 10);
      const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.42 });
      const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = -0.55;
      shadowPlane.receiveShadow = true;
      scene.add(shadowPlane);

      // Root model group
      const rootGroup = new THREE.Group();
      rootGroup.position.set(posXRef.current, posYRef.current, 0);
      rootGroup.rotation.y = rotationRef.current;
      rootGroup.scale.setScalar(scaleRef.current);
      scene.add(rootGroup);
      bagGroupRef.current = rootGroup;

      let currentClamshell = 0;
      let currentHandleExt = 0;
      let handleMeshGroup: any = null;
      let lidMeshGroup: any = null;

      if (model === "duffel") {
        // Build 3D Handcrafted Italian Suede Duffel Bag Procedurally
        const duffelGroup = new THREE.Group();

        // 1. Suede Cylindrical Barrel Body
        const bodyGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.88, 32, 1);
        bodyGeo.rotateZ(Math.PI / 2);
        const suedeMat = new THREE.MeshPhysicalMaterial({
          color: suedeColorHex,
          roughness: 0.86,
          metalness: 0.04,
          clearcoat: 0.08,
          clearcoatRoughness: 0.4,
        });
        duffelMaterialRef.current = suedeMat;
        const bodyMesh = new THREE.Mesh(bodyGeo, suedeMat);
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        duffelGroup.add(bodyMesh);

        // 2. Rounded Suede Endcaps
        const endCapGeo = new THREE.SphereGeometry(0.32, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const endCapLeft = new THREE.Mesh(endCapGeo, suedeMat);
        endCapLeft.rotation.z = Math.PI / 2;
        endCapLeft.position.x = -0.44;
        endCapLeft.castShadow = true;
        duffelGroup.add(endCapLeft);

        const endCapRight = new THREE.Mesh(endCapGeo, suedeMat);
        endCapRight.rotation.z = -Math.PI / 2;
        endCapRight.position.x = 0.44;
        endCapRight.castShadow = true;
        duffelGroup.add(endCapRight);

        // 3. Leather Trim & Carry Handles
        const leatherMat = new THREE.MeshStandardMaterial({
          color: 0x181818,
          roughness: 0.45,
          metalness: 0.15,
        });
        const brassMat = new THREE.MeshStandardMaterial({
          color: 0xd4af37,
          roughness: 0.28,
          metalness: 0.88,
        });

        // Twin Leather Reinforcing Straps around the body
        const strapGeo = new THREE.TorusGeometry(0.326, 0.016, 16, 48);
        strapGeo.rotateY(Math.PI / 2);
        const strap1 = new THREE.Mesh(strapGeo, leatherMat);
        strap1.position.x = -0.22;
        duffelGroup.add(strap1);

        const strap2 = new THREE.Mesh(strapGeo, leatherMat);
        strap2.position.x = 0.22;
        duffelGroup.add(strap2);

        // Arched Handles
        const handleArchGeo = new THREE.TorusGeometry(0.2, 0.02, 16, 32, Math.PI);
        const handleFront = new THREE.Mesh(handleArchGeo, leatherMat);
        handleFront.position.set(0, 0.32, 0.08);
        handleFront.rotation.x = 0.15;
        duffelGroup.add(handleFront);

        const handleBack = new THREE.Mesh(handleArchGeo, leatherMat);
        handleBack.position.set(0, 0.32, -0.08);
        handleBack.rotation.x = -0.15;
        duffelGroup.add(handleBack);

        // Top Brass Zipper Track
        const zipGeo = new THREE.BoxGeometry(0.72, 0.018, 0.04);
        const zipMesh = new THREE.Mesh(zipGeo, brassMat);
        zipMesh.position.set(0, 0.325, 0);
        duffelGroup.add(zipMesh);

        // AMTRAV Engraved Metal Plaque
        const plaqueGeo = new THREE.BoxGeometry(0.12, 0.05, 0.008);
        const plaqueMesh = new THREE.Mesh(plaqueGeo, brassMat);
        plaqueMesh.position.set(0, 0.12, 0.325);
        duffelGroup.add(plaqueMesh);

        duffelGroup.position.set(0, 0.12, 0);
        rootGroup.add(duffelGroup);
      } else {
        // Load Real GLTF Luggage Model with Meshopt Decoder
        if (MeshoptDecoder?.ready) {
          await MeshoptDecoder.ready;
        }
        const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
        const modelUrl = model === "carry-on" ? "/models/carry-on.glb" : "/models/check-in.glb";

        try {
          const gltf = await loader.loadAsync(modelUrl);
          if (cancelled) return;

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

          // Telescopic Handle Group (Procedural Extension Accessory)
          const handleGroup = new THREE.Group();
          const tubeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.2 });
          const gripMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4, metalness: 0.1 });

          const tubeGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.45, 16);
          const leftTube = new THREE.Mesh(tubeGeo, tubeMat);
          leftTube.position.set(-0.16, 0.65, -0.05);
          handleGroup.add(leftTube);

          const rightTube = new THREE.Mesh(tubeGeo, tubeMat);
          rightTube.position.set(0.16, 0.65, -0.05);
          handleGroup.add(rightTube);

          const gripGeo = new THREE.BoxGeometry(0.38, 0.04, 0.04);
          const grip = new THREE.Mesh(gripGeo, gripMat);
          grip.position.set(0, 0.88, -0.05);
          handleGroup.add(grip);

          handleGroup.position.y = 0;
          rootGroup.add(handleGroup);
          handleMeshGroup = handleGroup;
          handleGroupRef.current = handleGroup;

          // Clamshell Open / Interior Volume Group
          const clamshellLid = new THREE.Group();
          const interiorMat = new THREE.MeshStandardMaterial({
            color: 0x1f2937,
            roughness: 0.8,
            metalness: 0.1,
          });
          const strapMat = new THREE.MeshStandardMaterial({
            color: 0x2563eb,
            roughness: 0.6,
          });

          // Interior divider and butterfly compression straps
          const dividerGeo = new THREE.PlaneGeometry(0.48, 0.72);
          const divider = new THREE.Mesh(dividerGeo, interiorMat);
          divider.position.set(0, 0.32, 0.01);
          clamshellLid.add(divider);

          const xStrap1Geo = new THREE.BoxGeometry(0.55, 0.025, 0.005);
          const xStrap1 = new THREE.Mesh(xStrap1Geo, strapMat);
          xStrap1.rotation.z = Math.PI / 4;
          xStrap1.position.set(0, 0.32, 0.015);
          clamshellLid.add(xStrap1);

          const xStrap2Geo = new THREE.BoxGeometry(0.55, 0.025, 0.005);
          const xStrap2 = new THREE.Mesh(xStrap2Geo, strapMat);
          xStrap2.rotation.z = -Math.PI / 4;
          xStrap2.position.set(0, 0.32, 0.015);
          clamshellLid.add(xStrap2);

          // Hinge placed on the left side of the case
          clamshellLid.position.set(-0.25, 0, 0.12);
          clamshellLid.visible = false;
          rootGroup.add(clamshellLid);
          lidMeshGroup = clamshellLid;
          clamshellGroupRef.current = clamshellLid;

          rootGroup.add(bag);
        } catch (err) {
          console.error("AR GLTF loading error:", err);
        }
      }

      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 20);
      camera.position.set(0, 0.25, 2.8);
      camera.lookAt(0, -0.1, 0);

      // High-performance RAF Render loop using mutable refs (NEVER suffers from React closure stale state)
      let lastTime = performance.now();
      const animate = () => {
        if (cancelled) return;
        const now = performance.now();
        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        if (bagGroupRef.current) {
          bagGroupRef.current.rotation.y = rotationRef.current;
          bagGroupRef.current.scale.setScalar(scaleRef.current);
          bagGroupRef.current.position.x = posXRef.current;
          bagGroupRef.current.position.y = posYRef.current;

          // Smoothly interpolate clamshell angle
          currentClamshell += (targetClamshellRef.current - currentClamshell) * Math.min(dt * 8, 0.3);
          if (clamshellGroupRef.current) {
            clamshellGroupRef.current.rotation.y = currentClamshell;
            clamshellGroupRef.current.visible = currentClamshell > 0.05;
          }

          // Smoothly interpolate handle extension
          currentHandleExt += (targetHandleExtRef.current - currentHandleExt) * Math.min(dt * 8, 0.3);
          if (handleGroupRef.current) {
            handleGroupRef.current.position.y = currentHandleExt;
          }
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

      // Pointer drag interaction (Smooth 360 Pan + Rotate)
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

        // Smooth delta update to refs
        rotationRef.current += deltaX * 0.012;
        posYRef.current = Math.max(-0.95, Math.min(0.35, posYRef.current - deltaY * 0.0035));
        posXRef.current = Math.max(-0.85, Math.min(0.85, posXRef.current + deltaX * 0.002));

        setRotation(rotationRef.current);
      };

      const onPointerUp = (e: PointerEvent) => {
        isPointerDown = false;
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch {}
      };

      // Wheel Zoom
      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const zoomDelta = -e.deltaY * 0.001;
        const nextScale = Math.max(0.65, Math.min(1.45, scaleRef.current + zoomDelta));
        scaleRef.current = nextScale;
        setScale(nextScale);
      };

      canvas.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("wheel", onWheel, { passive: false });

      return () => {
        cancelled = true;
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("resize", handleResize);
        canvas.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("wheel", onWheel);
        renderer.dispose();
        environment.dispose();
        if (host.contains(canvas)) host.removeChild(canvas);
      };
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

  useEffect(() => {
    if (duffelMaterialRef.current) {
      duffelMaterialRef.current.color.set(suedeColorHex);
      duffelMaterialRef.current.needsUpdate = true;
    }
  }, [suedeColorHex]);

  // Handle weighing sensor simulation
  const toggleWeighing = () => {
    if (!isWeighingActive) {
      setIsWeighingActive(true);
      // Realistic weight sensor jitter before settling
      let count = 0;
      const interval = setInterval(() => {
        setLiveWeightKg(Number((13.5 + Math.random() * 1.4).toFixed(1)));
        count++;
        if (count > 6) {
          clearInterval(interval);
          setLiveWeightKg(model === "carry-on" ? 9.8 : model === "check-in" ? 18.4 : 4.6);
        }
      }, 120);
    } else {
      setIsWeighingActive(false);
    }
  };

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
        // Fallback room interior background gradient
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, "#151e2d");
        grad.addColorStop(0.65, "#223147");
        grad.addColorStop(1, "#0d131c");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      if (webglCanvas) {
        ctx.drawImage(webglCanvas, 0, 0, w, h);
      }

      // Add AMORTRAV Luxury AR Stamp
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = "bold 15px 'SF Mono', monospace";
      ctx.fillText("AMORTRAV · ROOM PROJECTION (1:1 PHYSICAL SCALE)", 32, h - 36);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      setCapturedPhotoUrl(dataUrl);
    }
    setIsCapturing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
      {/* Top Header Controls Bar - Responsive 2-tier on mobile */}
      <div className="absolute top-0 inset-x-0 z-40 flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-6 gap-2.5 sm:gap-4 bg-gradient-to-b from-black/90 via-black/60 to-transparent pointer-events-auto">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <div className="flex size-8 sm:size-9 items-center justify-center rounded-full bg-brand text-white shadow-md">
              <Camera className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9.5px] font-mono font-bold uppercase tracking-widest text-sky">
                  WebAR Spatial Lens
                </span>
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h2 className="text-[13px] sm:text-lead font-bold text-white">
                Project Bag in Room
              </h2>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="sm:hidden flex size-8 items-center justify-center rounded-full bg-white/15 text-white active:scale-95"
            aria-label="Close AR projection"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Silhouette Model Toggle: Cabin 55 vs Check-In 68 vs Suede Duffel */}
        <div className="flex items-center justify-center gap-1 rounded-full bg-white/10 p-1 border border-white/20 backdrop-blur-md self-center sm:self-auto">
          <button
            type="button"
            onClick={() => setModel("carry-on")}
            className={`rounded-full px-3 py-1 text-[10.5px] sm:text-[11px] font-semibold transition-all ${
              model === "carry-on" ? "bg-white text-navy shadow-xs font-bold" : "text-white/75 hover:text-white"
            }`}
          >
            Cabin 55
          </button>
          <button
            type="button"
            onClick={() => setModel("check-in")}
            className={`rounded-full px-3 py-1 text-[10.5px] sm:text-[11px] font-semibold transition-all ${
              model === "check-in" ? "bg-white text-navy shadow-xs font-bold" : "text-white/75 hover:text-white"
            }`}
          >
            Check-In 68
          </button>
          <button
            type="button"
            onClick={() => setModel("duffel")}
            className={`rounded-full px-3 py-1 text-[10.5px] sm:text-[11px] font-semibold transition-all ${
              model === "duffel" ? "bg-white text-navy shadow-xs font-bold" : "text-white/75 hover:text-white"
            }`}
          >
            Suede Duffel
          </button>
        </div>

        {/* Desktop Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="hidden sm:flex size-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 active:scale-95 transition-all"
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
          <div className="absolute inset-0 size-full bg-gradient-to-b from-[#151e2d] via-[#1f2d42] to-[#0d131c] flex flex-col items-center justify-center p-6 text-center">
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
                  <span>Real-World Camera Simulation Mode</span>
                </div>
                <p className="text-[12px] text-white/80">
                  Camera feed active in virtual testing mode. Use touch or mouse gestures to position, rotate 360°, extend the handle, and open the case directly in physical space.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Real-time Interactive Weighing Scale HUD Overlay */}
        {isWeighingActive && (
          <div className="absolute top-28 sm:top-24 z-30 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3 rounded-2xl border border-sky/40 bg-black/80 px-4 py-2.5 sm:px-5 sm:py-3 text-white backdrop-blur-md shadow-2xl">
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-sky/20 text-sky">
                <Scale className="size-4 sm:size-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base sm:text-lg font-black text-white">{liveWeightKg} kg</span>
                  <span className="text-[11px] sm:text-xs text-white/60">({(liveWeightKg * 2.20462).toFixed(1)} lbs)</span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9.5px] sm:text-[10px] font-bold text-emerald-400">
                    ✓ Flight-Safe
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-mono uppercase text-sky">
                  TRACE Smart Core · Under 23kg Allowance
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Three.js 3D Bag Canvas Overlay */}
        <div ref={hostRef} className="absolute inset-0 size-full z-20 pointer-events-auto cursor-grab active:cursor-grabbing" />

        {/* Interactive AR Feature Action Bar - Positioned responsively */}
        <div className="absolute bottom-[88px] sm:bottom-auto sm:top-24 inset-x-3 sm:inset-x-auto sm:left-6 z-30 flex flex-row sm:flex-col items-center sm:items-start justify-center gap-1.5 sm:gap-2 pointer-events-auto">
          {model !== "duffel" && (
            <>
              {/* Clamshell Open/Close Toggle */}
              <button
                type="button"
                onClick={() => setIsCaseOpen(!isCaseOpen)}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-[11px] font-bold shadow-lg backdrop-blur-md border transition-all ${
                  isCaseOpen
                    ? "bg-sky text-navy border-sky font-extrabold"
                    : "bg-black/70 text-white border-white/20 hover:bg-black/90"
                }`}
              >
                <FolderOpen className="size-3 sm:size-3.5" />
                <span>{isCaseOpen ? "Close Interior" : "Open Case"}</span>
              </button>

              {/* Telescopic Handle Extension Toggle */}
              <button
                type="button"
                onClick={() => setIsHandleExtended(!isHandleExtended)}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-[11px] font-bold shadow-lg backdrop-blur-md border transition-all ${
                  isHandleExtended
                    ? "bg-sky text-navy border-sky font-extrabold"
                    : "bg-black/70 text-white border-white/20 hover:bg-black/90"
                }`}
              >
                <Maximize2 className="size-3 sm:size-3.5" />
                <span>{isHandleExtended ? "Retract" : "Extend Handle"}</span>
              </button>

              {/* Digital Scale Weighing HUD Toggle */}
              <button
                type="button"
                onClick={toggleWeighing}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-[11px] font-bold shadow-lg backdrop-blur-md border transition-all ${
                  isWeighingActive
                    ? "bg-emerald-500 text-white border-emerald-400 font-extrabold"
                    : "bg-black/70 text-white border-white/20 hover:bg-black/90"
                }`}
              >
                <Scale className="size-3 sm:size-3.5" />
                <span>{isWeighingActive ? "Hide Scale" : "Weigh Bag"}</span>
              </button>
            </>
          )}

          {/* Suede Duffel Color Switcher Pill */}
          {model === "duffel" && (
            <div className="flex items-center gap-2 rounded-2xl bg-black/80 px-3 py-1.5 border border-white/20 backdrop-blur-md text-white shadow-xl">
              <span className="text-[10px] font-mono uppercase text-sky font-bold hidden sm:inline">
                Suede:
              </span>
              <div className="flex items-center gap-1.5">
                {SUEDE_AR_SWATCHES.map((sw) => (
                  <button
                    key={sw.name}
                    type="button"
                    onClick={() => setSuedeColorHex(sw.hex)}
                    className={`size-5 sm:size-6 rounded-full border transition-all ${
                      suedeColorHex === sw.hex
                        ? "ring-2 ring-white ring-offset-2 scale-110 shadow-xs border-white"
                        : "border-black/30 hover:scale-105"
                    }`}
                    style={{ backgroundColor: sw.hex }}
                    title={sw.name}
                    aria-label={`Select ${sw.name}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Floating Control Bar */}
        <div className="absolute bottom-4 sm:bottom-6 inset-x-3 sm:inset-x-8 z-40 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 p-3 sm:p-3.5 rounded-2xl bg-black/85 border border-white/20 backdrop-blur-md text-white max-w-2xl mx-auto pointer-events-auto shadow-2xl">
          {/* Scale Slider */}
          <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-2">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-white/70">
              Scale:
            </span>
            <input
              type="range"
              min="0.75"
              max="1.35"
              step="0.05"
              value={scale}
              onChange={(e) => {
                const s = parseFloat(e.target.value);
                setScale(s);
                scaleRef.current = s;
              }}
              className="flex-1 sm:w-32 accent-sky cursor-pointer"
            />
            <span className="font-mono text-[10.5px] sm:text-[11px] font-bold text-sky shrink-0">
              {scale === 1.0 ? "1:1 Scale" : `${Math.round(scale * 100)}%`}
            </span>
          </div>

          {/* Quick Real-World Actions */}
          <div className="flex items-center justify-end w-full sm:w-auto gap-2">
            <button
              type="button"
              onClick={() => {
                scaleRef.current = 1.0;
                setScale(1.0);
                rotationRef.current = 0.2;
                setRotation(0.2);
                posXRef.current = 0;
                posYRef.current = -0.35;
                setIsCaseOpen(false);
                setIsHandleExtended(false);
                setIsWeighingActive(false);
              }}
              className="flex items-center gap-1 rounded-xl bg-white/10 px-3 py-1.5 text-[10.5px] sm:text-[11px] font-semibold text-white hover:bg-white/20 active:scale-95 transition-all"
            >
              <RefreshCw className="size-3" />
              <span>Reset</span>
            </button>

            {/* Photo Shutter Button */}
            <button
              type="button"
              onClick={handleCapturePhoto}
              className="flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-1.5 text-[10.5px] sm:text-[11px] font-bold text-white shadow-md hover:bg-navy-deep active:scale-95 transition-all"
            >
              <Camera className="size-3.5" />
              <span>Capture Photo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Captured Photo Preview Modal */}
      {capturedPhotoUrl && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-lg w-full rounded-3xl border border-white/20 bg-[#0B1B3D] p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-mono text-caption text-sky font-bold uppercase">
                AMORTRAV Spatial Snapshot
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
              <span className="text-[11px] text-white/75">
                {model === "carry-on"
                  ? "Cabin 55 (55 × 40 × 23 cm)"
                  : model === "check-in"
                  ? "Check-In 68 (68 × 45 × 28 cm)"
                  : "Handcrafted Suede Duffel (32L)"}{" "}
                in physical room scale
              </span>
              <a
                href={capturedPhotoUrl}
                download={`AMORTRAV-${model}-AR-Snapshot.jpg`}
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
