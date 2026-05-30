"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

const rotA = new THREE.Euler();
const rotB = new THREE.Euler();
const rotC = new THREE.Euler();

export default function FloatingGeometry() {
  const { size } = useThree();
  const isMobile = size.width < 768;

  const torusKnotRef = useRef<THREE.Mesh>(null);
  const icoRef = useRef<THREE.Mesh>(null);
  const torusRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (torusKnotRef.current) {
      torusKnotRef.current.rotation.x += delta * 0.12;
      torusKnotRef.current.rotation.y += delta * 0.08;
    }
    if (icoRef.current) {
      icoRef.current.rotation.y += delta * 0.06;
    }
    if (torusRef.current) {
      torusRef.current.rotation.x -= delta * 0.2;
      torusRef.current.rotation.z += delta * 0.1;
    }
  });

  const scale = isMobile ? 0.7 : 1.1;
  const icoScale = isMobile ? 0.9 : 1.4;
  const torusSmallScale = isMobile ? 0.4 : 0.6;

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#6366f1" />
      <pointLight position={[-5, -3, 3]} intensity={0.6} color="#3b82f6" />

      {/* Torus Knot */}
      <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.8}>
        <mesh ref={torusKnotRef} position={[isMobile ? 1.8 : 2.8, 0.5, -1]} scale={scale}>
          <torusKnotGeometry args={[0.7, 0.22, isMobile ? 48 : 100, isMobile ? 8 : 14]} />
          <meshStandardMaterial color="#6366f1" wireframe transparent opacity={0.35} />
        </mesh>
      </Float>

      {/* Glassy Icosahedron */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={1.2}>
        <mesh ref={icoRef} position={[isMobile ? -1.8 : -3, -0.5, -2]} scale={icoScale}>
          <icosahedronGeometry args={[0.9, isMobile ? 0 : 1]} />
          <MeshDistortMaterial
            color="#3b82f6"
            distort={isMobile ? 0.2 : 0.35}
            speed={isMobile ? 0.8 : 1.5}
            roughness={0.1}
            metalness={0.8}
            transparent
            opacity={0.55}
          />
        </mesh>
      </Float>

      {/* Small Torus */}
      <Float speed={3} rotationIntensity={1} floatIntensity={0.6}>
        <mesh ref={torusRef} position={[-1.5, isMobile ? 1.8 : 2.5, -3]} scale={torusSmallScale}>
          <torusGeometry args={[0.8, 0.25, 12, isMobile ? 24 : 40]} />
          <meshStandardMaterial color="#a78bfa" wireframe transparent opacity={0.4} />
        </mesh>
      </Float>
    </>
  );
}
