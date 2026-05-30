"use client";

import { useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";

export default function ParticleField() {
  const { size } = useThree();
  const isMobile = size.width < 768;

  return (
    <Sparkles
      count={isMobile ? 55 : 120}
      size={isMobile ? 0.9 : 1.2}
      speed={isMobile ? 0.15 : 0.25}
      opacity={0.55}
      color="#818cf8"
      scale={isMobile ? [9, 7, 6] : [14, 10, 8]}
    />
  );
}
