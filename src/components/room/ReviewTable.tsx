import { RoomObject } from "./RoomObject";

interface ReviewTableProps {
  position: [number, number, number];
}

export function ReviewTable({ position }: ReviewTableProps) {
  return (
    <RoomObject position={position}>
      <mesh castShadow>
        <boxGeometry args={[2.8, 0.08, 1.4]} />
        <meshStandardMaterial color="#151f2e" metalness={0.14} roughness={0.72} />
      </mesh>
      {[
        [-1.25, -0.42, -0.58],
        [1.25, -0.42, -0.58],
        [-1.25, -0.42, 0.58],
        [1.25, -0.42, 0.58],
      ].map((point, index) => (
        <mesh key={index} position={point as [number, number, number]} castShadow>
          <boxGeometry args={[0.08, 0.84, 0.08]} />
          <meshStandardMaterial color="#0d1522" metalness={0.3} roughness={0.62} />
        </mesh>
      ))}

      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[2.5, 0.01, 0.01]} />
        <meshBasicMaterial color="#34d399" transparent opacity={0.45} />
      </mesh>
    </RoomObject>
  );
}
