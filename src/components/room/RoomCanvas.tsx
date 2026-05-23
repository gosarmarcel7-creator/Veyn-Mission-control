"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OperationsRoom } from "./OperationsRoom";
import { RoomCameraControls } from "./RoomCameraControls";
import { useRoomStore } from "@/lib/store";

export function RoomCanvas() {
  const { setSelectedAgentId } = useRoomStore();

  return (
    <div className="h-full w-full">
      <Canvas
        shadows
        camera={{ position: [5.5, 4.2, 6.2], fov: 42, near: 0.1, far: 120 }}
        gl={{ antialias: true, alpha: false }}
        onPointerMissed={() => setSelectedAgentId(null)}
      >
        <color attach="background" args={["#080b12"]} />
        <fog attach="fog" args={["#080b12", 10, 22]} />
        <Suspense fallback={null}>
          <OperationsRoom />
          <RoomCameraControls />
        </Suspense>
      </Canvas>
    </div>
  );
}
