import { Html } from "@react-three/drei";

interface ZoneMarkerProps {
  label: string;
  position: [number, number, number];
  color: string;
}

export function ZoneMarker({ label, position, color }: ZoneMarkerProps) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 0.62]} />
        <meshStandardMaterial color={color} transparent opacity={0.12} />
      </mesh>
      <Html position={[0, 0.18, 0]} center>
        <div
          className="rounded-md border px-2 py-1 text-[10px] font-medium uppercase tracking-wide"
          style={{
            color,
            borderColor: "rgba(255,255,255,0.16)",
            background: "rgba(8,10,15,0.82)",
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}
