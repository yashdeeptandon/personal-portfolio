"use client";

import { useEffect, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Suspense } from "react";
import FloatingGeometry from "./three/FloatingGeometry";
import ParticleField from "./three/ParticleField";

function MouseCamera() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const lerped = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 1.4;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 0.9;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame(() => {
    lerped.current.x += (mouse.current.x - lerped.current.x) * 0.04;
    lerped.current.y += (mouse.current.y - lerped.current.y) * 0.04;
    camera.position.x = lerped.current.x;
    camera.position.y = lerped.current.y;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function GlobalAnimatedBackground() {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#030712]" style={{ willChange: "transform" }} aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={null}>
          <MouseCamera />
          <FloatingGeometry />
          <ParticleField />
        </Suspense>
      </Canvas>
    </div>
  );
}
