import { Badge } from "@/components/ui/badge";
import type { Priority } from "@/lib/schema";
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
