"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

export default function FloatingGeometry() {
  const { size } = useThree();
  const isMobile = size.width < 768;

  const cubeRef = useRef<THREE.Mesh>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const diamondRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    // Cube rotates on all axes — server spinning up
    if (cubeRef.current) {
      cubeRef.current.rotation.x += delta * 0.14;
      cubeRef.current.rotation.y += delta * 0.10;
    }
    // Sphere slow Y rotation — globe turning
    if (sphereRef.current) {
      sphereRef.current.rotation.y += delta * 0.07;
    }
    // Diamond tilts gently — precision gem
    if (diamondRef.current) {
      diamondRef.current.rotation.y += delta * 0.09;
      diamondRef.current.rotation.z += delta * 0.03;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#6366f1" />
      <pointLight position={[-5, -3, 3]} intensity={0.6} color="#3b82f6" />

      {/* Server / Container — wireframe cube */}
      <Float speed={1.3} rotationIntensity={0.3} floatIntensity={0.7}>
        <mesh
          ref={cubeRef}
          position={[isMobile ? 1.8 : 2.8, 0.5, -1]}
          scale={isMobile ? 0.65 : 1.05}
        >
          <boxGeometry args={[1.3, 1.3, 1.3]} />
          <meshStandardMaterial
            color="#6366f1"
            wireframe
            transparent
            opacity={0.38}
          />
        </mesh>
      </Float>

      {/* Cloud / Internet — distorted metallic sphere */}
      <Float speed={1.9} rotationIntensity={0.25} floatIntensity={1.1}>
        <mesh
          ref={sphereRef}
          position={[isMobile ? -1.8 : -3, -0.5, -2]}
          scale={isMobile ? 0.85 : 1.35}
        >
          <sphereGeometry args={[0.9, isMobile ? 16 : 32, isMobile ? 16 : 32]} />
          <MeshDistortMaterial
            color="#3b82f6"
            distort={isMobile ? 0.18 : 0.32}
            speed={isMobile ? 0.9 : 1.6}
            roughness={0.08}
            metalness={0.85}
            transparent
            opacity={0.52}
          />
        </mesh>
      </Float>

      {/* Diamond / Precision — wireframe octahedron (React logo shape) */}
      <Float speed={2.6} rotationIntensity={0.7} floatIntensity={0.55}>
        <mesh
          ref={diamondRef}
          position={[-1.5, isMobile ? 1.8 : 2.5, -3]}
          scale={isMobile ? 0.45 : 0.68}
        >
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#a78bfa"
            wireframe
            transparent
            opacity={0.48}
          />
        </mesh>
      </Float>
    </>
  );
}
