interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status?.toLowerCase().trim() || "";

  let colorClass = "bg-gray-100 text-gray-800 border-gray-200/30";

  if (normalized === "active") {
    colorClass = "bg-emerald-100 text-emerald-800 border-emerald-200/30";
  } else if (normalized === "inactive") {
    colorClass = "bg-red-100 text-red-800 border-red-200/30";
  } else if (normalized === "completed") {
    colorClass = "bg-slate-100 text-slate-700 border-slate-200/30";
  } else if (normalized === "pending") {
    colorClass = "bg-amber-50 text-amber-700 border-amber-200/30";
  } else if (normalized === "on hold") {
    colorClass = "bg-red-50 text-red-700 border-red-200/20";
  } else if (normalized === "cancelled") {
    colorClass = "bg-red-100/30 text-red-700 border-red-200/20";
  } else if (normalized === "approved") {
    colorClass = "bg-green-100 text-green-800 border-green-200/30";
  } else if (normalized === "committed") {
    colorClass = "bg-violet-100 text-violet-800 border-violet-200/30";
  } else if (normalized === "invoiced") {
    colorClass = "bg-gray-100 text-gray-800 border-gray-200/30";
  } else if (normalized === "idle") {
    colorClass = "bg-slate-100 text-slate-600 border-slate-200/30";
  }

  return (
    <div className="flex items-center h-full">
      <span
        className={`inline-flex items-center justify-center rounded-sm px-3 py-1 text-xs font-bold uppercase tracking-wider border min-w-[96px] text-center whitespace-nowrap ${colorClass}`}
      >
        {status}
      </span>
    </div>
  );
}

interface TypeBadgeProps {
  type: string;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const normalized = type?.toLowerCase().trim() || "";

  let colorClass = "bg-slate-100 text-slate-800 border-slate-200";

  if (normalized === "cash" || normalized === "multiaxel") {
    colorClass = "bg-amber-50 text-amber-800 border-amber-200/50";
  } else if (normalized === "account" || normalized === "standard") {
    colorClass = "bg-slate-100 text-slate-800 border-slate-200";
  }

  return (
    <div className="flex items-center h-full">
      <span
        className={`inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-semibold tracking-wider border min-w-[84px] text-center whitespace-nowrap ${colorClass}`}
      >
        {type}
      </span>
    </div>
  );
}
