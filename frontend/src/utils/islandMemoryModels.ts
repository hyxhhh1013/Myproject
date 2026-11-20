import * as THREE from 'three';
import { PersonalMemoryKind } from '../data/islandMemories';

export interface BuiltMemoryModel {
  group: THREE.Group;
  beacon: THREE.Mesh;
  update: (elapsed: number) => void;
}

// ============================================================================
// Procedural High-Resolution Canvas Textures for Architectural & Character Detail
// ============================================================================
function createTextSignTexture(
  text: string,
  opts: {
    width?: number;
    height?: number;
    bg?: string;
    color?: string;
    font?: string;
    border?: string;
    subtitle?: string;
  } = {}
): THREE.CanvasTexture {
  const w = opts.width ?? 512;
  const h = opts.height ?? 96;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    if (opts.bg && opts.bg !== 'transparent') {
      ctx.fillStyle = opts.bg;
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.clearRect(0, 0, w, h);
    }
    if (opts.border) {
      ctx.strokeStyle = opts.border;
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, w - 8, h - 8);
    }
    ctx.fillStyle = opts.color ?? '#C81E1E';
    ctx.font = opts.font ?? 'bold 46px "Noto Serif SC", "Songti SC", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, opts.subtitle ? h * 0.42 : h / 2 + 2);
    if (opts.subtitle) {
      ctx.font = '600 18px "JetBrains Mono", monospace';
      ctx.globalAlpha = 0.85;
      ctx.fillText(opts.subtitle, w / 2, h * 0.76);
      ctx.globalAlpha = 1;
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createWoodFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#A4794E';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 8; i++) {
      const y = i * 32;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,240,220,0.06)' : 'rgba(60,35,15,0.08)';
      ctx.fillRect(0, y, 256, 30);
      ctx.fillStyle = 'rgba(50,30,15,0.28)';
      ctx.fillRect(0, y + 30, 256, 2);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

function createNightWindowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 384);
    grad.addColorStop(0, '#0B1324');
    grad.addColorStop(0.55, '#162238');
    grad.addColorStop(1, '#1E293B');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 384);

    // Distant city buildings & warm bokeh lights
    const buildings = [
      [20, 170, 55, 214],
      [85, 130, 68, 254],
      [165, 195, 50, 189],
      [230, 115, 72, 269],
      [315, 160, 62, 224],
      [390, 140, 82, 244],
    ];
    buildings.forEach(([bx, by, bw, bh]) => {
      ctx.fillStyle = '#0A0F1A';
      ctx.fillRect(bx, by, bw, bh);
      for (let wy = by + 12; wy < 360; wy += 16) {
        for (let wx = bx + 8; wx < bx + bw - 10; wx += 14) {
          if ((wx * 7 + wy * 13) % 5 !== 0) {
            ctx.fillStyle = (wx + wy) % 3 === 0 ? '#FDE68A' : '#F59E0B';
            ctx.globalAlpha = 0.65;
            ctx.fillRect(wx, wy, 6, 8);
          }
        }
      }
      ctx.globalAlpha = 1;
    });

    // Warm street light ribbon
    for (let i = 0; i < 24; i++) {
      ctx.beginPath();
      ctx.arc(16 + i * 21, 340 + (i % 3) * 8, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = i % 4 === 0 ? '#FB7185' : '#FCD34D';
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createCausticPoolTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 512, 512);
    const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 250);
    grad.addColorStop(0, 'rgba(125, 211, 252, 0.55)');
    grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.25)');
    grad.addColorStop(1, 'rgba(2, 132, 199, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Organic interlaced light-web caustic rings
    for (let i = 0; i < 36; i++) {
      const cx = (Math.sin(i * 2.3) * 0.38 + 0.5) * 512;
      const cy = (Math.cos(i * 1.7 + 0.8) * 0.38 + 0.5) * 512;
      const r = 22 + (i % 5) * 16;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = i % 3 === 0 ? 'rgba(224, 242, 254, 0.42)' : 'rgba(125, 211, 252, 0.28)';
      ctx.lineWidth = i % 2 === 0 ? 3.5 : 2;
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Soft round dot for point sprites (bare PointsMaterial draws hard squares). */
function createSoftDotTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.75)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Thin double-faced ribbon (both windings, shared forward-facing normals) so it lights the same
 * from either side — DoubleSide would flip the normal and turn the back face black.
 */
function buildRibbonGeometry(
  width: number,
  height: number,
  segments: number,
  colorBase: THREE.Color,
  colorTip: THREE.Color,
  taper = 0.25
): THREE.BufferGeometry {
  const positions: number[] = [];
  const colors: number[] = [];
  const normals: number[] = [];
  const index: number[] = [];
  const c = new THREE.Color();
  for (let s = 0; s <= segments; s++) {
    const t = s / segments;
    const w = width * (1 - t * (1 - taper)) * (0.75 + Math.sin(t * Math.PI) * 0.35);
    const y = t * height;
    positions.push(-w / 2, y, 0, w / 2, y, 0);
    c.copy(colorBase).lerp(colorTip, t);
    colors.push(c.r, c.g, c.b, c.r, c.g, c.b);
    normals.push(0, 0.35, 1, 0, 0.35, 1);
  }
  for (let s = 0; s < segments; s++) {
    const a = s * 2;
    index.push(a, a + 1, a + 3, a, a + 3, a + 2); // front
    index.push(a, a + 3, a + 1, a, a + 2, a + 3); // back
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setIndex(index);
  return geo;
}

function createMemoryBeacon(yHeight: number, color = '#C8A97E'): THREE.Mesh {
  const beacon = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.26, 0),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.75,
      roughness: 0.22,
      metalness: 0.45,
    })
  );
  beacon.position.y = yHeight;
  return beacon;
}

// ============================================================================
// Refined Stylized Character Builder (Articulated Limbs, Layered Hair, Puffer)
// ============================================================================
function buildRefinedCharacter(opts: {
  skinColor?: string;
  hairColor?: string;
  hairStyle?: 'short' | 'medium-parted' | 'long-straight' | 'curly';
  torsoColor: string;
  innerShirtColor?: string;
  pantsColor: string;
  shoeColor?: string;
  glasses?: boolean;
  puffer?: boolean;
  highCollar?: boolean;
  sitting?: boolean;
  peaceLeft?: boolean;
  peaceRight?: boolean;
  scale?: number;
}): THREE.Group {
  const g = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({ color: opts.skinColor ?? '#F3D2B8', roughness: 0.72 });
  const hairMat = new THREE.MeshStandardMaterial({ color: opts.hairColor ?? '#1C1917', roughness: 0.82 });
  const torsoMat = new THREE.MeshStandardMaterial({ color: opts.torsoColor, roughness: opts.puffer ? 0.62 : 0.78 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: opts.pantsColor, roughness: 0.84 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: opts.shoeColor ?? '#FAF9F5', roughness: 0.6 });

  // Legs & Shoes
  if (opts.sitting) {
    [-0.13, 0.13].forEach((x) => {
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.26, 8, 12), pantsMat);
      thigh.rotation.x = Math.PI / 2;
      thigh.position.set(x, 0.4, 0.18);
      thigh.castShadow = true;
      g.add(thigh);

      const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.24, 8, 12), pantsMat);
      shin.position.set(x, 0.22, 0.34);
      shin.castShadow = true;
      g.add(shin);

      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.08, 0.2), shoeMat);
      shoe.position.set(x, 0.06, 0.38);
      g.add(shoe);
    });
  } else {
    [-0.12, 0.12].forEach((x) => {
      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.082, 0.56, 8, 12), pantsMat);
      leg.position.set(x, 0.42, 0);
      leg.castShadow = true;
      g.add(leg);

      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.09, 0.24), shoeMat);
      shoe.position.set(x, 0.05, 0.04);
      shoe.castShadow = true;
      g.add(shoe);
    });
  }

  // Torso (Sculpted Multi-Chamber Puffer or Tailored Jacket)
  const torsoY = opts.sitting ? 0.74 : 1.02;
  if (opts.puffer) {
    // 4 soft pillow chambers for authentic quilted puffer jacket silhouette
    [-0.19, -0.06, 0.07, 0.19].forEach((dy, idx) => {
      const r = idx === 3 ? 0.24 : 0.27;
      const chamber = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 12), torsoMat);
      chamber.scale.set(1.18, 0.44, 0.88);
      chamber.position.set(0, torsoY + dy, 0);
      chamber.castShadow = true;
      g.add(chamber);
    });

    // Inner dark shirt V-opening (e.g. cream jacket over navy polo in P5)
    if (opts.innerShirtColor) {
      const innerShirt = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.46, 0.08),
        new THREE.MeshStandardMaterial({ color: opts.innerShirtColor, roughness: 0.8 })
      );
      innerShirt.position.set(0, torsoY + 0.03, 0.21);
      g.add(innerShirt);
    }

    // High stand-up collar (e.g. black puffer in P5)
    if (opts.highCollar) {
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.22, 0.22, 16), torsoMat);
      collar.position.set(0, torsoY + 0.34, 0);
      collar.castShadow = true;
      g.add(collar);
      // Silver zipper pull
      const zip = new THREE.Mesh(
        new THREE.BoxGeometry(0.025, 0.07, 0.02),
        new THREE.MeshStandardMaterial({ color: '#D4D4D8', metalness: 0.85, roughness: 0.2 })
      );
      zip.position.set(0, torsoY + 0.32, 0.2);
      g.add(zip);
    }
  } else {
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.28, 10, 16), torsoMat);
    body.scale.set(1.08, 1, 0.72);
    body.position.y = torsoY;
    body.castShadow = true;
    g.add(body);
  }

  // Arms
  const armMat = torsoMat;
  const makeArm = (side: -1 | 1, raisedPeace?: boolean) => {
    const armGroup = new THREE.Group();
    armGroup.position.set(side * (opts.puffer ? 0.32 : 0.25), torsoY + 0.16, 0);

    const upper = new THREE.Mesh(
      new THREE.CapsuleGeometry(opts.puffer ? 0.095 : 0.062, 0.28, 8, 12),
      armMat
    );
    upper.position.y = -0.15;
    upper.castShadow = true;
    armGroup.add(upper);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), skinMat);
    hand.position.y = -0.34;
    armGroup.add(hand);

    if (raisedPeace) {
      armGroup.rotation.z = side * 2.35;
      armGroup.rotation.x = -0.35;
      // V-sign fingers
      [-0.02, 0.02].forEach((fx) => {
        const finger = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.06, 4, 6), skinMat);
        finger.position.set(fx, -0.41, 0);
        finger.rotation.z = fx * 9;
        armGroup.add(finger);
      });
    } else {
      armGroup.rotation.z = side * 0.14;
    }
    return armGroup;
  };
  g.add(makeArm(-1, opts.peaceLeft));
  g.add(makeArm(1, opts.peaceRight));

  // Neck + Sculpted Head
  const headY = torsoY + (opts.highCollar ? 0.5 : 0.45);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.14, 10), skinMat);
  neck.position.y = headY - 0.16;
  g.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.195, 22, 18), skinMat);
  head.scale.set(0.95, 1.04, 0.96);
  head.position.y = headY;
  head.castShadow = true;
  g.add(head);

  // Subtle expressive eyes & smile
  const eyeMat = new THREE.MeshStandardMaterial({ color: '#1C1917', roughness: 0.3 });
  [-0.062, 0.062].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 10), eyeMat);
    eye.position.set(ex, headY + 0.015, 0.175);
    g.add(eye);
  });

  // Layered Hair
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.208, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.58),
    hairMat
  );
  hairCap.position.set(0, headY + 0.025, -0.012);
  hairCap.castShadow = true;
  g.add(hairCap);

  if (opts.hairStyle === 'long-straight') {
    const backHair = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 0.28, 8, 14), hairMat);
    backHair.scale.set(1.05, 1, 0.55);
    backHair.position.set(0, headY - 0.14, -0.1);
    g.add(backHair);
    [-0.15, 0.15].forEach((sx) => {
      const sideLock = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.28, 6, 10), hairMat);
      sideLock.position.set(sx, headY - 0.12, 0.04);
      g.add(sideLock);
    });
  } else if (opts.hairStyle === 'medium-parted') {
    [-0.075, 0.075].forEach((bx) => {
      const bang = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.11, 6, 10), hairMat);
      bang.position.set(bx, headY + 0.095, 0.135);
      bang.rotation.z = bx > 0 ? -0.45 : 0.45;
      g.add(bang);
    });
  } else if (opts.hairStyle === 'curly') {
    for (let i = 0; i < 9; i++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), hairMat);
      const a = (i / 9) * Math.PI * 2;
      puff.position.set(Math.cos(a) * 0.15, headY + 0.13 + (i % 3) * 0.035, Math.sin(a) * 0.14);
      g.add(puff);
    }
  } else {
    // Neat short spiky-textured hair
    for (let i = -2; i <= 2; i++) {
      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.09, 6), hairMat);
      tuft.position.set(i * 0.055, headY + 0.17, 0.08 - Math.abs(i) * 0.02);
      tuft.rotation.x = 0.25;
      g.add(tuft);
    }
  }

  // Rectangular black-framed glasses
  if (opts.glasses) {
    const frameMat = new THREE.MeshStandardMaterial({ color: '#141413', roughness: 0.25, metalness: 0.5 });
    [-0.068, 0.068].forEach((gx) => {
      const top = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.013, 0.015), frameMat);
      top.position.set(gx, headY + 0.045, 0.19);
      const bot = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.013, 0.015), frameMat);
      bot.position.set(gx, headY - 0.018, 0.19);
      const lft = new THREE.Mesh(new THREE.BoxGeometry(0.013, 0.068, 0.015), frameMat);
      lft.position.set(gx - 0.044, headY + 0.014, 0.19);
      const rgt = new THREE.Mesh(new THREE.BoxGeometry(0.013, 0.068, 0.015), frameMat);
      rgt.position.set(gx + 0.044, headY + 0.014, 0.19);
      g.add(top, bot, lft, rgt);
    });
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.012, 0.015), frameMat);
    bridge.position.set(0, headY + 0.028, 0.19);
    g.add(bridge);
  }

  if (opts.scale) g.scale.setScalar(opts.scale);
  return g;
}

// ============================================================================
// M01: Cinematic Open-Ocean Underwater Freediving Sanctuary & Surface Pontoon (P6 & P1)
// Origin y = 0 sits right at the ocean surface; the entire underwater ocean
// sanctuary plunges DOWN from y = 0 to y = -6.8 with marine snow, caustics,
// gliding manta ray, branching coral reef, lanyard & depth markers!
// ============================================================================
function buildFreediveCrimsonMemory(): BuiltMemoryModel {
  const group = new THREE.Group();

  const deckTex = createWoodFloorTexture();
  const teakMat = new THREE.MeshStandardMaterial({ map: deckTex, roughness: 0.72 });
  const bronzeMat = new THREE.MeshStandardMaterial({ color: '#8A6F48', roughness: 0.35, metalness: 0.68 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: '#E2E8F0', roughness: 0.16, metalness: 0.9 });
  const wetsuitMat = new THREE.MeshStandardMaterial({ color: '#121519', roughness: 0.36, metalness: 0.14 });
  const skinMat = new THREE.MeshStandardMaterial({ color: '#ECCBB5', roughness: 0.66 });
  const hairMat = new THREE.MeshStandardMaterial({ color: '#18181B', roughness: 0.76 });

  // --------------------------------------------------------------------------
  // A. SURFACE FLOATING FREEDIVING PONTOON (y = 0, right of open dive area)
  // --------------------------------------------------------------------------
  const pontoonX = 4.9;
  const pontoon = new THREE.Group();
  pontoon.position.set(pontoonX, 0.16, -0.4);

  const pontoonBase = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.28, 5.4),
    new THREE.MeshStandardMaterial({ color: '#3E3A35', roughness: 0.85 })
  );
  pontoon.add(pontoonBase);

  const pontoonDeck = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.08, 5.2), teakMat);
  pontoonDeck.position.y = 0.18;
  pontoonDeck.receiveShadow = true;
  pontoonDeck.castShadow = true;
  pontoon.add(pontoonDeck);

  // Corner brass mooring bollards + perimeter rope trim
  [-1.48, 1.48].forEach((bx) => {
    [-2.35, 2.35].forEach((bz) => {
      const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.28, 12), bronzeMat);
      bollard.position.set(bx, 0.32, bz);
      pontoon.add(bollard);
    });
  });

  // Stainless steel diving ladder descending straight DOWN into the ocean
  [-0.26, 0.26].forEach((lz) => {
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 3.0, 10), chromeMat);
    rail.position.set(-1.78, -0.65, lz);
    pontoon.add(rail);
    const grip = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.028, 8, 16, Math.PI), chromeMat);
    grip.position.set(-1.6, 0.85, lz);
    pontoon.add(grip);
  });
  for (let r = 0; r < 6; r++) {
    const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.54, 8), chromeMat);
    rung.rotation.x = Math.PI / 2;
    rung.position.set(-1.78, 0.16 - r * 0.38, 0);
    pontoon.add(rung);
  }

  // Freediving Signpost on Pontoon ("FREEDIVE · -10M")
  const signPost = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 1.38, 8), bronzeMat);
  signPost.position.set(-1.18, 0.86, 2.1);
  pontoon.add(signPost);
  const depthTex = createTextSignTexture('FREEDIVE · -10M', {
    width: 320,
    height: 76,
    bg: '#141413',
    color: '#C8A97E',
    font: 'bold 26px "JetBrains Mono", monospace',
    border: '#8A6F48',
  });
  const signBoard = new THREE.Mesh(
    new THREE.BoxGeometry(1.38, 0.34, 0.06),
    new THREE.MeshBasicMaterial({ map: depthTex })
  );
  signBoard.position.set(-0.6, 1.36, 2.1);
  pontoon.add(signBoard);

  // Authentic Deck Props: Coiled Dive Rope, Rolled Towel, Spare Long Fins & Weight Belt
  const ropeCoil = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.045, 10, 24),
    new THREE.MeshStandardMaterial({ color: '#F1F5F9', roughness: 0.75 })
  );
  ropeCoil.rotation.x = Math.PI / 2;
  ropeCoil.position.set(-0.85, 0.27, 0.2);
  pontoon.add(ropeCoil);

  const towel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.13, 0.62, 12),
    new THREE.MeshStandardMaterial({ color: '#FAF9F5', roughness: 0.9 })
  );
  towel.rotation.z = Math.PI / 2;
  towel.position.set(-0.3, 0.35, 0.95);
  pontoon.add(towel);

  [-0.14, 0.14].forEach((fx, idx) => {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.035, 0.76), wetsuitMat);
    fin.position.set(0.55 + fx, 0.25, 1.15);
    fin.rotation.y = idx === 0 ? 0.2 : -0.14;
    pontoon.add(fin);
  });

  // Crimson Night-Car Corner on Back Edge of Pontoon (P1 echo: white arched railing + ruby lamp)
  const fenceMat = new THREE.MeshStandardMaterial({ color: '#F4F6F9', roughness: 0.42 });
  for (let i = 0; i < 6; i++) {
    const rx = -1.05 + i * 0.42;
    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.03, 10, 16, Math.PI), fenceMat);
    arch.position.set(rx, 0.96, -2.35);
    pontoon.add(arch);
    [-0.21, 0.21].forEach((ox) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.74, 8), fenceMat);
      post.position.set(rx + ox, 0.59, -2.35);
      pontoon.add(post);
    });
  }
  const crimsonStand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.1, 1.48, 14),
    new THREE.MeshStandardMaterial({ color: '#181619', roughness: 0.35, metalness: 0.55 })
  );
  crimsonStand.position.set(1.1, 0.96, -1.62);
  pontoon.add(crimsonStand);

  const crimsonOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 18, 14),
    new THREE.MeshStandardMaterial({
      color: '#FDA4AF',
      emissive: '#E11D48',
      emissiveIntensity: 1.75,
      roughness: 0.12,
    })
  );
  crimsonOrb.position.set(1.1, 1.78, -1.62);
  pontoon.add(crimsonOrb);

  const crimsonLight = new THREE.PointLight('#E11D48', 2.0, 7.5, 1.8);
  crimsonLight.position.set(1.1, 1.78, -1.62);
  pontoon.add(crimsonLight);

  group.add(pontoon);

  // --------------------------------------------------------------------------
  // B. FLOATING SURFACE FREEDIVING BUOY, WHITE GUIDE ROPE & DEPTH TAGS (y = 0 -> -6.6)
  // --------------------------------------------------------------------------
  const buoyGroup = new THREE.Group();
  buoyGroup.position.set(0, 0.08, 0);
  const buoyRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.54, 0.16, 18, 36),
    new THREE.MeshStandardMaterial({ color: '#FAF9F5', roughness: 0.32 })
  );
  buoyRing.rotation.x = Math.PI / 2;
  buoyGroup.add(buoyRing);
  // Inner mesh well of real freediving buoy
  const buoyWell = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.36, 0.12, 24),
    new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.7 })
  );
  buoyWell.position.y = -0.02;
  buoyGroup.add(buoyWell);
  for (let i = 0; i < 4; i++) {
    const stripe = new THREE.Mesh(
      new THREE.TorusGeometry(0.54, 0.166, 10, 12, 0.38),
      new THREE.MeshStandardMaterial({ color: '#D95D39', roughness: 0.4 })
    );
    stripe.rotation.x = Math.PI / 2;
    stripe.rotation.z = (i * Math.PI) / 2;
    buoyGroup.add(stripe);
  }
  const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.76, 8), chromeMat);
  flagPole.position.set(0.4, 0.38, 0);
  const diveFlag = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.24, 0.02),
    new THREE.MeshStandardMaterial({ color: '#DC2626', roughness: 0.48 })
  );
  diveFlag.position.set(0.59, 0.6, 0);
  buoyGroup.add(flagPole, diveFlag);
  group.add(buoyGroup);

  // Braided vertical white guide rope descending 6.6m straight into the deep blue
  const poolDepth = 6.6;
  const rope = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.032, poolDepth, 14),
    new THREE.MeshStandardMaterial({
      color: '#F8FAFC',
      emissive: '#E0F2FE',
      emissiveIntensity: 0.28,
      roughness: 0.38,
    })
  );
  rope.position.set(0, -poolDepth / 2, 0);
  group.add(rope);

  // Crisp Depth Marker Tags clipped along the white guide rope (-2M, -5M)
  [
    { y: -1.8, label: '-2M' },
    { y: -5.4, label: '-5M' },
  ].forEach((tag) => {
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.12, 12), bronzeMat);
    collar.position.set(0, tag.y, 0);
    const tagTex = createTextSignTexture(tag.label, {
      width: 128,
      height: 64,
      bg: '#082F49',
      color: '#BAE6FD',
      font: 'bold 30px "JetBrains Mono", monospace',
      border: '#38BDF8',
    });
    const plate = new THREE.Mesh(
      new THREE.PlaneGeometry(0.34, 0.17),
      new THREE.MeshBasicMaterial({ map: tagTex, side: THREE.DoubleSide })
    );
    plate.position.set(0.22, tag.y, 0);
    group.add(collar, plate);
  });

  // Stainless Steel Freediving Bottom Plate with Glowing Cyan Target Ring
  const bottomPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.56, 0.1, 28), chromeMat);
  bottomPlate.position.set(0, -poolDepth + 0.08, 0);
  group.add(bottomPlate);
  const plateGlowRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.46, 0.025, 10, 28),
    new THREE.MeshBasicMaterial({ color: '#7DD3FC' })
  );
  plateGlowRing.rotation.x = Math.PI / 2;
  plateGlowRing.position.set(0, -poolDepth + 0.14, 0);
  group.add(plateGlowRing);

  // --------------------------------------------------------------------------
  // C. SEAMLESS OPEN-OCEAN SEABED, ANIMATED CAUSTICS, CORAL REEF & MARINE SNOW
  // --------------------------------------------------------------------------
  // Sandy seabed on a real grid (CircleGeometry is one triangle fan, so its dunes only moved the
  // rim). Long dunes + fine sand ripples, with pale sand near the rope fading to deep blue-teal.
  const seabedGeo = new THREE.PlaneGeometry(60, 60, 90, 90);
  seabedGeo.rotateX(-Math.PI / 2);
  const seabedPos = seabedGeo.attributes.position;
  const seabedColors = new Float32Array(seabedPos.count * 3);
  const sandNear = new THREE.Color('#9FC9C2');
  const sandFar = new THREE.Color('#1F5E72');
  const sandTmp = new THREE.Color();
  for (let i = 0; i < seabedPos.count; i++) {
    const sx = seabedPos.getX(i);
    const sz = seabedPos.getZ(i);
    const dist = Math.hypot(sx, sz);
    const dune =
      Math.sin(sx * 0.28) * Math.cos(sz * 0.28) * 0.34 +
      Math.sin((sx + sz) * 0.65) * 0.08 +
      Math.sin(sx * 2.6 + Math.sin(sz * 0.7) * 1.4) * 0.025; // wind-like sand ripples
    // Bowl the far edge down so the seabed never shows a hard horizon line.
    seabedPos.setY(i, dune - Math.max(0, dist - 18) * 0.12);
    const fade = Math.min(1, dist / 20);
    const ripple = 0.92 + Math.sin(sx * 2.6 + Math.sin(sz * 0.7) * 1.4) * 0.06;
    sandTmp.copy(sandNear).lerp(sandFar, fade).multiplyScalar(ripple);
    seabedColors.set([sandTmp.r, sandTmp.g, sandTmp.b], i * 3);
  }
  seabedGeo.setAttribute('color', new THREE.BufferAttribute(seabedColors, 3));
  seabedGeo.computeVertexNormals();
  const seabed = new THREE.Mesh(
    seabedGeo,
    new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      vertexColors: true,
      roughness: 0.95,
    })
  );
  seabed.position.set(0, -poolDepth, 0);
  seabed.receiveShadow = true;
  group.add(seabed);

  // Dual counter-rotating caustic light webs on the seabed + shimmering underside ceiling
  const causticTex = createCausticPoolTexture();
  const causticFloorA = new THREE.Mesh(
    new THREE.CircleGeometry(6.8, 36),
    new THREE.MeshBasicMaterial({
      map: causticTex,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  causticFloorA.rotation.x = -Math.PI / 2;
  causticFloorA.position.set(0, -poolDepth + 0.26, 0);
  group.add(causticFloorA);

  const causticFloorB = new THREE.Mesh(
    new THREE.CircleGeometry(5.6, 32),
    new THREE.MeshBasicMaterial({
      map: causticTex,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  causticFloorB.rotation.x = -Math.PI / 2;
  causticFloorB.position.set(0, -poolDepth + 0.28, 0);
  group.add(causticFloorB);

  // Glowing sunlit liquid-light ripple halo just beneath the ocean surface (visible when looking UP!)
  const surfaceCeilingHalo = new THREE.Mesh(
    new THREE.CircleGeometry(7.2, 36),
    new THREE.MeshBasicMaterial({
      map: causticTex,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
  );
  surfaceCeilingHalo.rotation.x = Math.PI / 2;
  surfaceCeilingHalo.position.set(0, -0.08, 0);
  group.add(surfaceCeilingHalo);

  // 180 Floating Underwater Marine Snow / Plankton Dust Particles
  const snowCount = 180;
  const snowPositions = new Float32Array(snowCount * 3);
  const snowPhases = new Float32Array(snowCount);
  for (let i = 0; i < snowCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 0.6 + Math.random() * 11.5;
    snowPositions[i * 3] = Math.cos(a) * r;
    snowPositions[i * 3 + 1] = -0.35 - Math.random() * (poolDepth - 0.6);
    snowPositions[i * 3 + 2] = Math.sin(a) * r;
    snowPhases[i] = Math.random() * Math.PI * 2;
  }
  const snowGeo = new THREE.BufferGeometry();
  snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));
  const marineSnow = new THREE.Points(
    snowGeo,
    new THREE.PointsMaterial({
      color: '#BAE6FD',
      size: 0.11,
      map: createSoftDotTexture(),
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  group.add(marineSnow);

  // Richer Living Coral Reef Garden (Reef Rocks, Branching Staghorn Corals, Glowing Anemones & 18 Kelp Blades)
  const reefRockMat = new THREE.MeshStandardMaterial({ color: '#1B4B63', roughness: 0.92, flatShading: true });
  const coralTerracottaMat = new THREE.MeshStandardMaterial({ color: '#B45B4D', roughness: 0.82, flatShading: true });
  const coralAmberMat = new THREE.MeshStandardMaterial({ color: '#C89B5B', roughness: 0.8, flatShading: true });
  const anemoneGlowMat = new THREE.MeshStandardMaterial({
    color: '#67E8F9',
    emissive: '#06B6D4',
    emissiveIntensity: 0.65,
    roughness: 0.4,
  });
  const kelpMat = new THREE.MeshStandardMaterial({
    color: '#FFFFFF',
    vertexColors: true,
    roughness: 0.7,
  });
  const kelpBase = new THREE.Color('#0F4B3E');
  const kelpTip = new THREE.Color('#7FB069');
  // Each blade keeps its rest pose; update() bends it as a ribbon (stiff root, loose tip)
  // instead of rotating a rigid board.
  const kelpRibbons: { geo: THREE.BufferGeometry; rest: Float32Array; height: number; phase: number }[] = [];
  const brainCoralMat = new THREE.MeshStandardMaterial({ color: '#E9A06B', roughness: 0.85 });
  const seaFanMat = new THREE.MeshStandardMaterial({
    color: '#C2416C',
    roughness: 0.7,
    side: THREE.DoubleSide,
  });
  const spongeMat = new THREE.MeshStandardMaterial({ color: '#9B5DE5', roughness: 0.75 });
  [
    [-3.8, -2.5, 1.25],
    [3.4, -3.2, 1.4],
    [-4.8, 1.9, 1.05],
    [4.4, 2.3, 1.15],
    [-1.6, -4.6, 1.3],
    [2.1, -4.3, 0.95],
    [0.6, 4.5, 1.0],
    [-5.8, -1.2, 1.35],
    [5.6, -0.8, 1.2],
  ].forEach(([rx, rz, sc], idx) => {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.68 * sc, 1), reefRockMat);
    rock.scale.set(1.4, 0.62, 1.18);
    rock.position.set(rx, -poolDepth + 0.25, rz);
    group.add(rock);

    // Branching staghorn coral cluster
    if (idx % 2 === 0) {
      const cMat = idx % 4 === 0 ? coralTerracottaMat : coralAmberMat;
      for (let b = 0; b < 3; b++) {
        const branch = new THREE.Mesh(new THREE.CapsuleGeometry(0.055 * sc, 0.34 * sc, 6, 8), cMat);
        branch.position.set(rx + (b - 1) * 0.18, -poolDepth + 0.66, rz + (b === 1 ? 0.12 : -0.08));
        branch.rotation.z = (b - 1) * 0.42;
        branch.rotation.x = (b - 1) * 0.2;
        group.add(branch);
      }
    } else {
      // Glowing cyan sea anemone
      const anemone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18 * sc, 0), anemoneGlowMat);
      anemone.scale.set(1.2, 0.75, 1.2);
      anemone.position.set(rx + 0.25, -poolDepth + 0.56, rz + 0.12);
      group.add(anemone);
    }

    // Extra reef life per cluster: a brain coral dome, a sea fan, or a pair of tube sponges.
    if (idx % 3 === 0) {
      const brainGeo = new THREE.IcosahedronGeometry(0.34 * sc, 3);
      const bp = brainGeo.attributes.position;
      const v = new THREE.Vector3();
      for (let i = 0; i < bp.count; i++) {
        v.fromBufferAttribute(bp, i);
        const groove = 1 + Math.sin(v.x * 28) * Math.sin(v.z * 26) * 0.05;
        v.multiplyScalar(groove);
        bp.setXYZ(i, v.x, Math.max(v.y, -0.05), v.z);
      }
      brainGeo.computeVertexNormals();
      const brain = new THREE.Mesh(brainGeo, brainCoralMat);
      brain.scale.set(1, 0.7, 1);
      brain.position.set(rx - 0.55 * sc, -poolDepth + 0.42, rz - 0.3);
      group.add(brain);
    } else if (idx % 3 === 1) {
      const fanShape = new THREE.Shape();
      fanShape.moveTo(0, 0);
      fanShape.quadraticCurveTo(-0.55 * sc, 0.45 * sc, -0.38 * sc, 0.85 * sc);
      fanShape.quadraticCurveTo(0, 1.05 * sc, 0.38 * sc, 0.85 * sc);
      fanShape.quadraticCurveTo(0.55 * sc, 0.45 * sc, 0, 0);
      const fan = new THREE.Mesh(new THREE.ShapeGeometry(fanShape, 10), seaFanMat);
      fan.position.set(rx + 0.5 * sc, -poolDepth + 0.45, rz - 0.2);
      fan.rotation.y = idx * 0.9;
      group.add(fan);
    } else {
      [0, 1].forEach((t) => {
        const tubeH = (0.42 + t * 0.22) * sc;
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.075 * sc, 0.06 * sc, tubeH, 10, 1, true), spongeMat);
        tube.position.set(rx - 0.4 + t * 0.16, -poolDepth + 0.35 + tubeH / 2, rz + 0.35);
        group.add(tube);
      });
    }

    // 2–3 kelp ribbons per reef cluster, rooted in the sand
    const kelpCount = idx % 2 === 0 ? 3 : 2;
    for (let k = 0; k < kelpCount; k++) {
      const kH = 1.9 + ((idx + k) % 3) * 0.7;
      const kelpGeo = buildRibbonGeometry(0.2 + (k % 2) * 0.06, kH, 12, kelpBase, kelpTip, 0.3);
      const kelp = new THREE.Mesh(kelpGeo, kelpMat);
      const baseY = -poolDepth + 0.3;
      kelp.position.set(rx + (k - 1) * 0.32, baseY, rz + 0.25 + (k % 2) * 0.12);
      kelp.rotation.y = idx * 0.85 + k * 1.1;
      group.add(kelp);
      kelpRibbons.push({
        geo: kelpGeo,
        rest: Float32Array.from(kelpGeo.attributes.position.array as ArrayLike<number>),
        height: kH,
        phase: idx * 0.7 + k * 1.3,
      });
    }
  });

  // Underwater Cyan Lights + 7 Volumetric Sunlit God-Rays piercing down from surface
  const underwaterLightTop = new THREE.PointLight('#38BDF8', 4.6, 20, 1.25);
  underwaterLightTop.position.set(0, -1.4, 2.2);
  group.add(underwaterLightTop);

  const underwaterLightDeep = new THREE.PointLight('#0EA5E9', 3.0, 18, 1.35);
  underwaterLightDeep.position.set(-1.8, -4.8, 1.6);
  group.add(underwaterLightDeep);

  const godRays: THREE.Mesh[] = [];
  // Volumetric-looking light shafts: brightness falls off toward the cone's silhouette (so no
  // hard edges), fades out with depth, and shimmers slowly — instead of flat 12% white cones.
  const rayUniforms = {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#CFEFFF') },
    uIntensity: { value: 0.2 },
  };
  const rayMat = new THREE.ShaderMaterial({
    uniforms: rayUniforms,
    vertexShader: `
      varying vec3 vNormalW;
      varying vec3 vViewDir;
      varying float vAlong;
      varying float vAngle;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vNormalW = normalize(mat3(modelMatrix) * normal);
        vViewDir = normalize(cameraPosition - wp.xyz);
        vAlong = uv.y;          // 1 at the surface end, 0 at the deep end
        vAngle = uv.x * 6.2831;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uIntensity;
      varying vec3 vNormalW;
      varying vec3 vViewDir;
      varying float vAlong;
      varying float vAngle;
      void main() {
        float facing = abs(dot(normalize(vNormalW), normalize(vViewDir)));
        float core = pow(facing, 2.4);
        float depthFade = smoothstep(0.0, 0.85, vAlong);
        float streaks = 0.72 + 0.28 * sin(vAngle * 5.0 + uTime * 0.6) * sin(vAlong * 9.0 - uTime * 0.9);
        float a = core * depthFade * streaks * uIntensity;
        gl_FragColor = vec4(uColor, a); // AdditiveBlending already multiplies by alpha
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  [
    [-2.8, -1.0, 0.92],
    [-1.1, -1.6, 0.78],
    [0.4, -0.5, 1.05],
    [2.1, -1.4, 0.82],
    [-1.5, 1.5, 0.74],
    [1.4, 1.8, 0.68],
    [0.0, -2.8, 0.88],
  ].forEach(([rx, rz, rRad]) => {
    const ray = new THREE.Mesh(new THREE.ConeGeometry(rRad, poolDepth - 0.5, 24, 6, true), rayMat);
    ray.position.set(rx, -poolDepth * 0.46, rz);
    ray.rotation.z = -0.18;
    group.add(ray);
    godRays.push(ray);
  });

  // --------------------------------------------------------------------------
  // D. ULTRA-REFINED SCULPTED FREEDIVER GIRL (P6 Silhouette, Mask, Lanyard, Dive Computer)
  // --------------------------------------------------------------------------
  const diver = new THREE.Group();
  diver.position.set(0, -4.2, 0);

  // Smooth anatomical LatheGeometry wetsuit torso with sculpted waist & collar
  const torsoProfile = [
    new THREE.Vector2(0.11, 0.0),
    new THREE.Vector2(0.225, 0.14),
    new THREE.Vector2(0.158, 0.42),
    new THREE.Vector2(0.195, 0.68),
    new THREE.Vector2(0.232, 0.82),
    new THREE.Vector2(0.095, 0.93),
    new THREE.Vector2(0.082, 0.98),
  ];
  const torsoMesh = new THREE.Mesh(new THREE.LatheGeometry(torsoProfile, 28), wetsuitMat);
  torsoMesh.scale.set(1.06, 1, 0.72);
  torsoMesh.position.set(0, 0.95, -0.2);
  diver.add(torsoMesh);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.082, 0.16, 14), skinMat);
  neck.position.set(0, 1.94, -0.19);
  diver.add(neck);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 2.12, -0.18);
  headGroup.rotation.x = -0.15;

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 26, 22), skinMat);
  head.scale.set(0.92, 1.05, 0.96);
  headGroup.add(head);

  // Serene facial micro-details (calm eyes behind mask + delicate lips)
  const eyeMat = new THREE.MeshStandardMaterial({ color: '#1C1917', roughness: 0.25 });
  [-0.062, 0.062].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.017, 10, 10), eyeMat);
    eye.position.set(ex, 0.025, 0.178);
    headGroup.add(eye);
  });
  const lip = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.012, 0.036, 4, 8),
    new THREE.MeshStandardMaterial({ color: '#C97B72', roughness: 0.55 })
  );
  lip.rotation.z = Math.PI / 2;
  lip.position.set(0, -0.075, 0.175);
  headGroup.add(lip);

  // 10 Flowing Layered Underwater Hair Strands
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.215, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.62),
    hairMat
  );
  hairCap.position.set(0, 0.02, -0.02);
  headGroup.add(hairCap);

  const hairStrands: { mesh: THREE.Mesh; baseRotX: number; phase: number }[] = [];
  for (let h = 0; h < 10; h++) {
    const angle = -1.35 + (h / 9) * 2.7;
    const len = 0.28 + (h % 3) * 0.09;
    const strand = new THREE.Mesh(new THREE.CapsuleGeometry(0.036, len, 6, 10), hairMat);
    strand.position.set(Math.sin(angle) * 0.17, -0.09 - (h % 2) * 0.04, -0.11 - Math.cos(angle) * 0.07);
    strand.rotation.z = Math.sin(angle) * 0.38;
    const baseRotX = 0.26 + (h % 3) * 0.08;
    strand.rotation.x = baseRotX;
    headGroup.add(strand);
    hairStrands.push({ mesh: strand, baseRotX, phase: h * 0.55 });
  }

  // Signature Large White-Rimmed Freediving Mask (curved silicone skirt, twin clear lenses, buckles, strap)
  const maskWhiteMat = new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.2 });
  const maskGlassMat = new THREE.MeshStandardMaterial({
    color: '#7DD3FC',
    emissive: '#0284C7',
    emissiveIntensity: 0.25,
    transparent: true,
    opacity: 0.62,
    roughness: 0.04,
    metalness: 0.5,
  });
  const maskFrame = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.155, 0.072), maskWhiteMat);
  maskFrame.position.set(0, 0.022, 0.175);
  headGroup.add(maskFrame);
  [-0.068, 0.068].forEach((mx) => {
    const lens = new THREE.Mesh(new THREE.BoxGeometry(0.112, 0.102, 0.084), maskGlassMat);
    lens.position.set(mx, 0.025, 0.18);
    headGroup.add(lens);
  });
  const nosePocket = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.07, 10), maskWhiteMat);
  nosePocket.rotation.x = Math.PI / 2;
  nosePocket.position.set(0, -0.022, 0.22);
  headGroup.add(nosePocket);
  // Mask side buckles + black silicone strap
  [-0.175, 0.175].forEach((bx) => {
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.045, 0.05), maskWhiteMat);
    buckle.position.set(bx, 0.02, 0.11);
    headGroup.add(buckle);
  });
  const strap = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.018, 8, 28), wetsuitMat);
  strap.rotation.x = Math.PI / 2;
  strap.position.set(0, 0.02, -0.01);
  headGroup.add(strap);
  diver.add(headGroup);

  // Arms gripping the white guide rope (right upper near chest, left lower near waist)
  const makeBentArm = (side: -1 | 1, upperY: number, gripY: number, hasWatch?: boolean) => {
    const armG = new THREE.Group();
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.056, 0.3, 8, 12), wetsuitMat);
    upper.position.set(side * 0.25, upperY, -0.14);
    upper.rotation.set(0.42, 0, side * 0.32);
    armG.add(upper);

    const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.3, 8, 12), wetsuitMat);
    forearm.position.set(side * 0.12, gripY, -0.04);
    forearm.rotation.set(0.35, 0, -side * 0.78);
    armG.add(forearm);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.054, 12, 12), skinMat);
    hand.position.set(0, gripY, 0);
    armG.add(hand);

    // Glowing Freediving Wrist Computer + Safety Lanyard Clip on Left Wrist!
    if (hasWatch) {
      const watchCase = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.022, 14), wetsuitMat);
      watchCase.rotation.x = Math.PI / 2;
      watchCase.position.set(-0.07, gripY, 0.045);
      const watchScreen = new THREE.Mesh(
        new THREE.CircleGeometry(0.032, 14),
        new THREE.MeshBasicMaterial({ color: '#38BDF8' })
      );
      watchScreen.position.set(-0.07, gripY, 0.058);
      // Silver safety lanyard carabiner clipped onto the vertical white rope
      const carabiner = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.012, 8, 16), chromeMat);
      carabiner.position.set(0, gripY - 0.14, 0);
      armG.add(watchCase, watchScreen, carabiner);
    }
    return armG;
  };
  diver.add(makeBentArm(1, 1.62, 1.54, false));
  diver.add(makeBentArm(-1, 1.52, 1.22, true));

  // Softly bent legs + long carbon freediving bi-fins
  const finFootMat = new THREE.MeshStandardMaterial({ color: '#1F2937', roughness: 0.5 });
  const finBladeMat = new THREE.MeshStandardMaterial({
    color: '#111827',
    roughness: 0.3,
    metalness: 0.35,
    side: THREE.DoubleSide,
  });
  const finShape = new THREE.Shape();
  finShape.moveTo(-0.065, 0);
  finShape.lineTo(-0.105, -0.58);
  finShape.quadraticCurveTo(0, -0.86, 0.105, -0.58);
  finShape.lineTo(0.065, 0);
  finShape.lineTo(-0.065, 0);
  const finBladeGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.012, bevelEnabled: false, curveSegments: 8 });
  {
    const fp = finBladeGeo.attributes.position;
    for (let i = 0; i < fp.count; i++) {
      const y = fp.getY(i);
      fp.setZ(i, fp.getZ(i) - y * y * 0.32); // sweep the blade back as it lengthens
    }
    finBladeGeo.computeVertexNormals();
  }
  const finMeshes: THREE.Group[] = [];
  [-0.105, 0.105].forEach((lx) => {
    const legG = new THREE.Group();
    legG.position.set(lx, 0.98, -0.18);

    // Full-length wetsuit legs (bare skin read as grey blocks under the blue light)
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.098, 0.38, 10, 16), wetsuitMat);
    thigh.position.set(0, -0.22, 0.09);
    thigh.rotation.x = -0.38;
    legG.add(thigh);

    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.38, 10, 16), wetsuitMat);
    shin.position.set(0, -0.6, 0.05);
    shin.rotation.x = 0.45;
    legG.add(shin);

    const finGroup = new THREE.Group();
    finGroup.position.set(0, -0.85, -0.05);
    const pocket = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.12, 6, 10), finFootMat);
    pocket.rotation.x = 0.4;
    finGroup.add(pocket);
    // Long, gently curved carbon blade with a rounded tip — the freediver's signature bi-fin.
    const blade = new THREE.Mesh(finBladeGeo, finBladeMat);
    blade.position.set(0, -0.06, -0.04);
    blade.rotation.x = 0.32;
    finGroup.add(blade);
    legG.add(finGroup);

    diver.add(legG);
    finMeshes.push(finGroup);
  });
  group.add(diver);

  // --------------------------------------------------------------------------
  // E. GRACEFUL GLIDING MANTA RAY, 18 SCHOOLING FISH & 36 RISING BUBBLES
  // --------------------------------------------------------------------------
  // Manta: one swept-wing body (grid shaped into a diamond, thick at the spine, thin at the
  // tips). The same geometry is drawn twice — dark navy seen from above, pale belly from below —
  // and update() runs a travelling wave out along the wings.
  const mantaGroup = new THREE.Group();
  const mantaGeo = new THREE.PlaneGeometry(2.8, 1.4, 28, 12);
  mantaGeo.rotateX(-Math.PI / 2);
  {
    const mp = mantaGeo.attributes.position;
    for (let i = 0; i < mp.count; i++) {
      const x = mp.getX(i);
      const zNorm = mp.getZ(i) / 0.7; // -1..1
      // 0 at the spine, 1 at the wingtip. Clamped: |x| can land a hair past 1.4 in float32, and
      // Math.pow(negative, 0.9) is NaN.
      const ax = Math.min(1, Math.abs(x) / 1.4);
      const halfChord = 0.72 * Math.pow(1 - Math.pow(ax, 1.5), 0.9) + 0.02;
      const sweep = -ax * 0.5; // wingtips trail backwards
      const bulge = 0.13 * Math.exp(-x * x * 5) * (1 - zNorm * zNorm);
      mp.setXYZ(i, x, bulge, zNorm * halfChord + sweep);
    }
    mantaGeo.computeVertexNormals();
  }
  const mantaRest = Float32Array.from(mantaGeo.attributes.position.array as ArrayLike<number>);
  const mantaTop = new THREE.Mesh(
    mantaGeo,
    new THREE.MeshStandardMaterial({ color: '#1E3A5F', roughness: 0.5, side: THREE.FrontSide })
  );
  const mantaBelly = new THREE.Mesh(
    mantaGeo,
    new THREE.MeshStandardMaterial({ color: '#D7E3EC', roughness: 0.55, side: THREE.BackSide })
  );
  const mantaTail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.035, 1.4, 8),
    new THREE.MeshStandardMaterial({ color: '#1E3A5F', roughness: 0.5 })
  );
  mantaTail.rotation.x = Math.PI / 2;
  mantaTail.position.set(0, 0.02, -1.35);
  // Cephalic fins: the two curled lobes either side of the mouth
  const lobeMat = new THREE.MeshStandardMaterial({ color: '#1E3A5F', roughness: 0.5 });
  [-0.22, 0.22].forEach((lx) => {
    const lobe = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.16, 4, 8), lobeMat);
    lobe.rotation.x = Math.PI / 2 - 0.3;
    lobe.position.set(lx, 0.02, 0.78);
    mantaGroup.add(lobe);
  });
  mantaGroup.add(mantaTop, mantaBelly, mantaTail);
  mantaGroup.scale.setScalar(1.15);
  group.add(mantaGroup);

  // Three small schools (golden, coral-orange, sky-blue) that orbit as groups, each fish with
  // a forked tail, a dorsal fin and its own wobble around the school's leader.
  const fishes: {
    mesh: THREE.Group;
    tail: THREE.Mesh;
    radius: number;
    y: number;
    speed: number;
    phase: number;
    offset: THREE.Vector3;
  }[] = [];
  const fishBodyGeo = new THREE.SphereGeometry(0.08, 14, 10);
  fishBodyGeo.scale(1.9, 0.78, 0.48);
  const tailShape = new THREE.Shape();
  tailShape.moveTo(0, 0);
  tailShape.lineTo(-0.11, 0.075);
  tailShape.lineTo(-0.085, 0);
  tailShape.lineTo(-0.11, -0.075);
  tailShape.lineTo(0, 0);
  const fishTailGeo = new THREE.ShapeGeometry(tailShape);
  const finShapeDorsal = new THREE.Shape();
  finShapeDorsal.moveTo(-0.05, 0);
  finShapeDorsal.lineTo(0.0, 0.06);
  finShapeDorsal.lineTo(0.05, 0);
  const fishFinGeo = new THREE.ShapeGeometry(finShapeDorsal);
  const schools = [
    { color: '#FACC15', radius: 2.6, y: -1.6, speed: 0.34, phase: 0 },
    { color: '#FB923C', radius: 4.2, y: -3.1, speed: 0.26, phase: 2.1 },
    { color: '#60A5FA', radius: 3.4, y: -4.7, speed: 0.3, phase: 4.2 },
  ];
  schools.forEach((school) => {
    const bodyMat = new THREE.MeshStandardMaterial({ color: school.color, roughness: 0.38, metalness: 0.22 });
    const finMat = new THREE.MeshStandardMaterial({
      color: school.color,
      roughness: 0.5,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    for (let f = 0; f < 7; f++) {
      const fg = new THREE.Group();
      const fScale = 0.8 + ((f * 37) % 5) * 0.09;
      const fBody = new THREE.Mesh(fishBodyGeo, bodyMat);
      const fTail = new THREE.Mesh(fishTailGeo, finMat);
      fTail.position.x = -0.13;
      const fFin = new THREE.Mesh(fishFinGeo, finMat);
      fFin.position.set(0.01, 0.05, 0);
      fg.add(fBody, fTail, fFin);
      fg.scale.setScalar(fScale);
      group.add(fg);
      fishes.push({
        mesh: fg,
        tail: fTail,
        radius: school.radius,
        y: school.y,
        speed: school.speed,
        phase: school.phase,
        offset: new THREE.Vector3(
          ((f % 3) - 1) * 0.28 + Math.sin(f * 2.3) * 0.1,
          ((f * 13) % 5) * 0.08 - 0.16,
          (Math.floor(f / 3) - 1) * 0.3
        ),
      });
    }
  });

  // 36 Rising Shimmering Air Bubbles (including micro-bubble trails near diver & rope)
  const bubbles: { mesh: THREE.Mesh; speed: number; phase: number; bx: number; bz: number }[] = [];
  const bubbleMat = new THREE.MeshStandardMaterial({
    color: '#F0F9FF',
    emissive: '#7DD3FC',
    emissiveIntensity: 0.9,
    transparent: true,
    opacity: 0.8,
  });
  for (let i = 0; i < 36; i++) {
    const isNearDiver = i < 12;
    const b = new THREE.Mesh(
      new THREE.SphereGeometry(isNearDiver ? 0.022 + (i % 3) * 0.01 : 0.032 + (i % 4) * 0.015, 8, 8),
      bubbleMat
    );
    const angle = i * 0.68;
    const rad = isNearDiver ? 0.12 + (i % 4) * 0.09 : 0.45 + (i % 6) * 0.58;
    const bx = Math.cos(angle) * rad;
    const bz = Math.sin(angle) * rad;
    b.position.set(bx, -poolDepth + 0.5 + (i % 8) * 0.75, bz);
    group.add(b);
    bubbles.push({ mesh: b, speed: 0.52 + (i % 4) * 0.16, phase: i * 0.35, bx, bz });
  }

  // Surface diamond beacon above the dive buoy
  const beacon = createMemoryBeacon(2.15, '#38BDF8');
  group.add(beacon);

  return {
    group,
    beacon,
    update: (elapsed) => {
      // Weightless underwater breathing float along the white guide rope
      diver.position.y = -4.25 + Math.sin(elapsed * 0.95) * 0.32;
      diver.rotation.y = Math.sin(elapsed * 0.42) * 0.12;

      finMeshes.forEach((fm, idx) => {
        fm.rotation.x = Math.sin(elapsed * 2.0 + idx * Math.PI) * 0.15;
      });
      hairStrands.forEach((hs) => {
        hs.mesh.rotation.x = hs.baseRotX + Math.sin(elapsed * 1.7 + hs.phase) * 0.16;
      });

      // Counter-rotating caustic light webs on seabed & underside water ceiling
      causticFloorA.rotation.z = elapsed * 0.08;
      causticFloorB.rotation.z = -elapsed * 0.06;
      surfaceCeilingHalo.rotation.z = elapsed * 0.05;

      // Gentle marine snow drift
      marineSnow.position.y = Math.sin(elapsed * 0.4) * 0.15;
      marineSnow.rotation.y = elapsed * 0.015;

      // Surface buoy & pontoon sea bobbing
      buoyGroup.position.y = 0.08 + Math.sin(elapsed * 1.8) * 0.05;
      buoyGroup.rotation.z = Math.sin(elapsed * 1.3) * 0.06;
      pontoon.position.y = 0.16 + Math.sin(elapsed * 1.4 + 0.5) * 0.035;

      godRays.forEach((gr, idx) => {
        gr.rotation.z = -0.18 + Math.sin(elapsed * 0.65 + idx) * 0.045;
      });
      rayUniforms.uTime.value = elapsed;

      // Kelp bends like a ribbon: root fixed, sway growing toward the tip, with a wave
      // travelling up the blade.
      kelpRibbons.forEach((kr) => {
        const pos = kr.geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const ry = kr.rest[i * 3 + 1];
          const t = ry / kr.height;
          const bend = Math.pow(t, 1.6);
          const wave = Math.sin(elapsed * 1.15 + kr.phase - t * 2.4);
          pos.setX(i, kr.rest[i * 3] + wave * bend * 0.38);
          pos.setZ(i, kr.rest[i * 3 + 2] + Math.cos(elapsed * 0.8 + kr.phase - t * 1.8) * bend * 0.22);
        }
        pos.needsUpdate = true;
      });

      // Manta glides on a wide orbit; a wave rolls out along each wing (tips move most).
      const mAng = elapsed * 0.18;
      const mRad = 7.6;
      mantaGroup.position.set(
        Math.cos(mAng) * mRad,
        -2.7 + Math.sin(elapsed * 0.55) * 0.55,
        Math.sin(mAng) * mRad - 1.2
      );
      mantaGroup.rotation.y = -mAng;
      mantaGroup.rotation.z = Math.sin(elapsed * 0.55) * 0.08; // gentle banking
      {
        const mp = mantaGeo.attributes.position;
        for (let i = 0; i < mp.count; i++) {
          const x = mantaRest[i * 3];
          const ax = Math.min(1, Math.abs(x) / 1.4);
          const flap = Math.sin(elapsed * 1.7 - ax * 2.2 + mantaRest[i * 3 + 2] * 0.8) * Math.pow(ax, 1.4) * 0.42;
          mp.setY(i, mantaRest[i * 3 + 1] + flap);
        }
        mp.needsUpdate = true;
        mantaGeo.computeVertexNormals();
      }

      fishes.forEach((f) => {
        const a = elapsed * f.speed + f.phase;
        const cx = Math.cos(a) * f.radius;
        const cz = Math.sin(a) * (f.radius * 0.82);
        const wob = Math.sin(elapsed * 1.9 + f.offset.x * 7) * 0.06;
        f.mesh.position.set(
          cx + f.offset.x * Math.cos(a) - f.offset.z * Math.sin(a),
          f.y + f.offset.y + Math.sin(elapsed * 1.3 + f.phase + f.offset.z * 3) * 0.08,
          cz + f.offset.x * Math.sin(a) + f.offset.z * Math.cos(a) + wob
        );
        f.mesh.rotation.y = -a + Math.PI / 2;
        f.tail.rotation.y = Math.sin(elapsed * 9 + f.phase + f.offset.x * 5) * 0.45;
      });

      bubbles.forEach((b) => {
        const t = (elapsed * b.speed + b.phase) % (poolDepth - 0.55);
        b.mesh.position.set(b.bx + Math.sin(elapsed * 2.4 + b.phase) * 0.07, -poolDepth + 0.4 + t, b.bz);
      });

      crimsonOrb.scale.setScalar(1 + Math.sin(elapsed * 2.2) * 0.05);
      crimsonLight.intensity = 1.8 + Math.sin(elapsed * 2.2) * 0.35;

      beacon.position.y = 2.15 + Math.sin(elapsed * 2.0) * 0.14;
      beacon.rotation.y = elapsed * 1.1;
    },
  };
}

// ============================================================================
// Dedicated Procedural Textures for M02: Zhuzhou Foreign Language School
// ============================================================================
function createGranitePlazaTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#D5D1C8';
    ctx.fillRect(0, 0, 256, 256);
    const tile = 32;
    for (let y = 0; y < 256; y += tile) {
      for (let x = 0; x < 256; x += tile) {
        const tone = ((x * 7 + y * 13) % 5) * 3 - 6;
        ctx.fillStyle = tone > 0 ? 'rgba(255,255,255,0.08)' : 'rgba(60,55,48,0.06)';
        ctx.fillRect(x + 1, y + 1, tile - 2, tile - 2);
        ctx.strokeStyle = 'rgba(110,105,96,0.28)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, tile - 1, tile - 1);
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

function createYzflsFacadeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Crisp white ceramic-tiled facade base
    ctx.fillStyle = '#F2F5F9';
    ctx.fillRect(0, 0, 1024, 512);

    // Subtle tile grid lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1024; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y < 512; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    const floors = 5;
    const fh = 512 / floors;
    const bays = 6;
    const bw = 1024 / bays;

    for (let f = 0; f < floors; f++) {
      const fy = f * fh;
      // Cobalt-blue horizontal floor spandrel band (signature of YZFLS)
      ctx.fillStyle = '#2B72B8';
      ctx.fillRect(0, fy + fh * 0.72, 1024, fh * 0.24);
      // Thin white accent trim above blue band
      ctx.fillStyle = '#E2ECF7';
      ctx.fillRect(0, fy + fh * 0.67, 1024, fh * 0.05);

      for (let b = 0; b < bays; b++) {
        const bx = b * bw;
        // Ribbon window opening inside each bay
        const wx = bx + 16;
        const wy = fy + 8;
        const ww = bw - 32;
        const wh = fh * 0.56;

        // Deep blue reflective classroom glass
        const glassGrad = ctx.createLinearGradient(wx, wy, wx, wy + wh);
        glassGrad.addColorStop(0, f === 0 ? '#243B55' : '#2C5E8A');
        glassGrad.addColorStop(0.6, '#3B78A8');
        glassGrad.addColorStop(1, '#1E4668');
        ctx.fillStyle = glassGrad;
        ctx.fillRect(wx, wy, ww, wh);

        // Top-floor subtle burgundy/dark interior accents visible in p2-yzfls.jpg
        if (f === 0 && (b === 1 || b === 2 || b === 4)) {
          ctx.fillStyle = 'rgba(136, 28, 42, 0.55)';
          ctx.fillRect(wx + ww * 0.22, wy + wh * 0.22, ww * 0.24, wh * 0.68);
        }

        // Diagonal sky sheen on glass
        ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wx + ww * 0.42, wy);
        ctx.lineTo(wx, wy + wh * 0.72);
        ctx.closePath();
        ctx.fill();

        // Crisp aluminum window mullions (4 panes per bay)
        ctx.strokeStyle = '#DCE6F2';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(wx, wy, ww, wh);
        for (let p = 1; p < 4; p++) {
          ctx.beginPath();
          ctx.moveTo(wx + (ww / 4) * p, wy);
          ctx.lineTo(wx + (ww / 4) * p, wy + wh);
          ctx.stroke();
        }
        // Horizontal transom bar
        ctx.beginPath();
        ctx.moveTo(wx, wy + wh * 0.34);
        ctx.lineTo(wx + ww, wy + wh * 0.34);
        ctx.stroke();
      }
    }

    // Prominent vertical sky-blue pilasters dividing the 6 structural bays
    for (let b = 0; b <= bays; b++) {
      const px = b === 0 ? 0 : b === bays ? 1024 - 18 : b * bw - 10;
      const pw = b === 0 || b === bays ? 18 : 20;
      ctx.fillStyle = '#3B82C4';
      ctx.fillRect(px, 0, pw, 512);
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fillRect(px + 2, 0, 4, 512);
    }

    // Top white parapet cornice stripe
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, 1024, 10);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createHonorsPlaqueWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Granite stone retaining wall base
    ctx.fillStyle = '#9E9A90';
    ctx.fillRect(0, 0, 512, 256);

    // Top blue institutional header strip
    ctx.fillStyle = '#1D5FA7';
    ctx.fillRect(14, 14, 148, 36);
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 16px "Noto Serif SC", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('湖南省示范性学校', 88, 32);

    // 3x3 grid of gleaming gold & bronze honor plaques (signature curved wall in p2-yzfls.jpg)
    const cols = 3;
    const rows = 3;
    const padX = 18;
    const padY = 62;
    const cellW = (512 - padX * 2) / cols;
    const cellH = (256 - padY - 16) / rows;
    const plaqueColors = ['#E5C158', '#D4AF37', '#C8A464', '#DFBE6F', '#B89552', '#E2C478'];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const px = padX + c * cellW + 6;
        const py = padY + r * cellH + 5;
        const pw = cellW - 12;
        const ph = cellH - 10;
        const baseCol = plaqueColors[(r * cols + c) % plaqueColors.length];

        const grad = ctx.createLinearGradient(px, py, px + pw, py + ph);
        grad.addColorStop(0, '#F5E199');
        grad.addColorStop(0.5, baseCol);
        grad.addColorStop(1, '#9E7B34');
        ctx.fillStyle = grad;
        ctx.fillRect(px, py, pw, ph);

        ctx.strokeStyle = '#6E521C';
        ctx.lineWidth = 2;
        ctx.strokeRect(px, py, pw, ph);

        // Engraved plaque text lines
        ctx.fillStyle = '#5C1B1B';
        ctx.fillRect(px + pw * 0.16, py + ph * 0.3, pw * 0.68, 4);
        ctx.fillStyle = '#3B2C10';
        ctx.fillRect(px + pw * 0.24, py + ph * 0.56, pw * 0.52, 3);
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createInternationalFlagTexture(
  country: 'cn' | 'es' | 'de' | 'fr' | 'uk' | 'ca' | 'it' | 'jp'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 84;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    if (country === 'cn') {
      ctx.fillStyle = '#DE2910';
      ctx.fillRect(0, 0, 128, 84);
      ctx.fillStyle = '#FFDE00';
      ctx.beginPath();
      ctx.arc(24, 24, 9, 0, Math.PI * 2);
      ctx.fill();
      [
        [42, 12],
        [48, 22],
        [48, 34],
        [40, 42],
      ].forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.arc(sx, sy, 3.2, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (country === 'es') {
      ctx.fillStyle = '#AA151B';
      ctx.fillRect(0, 0, 128, 21);
      ctx.fillStyle = '#F1BF00';
      ctx.fillRect(0, 21, 128, 42);
      ctx.fillStyle = '#AA151B';
      ctx.fillRect(0, 63, 128, 21);
      ctx.fillStyle = '#8B1E24';
      ctx.fillRect(28, 32, 14, 20);
    } else if (country === 'de') {
      ctx.fillStyle = '#141414';
      ctx.fillRect(0, 0, 128, 28);
      ctx.fillStyle = '#DD0000';
      ctx.fillRect(0, 28, 128, 28);
      ctx.fillStyle = '#FFCE00';
      ctx.fillRect(0, 56, 128, 28);
    } else if (country === 'fr') {
      ctx.fillStyle = '#002395';
      ctx.fillRect(0, 0, 43, 84);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(43, 0, 42, 84);
      ctx.fillStyle = '#ED2939';
      ctx.fillRect(85, 0, 43, 84);
    } else if (country === 'uk') {
      ctx.fillStyle = '#012169';
      ctx.fillRect(0, 0, 128, 84);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(128, 84);
      ctx.moveTo(128, 0);
      ctx.lineTo(0, 84);
      ctx.stroke();
      ctx.strokeStyle = '#C8102E';
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(52, 0, 24, 84);
      ctx.fillRect(0, 30, 128, 24);
      ctx.fillStyle = '#C8102E';
      ctx.fillRect(57, 0, 14, 84);
      ctx.fillRect(0, 35, 128, 14);
    } else if (country === 'ca') {
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(0, 0, 32, 84);
      ctx.fillRect(96, 0, 32, 84);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(32, 0, 64, 84);
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.arc(64, 42, 16, 0, Math.PI * 2);
      ctx.fill();
    } else if (country === 'it') {
      ctx.fillStyle = '#009246';
      ctx.fillRect(0, 0, 43, 84);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(43, 0, 42, 84);
      ctx.fillStyle = '#CE2B37';
      ctx.fillRect(85, 0, 43, 84);
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 128, 84);
      ctx.fillStyle = '#BC002D';
      ctx.beginPath();
      ctx.arc(64, 42, 22, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ============================================================================
// M02: Zhuzhou Foreign Language School (P2 - 株洲市外国语学校)
// High-fidelity architectural diorama: two-tier granite stairs, retractable
// school gate, central motto stone monument, red nameplate wall + campus rock,
// curved honors plaque wall, canary-yellow louvered pillar + white sail spire,
// sweeping curved white pergola canopy + yellow guardhouse, international flags,
// vintage green lamp posts, lush camphor tree, and 5-story blue-and-white hall
// crowned with "办有灵魂的学校".
// ============================================================================
function buildYzflsCampusMemory(): BuiltMemoryModel {
  const group = new THREE.Group();

  const plazaTex = createGranitePlazaTexture();
  const plazaMat = new THREE.MeshStandardMaterial({ map: plazaTex, roughness: 0.86 });
  const terraceMat = new THREE.MeshStandardMaterial({ color: '#D2CEC4', roughness: 0.86 });
  const stepMat = new THREE.MeshStandardMaterial({ color: '#C9C4BA', roughness: 0.84 });
  const curbMat = new THREE.MeshStandardMaterial({ color: '#E8E5DC', roughness: 0.78 });
  const railMat = new THREE.MeshStandardMaterial({ color: '#E2E8F0', roughness: 0.24, metalness: 0.82 });
  const yellowMat = new THREE.MeshStandardMaterial({ color: '#F5D22E', roughness: 0.48 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.42 });
  const cobaltMat = new THREE.MeshStandardMaterial({ color: '#1F66B4', roughness: 0.52 });
  const goldTrimMat = new THREE.MeshStandardMaterial({ color: '#E6B422', roughness: 0.4, metalness: 0.35 });
  const navyGlassMat = new THREE.MeshStandardMaterial({
    color: '#17375E',
    roughness: 0.14,
    metalness: 0.62,
  });
  const lawnMat = new THREE.MeshStandardMaterial({ color: '#4E9F3D', roughness: 0.9, flatShading: true });

  // --------------------------------------------------------------------------
  // 1. MULTI-TIERED HILLSIDE CAMPUS FOUNDATION & SLOPED GREEN LAWNS
  // --------------------------------------------------------------------------
  const basePlaza = new THREE.Mesh(new THREE.BoxGeometry(10.6, 0.28, 9.6), plazaMat);
  basePlaza.position.set(0, 0.14, 0.25);
  basePlaza.receiveShadow = true;
  group.add(basePlaza);

  // Middle gate landing terrace (supports yellow pillar, retractable gate & guardhouse)
  const midLanding = new THREE.Mesh(new THREE.BoxGeometry(10.2, 1.18, 2.2), terraceMat);
  midLanding.position.set(0, 0.87, 1.35);
  midLanding.receiveShadow = true;
  group.add(midLanding);

  // Upper main academic terrace (supports 5-story blue-and-white hall & side wings)
  const upperTerrace = new THREE.Mesh(new THREE.BoxGeometry(10.2, 2.24, 4.1), terraceMat);
  upperTerrace.position.set(0, 1.4, -2.55);
  upperTerrace.receiveShadow = true;
  group.add(upperTerrace);

  // Sloped lush green hillside lawns flanking the upper staircase (signature of Phoenix Hill campus)
  [-1, 1].forEach((side) => {
    const slopeLawn = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.42, 2.75), lawnMat);
    slopeLawn.position.set(side * 2.85, 1.98, 0.05);
    slopeLawn.rotation.x = 0.42;
    slopeLawn.receiveShadow = true;
    group.add(slopeLawn);
  });

  // --------------------------------------------------------------------------
  // 2. LOWER GRAND 12-STEP STONE STAIRCASE + CURBS + ANCHORED STAINLESS HANDRAILS
  // --------------------------------------------------------------------------
  const lowerSteps = 12;
  for (let i = 0; i < lowerSteps; i++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.11, 0.26), stepMat);
    step.position.set(0, 0.32 + i * 0.105, 4.55 - i * 0.23);
    step.castShadow = true;
    step.receiveShadow = true;
    group.add(step);
  }

  // Stepped white stone coping curbs framing left & right of lower staircase
  [-1.85, 1.85].forEach((cx) => {
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.34, 3.05), curbMat);
    curb.position.set(cx, 0.94, 3.28);
    curb.rotation.x = 0.42;
    curb.castShadow = true;
    curb.receiveShadow = true;
    group.add(curb);
  });

  // 4 Stainless Steel Handrails (2 inner dividing into 3 lanes, 2 outer) with vertical stanchions
  [-1.62, -0.58, 0.58, 1.62].forEach((rx) => {
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 3.05, 8), railMat);
    rail.position.set(rx, 1.38, 3.25);
    rail.rotation.x = Math.PI / 2 - 0.42;
    group.add(rail);

    // 3 vertical anchor posts per handrail
    [0, 1, 2].forEach((pIdx) => {
      const t = pIdx / 2;
      const pz = 4.45 - t * 2.4;
      const py = 0.36 + t * 1.12;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.56, 6), railMat);
      post.position.set(rx, py + 0.26, pz);
      group.add(post);
    });
  });

  // --------------------------------------------------------------------------
  // 3. RETRACTABLE STAINLESS-STEEL SCHOOL GATE (电动伸缩铁门) AT MID LANDING
  // --------------------------------------------------------------------------
  const gateY = 1.48;
  const gateZ = 1.86;
  // Gate head housing (right side) + glowing red LED ticker strip
  const gateHead = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.58, 0.16), railMat);
  gateHead.position.set(1.52, gateY + 0.29, gateZ);
  group.add(gateHead);

  const ledStrip = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.08, 0.04),
    new THREE.MeshStandardMaterial({
      color: '#EF4444',
      emissive: '#DC2626',
      emissiveIntensity: 0.9,
      roughness: 0.3,
    })
  );
  ledStrip.position.set(0.0, gateY + 0.54, gateZ + 0.04);
  group.add(ledStrip);

  // Criss-cross metallic accordion lattice across the entrance landing
  for (let i = 0; i < 11; i++) {
    const gx = -1.48 + i * 0.29;
    const upright = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.52, 6), railMat);
    upright.position.set(gx, gateY + 0.26, gateZ);
    group.add(upright);
    if (i < 10) {
      const diagA = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.016, 0.016), railMat);
      diagA.position.set(gx + 0.145, gateY + 0.26, gateZ);
      diagA.rotation.z = 0.68;
      const diagB = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.016, 0.016), railMat);
      diagB.position.set(gx + 0.145, gateY + 0.26, gateZ);
      diagB.rotation.z = -0.68;
      group.add(diagA, diagB);
    }
  }

  // --------------------------------------------------------------------------
  // 4. UPPER SPLIT STAIRCASE & CENTRAL SEMI-CIRCULAR MOTTO STONE MONUMENT
  // --------------------------------------------------------------------------
  const upperSteps = 8;
  for (let i = 0; i < upperSteps; i++) {
    [-1.12, 1.12].forEach((sx) => {
      const step = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.13, 0.28), stepMat);
      step.position.set(sx, 1.54 + i * 0.13, 1.25 - i * 0.25);
      step.castShadow = true;
      step.receiveShadow = true;
      group.add(step);
    });
  }

  // Central Sculptural Arched Motto Stone Monument (visible directly behind gate in p2-yzfls.jpg)
  const monumentPlinth = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.34, 0.62), curbMat);
  monumentPlinth.position.set(0, 1.72, 0.42);
  monumentPlinth.castShadow = true;
  group.add(monumentPlinth);

  const monumentShape = new THREE.Shape();
  monumentShape.moveTo(-0.48, 0);
  monumentShape.lineTo(0.48, 0);
  monumentShape.lineTo(0.48, 0.42);
  monumentShape.absarc(0, 0.42, 0.48, 0, Math.PI, false);
  monumentShape.closePath();

  const monumentGeo = new THREE.ExtrudeGeometry(monumentShape, {
    depth: 0.24,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 3,
  });
  const monumentMesh = new THREE.Mesh(
    monumentGeo,
    new THREE.MeshStandardMaterial({ color: '#E2C6A2', roughness: 0.85 })
  );
  monumentMesh.position.set(0, 1.88, 0.3);
  monumentMesh.castShadow = true;
  group.add(monumentMesh);

  const mottoTex = createTextSignTexture('厚德 · 博学 · 求真', {
    width: 320,
    height: 128,
    bg: 'transparent',
    color: '#991B1B',
    font: 'bold 34px "Noto Serif SC", "Songti SC", serif',
    subtitle: 'SOULFUL EDUCATION',
  });
  const mottoFace = new THREE.Mesh(
    new THREE.PlaneGeometry(0.84, 0.38),
    new THREE.MeshBasicMaterial({ map: mottoTex, transparent: true })
  );
  mottoFace.position.set(0, 2.28, 0.58);
  group.add(mottoFace);

  // --------------------------------------------------------------------------
  // 5. LEFT FORECOURT: RED NAMEPLATE WALL, SCULPTED BOULDER, CURVED HONORS WALL & SIGNS
  // --------------------------------------------------------------------------
  const maroonWallMat = new THREE.MeshStandardMaterial({ color: '#8C2D24', roughness: 0.76 });
  const nameWall = new THREE.Mesh(new THREE.BoxGeometry(2.45, 1.12, 0.26), maroonWallMat);
  nameWall.position.set(-3.45, 0.84, 2.75);
  nameWall.castShadow = true;
  group.add(nameWall);

  // Stone coping cap on top of nameplate wall
  const nameWallCap = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.08, 0.32), curbMat);
  nameWallCap.position.set(-3.45, 1.43, 2.75);
  group.add(nameWallCap);

  const nameTex = createTextSignTexture('株洲市外国语学校', {
    width: 640,
    height: 160,
    bg: '#8C2D24',
    color: '#F5D58A',
    font: 'bold 58px "Noto Serif SC", "Songti SC", serif',
    subtitle: 'ZHUZHOU FOREIGN LANGUAGE SCHOOL',
  });
  const nameFront = new THREE.Mesh(
    new THREE.PlaneGeometry(2.34, 0.92),
    new THREE.MeshBasicMaterial({ map: nameTex })
  );
  nameFront.position.set(-3.45, 0.86, 2.89);
  group.add(nameFront);

  // Iconic Warm Ochre-Brown Landscape Boulder in front of the nameplate wall
  const campusRock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.56, 1),
    new THREE.MeshStandardMaterial({ color: '#A87D4B', roughness: 0.9, flatShading: true })
  );
  campusRock.scale.set(1.38, 0.88, 0.92);
  campusRock.position.set(-3.65, 0.62, 3.38);
  campusRock.rotation.y = 0.35;
  campusRock.castShadow = true;
  group.add(campusRock);

  // Curved Grey-Stone Honors Plaque Wall connecting Nameplate Wall to Left Yellow Pillar
  const honorsTex = createHonorsPlaqueWallTexture();
  const honorsWall = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 0.98, 1.24, 14, 1, true, -0.15, 1.28),
    new THREE.MeshStandardMaterial({ map: honorsTex, roughness: 0.55, side: THREE.DoubleSide })
  );
  honorsWall.position.set(-2.55, 1.18, 2.02);
  honorsWall.castShadow = true;
  group.add(honorsWall);

  // Backing core for curved honors wall
  const honorsCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 0.93, 1.26, 12, 1, false, -0.15, 1.28),
    new THREE.MeshStandardMaterial({ color: '#9E9A90', roughness: 0.85 })
  );
  honorsCore.position.set(-2.55, 1.18, 2.02);
  group.add(honorsCore);

  // Street-level authentic campus signs (Bottom-Left Blue Traffic Sign & Bottom-Right Red Smoke-Free Sign)
  const leftSignPole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.028, 0.92, 8), railMat);
  leftSignPole.position.set(-4.55, 0.72, 4.35);
  group.add(leftSignPole);
  const trafficTex = createTextSignTexture('学校路段', {
    width: 220,
    height: 140,
    bg: '#1D4ED8',
    color: '#FFFFFF',
    font: 'bold 40px "Noto Sans SC", sans-serif',
    border: '#F8FAFC',
    subtitle: '车辆缓行 · SLOW',
  });
  const leftTrafficSign = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, 0.38, 0.04),
    new THREE.MeshBasicMaterial({ map: trafficTex })
  );
  leftTrafficSign.position.set(-4.55, 1.18, 4.35);
  group.add(leftTrafficSign);

  const rightSignPole = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.026, 0.88, 8), railMat);
  rightSignPole.position.set(4.45, 0.7, 4.35);
  group.add(rightSignPole);
  const smokeFreeTex = createTextSignTexture('无烟校园', {
    width: 220,
    height: 140,
    bg: '#B91C1C',
    color: '#FFFFFF',
    font: 'bold 38px "Noto Sans SC", sans-serif',
    border: '#FCA5A5',
    subtitle: '禁止吸烟',
  });
  const rightSmokeSign = new THREE.Mesh(
    new THREE.BoxGeometry(0.54, 0.36, 0.04),
    new THREE.MeshBasicMaterial({ map: smokeFreeTex })
  );
  rightSmokeSign.position.set(4.45, 1.14, 4.35);
  group.add(rightSmokeSign);

  // --------------------------------------------------------------------------
  // 6. ICONIC LEFT BRIGHT-YELLOW LOUVERED GATE PILLAR + WHITE TRIANGULAR SAIL SPIRE
  // --------------------------------------------------------------------------
  const leftTowerX = -1.92;
  const leftTowerZ = 1.92;

  const yellowMonolith = new THREE.Mesh(new THREE.BoxGeometry(0.68, 2.85, 0.64), yellowMat);
  yellowMonolith.position.set(leftTowerX, 2.68, leftTowerZ);
  yellowMonolith.castShadow = true;
  group.add(yellowMonolith);

  // 12 signature stacked horizontal yellow louver fins running up the front-left edge
  for (let i = 0; i < 12; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.11, 0.74), yellowMat);
    fin.position.set(leftTowerX - 0.24, 1.48 + i * 0.21, leftTowerZ + 0.04);
    fin.castShadow = true;
    group.add(fin);
  }

  // Tall sleek white triangular sail/blade spire rising behind the yellow monolith
  const sailShape = new THREE.Shape();
  sailShape.moveTo(-0.24, 0);
  sailShape.lineTo(0.24, 0);
  sailShape.lineTo(0.02, 1.85);
  sailShape.closePath();
  const sailMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(sailShape, { depth: 0.14, bevelEnabled: false }),
    whiteMat
  );
  sailMesh.position.set(leftTowerX - 0.14, 3.45, leftTowerZ - 0.12);
  sailMesh.rotation.y = 0.22;
  sailMesh.castShadow = true;
  group.add(sailMesh);

  // Slim silver finial mast rising from the sail peak
  const spireMast = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 1.35, 8), railMat);
  spireMast.position.set(leftTowerX - 0.1, 5.25, leftTowerZ - 0.06);
  group.add(spireMast);

  // --------------------------------------------------------------------------
  // 7. RIGHT MODERN CURVED WHITE LOUVERED PERGOLA CANOPY + YELLOW GUARDHOUSE
  // --------------------------------------------------------------------------
  const guardX = 2.82;
  const guardZ = 1.62;

  // Grey granite-tiled left support column for cantilevered canopy
  const canopyCol = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 1.32, 0.34),
    new THREE.MeshStandardMaterial({ color: '#787D85', roughness: 0.78 })
  );
  canopyCol.position.set(1.78, 2.08, guardZ + 0.18);
  canopyCol.castShadow = true;
  group.add(canopyCol);

  // Thick crisp white cantilevered horizontal roof slab over gate passage
  const canopySlab = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.22, 1.55), whiteMat);
  canopySlab.position.set(2.58, 2.78, guardZ);
  canopySlab.castShadow = true;
  canopySlab.receiveShadow = true;
  group.add(canopySlab);

  // Bright yellow guardhouse box tucked neatly with navy reflective glass corner
  const guardBox = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.58, 1.25), yellowMat);
  guardBox.position.set(guardX + 0.15, 2.25, guardZ - 0.05);
  guardBox.castShadow = true;
  group.add(guardBox);

  // Deep navy-blue reflective glass curtain panels on front & right of guardhouse
  const guardFrontGlass = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.85, 0.08), navyGlassMat);
  guardFrontGlass.position.set(guardX + 0.28, 2.42, guardZ + 0.56);
  group.add(guardFrontGlass);

  const guardRightGlass = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.48, 1.16), navyGlassMat);
  guardRightGlass.position.set(guardX + 0.96, 2.32, guardZ - 0.05);
  guardRightGlass.castShadow = true;
  group.add(guardRightGlass);

  // Sweeping Curved White Pergola Arch Roof (arching gracefully upward to the right!)
  const pergolaGroup = new THREE.Group();
  const numRibs = 13;
  for (let i = 0; i < numRibs; i++) {
    const t = i / (numRibs - 1);
    const rx = 1.48 + t * 2.55;
    // Graceful upward-sweeping arch curve matching p2-yzfls.jpg
    const ry = 3.42 + Math.sin(t * Math.PI * 0.78) * 0.62 + t * 0.22;
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.16, 1.72), whiteMat);
    rib.position.set(rx, ry, guardZ);
    rib.rotation.z = (0.45 - t * 0.62) * 0.35;
    rib.castShadow = true;
    pergolaGroup.add(rib);
  }
  // Curved front & back white longitudinal fascia beams tying the ribs together
  [-0.78, 0.78].forEach((bz) => {
    const curvePts: THREE.Vector3[] = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      curvePts.push(
        new THREE.Vector3(
          1.44 + t * 2.64,
          3.42 + Math.sin(t * Math.PI * 0.78) * 0.62 + t * 0.22,
          guardZ + bz
        )
      );
    }
    const beamCurve = new THREE.CatmullRomCurve3(curvePts);
    const beamMesh = new THREE.Mesh(new THREE.TubeGeometry(beamCurve, 20, 0.075, 8, false), whiteMat);
    beamMesh.castShadow = true;
    pergolaGroup.add(beamMesh);
  });
  // Horizontally ribbed white drum support on the right side of the pergola
  for (let d = 0; d < 6; d++) {
    const drumRing = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.06, 16), whiteMat);
    drumRing.position.set(3.75, 3.15 + d * 0.11, guardZ - 0.1);
    pergolaGroup.add(drumRing);
  }
  // Vertical white front support pier under left edge of pergola
  const pergolaLeftPier = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.68, 0.18), whiteMat);
  pergolaLeftPier.position.set(1.78, 3.16, guardZ + 0.45);
  pergolaGroup.add(pergolaLeftPier);
  group.add(pergolaGroup);

  // Vibrant Cobalt-Blue Vertical Sign Stand ("国家级外语教育示范学校") in front of right hedge
  const demoTex = createTextSignTexture('国家级外语教育', {
    width: 256,
    height: 320,
    bg: '#1D63B8',
    color: '#FFFFFF',
    font: 'bold 30px "Noto Serif SC", serif',
    border: '#93C5FD',
    subtitle: '示范学校 · YZFLS',
  });
  const demoStand = new THREE.Mesh(
    new THREE.BoxGeometry(0.58, 0.92, 0.12),
    [cobaltMat, cobaltMat, cobaltMat, cobaltMat, new THREE.MeshBasicMaterial({ map: demoTex }), cobaltMat]
  );
  demoStand.position.set(3.22, 1.56, 2.92);
  demoStand.rotation.y = -0.14;
  demoStand.castShadow = true;
  group.add(demoStand);

  // Translucent Teal-Green Polycarbonate Rain Awning (雨棚) on far right of guardhouse
  const awningMat = new THREE.MeshStandardMaterial({
    color: '#2B8A7E',
    roughness: 0.25,
    metalness: 0.15,
    transparent: true,
    opacity: 0.72,
    side: THREE.DoubleSide,
  });
  const awningRoof = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.05, 1.45), awningMat);
  awningRoof.position.set(4.52, 2.42, guardZ - 0.1);
  awningRoof.rotation.z = -0.06;
  group.add(awningRoof);
  [-0.55, 0, 0.55].forEach((az) => {
    const rafter = new THREE.Mesh(
      new THREE.BoxGeometry(1.58, 0.04, 0.04),
      new THREE.MeshStandardMaterial({ color: '#27303A', roughness: 0.5 })
    );
    rafter.position.set(4.52, 2.38, guardZ - 0.1 + az);
    group.add(rafter);
  });

  // --------------------------------------------------------------------------
  // 8. CRIMSON LOROPETALUM (红继木) FLOWER BEDS & GREEN SHRUBS
  // --------------------------------------------------------------------------
  const crimsonMat = new THREE.MeshStandardMaterial({ color: '#941734', roughness: 0.88, flatShading: true });
  const deepCrimsonMat = new THREE.MeshStandardMaterial({ color: '#701026', roughness: 0.9, flatShading: true });
  const brightCrimsonMat = new THREE.MeshStandardMaterial({ color: '#B02042', roughness: 0.86, flatShading: true });
  const greenShrubMat = new THREE.MeshStandardMaterial({ color: '#2B7A3B', roughness: 0.88, flatShading: true });

  [-1, 1].forEach((side) => {
    for (let i = 0; i < 7; i++) {
      const mat = i % 3 === 0 ? crimsonMat : i % 3 === 1 ? deepCrimsonMat : brightCrimsonMat;
      const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.42 + (i % 2) * 0.1, 1), mat);
      bush.position.set(side * (2.42 + (i % 3) * 0.34), 0.48 + i * 0.13, 4.15 - i * 0.32);
      bush.scale.set(1.32, 0.68, 1.18);
      bush.castShadow = true;
      group.add(bush);
    }
    // Outer green boxwood border framing the crimson flower beds
    for (let g = 0; g < 4; g++) {
      const shrub = new THREE.Mesh(new THREE.DodecahedronGeometry(0.46 + (g % 2) * 0.08, 1), greenShrubMat);
      shrub.position.set(side * (3.75 + (g % 2) * 0.42), 0.56 + g * 0.14, 4.05 - g * 0.52);
      shrub.scale.set(1.2, 0.85, 1.15);
      shrub.castShadow = true;
      group.add(shrub);
    }
  });

  // --------------------------------------------------------------------------
  // 9. BLUE-AND-GOLD SLOPED CULTURAL CORRIDORS, INTERNATIONAL FLAGS & VINTAGE GREEN LAMPS
  // --------------------------------------------------------------------------
  // Sloped blue-and-gold balustrades ascending on left & right of upper lawn
  [-1, 1].forEach((side) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.52, 2.75), cobaltMat);
    wall.position.set(side * 3.85, 2.55, 0.22);
    wall.rotation.x = 0.42;
    wall.castShadow = true;
    group.add(wall);

    const trim = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 2.78), goldTrimMat);
    trim.position.set(side * 3.85, 2.82, 0.22);
    trim.rotation.x = 0.42;
    group.add(trim);
  });

  // 8 Animated International Flags fluttering along the campus stairs & corridors!
  const flagConfigs: {
    country: 'cn' | 'es' | 'de' | 'fr' | 'uk' | 'ca' | 'it' | 'jp';
    pos: [number, number, number];
    tiltZ: number;
  }[] = [
    { country: 'cn', pos: [-1.72, 2.08, 0.92], tiltZ: 0.12 },
    { country: 'fr', pos: [-1.72, 2.38, 0.22], tiltZ: 0.12 },
    { country: 'de', pos: [-3.55, 2.95, 0.72], tiltZ: 0.24 },
    { country: 'es', pos: [-4.05, 2.68, 1.38], tiltZ: 0.26 },
    { country: 'uk', pos: [1.72, 2.08, 0.92], tiltZ: -0.12 },
    { country: 'ca', pos: [1.72, 2.38, 0.22], tiltZ: -0.12 },
    { country: 'it', pos: [2.15, 2.72, -0.45], tiltZ: -0.14 },
    { country: 'jp', pos: [-2.15, 2.72, -0.45], tiltZ: 0.14 },
  ];

  const flagCloths: { mesh: THREE.Mesh; phase: number }[] = [];
  flagConfigs.forEach((fc, idx) => {
    const flagGroup = new THREE.Group();
    flagGroup.position.set(fc.pos[0], fc.pos[1], fc.pos[2]);
    flagGroup.rotation.z = fc.tiltZ;

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.018, 1.15, 6), railMat);
    pole.position.y = 0.56;
    flagGroup.add(pole);

    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), goldTrimMat);
    finial.position.y = 1.15;
    flagGroup.add(finial);

    const cloth = new THREE.Mesh(
      new THREE.PlaneGeometry(0.46, 0.3, 6, 2),
      new THREE.MeshStandardMaterial({
        map: createInternationalFlagTexture(fc.country),
        roughness: 0.65,
        side: THREE.DoubleSide,
      })
    );
    cloth.position.set(fc.tiltZ >= 0 ? 0.23 : -0.23, 0.96, 0);
    flagGroup.add(cloth);
    group.add(flagGroup);
    flagCloths.push({ mesh: cloth, phase: idx * 0.85 });
  });

  // 6 Vintage Dark-Green Campus Lamp Posts with Warm Glowing Globes lining upper stairs
  const lampPostMat = new THREE.MeshStandardMaterial({ color: '#1E5631', roughness: 0.45, metalness: 0.35 });
  const lampBulbMat = new THREE.MeshStandardMaterial({
    color: '#FEF9C3',
    emissive: '#FBBF24',
    emissiveIntensity: 1.35,
    roughness: 0.2,
  });
  [-1, 1].forEach((side) => {
    [0, 1, 2].forEach((idx) => {
      const lz = 1.18 - idx * 0.72;
      const ly = 1.56 + idx * 0.34;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.038, 1.25, 8), lampPostMat);
      post.position.set(side * 1.98, ly + 0.62, lz);
      group.add(post);

      const globe = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 10), lampBulbMat);
      globe.position.set(side * 1.98, ly + 1.28, lz);
      group.add(globe);
    });
  });

  // --------------------------------------------------------------------------
  // 10. GRAND 5-STORY BLUE-AND-WHITE MAIN TEACHING BUILDING + SIDE WINGS + ROOFTOP SLOGAN
  // --------------------------------------------------------------------------
  const yzflsFacadeTex = createYzflsFacadeTexture();
  const hallSideMat = new THREE.MeshStandardMaterial({ color: '#ECF1F7', roughness: 0.7 });
  const hallFrontMat = new THREE.MeshStandardMaterial({ map: yzflsFacadeTex, roughness: 0.48 });

  const mainHall = new THREE.Mesh(new THREE.BoxGeometry(7.2, 3.65, 1.85), [
    hallSideMat,
    hallSideMat,
    hallSideMat,
    hallSideMat,
    hallFrontMat,
    hallFrontMat,
  ]);
  mainHall.position.set(0, 4.34, -2.55);
  mainHall.castShadow = true;
  mainHall.receiveShadow = true;
  group.add(mainHall);

  // Crisp 3D projecting blue structural pilasters along the front facade for real depth & shadow
  for (let b = 0; b <= 6; b++) {
    const px = -3.54 + b * 1.18;
    const pilaster = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.66, 0.1), cobaltMat);
    pilaster.position.set(px, 4.34, -1.6);
    pilaster.castShadow = true;
    group.add(pilaster);
  }

  // White rooftop parapet coping rim
  const parapet = new THREE.Mesh(new THREE.BoxGeometry(7.36, 0.16, 1.98), whiteMat);
  parapet.position.set(0, 6.22, -2.55);
  group.add(parapet);

  // Raised cream-white right rooftop stair penthouse (visible right behind the slogan in p2-yzfls.jpg)
  const rightPenthouse = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.85, 1.45), hallSideMat);
  rightPenthouse.position.set(3.25, 6.62, -2.72);
  rightPenthouse.castShadow = true;
  group.add(rightPenthouse);

  // Left 6-Story Academic Wing Building rising behind the giant camphor tree
  const leftWing = new THREE.Mesh(new THREE.BoxGeometry(2.1, 4.85, 1.85), hallSideMat);
  leftWing.position.set(-4.05, 4.92, -1.85);
  leftWing.castShadow = true;
  group.add(leftWing);
  // Thin blue architectural stripes on the left wing
  [3.6, 4.6, 5.6, 6.6].forEach((sy) => {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.14, 0.12, 1.88), cobaltMat);
    stripe.position.set(-4.05, sy, -1.85);
    group.add(stripe);
  });

  // Right Angled Wing Building with bright blue upper cultural frieze (right edge of p2-yzfls.jpg)
  const rightWingGroup = new THREE.Group();
  rightWingGroup.position.set(4.55, 4.08, -0.45);
  rightWingGroup.rotation.y = -0.22;

  const rightWingBody = new THREE.Mesh(new THREE.BoxGeometry(1.15, 3.25, 3.35), hallSideMat);
  rightWingBody.castShadow = true;
  rightWingGroup.add(rightWingBody);

  const rightFriezeTex = createTextSignTexture('立足湖湘 · 面向世界 · 育有骨气的新人', {
    width: 512,
    height: 72,
    bg: '#1D63B8',
    color: '#FFFFFF',
    font: 'bold 24px "Noto Serif SC", serif',
  });
  const rightFrieze = new THREE.Mesh(
    new THREE.PlaneGeometry(3.25, 0.44),
    new THREE.MeshBasicMaterial({ map: rightFriezeTex })
  );
  rightFrieze.rotation.y = -Math.PI / 2;
  rightFrieze.position.set(-0.59, 1.22, 0);
  rightWingGroup.add(rightFrieze);
  group.add(rightWingGroup);

  // Rooftop Red Brush-Calligraphy Slogan: "办 有 灵 魂 的 学 校" mounted on slim steel brackets
  const sloganTex = createTextSignTexture('办 有 灵 魂 的 学 校', {
    width: 768,
    height: 128,
    bg: 'transparent',
    color: '#C81E1E',
    font: 'bold 64px "Noto Serif SC", "Songti SC", serif',
  });
  const sloganBoard = new THREE.Mesh(
    new THREE.PlaneGeometry(5.65, 0.94),
    new THREE.MeshBasicMaterial({
      map: sloganTex,
      transparent: true,
      alphaTest: 0.08,
      side: THREE.DoubleSide,
    })
  );
  sloganBoard.position.set(0, 6.76, -1.66);
  group.add(sloganBoard);

  // Slim steel support struts holding the rooftop characters
  [-2.3, -0.8, 0.8, 2.3].forEach((bx) => {
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.62, 6), railMat);
    strut.position.set(bx, 6.52, -1.72);
    group.add(strut);
  });

  // 4 Slender White/Silver Rooftop Flagpoles & Lightning Masts
  [-1.9, 1.05, 1.85, 2.75].forEach((mx, idx) => {
    const mastH = 1.65 + (idx % 2) * 0.45;
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, mastH, 6), railMat);
    mast.position.set(mx, 6.3 + mastH / 2, -2.05);
    group.add(mast);
  });

  // --------------------------------------------------------------------------
  // 11. MAJESTIC MULTI-LAYERED CAMPHOR TREE (左侧参天大香樟树)
  // --------------------------------------------------------------------------
  const treeGroup = new THREE.Group();
  treeGroup.position.set(-3.25, 1.55, 0.62);

  const barkMat = new THREE.MeshStandardMaterial({ color: '#61412A', roughness: 0.92 });
  const mainTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.27, 2.35, 10), barkMat);
  mainTrunk.position.y = 1.15;
  mainTrunk.castShadow = true;
  treeGroup.add(mainTrunk);

  // Sculpted boughs branching into the canopy
  [
    [-0.36, 2.05, 0.14, 0.48],
    [0.34, 2.1, -0.1, -0.44],
  ].forEach(([bx, by, bz, rz]) => {
    const bough = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 1.05, 8), barkMat);
    bough.position.set(bx, by, bz);
    bough.rotation.z = rz;
    treeGroup.add(bough);
  });

  const canopyCrown = new THREE.Group();
  const crownMats = [
    new THREE.MeshStandardMaterial({ color: '#245B2C', roughness: 0.86, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: '#2F7238', roughness: 0.84, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: '#3E8B45', roughness: 0.82, flatShading: true }),
  ];
  [
    [0.0, 2.95, 0.0, 1.22, 1],
    [-0.85, 2.65, 0.35, 0.88, 0],
    [0.82, 2.75, -0.15, 0.92, 1],
    [-0.25, 3.72, -0.12, 0.96, 2],
    [0.52, 3.55, 0.22, 0.78, 2],
    [-0.78, 3.35, -0.35, 0.76, 0],
    [0.12, 2.45, 0.68, 0.74, 1],
  ].forEach(([cx, cy, cz, r, mIdx]) => {
    const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), crownMats[mIdx]);
    puff.position.set(cx, cy, cz);
    puff.castShadow = true;
    canopyCrown.add(puff);
  });
  treeGroup.add(canopyCrown);
  group.add(treeGroup);

  // --------------------------------------------------------------------------
  // 12. WARM CAMPUS EVENING LIGHTING & MEMORY BEACON
  // --------------------------------------------------------------------------
  const campusWarmLight = new THREE.PointLight('#FDE68A', 1.65, 11, 1.6);
  campusWarmLight.position.set(0.4, 3.4, 1.5);
  group.add(campusWarmLight);

  const beacon = createMemoryBeacon(7.85, '#C8A97E');
  group.add(beacon);

  return {
    group,
    beacon,
    update: (elapsed) => {
      // Gentle breeze rippling across the 8 international flags
      flagCloths.forEach((fc) => {
        fc.mesh.rotation.y = Math.sin(elapsed * 2.6 + fc.phase) * 0.22;
      });
      // Subtle organic breeze sway on the giant camphor tree crown
      canopyCrown.rotation.z = Math.sin(elapsed * 0.95) * 0.018;
      canopyCrown.rotation.x = Math.cos(elapsed * 0.75) * 0.012;

      beacon.position.y = 7.85 + Math.sin(elapsed * 2.0 + 1.0) * 0.14;
      beacon.rotation.y = elapsed * 1.1;
    },
  };
}

// ============================================================================
// M03: Zhuzhou Nanfang High School (P3 - 株洲南方中学红砖校门与钟楼)
// ============================================================================
function createNanfangBrickTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#CFC1B4';
    ctx.fillRect(0, 0, 512, 512);
    const rows = 20;
    const cols = 10;
    const rh = 512 / rows;
    const cw = 512 / cols;
    const palette = ['#8E3F34', '#974539', '#83392E', '#9C4B3F', '#8A3D32'];
    for (let r = 0; r < rows; r++) {
      const offset = (r % 2) * (cw * 0.5);
      for (let c = -1; c <= cols; c++) {
        const idx = Math.abs(r * 17 + c * 11) % palette.length;
        ctx.fillStyle = palette[idx];
        ctx.fillRect(c * cw + offset + 2, r * rh + 2, cw - 3.5, rh - 3.5);
        // Subtle top highlight for crisp masonry relief
        ctx.fillStyle = 'rgba(255, 240, 225, 0.08)';
        ctx.fillRect(c * cw + offset + 2, r * rh + 2, cw - 3.5, 2.5);
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

function createNanfangPlazaTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Warm architectural light granite base
    ctx.fillStyle = '#E6E2DA';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle stone paving grid across entire plaza
    ctx.strokeStyle = 'rgba(155, 148, 138, 0.34)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i <= 512; i += 24) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }

    // Crisp bright white-granite central ceremonial axis runner
    ctx.fillStyle = '#F5F3EE';
    ctx.fillRect(178, 36, 156, 365);
    ctx.strokeStyle = '#C7C1B7';
    ctx.lineWidth = 3;
    ctx.strokeRect(178, 36, 156, 365);

    // Horizontal ceremonial stone stripes along central walkway
    ctx.strokeStyle = 'rgba(180, 174, 164, 0.45)';
    ctx.lineWidth = 2;
    for (let y = 52; y < 395; y += 22) {
      ctx.beginPath();
      ctx.moveTo(182, y);
      ctx.lineTo(330, y);
      ctx.stroke();
    }

    // Signature front radial concentric circular stone pattern (bottom of P3!)
    const cx = 256;
    const cy = 468;
    [54, 96, 142, 188].forEach((r, idx) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI * 1.05, Math.PI * 1.95);
      ctx.strokeStyle = idx % 2 === 0 ? '#C9C3B9' : '#F8F7F4';
      ctx.lineWidth = idx % 2 === 0 ? 5 : 3;
      ctx.stroke();
    });
    // Radial spokes on front entrance plaza
    ctx.strokeStyle = 'rgba(182, 176, 166, 0.55)';
    ctx.lineWidth = 2;
    for (let a = 1; a <= 7; a++) {
      const ang = Math.PI + (a / 8) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * 42, cy + Math.sin(ang) * 42);
      ctx.lineTo(cx + Math.cos(ang) * 190, cy + Math.sin(ang) * 190);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createCoupletPlaqueTexture(chars: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Deep bronze-black engraved background
    ctx.fillStyle = '#1E1B18';
    ctx.fillRect(0, 0, 96, 384);
    ctx.strokeStyle = '#C6A364';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 80, 368);

    ctx.fillStyle = '#E8C882';
    ctx.font = 'bold 40px "Noto Serif SC", "Songti SC", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const list = Array.from(chars);
    const step = 316 / Math.max(1, list.length);
    list.forEach((ch, idx) => {
      ctx.fillText(ch, 48, 36 + step * (idx + 0.5));
    });
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createNanfangWingFacadeTexture(cols = 6): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Deep warm red-brick background for lower 3 floors
    ctx.fillStyle = '#8C3D32';
    ctx.fillRect(0, 0, 512, 256);

    const cw = 512 / cols;
    const floors = 3;
    const fh = 256 / floors;
    for (let c = 0; c < cols; c++) {
      const bx = c * cw + 10;
      const bw = cw - 20;
      // Recessed vertical dark-blue architectural glass bay
      ctx.fillStyle = '#243B4E';
      ctx.fillRect(bx, 8, bw, 240);
      // Subtle sky reflection sheen
      ctx.fillStyle = 'rgba(186, 220, 245, 0.14)';
      ctx.beginPath();
      ctx.moveTo(bx, 8);
      ctx.lineTo(bx + bw * 0.6, 8);
      ctx.lineTo(bx, 180);
      ctx.closePath();
      ctx.fill();

      // Floor spandrels & crisp window mullions
      for (let f = 0; f < floors; f++) {
        const fy = f * fh;
        ctx.fillStyle = '#6E3027';
        ctx.fillRect(bx, fy + fh - 16, bw, 16);
        ctx.strokeStyle = '#B8C4CE';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx + 2, fy + 8, bw - 4, fh - 26);
        ctx.beginPath();
        ctx.moveTo(bx + bw / 2, fy + 8);
        ctx.lineTo(bx + bw / 2, fy + fh - 18);
        ctx.stroke();
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createNanfangClockDialTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Signature slate-teal belfry frame background from P3
    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, '#36586C');
    grad.addColorStop(1, '#263F50');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Subtle metallic frame border
    ctx.strokeStyle = '#1B2D3A';
    ctx.lineWidth = 18;
    ctx.strokeRect(9, 9, size - 18, size - 18);

    const cx = size / 2;
    const cy = size / 2;
    const r = 178;

    // Crisp luminous white clock dial
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#FAF8F2';
    ctx.fill();
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#C8B89A';
    ctx.stroke();

    // Inner decorative chapter ring
    ctx.beginPath();
    ctx.arc(cx, cy, r - 38, 0, Math.PI * 2);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.25)';
    ctx.stroke();

    // 60 minute ticks + 12 bold hour markers
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
      const isQuarter = i % 15 === 0;
      const isHour = i % 5 === 0;
      const inner = isQuarter ? r - 36 : isHour ? r - 28 : r - 14;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
      ctx.lineTo(cx + Math.cos(a) * (r - 6), cy + Math.sin(a) * (r - 6));
      ctx.lineWidth = isQuarter ? 10 : isHour ? 6 : 2.5;
      ctx.strokeStyle = isHour ? '#1E293B' : '#64748B';
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createNanfangLedTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 512, 256);
    grad.addColorStop(0, '#1C1917');
    grad.addColorStop(0.5, '#29221E');
    grad.addColorStop(1, '#18181B');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 6;
    ctx.strokeRect(12, 12, 488, 232);

    ctx.fillStyle = '#FCD34D';
    ctx.font = 'bold 42px "Noto Serif SC", "Songti SC", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('株洲市南方中学', 256, 98);

    ctx.fillStyle = '#FCA5A5';
    ctx.font = '600 28px "Noto Serif SC", "Songti SC", serif';
    ctx.fillText('崇德 · 求真 · 务实 · 创新', 256, 166);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildHippedRoof(
  width: number,
  height: number,
  depth: number,
  material: THREE.Material
): THREE.Mesh {
  // 4-sided pyramid rotated 45 deg and scaled to crisp rectangular hipped-roof proportions
  const geo = new THREE.ConeGeometry(Math.SQRT1_2, height, 4);
  geo.rotateY(Math.PI / 4);
  const mesh = new THREE.Mesh(geo, material);
  mesh.scale.set(width, 1, depth);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function buildRedbrickGateMemory(): BuiltMemoryModel {
  const group = new THREE.Group();

  const brickTex = createNanfangBrickTexture();
  const brickMat = new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.78 });
  const darkBrickMat = new THREE.MeshStandardMaterial({ color: '#783228', roughness: 0.82 });
  const creamStoneMat = new THREE.MeshStandardMaterial({ color: '#F3EFE6', roughness: 0.68 });
  const warmStoneMat = new THREE.MeshStandardMaterial({ color: '#E2DDD2', roughness: 0.78 });
  const roofMat = new THREE.MeshStandardMaterial({ color: '#2F465E', roughness: 0.56, metalness: 0.14 });
  const darkMetalMat = new THREE.MeshStandardMaterial({ color: '#26292E', roughness: 0.42, metalness: 0.65 });
  const steelMat = new THREE.MeshStandardMaterial({ color: '#D8DFE8', roughness: 0.25, metalness: 0.82 });
  const goldMat = new THREE.MeshStandardMaterial({ color: '#DFC07A', roughness: 0.3, metalness: 0.78 });
  const glassCurMat = new THREE.MeshStandardMaterial({
    color: '#2B4C65',
    roughness: 0.18,
    metalness: 0.55,
  });
  const emeraldGlassMat = new THREE.MeshStandardMaterial({
    color: '#1F6A52',
    emissive: '#0F3D2E',
    emissiveIntensity: 0.18,
    roughness: 0.16,
    metalness: 0.35,
    transparent: true,
    opacity: 0.82,
  });

  // --------------------------------------------------------------------------
  // 1. GRAND CEREMONIAL STONE PLAZA & FRONT MANICURED LAWN STRIPS
  // --------------------------------------------------------------------------
  const plaza = new THREE.Mesh(
    new THREE.BoxGeometry(10.6, 0.28, 8.6),
    warmStoneMat
  );
  plaza.position.y = 0.14;
  plaza.receiveShadow = true;
  group.add(plaza);

  const plazaSurface = new THREE.Mesh(
    new THREE.PlaneGeometry(10.52, 8.52),
    new THREE.MeshStandardMaterial({ map: createNanfangPlazaTexture(), roughness: 0.84 })
  );
  plazaSurface.rotation.x = -Math.PI / 2;
  plazaSurface.position.y = 0.285;
  plazaSurface.receiveShadow = true;
  group.add(plazaSurface);

  // Left & Right Front Lawn Beds (matching P3 foreground corners)
  const lawnMat = new THREE.MeshStandardMaterial({ color: '#5F9A46', roughness: 0.9 });
  [-4.42, 4.42].forEach((lx) => {
    const curb = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.08, 1.82), creamStoneMat);
    curb.position.set(lx, 0.31, 3.35);
    curb.receiveShadow = true;
    const grass = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.09, 1.68), lawnMat);
    grass.position.set(lx, 0.32, 3.35);
    grass.receiveShadow = true;
    group.add(curb, grass);
  });

  // Left Lawn Landmark: Crimson Wave Flag Sculpture + Landscape Boulder (bottom-left of P3)
  const leftSculptGroup = new THREE.Group();
  leftSculptGroup.position.set(-4.38, 0.36, 3.42);
  const sculptPedestal = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, 0.2, 0.26),
    new THREE.MeshStandardMaterial({ color: '#3B2F2B', roughness: 0.65 })
  );
  sculptPedestal.position.y = 0.1;
  sculptPedestal.castShadow = true;
  leftSculptGroup.add(sculptPedestal);

  const crimsonSculptMat = new THREE.MeshStandardMaterial({
    color: '#C81E2B',
    roughness: 0.35,
    metalness: 0.25,
  });
  [
    { x: -0.14, y: 0.36, z: 0.02, w: 0.32, h: 0.28, rz: 0.22, ry: 0.18 },
    { x: 0.04, y: 0.44, z: -0.02, w: 0.36, h: 0.34, rz: -0.16, ry: -0.12 },
    { x: 0.18, y: 0.5, z: 0.01, w: 0.28, h: 0.26, rz: 0.28, ry: 0.25 },
  ].forEach((fin) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(fin.w, fin.h, 0.055), crimsonSculptMat);
    m.position.set(fin.x, fin.y, fin.z);
    m.rotation.set(0, fin.ry, fin.rz);
    m.castShadow = true;
    leftSculptGroup.add(m);
  });
  const crestDot = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), goldMat);
  crestDot.position.set(-0.02, 0.44, 0.06);
  leftSculptGroup.add(crestDot);

  const leftBoulder = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.22, 1),
    new THREE.MeshStandardMaterial({ color: '#C4B39A', roughness: 0.92, flatShading: true })
  );
  leftBoulder.scale.set(1.2, 0.85, 0.9);
  leftBoulder.position.set(0.45, 0.15, -0.18);
  leftBoulder.castShadow = true;
  leftSculptGroup.add(leftBoulder);
  group.add(leftSculptGroup);

  // Right Lawn Landmark: Outdoor Campus LED Information Screen (bottom-right of P3)
  const ledGroup = new THREE.Group();
  ledGroup.position.set(4.45, 0.36, 3.35);
  ledGroup.rotation.y = -0.34;
  [-0.36, 0.36].forEach((px) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.48, 8), darkMetalMat);
    post.position.set(px, 0.24, 0);
    ledGroup.add(post);
  });
  const ledCabinet = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.66, 0.12), darkMetalMat);
  ledCabinet.position.set(0, 0.66, 0);
  ledCabinet.castShadow = true;
  ledGroup.add(ledCabinet);

  const ledTex = createNanfangLedTexture();
  const ledScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.02, 0.56),
    new THREE.MeshStandardMaterial({
      map: ledTex,
      emissive: '#F59E0B',
      emissiveMap: ledTex,
      emissiveIntensity: 0.45,
      roughness: 0.25,
    })
  );
  ledScreen.position.set(0, 0.66, 0.064);
  ledGroup.add(ledScreen);

  const rightBoulder = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.2, 1),
    new THREE.MeshStandardMaterial({ color: '#D2A686', roughness: 0.9, flatShading: true })
  );
  rightBoulder.scale.set(1.15, 0.8, 0.9);
  rightBoulder.position.set(0.55, 0.14, 0.32);
  ledGroup.add(rightBoulder);
  group.add(ledGroup);

  // --------------------------------------------------------------------------
  // 2. MONUMENTAL 6-PIER / 5-BAY RED-BRICK COLONNADE GATE (标志性红砖大门)
  // --------------------------------------------------------------------------
  const gateZ = 2.15;
  const pierXs = [-4.45, -3.25, -1.75, 1.75, 3.25, 4.45];
  const coupletTexts: Record<number, [string, string]> = {
    1: ['修身立德', '博学笃行'],
    2: ['崇德求真', '务实创新'],
    3: ['于斯振翼', '一生荣光'],
    4: ['全面发展', '科技见长'],
  };

  pierXs.forEach((px, idx) => {
    const isOuter = idx === 0 || idx === pierXs.length - 1;
    const pw = isOuter ? 0.44 : 0.54;

    // Cream-stone plinth base (石材勒脚)
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(pw + 0.1, 0.34, 0.66), creamStoneMat);
    plinth.position.set(px, 0.45, gateZ);
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    group.add(plinth);

    // Main red-brick pier shaft
    const pier = new THREE.Mesh(new THREE.BoxGeometry(pw, 2.24, 0.56), brickMat);
    pier.position.set(px, 1.72, gateZ);
    pier.castShadow = true;
    pier.receiveShadow = true;
    group.add(pier);

    // Subtle recessed cream-stone capital trim at top of pier
    const cap = new THREE.Mesh(new THREE.BoxGeometry(pw + 0.05, 0.08, 0.62), creamStoneMat);
    cap.position.set(px, 2.82, gateZ);
    group.add(cap);

    // Paired dark-bronze vertical couplet plaques on the 4 inner piers (matching P3!)
    const pair = coupletTexts[idx];
    if (pair) {
      [-0.14, 0.14].forEach((dx, sideIdx) => {
        const plaqueTex = createCoupletPlaqueTexture(pair[sideIdx]);
        const plaqueBack = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.48, 0.035), darkMetalMat);
        plaqueBack.position.set(px + dx, 1.66, gateZ + 0.295);
        group.add(plaqueBack);

        const plaqueFace = new THREE.Mesh(
          new THREE.PlaneGeometry(0.135, 1.42),
          new THREE.MeshBasicMaterial({ map: plaqueTex })
        );
        plaqueFace.position.set(px + dx, 1.66, gateZ + 0.315);
        group.add(plaqueFace);
      });
    }
  });

  // Cream-stone lintel soffits lining the tops of the 5 gate openings (crisp highlight in P3)
  const baySpans: [number, number][] = [
    [-3.85, 0.72],
    [-2.5, 0.96],
    [0, 2.96],
    [2.5, 0.96],
    [3.85, 0.72],
  ];
  baySpans.forEach(([bx, bw]) => {
    const soffit = new THREE.Mesh(new THREE.BoxGeometry(bw, 0.07, 0.6), creamStoneMat);
    soffit.position.set(bx, 2.82, gateZ);
    group.add(soffit);
  });

  // Grand Red-Brick Lintel Entablature
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.72, 0.7), brickMat);
  lintel.position.set(0, 3.22, gateZ);
  lintel.castShadow = true;
  lintel.receiveShadow = true;
  group.add(lintel);

  // Subtle recessed dark-brick molding line along lintel
  const lintelTrim = new THREE.Mesh(new THREE.BoxGeometry(9.64, 0.06, 0.73), darkBrickMat);
  lintelTrim.position.set(0, 3.55, gateZ);
  group.add(lintelTrim);

  // Embossed Golden-Bronze Calligraphy Sign: 「南 方 中 学」
  const gateSignTex = createTextSignTexture('南  方  中  学', {
    width: 640,
    height: 128,
    bg: 'transparent',
    color: '#F2D694',
    font: 'bold 64px "Noto Serif SC", "Songti SC", serif',
  });
  const gateSignShadowTex = createTextSignTexture('南  方  中  学', {
    width: 640,
    height: 128,
    bg: 'transparent',
    color: 'rgba(28, 14, 10, 0.55)',
    font: 'bold 64px "Noto Serif SC", "Songti SC", serif',
  });
  const gateSignShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.05, 0.62),
    new THREE.MeshBasicMaterial({ map: gateSignShadowTex, transparent: true })
  );
  gateSignShadow.position.set(0.025, 3.195, gateZ + 0.358);
  group.add(gateSignShadow);

  const gateSign = new THREE.Mesh(
    new THREE.PlaneGeometry(3.05, 0.62),
    new THREE.MeshBasicMaterial({ map: gateSignTex, transparent: true })
  );
  gateSign.position.set(0, 3.22, gateZ + 0.366);
  group.add(gateSign);

  // Signature Translucent Emerald-Green Glass Parapet crowning the gate (iconic detail in P3!)
  const glassParapet = new THREE.Mesh(new THREE.BoxGeometry(9.72, 0.26, 0.76), emeraldGlassMat);
  glassParapet.position.set(0, 3.71, gateZ);
  glassParapet.castShadow = true;
  group.add(glassParapet);

  const parapetCap = new THREE.Mesh(new THREE.BoxGeometry(9.78, 0.045, 0.8), darkMetalMat);
  parapetCap.position.set(0, 3.855, gateZ);
  group.add(parapetCap);

  // Crisp vertical metallic mullions along the emerald glass parapet
  for (let m = -4.6; m <= 4.61; m += 0.65) {
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.27, 0.79), darkMetalMat);
    mullion.position.set(m, 3.71, gateZ);
    group.add(mullion);
  }

  // --------------------------------------------------------------------------
  // 3. INNER CEREMONIAL COURTYARD (跌水景观池 · 升旗台三旗杆 · 对称行道树阵)
  // --------------------------------------------------------------------------
  // Twin Dark-Granite Stepped Water-Feature Reflecting Pools (visible right inside central bay!)
  const graniteMat = new THREE.MeshStandardMaterial({ color: '#1F2429', roughness: 0.32, metalness: 0.25 });
  const poolWaterMat = new THREE.MeshStandardMaterial({
    color: '#2B6E8C',
    emissive: '#0E3A4F',
    emissiveIntensity: 0.22,
    roughness: 0.12,
    metalness: 0.55,
  });
  const rippleMeshes: THREE.Mesh[] = [];
  [-1.18, 1.18].forEach((wx) => {
    const basin = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.22, 1.62), graniteMat);
    basin.position.set(wx, 0.39, 0.72);
    basin.castShadow = true;
    basin.receiveShadow = true;
    group.add(basin);

    const water = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 1.48), poolWaterMat);
    water.position.set(wx, 0.495, 0.72);
    group.add(water);

    // Subtle cascading white water ripple strips
    [-0.42, 0, 0.42].forEach((rz) => {
      const ripple = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.015, 0.045),
        new THREE.MeshBasicMaterial({ color: '#E0F2FE', transparent: true, opacity: 0.72 })
      );
      ripple.position.set(wx, 0.52, 0.72 + rz);
      group.add(ripple);
      rippleMeshes.push(ripple);
    });
  });

  // Central Flagpole Platform & 3 Brushed-Steel Flagpoles with Animated National Flag
  const flagDais = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.14, 0.85), creamStoneMat);
  flagDais.position.set(0, 0.35, -0.58);
  flagDais.receiveShadow = true;
  group.add(flagDais);

  const flagSegments: THREE.Mesh[] = [];
  [
    { x: -0.44, h: 2.15 },
    { x: 0, h: 2.55 },
    { x: 0.44, h: 2.15 },
  ].forEach((fp, idx) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.026, fp.h, 8), steelMat);
    pole.position.set(fp.x, 0.42 + fp.h / 2, -0.58);
    pole.castShadow = true;
    group.add(pole);

    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), goldMat);
    finial.position.set(fp.x, 0.42 + fp.h + 0.03, -0.58);
    group.add(finial);

    // Center tall pole carries a softly waving crimson flag
    if (idx === 1) {
      const flagMat = new THREE.MeshStandardMaterial({
        color: '#D91E2A',
        roughness: 0.55,
        side: THREE.DoubleSide,
      });
      for (let s = 0; s < 4; s++) {
        const seg = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.34), flagMat);
        seg.position.set(fp.x + 0.08 + s * 0.135, 0.42 + fp.h - 0.22, -0.58);
        group.add(seg);
        flagSegments.push(seg);
      }
    }
  });

  // Symmetrical Ceremonial Campus Tree Avenues (visible through the side gate bays in P3!)
  const treeLeafMat = new THREE.MeshStandardMaterial({ color: '#589C4E', roughness: 0.84, flatShading: true });
  const treeLeafLightMat = new THREE.MeshStandardMaterial({ color: '#74B45E', roughness: 0.84, flatShading: true });
  const treeTrunkMat = new THREE.MeshStandardMaterial({ color: '#6E4F37', roughness: 0.9 });
  const swayCanopies: { mesh: THREE.Group; phase: number }[] = [];

  const addCampusTree = (tx: number, tz: number, scale = 1.0, phase = 0) => {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032 * scale, 0.048 * scale, 0.88 * scale, 7),
      treeTrunkMat
    );
    trunk.position.set(tx, 0.28 + 0.44 * scale, tz);
    trunk.castShadow = true;
    group.add(trunk);

    const canopy = new THREE.Group();
    canopy.position.set(tx, 0.28 + 0.96 * scale, tz);
    const c1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32 * scale, 1), treeLeafMat);
    c1.castShadow = true;
    const c2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.23 * scale, 1), treeLeafLightMat);
    c2.position.set(0.12 * scale, 0.16 * scale, 0.06 * scale);
    canopy.add(c1, c2);
    group.add(canopy);
    swayCanopies.push({ mesh: canopy, phase });
  };

  [-2.38, 2.38].forEach((tx, sideIdx) => {
    [-1.25, -0.55, 0.15, 0.85, 1.52].forEach((tz, idx) => {
      addCampusTree(tx, tz, 0.94 + (idx % 2) * 0.08, sideIdx * 1.7 + idx * 0.6);
    });
  });
  // Two young decorative trees framing the front outer corners
  addCampusTree(-4.85, 2.75, 1.08, 0.4);
  addCampusTree(4.85, 2.85, 1.04, 2.1);

  // --------------------------------------------------------------------------
  // 4. ICONIC TALL RED-BRICK CLOCK TOWER (右侧标志性高耸红砖钟楼)
  // --------------------------------------------------------------------------
  const towerX = 3.12;
  const towerZ = -0.35;

  const towerPlinth = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.36, 1.38), creamStoneMat);
  towerPlinth.position.set(towerX, 0.46, towerZ);
  towerPlinth.castShadow = true;
  group.add(towerPlinth);

  const towerShaft = new THREE.Mesh(new THREE.BoxGeometry(1.22, 4.65, 1.22), brickMat);
  towerShaft.position.set(towerX, 2.96, towerZ);
  towerShaft.castShadow = true;
  towerShaft.receiveShadow = true;
  group.add(towerShaft);

  // 4 Architectural Corner Pilasters on the Clock Tower Shaft
  [-0.56, 0.56].forEach((ox) => {
    [-0.56, 0.56].forEach((oz) => {
      const pil = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4.68, 0.2), darkBrickMat);
      pil.position.set(towerX + ox, 2.96, towerZ + oz);
      group.add(pil);
    });
  });

  // Recessed Multi-Story Vertical Stairwell Glass Curtain Bay + Floor Transoms
  const towerGlassBay = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 3.85, 1.25),
    new THREE.MeshStandardMaterial({
      color: '#2A4A64',
      emissive: '#D97706',
      emissiveIntensity: 0.16,
      roughness: 0.16,
      metalness: 0.55,
    })
  );
  towerGlassBay.position.set(towerX, 3.02, towerZ);
  group.add(towerGlassBay);

  for (let fl = 0; fl < 6; fl++) {
    const transom = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.055, 1.28), darkMetalMat);
    transom.position.set(towerX, 1.35 + fl * 0.66, towerZ);
    group.add(transom);
  }

  // Stepped Cream-Stone Collar Cornice beneath the Belfry
  const collar = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.16, 1.42), creamStoneMat);
  collar.position.set(towerX, 5.36, towerZ);
  collar.castShadow = true;
  group.add(collar);

  // Slate-Teal Belfry Cube + Dark Metallic Corner Frame + Low Hipped Cap
  const belfry = new THREE.Mesh(
    new THREE.BoxGeometry(1.34, 1.34, 1.34),
    new THREE.MeshStandardMaterial({ color: '#2F4D60', roughness: 0.42, metalness: 0.28 })
  );
  belfry.position.set(towerX, 6.11, towerZ);
  belfry.castShadow = true;
  group.add(belfry);

  const belfryCap = buildHippedRoof(1.48, 0.26, 1.48, roofMat);
  belfryCap.position.set(towerX, 6.91, towerZ);
  group.add(belfryCap);

  // 4 Illuminated Clock Faces + Animated 3D Clock Hands!
  const clockDialTex = createNanfangClockDialTexture();
  const clockDialMat = new THREE.MeshStandardMaterial({
    map: clockDialTex,
    emissive: '#FFF7E0',
    emissiveMap: clockDialTex,
    emissiveIntensity: 0.28,
    roughness: 0.35,
  });
  const handMat = new THREE.MeshBasicMaterial({ color: '#141413' });
  const secondHandMat = new THREE.MeshBasicMaterial({ color: '#B91C1C' });
  const clockHandSets: { hour: THREE.Group; minute: THREE.Group; second: THREE.Group }[] = [];

  [
    { pos: [towerX, 6.11, towerZ + 0.678], rotY: 0 },
    { pos: [towerX, 6.11, towerZ - 0.678], rotY: Math.PI },
    { pos: [towerX + 0.678, 6.11, towerZ], rotY: Math.PI / 2 },
    { pos: [towerX - 0.678, 6.11, towerZ], rotY: -Math.PI / 2 },
  ].forEach((f) => {
    const faceGroup = new THREE.Group();
    faceGroup.position.set(f.pos[0], f.pos[1], f.pos[2]);
    faceGroup.rotation.y = f.rotY;

    const dial = new THREE.Mesh(new THREE.PlaneGeometry(1.16, 1.16), clockDialMat);
    faceGroup.add(dial);

    // 3D Clock Hands pivoting from center
    const hourPivot = new THREE.Group();
    const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.26, 0.015), handMat);
    hourHand.position.set(0, 0.11, 0.012);
    hourPivot.add(hourHand);

    const minPivot = new THREE.Group();
    const minHand = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.36, 0.015), handMat);
    minHand.position.set(0, 0.16, 0.02);
    minPivot.add(minHand);

    const secPivot = new THREE.Group();
    const secHand = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.39, 0.012), secondHandMat);
    secHand.position.set(0, 0.16, 0.028);
    secPivot.add(secHand);

    const centerCap = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.035, 10), goldMat);
    centerCap.rotation.x = Math.PI / 2;
    centerCap.position.z = 0.025;

    faceGroup.add(hourPivot, minPivot, secPivot, centerCap);
    group.add(faceGroup);
    clockHandSets.push({ hour: hourPivot, minute: minPivot, second: secPivot });
  });

  // --------------------------------------------------------------------------
  // 5. SYMMETRICAL COLLEGIATE FLANKING WINGS (红砖底层 + 米白顶层柱廊 + 四坡蓝顶)
  // --------------------------------------------------------------------------
  const wingFacadeTex = createNanfangWingFacadeTexture(5);
  const wingFacadeMat = new THREE.MeshStandardMaterial({ map: wingFacadeTex, roughness: 0.65 });

  const buildCollegiateBuilding = (
    w: number,
    d: number,
    lowerH: number,
    upperH: number,
    roofH: number,
    pillarCountX: number,
    pillarCountZ: number
  ) => {
    const b = new THREE.Group();

    // Lower 3 red-brick floors with recessed glass bays
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(w, lowerH, d), [
      wingFacadeMat,
      wingFacadeMat,
      creamStoneMat,
      creamStoneMat,
      wingFacadeMat,
      wingFacadeMat,
    ]);
    lowerBody.position.y = lowerH / 2;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    b.add(lowerBody);

    // Cream-white horizontal cornice belt course (defining architectural feature in P3!)
    const belt = new THREE.Mesh(new THREE.BoxGeometry(w + 0.14, 0.14, d + 0.14), creamStoneMat);
    belt.position.y = lowerH + 0.07;
    belt.castShadow = true;
    b.add(belt);

    // Top 4th floor: Dark recessed glass core + Cream-white square colonnade gallery!
    const topCore = new THREE.Mesh(new THREE.BoxGeometry(w - 0.16, upperH, d - 0.16), glassCurMat);
    topCore.position.y = lowerH + 0.14 + upperH / 2;
    b.add(topCore);

    // Cream top gallery pillars along front & back
    for (let i = 0; i < pillarCountX; i++) {
      const px = -w / 2 + 0.08 + (i / Math.max(1, pillarCountX - 1)) * (w - 0.16);
      [-d / 2 + 0.06, d / 2 - 0.06].forEach((pz) => {
        const col = new THREE.Mesh(new THREE.BoxGeometry(0.11, upperH, 0.11), creamStoneMat);
        col.position.set(px, lowerH + 0.14 + upperH / 2, pz);
        b.add(col);
      });
    }
    // Cream top gallery pillars along left & right sides
    for (let j = 1; j < pillarCountZ - 1; j++) {
      const pz = -d / 2 + 0.08 + (j / Math.max(1, pillarCountZ - 1)) * (d - 0.16);
      [-w / 2 + 0.06, w / 2 - 0.06].forEach((px) => {
        const col = new THREE.Mesh(new THREE.BoxGeometry(0.11, upperH, 0.11), creamStoneMat);
        col.position.set(px, lowerH + 0.14 + upperH / 2, pz);
        b.add(col);
      });
    }

    // Overhanging cream roof eaves + crisp slate-blue hipped roof
    const eaves = new THREE.Mesh(new THREE.BoxGeometry(w + 0.24, 0.09, d + 0.24), creamStoneMat);
    eaves.position.y = lowerH + 0.14 + upperH + 0.045;
    b.add(eaves);

    const roof = buildHippedRoof(w + 0.22, roofH, d + 0.22, roofMat);
    roof.position.y = lowerH + 0.14 + upperH + 0.09 + roofH / 2;
    b.add(roof);

    return b;
  };

  // Left & Right Flanking Academic Wings
  [-4.22, 4.22].forEach((wx) => {
    const wing = buildCollegiateBuilding(1.85, 3.55, 1.98, 0.64, 0.62, 4, 7);
    wing.position.set(wx, 0.28, -0.35);
    group.add(wing);
  });

  // --------------------------------------------------------------------------
  // 6. REAR GRAND MAIN ACADEMIC HALL & COVERED SKY-CORRIDORS (主教学楼与风雨连廊)
  // --------------------------------------------------------------------------
  // Central Grand Pavilion
  const rearCenter = buildCollegiateBuilding(3.75, 1.78, 2.02, 0.68, 0.74, 8, 4);
  rearCenter.position.set(-0.1, 0.28, -2.92);
  group.add(rearCenter);

  // Flanking Symmetrical Pavilions of the Rear Main Hall
  [-2.62, 2.42].forEach((rx) => {
    const sidePav = buildCollegiateBuilding(1.55, 1.48, 1.88, 0.6, 0.56, 4, 3);
    sidePav.position.set(rx, 0.28, -3.02);
    group.add(sidePav);
  });

  // Covered All-Weather Sky-Corridors (风雨连廊) linking Rear Hall to Left & Right Wings
  [-3.68, 3.58].forEach((cx) => {
    const corrFloor = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.12, 1.15), creamStoneMat);
    corrFloor.position.set(cx, 1.48, -2.42);
    const corrRoof = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.1, 1.22), roofMat);
    corrRoof.position.set(cx, 2.28, -2.42);
    group.add(corrFloor, corrRoof);

    [-0.36, 0.36].forEach((px) => {
      [-0.42, 0.42].forEach((pz) => {
        const col = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.76, 0.07), creamStoneMat);
        col.position.set(cx + px, 1.88, -2.42 + pz);
        group.add(col);
      });
    });
  });

  // Subtle Distant Campus Evergreens & Hilltop Radio Mast Accent behind the Rear Hall (nod to P3!)
  [-3.6, -2.1, 1.85, 3.4].forEach((bx, idx) => {
    const bgTree = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.55 + (idx % 2) * 0.14, 1),
      idx % 2 === 0 ? treeLeafMat : treeLeafLightMat
    );
    bgTree.position.set(bx, 0.85, -4.05);
    bgTree.scale.set(1.2, 1.1, 0.85);
    group.add(bgTree);
  });
  const radioMast = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.032, 1.65, 6), steelMat);
  radioMast.position.set(1.25, 3.65, -3.95);
  group.add(radioMast);

  const beacon = createMemoryBeacon(7.75, '#C8A97E');
  group.add(beacon);

  return {
    group,
    beacon,
    update: (elapsed) => {
      // Live real-time / smooth animated 3D clock hands on all 4 clock tower faces
      const now = new Date();
      const secs = now.getSeconds() + (elapsed % 1);
      const mins = now.getMinutes() + secs / 60;
      const hrs = (now.getHours() % 12) + mins / 60;
      const secAngle = -(secs / 60) * Math.PI * 2;
      const minAngle = -(mins / 60) * Math.PI * 2;
      const hrAngle = -(hrs / 12) * Math.PI * 2;

      clockHandSets.forEach((set) => {
        set.hour.rotation.z = hrAngle;
        set.minute.rotation.z = minAngle;
        set.second.rotation.z = secAngle;
      });

      // Gentle breeze ripple on the center crimson national flag
      flagSegments.forEach((seg, i) => {
        seg.position.z = -0.58 + Math.sin(elapsed * 4.2 - i * 0.85) * (0.015 + i * 0.014);
        seg.rotation.y = Math.cos(elapsed * 4.2 - i * 0.85) * 0.14;
      });

      // Subtle shimmer on the twin courtyard water-feature ripples
      rippleMeshes.forEach((rp, idx) => {
        rp.scale.x = 0.85 + Math.sin(elapsed * 2.6 + idx * 1.1) * 0.18;
      });

      // Soft campus breeze sway on the ceremonial avenue trees
      swayCanopies.forEach((item) => {
        item.mesh.rotation.z = Math.sin(elapsed * 1.45 + item.phase) * 0.045;
      });

      beacon.position.y = 7.75 + Math.sin(elapsed * 2.0 + 2.0) * 0.12;
      beacon.rotation.y = elapsed * 1.1;
    },
  };
}

// ============================================================================
// M04: Vintage Brass Gramophone & Night City-View Friends Lounge (P4)
// ============================================================================
function createAbstractArtTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 256, 160);
    grad.addColorStop(0, '#5E5750');
    grad.addColorStop(0.5, '#7A7268');
    grad.addColorStop(1, '#4B453F');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 160);

    // Subtle wabi-sabi textured plaster brushstrokes matching P4 wall canvas
    for (let i = 0; i < 18; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(235, 228, 216, 0.12)' : 'rgba(38, 33, 28, 0.14)';
      ctx.fillRect((i * 29) % 210, (i * 19) % 130, 65 + (i % 4) * 20, 14 + (i % 3) * 8);
    }
    ctx.strokeStyle = 'rgba(245, 240, 232, 0.18)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(20, 95);
    ctx.bezierCurveTo(90, 65, 160, 125, 236, 78);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createOvalRugTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#C8B9A0';
    ctx.fillRect(0, 0, 256, 256);
    const rings: [number, string][] = [
      [124, '#C5B59B'],
      [104, '#E7DFCE'],
      [84, '#B9A78C'],
      [62, '#F0EAE0'],
      [38, '#D2C3AA'],
    ];
    rings.forEach(([r, col]) => {
      ctx.beginPath();
      ctx.arc(128, 128, r, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
    });
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createPolkaDotPantsTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#6B635B';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#E5E0D8';
    for (let y = 8; y < 128; y += 16) {
      for (let x = 8; x < 128; x += 16) {
        ctx.beginPath();
        ctx.arc(x + ((y / 16) % 2) * 8, y, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 3);
  return tex;
}

function buildGramophoneLoungeMemory(): BuiltMemoryModel {
  const group = new THREE.Group();

  // --------------------------------------------------------------------------
  // 1. WARM OAK FLOOR, RAISED BAY-WINDOW PLATFORM & ARCHITECTURAL CORNER WALL
  // --------------------------------------------------------------------------
  const floorTex = createWoodFloorTexture();
  const oakMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.68 });
  const darkWalnutMat = new THREE.MeshStandardMaterial({ color: '#4E3526', roughness: 0.58 });
  const wallCreamMat = new THREE.MeshStandardMaterial({ color: '#EFECE3', roughness: 0.84 });
  const curtainMat = new THREE.MeshStandardMaterial({ color: '#F5F2EA', roughness: 0.9 });
  const frameDarkMat = new THREE.MeshStandardMaterial({ color: '#222428', roughness: 0.42, metalness: 0.35 });

  // Main oak living room deck
  const deck = new THREE.Mesh(new THREE.BoxGeometry(6.9, 0.24, 5.5), oakMat);
  deck.position.set(0.15, 0.12, 0);
  deck.receiveShadow = true;
  group.add(deck);

  // Signature raised wooden bay-window step platform on the right (exact P4 layout!)
  const bayPlatform = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.22, 4.95), oakMat);
  bayPlatform.position.set(2.45, 0.35, -0.05);
  bayPlatform.castShadow = true;
  bayPlatform.receiveShadow = true;
  group.add(bayPlatform);

  // Oak trim nosing edge along the raised platform
  const bayTrim = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.23, 4.98), darkWalnutMat);
  bayTrim.position.set(1.42, 0.35, -0.05);
  group.add(bayTrim);

  // Back cream wall with oak baseboard & slim top architectural cornice beam (open front!)
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(4.85, 3.25, 0.18), wallCreamMat);
  backWall.position.set(-0.85, 1.86, -2.55);
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  group.add(backWall);

  const baseboard = new THREE.Mesh(new THREE.BoxGeometry(4.86, 0.14, 0.22), darkWalnutMat);
  baseboard.position.set(-0.85, 0.31, -2.54);
  group.add(baseboard);

  // Slim overhead L-beam housing two warm recessed ceiling downlights
  const ceilingBeam = new THREE.Mesh(new THREE.BoxGeometry(6.85, 0.14, 0.55), wallCreamMat);
  ceilingBeam.position.set(0.15, 3.45, -2.35);
  group.add(ceilingBeam);
  [-1.65, 0.35].forEach((lx) => {
    const downlight = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.04, 14),
      new THREE.MeshStandardMaterial({
        color: '#FEF3C7',
        emissive: '#FBBF24',
        emissiveIntensity: 1.4,
      })
    );
    downlight.position.set(lx, 3.37, -2.25);
    group.add(downlight);
  });

  // Wabi-sabi textured abstract framed painting above the sofa (matching P4!)
  const artBacking = new THREE.Mesh(new THREE.BoxGeometry(1.68, 1.02, 0.07), darkWalnutMat);
  artBacking.position.set(-1.55, 2.48, -2.43);
  artBacking.castShadow = true;
  group.add(artBacking);

  const artCanvas = new THREE.Mesh(
    new THREE.PlaneGeometry(1.58, 0.92),
    new THREE.MeshStandardMaterial({ map: createAbstractArtTexture(), roughness: 0.88 })
  );
  artCanvas.position.set(-1.55, 2.48, -2.39);
  group.add(artCanvas);

  // --------------------------------------------------------------------------
  // 2. FLOOR-TO-CEILING NIGHT CITY SKYLINE WINDOW, PLEATED CURTAINS & BAY LOUNGE
  // --------------------------------------------------------------------------
  const winFrameOuter = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3.15, 4.95), frameDarkMat);
  winFrameOuter.position.set(3.48, 1.92, -0.05);
  group.add(winFrameOuter);

  const cityViewPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(4.68, 2.92),
    new THREE.MeshBasicMaterial({ map: createNightWindowTexture() })
  );
  cityViewPlane.rotation.y = -Math.PI / 2;
  cityViewPlane.position.set(3.39, 1.92, -0.05);
  group.add(cityViewPlane);

  // Subtle horizontal & vertical dark aluminum window mullions over the night skyline
  const midMullion = new THREE.Mesh(new THREE.BoxGeometry(0.05, 3.05, 0.06), frameDarkMat);
  midMullion.position.set(3.36, 1.92, -0.05);
  const railBar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 4.78), frameDarkMat);
  railBar.position.set(3.36, 1.38, -0.05);
  group.add(midMullion, railBar);

  // Full cream pleated blackout curtains gathered neatly beside the window
  for (let i = 0; i < 8; i++) {
    const pleat = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.068, 3.02, 10), curtainMat);
    pleat.position.set(1.58 + i * 0.095, 1.92, -2.38 + (i % 2) * 0.03);
    pleat.castShadow = true;
    group.add(pleat);
  }
  const curtainRod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.1, 8), frameDarkMat);
  curtainRod.rotation.z = Math.PI / 2;
  curtainRod.position.set(2.45, 3.44, -2.38);
  group.add(curtainRod);

  // Layered concentric oval woven rug on the raised bay-window platform (exact P4!)
  const ovalRug = new THREE.Mesh(
    new THREE.CylinderGeometry(1.08, 1.08, 0.024, 32),
    new THREE.MeshStandardMaterial({ map: createOvalRugTexture(), roughness: 0.94 })
  );
  ovalRug.position.set(2.42, 0.472, 0.35);
  ovalRug.scale.set(0.84, 1, 1.38);
  ovalRug.receiveShadow = true;
  group.add(ovalRug);

  // Sculpted Hourglass Solid-Wood Side Stool via LatheGeometry (exact P4!)
  const stoolProfile = [
    new THREE.Vector2(0.01, 0.0),
    new THREE.Vector2(0.28, 0.0),
    new THREE.Vector2(0.25, 0.14),
    new THREE.Vector2(0.14, 0.34),
    new THREE.Vector2(0.24, 0.46),
    new THREE.Vector2(0.26, 0.52),
    new THREE.Vector2(0.01, 0.52),
  ];
  const woodStool = new THREE.Mesh(
    new THREE.LatheGeometry(stoolProfile, 24),
    new THREE.MeshStandardMaterial({ color: '#A86E3E', roughness: 0.52 })
  );
  woodStool.position.set(2.62, 0.48, 0.12);
  woodStool.castShadow = true;
  group.add(woodStool);

  // Frosted-white glowing moon globe floor lamp tucked in the window corner (exact P4!)
  const globeLamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 20, 16),
    new THREE.MeshStandardMaterial({
      color: '#FFFBEB',
      emissive: '#FBBF24',
      emissiveIntensity: 1.55,
      roughness: 0.18,
    })
  );
  globeLamp.position.set(2.85, 0.72, -1.88);
  group.add(globeLamp);

  // --------------------------------------------------------------------------
  // 3. MUSEUM-GRADE VINTAGE BRASS GRAMOPHONE (CARVED CABINET + TONEARM + HORN)
  // --------------------------------------------------------------------------
  const gramX = 0.88;
  const gramZ = -1.88;
  const brassMat = new THREE.MeshStandardMaterial({
    color: '#D6B67C',
    roughness: 0.26,
    metalness: 0.84,
    side: THREE.DoubleSide,
  });

  // Stepped carved dark-walnut gramophone cabinet
  const cabFoot = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.12, 0.84), darkWalnutMat);
  cabFoot.position.set(gramX, 0.3, gramZ);
  const cabBody = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.92, 0.74), darkWalnutMat);
  cabBody.position.set(gramX, 0.82, gramZ);
  cabBody.castShadow = true;
  const cabCrown = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.1, 0.84), darkWalnutMat);
  cabCrown.position.set(gramX, 1.32, gramZ);
  // Decorative front recessed relief trim on cabinet
  const cabTrim = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, 0.52, 0.04),
    new THREE.MeshStandardMaterial({ color: '#3B261A', roughness: 0.7 })
  );
  cabTrim.position.set(gramX, 0.84, gramZ + 0.37);
  // Side winding crank
  const crank = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.18, 8), brassMat);
  crank.rotation.z = Math.PI / 2;
  crank.position.set(gramX + 0.44, 1.02, gramZ);
  group.add(cabFoot, cabBody, cabCrown, cabTrim, crank);

  // Spinning vinyl platter & gold center label
  const platter = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.31, 0.04, 24), brassMat);
  platter.position.set(gramX, 1.39, gramZ);
  const vinyl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.025, 28),
    new THREE.MeshStandardMaterial({ color: '#141413', roughness: 0.22 })
  );
  vinyl.position.set(gramX, 1.425, gramZ);
  const vinylLabel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 0.03, 16),
    new THREE.MeshStandardMaterial({ color: '#C8A97E', roughness: 0.38 })
  );
  vinylLabel.position.set(gramX, 1.43, gramZ);
  group.add(platter, vinyl, vinylLabel);

  // Articulated brass tonearm resting on the record
  const toneArm = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.34, 8), brassMat);
  toneArm.rotation.z = Math.PI / 2 - 0.15;
  toneArm.rotation.y = 0.45;
  toneArm.position.set(gramX + 0.14, 1.49, gramZ - 0.1);
  group.add(toneArm);

  // Gooseneck curved brass horn bracket + flared morning-glory horn
  const neckCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(gramX + 0.16, 1.38, gramZ - 0.24),
    new THREE.Vector3(gramX + 0.18, 1.72, gramZ - 0.32),
    new THREE.Vector3(gramX + 0.06, 1.98, gramZ - 0.18),
  ]);
  const hornNeck = new THREE.Mesh(new THREE.TubeGeometry(neckCurve, 14, 0.036, 10, false), brassMat);
  group.add(hornNeck);

  const hornPoints = [
    new THREE.Vector2(0.038, 0.0),
    new THREE.Vector2(0.065, 0.16),
    new THREE.Vector2(0.13, 0.36),
    new THREE.Vector2(0.26, 0.56),
    new THREE.Vector2(0.46, 0.74),
  ];
  const hornMesh = new THREE.Mesh(new THREE.LatheGeometry(hornPoints, 28), brassMat);
  hornMesh.position.set(gramX + 0.05, 1.96, gramZ - 0.18);
  hornMesh.rotation.set(0.32, 0.25, -0.78);
  hornMesh.castShadow = true;
  group.add(hornMesh);

  // Subtle floating golden musical motes drifting from the brass horn
  const musicNotes: { mesh: THREE.Mesh; phase: number }[] = [];
  const noteMat = new THREE.MeshStandardMaterial({
    color: '#FDE68A',
    emissive: '#F59E0B',
    emissiveIntensity: 1.1,
    transparent: true,
    opacity: 0.75,
  });
  for (let n = 0; n < 4; n++) {
    const mote = new THREE.Mesh(new THREE.OctahedronGeometry(0.055, 0), noteMat);
    mote.position.set(gramX + 0.45, 2.35 + n * 0.28, gramZ + 0.15);
    group.add(mote);
    musicNotes.push({ mesh: mote, phase: n * 1.55 });
  }

  // --------------------------------------------------------------------------
  // 4. PLUSH CHARCOAL SOFA, FLOOR TOTE BAG & SNACK-FILLED OVAL COFFEE TABLE
  // --------------------------------------------------------------------------
  const sofaMat = new THREE.MeshStandardMaterial({ color: '#1F2024', roughness: 0.88 });
  const sofaCushionMat = new THREE.MeshStandardMaterial({ color: '#27292E', roughness: 0.9 });

  const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(3.35, 0.36, 1.2), sofaMat);
  sofaBase.position.set(-1.35, 0.42, -1.32);
  sofaBase.castShadow = true;
  group.add(sofaBase);

  // 3 plump separate seat cushions + 3 back cushions
  [-2.38, -1.35, -0.32].forEach((cx) => {
    const seatCush = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.16, 1.06), sofaCushionMat);
    seatCush.position.set(cx, 0.64, -1.28);
    seatCush.castShadow = true;
    const backCush = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.72, 0.26), sofaCushionMat);
    backCush.position.set(cx, 1.04, -1.78);
    backCush.rotation.x = -0.1;
    backCush.castShadow = true;
    group.add(seatCush, backCush);
  });

  [-2.96, 0.26].forEach((ax) => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.68, 1.22), sofaMat);
    arm.position.set(ax, 0.68, -1.32);
    arm.castShadow = true;
    group.add(arm);
  });

  // Dark-green shopping tote resting on the floor beside the right sofa arm (exact P4 detail!)
  const toteBag = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.34, 0.44),
    new THREE.MeshStandardMaterial({ color: '#1E4A35', roughness: 0.8 })
  );
  toteBag.position.set(0.75, 0.41, -0.82);
  toteBag.rotation.y = 0.22;
  toteBag.castShadow = true;
  group.add(toteBag);

  // Sleek Oval Dark-Walnut Coffee Table (matching P4!)
  const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.08, 32), darkWalnutMat);
  tableTop.scale.set(1.12, 1, 0.62);
  tableTop.position.set(-0.95, 0.66, 0.82);
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  group.add(tableTop);

  [-0.78, 0.78].forEach((lx) => {
    [-0.36, 0.36].forEach((lz) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.024, 0.42, 8), darkWalnutMat);
      leg.position.set(-0.95 + lx, 0.43, 0.82 + lz);
      group.add(leg);
    });
  });

  // Detailed Party Drinks & Snacks on Coffee Table (exact P4 items!)
  // 1. Pink strawberry milk bottle with white cap
  const pinkBottle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.078, 0.21, 14),
    new THREE.MeshStandardMaterial({ color: '#F9A8D4', roughness: 0.32 })
  );
  pinkBottle.position.set(-0.32, 0.81, 0.46);
  const pinkCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.048, 0.048, 0.04, 12),
    new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.3 })
  );
  pinkCap.position.set(-0.32, 0.93, 0.46);
  group.add(pinkBottle, pinkCap);

  // 2. Two red Wangzai-style milk cartons
  [
    [-0.68, 0.56, 0.2],
    [0.02, 0.66, -0.35],
  ].forEach(([rx, rz, rot]) => {
    const carton = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.16, 0.065),
      new THREE.MeshStandardMaterial({ color: '#DC2626', roughness: 0.38 })
    );
    carton.position.set(rx, 0.78, rz);
    carton.rotation.y = rot;
    group.add(carton);
  });

  // 3. Clear mineral water bottle with blue label
  const waterBottle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.06, 0.25, 14),
    new THREE.MeshStandardMaterial({
      color: '#E0F2FE',
      roughness: 0.12,
      transparent: true,
      opacity: 0.82,
    })
  );
  waterBottle.position.set(-0.12, 0.83, 1.02);
  const waterLabel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.061, 0.061, 0.08, 14),
    new THREE.MeshStandardMaterial({ color: '#1D4ED8', roughness: 0.4 })
  );
  waterLabel.position.set(-0.12, 0.82, 1.02);
  group.add(waterBottle, waterLabel);

  // 4. Iced drink cup with green straw + dark-green matcha tin lid + yellow snack tin + white cup
  const drinkCup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.062, 0.18, 14),
    new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.35 })
  );
  drinkCup.position.set(-1.12, 0.79, 1.05);
  const straw = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.26, 6),
    new THREE.MeshStandardMaterial({ color: '#15803D', roughness: 0.4 })
  );
  straw.position.set(-1.1, 0.88, 1.05);
  straw.rotation.z = -0.22;

  const greenTin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, 0.06, 18),
    new THREE.MeshStandardMaterial({ color: '#2F5233', roughness: 0.45 })
  );
  greenTin.position.set(-0.88, 0.73, 0.88);

  const yellowTin = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.07, 0.14),
    new THREE.MeshStandardMaterial({ color: '#EAB308', roughness: 0.4 })
  );
  yellowTin.position.set(-1.46, 0.735, 1.02);
  yellowTin.rotation.y = 0.25;

  const snackPouch = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.2, 0.045),
    new THREE.MeshStandardMaterial({ color: '#F1F5F9', roughness: 0.55 })
  );
  snackPouch.position.set(-0.62, 0.78, 0.86);
  snackPouch.rotation.set(-0.45, 0.35, 0);

  group.add(drinkCup, straw, greenTin, yellowTin, snackPouch);

  // --------------------------------------------------------------------------
  // 5. FOUR EXPRESSIVELY POSED & STYLED FRIENDS (MATCHING P4!)
  // --------------------------------------------------------------------------
  // Friend 1 (Front-left selfie girl: cozy fur-collar jacket, long hair, warm smile, V-sign)
  const friend1 = buildRefinedCharacter({
    torsoColor: '#4E3F38',
    pantsColor: '#292726',
    hairStyle: 'long-straight',
    sitting: true,
    peaceRight: true,
    scale: 1.02,
  });
  // Soft fluffy fur collar trim around Friend 1's neckline
  const furCollar = new THREE.Mesh(
    new THREE.TorusGeometry(0.2, 0.065, 8, 16),
    new THREE.MeshStandardMaterial({ color: '#8E7D70', roughness: 0.95 })
  );
  furCollar.rotation.x = Math.PI / 2;
  furCollar.position.set(0, 1.02, 0.02);
  friend1.add(furCollar);
  friend1.position.set(-2.35, 0.34, -0.82);
  friend1.rotation.y = 0.36;
  group.add(friend1);

  // Friend 2 (Left-center girl: black jacket over white-striped top, polka-dot pants, double V-signs!)
  const friend2 = buildRefinedCharacter({
    torsoColor: '#1B1D22',
    innerShirtColor: '#E5E7EB',
    pantsColor: '#6B635B',
    hairStyle: 'long-straight',
    sitting: true,
    peaceLeft: true,
    peaceRight: true,
    scale: 0.98,
  });
  // Apply polka-dot pattern texture to Friend 2's wide-leg pants!
  const polkaMat = new THREE.MeshStandardMaterial({ map: createPolkaDotPantsTexture(), roughness: 0.85 });
  friend2.children.slice(0, 6).forEach((child) => {
    if (child instanceof THREE.Mesh && child.geometry instanceof THREE.CapsuleGeometry) {
      child.material = polkaMat;
    }
  });
  friend2.position.set(-1.52, 0.34, -1.16);
  friend2.rotation.y = 0.08;
  group.add(friend2);

  // Friend 3 (Center-right guy: dark barn jacket with brown corduroy collar, parted hair, glasses, jeans)
  const friend3 = buildRefinedCharacter({
    torsoColor: '#1C222D',
    innerShirtColor: '#BFD7EA',
    pantsColor: '#3B659A',
    hairStyle: 'medium-parted',
    glasses: true,
    sitting: true,
    scale: 1.05,
  });
  // Signature brown corduroy collar on Friend 3's jacket
  const cordCollar = new THREE.Mesh(
    new THREE.TorusGeometry(0.19, 0.042, 8, 16),
    new THREE.MeshStandardMaterial({ color: '#5A3A28', roughness: 0.85 })
  );
  cordCollar.rotation.x = Math.PI / 2;
  cordCollar.position.set(0, 1.02, 0);
  friend3.add(cordCollar);
  // Phone held casually in left hand
  const f3Phone = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.14, 0.018),
    new THREE.MeshStandardMaterial({ color: '#18181B', roughness: 0.3 })
  );
  f3Phone.position.set(0.24, 0.52, 0.24);
  f3Phone.rotation.x = 0.85;
  friend3.add(f3Phone);
  friend3.position.set(-0.66, 0.34, -1.15);
  friend3.rotation.y = -0.05;
  group.add(friend3);

  // Friend 4 (Back-right leaning guy: curly hair, glasses, all-black coat, double V-signs!)
  const friend4 = buildRefinedCharacter({
    torsoColor: '#161619',
    pantsColor: '#161619',
    hairStyle: 'curly',
    glasses: true,
    sitting: false,
    peaceLeft: true,
    peaceRight: true,
    scale: 1.0,
  });
  friend4.position.set(-0.18, 0.24, -1.72);
  friend4.rotation.y = -0.14;
  group.add(friend4);

  // --------------------------------------------------------------------------
  // 6. COZY NIGHT AMBIENT LIGHTING & MEMORY BEACON
  // --------------------------------------------------------------------------
  const lampPointLight = new THREE.PointLight('#FBBF24', 2.4, 9.5, 1.6);
  lampPointLight.position.set(2.5, 1.35, -1.45);
  group.add(lampPointLight);

  const loungeWarmFill = new THREE.PointLight('#FDE68A', 1.45, 9.0, 1.7);
  loungeWarmFill.position.set(-1.05, 2.95, -0.4);
  group.add(loungeWarmFill);

  const beacon = createMemoryBeacon(4.35, '#F59E0B');
  group.add(beacon);

  return {
    group,
    beacon,
    update: (elapsed) => {
      vinyl.rotation.y = elapsed * 2.2;
      vinylLabel.rotation.y = elapsed * 2.2;

      // Gently rising golden musical motes from the gramophone horn
      musicNotes.forEach((mn) => {
        const cycle = (elapsed * 0.48 + mn.phase) % 1.0;
        mn.mesh.position.set(
          gramX + 0.42 + Math.sin(elapsed * 2.2 + mn.phase) * 0.14,
          2.22 + cycle * 1.15,
          gramZ + 0.12 + Math.cos(elapsed * 1.7 + mn.phase) * 0.08
        );
        mn.mesh.rotation.y = elapsed * 1.8;
        const s = Math.sin(cycle * Math.PI);
        mn.mesh.scale.setScalar(0.35 + s * 0.85);
      });

      lampPointLight.intensity = 2.25 + Math.sin(elapsed * 1.8) * 0.18;
      beacon.position.y = 4.35 + Math.sin(elapsed * 2.0 + 3.0) * 0.12;
      beacon.rotation.y = elapsed * 1.1;
    },
  };
}

// ============================================================================
// M05: Winter Puffers Side-by-Side Friends Studio Overlook (P5)
// Refined portrait-studio coastal terrace: double-step sandstone plinth with
// bronze inlay, minimalist two-panel studio backdrop with metallic vertical
// seam & top studio light bar, authentic water & red bottles on low ledge,
// sculpted puffer jackets with articulated selfie-arm (red phone case) and
// hands-holding-glasses pose, plus softly drifting winter snow motes!
// ============================================================================
function buildWinterBrosMemory(): BuiltMemoryModel {
  const group = new THREE.Group();

  const stoneMat = new THREE.MeshStandardMaterial({ color: '#DCD6C8', roughness: 0.86 });
  const upperStoneMat = new THREE.MeshStandardMaterial({ color: '#ECE7DC', roughness: 0.82 });
  const bronzeMat = new THREE.MeshStandardMaterial({ color: '#8A6F48', roughness: 0.36, metalness: 0.68 });
  const studioWallMat = new THREE.MeshStandardMaterial({ color: '#D3D0C7', roughness: 0.78 });
  const matteSilverMat = new THREE.MeshStandardMaterial({ color: '#A1A1AA', roughness: 0.28, metalness: 0.78 });

  // --------------------------------------------------------------------------
  // 1. TWO-TIER CIRCULAR GALLERY TERRACE WITH BRONZE INLAY RING
  // --------------------------------------------------------------------------
  const lowerStep = new THREE.Mesh(new THREE.CylinderGeometry(3.55, 3.75, 0.24, 36), stoneMat);
  lowerStep.position.y = 0.12;
  lowerStep.receiveShadow = true;
  group.add(lowerStep);

  const upperStep = new THREE.Mesh(new THREE.CylinderGeometry(2.75, 2.9, 0.22, 32), upperStoneMat);
  upperStep.position.y = 0.34;
  upperStep.receiveShadow = true;
  group.add(upperStep);

  // Recessed antique bronze circular inlay ring on the upper terrace
  const bronzeRing = new THREE.Mesh(new THREE.TorusGeometry(2.45, 0.035, 8, 48), bronzeMat);
  bronzeRing.rotation.x = Math.PI / 2;
  bronzeRing.position.y = 0.455;
  group.add(bronzeRing);

  // --------------------------------------------------------------------------
  // 2. MINIMALIST STUDIO PORTRAIT BACKDROP WALL + VERTICAL SEAM + TOP LIGHT BAR
  // --------------------------------------------------------------------------
  const backdrop = new THREE.Mesh(new THREE.BoxGeometry(4.35, 3.35, 0.18), studioWallMat);
  backdrop.position.set(0, 2.12, -1.28);
  backdrop.castShadow = true;
  backdrop.receiveShadow = true;
  group.add(backdrop);

  // Architectural dark-bronze side trims & base plinth on backdrop
  [-2.2, 2.2].forEach((bx) => {
    const sideTrim = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.42, 0.24), bronzeMat);
    sideTrim.position.set(bx, 2.14, -1.28);
    group.add(sideTrim);
  });
  const topHeader = new THREE.Mesh(new THREE.BoxGeometry(4.48, 0.12, 0.36), bronzeMat);
  topHeader.position.set(0, 3.84, -1.2);
  topHeader.castShadow = true;
  group.add(topHeader);

  // Recessed warm linear studio light bar tucked under top cornice (casts clean portrait light!)
  const lightBar = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.04, 0.08),
    new THREE.MeshStandardMaterial({
      color: '#FFFBEB',
      emissive: '#FEF3C7',
      emissiveIntensity: 1.5,
    })
  );
  lightBar.position.set(0, 3.77, -1.08);
  group.add(lightBar);

  // Signature brushed-metal vertical center seam dividing the backdrop wall (exact P5 detail!)
  const seam = new THREE.Mesh(new THREE.BoxGeometry(0.032, 3.32, 0.21), matteSilverMat);
  seam.position.set(-0.04, 2.12, -1.27);
  group.add(seam);

  // Low minimalist studio ledge at base of wall holding the authentic P5 water & red bottles!
  const ledge = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.32, 0.38), upperStoneMat);
  ledge.position.set(-0.02, 0.61, -0.98);
  ledge.receiveShadow = true;
  group.add(ledge);

  // Clear plastic water bottle with red label (visible between the two friends in P5!)
  const p5Water = new THREE.Mesh(
    new THREE.CylinderGeometry(0.068, 0.072, 0.32, 14),
    new THREE.MeshStandardMaterial({ color: '#F1F5F9', roughness: 0.15, transparent: true, opacity: 0.85 })
  );
  p5Water.position.set(-0.12, 0.93, -0.95);
  const p5WaterLabel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.074, 0.074, 0.11, 14),
    new THREE.MeshStandardMaterial({ color: '#DC2626', roughness: 0.4 })
  );
  p5WaterLabel.position.set(-0.12, 0.91, -0.95);
  const p5WaterCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.034, 0.034, 0.035, 10),
    new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.3 })
  );
  p5WaterCap.position.set(-0.12, 1.11, -0.95);

  // Red thermos/bottle tucked right behind the water bottle (exact P5 detail!)
  const p5RedBottle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.078, 0.082, 0.3, 14),
    new THREE.MeshStandardMaterial({ color: '#B91C1C', roughness: 0.35 })
  );
  p5RedBottle.position.set(-0.26, 0.92, -1.02);
  group.add(p5Water, p5WaterLabel, p5WaterCap, p5RedBottle);

  // --------------------------------------------------------------------------
  // 3. LEFT FRIEND: CREAM HOODED PUFFER + NAVY POLO + BLACK GLASSES + SELFIE ARM
  // --------------------------------------------------------------------------
  const creamMat = new THREE.MeshStandardMaterial({ color: '#F0EDE5', roughness: 0.62 });
  const skinMat = new THREE.MeshStandardMaterial({ color: '#F3D2B8', roughness: 0.72 });

  const leftGuy = buildRefinedCharacter({
    torsoColor: '#F0EDE5',
    innerShirtColor: '#161E2E',
    pantsColor: '#565550',
    hairStyle: 'medium-parted',
    glasses: true,
    puffer: true,
    scale: 1.38,
  });
  leftGuy.position.set(-0.74, 0.45, 0.06);
  leftGuy.rotation.y = 0.08;

  // Sculpted folded cream hood resting around the shoulders (exact P5 jacket detail!)
  const hoodCollar = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.085, 10, 18, Math.PI * 1.35), creamMat);
  hoodCollar.rotation.set(Math.PI / 2, 0, Math.PI * 0.82);
  hoodCollar.position.set(0, 1.24, -0.06);
  leftGuy.add(hoodCollar);

  // 3 tiny dark buttons down the navy inner polo placket
  [0.92, 1.04, 1.16].forEach((by) => {
    const btn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.016, 0.015, 8),
      new THREE.MeshStandardMaterial({ color: '#0F172A', roughness: 0.3, metalness: 0.4 })
    );
    btn.rotation.x = Math.PI / 2;
    btn.position.set(0, by, 0.255);
    leftGuy.add(btn);
  });

  // Articulated Raised Left Arm holding up the crimson-red smartphone in selfie pose!
  const selfieArm = new THREE.Group();
  selfieArm.position.set(0.32, 1.16, 0.04);
  const selfieUpper = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.22, 8, 12), creamMat);
  selfieUpper.position.set(0.06, -0.1, 0.08);
  selfieUpper.rotation.set(-0.65, 0, -0.35);
  const selfieForearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.082, 0.24, 8, 12), creamMat);
  selfieForearm.position.set(0.04, 0.02, 0.24);
  selfieForearm.rotation.set(-2.35, 0, 0.42);
  const selfieHand = new THREE.Mesh(new THREE.SphereGeometry(0.056, 10, 10), skinMat);
  selfieHand.position.set(-0.04, 0.14, 0.3);
  selfieArm.add(selfieUpper, selfieForearm, selfieHand);

  // Crimson-red smartphone case with dark square triple-lens camera island
  const phoneBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.115, 0.205, 0.024),
    new THREE.MeshStandardMaterial({ color: '#B52B2B', roughness: 0.38 })
  );
  phoneBody.position.set(-0.08, 0.17, 0.32);
  phoneBody.rotation.y = -0.12;
  const camIsland = new THREE.Mesh(
    new THREE.BoxGeometry(0.052, 0.052, 0.03),
    new THREE.MeshStandardMaterial({ color: '#18181B', roughness: 0.2, metalness: 0.65 })
  );
  camIsland.position.set(-0.095, 0.225, 0.326);
  camIsland.rotation.y = -0.12;
  selfieArm.add(phoneBody, camIsland);
  leftGuy.add(selfieArm);
  group.add(leftGuy);

  // --------------------------------------------------------------------------
  // 4. RIGHT FRIEND: OVERSIZED MATTE-BLACK HIGH-COLLAR PUFFER + HELD GLASSES
  // --------------------------------------------------------------------------
  const blackPufferMat = new THREE.MeshStandardMaterial({ color: '#202221', roughness: 0.62 });

  const rightGuy = buildRefinedCharacter({
    torsoColor: '#202221',
    pantsColor: '#151618',
    hairStyle: 'short',
    glasses: false,
    puffer: true,
    highCollar: true,
    scale: 1.42,
  });
  rightGuy.position.set(0.74, 0.45, 0.1);
  rightGuy.rotation.y = -0.06;

  // Both forearms gently folded inward in front of waist, holding his eyeglasses!
  [-1, 1].forEach((side) => {
    const bentForearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.082, 0.22, 8, 12), blackPufferMat);
    bentForearm.position.set(side * 0.2, 0.78, 0.22);
    bentForearm.rotation.set(0.32, 0, side * 1.12);
    const heldHand = new THREE.Mesh(new THREE.SphereGeometry(0.052, 10, 10), skinMat);
    heldHand.position.set(side * 0.11, 0.74, 0.3);
    rightGuy.add(bentForearm, heldHand);
  });

  // Detailed two-lens eyeglasses held between both hands at waist level
  const frameMat = new THREE.MeshStandardMaterial({ color: '#141413', roughness: 0.22, metalness: 0.65 });
  const heldGlassesGroup = new THREE.Group();
  heldGlassesGroup.position.set(0, 0.74, 0.32);
  [-0.055, 0.055].forEach((gx) => {
    const lensRing = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.007, 6, 16), frameMat);
    lensRing.position.x = gx;
    heldGlassesGroup.add(lensRing);
  });
  const glassBridge = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.008, 0.008), frameMat);
  heldGlassesGroup.add(glassBridge);
  rightGuy.add(heldGlassesGroup);
  group.add(rightGuy);

  // --------------------------------------------------------------------------
  // 5. GALLERY UPLIGHT BOLLARDS, FROSTED WINTER ACCENTS & DRIFTING SNOW MOTES
  // --------------------------------------------------------------------------
  [-2.05, 2.05].forEach((lx) => {
    const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.42, 14), bronzeMat);
    housing.position.set(lx, 0.66, 1.15);
    housing.castShadow = true;
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.095, 14, 12),
      new THREE.MeshStandardMaterial({
        color: '#FEF3C7',
        emissive: '#F59E0B',
        emissiveIntensity: 1.45,
      })
    );
    bulb.position.set(lx, 0.9, 1.15);
    group.add(housing, bulb);
  });

  // Two subtle frosted winter cypress planters flanking the studio backdrop
  const frostPineMat = new THREE.MeshStandardMaterial({ color: '#587A6A', roughness: 0.88, flatShading: true });
  const snowCapMat = new THREE.MeshStandardMaterial({ color: '#F1F5F9', roughness: 0.9, flatShading: true });
  [-2.68, 2.68].forEach((px) => {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.24, 0.46, 12), bronzeMat);
    pot.position.set(px, 0.48, -1.12);
    const treeLow = new THREE.Mesh(new THREE.ConeGeometry(0.46, 1.05, 8), frostPineMat);
    treeLow.position.set(px, 1.18, -1.12);
    const treeTop = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.85, 8), frostPineMat);
    treeTop.position.set(px, 1.72, -1.12);
    const snowTip = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.32, 8), snowCapMat);
    snowTip.position.set(px, 2.04, -1.12);
    group.add(pot, treeLow, treeTop, snowTip);
  });

  // 18 Softly Drifting Winter Snow Motes around the coastal overlook
  const snowMotes: { mesh: THREE.Mesh; bx: number; bz: number; speed: number; phase: number }[] = [];
  const snowMat = new THREE.MeshBasicMaterial({ color: '#F8FAFC', transparent: true, opacity: 0.75 });
  for (let s = 0; s < 18; s++) {
    const flake = new THREE.Mesh(new THREE.OctahedronGeometry(0.032 + (s % 3) * 0.012, 0), snowMat);
    const angle = s * 0.95;
    const rad = 1.2 + (s % 5) * 0.55;
    const bx = Math.cos(angle) * rad;
    const bz = Math.sin(angle) * rad;
    flake.position.set(bx, 0.8 + (s % 6) * 0.55, bz);
    group.add(flake);
    snowMotes.push({ mesh: flake, bx, bz, speed: 0.28 + (s % 4) * 0.08, phase: s * 0.7 });
  }

  // Warm studio portrait fill light
  const studioFill = new THREE.PointLight('#FEF3C7', 1.85, 9.5, 1.6);
  studioFill.position.set(0, 3.25, 1.15);
  group.add(studioFill);

  const beacon = createMemoryBeacon(4.55, '#C8A97E');
  group.add(beacon);

  return {
    group,
    beacon,
    update: (elapsed) => {
      leftGuy.position.y = 0.45 + Math.sin(elapsed * 1.4) * 0.015;
      rightGuy.position.y = 0.45 + Math.sin(elapsed * 1.4 + 0.8) * 0.015;

      // Gentle falling winter snow motes
      snowMotes.forEach((sm) => {
        const yCycle = 3.8 - ((elapsed * sm.speed + sm.phase) % 3.2);
        sm.mesh.position.set(
          sm.bx + Math.sin(elapsed * 1.1 + sm.phase) * 0.22,
          yCycle,
          sm.bz + Math.cos(elapsed * 0.9 + sm.phase) * 0.18
        );
        sm.mesh.rotation.y = elapsed * 1.2;
      });

      beacon.position.y = 4.55 + Math.sin(elapsed * 2.0 + 4.0) * 0.12;
      beacon.rotation.y = elapsed * 1.1;
    },
  };
}

// ============================================================================
// M06: Hunan Agricultural University (湖南农业大学 · 红枫大道 · 一教红瓦 · 逸苑荷风)
// ============================================================================
function createHunauPlazaTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Warm sandstone & campus granite base
    ctx.fillStyle = '#E6DFD3';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle stone grid
    ctx.strokeStyle = 'rgba(145, 132, 116, 0.28)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i <= 512; i += 24) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }

    // Central Red-Maple Boulevard warm terracotta-bordered stone walkway
    ctx.fillStyle = '#F2ECE1';
    ctx.fillRect(184, 30, 144, 452);
    ctx.fillStyle = '#9C4234';
    ctx.fillRect(178, 30, 8, 452);
    ctx.fillRect(326, 30, 8, 452);

    // Scattered fallen crimson & golden maple petals along the avenue!
    const leafColors = ['#C8232C', '#E85D2A', '#F59E0B', '#B91C1C'];
    for (let i = 0; i < 140; i++) {
      const lx = (i * 73) % 512;
      const ly = (i * 137) % 512;
      if (lx > 110 && lx < 402 && ly > 90 && ly < 450) {
        ctx.fillStyle = leafColors[i % leafColors.length];
        ctx.globalAlpha = 0.65;
        ctx.beginPath();
        ctx.ellipse(lx, ly, 4 + (i % 3), 2.5, (i * 0.7) % Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createHunauHeritageFacadeTexture(cols = 8): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Heritage 1956 Soviet-style warm red brick wall
    ctx.fillStyle = '#9A3F32';
    ctx.fillRect(0, 0, 512, 256);

    // Cream-stone horizontal floor stringcourses
    ctx.fillStyle = '#EFE9DD';
    ctx.fillRect(0, 0, 512, 16);
    ctx.fillRect(0, 84, 512, 10);
    ctx.fillRect(0, 168, 512, 10);
    ctx.fillRect(0, 238, 512, 18);

    const cw = 512 / cols;
    const floors = 3;
    const fh = 240 / floors;
    for (let f = 0; f < floors; f++) {
      for (let c = 0; c < cols; c++) {
        const wx = c * cw + 12;
        const wy = f * fh + 20;
        const ww = cw - 24;
        const wh = fh - 30;
        // Cream window architrave frame
        ctx.fillStyle = '#F2ECE0';
        ctx.fillRect(wx - 4, wy - 4, ww + 8, wh + 8);
        // Warm-lit heritage classroom glass
        ctx.fillStyle = (f + c) % 3 === 0 ? '#4B6478' : '#31495E';
        ctx.fillRect(wx, wy, ww, wh);
        // Classic white cross mullions
        ctx.strokeStyle = '#EFE9DD';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(wx + ww / 2, wy);
        ctx.lineTo(wx + ww / 2, wy + wh);
        ctx.moveTo(wx, wy + wh * 0.45);
        ctx.lineTo(wx + ww, wy + wh * 0.45);
        ctx.stroke();
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createHunauNameWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Crisp light-gray/cream polished granite background
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#F5F2EB');
    grad.addColorStop(1, '#E4DED2');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 256);

    // Subtle crimson bottom accent line
    ctx.fillStyle = '#B91C1C';
    ctx.fillRect(28, 224, 968, 8);

    // Left Circular HUNAU School Emblem (红底金边 + 第一教学楼剪影 + 绿坪 + 1903)
    const cx = 138;
    const cy = 120;
    const r = 74;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#B91C1C';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#EAB308';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, r - 14, 0, Math.PI * 2);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#FDE047';
    ctx.stroke();

    // Inner emblem green lawn arc
    ctx.beginPath();
    ctx.arc(cx, cy + 8, r - 22, 0.12 * Math.PI, 0.88 * Math.PI);
    ctx.fillStyle = '#15803D';
    ctx.fill();

    // Simplified golden First Teaching Building silhouette inside emblem
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(cx - 32, cy - 4, 64, 22);
    ctx.fillRect(cx - 14, cy - 22, 28, 40);
    ctx.beginPath();
    ctx.moveTo(cx - 22, cy - 22);
    ctx.lineTo(cx, cy - 38);
    ctx.lineTo(cx + 22, cy - 22);
    ctx.closePath();
    ctx.fill();

    // "1903" inside green arc
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('1903', cx, cy + 36);

    // Bold Crimson Mao-Style Calligraphy Title: 「湖南农业大学」
    ctx.fillStyle = '#B91C1C';
    ctx.font = 'bold 104px "Noto Serif SC", "Kaiti SC", "STKaiti", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('湖南农业大学', 246, 108);

    // English subtitle
    ctx.fillStyle = '#57534E';
    ctx.font = '600 28px "JetBrains Mono", sans-serif';
    ctx.fillText('HUNAN AGRICULTURAL UNIVERSITY', 252, 184);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildHunauCampusMemory(): BuiltMemoryModel {
  const group = new THREE.Group();

  const brickTex = createNanfangBrickTexture();
  const brickMat = new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.78 });
  const creamStoneMat = new THREE.MeshStandardMaterial({ color: '#F3EEE4', roughness: 0.68 });
  const graniteMat = new THREE.MeshStandardMaterial({ color: '#DBD5C9', roughness: 0.82 });
  const darkGraniteMat = new THREE.MeshStandardMaterial({ color: '#272421', roughness: 0.42, metalness: 0.25 });
  const redTileRoofMat = new THREE.MeshStandardMaterial({ color: '#B5382A', roughness: 0.58 });
  const goldMat = new THREE.MeshStandardMaterial({ color: '#E6C265', roughness: 0.26, metalness: 0.82 });
  const bronzeMat = new THREE.MeshStandardMaterial({ color: '#8A643B', roughness: 0.36, metalness: 0.76 });
  const crimsonAccentMat = new THREE.MeshStandardMaterial({ color: '#A81E24', roughness: 0.52 });
  const lawnMat = new THREE.MeshStandardMaterial({ color: '#3F8E47', roughness: 0.9 });

  // --------------------------------------------------------------------------
  // 1. OPEN CAMPUS PLAZA + SIGNATURE EMERALD LAWN (校徽同款中央绿茵大草坪)
  // --------------------------------------------------------------------------
  const plaza = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.28, 8.8), graniteMat);
  plaza.position.y = 0.14;
  plaza.receiveShadow = true;
  group.add(plaza);

  const plazaTop = new THREE.Mesh(
    new THREE.PlaneGeometry(10.72, 8.72),
    new THREE.MeshStandardMaterial({ map: createHunauPlazaTexture(), roughness: 0.86 })
  );
  plazaTop.rotation.x = -Math.PI / 2;
  plazaTop.position.y = 0.285;
  plazaTop.receiveShadow = true;
  group.add(plazaTop);

  // Open Emerald Central Lawn right in front of First Teaching Building (unobstructed!)
  [-1.72, 1.72].forEach((lx) => {
    const lawnCurb = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.06, 3.05), creamStoneMat);
    lawnCurb.position.set(lx, 0.305, 0.45);
    const lawnPatch = new THREE.Mesh(new THREE.BoxGeometry(2.02, 0.07, 2.92), lawnMat);
    lawnPatch.position.set(lx, 0.31, 0.45);
    lawnPatch.receiveShadow = true;
    group.add(lawnCurb, lawnPatch);
  });

  // --------------------------------------------------------------------------
  // 2. UNOBSTRUCTED MONUMENTAL HUNAU NAME WALL & MOTTO BOULDER (正门校名墙 + 校训石)
  // --------------------------------------------------------------------------
  // Low, wide horizontal granite school nameplate wall on front-left (never blocks the hall!)
  const wallX = -1.65;
  const wallZ = 3.25;
  const nameWallBase = new THREE.Mesh(new THREE.BoxGeometry(5.1, 0.24, 0.56), darkGraniteMat);
  nameWallBase.position.set(wallX, 0.4, wallZ);
  nameWallBase.castShadow = true;
  group.add(nameWallBase);

  const nameWallBody = new THREE.Mesh(new THREE.BoxGeometry(4.9, 1.24, 0.34), creamStoneMat);
  nameWallBody.position.set(wallX, 1.14, wallZ);
  nameWallBody.castShadow = true;
  nameWallBody.receiveShadow = true;
  group.add(nameWallBody);

  const nameWallCap = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.08, 0.42), crimsonAccentMat);
  nameWallCap.position.set(wallX, 1.79, wallZ);
  group.add(nameWallCap);

  const nameWallFace = new THREE.Mesh(
    new THREE.PlaneGeometry(4.76, 1.18),
    new THREE.MeshBasicMaterial({ map: createHunauNameWallTexture() })
  );
  nameWallFace.position.set(wallX, 1.14, wallZ + 0.175);
  group.add(nameWallFace);

  // Sleek modern low gate guard pillar on far left & far right
  [-4.65, 4.65].forEach((gx) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.65, 0.42), creamStoneMat);
    pillar.position.set(gx, 1.1, wallZ);
    pillar.castShadow = true;
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.5), crimsonAccentMat);
    cap.position.set(gx, 1.98, wallZ);
    group.add(pillar, cap);
  });

  // Front-Right Landmark: Giant Campus Motto Stone (「朴诚 奋勉 求实 创新」校训石)
  const stoneGroup = new THREE.Group();
  stoneGroup.position.set(2.75, 0.28, 3.25);
  stoneGroup.rotation.y = -0.18;
  const stonePedestal = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.2, 0.82), darkGraniteMat);
  stonePedestal.position.y = 0.1;
  stoneGroup.add(stonePedestal);

  const mottoBoulder = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 1.05, 0.56),
    new THREE.MeshStandardMaterial({ color: '#D4CBB8', roughness: 0.9, flatShading: true })
  );
  mottoBoulder.position.y = 0.7;
  mottoBoulder.castShadow = true;
  stoneGroup.add(mottoBoulder);

  const mottoTex = createTextSignTexture('朴诚 · 奋勉 · 求实 · 创新', {
    width: 640,
    height: 160,
    bg: 'transparent',
    color: '#B91C1C',
    font: 'bold 52px "Noto Serif SC", "Songti SC", serif',
    subtitle: 'HUNAU MOTTO · 1903',
  });
  const mottoFace = new THREE.Mesh(
    new THREE.PlaneGeometry(1.98, 0.56),
    new THREE.MeshBasicMaterial({ map: mottoTex, transparent: true })
  );
  mottoFace.position.set(0, 0.72, 0.29);
  stoneGroup.add(mottoFace);
  group.add(stoneGroup);

  // --------------------------------------------------------------------------
  // 3. YUAN LONGPING BRONZE STATUE (隆平文化园 · 袁隆平院士手持稻穗铜像)
  // --------------------------------------------------------------------------
  const yuanGroup = new THREE.Group();
  yuanGroup.position.set(-1.72, 0.34, 0.65);

  const yuanPlinth = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.72, 0.92), darkGraniteMat);
  yuanPlinth.position.y = 0.36;
  yuanPlinth.castShadow = true;
  yuanGroup.add(yuanPlinth);

  const yuanSignTex = createTextSignTexture('禾 下 乘 凉 梦', {
    width: 384,
    height: 96,
    bg: 'transparent',
    color: '#F5D585',
    font: 'bold 44px "Noto Serif SC", "Songti SC", serif',
    subtitle: 'YUAN LONGPING · HONORARY PRESIDENT',
  });
  const yuanSign = new THREE.Mesh(
    new THREE.PlaneGeometry(0.98, 0.28),
    new THREE.MeshBasicMaterial({ map: yuanSignTex, transparent: true })
  );
  yuanSign.position.set(0, 0.38, 0.47);
  yuanGroup.add(yuanSign);

  // Sculpted Bronze Figure of Academician Yuan Longping holding Golden Hybrid Rice!
  const statue = new THREE.Group();
  statue.position.y = 0.72;
  const sLegs = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 0.56, 12), bronzeMat);
  sLegs.position.y = 0.28;
  const sTorso = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.34, 8, 12), bronzeMat);
  sTorso.position.y = 0.76;
  const sHead = new THREE.Mesh(new THREE.SphereGeometry(0.145, 14, 12), bronzeMat);
  sHead.position.y = 1.15;
  const sRightArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.32, 6, 10), bronzeMat);
  sRightArm.position.set(0.22, 0.8, 0.12);
  sRightArm.rotation.set(-0.7, 0, -0.35);
  const sLeftArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.32, 6, 10), bronzeMat);
  sLeftArm.position.set(-0.22, 0.76, 0.08);
  sLeftArm.rotation.set(-0.45, 0, 0.28);
  statue.add(sLegs, sTorso, sHead, sRightArm, sLeftArm);

  // Gleaming Golden Hybrid Rice Bundle held in his hands
  const heldRice = new THREE.Group();
  heldRice.position.set(0.16, 0.88, 0.26);
  [-0.18, 0, 0.18].forEach((ang) => {
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.44, 6), goldMat);
    stalk.rotation.z = ang;
    stalk.position.y = 0.12;
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 8), goldMat);
    ear.scale.set(0.65, 1.8, 0.65);
    ear.position.set(-Math.sin(ang) * 0.24, 0.34, 0.02);
    ear.rotation.z = ang - 0.3;
    heldRice.add(stalk, ear);
  });
  statue.add(heldRice);
  statue.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) obj.castShadow = true;
  });
  yuanGroup.add(statue);
  group.add(yuanGroup);

  // --------------------------------------------------------------------------
  // 4. MINI GOLDEN HYBRID-RICE EXPERIMENTAL PADDY FIELD (农大独有校内水稻试验田!)
  // --------------------------------------------------------------------------
  const paddyGroup = new THREE.Group();
  paddyGroup.position.set(1.72, 0.34, 0.55);

  // Dark soil & shallow water paddy basin
  const paddyBorder = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.12, 2.3), creamStoneMat);
  paddyBorder.position.y = 0.06;
  const paddyWater = new THREE.Mesh(
    new THREE.BoxGeometry(1.74, 0.08, 2.14),
    new THREE.MeshStandardMaterial({ color: '#5A6D3A', roughness: 0.35, metalness: 0.2 })
  );
  paddyWater.position.y = 0.09;
  paddyGroup.add(paddyBorder, paddyWater);

  // Rows of swaying golden rice sheaves!
  const riceRows: { mesh: THREE.Mesh; phase: number }[] = [];
  const riceSheafMat = new THREE.MeshStandardMaterial({ color: '#EAB308', roughness: 0.72 });
  const riceLeafMat = new THREE.MeshStandardMaterial({ color: '#A3A832', roughness: 0.8 });
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 4; c++) {
      const rx = -0.58 + c * 0.38;
      const rz = -0.78 + r * 0.39;
      const sheaf = new THREE.Mesh(
        new THREE.ConeGeometry(0.13, 0.44, 6),
        (r + c) % 3 === 0 ? riceLeafMat : riceSheafMat
      );
      sheaf.position.set(rx, 0.3, rz);
      sheaf.rotation.x = Math.PI;
      sheaf.castShadow = true;
      paddyGroup.add(sheaf);
      riceRows.push({ mesh: sheaf, phase: r * 0.55 + c * 0.4 });
    }
  }

  // Crisp Field Signpost: 「杂交水稻试验田」
  const signPost = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.56, 6), darkGraniteMat);
  signPost.position.set(-0.62, 0.34, 0.96);
  const fieldSignTex = createTextSignTexture('杂交水稻试验田', {
    width: 320,
    height: 80,
    bg: '#FAF8F2',
    color: '#166534',
    font: 'bold 34px "Noto Serif SC", sans-serif',
    border: '#166534',
  });
  const fieldSign = new THREE.Mesh(
    new THREE.BoxGeometry(0.76, 0.22, 0.03),
    new THREE.MeshBasicMaterial({ map: fieldSignTex })
  );
  fieldSign.position.set(-0.62, 0.58, 0.96);
  paddyGroup.add(signPost, fieldSign);
  group.add(paddyGroup);

  // --------------------------------------------------------------------------
  // 5. ICONIC 1956 FIRST TEACHING BUILDING (第一教学楼 · 校徽原型 · 中间四层两侧三层红砖红瓦!)
  // --------------------------------------------------------------------------
  const hallZ = -2.35;
  // Wide Elevated Stone Terrace & Ceremonial Staircase
  const terrace = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.36, 2.65), graniteMat);
  terrace.position.set(0, 0.46, hallZ);
  terrace.receiveShadow = true;
  group.add(terrace);

  for (let s = 0; s < 4; s++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.09, 0.24), creamStoneMat);
    step.position.set(0, 0.32 + s * 0.085, hallZ + 1.56 - s * 0.14);
    step.receiveShadow = true;
    group.add(step);
  }

  const heritageCenterTex = createHunauHeritageFacadeTexture(6);
  const heritageCenterMat = new THREE.MeshStandardMaterial({ map: heritageCenterTex, roughness: 0.7 });
  const heritageWingTex = createHunauHeritageFacadeTexture(5);
  const heritageWingMat = new THREE.MeshStandardMaterial({ map: heritageWingTex, roughness: 0.72 });

  // A. TALL 4-STORY CENTRAL PAVILION (中间主楼高四层 — 校徽核心轮廓!)
  const centerBody = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.05, 2.05), [
    brickMat,
    brickMat,
    creamStoneMat,
    creamStoneMat,
    heritageCenterMat,
    heritageCenterMat,
  ]);
  centerBody.position.set(0, 2.16, hallZ + 0.08);
  centerBody.castShadow = true;
  centerBody.receiveShadow = true;
  group.add(centerBody);

  // Grand Protruding White-Columned Entrance Portico (一教正面古典门楼)
  const porticoDeck = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.16, 0.76), creamStoneMat);
  porticoDeck.position.set(0, 2.52, hallZ + 1.28);
  porticoDeck.castShadow = true;
  group.add(porticoDeck);

  [-0.86, -0.3, 0.3, 0.86].forEach((cx) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.078, 1.88, 12), creamStoneMat);
    col.position.set(cx, 1.54, hallZ + 1.48);
    col.castShadow = true;
    group.add(col);
  });

  // Crimson-Gold Plaque on First Teaching Building Portico: 「第一教学楼 · 1956」
  const hallPlaqueTex = createTextSignTexture('第 一 教 学 楼', {
    width: 448,
    height: 96,
    bg: '#9E2228',
    color: '#FDE68A',
    font: 'bold 46px "Noto Serif SC", "Songti SC", serif',
    border: '#EAB308',
  });
  const hallPlaque = new THREE.Mesh(
    new THREE.PlaneGeometry(1.42, 0.3),
    new THREE.MeshBasicMaterial({ map: hallPlaqueTex })
  );
  hallPlaque.position.set(0, 2.52, hallZ + 1.67);
  group.add(hallPlaque);

  // Signature Stepped Double-Eave Terracotta Red-Tile Hipped Roof on Central 4-Story Tower!
  const centerEaves = new THREE.Mesh(new THREE.BoxGeometry(3.52, 0.12, 2.38), creamStoneMat);
  centerEaves.position.set(0, 3.74, hallZ + 0.08);
  group.add(centerEaves);

  const centerRoof = buildHippedRoof(3.65, 1.15, 2.48, redTileRoofMat);
  centerRoof.position.set(0, 4.37, hallZ + 0.08);
  group.add(centerRoof);

  const centerRidge = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.12, 0.16), creamStoneMat);
  centerRidge.position.set(0, 4.94, hallZ + 0.08);
  group.add(centerRidge);

  // B. SYMMETRICAL 3-STORY RED-BRICK & RED-TILE WINGS (两侧三层红砖红瓦翼楼!)
  [-2.85, 2.85].forEach((wx) => {
    const wingBody = new THREE.Mesh(new THREE.BoxGeometry(2.65, 2.25, 1.75), [
      brickMat,
      brickMat,
      creamStoneMat,
      creamStoneMat,
      heritageWingMat,
      heritageWingMat,
    ]);
    wingBody.position.set(wx, 1.76, hallZ - 0.02);
    wingBody.castShadow = true;
    wingBody.receiveShadow = true;
    group.add(wingBody);

    const wingEaves = new THREE.Mesh(new THREE.BoxGeometry(2.85, 0.1, 1.98), creamStoneMat);
    wingEaves.position.set(wx, 2.94, hallZ - 0.02);
    group.add(wingEaves);

    const wingRoof = buildHippedRoof(2.92, 0.82, 2.08, redTileRoofMat);
    wingRoof.position.set(wx, 3.4, hallZ - 0.02);
    group.add(wingRoof);
  });

  // --------------------------------------------------------------------------
  // 6. BLAZING NORTH AMERICAN RED MAPLE BOULEVARD (红枫大道 — 左右环抱不遮主楼!)
  // --------------------------------------------------------------------------
  const mapleTrunkMat = new THREE.MeshStandardMaterial({ color: '#5A3E2B', roughness: 0.92 });
  const mapleMats = [
    new THREE.MeshStandardMaterial({ color: '#D62828', roughness: 0.8, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: '#EA580C', roughness: 0.8, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: '#F59E0B', roughness: 0.8, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: '#B91C1C', roughness: 0.84, flatShading: true }),
  ];
  const mapleCanopies: { mesh: THREE.Group; phase: number }[] = [];

  const addRedMapleTree = (tx: number, tz: number, scale: number, idx: number) => {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055 * scale, 0.095 * scale, 1.05 * scale, 8),
      mapleTrunkMat
    );
    trunk.position.set(tx, 0.28 + 0.52 * scale, tz);
    trunk.castShadow = true;
    group.add(trunk);

    const canopy = new THREE.Group();
    canopy.position.set(tx, 0.28 + 1.18 * scale, tz);
    [
      [0, 0, 0, 0.55],
      [-0.3, -0.05, 0.16, 0.38],
      [0.3, 0.08, -0.14, 0.4],
      [0.04, 0.32, 0.08, 0.36],
    ].forEach(([ox, oy, oz, r], cIdx) => {
      const puff = new THREE.Mesh(
        new THREE.DodecahedronGeometry(r * scale, 1),
        mapleMats[(idx + cIdx) % mapleMats.length]
      );
      puff.position.set(ox * scale, oy * scale, oz * scale);
      puff.castShadow = true;
      canopy.add(puff);
    });
    group.add(canopy);
    mapleCanopies.push({ mesh: canopy, phase: idx * 0.7 });
  };

  // Wide Outer Red Maple Boulevard framing the campus (keeps First Teaching Building 100% clear!)
  [-4.15, 4.15].forEach((mx, sideIdx) => {
    [-0.75, 0.25, 1.25, 2.25].forEach((mz, idx) => {
      addRedMapleTree(mx, mz, 1.02 + (idx % 2) * 0.12, sideIdx * 4 + idx);
    });
  });

  // Animated Drifting Autumn Maple Leaves across the campus!
  const fallingLeaves: {
    mesh: THREE.Mesh;
    bx: number;
    bz: number;
    speed: number;
    phase: number;
  }[] = [];
  const leafGeo = new THREE.PlaneGeometry(0.095, 0.095);
  for (let i = 0; i < 26; i++) {
    const lMat = new THREE.MeshBasicMaterial({
      color: i % 3 === 0 ? '#DC2626' : i % 3 === 1 ? '#F97316' : '#F59E0B',
      side: THREE.DoubleSide,
    });
    const leaf = new THREE.Mesh(leafGeo, lMat);
    const bx = (i % 2 === 0 ? -1 : 1) * (1.2 + ((i * 37) % 32) * 0.1);
    const bz = -1.1 + ((i * 53) % 38) * 0.1;
    leaf.position.set(bx, 0.5 + (i % 6) * 0.4, bz);
    group.add(leaf);
    fallingLeaves.push({
      mesh: leaf,
      bx,
      bz,
      speed: 0.34 + (i % 4) * 0.09,
      phase: i * 0.63,
    });
  }

  const beacon = createMemoryBeacon(6.15, '#E85D2A');
  group.add(beacon);

  return {
    group,
    beacon,
    update: (elapsed) => {
      // Gentle autumn wind swaying the North American red maples
      mapleCanopies.forEach((item) => {
        item.mesh.rotation.z = Math.sin(elapsed * 1.35 + item.phase) * 0.05;
      });

      // Gentle golden wave ripple across the experimental hybrid-rice paddy field!
      riceRows.forEach((item) => {
        item.mesh.rotation.z = Math.sin(elapsed * 2.2 + item.phase) * 0.12;
      });

      // Poetic falling crimson & gold maple leaves drifting down the boulevard
      fallingLeaves.forEach((lf) => {
        const cycle = (elapsed * lf.speed + lf.phase) % 2.5;
        const y = 2.75 - cycle;
        lf.mesh.position.set(
          lf.bx + Math.sin(elapsed * 1.9 + lf.phase) * 0.24,
          Math.max(0.32, y),
          lf.bz + Math.cos(elapsed * 1.4 + lf.phase) * 0.16
        );
        lf.mesh.rotation.set(elapsed * 1.6 + lf.phase, elapsed * 1.2, elapsed * 0.9);
      });

      beacon.position.y = 6.15 + Math.sin(elapsed * 2.0 + 3.0) * 0.12;
      beacon.rotation.y = elapsed * 1.1;
    },
  };
}

// ============================================================================
// M07: Our Studio — office diorama with the bamboo sword rack, the camping-tent
// lounge corner, desks with mesh chairs, red-and-gold balloons, and the team
// crossing their swords for the group photo. Local +z faces the visitor.
// ============================================================================
function createCarpetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#56585C';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 5200; i++) {
      const v = 60 + Math.floor(Math.random() * 90);
      ctx.fillStyle = `rgb(${v}, ${v + 2}, ${v + 6})`;
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 1.6, 1.6);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 3);
  return tex;
}

/** Sword in its scabbard, laid along +x from the pommel (x = 0) to the scabbard tip (x = len). */
function buildScabbardSword(
  len: number,
  scabbardColor: string,
  fittingColor: string,
  gripColor: string,
  tasselColor?: string
): THREE.Group {
  const g = new THREE.Group();
  const fitMat = new THREE.MeshStandardMaterial({ color: fittingColor, roughness: 0.3, metalness: 0.75 });
  const scabMat = new THREE.MeshStandardMaterial({ color: scabbardColor, roughness: 0.45, metalness: 0.35 });
  const gripMat = new THREE.MeshStandardMaterial({ color: gripColor, roughness: 0.5, metalness: 0.5 });
  const hiltLen = len * 0.22;

  const pommel = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.012, 6, 14), fitMat);
  pommel.rotation.y = Math.PI / 2;
  g.add(pommel);
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, hiltLen, 10), gripMat);
  grip.rotation.z = Math.PI / 2;
  grip.position.x = hiltLen / 2 + 0.03;
  g.add(grip);
  const guard = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.1, 0.06), fitMat);
  guard.position.x = hiltLen + 0.04;
  g.add(guard);
  const scabLen = len - hiltLen - 0.06;
  const scab = new THREE.Mesh(new THREE.BoxGeometry(scabLen, 0.052, 0.03), scabMat);
  scab.position.x = hiltLen + 0.06 + scabLen / 2;
  scab.castShadow = true;
  g.add(scab);
  // Ornamental metal mounts along the scabbard (mouth, middle, chape)
  [0.04, 0.42, 0.97].forEach((t) => {
    const mount = new THREE.Mesh(new THREE.BoxGeometry(t > 0.9 ? 0.09 : 0.06, 0.06, 0.036), fitMat);
    mount.position.x = hiltLen + 0.06 + scabLen * t;
    g.add(mount);
  });
  if (tasselColor) {
    const tassel = new THREE.Mesh(
      new THREE.ConeGeometry(0.018, 0.16, 6),
      new THREE.MeshStandardMaterial({ color: tasselColor, roughness: 0.8 })
    );
    tassel.position.set(hiltLen + 0.06, -0.11, 0);
    tassel.rotation.z = Math.PI;
    g.add(tassel);
  }
  return g;
}

/** Orient an object whose long axis is +x so it runs from point a toward point b. */
function alignAlongX(obj: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3) {
  const dir = b.clone().sub(a).normalize();
  obj.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir);
  obj.position.copy(a);
}

function buildCompanyStudioMemory(): BuiltMemoryModel {
  const group = new THREE.Group();
  const wallMat = new THREE.MeshStandardMaterial({ color: '#F1F0EC', roughness: 0.92 });
  const ceilingMat = new THREE.MeshStandardMaterial({ color: '#3B3D42', roughness: 0.85 });
  const pipeMat = new THREE.MeshStandardMaterial({ color: '#B8BBC0', roughness: 0.5, metalness: 0.4 });
  const bambooMat = new THREE.MeshStandardMaterial({ color: '#D8B27A', roughness: 0.7 });
  const deskMat = new THREE.MeshStandardMaterial({ color: '#F4F4F2', roughness: 0.6 });
  const canvasMat = new THREE.MeshStandardMaterial({ color: '#E9DFC8', roughness: 0.95 });
  const woodFrameMat = new THREE.MeshStandardMaterial({ color: '#C9A063', roughness: 0.55, metalness: 0.2 });
  const blackMetalMat = new THREE.MeshStandardMaterial({ color: '#1F2023', roughness: 0.45, metalness: 0.5 });

  // --- 1. Floor (speckled office carpet), walls and exposed ceiling --------------------------
  // Thick plinth so the carpet clears the island's grassy dome (top surface at y = 0.2 before
  // the whole room is lifted below).
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(9.2, 0.7, 7),
    new THREE.MeshStandardMaterial({ map: createCarpetTexture(), roughness: 0.98 })
  );
  floor.position.y = -0.15;
  floor.receiveShadow = true;
  group.add(floor);

  const backWall = new THREE.Mesh(new THREE.BoxGeometry(9.2, 3.0, 0.14), wallMat);
  backWall.position.set(0, 1.7, -3.43);
  backWall.receiveShadow = true;
  group.add(backWall);
  const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.0, 7), wallMat);
  sideWall.position.set(-4.53, 1.7, 0);
  sideWall.receiveShadow = true;
  group.add(sideWall);
  // Dark exposed-ceiling band + utility pipes + ducting, as in the photos
  const ceilingBand = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.32, 0.9), ceilingMat);
  ceilingBand.position.set(0, 3.36, -3.0);
  group.add(ceilingBand);
  const ceilingSide = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.32, 7), ceilingMat);
  ceilingSide.position.set(-4.1, 3.36, 0);
  group.add(ceilingSide);
  [-2.75, -2.55].forEach((pz, i) => {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.045 + i * 0.02, 0.045 + i * 0.02, 9.0, 10), pipeMat);
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(0, 3.05 - i * 0.12, pz);
    group.add(pipe);
  });
  const duct = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 6.6, 14), pipeMat);
  duct.rotation.x = Math.PI / 2;
  duct.position.set(-3.95, 2.98, 0);
  group.add(duct);

  // Hanging linear LED + pendant lamp over the lounge corner
  const ledBar = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.05, 0.1),
    new THREE.MeshStandardMaterial({ color: '#F8FAFC', emissive: '#F1F5F9', emissiveIntensity: 1.4 })
  );
  ledBar.position.set(0.4, 2.55, -0.6);
  group.add(ledBar);
  [-0.7, 0.7].forEach((wx) => {
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.7, 4), blackMetalMat);
    wire.position.set(0.4 + wx, 2.92, -0.6);
    group.add(wire);
  });
  const pendant = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: '#2A9D8F', roughness: 0.4, metalness: 0.3, side: THREE.DoubleSide })
  );
  pendant.rotation.x = Math.PI;
  pendant.position.set(1.9, 2.55, -1.2);
  group.add(pendant);
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 10, 8),
    new THREE.MeshStandardMaterial({ color: '#FFF7E0', emissive: '#FFE8B0', emissiveIntensity: 2 })
  );
  bulb.position.set(1.9, 2.5, -1.2);
  group.add(bulb);
  const roomLight = new THREE.PointLight('#FFF1DC', 1.4, 9, 1.6);
  roomLight.position.set(0.6, 2.4, -0.4);
  group.add(roomLight);

  // --- 2. Camping corner: beige tent, folding chairs, black roll-top table ------------------
  const tent = new THREE.Group();
  tent.position.set(2.45, 0.2, -1.75);
  const tentBodyGeo = new THREE.CylinderGeometry(1.25, 1.45, 1.55, 4, 4, true);
  tentBodyGeo.rotateY(Math.PI / 4);
  {
    // Fabric wrinkles: small, smooth-ish displacement of the walls
    const tp = tentBodyGeo.attributes.position;
    for (let i = 0; i < tp.count; i++) {
      const x = tp.getX(i);
      const y = tp.getY(i);
      const z = tp.getZ(i);
      const w = Math.sin(x * 7.3 + y * 4.1) * Math.cos(z * 6.7 - y * 3.3) * 0.025;
      tp.setXYZ(i, x * (1 + w), y, z * (1 + w));
    }
    tentBodyGeo.computeVertexNormals();
  }
  const tentFabric = new THREE.MeshStandardMaterial({ color: '#E8DCC2', roughness: 0.96, side: THREE.DoubleSide });
  const tentBody = new THREE.Mesh(tentBodyGeo, tentFabric);
  tentBody.position.y = 0.775;
  tentBody.castShadow = true;
  tentBody.receiveShadow = true;
  tent.add(tentBody);
  const roofGeo = new THREE.ConeGeometry(1.42, 0.9, 4, 1, true);
  roofGeo.rotateY(Math.PI / 4);
  const roof = new THREE.Mesh(roofGeo, tentFabric);
  roof.position.y = 1.55 + 0.45;
  roof.castShadow = true;
  tent.add(roof);
  // Rolled-up door on the front face: dark opening + a tied fabric roll above it
  const doorway = new THREE.Mesh(
    new THREE.PlaneGeometry(0.62, 1.2),
    new THREE.MeshStandardMaterial({ color: '#3A3326', roughness: 1 })
  );
  doorway.position.set(0.2, 0.62, 0.975);
  doorway.rotation.x = -0.09;
  tent.add(doorway);
  const doorRoll = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.66, 10), tentFabric);
  doorRoll.rotation.z = Math.PI / 2;
  doorRoll.position.set(0.2, 1.26, 0.97);
  tent.add(doorRoll);
  // Guy ropes from the roof corners down to stakes
  const ropeMat = new THREE.MeshStandardMaterial({ color: '#A0743F', roughness: 0.8 });
  [
    [1, 1],
    [-1, 1],
    [1, -1],
  ].forEach(([sx, sz]) => {
    const a = new THREE.Vector3(sx * 0.9, 1.55, sz * 0.9);
    const b = new THREE.Vector3(sx * 1.55, 0.02, sz * 1.55);
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1, 4), ropeMat);
    rope.position.copy(a).add(b).multiplyScalar(0.5);
    rope.scale.y = a.distanceTo(b);
    rope.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    tent.add(rope);
  });
  group.add(tent);

  const buildFoldingChair = () => {
    const c = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.035, 0.42), canvasMat);
    seat.position.y = 0.38;
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.42, 0.03), canvasMat);
    back.position.set(0, 0.66, -0.22);
    back.rotation.x = -0.16;
    c.add(seat, back);
    [-0.27, 0.27].forEach((ax) => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.035, 0.5), woodFrameMat);
      arm.position.set(ax, 0.56, -0.02);
      c.add(arm);
      [-1, 1].forEach((dz) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.62, 6), woodFrameMat);
        leg.position.set(ax, 0.29, dz * 0.08);
        leg.rotation.x = dz * 0.55; // the X-frame of a folding chair
        c.add(leg);
      });
    });
    c.traverse((o) => ((o as THREE.Mesh).castShadow = true));
    return c;
  };
  const table = new THREE.Group();
  table.position.set(0.7, 0.2, 0.15);
  const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.04, 0.62), blackMetalMat);
  tableTop.position.y = 0.56;
  tableTop.castShadow = true;
  table.add(tableTop);
  [
    [-0.52, -0.26],
    [0.52, -0.26],
    [-0.52, 0.26],
    [0.52, 0.26],
  ].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.54, 6), blackMetalMat);
    leg.position.set(lx, 0.27, lz);
    table.add(leg);
  });
  group.add(table);
  [
    [-0.15, 0.55, 0.9],
    [1.55, 0.55, -0.9],
    [0.7, -0.35, 0],
    [0.95, 1.0, Math.PI],
  ].forEach(([cx, cz, ry]) => {
    const chair = buildFoldingChair();
    chair.position.set(cx, 0.2, cz);
    chair.rotation.y = ry;
    group.add(chair);
  });

  // --- 3. Bamboo sword rack: four swords across, three standing behind ----------------------
  const rack = new THREE.Group();
  rack.position.set(-2.3, 0.2, -2.35);
  [-0.82, 0.82].forEach((ux) => {
    const upright = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.75, 0.34), bambooMat);
    upright.position.set(ux, 0.875, 0);
    upright.castShadow = true;
    rack.add(upright);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.62), bambooMat);
    foot.position.set(ux, 0.035, 0);
    rack.add(foot);
    // Cradle notches: little bamboo hooks under each sword
    [0.48, 0.84, 1.2, 1.56].forEach((ny) => {
      const hook = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.08), bambooMat);
      hook.position.set(ux, ny - 0.05, 0.15);
      rack.add(hook);
    });
  });
  [0.22, 0.98].forEach((sy) => {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.06, 0.03), bambooMat);
    slat.position.set(0, sy, -0.1);
    rack.add(slat);
  });
  const rackSwords: [string, string, string, string][] = [
    ['#D9C08A', '#7A5B2E', '#6B4A26', '#4A3A2A'], // pale-gold scabbard, bronze dragon mounts
    ['#E3C35A', '#C9A227', '#E0B93B', '#F2A93B'], // brass-gold with yellow tassel
    ['#1D1E22', '#B88A3E', '#2A2B30', '#18181B'], // black with gilt mounts
    ['#253A6B', '#C99A3E', '#9C7A3C', '#18181B'], // navy with gilt mounts
  ];
  rackSwords.forEach(([scab, fit, grip, tassel], i) => {
    const sword = buildScabbardSword(2.15, scab, fit, grip, tassel);
    sword.rotation.y = Math.PI; // pommel to the right, as on the real rack
    sword.position.set(1.12, 1.56 - i * 0.36, 0.15);
    rack.add(sword);
  });
  (
    [
      [-0.28, '#E5E7EB', '#D4AF37'],
      [0.18, '#D1D5DB', '#9CA3AF'],
      [0.55, '#6B1E22', '#4A1416'],
    ] as [number, string, string][]
  ).forEach(([vx, scab, fit]) => {
    const sword = buildScabbardSword(2.0, scab, fit, fit);
    sword.rotation.z = -Math.PI / 2; // standing up: pommel at the top, scabbard tip on the floor
    sword.position.set(vx, 2.05, -0.2);
    sword.rotation.y = 0.04;
    rack.add(sword);
  });
  group.add(rack);

  // --- 4. Desks with drawer pedestals, mesh chairs, money tree, guitar case -----------------
  const buildMeshChair = () => {
    const c = new THREE.Group();
    const greyMat = new THREE.MeshStandardMaterial({ color: '#8E9298', roughness: 0.7 });
    const frameMat = new THREE.MeshStandardMaterial({ color: '#DADBDD', roughness: 0.4, metalness: 0.2 });
    const meshMat = new THREE.MeshStandardMaterial({
      color: '#6B6F75',
      roughness: 0.8,
      transparent: true,
      opacity: 0.82,
    });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.48), greyMat);
    seat.position.y = 0.5;
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.62, 0.04), meshMat);
    back.position.set(0, 0.9, -0.24);
    back.rotation.x = -0.1;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.05), meshMat);
    head.position.set(0, 1.3, -0.29);
    const lift = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.36, 8), frameMat);
    lift.position.y = 0.28;
    c.add(seat, back, head, lift);
    for (let k = 0; k < 5; k++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.04), frameMat);
      const a = (k / 5) * Math.PI * 2;
      spoke.position.set(Math.cos(a) * 0.15, 0.08, Math.sin(a) * 0.15);
      spoke.rotation.y = -a;
      c.add(spoke);
    }
    c.traverse((o) => ((o as THREE.Mesh).castShadow = true));
    return c;
  };
  [-0.35, 1.25].forEach((dz, i) => {
    const desk = new THREE.Group();
    desk.position.set(-3.75, 0.2, dz);
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.05, 1.45), deskMat);
    top.position.y = 0.76;
    top.castShadow = true;
    const pedestal = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.7, 0.42), deskMat);
    pedestal.position.set(0, 0.36, 0.45);
    const legA = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.74, 0.04), deskMat);
    legA.position.set(0, 0.37, -0.68);
    desk.add(top, pedestal, legA);
    group.add(desk);
    const chair = buildMeshChair();
    chair.position.set(-3.0, 0.2, dz - 0.1);
    chair.rotation.y = -Math.PI / 2 + (i ? 0.3 : -0.2);
    group.add(chair);
  });
  // Money tree in a glass pot on the desk
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.08, 0.2, 12),
    new THREE.MeshStandardMaterial({ color: '#9BD5C2', roughness: 0.15, transparent: true, opacity: 0.75 })
  );
  pot.position.set(-3.85, 1.11, -0.85);
  group.add(pot);
  const plantMat = new THREE.MeshStandardMaterial({ color: '#3F8F3A', roughness: 0.75, flatShading: true });
  for (let p = 0; p < 6; p++) {
    const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11, 0), plantMat);
    leaf.position.set(-3.85 + Math.cos(p * 1.2) * 0.13, 1.42 + (p % 3) * 0.1, -0.85 + Math.sin(p * 1.2) * 0.13);
    leaf.scale.set(1.3, 0.55, 1.3);
    group.add(leaf);
  }
  // Guitar case leaning on the back wall
  const guitarCase = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.2, 0.7, 6, 12),
    new THREE.MeshStandardMaterial({ color: '#EDEAE3', roughness: 0.7 })
  );
  guitarCase.scale.set(1, 1, 0.38);
  guitarCase.position.set(-4.2, 0.78, -3.1);
  guitarCase.rotation.z = -0.12;
  group.add(guitarCase);

  // --- 5. Red & gold balloon columns (the celebration day) -----------------------------------
  const balloonRed = new THREE.MeshStandardMaterial({ color: '#D1293A', roughness: 0.35, metalness: 0.1 });
  const balloonGold = new THREE.MeshStandardMaterial({ color: '#E3B53E', roughness: 0.3, metalness: 0.35 });
  const balloonColumns: THREE.Group[] = [];
  [-3.9, 3.95].forEach((bx) => {
    const col = new THREE.Group();
    col.position.set(bx, 0.2, 2.75);
    for (let lvl = 0; lvl < 6; lvl++) {
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2 + lvl * 0.6;
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), (lvl + k) % 3 === 0 ? balloonGold : balloonRed);
        b.position.set(Math.cos(a) * 0.16, 0.2 + lvl * 0.26, Math.sin(a) * 0.16);
        col.add(b);
      }
    }
    const topper = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12), balloonRed);
    topper.position.y = 1.9;
    col.add(topper);
    group.add(col);
    balloonColumns.push(col);
  });

  // --- 6. The team, crossing swords for the group photo ---------------------------------------
  const crossPoint = new THREE.Vector3(0, 2.1, 1.85);
  const s = 0.86;
  const team: {
    x: number;
    z: number;
    side: -1 | 1; // which hand is raised toward the centre
    look: Parameters<typeof buildRefinedCharacter>[0];
    sword: [string, string, string];
  }[] = [
    {
      x: -2.55,
      z: 2.15,
      side: 1,
      look: { torsoColor: '#F4F4F1', pantsColor: '#CDBF9F', shoeColor: '#4A3426', hairStyle: 'short' },
      sword: ['#D9C08A', '#7A5B2E', '#6B4A26'],
    },
    {
      x: -1.6,
      z: 2.6,
      side: 1,
      look: { torsoColor: '#1F2A44', pantsColor: '#5B7DB1', hairStyle: 'medium-parted' },
      sword: ['#1D1E22', '#B88A3E', '#2A2B30'],
    },
    {
      x: -0.85,
      z: 1.45,
      side: 1,
      look: { torsoColor: '#B9C3CD', pantsColor: '#2B3445', glasses: true, hairStyle: 'short' },
      sword: ['#E5E7EB', '#D4AF37', '#D4AF37'],
    },
    {
      x: 0.2,
      z: 1.05,
      side: -1,
      look: { torsoColor: '#25262A', pantsColor: '#C9B99A', glasses: true, hairStyle: 'short' },
      sword: ['#E3C35A', '#C9A227', '#E0B93B'],
    },
    {
      x: 0.85,
      z: 1.5,
      side: -1,
      look: { torsoColor: '#1C1C1F', pantsColor: '#1C1C1F', hairStyle: 'medium-parted' },
      sword: ['#6B1E22', '#4A1416', '#4A1416'],
    },
    {
      x: 1.6,
      z: 2.0,
      side: -1,
      look: { torsoColor: '#F5F2EC', pantsColor: '#151515', hairStyle: 'long-straight' },
      sword: ['#D1D5DB', '#9CA3AF', '#9CA3AF'],
    },
    {
      x: 2.55,
      z: 2.45,
      side: -1,
      look: { torsoColor: '#E8E0CF', pantsColor: '#1E2533', glasses: true, hairStyle: 'curly' },
      sword: ['#D9C08A', '#7A5B2E', '#6B4A26'],
    },
  ];
  team.forEach((m) => {
    const person = buildRefinedCharacter({
      ...m.look,
      peaceRight: m.side === 1,
      peaceLeft: m.side === -1,
      scale: s,
    });
    person.position.set(m.x, 0.2, m.z);
    person.rotation.y = -m.x * 0.08; // turn slightly toward the middle
    group.add(person);
    // Raised hand, then a sword from that hand into the shared crossing point
    const hand = new THREE.Vector3(m.x + m.side * 0.49 * s, 0.2 + 1.41 * s, m.z - 0.07 * s);
    const sword = buildScabbardSword(hand.distanceTo(crossPoint) + 0.45, m.sword[0], m.sword[1], m.sword[2]);
    alignAlongX(sword, hand.clone().add(crossPoint.clone().sub(hand).normalize().multiplyScalar(-0.1)), crossPoint);
    group.add(sword);
  });
  // A grey tie for the cream-jacket colleague on the right
  const tie = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.3, 0.02),
    new THREE.MeshStandardMaterial({ color: '#3F4A3A', roughness: 0.6 })
  );
  tie.position.set(2.55, 0.2 + 1.02 * s, 2.45 + 0.18 * s);
  group.add(tie);
  // Sitting in front, cross-legged, holding the blue sword upright
  const sitter = buildRefinedCharacter({
    torsoColor: '#17181B',
    pantsColor: '#17181B',
    glasses: true,
    hairStyle: 'medium-parted',
    sitting: true,
    scale: s,
  });
  sitter.position.set(0.05, 0.2, 2.75);
  group.add(sitter);
  const blueSword = buildScabbardSword(1.6, '#2D4A8A', '#C99A3E', '#9C7A3C');
  blueSword.rotation.z = -Math.PI / 2; // upright, pommel at the top
  blueSword.position.set(0.12, 1.65, 3.05);
  group.add(blueSword);

  // Lift the whole room above the island's grassy dome so the carpet and feet aren't buried.
  const ROOM_LIFT = 0.36;
  group.children.forEach((child) => {
    child.position.y += ROOM_LIFT;
  });

  const beacon = createMemoryBeacon(3.95 + ROOM_LIFT, '#E85D2A');
  group.add(beacon);

  return {
    group,
    beacon,
    update: (elapsed) => {
      balloonColumns.forEach((col, i) => {
        col.position.y = 0.2 + ROOM_LIFT + Math.sin(elapsed * 1.3 + i * 1.7) * 0.03;
        col.rotation.y = Math.sin(elapsed * 0.6 + i) * 0.05;
      });
      roomLight.intensity = 1.35 + Math.sin(elapsed * 0.8) * 0.05;
      beacon.position.y = 3.95 + ROOM_LIFT + Math.sin(elapsed * 2.0) * 0.14;
      beacon.rotation.y = elapsed * 1.1;
    },
  };
}

export function buildPersonalMemoryModel(kind: PersonalMemoryKind): BuiltMemoryModel {
  switch (kind) {
    case 'freedive-crimson':
      return buildFreediveCrimsonMemory();
    case 'yzfls-campus':
      return buildYzflsCampusMemory();
    case 'redbrick-gate':
      return buildRedbrickGateMemory();
    case 'gramophone-lounge':
      return buildGramophoneLoungeMemory();
    case 'winter-bros':
      return buildWinterBrosMemory();
    case 'hunau-campus':
      return buildHunauCampusMemory();
    case 'company-studio':
      return buildCompanyStudioMemory();
  }
}
