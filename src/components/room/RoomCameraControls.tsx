"use client";

import { useEffect, useMemo } from "react";
import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useRoomStore } from "@/lib/store";

const DEFAULT_POSITION = new THREE.Vector3(5.5, 4.2, 6.2);
const DEFAULT_TARGET = new THREE.Vector3(0, 0.8, 0);

export function RoomCameraControls() {
  const { camera } = useThree();
  const { roomSettings, selectedAgentId, selectedZone, agents } = useRoomStore();

  const target = useMemo(() => {
    if (roomSettings.cameraMode === "topdown") return new THREE.Vector3(0, 0.8, 0);

    if (roomSettings.cameraMode === "follow") {
      const id = roomSettings.followAgentId ?? selectedAgentId;
      const agent = agents.find((entry) => entry.id === id);
      if (agent) return new THREE.Vector3(agent.position.x, 0.9, agent.position.z);
    }

    if (selectedZone) {
      const focusByZone: Record<string, [number, number, number]> = {
        planning: [-1.1, 0.8, -2.3],
        research: [-4.1, 0.8, -2.1],
        coding: [-1.0, 0.8, 1.3],
        review: [2.8, 0.8, 1.2],
        deployment: [4.1, 0.8, -1.7],
        lounge: [-3.9, 0.8, 2.3],
        incident: [4.2, 0.8, 2.3],
      };
      const [x, y, z] = focusByZone[selectedZone] ?? [0, 0.8, 0];
      return new THREE.Vector3(x, y, z);
    }

    return DEFAULT_TARGET.clone();
  }, [roomSettings.cameraMode, roomSettings.followAgentId, selectedAgentId, selectedZone, agents]);

  useEffect(() => {
    if (roomSettings.cameraMode === "topdown") {
      camera.position.set(0, 9.5, 0.01);
      camera.lookAt(0, 0.8, 0);
      return;
    }

    if (roomSettings.cameraMode === "orbit") {
      camera.position.lerp(DEFAULT_POSITION, 0.4);
      camera.lookAt(DEFAULT_TARGET);
      return;
    }

    if (roomSettings.cameraMode === "follow") {
      camera.position.lerp(new THREE.Vector3(target.x + 2.6, 2.4, target.z + 2.6), 0.35);
      camera.lookAt(target);
      return;
    }
  }, [camera, roomSettings.cameraMode, target]);

  return (
    <OrbitControls
      makeDefault
      target={target}
      minDistance={3.5}
      maxDistance={16}
      minPolarAngle={0.25}
      maxPolarAngle={Math.PI / 2.1}
      enablePan
      panSpeed={0.65}
      rotateSpeed={0.55}
      zoomSpeed={0.7}
    />
  );
}
