import { Html } from "@react-three/drei";
import type { Agent } from "@/lib/types";
import { statusDotColor } from "@/lib/utils";

interface FloatingAgentLabelProps {
  agent: Agent;
  selected: boolean;
  visible: boolean;
}

export function FloatingAgentLabel({ agent, selected, visible }: FloatingAgentLabelProps) {
  if (!visible) return null;

  return (
    <Html position={[0, 2.45, 0]} center distanceFactor={10} transform occlude={false}>
      <div
        className="pointer-events-none rounded-md border px-2 py-1.5 shadow-2xl backdrop-blur"
        style={{
          background: selected ? "rgba(14, 28, 44, 0.94)" : "rgba(10, 14, 22, 0.86)",
          borderColor: selected ? "rgba(114, 182, 255, 0.68)" : "rgba(255,255,255,0.16)",
          minWidth: selected ? 170 : 150,
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${statusDotColor(agent.status)}`} />
          <span className="text-[11px] font-semibold text-white">{agent.name}</span>
          <span className="text-[10px] text-slate-300">{agent.role}</span>
          <span className="ml-auto text-[10px] text-slate-400">{agent.model}</span>
        </div>
        <p className="mt-1 max-w-[18ch] truncate text-[10px] text-slate-300">{agent.currentTask ?? "Waiting for task"}</p>
      </div>
    </Html>
  );
}
