import { Badge, type BadgeVariant } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";

/**
 * Single source of truth for status → color across the whole app.
 * Covers TransactionStatus plus every entity status in src/types.ts.
 */
const STATUS_VARIANT: Record<string, BadgeVariant> = {
  // Transaction statuses
  Pending: "warning",
  Approved: "success",
  "On Hold": "accent",
  Invoiced: "info",
  Cancelled: "destructive",
  Committed: "default",
  // Entity statuses
  Active: "success",
  Inactive: "secondary",
  Suspended: "destructive",
  Locked: "destructive",
  Maintenance: "warning",
  Completed: "info",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANT[status] ?? "outline"} className={cn(className)}>
      {status}
    </Badge>
  );
}

export { STATUS_VARIANT };
