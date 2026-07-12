import * as React from "react";
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";

type StatTone = "default" | "accent" | "success" | "warning" | "destructive" | "info";

const TONE_RULE: Record<StatTone, string> = {
  default: "bg-primary",
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  info: "bg-info",
};

interface StatCardProps {
  label: React.ReactNode;
  value: React.ReactNode;
  delta?: { value: string; direction: "up" | "down"; positive?: boolean };
  icon?: LucideIcon;
  tone?: StatTone;
  hint?: React.ReactNode;
  className?: string;
}

/** Industrial KPI tile: left accent rule, mono value, uppercase label. */
export default function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = "default",
  hint,
  className,
}: StatCardProps) {
  const deltaPositive = delta ? (delta.positive ?? delta.direction === "up") : undefined;
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-card p-4 shadow-xs",
        className
      )}
    >
      <span className={cn("absolute inset-y-0 left-0 w-[3px]", TONE_RULE[tone])} />
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" />}
      </div>
      <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-foreground">{value}</p>
      {(delta || hint) && (
        <div className="mt-1.5 flex items-center gap-2 text-xs">
          {delta && (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-semibold",
                deltaPositive ? "text-success" : "text-destructive"
              )}
            >
              {delta.direction === "up" ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              {delta.value}
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      )}
    </div>
  );
}
