"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ANIMATION } from "@/lib/design-tokens";

/**
 * NetworkBackground Component - Black Hole Orchestration
 *
 * A visualization of the 7 largest known supermassive black holes:
 * 1. Phoenix A* - ~100 billion M☉ (ultramassive, Phoenix Cluster)
 * 2. TON 618 - ~40-66 billion M☉ (luminous quasar)
 * 3. Holmberg 15A* - ~40 billion M☉ (dormant, depleted core)
 * 4. NGC 4889 - ~21 billion M☉ (dormant, Coma Cluster)
 * 5. OJ 287 - ~18 billion M☉ (binary SMBH, blazar)
 * 6. M87* (Powehi) - ~6.5 billion M☉ (first imaged, iconic jet)
 * 7. Sagittarius A* - ~4 million M☉ (Milky Way center)
 *
 * Physics-based rendering using General Relativity equations:
 * - Schwarzschild radius, ISCO, photon sphere, ergosphere
 * - Kerr spin parameter affects jet formation and disk efficiency
 * - Blandford-Znajek mechanism for relativistic jets
 * - Keplerian orbital mechanics for accretion particles
 *
 * @component
 */

// ═══════════════════════════════════════════════════════════════════════════
// BLACK HOLE PHYSICS - Equations from General Relativity (simplified)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Schwarzschild Radius: Rs = 2GM/c²
 * For visualization, we normalize: Rs_visual = mass * scaleFactor
 * OPTIMIZED: Scale reduced for better viewport utilization and less overlap
 */
const schwarzschildRadius = (mass: number, scale: number = 0.025): number => mass * scale;

/**
 * Innermost Stable Circular Orbit (ISCO)
 * For non-rotating (Schwarzschild): ISCO = 3Rs
 * For maximally rotating (Kerr a=1): ISCO = 0.5Rs (prograde) to 4.5Rs (retrograde)
 *
 * Simplified: ISCO = Rs * (3 - 2.5 * spin) for prograde orbits
 * spin ∈ [0, 1] where 0 = non-rotating, 1 = maximally rotating
 */
const iscoRadius = (rs: number, spin: number): number => rs * (3 - 2.5 * Math.min(spin, 0.99));

/**
 * Photon Sphere Radius: Rph = 1.5Rs (Schwarzschild)
 * For Kerr: varies from 1-2Rs based on spin and orbit direction
 */
const photonSphereRadius = (rs: number, spin: number): number => rs * (1.5 - 0.5 * spin);

/**
 * Ergosphere outer boundary (equatorial): Re = Rs (for Schwarzschild)
 * For Kerr: Re = Rs * (1 + sqrt(1 - spin² * cos²θ)) at angle θ
 */
const ergosphereRadius = (rs: number, spin: number): number => rs * (1 + Math.sqrt(1 - spin * spin * 0.5));

/**
 * Accretion disk luminosity (simplified Stefan-Boltzmann)
 * L ∝ accretionRate * mass * spin (more spin = more efficient)
 * Efficiency η = 1 - sqrt(1 - (2/(3*risco/rs)))
 */
const diskLuminosity = (accretionRate: number, spin: number): number => {
  const efficiency = 0.06 + 0.36 * spin; // 6% (Schwarzschild) to 42% (max Kerr)
  return accretionRate * efficiency;
};

/**
 * Relativistic jet power (Blandford-Znajek mechanism)
 * P_jet ∝ B² * Rs² * spin²
 * Simplified: jets only significant for spin > 0.5
 */
const jetPower = (spin: number): number => Math.max(0, spin - 0.3) * spin;

// ═══════════════════════════════════════════════════════════════════════════
// VISUALIZATION CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Mobile-first optimization constants
 * - Reduced particle counts for better GPU performance
 * - Smaller orbit radii to prevent edge clipping
 * - Optimized for 60fps on mid-range mobile devices
 */
const PHYSICS = {
  // Central black hole orbital parameters (smaller radius to stay in view)
  centralOrbit: {
    radiusX: 0.2,
    radiusY: 0.12,
    period: 60,              // Slower, more majestic
    tilt: 0.08,
  },
  // Group rotation (subtle celestial drift)
  groupRotation: {
    ySpeed: 0.02,            // Slower rotation
    xAmplitude: 0.04,
    xFrequency: 0.01,
  },
  // Accretion disk particles (reduced for mobile performance)
  particles: {
    countPerNode: 16,        // Was 32, reduced 50% for mobile
    speed: 0.25,
    fade: 0.4,
  },
  // Relativistic jet parameters (simplified)
  jets: {
    particleCount: 16,        // Reduced 50% for mobile
    speed: 0.6,
    length: 1.8,             // Shorter jets to prevent overlap
    spread: 0.12,
  },
  // Depth-based transparency (subtler for cleaner look)
  depth: {
    nearOpacity: 0.5,
    farOpacity: 0.12,
    maxZ: 4,                 // More depth range
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// BLACK HOLE NODE INTERFACE - Physics-based properties
// ═══════════════════════════════════════════════════════════════════════════

interface BlackHoleNode {
  name: string;                              // Identifier for the black hole
  basePosition: [number, number, number];    // Position in space
  color: string;                             // Theme color (computed)

  // === PHYSICAL PROPERTIES (from General Relativity) ===
  mass: number;                              // Solar masses (normalized 1-10)
  spin: number;                              // Kerr parameter a ∈ [0, 1]
  accretionRate: number;                     // Mass inflow rate (0-1)

  // === ORIENTATION ===
  inclination: number;                       // Viewing angle (0 = face-on, π/2 = edge-on)
  axisRotation: [number, number, number];    // Euler angles for rotation axis

  // === DERIVED VISUAL PROPERTIES ===
  depth: number;                             // Z-depth for parallax (-1 to 1)
  hasJets: boolean;                          // Whether jets are visible (spin > 0.5)
}

/**
 * Compute derived visual properties from physics
 * @param scale - Optional scale factor (responsive to viewport size)
 */
function computeBlackHoleVisuals(node: BlackHoleNode, scale?: number) {
  const rs = schwarzschildRadius(node.mass, scale);
  const isco = iscoRadius(rs, node.spin);
  const photonSphere = photonSphereRadius(rs, node.spin);
  const ergosphere = ergosphereRadius(rs, node.spin);
  const luminosity = diskLuminosity(node.accretionRate, node.spin);
  const jetStrength = jetPower(node.spin);

  return {
    eventHorizonSize: rs,
    photonSphereSize: photonSphere,
    ergosphereSize: ergosphere,
    iscoSize: isco,
    diskLuminosity: luminosity,
    jetIntensity: jetStrength,
    // Rotation period: T ∝ M (more massive = slower rotation appearance)
    rotationPeriod: 10 / Math.sqrt(node.mass),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// THEME COLOR DETECTION
// ═══════════════════════════════════════════════════════════════════════════

const getThemeColor = (): string => {
  if (typeof document === 'undefined') return '#a1a1aa';
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? '#e4e4e7' : '#3f3f46';
};

const getAccentColor = (): string => {
  if (typeof document === 'undefined') return '#a1a1aa';
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? '#d4d4d8' : '#71717a'; // Monochrome for accretion glow
};

const getJetColor = (): string => {
  if (typeof document === 'undefined') return '#a1a1aa';
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? '#d4d4d8' : '#71717a'; // Monochrome for relativistic jets
};

// ═══════════════════════════════════════════════════════════════════════════
// SINGLE BLACK HOLE COMPONENT - Physics-based rendering
// ═══════════════════════════════════════════════════════════════════════════

interface BlackHoleProps {
  node: BlackHoleNode;
  position: THREE.Vector3;
  themeColor: string;
  accentColor: string;
  jetColor: string;
  elapsedTime: number;
  scaleFactor: number;
}

function BlackHole({ node, position, themeColor, accentColor, jetColor, elapsedTime, scaleFactor }: BlackHoleProps) {
  const meshRef = useRef<THREE.Group>(null);

  // Compute physics-based visual properties with responsive scale
  const visuals = useMemo(() => computeBlackHoleVisuals(node, scaleFactor), [node, scaleFactor]);

  // Calculate depth-based opacity for parallax effect
  const depthOpacity = useMemo(() => {
    const normalizedDepth = (node.depth + 1) / 2;
    return THREE.MathUtils.lerp(
      PHYSICS.depth.farOpacity,
      PHYSICS.depth.nearOpacity,
      1 - normalizedDepth
    );
  }, [node.depth]);

  // Rotation animation - physics-based period
  useFrame(() => {
    if (meshRef.current) {
      // Frame dragging effect: faster rotation near event horizon
      const angularVelocity = 1 / visuals.rotationPeriod;
      meshRef.current.rotation.y = elapsedTime * angularVelocity * (1 + node.spin * 0.5);
    }
  });

  return (
    <group ref={meshRef} position={position} rotation={node.axisRotation}>
      {/* EVENT HORIZON - The point of no return (Schwarzschild radius)
          Low poly: 6 segments for geometric appearance */}
      <mesh renderOrder={1}>
        <sphereGeometry args={[visuals.eventHorizonSize, 6, 6]} />
        <meshBasicMaterial
          color={themeColor}
          transparent
          opacity={depthOpacity * 0.7}
          depthWrite={false}
          flatShading
        />
      </mesh>

      {/* PHOTON SPHERE - Where light orbits (1.5 Rs) 
          Low poly: 5 segments for geometric appearance */}
      <mesh renderOrder={2}>
        <sphereGeometry args={[visuals.photonSphereSize, 5, 5]} />
        <meshBasicMaterial
          color={themeColor}
          transparent
          opacity={depthOpacity * 0.45}
          depthWrite={false}
          flatShading
        />
      </mesh>

      {/* ERGOSPHERE - Frame-dragging region (only for high-spin black holes)
          Low poly: 4 segments for geometric appearance */}
      {node.spin > 0.4 && (
        <mesh renderOrder={3}>
          <sphereGeometry args={[visuals.ergosphereSize, 4, 4]} />
          <meshBasicMaterial
            color={accentColor}
            transparent
            opacity={depthOpacity * 0.12 * node.spin}
            depthWrite={false}
            flatShading
          />
        </mesh>
      )}

      {/* ACCRETION DISK - Flattened torus at ISCO
          Low poly: 3 radial segments, 8 tubular for geometric appearance */}
      {node.accretionRate > 0.3 && (
        <mesh rotation={[Math.PI / 2 - node.inclination, 0, 0]} renderOrder={4}>
          <torusGeometry
            args={[visuals.iscoSize * 1.5, visuals.iscoSize * 0.15, 3, 8]}
          />
          <meshBasicMaterial
            color={themeColor}
            transparent
            opacity={depthOpacity * 0.25 * node.accretionRate}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* RELATIVISTIC JETS - Blandford-Znajek mechanism
          Low poly: 4 segments for geometric appearance */}
      {node.hasJets && node.spin > 0.6 && visuals.jetIntensity > 0.15 && (
        <>
          {/* Upper jet (north pole) */}
          <mesh position={[0, visuals.eventHorizonSize * 1.5, 0]} renderOrder={5}>
            <coneGeometry
              args={[
                visuals.eventHorizonSize * 0.2,
                visuals.eventHorizonSize * PHYSICS.jets.length,
                4,
              ]}
            />
            <meshBasicMaterial
              color={jetColor}
              transparent
              opacity={depthOpacity * 0.2 * visuals.jetIntensity}
              depthWrite={false}
              flatShading
            />
          </mesh>
          {/* Lower jet (south pole) */}
          <mesh
            position={[0, -visuals.eventHorizonSize * 1.5, 0]}
            rotation={[Math.PI, 0, 0]}
            renderOrder={5}
          >
            <coneGeometry
              args={[
                visuals.eventHorizonSize * 0.2,
                visuals.eventHorizonSize * PHYSICS.jets.length,
                4,
              ]}
            />
            <meshBasicMaterial
              color={jetColor}
              transparent
              opacity={depthOpacity * 0.2 * visuals.jetIntensity}
              depthWrite={false}
              flatShading
            />
          </mesh>
        </>
      )}

      {/* GRAVITATIONAL LENSING HALO - Outermost visible influence
          Low poly: 4 segments for geometric appearance */}
      <mesh renderOrder={0}>
        <sphereGeometry args={[visuals.ergosphereSize * 1.2, 4, 4]} />
        <meshBasicMaterial
          color={themeColor}
          transparent
          opacity={depthOpacity * .05}
          depthWrite={false}
          flatShading
        />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PARTICLE SYSTEM - Physics-based Accretion Disk Orbits
// ═══════════════════════════════════════════════════════════════════════════

interface ParticleSystemProps {
  nodes: BlackHoleNode[];
  positions: THREE.Vector3[];
  themeColor: string;
  elapsedTime: number;
  scaleFactor: number;
}

function ParticleSystem({ nodes, positions, themeColor, elapsedTime, scaleFactor }: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const { particleGeometry } = useMemo(() => {
    const count = nodes.length * PHYSICS.particles.countPerNode;
    const posArray = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    let idx = 0;
    nodes.forEach((node) => {
      const visuals = computeBlackHoleVisuals(node, scaleFactor);

      for (let i = 0; i < PHYSICS.particles.countPerNode; i++) {
        // Particles orbit between ISCO and outer disk edge
        const angle = (i / PHYSICS.particles.countPerNode) * Math.PI * 2;
        // Keplerian orbit: inner particles closer, outer farther
        const orbitRadius = visuals.iscoSize * (1.2 + (i % 4) * 0.4);

        posArray[idx * 3] = Math.cos(angle) * orbitRadius;
        posArray[idx * 3 + 1] = (Math.random() - 0.5) * visuals.eventHorizonSize * 0.2;
        posArray[idx * 3 + 2] = Math.sin(angle) * orbitRadius;

        // Size based on distance from center (relativistic beaming effect)
        sizes[idx] = visuals.eventHorizonSize * 0.06 * (0.6 + Math.random() * 0.4);

        idx++;
      }
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    return { particleGeometry: geometry };
  }, [nodes, scaleFactor]);

  // Animate with Keplerian orbital mechanics: v ∝ 1/√r
  useFrame(() => {
    if (pointsRef.current && particleGeometry) {
      const positionAttr = particleGeometry.getAttribute('position') as THREE.BufferAttribute;
      const posArray = positionAttr.array as Float32Array;

      let idx = 0;
      nodes.forEach((node, nodeIdx) => {
        const nodePos = positions[nodeIdx];
        const visuals = computeBlackHoleVisuals(node, scaleFactor);
        // Base angular velocity from physics
        const baseOmega = PHYSICS.particles.speed / Math.sqrt(node.mass);

        for (let i = 0; i < PHYSICS.particles.countPerNode; i++) {
          const orbitRadius = visuals.iscoSize * (1.2 + (i % 4) * 0.4);
          // Kepler's 3rd law: ω ∝ r^(-3/2)
          const keplerianOmega = baseOmega * Math.pow(visuals.iscoSize / orbitRadius, 1.5);

          const baseAngle = (i / PHYSICS.particles.countPerNode) * Math.PI * 2;
          const currentAngle = baseAngle + elapsedTime * keplerianOmega;

          // Apply inclination to orbit plane
          const cosInc = Math.cos(node.inclination);
          const sinInc = Math.sin(node.inclination);

          const localX = Math.cos(currentAngle) * orbitRadius;
          const localY = Math.sin(currentAngle) * orbitRadius * sinInc;
          const localZ = Math.sin(currentAngle) * orbitRadius * cosInc;

          posArray[idx * 3] = nodePos.x + localX;
          posArray[idx * 3 + 1] = nodePos.y + localY;
          posArray[idx * 3 + 2] = nodePos.z + localZ;

          idx++;
        }
      });

      positionAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef} geometry={particleGeometry}>
      <pointsMaterial
        color={themeColor}
        size={0.025}
        transparent
        opacity={0.45}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CONNECTION LINES - Gravitational bonds between black holes
// ═══════════════════════════════════════════════════════════════════════════

interface ConnectionLinesProps {
  nodes: BlackHoleNode[];
  positions: THREE.Vector3[];
  themeColor: string;
  scaleFactor: number;
}

function ConnectionLines({ nodes, positions, themeColor, scaleFactor }: ConnectionLinesProps) {
  const lines = useMemo(() => {
    const result: { start: THREE.Vector3; end: THREE.Vector3; opacity: number }[] = [];

    // Connect all nodes to central node (index 0)
    const centralPos = positions[0];
    const centralVisuals = computeBlackHoleVisuals(nodes[0], scaleFactor);
    const centralRadius = centralVisuals.ergosphereSize;

    for (let i = 1; i < nodes.length; i++) {
      const nodePos = positions[i];
      const nodeVisuals = computeBlackHoleVisuals(nodes[i], scaleFactor);
      const nodeRadius = nodeVisuals.ergosphereSize;

      // Calculate direction vector
      const direction = new THREE.Vector3().subVectors(nodePos, centralPos).normalize();

      // Line starts at central node's ergosphere edge
      const start = new THREE.Vector3().addVectors(
        centralPos,
        direction.clone().multiplyScalar(centralRadius * 1.2)
      );

      // Line ends at target node's ergosphere edge
      const end = new THREE.Vector3().subVectors(
        nodePos,
        direction.clone().multiplyScalar(nodeRadius * 1.2)
      );

      // Opacity based on combined gravitational influence
      const avgDepth = (nodes[0].depth + nodes[i].depth) / 2;
      const opacity = 0.07 + (1 - Math.abs(avgDepth)) * 0.07;

      result.push({ start, end, opacity });
    }

    return result;
  }, [nodes, positions, scaleFactor]);

  return (
    <>
      {lines.map((line, i) => {
        const geometry = new THREE.BufferGeometry().setFromPoints([line.start, line.end]);
        return (
          <primitive
            key={`line-${i}`}
            object={new THREE.Line(
              geometry,
              new THREE.LineBasicMaterial({
                color: themeColor,
                opacity: line.opacity,
                transparent: true,
              })
            )}
          />
        );
      })}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN NETWORK NODES COMPONENT - Orchestrating the black hole ballet
// ═══════════════════════════════════════════════════════════════════════════

function NetworkNodes() {
  const groupRef = useRef<THREE.Group>(null);
  const [themeColor, setThemeColor] = useState('#171717');
  const [accentColor, setAccentColor] = useState('#6366f1');
  const [jetColor, setJetColor] = useState('#60a5fa');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [scaleFactor, setScaleFactor] = useState(0.04);

  // Update scale factor based on viewport size
  useEffect(() => {
    const updateScale = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScaleFactor(0.04);  // Mobile: base scale
      } else if (width < 1024) {
        setScaleFactor(0.05);  // Tablet: +25% larger
      } else {
        setScaleFactor(0.06);  // Desktop: +50% larger
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Update colors on mount and theme changes
  useEffect(() => {
    const updateColors = () => {
      setThemeColor(getThemeColor());
      setAccentColor(getAccentColor());
      setJetColor(getJetColor());
    };

    updateColors();

    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  /**
   * TOP 7 LARGEST KNOWN SUPERMASSIVE BLACK HOLES
   * Data from Wikipedia's List of Most Massive Black Holes (December 2025)
   *
   * Visual mass is logarithmically scaled for rendering:
   * - Phoenix A* (100B M☉) → mass: 6.0
   * - Sag A* (4M M☉) → mass: 2.0
   *
   * Physical properties derived from observational data:
   * - spin: Active quasars have high spin (>0.7), dormant cores low (<0.3)
   * - accretionRate: Luminous quasars high (>0.8), dormant very low (<0.2)
   * - hasJets: Based on observed relativistic jet activity
   */
  const blackHoles: BlackHoleNode[] = useMemo(() => [
    // 1. PHOENIX A* - Central anchor (LARGEST KNOWN: ~100 billion M☉)
    // Located in Phoenix Cluster, ~5.8 billion ly away
    // Ultramassive black hole powering central cluster galaxy
    {
      name: 'PhoenixA',
      basePosition: [1.98, 0.72, 0.54],
      color: themeColor,
      mass: 18.0,                           // ~100 billion solar masses
      spin: 0.75,                          // Active nucleus implies high spin
      accretionRate: 0.65,                 // Moderate-high (cooling flow cluster)
      inclination: Math.PI * 0.15,
      axisRotation: [0, 0, 0.1],
      depth: 0.25,
      hasJets: true,                       // Radio jets observed
    },
    // 2. TON 618 - Upper left, forward (~40-66 billion M☉)
    // One of most luminous quasars known, ~10.4 billion ly away
    // Extreme accretion, powerful relativistic jets
    {
      name: 'TON618',
      basePosition: [-2.41, 2.38, 3.12],
      color: themeColor,
      mass: 16.5,                           // ~40-66 billion solar masses
      spin: 0.92,                          // Very high spin (extreme luminosity)
      accretionRate: 0.95,                 // Near-Eddington accretion
      inclination: Math.PI * 0.1,          // Nearly face-on (quasar)
      axisRotation: [0.1, 0.08, -0.15],
      depth: 0.85,
      hasJets: true,                       // Powerful quasar jets
    },
    // 3. HOLMBERG 15A* - Upper right, far back (~40 billion M☉)
    // Dormant SMBH in depleted-core elliptical galaxy, ~700 Mly away
    // One of largest directly measured, unusually large for its galaxy
    {
      name: 'Holm15A',
      basePosition: [-2.98, 2.52, -2.25],
      color: themeColor,
      mass: 10.0,                           // ~40 billion solar masses
      spin: 0.15,                          // Low spin (dormant)
      accretionRate: 0.08,                 // Very low (dormant core)
      inclination: Math.PI * 0.25,
      axisRotation: [0.2, 0.15, 0],
      depth: -0.7,
      hasJets: false,                      // No active jets (dormant)
    },
    // 4. NGC 4889 - Far right (~21 billion M☉)
    // Dormant SMBH in Coma Cluster, ~300 Mly away
    // Largest event horizon of any dormant SMBH
    {
      name: 'NGC4889',
      basePosition: [3.22, -0.68, -0.35],
      color: themeColor,
      mass: 5.25,                           // ~21 billion solar masses
      spin: 0.2,                           // Low spin (dormant)
      accretionRate: 0.05,                 // Minimal (dormant)
      inclination: Math.PI * 0.35,
      axisRotation: [0.08, -0.2, 0.15],
      depth: -0.15,
      hasJets: false,                      // No active jets
    },
    // 5. OJ 287 - Top center, far back (~18 billion M☉ primary)
    // Binary SMBH system, ~3.5 billion ly away
    // Famous for quasi-periodic optical outbursts every ~12 years
    {
      name: 'OJ287',
      basePosition: [-0.84, 2.86, -3.02],
      color: themeColor,
      mass: 4.5,                           // ~18 billion solar masses (primary)
      spin: 0.85,                          // High spin (blazar)
      accretionRate: 0.7,                  // Variable (binary interaction)
      inclination: Math.PI * 0.05,         // Nearly aligned (blazar)
      axisRotation: [-0.3, 0.15, 0.2],
      depth: -0.9,
      hasJets: true,                       // Relativistic blazar jet
    },
    // 6. M87* (POWEHI) - Lower left, forward (~6.5 billion M☉)
    // FIRST BLACK HOLE EVER IMAGED (EHT 2019), ~55 Mly away
    // Famous 5000 ly relativistic jet, spin measured at ~0.9
    {
      name: 'M87',
      basePosition: [-2.57, -1.59, 2.22],
      color: themeColor,
      mass: 4.0,                           // ~6.5 billion solar masses (scaled up 2x)
      spin: 0.9,                           // Measured via jet analysis
      accretionRate: 0.55,                 // Moderate (LLAGN)
      inclination: Math.PI * 0.18,         // ~17° from face-on
      axisRotation: [-0.15, 0.3, 0.08],
      depth: 0.6,
      hasJets: true,                       // Iconic relativistic jet
    },
    // 7. SAGITTARIUS A* - Lower center (~4 million M☉)
    // OUR MILKY WAY'S CENTER, imaged by EHT 2022
    // Smallest of the group but closest (~26,000 ly)
    // Relatively quiescent with occasional flares
    {
      name: 'SagA',
      basePosition: [-0.53, -2.57, 0.56],
      color: themeColor,
      mass: 3.0,                           // ~4 million solar masses (scaled up 2x)
      spin: 0.5,                           // Moderate spin (estimated)
      accretionRate: 0.15,                 // Low (quiescent)
      inclination: Math.PI * 0.22,
      axisRotation: [0.18, -0.18, 0.18],
      depth: 0.15,
      hasJets: false,                      // No persistent jets
    },
  ], [themeColor]);

  // Calculate current positions (central node orbits, others relative)
  const [currentPositions, setCurrentPositions] = useState<THREE.Vector3[]>([]);

  // Animation frame: group rotation + central node orbit
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    setElapsedTime(elapsed);

    if (groupRef.current) {
      // Majestic group rotation
      groupRef.current.rotation.y = elapsed * PHYSICS.groupRotation.ySpeed;
      groupRef.current.rotation.x = Math.sin(elapsed * PHYSICS.groupRotation.xFrequency) * PHYSICS.groupRotation.xAmplitude;
    }

    // Calculate current positions with central node orbital motion
    const newPositions = blackHoles.map((node, idx) => {
      if (idx === 0) {
        // Central black hole follows elliptical orbit
        const orbitAngle = (elapsed / PHYSICS.centralOrbit.period) * Math.PI * 2;
        return new THREE.Vector3(
          node.basePosition[0] + Math.cos(orbitAngle) * PHYSICS.centralOrbit.radiusX,
          node.basePosition[1] + Math.sin(orbitAngle * 0.7) * PHYSICS.centralOrbit.radiusY,
          node.basePosition[2] + Math.sin(orbitAngle * 1.3) * PHYSICS.centralOrbit.tilt
        );
      }
      return new THREE.Vector3(...node.basePosition);
    });

    setCurrentPositions(newPositions);
  });

  // Wait for positions to be calculated
  if (currentPositions.length === 0) {
    return null;
  }

  return (
    <group ref={groupRef}>
      {/* Render each black hole with its physics-based structure */}
      {blackHoles.map((node, i) => (
        <BlackHole
          key={`blackhole-${node.name}`}
          node={node}
          position={currentPositions[i]}
          themeColor={themeColor}
          accentColor={accentColor}
          jetColor={jetColor}
          elapsedTime={elapsedTime}
          scaleFactor={scaleFactor}
        />
      ))}

      {/* Connection lines terminating at event horizons */}
      <ConnectionLines
        nodes={blackHoles}
        positions={currentPositions}
        themeColor={themeColor}
        scaleFactor={scaleFactor}
      />

      {/* Particle system - accretion disks around each black hole */}
      <ParticleSystem
        nodes={blackHoles}
        positions={currentPositions}
        themeColor={themeColor}
        elapsedTime={elapsedTime}
        scaleFactor={scaleFactor}
      />
    </group>
  );
}

export function NetworkBackground() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport and fade in on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const timer = setTimeout(() => setIsVisible(true), 150);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Responsive camera settings
  // Mobile: farther back (12), wider FOV (60) to see more
  // Desktop: closer (10), narrower FOV (50) for detail
  const cameraZ = isMobile ? 14 : 11;
  const cameraFov = isMobile ? 65 : 55;

  return (
    <div
      className={`absolute inset-0 pointer-events-none transition-opacity ${ANIMATION.duration.slow} ease-out`}
      style={{
        height: '100%',
        width: '100%',
        zIndex: 0,
        opacity: isVisible ? 0.65 : 0,  // Increased from 0.5 for better visibility
      }}
    >
      <Suspense fallback={<div className="absolute inset-0 bg-linear-to-br from-foreground/5 via-foreground/3 to-foreground/5" />}>
        <Canvas
          camera={{ position: [0, 0, cameraZ], fov: cameraFov }}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: 'low-power',  // Mobile battery optimization
          }}
          dpr={isMobile ? 1 : [1, 1.5]}    // Single DPR on mobile for performance
          style={{ width: '100%', height: '100%', position: 'relative' }}
        >
          {/* Simplified lighting for mobile performance */}
          <ambientLight intensity={0.6} />
          {!isMobile && <pointLight position={[10, 10, 10]} intensity={0.5} />}
          <NetworkNodes />
        </Canvas>
      </Suspense>
    </div>
  );
}
