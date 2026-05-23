import { useMemo } from "react";
import { RoomObject } from "./RoomObject";

interface ServerRackProps {
  position: [number, number, number];
  rotation?: [number, number, number];
}

export function ServerRack({ position, rotation = [0, 0, 0] }: ServerRackProps) {
  const rows = useMemo(() => Array.from({ length: 8 }), []);

  return (
    <RoomObject position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[0.68, 2.0, 0.7]} />
        <meshStandardMaterial color="#0a111b" metalness={0.45} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.356]}>
        <boxGeometry args={[0.62, 1.92, 0.01]} />
        <meshStandardMaterial color="#0f1726" roughness={0.55} metalness={0.2} />
      </mesh>
      {rows.map((_, index) => {
        const y = 0.82 - index * 0.24;
        return (
          <group key={index} position={[0, y, 0.36]}>
            <mesh>
              <boxGeometry args={[0.58, 0.08, 0.01]} />
              <meshStandardMaterial color="#121f31" roughness={0.7} metalness={0.2} />
            </mesh>
            <mesh position={[0.2, 0, 0.006]}>
              <sphereGeometry args={[0.015, 8, 8]} />
              <meshBasicMaterial color={index % 2 === 0 ? "#34d399" : "#60a5fa"} />
            </mesh>
          </group>
        );
      })}
    </RoomObject>
  );
}
