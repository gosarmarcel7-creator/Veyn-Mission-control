import { useMemo, useRef } from "react";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CollaborationLineProps {
  from: [number, number, number];
  to: [number, number, number];
  active?: boolean;
}

export function CollaborationLine({ from, to, active = false }: CollaborationLineProps) {
  const lineRef = useRef<THREE.Object3D>(null);
  const points = useMemo(() => [new THREE.Vector3(...from), new THREE.Vector3(...to)], [from, to]);

  useFrame(({ clock }) => {
    const material = (lineRef.current as unknown as { material?: { opacity?: number } })?.material;
    if (!material) return;
    const pulse = Math.sin(clock.elapsedTime * 2.4) * 0.08;
    material.opacity = active ? 0.48 + pulse : 0.14 + pulse * 0.4;
  });

  return (
    <Line
      ref={lineRef as never}
      points={points}
      color={active ? "#72b6ff" : "#3c5f8f"}
      transparent
      opacity={active ? 0.48 : 0.14}
      lineWidth={active ? 1.2 : 0.8}
    />
  );
}
