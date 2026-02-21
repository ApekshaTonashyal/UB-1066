import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  status?: "optimal" | "warning" | "critical";
  subtitle?: string;
  className?: string;
}

const statusColors = {
  optimal: "border-l-4 border-l-success",
  warning: "border-l-4 border-l-warning",
  critical: "border-l-4 border-l-critical",
};

const statusBadge = {
  optimal: "status-optimal",
  warning: "status-warning",
  critical: "status-critical",
};

export function MetricCard({ title, value, unit, icon: Icon, status, subtitle, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-5 transition-all hover:shadow-md animate-fade-in",
        status && statusColors[status],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-display text-card-foreground">{value}</span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="rounded-lg bg-muted p-2">
            <Icon size={20} className="text-primary" />
          </div>
          {status && (
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", statusBadge[status])}>
              {status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
