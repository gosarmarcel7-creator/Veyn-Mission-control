import { cn } from "@/lib/utils";

interface VeynMarkProps {
  className?: string;
  compact?: boolean;
}

export function VeynMark({ className, compact = false }: VeynMarkProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <div className="grid h-7 w-7 grid-cols-2 grid-rows-2 gap-0.5 rounded-md border border-white/20 bg-[#0f1726] p-0.5">
        <span className="rounded-sm bg-[#72b6ff]" />
        <span className="rounded-sm bg-[#2f4f78]" />
        <span className="rounded-sm bg-[#234a72]" />
        <span className="rounded-sm bg-[#10263f]" />
      </div>
      {!compact && <span className="text-base font-semibold tracking-tight text-white">Veyn</span>}
    </div>
  );
}
