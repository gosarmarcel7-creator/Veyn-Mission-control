import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { AgentRole, AgentStatus } from "@/lib/types";

const ROLE_COLORS: Record<AgentRole, string> = {
  manager: "#4f8fdb",
  researcher: "#37b3d9",
  coder: "#5ea2ff",
  reviewer: "#f59e0b",
  deployment: "#38bdf8",
  analyst: "#8b8cf8",
  support: "#34d399",
  custom: "#94a3b8",
};

const STATUS_COLORS: Record<AgentStatus, string> = {
  idle: "#94a3b8",
  thinking: "#60a5fa",
  using_tool: "#22d3ee",
  coding: "#38bdf8",
  reviewing: "#f59e0b",
  blocked: "#fb923c",
  done: "#34d399",
  paused: "#64748b",
};

interface AvatarFallbackHumanoidProps {
  role: AgentRole;
  status: AgentStatus;
  selected: boolean;
  moving: boolean;
  seated?: boolean;
}

export function AvatarFallbackHumanoid({ role, status, selected, moving, seated = false }: AvatarFallbackHumanoidProps) {
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const rootRef = useRef<THREE.Group>(null);
  const tickRef = useRef(0);
  const phaseOffset = useMemo(() => ((role.charCodeAt(0) % 17) / 17) * Math.PI * 2, [role]);

  const roleColor = useMemo(() => new THREE.Color(ROLE_COLORS[role]), [role]);
  const statusColor = useMemo(() => new THREE.Color(STATUS_COLORS[status]), [status]);

  useEffect(() => {
    tickRef.current = phaseOffset;
  }, [phaseOffset]);

  useFrame((_, delta) => {
    tickRef.current += delta;
    const sway = Math.sin(tickRef.current * 1.8) * 0.05;

    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = moving ? -0.52 + sway : status === "thinking" ? -0.2 : -0.05;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = moving ? -0.52 - sway : status === "thinking" ? -0.62 : -0.05;
    }
    if (rootRef.current) {
      rootRef.current.position.y = seated ? 0.26 : Math.sin(tickRef.current * 1.3) * 0.02;
    }
  });

  return (
    <group ref={rootRef}>
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.28, 0.38, 40]} />
          <meshBasicMaterial color="#72b6ff" transparent opacity={0.85} />
        </mesh>
      )}

      <mesh position={[0, seated ? 0.68 : 0.42, -0.02]} castShadow>
        <boxGeometry args={[0.26, seated ? 0.3 : 0.54, 0.18]} />
        <meshStandardMaterial color={roleColor} roughness={0.72} metalness={0.06} />
      </mesh>

      <mesh position={[0, seated ? 0.92 : 0.85, -0.01]} castShadow>
        <sphereGeometry args={[0.13, 20, 16]} />
        <meshStandardMaterial color="#d6ad8a" roughness={0.88} />
      </mesh>

      <mesh position={[0, seated ? 1.02 : 0.95, -0.03]}>
        <sphereGeometry args={[0.14, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
        <meshStandardMaterial color="#1f2d3c" roughness={0.95} />
      </mesh>

      <mesh ref={leftArmRef} position={[-0.2, seated ? 0.66 : 0.54, -0.01]} castShadow>
        <capsuleGeometry args={[0.045, 0.26, 5, 10]} />
        <meshStandardMaterial color={roleColor} roughness={0.76} />
      </mesh>

      <mesh ref={rightArmRef} position={[0.2, seated ? 0.66 : 0.54, -0.01]} castShadow>
        <capsuleGeometry args={[0.045, 0.26, 5, 10]} />
        <meshStandardMaterial color={roleColor} roughness={0.76} />
      </mesh>

      {!seated && (
        <>
          <mesh position={[-0.08, 0.14, 0]} castShadow>
            <capsuleGeometry args={[0.05, 0.24, 4, 8]} />
            <meshStandardMaterial color="#1e293b" roughness={0.86} />
          </mesh>
          <mesh position={[0.08, 0.14, 0]} castShadow>
            <capsuleGeometry args={[0.05, 0.24, 4, 8]} />
            <meshStandardMaterial color="#1e293b" roughness={0.86} />
          </mesh>
          <mesh position={[-0.08, 0.02, 0.05]}>
            <boxGeometry args={[0.09, 0.04, 0.13]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
          <mesh position={[0.08, 0.02, 0.05]}>
            <boxGeometry args={[0.09, 0.04, 0.13]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
        </>
      )}

      <mesh position={[0.11, seated ? 0.7 : 0.58, 0.08]}>
        <sphereGeometry args={[0.028, 8, 8]} />
        <meshBasicMaterial color={statusColor} />
      </mesh>
    </group>
  );
}
