"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { RoomObject } from "./RoomObject";
import { MonitorScreen } from "./MonitorScreen";
import { PlanningBoard } from "./PlanningBoard";
import { ReviewTable } from "./ReviewTable";
import { ServerRack } from "./ServerRack";
import { IncidentConsole } from "./IncidentConsole";

const ROOM_MODEL_PATH = "/models/agent-ops-room.glb";
const MODEL_CACHE = new Map<string, boolean>();

function useAssetExists(path: string) {
  const [exists, setExists] = useState<boolean>(MODEL_CACHE.get(path) ?? false);

  useEffect(() => {
    if (MODEL_CACHE.has(path)) {
      return;
    }

    let active = true;
    fetch(path, { method: "HEAD" })
      .then((response) => {
        if (!active) return;
        MODEL_CACHE.set(path, response.ok);
        setExists(response.ok);
      })
      .catch(() => {
        if (!active) return;
        MODEL_CACHE.set(path, false);
        setExists(false);
      });

    return () => {
      active = false;
    };
  }, [path]);

  return exists;
}

function RoomAssetModel() {
  const gltf = useGLTF(ROOM_MODEL_PATH);
  const scene = useMemo(() => clone(gltf.scene), [gltf.scene]);

  return <primitive object={scene} scale={1.2} position={[0, -0.01, 0]} castShadow receiveShadow />;
}

function DeskCluster({ baseX, baseZ, count = 2, tone = "cyan" }: { baseX: number; baseZ: number; count?: number; tone?: "cyan" | "blue" | "amber" | "green" }) {
  return (
    <group>
      {Array.from({ length: count }).map((_, index) => {
        const x = baseX + index * 1.2;
        return (
          <group key={`${baseX}-${index}`} position={[x, 0, baseZ]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.0, 0.08, 0.66]} />
              <meshStandardMaterial color="#111a28" roughness={0.74} metalness={0.1} />
            </mesh>
            <mesh position={[0, -0.39, 0.26]} castShadow>
              <boxGeometry args={[0.08, 0.78, 0.08]} />
              <meshStandardMaterial color="#0c1320" roughness={0.68} metalness={0.3} />
            </mesh>
            <mesh position={[0, -0.39, -0.26]} castShadow>
              <boxGeometry args={[0.08, 0.78, 0.08]} />
              <meshStandardMaterial color="#0c1320" roughness={0.68} metalness={0.3} />
            </mesh>
            <mesh position={[0, 0.16, 0.3]}>
              <boxGeometry args={[0.32, 0.03, 0.14]} />
              <meshStandardMaterial color="#0a111b" roughness={0.7} />
            </mesh>
            <MonitorScreen position={[0, 0.32, -0.22]} tone={tone} />
            <mesh position={[0, -0.14, 0.64]}>
              <boxGeometry args={[0.42, 0.18, 0.42]} />
              <meshStandardMaterial color="#121a2a" roughness={0.84} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function FallbackRoom() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[15, 12]} />
        <meshStandardMaterial color="#0d141f" roughness={0.94} metalness={0.05} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[15, 12]} />
        <meshBasicMaterial color="#152130" transparent opacity={0.06} />
      </mesh>

      <mesh position={[0, 2.25, -6.02]} receiveShadow>
        <boxGeometry args={[15.2, 4.5, 0.14]} />
        <meshStandardMaterial color="#101823" roughness={0.93} />
      </mesh>

      <mesh position={[-7.52, 2.25, 0]} receiveShadow>
        <boxGeometry args={[0.14, 4.5, 12.2]} />
        <meshStandardMaterial color="#0f1724" roughness={0.93} />
      </mesh>

      <mesh position={[7.52, 2.25, 0]} receiveShadow>
        <boxGeometry args={[0.14, 4.5, 12.2]} />
        <meshStandardMaterial color="#0f1724" roughness={0.93} />
      </mesh>

      <mesh position={[0, 4.48, 0]} receiveShadow>
        <boxGeometry args={[15.2, 0.14, 12.2]} />
        <meshStandardMaterial color="#090f18" roughness={1} />
      </mesh>

      {[-4.8, -1.5, 1.8, 4.8].map((x) => (
        <group key={x} position={[x, 4.38, -0.5]}>
          <mesh>
            <boxGeometry args={[0.22, 0.06, 5.6]} />
            <meshStandardMaterial color="#0f1724" metalness={0.35} roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.03, 0]}>
            <boxGeometry args={[0.12, 0.016, 5.3]} />
            <meshBasicMaterial color="#dce8ff" />
          </mesh>
        </group>
      ))}

      <PlanningBoard position={[-1.0, 2.4, -5.86]} />

      <DeskCluster baseX={-4.9} baseZ={-4.4} count={2} tone="blue" />
      <DeskCluster baseX={-2.0} baseZ={-0.6} count={3} tone="cyan" />
      <DeskCluster baseX={-4.9} baseZ={0.8} count={2} tone="green" />

      <ReviewTable position={[4.3, 0.78, 1.2]} />
      <MonitorScreen position={[6.5, 1.7, 0.4]} rotation={[0, -Math.PI / 2, 0]} tone="green" />

      <ServerRack position={[5.9, 1.0, -4.9]} />
      <ServerRack position={[6.9, 1.0, -4.9]} />
      <MonitorScreen position={[4.8, 1.2, -3.8]} rotation={[0, 0.4, 0]} tone="cyan" />

      <IncidentConsole position={[5.8, 0.65, 3.0]} />

      <RoomObject position={[-5.5, 0.38, 2.9]}>
        <mesh castShadow>
          <boxGeometry args={[2.5, 0.32, 0.82]} />
          <meshStandardMaterial color="#131c2b" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.32, -0.36]} castShadow>
          <boxGeometry args={[2.5, 0.52, 0.12]} />
          <meshStandardMaterial color="#121a27" roughness={0.92} />
        </mesh>
        <mesh position={[0, 0.24, 1.05]} castShadow>
          <boxGeometry args={[1.05, 0.06, 0.54]} />
          <meshStandardMaterial color="#101722" roughness={0.78} metalness={0.2} />
        </mesh>
      </RoomObject>

      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[15, 0.02, 12]} />
        <meshBasicMaterial color="#6ea5d5" transparent opacity={0.03} />
      </mesh>
    </group>
  );
}

export function RoomEnvironment() {
  const hasAsset = useAssetExists(ROOM_MODEL_PATH);

  if (!hasAsset) {
    return <FallbackRoom />;
  }

  return (
    <Suspense fallback={<FallbackRoom />}>
      <RoomAssetModel />
    </Suspense>
  );
}
