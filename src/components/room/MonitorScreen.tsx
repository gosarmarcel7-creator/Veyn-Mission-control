import { RoomObject } from "./RoomObject";

interface MonitorScreenProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  tone?: "cyan" | "blue" | "amber" | "green";
}

const SCREEN_COLORS = {
  cyan: { color: "#0c2032", emissive: "#3fc0ff" },
  blue: { color: "#0c1d35", emissive: "#74b1ff" },
  amber: { color: "#26190d", emissive: "#fbbf24" },
  green: { color: "#0f2518", emissive: "#34d399" },
} as const;

export function MonitorScreen({ position, rotation = [0, 0, 0], tone = "cyan" }: MonitorScreenProps) {
  const palette = SCREEN_COLORS[tone];

  return (
    <RoomObject position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[0.88, 0.52, 0.06]} />
        <meshStandardMaterial color="#070c14" metalness={0.35} roughness={0.58} />
      </mesh>
      <mesh position={[0, 0, 0.031]}>
        <boxGeometry args={[0.8, 0.44, 0.01]} />
        <meshStandardMaterial
          color={palette.color}
          emissive={palette.emissive}
          emissiveIntensity={0.55}
          roughness={0.2}
          metalness={0}
        />
      </mesh>
      <mesh position={[0, -0.34, 0.09]}>
        <boxGeometry args={[0.18, 0.04, 0.16]} />
        <meshStandardMaterial color="#060b13" metalness={0.35} roughness={0.62} />
      </mesh>
      <mesh position={[0, -0.22, 0.05]}>
        <boxGeometry args={[0.04, 0.2, 0.04]} />
        <meshStandardMaterial color="#0b111b" metalness={0.34} roughness={0.64} />
      </mesh>
    </RoomObject>
  );
}
