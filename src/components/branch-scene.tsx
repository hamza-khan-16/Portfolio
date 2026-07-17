import { useRef, useMemo, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/* ---------- Cinematic Fibrous Branch ----------
   Trunk core + rope braid: one merged mesh (few pieces, structural).
   Limbs + twigs + strays: ONE instanced tapered tube whose curvature,
   length, radius, bend, droop and seed are per-instance attributes. The
   vertex shader synthesizes each limb's curve on the GPU — geometry
   memory drops from segments*limbs to segments + attribs*limbs, and the
   per-frame CPU cost is a single uTime write.                          */

/* Shared fragment: reads vSeed / vHot from vertex stage. */
const FIBER_FRAG = /* glsl */ `
  precision highp float;
  varying vec2  vUv;
  varying vec3  vWorldPos;
  varying vec3  vNormal;
  varying float vSeed;
  varying float vHot;

  uniform float uTime;
  uniform vec3  uBark;
  uniform vec3  uGlow;
  uniform vec3  uGoldGlow;
  uniform float uPulse;

  float hash11(float p){ return fract(sin(p * 127.1) * 43758.5453); }
  float vnoise(float x){
    float i = floor(x); float f = fract(x);
    float u = f*f*(3.0-2.0*f);
    return mix(hash11(i + vSeed*17.0), hash11(i + 1.0 + vSeed*17.0), u);
  }
  float fbm1(float x){
    float v = 0.0, a = 0.5;
    for(int i=0;i<4;i++){ v += a * vnoise(x); x *= 2.03; a *= 0.5; }
    return v;
  }

  void main(){
    float s = vUv.x;
    float n = fbm1(s * 22.0 + vSeed * 91.0);
    float threshold = 1.0 - vHot;
    float hot = smoothstep(threshold, threshold + 0.03, n);
    hot = pow(hot, 1.6);
    float flicker = 0.75 + 0.25 * sin(uTime * (2.0 + hash11(vSeed) * 4.0) + s * 30.0);
    hot *= flicker;

    float travel = fract(s * 2.0 - uTime * 0.18 + hash11(vSeed) * 0.7);
    float dash = smoothstep(0.985, 1.0, travel) * 0.9;

    float pulse = smoothstep(0.02, 0.0, abs(s - uPulse));

    vec3 V = normalize(cameraPosition - vWorldPos);
    float rim = pow(1.0 - max(0.0, dot(normalize(vNormal), V)), 3.0);

    vec3 col = uBark;
    col += uGlow * hot * 3.2;
    col += uGlow * dash * 2.2;
    col += uGoldGlow * pulse * 2.4;
    col += uGlow * rim * 0.18;

    float d = length(vWorldPos - cameraPosition);
    float fog = 1.0 - smoothstep(6.0, 30.0, d);
    col *= fog;

    gl_FragColor = vec4(col, 1.0);
  }
`;

/* Vertex shader for the merged trunk (per-vertex seed/hot baked in). */
const MERGED_VERT = /* glsl */ `
  attribute float aSeed;
  attribute float aHot;
  varying vec2  vUv;
  varying vec3  vWorldPos;
  varying vec3  vNormal;
  varying float vSeed;
  varying float vHot;
  uniform float uTime;

  void main() {
    vUv = uv;
    vSeed = aSeed;
    vHot = aHot;
    vec3 pos = position;
    pos += normal * (sin(uTime * 0.5 + uv.x * 40.0 + aSeed * 6.28) * 0.005);
    vec4 world = modelMatrix * vec4(pos, 1.0);
    vWorldPos = world.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

/* Vertex shader for INSTANCED limbs. Reconstructs each limb's curve
   entirely on the GPU from a shared unit tapered tube + per-instance
   orientation, length, radius, bend and droop. */
const INSTANCED_VERT = /* glsl */ `
  attribute vec2 aRadial;      // unit radial dir (cos, sin) around limb axis

  attribute vec3 iOrigin;
  attribute vec3 iRight;
  attribute vec3 iUp;          // limb axis (out-direction)
  attribute vec3 iForward;
  attribute float iLen;
  attribute float iRadius;
  attribute vec3 iBend;        // world-space bend vector (dir * amount)
  attribute float iDroop;
  attribute float iSeed;
  attribute float iHot;

  varying vec2  vUv;
  varying vec3  vWorldPos;
  varying vec3  vNormal;
  varying float vSeed;
  varying float vHot;

  uniform float uTime;

  void main() {
    vUv = uv;
    vSeed = iSeed;
    vHot = iHot;

    // position.xz already carries unit-profile radius * direction from the
    // base geometry; position.y is normalized [0,1] length along the limb.
    float y = position.y;

    vec3 world =
        iOrigin
      + iRight   * (position.x * iRadius)
      + iForward * (position.z * iRadius)
      + iUp      * (y * iLen)
      + iBend    * sin(y * 3.14159)
      + vec3(0.0, -pow(y, 1.6) * iDroop, 0.0);

    vec3 nrm = normalize(iRight * aRadial.x + iForward * aRadial.y);
    // GPU wobble — identical animation, zero CPU cost per frame.
    world += nrm * (sin(uTime * 0.6 + y * 38.0 + iSeed * 6.28) * 0.006);

    vWorldPos = world;
    vNormal   = nrm;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

/* ---- helpers ---- */

function makeFiberCurve(
  main: THREE.CatmullRomCurve3,
  opts: { phase: number; radius: number; twist: number; wobble: number; curveNoise: number; samples?: number },
): THREE.CatmullRomCurve3 {
  const samples = opts.samples ?? 200;
  const pts: THREE.Vector3[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const p = main.getPointAt(t);
    const tan = main.getTangentAt(t).normalize();
    const n = new THREE.Vector3().crossVectors(tan, up);
    if (n.lengthSq() < 1e-4) n.set(1, 0, 0);
    n.normalize();
    const b = new THREE.Vector3().crossVectors(tan, n).normalize();
    const angle = opts.phase + t * opts.twist * Math.PI * 2;
    const r = opts.radius * (0.7 + 0.3 * Math.sin(t * 9 + opts.phase * 3) + opts.wobble * Math.sin(t * 33 + opts.phase * 7));
    const offset = n.clone().multiplyScalar(Math.cos(angle) * r)
      .add(b.clone().multiplyScalar(Math.sin(angle) * r));
    const cn = opts.curveNoise;
    offset.add(n.clone().multiplyScalar(Math.sin(t * 2.3 + opts.phase * 1.7) * cn));
    offset.add(b.clone().multiplyScalar(Math.cos(t * 1.9 + opts.phase * 2.3) * cn));
    pts.push(p.clone().add(offset));
  }
  return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
}

function makeTaperedTube(
  curve: THREE.CatmullRomCurve3,
  tubularSegments: number,
  radialSegments: number,
  radiusFn: (t: number) => number,
  seed: number,
  hot: number,
): THREE.BufferGeometry {
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const vCount = (tubularSegments + 1) * (radialSegments + 1);
  const positions = new Float32Array(vCount * 3);
  const normals = new Float32Array(vCount * 3);
  const uvs = new Float32Array(vCount * 2);
  const aSeed = new Float32Array(vCount);
  const aHot = new Float32Array(vCount);
  const indices: number[] = [];
  const P = new THREE.Vector3();
  let vi = 0;
  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments;
    curve.getPointAt(t, P);
    const r = radiusFn(t);
    const nrm = frames.normals[i];
    const bin = frames.binormals[i];
    for (let j = 0; j <= radialSegments; j++) {
      const v = (j / radialSegments) * Math.PI * 2;
      const s = Math.sin(v);
      const c = -Math.cos(v);
      const nx = c * nrm.x + s * bin.x;
      const ny = c * nrm.y + s * bin.y;
      const nz = c * nrm.z + s * bin.z;
      const len = Math.hypot(nx, ny, nz) || 1;
      const nX = nx / len, nY = ny / len, nZ = nz / len;
      const idx3 = vi * 3;
      positions[idx3] = P.x + r * nX;
      positions[idx3 + 1] = P.y + r * nY;
      positions[idx3 + 2] = P.z + r * nZ;
      normals[idx3] = nX;
      normals[idx3 + 1] = nY;
      normals[idx3 + 2] = nZ;
      uvs[vi * 2] = t;
      uvs[vi * 2 + 1] = j / radialSegments;
      aSeed[vi] = seed;
      aHot[vi] = hot;
      vi++;
    }
  }
  const rs1 = radialSegments + 1;
  for (let i = 1; i <= tubularSegments; i++) {
    for (let j = 1; j <= radialSegments; j++) {
      const a = rs1 * (i - 1) + (j - 1);
      const b = rs1 * i + (j - 1);
      const c = rs1 * i + j;
      const d = rs1 * (i - 1) + j;
      indices.push(a, b, d, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  g.setAttribute("aSeed", new THREE.BufferAttribute(aSeed, 1));
  g.setAttribute("aHot", new THREE.BufferAttribute(aHot, 1));
  g.setIndex(indices);
  return g;
}

/* Unit tapered tube: y in [0,1], radius carried in position.xz,
   plus an aRadial (cos, sin) attribute for GPU normal reconstruction.
   Radius is modulated by a helical groove so each limb reads as a
   twisted rope rather than a smooth tube.                              */
function makeUnitLimbTube(tubular: number, radial: number): THREE.InstancedBufferGeometry {
  const vCount = (tubular + 1) * (radial + 1);
  const positions = new Float32Array(vCount * 3);
  const uvs = new Float32Array(vCount * 2);
  const aRadial = new Float32Array(vCount * 2);
  const indices: number[] = [];
  const TWIST = 18; // helical turns along a limb
  const PLIES = 3;  // rope plies around the circumference
  let vi = 0;
  for (let i = 0; i <= tubular; i++) {
    const y = i / tubular;
    const taper = Math.pow(1 - y, 0.8) * (0.85 + 0.15 * Math.sin(y * 20)) + 0.02;
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      // Braided rope groove: plies wrapping helically along the limb.
      const groove = 0.82 + 0.22 * Math.cos(a * PLIES - y * TWIST);
      const r = taper * groove;
      const dx = Math.cos(a);
      const dz = Math.sin(a);
      positions[vi * 3] = dx * r;
      positions[vi * 3 + 1] = y;
      positions[vi * 3 + 2] = dz * r;
      uvs[vi * 2] = y;
      uvs[vi * 2 + 1] = j / radial;
      aRadial[vi * 2] = dx;
      aRadial[vi * 2 + 1] = dz;
      vi++;
    }
  }
  const rs1 = radial + 1;
  for (let i = 1; i <= tubular; i++) {
    for (let j = 1; j <= radial; j++) {
      const a = rs1 * (i - 1) + (j - 1);
      const b = rs1 * i + (j - 1);
      const c = rs1 * i + j;
      const d = rs1 * (i - 1) + j;
      indices.push(a, b, d, b, c, d);
    }
  }
  const g = new THREE.InstancedBufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  g.setAttribute("aRadial", new THREE.BufferAttribute(aRadial, 2));
  g.setIndex(indices);
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 200);
  return g;
}

/* ---- data collection ---- */

type Limb = {
  origin: THREE.Vector3;
  right: THREE.Vector3;
  up: THREE.Vector3;
  forward: THREE.Vector3;
  len: number;
  radius: number;
  bend: THREE.Vector3;
  droop: number;
  seed: number;
  hot: number;
};

function collectLimbs(main: THREE.CatmullRomCurve3, isMobile: boolean): Limb[] {
  const limbs: Limb[] = [];
  let seedS = 1;
  const rand = () => { seedS = (seedS * 9301 + 49297) % 233280; return seedS / 233280; };
  const worldUp = new THREE.Vector3(0, 1, 0);
  const maxDepth = isMobile ? 3 : 4;
  const childrenPerLevel = isMobile ? [5, 4, 3, 2] : [7, 5, 4, 3, 2];

  const push = (
    origin: THREE.Vector3,
    outDir: THREE.Vector3,
    len: number,
    radius: number,
    bendMagnitude: number,
    droop: number,
    hot: number,
  ): Limb => {
    const right = new THREE.Vector3().crossVectors(outDir, worldUp);
    if (right.lengthSq() < 1e-4) right.set(1, 0, 0);
    right.normalize();
    const forward = new THREE.Vector3().crossVectors(right, outDir).normalize();
    const bendAngle = rand() * Math.PI * 2;
    const bend = right.clone().multiplyScalar(Math.cos(bendAngle))
      .add(forward.clone().multiplyScalar(Math.sin(bendAngle)))
      .normalize()
      .multiplyScalar(bendMagnitude);
    const limb: Limb = {
      origin: origin.clone(),
      right, up: outDir.clone(), forward,
      len, radius, bend, droop,
      seed: rand(), hot,
    };
    limbs.push(limb);
    return limb;
  };

  const grow = (
    parent: THREE.CatmullRomCurve3,
    tOnParent: number,
    parentRadius: number,
    depth: number,
  ) => {
    if (depth > maxDepth) return;
    const origin = parent.getPointAt(tOnParent);
    const parentTan = parent.getTangentAt(tOnParent).normalize();
    const n = new THREE.Vector3().crossVectors(parentTan, worldUp);
    if (n.lengthSq() < 1e-4) n.set(1, 0, 0);
    n.normalize();
    const b = new THREE.Vector3().crossVectors(parentTan, n).normalize();
    const angle = rand() * Math.PI * 2;
    const spread = 0.5 + rand() * 0.7;
    const outDir = n.clone().multiplyScalar(Math.cos(angle) * Math.sin(spread))
      .add(b.clone().multiplyScalar(Math.sin(angle) * Math.sin(spread)))
      .add(parentTan.clone().multiplyScalar(Math.cos(spread)))
      .normalize();
    const len = (2.6 - depth * 0.4) * (0.55 + rand() * 0.85);
    const baseR = parentRadius * (0.45 + rand() * 0.28);
    const bendMag = (rand() - 0.5) * 0.4 * len;
    const droop = len * 0.18 * (1 - Math.abs(outDir.y));
    push(origin, outDir, len, baseR, bendMag, droop, 0.1 + depth * 0.04);

    // For child spawn points, sample an approximate curve along the bent
    // limb (matches the vertex-shader displacement so kids land on it).
    const pts: THREE.Vector3[] = [];
    const right = new THREE.Vector3().crossVectors(outDir, worldUp);
    if (right.lengthSq() < 1e-4) right.set(1, 0, 0);
    right.normalize();
    const forward = new THREE.Vector3().crossVectors(right, outDir).normalize();
    const bendAngle = rand() * Math.PI * 2;
    const bendDir = right.clone().multiplyScalar(Math.cos(bendAngle))
      .add(forward.clone().multiplyScalar(Math.sin(bendAngle))).normalize()
      .multiplyScalar(bendMag);
    for (let i = 0; i <= 6; i++) {
      const s = i / 6;
      const along = origin.clone().add(outDir.clone().multiplyScalar(len * s));
      along.add(bendDir.clone().multiplyScalar(Math.sin(s * Math.PI)));
      along.y -= Math.pow(s, 1.6) * droop;
      pts.push(along);
    }
    const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);

    const kids = childrenPerLevel[depth] ?? 0;
    for (let k = 0; k < kids; k++) {
      const t = 0.35 + (k / Math.max(1, kids)) * 0.55 + (rand() - 0.5) * 0.08;
      grow(curve, THREE.MathUtils.clamp(t, 0.15, 0.92), baseR * (1 - t * 0.7), depth + 1);
    }
  };

  const trunkRadius = 0.22;
  const trunkKids = childrenPerLevel[0] ?? 5;
  const trunkLimbCount = (isMobile ? 14 : 22) + trunkKids;
  for (let i = 0; i < trunkLimbCount; i++) {
    const t = 0.06 + (i / trunkLimbCount) * 0.88 + (rand() - 0.5) * 0.04;
    grow(main, t, trunkRadius * (1 - t * 0.6), 1);
  }

  // Stray filaments — thin, longer, whippier, hotter (more glow bands).
  const strayCount = isMobile ? 22 : 44;
  for (let i = 0; i < strayCount; i++) {
    const t0 = 0.02 + (i / strayCount) * 0.94 + (rand() - 0.5) * 0.02;
    const p = main.getPointAt(t0);
    const tan = main.getTangentAt(t0).normalize();
    const n = new THREE.Vector3().crossVectors(tan, worldUp);
    if (n.lengthSq() < 1e-4) n.set(1, 0, 0);
    n.normalize();
    const b = new THREE.Vector3().crossVectors(tan, n).normalize();
    const a = rand() * Math.PI * 2;
    const dir = n.clone().multiplyScalar(Math.cos(a))
      .add(b.clone().multiplyScalar(Math.sin(a)))
      .add(tan.clone().multiplyScalar((rand() - 0.5) * 0.9))
      .normalize();
    const len = 0.8 + rand() * 2.4;
    const radius = 0.02 + rand() * 0.03;
    const bendMag = (rand() - 0.5) * 0.8 * len;
    push(p, dir, len, radius, bendMag, 0.05 * len, 0.2);
  }

  return limbs;
}

/* ---- scene bits ---- */

function useBranchCurve() {
  return useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const y = -t * 60;
      const x = Math.sin(t * Math.PI * 4) * 3.2 + Math.sin(t * 11) * 0.6;
      const z = Math.cos(t * Math.PI * 3) * 2.2 - t * 2.0;
      pts.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
  }, []);
}

function useSharedFiberMaterials(pulseRef: React.MutableRefObject<number>) {
  const { merged, instanced, uniforms } = useMemo(() => {
    const uniforms = {
      uTime: { value: 0 },
      uPulse: { value: -1 },
      uBark: { value: new THREE.Color("#050705") },
      uGlow: { value: new THREE.Color("#c8ff5a") },
      uGoldGlow: { value: new THREE.Color("#ffe08a") },
    };
    const merged = new THREE.ShaderMaterial({
      vertexShader: MERGED_VERT, fragmentShader: FIBER_FRAG, uniforms,
    });
    const instanced = new THREE.ShaderMaterial({
      vertexShader: INSTANCED_VERT, fragmentShader: FIBER_FRAG, uniforms,
    });
    return { merged, instanced, uniforms };
  }, []);

  useFrame((_, dt) => {
    uniforms.uTime.value += dt;
    uniforms.uPulse.value = pulseRef.current;
  });

  return { merged, instanced };
}

function TrunkAndRope({
  main,
  material,
  isMobile,
}: {
  main: THREE.CatmullRomCurve3;
  material: THREE.ShaderMaterial;
  isMobile: boolean;
}) {
  const geo = useMemo(() => {
    const geos: THREE.BufferGeometry[] = [];
    const trunkRadius = 0.22;

    // Main structural braid — several thick plies helically wound around
    // the trunk curve. No solid core tube: the rope IS the trunk.
    const mainPlies = isMobile ? 5 : 7;
    const ropeTwist = 4.8;
    for (let i = 0; i < mainPlies; i++) {
      const phase = (i / mainPlies) * Math.PI * 2;
      const c = makeFiberCurve(main, {
        phase, radius: trunkRadius * 0.85, twist: ropeTwist,
        wobble: 0.025, curveNoise: 0.012, samples: 220,
      });
      geos.push(
        makeTaperedTube(
          c,
          isMobile ? 150 : 220,
          8,
          (t) => {
            const taper = Math.pow(1 - t, 0.5);
            const breathe = 0.95 + 0.05 * Math.sin(t * 60 + phase * 2);
            return trunkRadius * 0.85 * taper * breathe + 0.01;
          },
          Math.random(),
          0.08,
        ),
      );
    }

    // Fine surface fibers — thin filaments twisted at a tighter pitch,
    // catch highlights and read as loose rope hairs.
    const microCount = isMobile ? 14 : 22;
    for (let i = 0; i < microCount; i++) {
      const phase = (i / microCount) * Math.PI * 2;
      const c = makeFiberCurve(main, {
        phase, radius: trunkRadius * 1.02, twist: ropeTwist * 1.15,
        wobble: 0.02, curveNoise: 0.008, samples: 170,
      });
      geos.push(
        makeTaperedTube(
          c,
          isMobile ? 110 : 150,
          4,
          (t) => Math.pow(1 - t, 0.55) * trunkRadius * 0.12 + 0.003,
          Math.random(),
          0.14,
        ),
      );
    }

    const merged = mergeGeometries(geos, false)!;
    geos.forEach((g) => g.dispose());
    return merged;
  }, [main, isMobile]);

  return <mesh geometry={geo} material={material} frustumCulled={false} />;
}

function InstancedLimbs({
  main,
  material,
  isMobile,
}: {
  main: THREE.CatmullRomCurve3;
  material: THREE.ShaderMaterial;
  isMobile: boolean;
}) {
  const geo = useMemo(() => {
    const limbs = collectLimbs(main, isMobile);
    const N = limbs.length;
    const g = makeUnitLimbTube(isMobile ? 16 : 22, isMobile ? 4 : 5);

    const iOrigin = new Float32Array(N * 3);
    const iRight = new Float32Array(N * 3);
    const iUp = new Float32Array(N * 3);
    const iForward = new Float32Array(N * 3);
    const iLen = new Float32Array(N);
    const iRadius = new Float32Array(N);
    const iBend = new Float32Array(N * 3);
    const iDroop = new Float32Array(N);
    const iSeed = new Float32Array(N);
    const iHot = new Float32Array(N);

    for (let i = 0; i < N; i++) {
      const L = limbs[i];
      iOrigin[i * 3] = L.origin.x; iOrigin[i * 3 + 1] = L.origin.y; iOrigin[i * 3 + 2] = L.origin.z;
      iRight[i * 3] = L.right.x; iRight[i * 3 + 1] = L.right.y; iRight[i * 3 + 2] = L.right.z;
      iUp[i * 3] = L.up.x; iUp[i * 3 + 1] = L.up.y; iUp[i * 3 + 2] = L.up.z;
      iForward[i * 3] = L.forward.x; iForward[i * 3 + 1] = L.forward.y; iForward[i * 3 + 2] = L.forward.z;
      iLen[i] = L.len;
      iRadius[i] = L.radius;
      iBend[i * 3] = L.bend.x; iBend[i * 3 + 1] = L.bend.y; iBend[i * 3 + 2] = L.bend.z;
      iDroop[i] = L.droop;
      iSeed[i] = L.seed;
      iHot[i] = L.hot;
    }

    g.setAttribute("iOrigin", new THREE.InstancedBufferAttribute(iOrigin, 3));
    g.setAttribute("iRight", new THREE.InstancedBufferAttribute(iRight, 3));
    g.setAttribute("iUp", new THREE.InstancedBufferAttribute(iUp, 3));
    g.setAttribute("iForward", new THREE.InstancedBufferAttribute(iForward, 3));
    g.setAttribute("iLen", new THREE.InstancedBufferAttribute(iLen, 1));
    g.setAttribute("iRadius", new THREE.InstancedBufferAttribute(iRadius, 1));
    g.setAttribute("iBend", new THREE.InstancedBufferAttribute(iBend, 3));
    g.setAttribute("iDroop", new THREE.InstancedBufferAttribute(iDroop, 1));
    g.setAttribute("iSeed", new THREE.InstancedBufferAttribute(iSeed, 1));
    g.setAttribute("iHot", new THREE.InstancedBufferAttribute(iHot, 1));
    g.instanceCount = N;

    return g;
  }, [main, isMobile]);

  return <mesh geometry={geo} material={material} frustumCulled={false} />;
}

function BranchSparks({ main, count = 90 }: { main: THREE.CatmullRomCurve3; count?: number }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < count; i++) {
      const t = Math.random();
      const p = main.getPointAt(t);
      const tan = main.getTangentAt(t).normalize();
      const n = new THREE.Vector3().crossVectors(tan, up);
      if (n.lengthSq() < 1e-4) n.set(1, 0, 0);
      n.normalize();
      const b = new THREE.Vector3().crossVectors(tan, n).normalize();
      const a = Math.random() * Math.PI * 2;
      const r = 0.05 + Math.random() * 0.42;
      const off = n.clone().multiplyScalar(Math.cos(a) * r).add(b.clone().multiplyScalar(Math.sin(a) * r));
      const q = p.clone().add(off);
      positions[i * 3] = q.x; positions[i * 3 + 1] = q.y; positions[i * 3 + 2] = q.z;
    }
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [main, count]);

  // Static opacity — animation was invisible and cost a per-frame CPU write.
  return (
    <points geometry={geo}>
      <pointsMaterial
        size={0.11}
        sizeAttenuation
        color={new THREE.Color("#e8ff8a")}
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Spores({ count = 300 }: { count?: number }) {
  const { geo, mat } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5;
      seeds[i] = Math.random() * 100;
    }
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    const m = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        attribute float aSeed;
        uniform float uTime;
        void main() {
          vec3 p = position;
          p.y = mod(p.y + uTime * (0.4 + fract(aSeed) * 0.6) + 40.0, 80.0) - 40.0;
          p.x += sin(uTime * 0.3 + aSeed) * 0.3;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = 1.6 * (10.0 / -mv.z);
        }
      `,
      fragmentShader: `
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float a = smoothstep(0.5, 0.0, length(c)) * 0.55;
          gl_FragColor = vec4(0.85, 1.0, 0.6, a);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geo: g, mat: m };
  }, [count]);

  useFrame((_, dt) => { mat.uniforms.uTime.value += dt; });
  return <points geometry={geo} material={mat} />;
}

function Stars({ count = 220 }: { count?: number }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 2] = -22 - Math.random() * 22;
    }
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [count]);
  return (
    <points geometry={geo}>
      <pointsMaterial size={0.03} color="#b8d8a8" transparent opacity={0.35} depthWrite={false} />
    </points>
  );
}

function GLBBranch({
  url,
  material,
  scale = 1,
}: {
  url: string;
  material: THREE.ShaderMaterial;
  scale?: number;
}) {
  const { scene } = useGLTF(url);
  useMemo(() => {
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if ((mesh as unknown as { isMesh?: boolean }).isMesh) {
        const g = mesh.geometry as THREE.BufferGeometry;
        const n = g.attributes.position.count;
        if (!g.getAttribute("aSeed")) {
          const seeds = new Float32Array(n).fill(Math.random());
          const hots = new Float32Array(n).fill(0.1);
          g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
          g.setAttribute("aHot", new THREE.BufferAttribute(hots, 1));
        }
        mesh.material = material;
      }
    });
  }, [scene, material]);
  return <primitive object={scene} scale={scale} />;
}

function CameraRig({
  curve,
  scrollRef,
  mouseRef,
  velocityRef,
}: {
  curve: THREE.CatmullRomCurve3;
  scrollRef: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
  velocityRef?: React.MutableRefObject<number>;
}) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3());
  const smoothVel = useRef(0);
  useFrame((state, dt) => {
    const t = THREE.MathUtils.clamp(scrollRef.current, 0, 0.98);
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    const side = new THREE.Vector3(-tan.z, 0, tan.x).normalize().multiplyScalar(3.4);
    // Track the same envelope the audio uses (0..1 smoothed scroll velocity).
    const v = velocityRef ? velocityRef.current : 0;
    smoothVel.current = smoothVel.current * 0.88 + v * 0.12;
    const vel = smoothVel.current;
    // Camera dollies back + rises slightly as scroll speeds up (matches the whoosh swell).
    const dolly = new THREE.Vector3(0, 0.6 + vel * 0.45, 4.2 + vel * 1.8);
    const desired = p.clone().add(side).add(dolly);
    const time = state.clock.elapsedTime;
    desired.x += Math.sin(time * 0.5) * 0.05 + mouseRef.current.x * 0.25;
    desired.y += Math.cos(time * 0.4) * 0.05 + mouseRef.current.y * 0.15;
    // Ease factor eased by the same envelope — slow drift at rest, snappy at peak.
    const base = 0.001;
    const fast = 0.00002;
    const k = base * Math.pow(fast / base, Math.min(vel, 1));
    const lerpA = 1 - Math.pow(k, dt);
    camera.position.lerp(desired, lerpA);
    target.current.lerp(p, lerpA);
    camera.lookAt(target.current);
  });
  return null;
}

function SceneContent({
  scrollRef,
  velocityRef,
  glbUrl,
  hasGlb,
  isMobile,
}: {
  scrollRef: React.MutableRefObject<number>;
  velocityRef?: React.MutableRefObject<number>;
  glbUrl: string;
  hasGlb: boolean;
  isMobile: boolean;
}) {
  const curve = useBranchCurve();
  const mouseRef = useRef({ x: 0, y: 0 });
  const pulseRef = useRef(-1);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onDown = () => (pulseRef.current = 0);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);

  useFrame((_, dt) => {
    if (pulseRef.current >= 0) {
      pulseRef.current += dt * 0.6;
      if (pulseRef.current > 1.2) pulseRef.current = -1;
    }
  });

  const { merged, instanced } = useSharedFiberMaterials(pulseRef);

  return (
    <>
      <color attach="background" args={["#040604"]} />
      <fog attach="fog" args={["#040604", 8, 28]} />

      <Stars count={isMobile ? 120 : 220} />
      <Spores count={isMobile ? 150 : 320} />

      {hasGlb ? (
        <Suspense fallback={null}>
          <GLBBranch url={glbUrl} material={merged} />
        </Suspense>
      ) : (
        <>
          <TrunkAndRope main={curve} material={merged} isMobile={isMobile} />
          <InstancedLimbs main={curve} material={instanced} isMobile={isMobile} />
        </>
      )}
      <BranchSparks main={curve} count={isMobile ? 40 : 80} />

      <CameraRig curve={curve} scrollRef={scrollRef} mouseRef={mouseRef} velocityRef={velocityRef} />
    </>
  );
}

export function BranchScene({
  scrollRef,
  velocityRef,
  glbUrl = "/models/branch.glb",
}: {
  scrollRef: React.MutableRefObject<number>;
  velocityRef?: React.MutableRefObject<number>;
  glbUrl?: string;
}) {
  const [hasGlb, setHasGlb] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(glbUrl, { method: "HEAD" })
      .then((r) => { if (!cancelled && r.ok) setHasGlb(true); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [glbUrl]);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <Canvas
      className="!fixed inset-0 !h-screen !w-screen"
      style={{ position: "fixed" }}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      dpr={[1, isMobile ? 1 : 1.25]}
      camera={{ position: [0, 0, 6], fov: 42, near: 0.1, far: 80 }}
    >
      <SceneContent
        scrollRef={scrollRef}
        velocityRef={velocityRef}
        glbUrl={glbUrl}
        hasGlb={hasGlb}
        isMobile={isMobile}
      />
    </Canvas>
  );
}
