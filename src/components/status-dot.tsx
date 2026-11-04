import type { TrendStatus } from "@/lib/types";

const COLOR: Record<TrendStatus, string> = {
  Rising: "bg-emerald-400",
  Peak: "bg-amber-400",
  Steady: "bg-zinc-500",
  Fading: "bg-red-400",
};

export function StatusDot({ status }: { status: TrendStatus | null }) {
  if (!status) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <span className={`h-2 w-2 rounded-full ${COLOR[status]}`} aria-hidden />
      {status}
    </span>
  );
}
