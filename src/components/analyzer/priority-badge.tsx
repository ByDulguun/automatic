import { Badge } from "@/components/ui/badge";
import type { Confidence, Priority } from "@/lib/schema";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES: Record<Priority, string> = {
  HIGH: "border-rose-400/30 bg-rose-500/10 text-rose-300",
  MEDIUM: "border-amber-400/30 bg-amber-500/10 text-amber-300",
  LOW: "border-zinc-400/30 bg-zinc-500/10 text-zinc-300",
};

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full font-medium tracking-wide text-[11px]", PRIORITY_STYLES[priority], className)}
    >
      {priority}
    </Badge>
  );
}

const CONFIDENCE_STYLES: Record<Confidence, string> = {
  High: "border-sky-400/25 bg-sky-500/10 text-sky-300",
  Medium: "border-zinc-500/25 bg-zinc-500/10 text-zinc-400",
  Low: "border-zinc-700 bg-zinc-800/40 text-zinc-500",
};

export function ConfidenceBadge({ confidence, className }: { confidence: Confidence; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full font-normal tracking-wide text-[11px]",
        CONFIDENCE_STYLES[confidence],
        className
      )}
    >
      {confidence} confidence
    </Badge>
  );
}
