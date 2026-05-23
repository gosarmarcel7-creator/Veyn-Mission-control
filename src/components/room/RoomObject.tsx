import type { ReactNode } from "react";

interface RoomObjectProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  children?: ReactNode;
}

export function RoomObject({ position = [0, 0, 0], rotation = [0, 0, 0], children }: RoomObjectProps) {
  return (
    <group position={position} rotation={rotation}>
      {children}
    </group>
  );
}
