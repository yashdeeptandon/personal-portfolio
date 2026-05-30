"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import FloatingGeometry from "./FloatingGeometry";
import ParticleField from "./ParticleField";

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <FloatingGeometry />
          <ParticleField />
        </Suspense>
      </Canvas>
    </div>
  );
}
