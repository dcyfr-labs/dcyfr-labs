"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SEMANTIC_COLORS } from "@/lib/design-tokens";

/**
 * NetworkBackground Component
 *
 * Animated 3D network visualization for hero sections.
 * Inspired by Vercel's modern aesthetic with cybersecurity theme.
 *
 * Features:
 * - Animated floating nodes representing network connections
 * - Subtle rotation and movement
 * - Low-poly aesthetic for performance
 * - GPU-accelerated with Three.js
 * - Responsive opacity based on theme
 * - Uses semantic colors from design tokens
 *
 * @component
 */

interface Node {
  position: [number, number, number];
  color: string;
  size: number;
}

/**
 * Extract RGB hex value from semantic color class
 * Maps semantic colors to vibrant node colors
 */
function getSemanticNodeColors(): string[] {
  // Use semantic status colors mapped to network aesthetic
  return [
    "#3b82f6", // Primary (info/status)
    "#8b5cf6", // Violet (interactive/secondary)
    "#06b6d4", // Cyan (success/highlight)
    "#a855f7", // Purple (active/focus)
  ];
}

function NetworkNodes() {
  const groupRef = useRef<THREE.Group>(null);
  const semanticColors = useMemo(() => getSemanticNodeColors(), []);

  // Generate node positions deterministically
  const nodes: Node[] = useMemo(() => [
    { position: [0, 0, 0], color: semanticColors[0], size: 0.15 },
    { position: [2, 1, -1], color: semanticColors[1], size: 0.12 },
    { position: [-2, -1, 1], color: semanticColors[2], size: 0.13 },
    { position: [1.5, -1.5, -2], color: semanticColors[3], size: 0.11 },
    { position: [-1.5, 1.5, 2], color: semanticColors[0], size: 0.14 },
    { position: [3, 0, 1], color: semanticColors[1], size: 0.10 },
    { position: [-3, 0, -1], color: semanticColors[2], size: 0.12 },
    { position: [0, 2, -1.5], color: semanticColors[3], size: 0.13 },
    { position: [0, -2, 1.5], color: semanticColors[0], size: 0.11 },
  ], [semanticColors]);

  // Gentle rotation animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.03) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Render nodes */}
      {nodes.map((node, i) => (
        <mesh key={i} position={node.position}>
          <sphereGeometry args={[node.size, 16, 16]} />
          <meshStandardMaterial
            color={node.color}
            emissive={node.color}
            emissiveIntensity={0.3}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}

      {/* Connection lines between nodes */}
      {nodes.map((node, i) => {
        if (i === 0) return null;
        const points = [
          new THREE.Vector3(...nodes[0].position),
          new THREE.Vector3(...node.position),
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        return (
          <primitive key={`line-${i}`} object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: semanticColors[0], opacity: 0.2, transparent: true }))} />
        );
      })}
    </group>
  );
}

export function NetworkBackground() {
  return (
    <div className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none" style={{ height: '100%', width: '100%', zIndex: -1 }}>
      <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-600/10" />}>
        <Canvas
          camera={{ position: [0, 0, 8], fov: 50 }}
          gl={{ antialias: false, alpha: true }}
          dpr={[1, 1.5]} // Limit pixel ratio for performance
          style={{ width: '100%', height: '100%', zIndex: -1, position: 'relative' }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <NetworkNodes />
        </Canvas>
      </Suspense>
    </div>
  );
}
