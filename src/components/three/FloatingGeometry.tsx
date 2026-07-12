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
  const dumbbellRef = useRef<THREE.Group>(null);
  const trackRef = useRef<THREE.Mesh>(null);

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
    // Dumbbell rolls slowly — weight training rep
    if (dumbbellRef.current) {
      dumbbellRef.current.rotation.z += delta * 0.12;
    }
    // Track loop spins flat — running lap
    if (trackRef.current) {
      trackRef.current.rotation.z += delta * 0.08;
    }
  });

  // All shapes are pinned to the viewport edges/corners, well clear of the
  // centered text/CTA column, since this canvas is a fixed full-screen
  // backdrop shared by every section (not just the hero).
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#6366f1" />
      <pointLight position={[-5, -3, 3]} intensity={0.6} color="#3b82f6" />

      {/* Server / Container — wireframe cube, top-right corner */}
      <Float speed={1.3} rotationIntensity={0.3} floatIntensity={0.7}>
        <mesh
          ref={cubeRef}
          position={[isMobile ? 2.6 : 4.7, isMobile ? 3.2 : 3.7, -3]}
          scale={isMobile ? 0.5 : 0.85}
        >
          <boxGeometry args={[1.3, 1.3, 1.3]} />
          <meshStandardMaterial
            color="#6366f1"
            wireframe
            transparent
            opacity={0.35}
          />
        </mesh>
      </Float>

      {/* Cloud / Internet — distorted sphere, bottom-left corner, toned down */}
      <Float speed={1.9} rotationIntensity={0.25} floatIntensity={1.1}>
        <mesh
          ref={sphereRef}
          position={[isMobile ? -2.6 : -4.6, isMobile ? -3.2 : -2.8, -4]}
          scale={isMobile ? 0.55 : 0.9}
        >
          <sphereGeometry args={[0.9, isMobile ? 16 : 32, isMobile ? 16 : 32]} />
          <MeshDistortMaterial
            color="#3b82f6"
            distort={isMobile ? 0.18 : 0.32}
            speed={isMobile ? 0.9 : 1.6}
            roughness={0.35}
            metalness={0.4}
            transparent
            opacity={0.3}
          />
        </mesh>
      </Float>

      {/* Diamond / Precision — wireframe octahedron, top-left corner */}
      <Float speed={2.6} rotationIntensity={0.7} floatIntensity={0.55}>
        <mesh
          ref={diamondRef}
          position={[isMobile ? -2.4 : -4.4, isMobile ? 3 : 3.2, -3.5]}
          scale={isMobile ? 0.35 : 0.55}
        >
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#a78bfa"
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>
      </Float>

      {/* Dumbbell — weight training, bottom-right corner */}
      {!isMobile && (
        <Float speed={1.6} rotationIntensity={0.4} floatIntensity={0.8}>
          <group
            ref={dumbbellRef}
            position={[4.3, -2.8, -3]}
            rotation={[0, 0, Math.PI / 3]}
            scale={0.85}
          >
            <mesh>
              <cylinderGeometry args={[0.08, 0.08, 1.7, 12]} />
              <meshStandardMaterial color="#10b981" wireframe transparent opacity={0.42} />
            </mesh>
            <mesh position={[0, 0.85, 0]}>
              <cylinderGeometry args={[0.32, 0.32, 0.28, 16]} />
              <meshStandardMaterial color="#10b981" wireframe transparent opacity={0.42} />
            </mesh>
            <mesh position={[0, -0.85, 0]}>
              <cylinderGeometry args={[0.32, 0.32, 0.28, 16]} />
              <meshStandardMaterial color="#10b981" wireframe transparent opacity={0.42} />
            </mesh>
          </group>
        </Float>
      )}

      {/* Track loop — running lap, right edge, spaced below the cube */}
      {!isMobile && (
        <Float speed={2.1} rotationIntensity={0.3} floatIntensity={0.6}>
          <mesh ref={trackRef} position={[3.6, 1.2, -4.5]} scale={[1.3, 0.85, 1]}>
            <torusGeometry args={[0.9, 0.1, 8, 48]} />
            <meshStandardMaterial color="#f97316" wireframe transparent opacity={0.38} />
          </mesh>
        </Float>
      )}
    </>
  );
}
