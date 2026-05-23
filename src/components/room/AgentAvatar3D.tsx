"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Agent, AgentRole } from "@/lib/types";
import { AvatarFallbackHumanoid } from "./AvatarFallbackHumanoid";
import { FloatingAgentLabel } from "./FloatingAgentLabel";

const ROLE_AVATAR_PATH: Record<AgentRole, string> = {
  manager: "/models/avatars/manager.glb",
  researcher: "/models/avatars/researcher.glb",
  coder: "/models/avatars/coder.glb",
  reviewer: "/models/avatars/reviewer.glb",
  deployment: "/models/avatars/deployment.glb",
  analyst: "/models/avatars/researcher.glb",
  support: "/models/avatars/support.glb",
  custom: "/models/avatars/coder.glb",
};

const ASSET_CACHE = new Map<string, boolean>();

function useAssetExists(path: string) {
  const [exists, setExists] = useState<boolean>(ASSET_CACHE.get(path) ?? false);

  useEffect(() => {
    if (ASSET_CACHE.has(path)) {
      return;
    }

    let active = true;
    fetch(path, { method: "HEAD" })
      .then((response) => {
        if (!active) return;
        ASSET_CACHE.set(path, response.ok);
        setExists(response.ok);
      })
      .catch(() => {
        if (!active) return;
        ASSET_CACHE.set(path, false);
        setExists(false);
      });

    return () => {
      active = false;
    };
  }, [path]);

  return exists;
}

function AvatarModel({ path }: { path: string }) {
  const gltf = useGLTF(path);
  const scene = useMemo(() => {
    const cloned = clone(gltf.scene);
    cloned.traverse((object) => {
      object.frustumCulled = false;
    });
    return cloned;
  }, [gltf.scene]);
  return <primitive object={scene} scale={0.88} position={[0, 0, 0]} />;
}

interface AgentAvatar3DProps {
  agent: Agent;
  selected: boolean;
  showLabels: boolean;
  onSelect: () => void;
}

export function AgentAvatar3D({ agent, selected, showLabels, onSelect }: AgentAvatar3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [moving, setMoving] = useState(false);

  const { camera } = useThree();

  const avatarPath = ROLE_AVATAR_PATH[agent.role];
  const hasAvatarAsset = useAssetExists(avatarPath);
  const seated = agent.zone === "coding" || agent.zone === "review" || agent.zone === "research";

  const target = useMemo(
    () => new THREE.Vector3(agent.position.x, agent.position.y, agent.position.z),
    [agent.position.x, agent.position.y, agent.position.z]
  );

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const current = groupRef.current.position;
    const before = current.clone();
    current.lerp(target, Math.min(1, delta * 2.2));

    const moveDirection = target.clone().sub(before);
    setMoving(moveDirection.lengthSq() > 0.0006);

    if (moveDirection.lengthSq() > 0.0001) {
      const targetAngle = Math.atan2(moveDirection.x, moveDirection.z);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetAngle, delta * 3.2);
    }
  });

  const distance = camera.position.distanceTo(target);
  const showLabel = showLabels && (selected || hovered || distance < 14);

  return (
    <group
      ref={groupRef}
      frustumCulled={false}
      position={[agent.position.x, agent.position.y, agent.position.z]}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHovered(false);
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      {hasAvatarAsset ? (
        <Suspense fallback={<AvatarFallbackHumanoid role={agent.role} status={agent.status} selected={selected} moving={moving} seated={seated} />}>
          <AvatarModel path={avatarPath} />
        </Suspense>
      ) : (
        <AvatarFallbackHumanoid role={agent.role} status={agent.status} selected={selected} moving={moving} seated={seated} />
      )}

      <FloatingAgentLabel agent={agent} selected={selected || hovered} visible={showLabel} />
    </group>
  );
}
