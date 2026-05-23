import { RoomObject } from "./RoomObject";

interface IncidentConsoleProps {
  position: [number, number, number];
}

export function IncidentConsole({ position }: IncidentConsoleProps) {
  return (
    <RoomObject position={position}>
      <mesh castShadow>
        <boxGeometry args={[1.4, 1.2, 0.64]} />
        <meshStandardMaterial color="#130d10" metalness={0.3} roughness={0.66} />
      </mesh>
      <mesh position={[0, 0.15, 0.33]}>
        <boxGeometry args={[1.18, 0.84, 0.015]} />
        <meshStandardMaterial color="#2d1410" emissive="#f97316" emissiveIntensity={0.24} />
      </mesh>
      <mesh position={[0, 0.66, 0.34]}>
        <boxGeometry args={[1.24, 0.07, 0.01]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>
      {[-0.34, -0.14, 0.06, 0.26].map((x, index) => (
        <mesh key={index} position={[x, 0.45, 0.34]}>
          <sphereGeometry args={[0.025, 10, 10]} />
          <meshBasicMaterial color={index % 2 === 0 ? "#ef4444" : "#f59e0b"} />
        </mesh>
      ))}
    </RoomObject>
  );
}
