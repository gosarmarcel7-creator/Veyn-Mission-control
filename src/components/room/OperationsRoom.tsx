"use client";

import { useMemo } from "react";
import { ContactShadows, Environment } from "@react-three/drei";
import { useRoomStore } from "@/lib/store";
import type { Agent } from "@/lib/types";
import { AgentAvatar3D } from "./AgentAvatar3D";
import { RoomEnvironment } from "./RoomEnvironment";
import { ZoneMarker } from "./ZoneMarker";
import { CollaborationLine } from "./CollaborationLine";

const ZONE_MARKERS = [
  { id: "planning", label: "Planning Zone", position: [-1.0, 0.02, -2.7] as [number, number, number], color: "#72b6ff" },
  { id: "research", label: "Research Zone", position: [-4.3, 0.02, -2.5] as [number, number, number], color: "#37b3d9" },
  { id: "coding", label: "Coding Zone", position: [-1.0, 0.02, 1.9] as [number, number, number], color: "#60a5fa" },
  { id: "review", label: "Review Zone", position: [2.8, 0.02, 2.2] as [number, number, number], color: "#fbbf24" },
  { id: "deployment", label: "Deployment Zone", position: [4.3, 0.02, -2.2] as [number, number, number], color: "#34d399" },
  { id: "lounge", label: "Lounge Zone", position: [-4.1, 0.02, 2.9] as [number, number, number], color: "#94a3b8" },
  { id: "incident", label: "Incident Zone", position: [4.2, 0.02, 2.9] as [number, number, number], color: "#f97316" },
];

function buildCollaborationPairs(agents: Agent[], selectedAgentId: string | null) {
  const activeAgents = agents.filter((agent) => !["idle", "done", "paused"].includes(agent.status));
  const pairs: Array<{ from: [number, number, number]; to: [number, number, number]; active: boolean }> = [];

  for (let index = 0; index < activeAgents.length; index += 1) {
    for (let compare = index + 1; compare < activeAgents.length; compare += 1) {
      const source = activeAgents[index];
      const target = activeAgents[compare];

      if (source.zone !== target.zone) continue;

      const active = source.id === selectedAgentId || target.id === selectedAgentId;
      pairs.push({
        from: [source.position.x, 0.06, source.position.z],
        to: [target.position.x, 0.06, target.position.z],
        active,
      });
    }
  }

  return pairs.slice(0, 40);
}

export function OperationsRoom() {
  const { agents, selectedAgentId, setSelectedAgentId, roomSettings } = useRoomStore();

  const lines = useMemo(() => buildCollaborationPairs(agents, selectedAgentId), [agents, selectedAgentId]);

  return (
    <>
      <ambientLight intensity={0.62} color="#d8e6ff" />
      <directionalLight
        position={[4.8, 8.2, 6.4]}
        intensity={1.35}
        color="#f4f8ff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <pointLight position={[-3.2, 2.8, -1.8]} intensity={0.4} color="#67b7ff" distance={8} />
      <pointLight position={[4.9, 2.4, 2.8]} intensity={0.4} color="#f59e0b" distance={6} />
      <Environment preset="city" />

      <RoomEnvironment />

      {roomSettings.showZones &&
        ZONE_MARKERS.map((marker) => (
          <ZoneMarker key={marker.id} label={marker.label} position={marker.position} color={marker.color} />
        ))}

      {agents.map((agent) => (
        <AgentAvatar3D
          key={agent.id}
          agent={agent}
          selected={selectedAgentId === agent.id}
          showLabels={roomSettings.showLabels}
          onSelect={() => setSelectedAgentId(selectedAgentId === agent.id ? null : agent.id)}
        />
      ))}

      {roomSettings.showTrails &&
        lines.map((line, index) => (
          <CollaborationLine key={`${line.from.join("-")}-${line.to.join("-")}-${index}`} from={line.from} to={line.to} active={line.active} />
        ))}

      <ContactShadows position={[0, -0.001, 0]} opacity={0.42} scale={16} blur={1.9} far={7.2} />
    </>
  );
}
