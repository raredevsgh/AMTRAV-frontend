import type * as Three from "three";

/**
 * Creates a canvas-based procedural bump map for micro-texture (suede nap / fabric grain)
 */
function createSuedeNapTexture(THREE: typeof Three): Three.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 256, 256);

  const imgData = ctx.getImageData(0, 0, 256, 256);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const val = 128 + (Math.random() - 0.5) * 45;
    d[i] = val;
    d[i + 1] = val;
    d[i + 2] = val;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

/**
 * Builds an ultra-realistic, handcrafted Italian Suede Duffel Bag (32L)
 * with authentic suede sheen, leather harness straps, arched handles,
 * aluminium fluted central runner, brass hardware, zipper track, and floor studs.
 */
export function createUltraRealisticDuffel(
  THREE: typeof Three,
  initialColorHex: string = "#6e3b1b"
) {
  const rootGroup = new THREE.Group();
  rootGroup.name = "AMTRAV_Realistic_Suede_Duffel";

  const napTexture = createSuedeNapTexture(THREE);

  // 1. High-Fidelity Suede PBR Material with fabric sheen
  const suedeMat = new THREE.MeshPhysicalMaterial({
    color: initialColorHex,
    roughness: 0.88,
    metalness: 0.02,
    sheen: 1.0,
    sheenColor: new THREE.Color(initialColorHex).lerp(new THREE.Color(0xffffff), 0.4),
    sheenRoughness: 0.55,
    clearcoat: 0.04,
    clearcoatRoughness: 0.85,
  });
  if (napTexture) {
    suedeMat.bumpMap = napTexture;
    suedeMat.bumpScale = 0.008;
  }
  suedeMat.name = "Shell";

  // 2. Leather Trim Materials (Full-Grain Bridle Leather)
  const leatherMat = new THREE.MeshStandardMaterial({
    color: 0x161616,
    roughness: 0.45,
    metalness: 0.12,
  });

  // 3. Hardware Materials (Solid Brushed Brass & Aerospace Aluminium)
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.28,
    metalness: 0.88,
  });
  const aluMat = new THREE.MeshStandardMaterial({
    color: 0xdde2e8,
    metalness: 0.95,
    roughness: 0.18,
  });

  // Main Suede Duffel Body (Segmented soft barrel: width 0.74, radius 0.22)
  const bodyGeo = new THREE.CylinderGeometry(0.24, 0.25, 0.74, 36, 1);
  bodyGeo.rotateZ(Math.PI / 2);
  bodyGeo.scale(1, 1.12, 1); // Slight vertical flattening for luxury luggage drape
  const bodyMesh = new THREE.Mesh(bodyGeo, suedeMat);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  rootGroup.add(bodyMesh);

  // Soft Suede Convex End Caps with Leather Piping
  const endCapGeo = new THREE.SphereGeometry(0.24, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2);
  endCapGeo.scale(0.35, 1.12, 1);

  // Left End Cap
  const leftEnd = new THREE.Mesh(endCapGeo, suedeMat);
  leftEnd.rotation.z = Math.PI / 2;
  leftEnd.position.x = -0.37;
  leftEnd.castShadow = true;
  rootGroup.add(leftEnd);

  // Right End Cap
  const rightEnd = new THREE.Mesh(endCapGeo, suedeMat);
  rightEnd.rotation.z = -Math.PI / 2;
  rightEnd.position.x = 0.37;
  rightEnd.castShadow = true;
  rootGroup.add(rightEnd);

  // Leather Piping Rings around the end caps
  const pipingGeo = new THREE.TorusGeometry(0.245, 0.009, 16, 48);
  pipingGeo.scale(1, 1.12, 1);
  pipingGeo.rotateY(Math.PI / 2);

  const leftPiping = new THREE.Mesh(pipingGeo, leatherMat);
  leftPiping.position.x = -0.37;
  rootGroup.add(leftPiping);

  const rightPiping = new THREE.Mesh(pipingGeo, leatherMat);
  rightPiping.position.x = 0.37;
  rootGroup.add(rightPiping);

  // Twin Bridle Leather Reinforcement Harness Straps
  const strapGeo = new THREE.TorusGeometry(0.246, 0.016, 16, 48);
  strapGeo.scale(1, 1.13, 1);
  strapGeo.rotateY(Math.PI / 2);

  const strap1 = new THREE.Mesh(strapGeo, leatherMat);
  strap1.position.x = -0.19;
  rootGroup.add(strap1);

  const strap2 = new THREE.Mesh(strapGeo, leatherMat);
  strap2.position.x = 0.19;
  rootGroup.add(strap2);

  // Signature AMTRAV Ribbed Aerospace Aluminium Spine Runner (Top center)
  const aluSpineGeo = new THREE.BoxGeometry(0.045, 0.008, 0.72);
  const aluSpine = new THREE.Mesh(aluSpineGeo, aluMat);
  aluSpine.position.set(0, 0.272, 0);
  rootGroup.add(aluSpine);

  // Laser-Etched Aluminium Logo Badge (Front face)
  const badgeGeo = new THREE.BoxGeometry(0.14, 0.045, 0.005);
  const badge = new THREE.Mesh(badgeGeo, aluMat);
  badge.position.set(0, 0.06, 0.248);
  rootGroup.add(badge);

  // Top Brass Zipper Track along the apex
  const zipTrackGeo = new THREE.BoxGeometry(0.012, 0.004, 0.68);
  const zipTrack = new THREE.Mesh(zipTrackGeo, brassMat);
  zipTrack.position.set(0, 0.276, 0);
  rootGroup.add(zipTrack);

  // Twin Brass Zipper Sliders & Leather Pull Tabs
  for (const xOffset of [-0.03, 0.03]) {
    const sliderGeo = new THREE.BoxGeometry(0.02, 0.012, 0.016);
    const slider = new THREE.Mesh(sliderGeo, brassMat);
    slider.position.set(xOffset, 0.282, 0);
    rootGroup.add(slider);

    const pullGeo = new THREE.BoxGeometry(0.008, 0.003, 0.04);
    const pull = new THREE.Mesh(pullGeo, leatherMat);
    pull.rotation.x = Math.PI / 6;
    pull.position.set(xOffset, 0.278, 0.025);
    rootGroup.add(pull);
  }

  // Dual Arched Tubular Leather Carry Handles (Front & Back)
  for (const zSide of [-0.14, 0.14]) {
    const handleCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.19, 0.24, zSide),
      new THREE.Vector3(0, 0.49, zSide * 0.4),
      new THREE.Vector3(0.19, 0.24, zSide)
    );
    const handleGeo = new THREE.TubeGeometry(handleCurve, 24, 0.014, 14, false);
    const handleMesh = new THREE.Mesh(handleGeo, leatherMat);
    handleMesh.castShadow = true;
    rootGroup.add(handleMesh);

    // Brass D-Rings at handle anchors
    for (const xAnchor of [-0.19, 0.19]) {
      const ringGeo = new THREE.TorusGeometry(0.022, 0.005, 12, 24);
      const ring = new THREE.Mesh(ringGeo, brassMat);
      ring.position.set(xAnchor, 0.245, zSide);
      rootGroup.add(ring);
    }
  }

  // Center Leather Handle-Wrap with Gold Snap Fasteners
  const wrapGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.12, 20);
  wrapGeo.rotateZ(Math.PI / 2);
  const wrap = new THREE.Mesh(wrapGeo, leatherMat);
  wrap.position.set(0, 0.485, 0);
  rootGroup.add(wrap);

  for (const snapX of [-0.035, 0.035]) {
    const snapGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.004, 16);
    const snap = new THREE.Mesh(snapGeo, brassMat);
    snap.position.set(snapX, 0.513, 0);
    rootGroup.add(snap);
  }

  // Side Hardware: Solid Brass D-Rings & Shoulder Strap Clasps
  for (const sideX of [-0.38, 0.38]) {
    const sideTabGeo = new THREE.BoxGeometry(0.015, 0.05, 0.03);
    const sideTab = new THREE.Mesh(sideTabGeo, leatherMat);
    sideTab.position.set(sideX, 0.12, 0);
    rootGroup.add(sideTab);

    const sideDringGeo = new THREE.TorusGeometry(0.025, 0.006, 12, 24);
    const sideDring = new THREE.Mesh(sideDringGeo, brassMat);
    sideDring.position.set(sideX + (sideX > 0 ? 0.01 : -0.01), 0.14, 0);
    sideDring.rotation.y = Math.PI / 2;
    rootGroup.add(sideDring);
  }

  // 5 Protective Solid Brass Dome Floor Studs on the bottom
  const studPositions = [
    [-0.26, -0.27, -0.09],
    [-0.26, -0.27, 0.09],
    [0.26, -0.27, -0.09],
    [0.26, -0.27, 0.09],
    [0, -0.27, 0],
  ];
  for (const [sx, sy, sz] of studPositions) {
    const studGeo = new THREE.SphereGeometry(0.012, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    studGeo.rotateX(Math.PI);
    const stud = new THREE.Mesh(studGeo, brassMat);
    stud.position.set(sx, sy, sz);
    rootGroup.add(stud);
  }

  // Elevate group so base rests at floor y = 0
  rootGroup.position.set(0, 0.28, 0);

  const updateColor = (hex: string) => {
    suedeMat.color.set(hex);
    suedeMat.sheenColor.set(new THREE.Color(hex).lerp(new THREE.Color(0xffffff), 0.4));
    suedeMat.needsUpdate = true;
  };

  return {
    group: rootGroup,
    suedeMaterial: suedeMat,
    updateColor,
  };
}

/**
 * Creates a canvas-based procedural bump map for diamond-quilted luxury interior lining
 */
function createDiamondQuiltTexture(THREE: typeof Three): Three.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#181e2b";
  ctx.fillRect(0, 0, 256, 256);

  // Draw diamond stitching grid
  ctx.strokeStyle = "#384560";
  ctx.lineWidth = 1.5;
  const step = 32;
  for (let x = -256; x <= 512; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 256, 256);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, 256);
    ctx.lineTo(x + 256, 0);
    ctx.stroke();
  }

  // Micro fabric noise
  const imgData = ctx.getImageData(0, 0, 256, 256);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const noise = (Math.random() - 0.5) * 18;
    d[i] = Math.min(255, Math.max(0, d[i] + noise));
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + noise));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 4);
  return texture;
}

/**
 * Creates a canvas-based procedural texture for the zippered mesh divider panel
 */
function createMeshPanelTexture(THREE: typeof Three): Three.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "rgba(18, 24, 38, 0.94)";
  ctx.fillRect(0, 0, 256, 256);

  // Hexagonal / grid perforation pattern
  ctx.fillStyle = "rgba(42, 56, 85, 0.7)";
  const r = 3;
  for (let y = 4; y < 256; y += 8) {
    const xOffset = (y % 16 === 0) ? 0 : 4;
    for (let x = 4 + xOffset; x < 256; x += 8) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 6);
  return texture;
}

/**
 * Creates a dynamic OLED screen canvas texture for the luggage handle
 */
function createHandleOledTexture(
  THREE: typeof Three,
  text: string = "TRACE 14.2 kg"
): { texture: Three.CanvasTexture; updateText: (t: string) => void } {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;

  const render = (val: string) => {
    ctx.fillStyle = "#050811";
    ctx.fillRect(0, 0, 256, 64);

    // Glowing border
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, 248, 56);

    // Cyan glowing digital font
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 26px 'SF Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(val, 128, 32);
  };

  render(text);
  const texture = new THREE.CanvasTexture(canvas);

  const updateText = (newVal: string) => {
    render(newVal);
    texture.needsUpdate = true;
  };

  return { texture, updateText };
}

/**
 * Builds a photorealistic luxury suitcase (Cabin 55 or Check-In 68) with:
 * - Both rear packing tub and hinged front lid with authentic AMTRAV vertical flutes/ribs
 * - 4 Hinomoto 360° dual-spinner caster wheels with graphite hubcaps and rubber treads
 * - Recessed corner bumper guards on all corners
 * - Top ergonomic carry handle with digital OLED scale display
 * - Telescopic trolley handle with extendable dual aerospace aluminium tubes
 * - Side carry handle and side TSA combination lock
 * - Complete interior:
 *   - Right tub: Deep packing compartment with dark luxury diamond-quilted lining,
 *     royal blue compression butterfly straps with brushed aluminium buckle
 *   - Left lid: Hinged front shell with zippered micro-mesh divider panel,
 *     toiletry zip compartment, and AMORTRAV Atelier leather label
 * - Animated brass perimeter zipper slider with track traversal
 * - Seamless closed-to-open clamshell unfolding on its left hinge from 0° to 110°
 */
export function createInteriorOpenSuitcase(
  THREE: typeof Three,
  shellColorHex: string = "#1a1a1c",
  metalness: number = 0.65,
  roughness: number = 0.28
) {
  const root = new THREE.Group();
  root.name = "AMTRAV_Photorealistic_Clamshell_Suitcase";

  // --- 1. Materials ---
  const shellMat = new THREE.MeshPhysicalMaterial({
    color: shellColorHex,
    metalness: metalness ?? 0.65,
    roughness: roughness ?? 0.28,
    clearcoat: 0.15,
    clearcoatRoughness: 0.25,
  });
  shellMat.name = "Shell";

  const ribMat = new THREE.MeshPhysicalMaterial({
    color: shellColorHex,
    metalness: Math.min(1.0, (metalness ?? 0.65) * 1.1),
    roughness: Math.max(0.15, (roughness ?? 0.28) * 0.9),
    clearcoat: 0.2,
  });
  ribMat.name = "Rib";

  const graphiteMat = new THREE.MeshStandardMaterial({
    color: 0x1f232b,
    roughness: 0.42,
    metalness: 0.55,
  });

  const aluMat = new THREE.MeshStandardMaterial({
    color: 0xd6dbe3,
    metalness: 0.94,
    roughness: 0.18,
  });

  const rubberMat = new THREE.MeshStandardMaterial({
    color: 0x111317,
    roughness: 0.85,
    metalness: 0.05,
  });

  const goldBrassMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.28,
    metalness: 0.88,
  });

  const strapMat = new THREE.MeshStandardMaterial({
    color: 0x2563eb, // Royal Blue satin
    roughness: 0.48,
    metalness: 0.1,
  });

  const quiltTex = createDiamondQuiltTexture(THREE);
  const liningMat = new THREE.MeshStandardMaterial({
    color: 0x131926,
    roughness: 0.82,
    metalness: 0.06,
  });
  if (quiltTex) {
    liningMat.bumpMap = quiltTex;
    liningMat.bumpScale = 0.015;
  }

  const meshTex = createMeshPanelTexture(THREE);
  const meshPanelMat = new THREE.MeshStandardMaterial({
    color: 0x1a2130,
    roughness: 0.75,
    metalness: 0.08,
    transparent: true,
    opacity: 0.92,
  });
  if (meshTex) {
    meshPanelMat.map = meshTex;
  }

  const { texture: oledTexture, updateText: updateOledText } = createHandleOledTexture(THREE, "TRACE 14.2 kg");
  const oledScreenMat = new THREE.MeshBasicMaterial({ map: oledTexture });

  // Suitcase Half Dimensions: Width: 0.45, Height: 0.68, Depth of half: 0.125
  const W = 0.45;
  const H = 0.68;
  const D = 0.125;
  const radius = 0.035;

  // Helper to add fluted exterior ribs to a shell panel
  function addFlutedRibs(parent: Three.Group, zPos: number, isFront: boolean) {
    const numRibs = 5;
    const spacing = 0.07;
    for (let i = -Math.floor(numRibs / 2); i <= Math.floor(numRibs / 2); i++) {
      const ribGeo = new THREE.CylinderGeometry(0.007, 0.007, H * 0.78, 16);
      const rib = new THREE.Mesh(ribGeo, ribMat);
      rib.position.set(i * spacing, 0, zPos + (isFront ? 0.006 : -0.006));
      rib.castShadow = true;
      parent.add(rib);
    }
  }

  // Helper to create 4 corner bumper guards
  function addCornerBumpers(parent: Three.Group, zPos: number) {
    const corners = [
      [-W / 2 + 0.02, H / 2 - 0.02],
      [W / 2 - 0.02, H / 2 - 0.02],
      [-W / 2 + 0.02, -H / 2 + 0.02],
      [W / 2 - 0.02, -H / 2 + 0.02],
    ];
    for (const [cx, cy] of corners) {
      const bumperGeo = new THREE.BoxGeometry(0.045, 0.045, 0.03);
      const bumper = new THREE.Mesh(bumperGeo, graphiteMat);
      bumper.position.set(cx, cy, zPos);
      parent.add(bumper);
    }
  }

  // --- PART 1: REAR BASE TUB (Stationary back half, holds wheels, handles, locks) ---
  const tubGroup = new THREE.Group();
  tubGroup.name = "Rear_Packing_Tub_With_Wheels";

  // Rear Outer Shell Box Back panel
  const tubBackGeo = new THREE.BoxGeometry(W, H, 0.016);
  const tubBack = new THREE.Mesh(tubBackGeo, shellMat);
  tubBack.position.set(0, 0, -D);
  tubBack.castShadow = true;
  tubBack.receiveShadow = true;
  tubGroup.add(tubBack);

  // Exterior Fluted Ribs on rear shell
  addFlutedRibs(tubGroup, -D, false);
  addCornerBumpers(tubGroup, -D + 0.005);

  // Rear Tub Perimeter Walls (Top, Bottom, Left, Right)
  const tubTopBottomGeo = new THREE.BoxGeometry(W, 0.016, D);
  const tubLeftRightGeo = new THREE.BoxGeometry(0.016, H, D);

  const tubTop = new THREE.Mesh(tubTopBottomGeo, shellMat);
  tubTop.position.set(0, H / 2, -D / 2);
  tubTop.castShadow = true;
  tubGroup.add(tubTop);

  const tubBottom = new THREE.Mesh(tubTopBottomGeo, shellMat);
  tubBottom.position.set(0, -H / 2, -D / 2);
  tubBottom.castShadow = true;
  tubGroup.add(tubBottom);

  const tubLeft = new THREE.Mesh(tubLeftRightGeo, shellMat);
  tubLeft.position.set(-W / 2, 0, -D / 2);
  tubLeft.castShadow = true;
  tubGroup.add(tubLeft);

  const tubRight = new THREE.Mesh(tubLeftRightGeo, shellMat);
  tubRight.position.set(W / 2, 0, -D / 2);
  tubRight.castShadow = true;
  tubGroup.add(tubRight);

  // Central Aluminium Perimeter Gasket Rim
  const rimGeo = new THREE.BoxGeometry(W + 0.01, H + 0.01, 0.012);
  const tubRim = new THREE.Mesh(rimGeo, aluMat);
  tubRim.position.set(0, 0, 0.002);
  tubGroup.add(tubRim);

  // Deep Interior Bed with Diamond-Quilted Luxury Lining
  const tubBedGeo = new THREE.BoxGeometry(W - 0.025, H - 0.025, 0.01);
  const tubBed = new THREE.Mesh(tubBedGeo, liningMat);
  tubBed.position.set(0, 0, -D + 0.012);
  tubBed.receiveShadow = true;
  tubGroup.add(tubBed);

  // Interior Side Walls with Quilted Lining
  const inWallTopBottomGeo = new THREE.BoxGeometry(W - 0.025, 0.008, D - 0.02);
  const inWallLeftRightGeo = new THREE.BoxGeometry(0.008, H - 0.025, D - 0.02);

  const inWallTop = new THREE.Mesh(inWallTopBottomGeo, liningMat);
  inWallTop.position.set(0, H / 2 - 0.01, -D / 2);
  tubGroup.add(inWallTop);

  const inWallBottom = new THREE.Mesh(inWallTopBottomGeo, liningMat);
  inWallBottom.position.set(0, -H / 2 + 0.01, -D / 2);
  tubGroup.add(inWallBottom);

  const inWallLeft = new THREE.Mesh(inWallLeftRightGeo, liningMat);
  inWallLeft.position.set(-W / 2 + 0.01, 0, -D / 2);
  tubGroup.add(inWallLeft);

  const inWallRight = new THREE.Mesh(inWallLeftRightGeo, liningMat);
  inWallRight.position.set(W / 2 - 0.01, 0, -D / 2);
  tubGroup.add(inWallRight);

  // Satin Royal Blue Butterfly Compression Straps (X Criss-Cross)
  const strapX1Geo = new THREE.BoxGeometry(0.64, 0.026, 0.006);
  const strapX1 = new THREE.Mesh(strapX1Geo, strapMat);
  strapX1.rotation.z = Math.PI / 4.1;
  strapX1.position.set(0, 0, -0.035);
  tubGroup.add(strapX1);

  const strapX2 = new THREE.Mesh(strapX1Geo, strapMat);
  strapX2.rotation.z = -Math.PI / 4.1;
  strapX2.position.set(0, 0, -0.035);
  tubGroup.add(strapX2);

  // Central Brushed Aerospace Aluminium Magnetic Buckle with Laser-Etched AMTRAV Logo
  const buckleGeo = new THREE.BoxGeometry(0.05, 0.05, 0.014);
  const buckle = new THREE.Mesh(buckleGeo, aluMat);
  buckle.position.set(0, 0, -0.028);
  tubGroup.add(buckle);

  const buckleCoreGeo = new THREE.BoxGeometry(0.04, 0.018, 0.016);
  const buckleCore = new THREE.Mesh(buckleCoreGeo, graphiteMat);
  buckleCore.position.set(0, 0, -0.027);
  tubGroup.add(buckleCore);

  // Internal Zipped Security Pocket along the right wall (for passport / TRACE card)
  const pocketGeo = new THREE.BoxGeometry(0.36, 0.16, 0.008);
  const pocket = new THREE.Mesh(pocketGeo, meshPanelMat);
  pocket.position.set(0, -0.16, -D + 0.022);
  tubGroup.add(pocket);

  const pocketZipGeo = new THREE.BoxGeometry(0.34, 0.006, 0.006);
  const pocketZip = new THREE.Mesh(pocketZipGeo, aluMat);
  pocketZip.position.set(0, -0.075, -D + 0.024);
  tubGroup.add(pocketZip);

  // 4 Hinomoto 360° Dual Spinner Caster Wheels on the bottom of the tub
  const wheelPositions = [
    [-W / 2 + 0.045, -H / 2 - 0.04, -D + 0.035],
    [W / 2 - 0.045, -H / 2 - 0.04, -D + 0.035],
    [-W / 2 + 0.045, -H / 2 - 0.04, -0.035],
    [W / 2 - 0.045, -H / 2 - 0.04, -0.035],
  ];

  wheelPositions.forEach(([wx, wy, wz]) => {
    const forkGeo = new THREE.CylinderGeometry(0.014, 0.016, 0.035, 16);
    const fork = new THREE.Mesh(forkGeo, graphiteMat);
    fork.position.set(wx, wy + 0.018, wz);
    fork.castShadow = true;
    tubGroup.add(fork);

    // Dual rotating wheels per caster
    for (const tireOffset of [-0.01, 0.01]) {
      const tireGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.012, 24);
      tireGeo.rotateZ(Math.PI / 2);
      const tire = new THREE.Mesh(tireGeo, rubberMat);
      tire.position.set(wx + tireOffset, wy - 0.01, wz);
      tire.castShadow = true;
      tubGroup.add(tire);

      const hubGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.013, 16);
      hubGeo.rotateZ(Math.PI / 2);
      const hub = new THREE.Mesh(hubGeo, aluMat);
      hub.position.set(wx + tireOffset, wy - 0.01, wz);
      tubGroup.add(hub);
    }
  });

  // Top Ergonomic Carry Handle with Embedded Digital OLED Scale Display
  const topHandleBaseGeo = new THREE.BoxGeometry(0.24, 0.018, 0.045);
  const topHandleBase = new THREE.Mesh(topHandleBaseGeo, graphiteMat);
  topHandleBase.position.set(0, H / 2 + 0.012, -D / 2);
  tubGroup.add(topHandleBase);

  // Digital OLED Screen Strip on the handle
  const oledGeo = new THREE.PlaneGeometry(0.12, 0.024);
  const oledMesh = new THREE.Mesh(oledGeo, oledScreenMat);
  oledMesh.rotation.x = -Math.PI / 2;
  oledMesh.position.set(0, H / 2 + 0.022, -D / 2);
  tubGroup.add(oledMesh);

  // Top Handle Grip Strap
  const topGripGeo = new THREE.BoxGeometry(0.18, 0.02, 0.03);
  const topGrip = new THREE.Mesh(topGripGeo, rubberMat);
  topGrip.position.set(0, H / 2 + 0.026, -D / 2);
  tubGroup.add(topGrip);

  // Side Carry Handle
  const sideHandleGeo = new THREE.BoxGeometry(0.018, 0.18, 0.035);
  const sideHandle = new THREE.Mesh(sideHandleGeo, rubberMat);
  sideHandle.position.set(W / 2 + 0.014, 0, -D / 2);
  tubGroup.add(sideHandle);

  // Side TSA 008 Lock Housing with 3 Number Dials
  const tsaLockGeo = new THREE.BoxGeometry(0.018, 0.1, 0.045);
  const tsaLock = new THREE.Mesh(tsaLockGeo, graphiteMat);
  tsaLock.position.set(W / 2 + 0.012, 0.14, -D / 2);
  tubGroup.add(tsaLock);

  // Telescopic Trolley Handle (Anchored on rear of tub)
  const handleTelescopicGroup = new THREE.Group();
  const tubeGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.44, 20);

  const leftTube = new THREE.Mesh(tubeGeo, aluMat);
  leftTube.position.set(-0.13, H / 2 + 0.22, -D + 0.02);
  handleTelescopicGroup.add(leftTube);

  const rightTube = new THREE.Mesh(tubeGeo, aluMat);
  rightTube.position.set(0.13, H / 2 + 0.22, -D + 0.02);
  handleTelescopicGroup.add(rightTube);

  const trolleyGripGeo = new THREE.BoxGeometry(0.32, 0.035, 0.045);
  const trolleyGrip = new THREE.Mesh(trolleyGripGeo, graphiteMat);
  trolleyGrip.position.set(0, H / 2 + 0.44, -D + 0.02);
  handleTelescopicGroup.add(trolleyGrip);

  handleTelescopicGroup.position.y = 0;
  tubGroup.add(handleTelescopicGroup);

  root.add(tubGroup);

  // --- PART 2: HINGED FRONT LID (Left Half, swings open on left hinge) ---
  // Left Hinge Axis positioned at left edge seam: x = -W / 2, z = 0
  const hingeGroup = new THREE.Group();
  hingeGroup.name = "Front_Lid_Hinge_Assembly";
  hingeGroup.position.set(-W / 2, 0, 0);

  const lidSubGroup = new THREE.Group();
  // Offset lid so its left edge sits exactly at the hinge origin
  lidSubGroup.position.set(W / 2, 0, 0);

  // Front Outer Shell Box Front panel
  const lidFrontGeo = new THREE.BoxGeometry(W, H, 0.016);
  const lidFront = new THREE.Mesh(lidFrontGeo, shellMat);
  lidFront.position.set(0, 0, D);
  lidFront.castShadow = true;
  lidFront.receiveShadow = true;
  lidSubGroup.add(lidFront);

  // Exterior Fluted Ribs on front shell
  addFlutedRibs(lidSubGroup, D, true);
  addCornerBumpers(lidSubGroup, D - 0.005);

  // Laser-Cut AMORTRAV Metal Wordmark Badge on front face
  const wordmarkGeo = new THREE.BoxGeometry(0.16, 0.028, 0.006);
  const wordmark = new THREE.Mesh(wordmarkGeo, aluMat);
  wordmark.position.set(0, 0.18, D + 0.012);
  lidSubGroup.add(wordmark);

  // Front Lid Perimeter Walls (Top, Bottom, Left, Right)
  const lidTopBottomGeo = new THREE.BoxGeometry(W, 0.016, D);
  const lidLeftRightGeo = new THREE.BoxGeometry(0.016, H, D);

  const lidTop = new THREE.Mesh(lidTopBottomGeo, shellMat);
  lidTop.position.set(0, H / 2, D / 2);
  lidTop.castShadow = true;
  lidSubGroup.add(lidTop);

  const lidBottom = new THREE.Mesh(lidTopBottomGeo, shellMat);
  lidBottom.position.set(0, -H / 2, D / 2);
  lidBottom.castShadow = true;
  lidSubGroup.add(lidBottom);

  const lidLeft = new THREE.Mesh(lidLeftRightGeo, shellMat);
  lidLeft.position.set(-W / 2, 0, D / 2);
  lidLeft.castShadow = true;
  lidSubGroup.add(lidLeft);

  const lidRight = new THREE.Mesh(lidLeftRightGeo, shellMat);
  lidRight.position.set(W / 2, 0, D / 2);
  lidRight.castShadow = true;
  lidSubGroup.add(lidRight);

  // Front Lid Aluminium Perimeter Rim
  const lidRim = new THREE.Mesh(rimGeo, aluMat);
  lidRim.position.set(0, 0, -0.002);
  lidSubGroup.add(lidRim);

  // Front Lid Interior: Full-Coverage Zippered Mesh Divider Panel
  const dividerPanelGeo = new THREE.PlaneGeometry(W - 0.03, H - 0.03);
  const dividerPanel = new THREE.Mesh(dividerPanelGeo, meshPanelMat);
  dividerPanel.position.set(0, 0, 0.008);
  dividerPanel.receiveShadow = true;
  lidSubGroup.add(dividerPanel);

  // Perimeter Metal Zipper Track around Mesh Panel
  const dividerZipGeo = new THREE.RingGeometry(0.24, 0.25, 4);
  dividerZipGeo.scale(1.48, 0.88, 1);
  const dividerZip = new THREE.Mesh(dividerZipGeo, aluMat);
  dividerZip.position.set(0, 0, 0.012);
  lidSubGroup.add(dividerZip);

  // Dual Zipper Sliders on Divider with Leather Pull Ribbons
  for (const zx of [-0.06, 0.06]) {
    const sliderGeo = new THREE.BoxGeometry(0.016, 0.025, 0.01);
    const slider = new THREE.Mesh(sliderGeo, goldBrassMat);
    slider.position.set(zx, 0.08, 0.015);
    lidSubGroup.add(slider);

    const ribbonGeo = new THREE.BoxGeometry(0.008, 0.038, 0.004);
    const ribbon = new THREE.Mesh(ribbonGeo, graphiteMat);
    ribbon.position.set(zx, 0.05, 0.017);
    lidSubGroup.add(ribbon);
  }

  // Stamped Leather Atelier Label: "AMORTRAV · LIFETIME GUARANTEE"
  const labelGeo = new THREE.BoxGeometry(0.14, 0.045, 0.006);
  const label = new THREE.Mesh(labelGeo, graphiteMat);
  label.position.set(0, -0.16, 0.014);
  lidSubGroup.add(label);

  const labelCoreGeo = new THREE.BoxGeometry(0.12, 0.028, 0.008);
  const labelCore = new THREE.Mesh(labelCoreGeo, goldBrassMat);
  labelCore.position.set(0, -0.16, 0.015);
  lidSubGroup.add(labelCore);

  hingeGroup.add(lidSubGroup);
  root.add(hingeGroup);

  // --- PART 3: PERIMETER BRASS ZIPPER SLIDER (Animates around the seam) ---
  const perimeterZipSlider = new THREE.Group();
  perimeterZipSlider.name = "Perimeter_Zipper_Slider";

  const zipBodyGeo = new THREE.BoxGeometry(0.022, 0.024, 0.032);
  const zipBody = new THREE.Mesh(zipBodyGeo, goldBrassMat);
  perimeterZipSlider.add(zipBody);

  const zipTabGeo = new THREE.BoxGeometry(0.01, 0.042, 0.006);
  const zipTab = new THREE.Mesh(zipTabGeo, graphiteMat);
  zipTab.position.set(0, -0.028, 0.014);
  zipTab.rotation.x = Math.PI / 8;
  perimeterZipSlider.add(zipTab);

  perimeterZipSlider.position.set(W / 2 + 0.01, H / 2 - 0.02, 0);
  root.add(perimeterZipSlider);

  // Initial closed state: hinge rotation = 0
  hingeGroup.rotation.y = 0;

  // Clamshell Angle Setter (smooth 0 -> 1.85 rad ~ 106°)
  const setClamshellAngle = (angleRadians: number) => {
    // Negative rotation around Y swings the front lid outward to the left
    hingeGroup.rotation.y = -angleRadians;

    // Animate zipper slider position along the perimeter as angle increases
    const progress = Math.min(1.0, angleRadians / 1.75);
    if (progress < 0.5) {
      // Moves along top edge
      perimeterZipSlider.position.set(
        W / 2 - progress * 2 * W,
        H / 2 + 0.01,
        0
      );
    } else {
      // Moves down left seam
      perimeterZipSlider.position.set(
        -W / 2 - 0.01,
        H / 2 - (progress - 0.5) * 2 * H,
        0
      );
    }
  };

  const setHandleExtension = (extRatio: number) => {
    // 0 = fully retracted, 1 = fully extended
    handleTelescopicGroup.position.y = extRatio * 0.38;
  };

  const updateColor = (hex: string, m?: number, r?: number) => {
    shellMat.color.set(hex);
    ribMat.color.set(hex);
    if (m !== undefined) {
      shellMat.metalness = m;
      ribMat.metalness = Math.min(1.0, m * 1.1);
    }
    if (r !== undefined) {
      shellMat.roughness = r;
      ribMat.roughness = Math.max(0.15, r * 0.9);
    }
    shellMat.needsUpdate = true;
    ribMat.needsUpdate = true;
  };

  return {
    group: root,
    hingeGroup,
    setClamshellAngle,
    setHandleExtension,
    updateColor,
    updateOledText,
    shellMaterial: shellMat,
    ribMaterial: ribMat,
  };
}

/**
 * Synthesizes a realistic tactile zipper opening/closing sound effect via Web Audio API
 */
export function playZipperAudio(isOpen: boolean) {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const duration = 0.38;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    const clickInterval = Math.floor(ctx.sampleRate / 85);
    for (let i = 0; i < bufferSize; i++) {
      const inClick = (i % clickInterval) < 28;
      const decay = 1 - i / bufferSize;
      data[i] = inClick ? (Math.random() * 2 - 1) * decay * 0.45 : 0;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = isOpen ? 3400 : 2600;
    filter.Q.value = 3.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch {}
}
