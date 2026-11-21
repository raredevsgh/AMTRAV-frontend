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
 * Builds a precision 3D Clamshell Open Suitcase Interior with deep packing tub,
 * luxury branded lining, royal blue butterfly cross-straps with metal buckle,
 * and a hinged front lid with zippered mesh divider that smoothly swings open 110°.
 */
export function createInteriorOpenSuitcase(
  THREE: typeof Three,
  shellColorHex: string = "#1a1a1c",
  metalness: number = 0.65,
  roughness: number = 0.28
) {
  const root = new THREE.Group();
  root.name = "AMTRAV_Clamshell_Open_Mechanism";

  // Exterior Shell Material
  const shellMat = new THREE.MeshPhysicalMaterial({
    color: shellColorHex,
    metalness,
    roughness,
    clearcoat: 0.1,
  });

  // Interior Luxury Microfiber Lining Material (Dark Navy/Slate)
  const liningMat = new THREE.MeshStandardMaterial({
    color: 0x121722,
    roughness: 0.85,
    metalness: 0.08,
  });

  // Compression Strap Material (Royal Blue)
  const strapMat = new THREE.MeshStandardMaterial({
    color: 0x2a4bd7,
    roughness: 0.55,
  });

  // Hardware Material (Brushed Silver Aluminium)
  const aluMat = new THREE.MeshStandardMaterial({
    color: 0xd4d9e0,
    metalness: 0.92,
    roughness: 0.22,
  });

  // Zipper Mesh Material (Translucent diamond weave)
  const meshMat = new THREE.MeshStandardMaterial({
    color: 0x1f2636,
    roughness: 0.75,
    metalness: 0.1,
    transparent: true,
    opacity: 0.88,
  });

  // --- PART 1: REAR BASE TUB (Stationary back half) ---
  const tubGroup = new THREE.Group();

  // Tub Outer Shell (Back, Top, Bottom, Left, Right panels)
  const tubBackGeo = new THREE.BoxGeometry(0.44, 0.68, 0.015);
  const tubBack = new THREE.Mesh(tubBackGeo, shellMat);
  tubBack.position.set(0, 0, -0.06);
  tubGroup.add(tubBack);

  // Tub Lining Bed
  const liningBedGeo = new THREE.BoxGeometry(0.42, 0.66, 0.01);
  const liningBed = new THREE.Mesh(liningBedGeo, liningMat);
  liningBed.position.set(0, 0, -0.05);
  tubGroup.add(liningBed);

  // Tub Walls (Top, Bottom, Left, Right)
  const wallTopBottomGeo = new THREE.BoxGeometry(0.44, 0.015, 0.12);
  const wallLeftRightGeo = new THREE.BoxGeometry(0.015, 0.68, 0.12);

  const wallTop = new THREE.Mesh(wallTopBottomGeo, shellMat);
  wallTop.position.set(0, 0.34, 0);
  tubGroup.add(wallTop);

  const wallBottom = new THREE.Mesh(wallTopBottomGeo, shellMat);
  wallBottom.position.set(0, -0.34, 0);
  tubGroup.add(wallBottom);

  const wallLeft = new THREE.Mesh(wallLeftRightGeo, shellMat);
  wallLeft.position.set(-0.22, 0, 0);
  tubGroup.add(wallLeft);

  const wallRight = new THREE.Mesh(wallLeftRightGeo, shellMat);
  wallRight.position.set(0.22, 0, 0);
  tubGroup.add(wallRight);

  // Aluminium Perimeter Rim
  const rimGeo = new THREE.BoxGeometry(0.45, 0.69, 0.01);
  const tubRim = new THREE.Mesh(rimGeo, aluMat);
  tubRim.position.set(0, 0, 0.058);
  tubGroup.add(tubRim);

  // Interior Compression Butterfly Straps (Criss-cross X over packing compartment)
  const strapX1Geo = new THREE.BoxGeometry(0.58, 0.024, 0.006);
  const strapX1 = new THREE.Mesh(strapX1Geo, strapMat);
  strapX1.rotation.z = Math.PI / 4.2;
  strapX1.position.set(0, 0, 0.01);
  tubGroup.add(strapX1);

  const strapX2 = new THREE.Mesh(strapX1Geo, strapMat);
  strapX2.rotation.z = -Math.PI / 4.2;
  strapX2.position.set(0, 0, 0.01);
  tubGroup.add(strapX2);

  // Central Brushed Aluminium Magnetic Buckle
  const buckleGeo = new THREE.BoxGeometry(0.045, 0.045, 0.012);
  const buckle = new THREE.Mesh(buckleGeo, aluMat);
  buckle.position.set(0, 0, 0.015);
  tubGroup.add(buckle);

  // Brand Patch
  const patchGeo = new THREE.BoxGeometry(0.12, 0.035, 0.004);
  const patch = new THREE.Mesh(patchGeo, aluMat);
  patch.position.set(0, 0.22, -0.045);
  tubGroup.add(patch);

  root.add(tubGroup);

  // --- PART 2: HINGED FRONT LID (Swings open to the left) ---
  // The hinge axis is at the left seam: x = -0.225, z = 0.06
  const hingeGroup = new THREE.Group();
  hingeGroup.position.set(-0.225, 0, 0.06);

  const lidSubGroup = new THREE.Group();
  // Offset lid so its left edge sits exactly at the hinge origin
  lidSubGroup.position.set(0.225, 0, 0);

  // Lid Outer Shell (Front panel)
  const lidFrontGeo = new THREE.BoxGeometry(0.44, 0.68, 0.015);
  const lidFront = new THREE.Mesh(lidFrontGeo, shellMat);
  lidFront.position.set(0, 0, 0.06);
  lidSubGroup.add(lidFront);

  // Lid Walls
  const lidWallTopBottomGeo = new THREE.BoxGeometry(0.44, 0.015, 0.08);
  const lidWallLeftRightGeo = new THREE.BoxGeometry(0.015, 0.68, 0.08);

  const lidWallTop = new THREE.Mesh(lidWallTopBottomGeo, shellMat);
  lidWallTop.position.set(0, 0.34, 0.02);
  lidSubGroup.add(lidWallTop);

  const lidWallBottom = new THREE.Mesh(lidWallTopBottomGeo, shellMat);
  lidWallBottom.position.set(0, -0.34, 0.02);
  lidSubGroup.add(lidWallBottom);

  const lidWallLeft = new THREE.Mesh(lidWallLeftRightGeo, shellMat);
  lidWallLeft.position.set(-0.22, 0, 0.02);
  lidSubGroup.add(lidWallLeft);

  const lidWallRight = new THREE.Mesh(lidWallLeftRightGeo, shellMat);
  lidWallRight.position.set(0.22, 0, 0.02);
  lidSubGroup.add(lidWallRight);

  // Lid Interior Zippered Mesh Divider Panel
  const dividerGeo = new THREE.PlaneGeometry(0.41, 0.65);
  const divider = new THREE.Mesh(dividerGeo, meshMat);
  divider.position.set(0, 0, 0.002);
  lidSubGroup.add(divider);

  // Zipper Track around divider perimeter
  const zipBorderGeo = new THREE.RingGeometry(0.22, 0.23, 4);
  zipBorderGeo.scale(1.4, 0.9, 1);
  const zipBorder = new THREE.Mesh(zipBorderGeo, aluMat);
  zipBorder.position.set(0, 0, 0.005);
  lidSubGroup.add(zipBorder);

  // Metal Zipper Pull on the lid
  const zipPullGeo = new THREE.BoxGeometry(0.012, 0.035, 0.004);
  const zipPull = new THREE.Mesh(zipPullGeo, aluMat);
  zipPull.position.set(0.12, 0.15, 0.008);
  lidSubGroup.add(zipPull);

  hingeGroup.add(lidSubGroup);
  root.add(hingeGroup);

  // By default, case is closed (hinge angle = 0)
  hingeGroup.rotation.y = 0;

  const setClamshellAngle = (angleRadians: number) => {
    // Rotates outward to the left (negative rotation around Y)
    hingeGroup.rotation.y = -angleRadians;
  };

  const updateColor = (hex: string, m?: number, r?: number) => {
    shellMat.color.set(hex);
    if (m !== undefined) shellMat.metalness = m;
    if (r !== undefined) shellMat.roughness = r;
    shellMat.needsUpdate = true;
  };

  return {
    group: root,
    hingeGroup,
    setClamshellAngle,
    updateColor,
    shellMaterial: shellMat,
  };
}
