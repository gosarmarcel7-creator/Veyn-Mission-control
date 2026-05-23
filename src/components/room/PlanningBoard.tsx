import { RoomObject } from "./RoomObject";

interface PlanningBoardProps {
  position: [number, number, number];
}

export function PlanningBoard({ position }: PlanningBoardProps) {
  return (
    <RoomObject position={position}>
      <mesh>
        <boxGeometry args={[3.2, 1.8, 0.05]} />
        <meshStandardMaterial color="#0f1726" roughness={0.7} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[3.02, 1.62, 0.01]} />
        <meshStandardMaterial color="#14243b" transparent opacity={0.88} roughness={0.08} metalness={0.04} />
      </mesh>
      {[-1, 0, 1].map((col) => (
        <mesh key={col} position={[col, 0, 0.04]}>
          <boxGeometry args={[0.01, 1.52, 0.005]} />
          <meshBasicMaterial color="#2f6ea8" transparent opacity={0.5} />
        </mesh>
      ))}
      {[-0.52, -0.2, 0.12, 0.44].map((row) => (
        <mesh key={row} position={[0, row, 0.04]}>
          <boxGeometry args={[2.92, 0.01, 0.005]} />
          <meshBasicMaterial color="#205080" transparent opacity={0.28} />
        </mesh>
      ))}
    </RoomObject>
  );
}
