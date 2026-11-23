"use client";

import React, { useEffect, useRef, useState, useMemo, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  Camera,
  X,
  RefreshCw,
  Smartphone,
  AlertCircle,
  Download,
  Scale,
  Maximize2,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type * as Three from "three";
import type { Active3DModel } from "./BagViewer";
import {
  createInteriorOpenSuitcase,
  playZipperAudio,
  type InteriorOpenSuitcase,
} from "./Realistic3DModels";

export type ARModelType = "carry-on" | "check-in" | "both";

interface ARProjectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeModel: Active3DModel | "both";
  colorHex: string;
  metalness?: number;
  roughness?: number;
}

const ANGLE_PRESETS = [
  { id: "front", label: "Front (3D)", pitch: 0, yaw: 0.2 },
  { id: "inside", label: "Inside Tub", pitch: 0.62, yaw: 0 },
  { id: "handle", label: "Top-Down", pitch: 1.57, yaw: 0 },
  { id: "wheels", label: "Wheels & Base", pitch: -1.15, yaw: 0.5 },
  { id: "under", label: "Underneath", pitch: -1.57, yaw: 0 },
  { id: "flat", label: "Lay Flat (Floor)", pitch: 1.57, yaw: 1.57 },
  { id: "back", label: "Back Ribs", pitch: 0, yaw: 3.14 },
];

interface AirlineLimit {
  id: string;
  name: string;
  cabinMaxKg: number;
  checkinMaxKg: number;
  excessFeeNote: string;
}

const AIRLINE_LIMITS: AirlineLimit[] = [
  { id: "iata", name: "IATA Global Standard", cabinMaxKg: 8.0, checkinMaxKg: 23.0, excessFeeNote: "$65 fee" },
  { id: "lufthansa", name: "Lufthansa / SAS", cabinMaxKg: 8.0, checkinMaxKg: 23.0, excessFeeNote: "€70 fee" },
  { id: "ba", name: "British Airways", cabinMaxKg: 23.0, checkinMaxKg: 23.0, excessFeeNote: "£65 fee" },
  { id: "emirates", name: "Emirates / Qatar", cabinMaxKg: 7.0, checkinMaxKg: 30.0, excessFeeNote: "$80 fee" },
  { id: "delta", name: "Delta / United", cabinMaxKg: 99.0, checkinMaxKg: 23.0, excessFeeNote: "$75 fee" },
];

const PACK_TIERS = [
  { id: "empty", label: "Empty (Tare)", addedKg: 0, desc: "Factory empty weight" },
  { id: "weekend", label: "Weekend (+4.5kg)", addedKg: 4.5, desc: "Outfits & washkit" },
  { id: "business", label: "Business (+7.2kg)", addedKg: 7.2, desc: "Laptop, suit, shoes" },
  { id: "vacation", label: "Vacation (+14.8kg)", addedKg: 14.8, desc: "Full holiday packing" },
  { id: "overweight", label: "Overweight (+21kg)", addedKg: 21.0, desc: "Stress test limit" },
];

export default function ARProjectionModal({
  isOpen,
  onClose,
  activeModel: initialModel,
  colorHex,
  metalness = 0.5,
  roughness = 0.35,
}: ARProjectionModalProps) {
  const [model, setModel] = useState<ARModelType>(
    initialModel === "both" ? "both" : initialModel === "check-in" ? "check-in" : "carry-on"
  );
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Local state for 3D Viewport & Physics
  const [scale, setScale] = useState(1.0);
  const [activeAnglePreset, setActiveAnglePreset] = useState("front");
  const [isCaseOpen, setIsCaseOpen] = useState(false);
  const [isHandleExtended, setIsHandleExtended] = useState(false);

  // End-to-End TRACE Digital Scale States
  const [isWeighingActive, setIsWeighingActive] = useState(false);
  const [scaleCalibrating, setScaleCalibrating] = useState(false);
  const [selectedPackTier, setSelectedPackTier] = useState("empty");
  const [customPackKg, setCustomPackKg] = useState(0);
  const [selectedAirlineId, setSelectedAirlineId] = useState("iata");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [tareOffsetKg, setTareOffsetKg] = useState(0);

  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Mutable refs for Three.js render loop (fixes stale closures)
  const pitchRef = useRef(0); // Vertical elevation in radians
  const yawRef = useRef(0.2); // Horizontal azimuth in radians
  const panXRef = useRef(0);
  const panYRef = useRef(-0.35);
  const scaleRef = useRef(1.0);
  const targetClamshellRef = useRef(0); // 0 = closed, 1.75 = open
  const targetHandleExtRef = useRef(0); // 0 = retracted, 0.38 = extended
  const isLiftingRef = useRef(false); // Bag hovers when weighed

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<Three.WebGLRenderer | null>(null);
  const sceneRef = useRef<Three.Scene | null>(null);
  const bagGroupRef = useRef<Three.Group | null>(null);
  const handleGroupRef = useRef<Three.Group | null>(null);
  const shellMaterialsRef = useRef<Three.MeshPhysicalMaterial[]>([]);
  const closedBagRef = useRef<Three.Group | null>(null);
  const openSuitcaseRef = useRef<InteriorOpenSuitcase | null>(null);
  const openSuitcasesRef = useRef<InteriorOpenSuitcase[]>([]);

  // Keep model updated if prop changes (adjust state during render)
  const [prevInitialModel, setPrevInitialModel] = useState(initialModel);
  if (initialModel !== prevInitialModel) {
    setPrevInitialModel(initialModel);
    setModel(
      initialModel === "both" ? "both" : initialModel === "check-in" ? "check-in" : "carry-on"
    );
  }

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
      } catch (err: unknown) {
        const errorObj = err as Error;
        console.warn("Camera access denied or unavailable:", err);
        setCameraActive(false);
        setCameraError(errorObj.message || "Camera access permission was denied or unavailable.");
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

  // Calculate Weights & Airline Compliance
  const baseTareKg = useMemo(() => {
    if (model === "both") return 8.4;
    return model === "carry-on" ? 3.8 : 4.6;
  }, [model]);

  const packedAddedKg = useMemo(() => {
    if (customPackKg > 0) return customPackKg;
    const tier = PACK_TIERS.find((p) => p.id === selectedPackTier);
    return tier ? tier.addedKg : 0;
  }, [selectedPackTier, customPackKg]);

  const totalGrossKg = useMemo(() => {
    return Math.max(0, baseTareKg + packedAddedKg - tareOffsetKg);
  }, [baseTareKg, packedAddedKg, tareOffsetKg]);

  const totalGrossDisplay = useMemo(() => {
    if (weightUnit === "kg") {
      return totalGrossKg.toFixed(1);
    }
    return (totalGrossKg * 2.20462).toFixed(1);
  }, [totalGrossKg, weightUnit]);

  const selectedAirline = useMemo(() => {
    return AIRLINE_LIMITS.find((a) => a.id === selectedAirlineId) || AIRLINE_LIMITS[0];
  }, [selectedAirlineId]);

  const currentAllowanceKg = useMemo(() => {
    if (model === "both") return selectedAirline.cabinMaxKg + selectedAirline.checkinMaxKg;
    return model === "carry-on" ? selectedAirline.cabinMaxKg : selectedAirline.checkinMaxKg;
  }, [model, selectedAirline]);

  const complianceStatus = useMemo(() => {
    const diff = totalGrossKg - currentAllowanceKg;
    if (diff > 0.05) {
      return {
        level: "overweight" as const,
        label: `⛔ Overweight Warning (+${diff.toFixed(1)} kg over limit)`,
        note: `Exceeds ${selectedAirline.name} limit (${currentAllowanceKg} kg). ${selectedAirline.excessFeeNote} applies.`,
        badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      };
    }
    if (diff >= -1.5) {
      return {
        level: "warning" as const,
        label: `⚠️ Near Maximum Allowance (${Math.abs(diff).toFixed(1)} kg left)`,
        note: `Pack carefully to avoid airport check-in repacking or excess fees.`,
        badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      };
    }
    return {
      level: "safe" as const,
      label: `✓ Flight-Safe (${Math.abs(diff).toFixed(1)} kg headroom)`,
      note: `Comfortably within ${selectedAirline.name} baggage allowance.`,
      badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    };
  }, [totalGrossKg, currentAllowanceKg, selectedAirline]);

  // Sync animation states to refs
  useEffect(() => {
    targetClamshellRef.current = isCaseOpen ? 1.75 : 0;
  }, [isCaseOpen]);

  useEffect(() => {
    targetHandleExtRef.current = isHandleExtended ? 0.38 : 0;
  }, [isHandleExtended]);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    if (openSuitcaseRef.current?.updateColor) {
      openSuitcaseRef.current.updateColor(colorHex, metalness, roughness);
    }
    openSuitcasesRef.current.forEach((s) => {
      s.updateColor?.(colorHex, metalness, roughness);
    });
    if (shellMaterialsRef.current.length > 0) {
      shellMaterialsRef.current.forEach((mat) => {
        mat.color.set(colorHex);
        mat.metalness = metalness ?? 0.65;
        mat.roughness = roughness ?? 0.28;
        mat.needsUpdate = true;
      });
    }
  }, [colorHex, metalness, roughness]);

  // Update OLED text on the 3D luggage handle
  useEffect(() => {
    if (openSuitcaseRef.current?.updateOledText) {
      openSuitcaseRef.current.updateOledText(`TRACE ${totalGrossDisplay} ${weightUnit}`);
    }
    openSuitcasesRef.current.forEach((s) => {
      s.updateOledText?.(`TRACE ${totalGrossDisplay} ${weightUnit}`);
    });
  }, [totalGrossDisplay, weightUnit]);

  // 3D Canvas Lifecycle inside AR Viewport
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    let animationFrameId = 0;

    Promise.all([
      import("three"),
      import("three/addons/loaders/GLTFLoader.js"),
      import("three/addons/environments/RoomEnvironment.js"),
      import("three/addons/libs/meshopt_decoder.module.js"),
    ]).then(async ([threeModule, gltfModule, roomEnvModule, meshoptModule]) => {
      if (cancelled) return;

      const THREE = threeModule;
      const { GLTFLoader } = gltfModule;
      const { RoomEnvironment } = roomEnvModule;
      const { MeshoptDecoder } = meshoptModule;

      const host = hostRef.current;
      if (!host) return;

      const width = host.clientWidth || window.innerWidth;
      const height = host.clientHeight || window.innerHeight;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;

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
      scene.environmentIntensity = 1.1;

      // Realistic directional studio sunlight casting soft ground shadow
      const dirLight = new THREE.DirectionalLight(0xfffaee, 2.9);
      dirLight.position.set(1.6, 3.8, 2.2);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = 10;
      dirLight.shadow.bias = -0.001;
      scene.add(dirLight);

      const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.2);
      fillLight.position.set(-2, 1.8, 1);
      scene.add(fillLight);

      const ambLight = new THREE.AmbientLight(0xffffff, 0.85);
      scene.add(ambLight);

      // Floor shadow receiver plane
      const shadowPlaneGeo = new THREE.PlaneGeometry(10, 10);
      const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.45 });
      const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = -0.55;
      shadowPlane.receiveShadow = true;
      scene.add(shadowPlane);

      // Root model group (Controls 360° rotation & scale)
      const rootGroup = new THREE.Group();
      rootGroup.position.set(panXRef.current, panYRef.current, 0);
      rootGroup.rotation.y = yawRef.current;
      rootGroup.rotation.x = pitchRef.current;
      rootGroup.scale.setScalar(scaleRef.current);
      scene.add(rootGroup);
      bagGroupRef.current = rootGroup;

      let currentClamshell = 0;
      let currentHandleExt = 0;
      let currentLiftingY = 0;

      // Build Photorealistic Clamshell Suitcase with Hinomoto wheels, fluted ribs,
      // handles, TSA locks, OLED scale, and deep packing interior
      const openSuitcases: InteriorOpenSuitcase[] = [];
      if (model === "both") {
        const cabinSuitcase = createInteriorOpenSuitcase(THREE, colorHex, metalness, roughness);
        cabinSuitcase.group.position.set(-0.32, -0.04, 0.08);
        cabinSuitcase.group.scale.setScalar(0.88);
        cabinSuitcase.group.rotation.y = THREE.MathUtils.degToRad(12);
        rootGroup.add(cabinSuitcase.group);

        const checkinSuitcase = createInteriorOpenSuitcase(THREE, colorHex, metalness, roughness);
        checkinSuitcase.group.position.set(0.32, 0.04, -0.08);
        checkinSuitcase.group.scale.setScalar(1.08);
        checkinSuitcase.group.rotation.y = THREE.MathUtils.degToRad(-12);
        rootGroup.add(checkinSuitcase.group);

        openSuitcases.push(cabinSuitcase, checkinSuitcase);
      } else {
        const openSuitcase = createInteriorOpenSuitcase(THREE, colorHex, metalness, roughness);
        openSuitcase.group.position.set(0, 0, 0);
        rootGroup.add(openSuitcase.group);
        openSuitcases.push(openSuitcase);
      }
      openSuitcasesRef.current = openSuitcases;
      openSuitcaseRef.current = openSuitcases[0];
      handleGroupRef.current = openSuitcases[0];

      // Also attempt loading GLTF closed model as alternative if desired
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

          // By default, openSuitcase handles full closed & open representation seamlessly
          closedBagRef.current = bag;
        } catch (err) {
          console.error("AR GLTF loading error:", err);
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
          // Full 360° Spherical Trackball Orbit Rotation (Yaw + Pitch)
          bagGroupRef.current.rotation.y = yawRef.current;
          bagGroupRef.current.rotation.x = pitchRef.current;
          bagGroupRef.current.scale.setScalar(scaleRef.current);

          // Smooth lift effect when weighing
          const targetLift = isLiftingRef.current ? 0.14 : 0;
          currentLiftingY += (targetLift - currentLiftingY) * Math.min(dt * 7, 0.25);

          bagGroupRef.current.position.x = panXRef.current;
          bagGroupRef.current.position.y = panYRef.current + currentLiftingY;

          // Smoothly interpolate clamshell angle
          currentClamshell += (targetClamshellRef.current - currentClamshell) * Math.min(dt * 8, 0.3);
          openSuitcasesRef.current.forEach((s) => {
            s.setClamshellAngle?.(currentClamshell);
          });

          // Smoothly interpolate handle extension
          currentHandleExt += (targetHandleExtRef.current - currentHandleExt) * Math.min(dt * 8, 0.3);
          openSuitcasesRef.current.forEach((s) => {
            s.setHandleExtension?.(currentHandleExt);
          });
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

      // True 360° Spherical Trackball Orbit (Yaw + Pitch + Pan + Zoom)
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

        if (e.buttons === 2 || e.shiftKey) {
          // Pan on Right Click or Shift + Drag
          panXRef.current += deltaX * 0.002;
          panYRef.current = Math.max(-0.95, Math.min(0.55, panYRef.current - deltaY * 0.002));
        } else {
          // Full unconstrained 360° spherical trackball orbit (Yaw, Pitch, Top, Bottom, Underneath, Flat)
          yawRef.current += deltaX * 0.012;
          pitchRef.current += deltaY * 0.01;
        }
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
        const nextScale = Math.max(0.65, Math.min(1.5, scaleRef.current + zoomDelta));
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

  // Set Angle Preset
  const handleSelectAnglePreset = (presetId: string) => {
    setActiveAnglePreset(presetId);
    const p = ANGLE_PRESETS.find((pr) => pr.id === presetId);
    if (!p) return;
    pitchRef.current = p.pitch;
    yawRef.current = p.yaw;
  };

  // Toggle Clamshell Open/Close with Tactile Zipper Audio
  const handleToggleClamshell = () => {
    const nextState = !isCaseOpen;
    setIsCaseOpen(nextState);
    playZipperAudio(nextState);

    // If opening and current pitch is flat, tilt slightly forward so interior is immediately visible
    if (nextState && pitchRef.current < 0.2) {
      pitchRef.current = 0.45;
      setActiveAnglePreset("inside");
    }
  };

  // Toggle Digital Weighing Scale with Physical Lift Simulation
  const handleToggleWeighing = () => {
    if (isWeighingActive) {
      setIsWeighingActive(false);
      isLiftingRef.current = false;
      setScaleCalibrating(false);
    } else {
      setIsWeighingActive(true);
      isLiftingRef.current = true;
      setScaleCalibrating(true);

      // Play soft electronic calibration sequence
      setTimeout(() => {
        setScaleCalibrating(false);
      }, 450);
    }
  };

  // Handle Photo Capture
  const handleCapturePhoto = () => {
    setIsCapturing(true);
    const video = videoRef.current;
    const renderer = rendererRef.current;

    const w = window.innerWidth;
    const h = window.innerHeight;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      if (cameraActive && video && video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, w, h);
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, "#151e2d");
        bgGrad.addColorStop(0.5, "#1f2d42");
        bgGrad.addColorStop(1, "#0d131c");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);
      }

      const webglCanvas = renderer?.domElement;
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

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto">
      {/* Top Header Controls Bar - Responsive 2-tier on mobile with safe-area */}
      <div className="absolute top-0 inset-x-0 z-40 flex flex-col sm:flex-row sm:items-center justify-between pt-[max(14px,env(safe-area-inset-top))] p-3.5 sm:p-6 gap-2.5 sm:gap-4 bg-gradient-to-b from-black/90 via-black/60 to-transparent pointer-events-auto">
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

          {/* Active Color Swatch Badge in Header */}
          <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 border border-white/20 backdrop-blur-md sm:ml-2">
            <span
              className="size-2.5 rounded-full border border-white/40 shadow-xs"
              style={{ backgroundColor: colorHex }}
            />
            <span className="text-[10px] font-mono text-white/90 uppercase font-semibold">
              {colorHex}
            </span>
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

        {/* Silhouette Model Toggle: Cabin 55 vs Check-In 68 vs The Pair (Duo) */}
        <div className="flex items-center justify-center gap-1 rounded-full bg-white/10 p-1 border border-white/20 backdrop-blur-md self-center sm:self-auto">
          <button
            type="button"
            onClick={() => setModel("carry-on")}
            className={`rounded-full px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-semibold transition-all ${
              model === "carry-on" ? "bg-white text-navy shadow-xs font-bold" : "text-white/75 hover:text-white"
            }`}
          >
            Cabin 55
          </button>
          <button
            type="button"
            onClick={() => setModel("check-in")}
            className={`rounded-full px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-semibold transition-all ${
              model === "check-in" ? "bg-white text-navy shadow-xs font-bold" : "text-white/75 hover:text-white"
            }`}
          >
            Check-In 68
          </button>
          <button
            type="button"
            onClick={() => setModel("both")}
            className={`rounded-full px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-semibold transition-all ${
              model === "both" ? "bg-white text-navy shadow-xs font-bold" : "text-white/75 hover:text-white"
            }`}
          >
            The Pair (Duo)
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
                  Camera feed active in virtual testing mode. Use touch or mouse gestures to position, rotate 360° (pitch & yaw), extend the handle, and open the case directly in physical space.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 360° Spherical Angle Preset Quick Selector Pill Bar */}
        <div className="absolute top-20 sm:top-24 z-30 flex items-center gap-1.5 p-1 rounded-full bg-black/75 border border-white/20 backdrop-blur-md text-white shadow-xl max-w-[95vw] overflow-x-auto">
          <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-sky px-2 hidden sm:inline">
            360° Angle:
          </span>
          {ANGLE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectAnglePreset(p.id)}
              className={`rounded-full px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold transition-all whitespace-nowrap ${
                activeAnglePreset === p.id
                  ? "bg-white text-navy font-bold shadow-xs scale-102"
                  : "text-white/75 hover:text-white hover:bg-white/10"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* End-to-End Functional TRACE Smart Core Scale HUD Overlay */}
        {isWeighingActive && (
          <div className="absolute top-32 sm:top-34 z-30 max-w-md w-[92vw] sm:w-[440px] animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
            <div className="flex flex-col gap-3 rounded-3xl border border-sky/40 bg-black/90 p-3.5 sm:p-4 text-white backdrop-blur-xl shadow-2xl">
              {/* Header: Live Digital Weight & Unit Switcher */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-sky/20 text-sky">
                    <Scale className={`size-4.5 ${scaleCalibrating ? "animate-spin" : "animate-pulse"}`} />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-2xl font-black text-white tracking-tight">
                        {scaleCalibrating ? "CALIBRATING..." : `${totalGrossDisplay} ${weightUnit}`}
                      </span>
                      <span className="text-[11px] text-white/50">
                        {scaleCalibrating
                          ? ""
                          : weightUnit === "kg"
                          ? `(${(totalGrossKg * 2.20462).toFixed(1)} lbs)`
                          : `(${(totalGrossKg).toFixed(1)} kg)`}
                      </span>
                    </div>
                    <span className="text-[9.5px] font-mono uppercase text-sky">
                      TRACE Ergonomic Strain-Gauge Core · Tare: {baseTareKg} kg
                    </span>
                  </div>
                </div>

                {/* kg / lbs toggle & Tare button */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setWeightUnit(weightUnit === "kg" ? "lbs" : "kg")}
                    className="rounded-lg bg-white/15 px-2 py-1 text-[10px] font-bold text-white hover:bg-white/25 active:scale-95"
                    title="Switch Weight Unit"
                  >
                    {weightUnit.toUpperCase()}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTareOffsetKg(tareOffsetKg > 0 ? 0 : totalGrossKg)}
                    className="rounded-lg bg-sky/20 border border-sky/40 px-2 py-1 text-[10px] font-bold text-sky hover:bg-sky/30 active:scale-95"
                    title="Zero out or reset tare"
                  >
                    {tareOffsetKg > 0 ? "Reset Tare" : "Tare (0.0)"}
                  </button>
                </div>
              </div>

              {/* Real-time Airline Allowance Validation Badge */}
              <div className={`flex items-start gap-2 rounded-xl p-2.5 border text-caption ${complianceStatus.badgeClass}`}>
                {complianceStatus.level === "safe" ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : complianceStatus.level === "warning" ? (
                  <AlertTriangle className="size-4 shrink-0 text-amber-400 mt-0.5" />
                ) : (
                  <AlertCircle className="size-4 shrink-0 text-rose-400 mt-0.5" />
                )}
                <div className="flex flex-col text-[11px] leading-tight">
                  <span className="font-bold">{complianceStatus.label}</span>
                  <span className="text-[10px] opacity-85 mt-0.5">{complianceStatus.note}</span>
                </div>
              </div>

              {/* Interactive Packing Simulator Presets */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/70">
                  Simulate Packing Contents:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {PACK_TIERS.map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => {
                        setSelectedPackTier(tier.id);
                        setCustomPackKg(0);
                      }}
                      className={`rounded-xl p-1.5 text-center border transition-all ${
                        selectedPackTier === tier.id && customPackKg === 0
                          ? "bg-sky text-navy border-sky font-bold shadow-xs"
                          : "bg-white/5 text-white/80 border-white/10 hover:bg-white/15"
                      }`}
                    >
                      <div className="text-[10px] font-bold truncate">{tier.label.split(" ")[0]}</div>
                      <div className="text-[9px] opacity-75 font-mono">{tier.addedKg > 0 ? `+${tier.addedKg}kg` : "Tare"}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Airline Rule Comparison Selector */}
              <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[10px]">
                <span className="font-mono text-white/60">Airline Limits:</span>
                <div className="flex items-center gap-1">
                  {AIRLINE_LIMITS.slice(0, 4).map((air) => (
                    <button
                      key={air.id}
                      type="button"
                      onClick={() => setSelectedAirlineId(air.id)}
                      className={`rounded-md px-1.5 py-0.5 text-[9.5px] font-medium transition-all ${
                        selectedAirlineId === air.id
                          ? "bg-white text-navy font-bold"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      {air.name.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Three.js 3D Bag Canvas Overlay */}
        <div ref={hostRef} className="absolute inset-0 size-full z-20 pointer-events-auto cursor-grab active:cursor-grabbing" />

        {/* Interactive AR Feature Action Bar - Positioned responsively */}
        <div className="absolute bottom-[88px] sm:bottom-auto sm:top-36 inset-x-3 sm:inset-x-auto sm:left-6 z-30 flex flex-row sm:flex-col items-center sm:items-start justify-center gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Clamshell Open/Close Toggle with Tactile Zipper Audio */}
          <button
            type="button"
            onClick={handleToggleClamshell}
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-[11px] font-bold shadow-lg backdrop-blur-md border transition-all ${
              isCaseOpen
                ? "bg-sky text-navy border-sky font-extrabold"
                : "bg-black/70 text-white border-white/20 hover:bg-black/90"
            }`}
          >
            <FolderOpen className="size-3 sm:size-3.5" />
            <span>{isCaseOpen ? "Close Interior" : "Open Case (Zip)"}</span>
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
            <span>{isHandleExtended ? "Retract Handle" : "Extend Handle"}</span>
          </button>

          {/* Digital Scale Weighing HUD Toggle with Lift Simulation */}
          <button
            type="button"
            onClick={handleToggleWeighing}
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-[11px] font-bold shadow-lg backdrop-blur-md border transition-all ${
              isWeighingActive
                ? "bg-emerald-500 text-white border-emerald-400 font-extrabold shadow-emerald-500/30"
                : "bg-black/70 text-white border-white/20 hover:bg-black/90"
            }`}
          >
            <Scale className="size-3 sm:size-3.5" />
            <span>{isWeighingActive ? "Hide Scale" : "Weigh Bag (TRACE)"}</span>
          </button>
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
              {scale === 1.0 ? "1:1 True Scale" : `${Math.round(scale * 100)}%`}
            </span>
          </div>

          {/* Quick Real-World Actions */}
          <div className="flex items-center justify-end w-full sm:w-auto gap-2">
            <button
              type="button"
              onClick={() => {
                scaleRef.current = 1.0;
                setScale(1.0);
                pitchRef.current = 0;
                yawRef.current = 0.2;
                panXRef.current = 0;
                panYRef.current = -0.35;
                setIsCaseOpen(false);
                setIsHandleExtended(false);
                setIsWeighingActive(false);
                isLiftingRef.current = false;
                setActiveAnglePreset("front");
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
              disabled={isCapturing}
              className="flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-1.5 text-[10.5px] sm:text-[11px] font-bold text-white shadow-md hover:bg-navy-deep active:scale-95 transition-all disabled:opacity-50"
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
                  : "Check-In 68 (68 × 45 × 28 cm)"}{" "}
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
    </div>,
    document.body
  );
}
