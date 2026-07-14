import * as React from "react";
import { ArrowLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

/** Primary “Add …” action — place in PageHeader `actions` on the right. */
export const PAGE_HEADER_ADD_BUTTON_CLASS =
  "rounded-md bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 transition flex items-center gap-1.5 cursor-pointer shadow-sm";

interface Breadcrumb {
  label: string;
  onClick?: () => void;
}

interface PageHeaderProps {
  title: React.ReactNode;
  /** Leading icon shown beside the page title */
  icon?: LucideIcon;
  description?: React.ReactNode;
  /** Section path shown under the title, e.g. Operations / Transactions */
  breadcrumbs?: Breadcrumb[];
  onBack?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  icon: Icon,
  description,
  breadcrumbs,
  onBack,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      <div className="flex items-start gap-3 min-w-0">
        {onBack && (
          <Button variant="outline" size="icon" onClick={onBack} aria-label="Go back" className="mt-0.5 shrink-0">
            <ArrowLeft />
          </Button>
        )}
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {Icon && <Icon className="h-6 w-6 shrink-0 text-info" aria-hidden />}
            <span className="truncate">{title}</span>
          </h1>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              {breadcrumbs.map((crumb, i) => {
                const isLast = i === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={`${crumb.label}-${i}`}>
                    {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />}
                    {crumb.onClick ? (
                      <button
                        type="button"
                        onClick={crumb.onClick}
                        className={cn(
                          "cursor-pointer transition-colors hover:text-foreground",
                          isLast && "font-semibold text-info"
                        )}
                      >
                        {crumb.label}
                      </button>
                    ) : (
                      <span className={cn(isLast && "font-semibold text-info")}>{crumb.label}</span>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          )}
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
