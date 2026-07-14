import * as React from "react";
import { motion } from "motion/react";
import { ArrowLeft, Plus, type LucideIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";

export const FORM_PAGE_INPUT_CLASS =
  "h-9 text-xs font-semibold bg-muted border-border focus:bg-card";
export const FORM_PAGE_SELECT_CLASS =
  "w-full text-xs font-semibold bg-muted border-border";
export const FORM_PAGE_TEXTAREA_CLASS =
  "w-full min-h-[80px] resize-y rounded-md border border-border bg-muted px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring";
export const FORM_PAGE_ACTION_CLASS =
  "inline-flex h-9 items-center justify-center rounded-md text-xs font-bold transition cursor-pointer";
export const FORM_PAGE_SECTION_CLASS =
  "text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5 border-b border-border pb-2";
export const FORM_PAGE_LABEL_CLASS =
  "block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1";

interface FormPageProps {
  /** Form title shown in the card header. */
  title: React.ReactNode;
  /** Optional subtitle shown under the title. */
  subtitle?: React.ReactNode;
  /** Leading icon shown in the card header. */
  icon?: LucideIcon;
  /** "Draft Mode" vs "Modifying Live Record" badge text. */
  modeBadge?: React.ReactNode;
  children: React.ReactNode;
  /** Called when the Cancel button is clicked. */
  onCancel: () => void;
  /** Optional submit handler for the <form> element. */
  onSubmit?: (e: React.FormEvent) => void;
  /** Primary save label. */
  saveLabel?: string;
  /** If provided, renders a "Save & Add Another" secondary action. */
  onSaveAndAddAnother?: () => void;
  saveAndAddAnotherLabel?: string;
  className?: string;
  formClassName?: string;
}

export default function FormPage({
  title,
  subtitle,
  icon: Icon,
  modeBadge,
  children,
  onCancel,
  onSubmit,
  saveLabel = "Save",
  onSaveAndAddAnother,
  saveAndAddAnotherLabel = "Save & Add Another",
  className,
  formClassName,
}: FormPageProps) {
  return (
    <motion.form
      key="form-page"
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn("space-y-6", formClassName)}
    >
      <div
        className={cn(
          "bg-card border border-border rounded-md shadow-xs overflow-hidden",
          className
        )}
      >
        <div className="bg-muted border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-info/10 text-info">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          {modeBadge && (
            <span className="font-mono text-xs text-muted-foreground">
              {modeBadge}
            </span>
          )}
        </div>

        {children}

        <div className="bg-muted border-t border-border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest font-mono">
            * MANDATORY FIELDS
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className={`${FORM_PAGE_ACTION_CLASS} border border-border bg-card px-4 text-foreground shadow-xs hover:bg-muted`}
            >
              Cancel
            </button>
            {onSaveAndAddAnother && (
              <button
                type="button"
                onClick={onSaveAndAddAnother}
                className={`${FORM_PAGE_ACTION_CLASS} gap-1 border border-info/25 bg-info/10 px-5 text-info hover:bg-info/10`}
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span>{saveAndAddAnotherLabel}</span>
              </button>
            )}
            <button
              type="submit"
              className={`${FORM_PAGE_ACTION_CLASS} bg-primary px-5 text-white shadow-sm hover:bg-primary/90`}
            >
              {saveLabel}
            </button>
          </div>
        </div>
      </div>
    </motion.form>
  );
}
