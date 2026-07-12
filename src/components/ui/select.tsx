import * as React from "react";
import { Select as SelectPrimitive } from "radix-ui";
import { Check, ChevronDown, ChevronUp, Search } from "lucide-react";
import { cn } from "@/src/lib/utils";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between gap-2 whitespace-nowrap rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-xs",
      "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
      "disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="size-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md animate-fade-in",
        position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.ScrollUpButton className="flex cursor-default items-center justify-center py-1">
        <ChevronUp className="size-4" />
      </SelectPrimitive.ScrollUpButton>
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectPrimitive.ScrollDownButton className="flex cursor-default items-center justify-center py-1">
        <ChevronDown className="size-4" />
      </SelectPrimitive.ScrollDownButton>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = "SelectContent";

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground", className)}
    {...props}
  />
));
SelectLabel.displayName = "SelectLabel";

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none",
      "focus:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex size-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="size-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = "SelectItem";

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
));
SelectSeparator.displayName = "SelectSeparator";

/**
 * NativeSelect — styled native <select> for dense filter bars and forms
 * where a Radix popover is unnecessary overhead. Same visual language.
 */
const NativeSelect = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
  ({ className, children, ...props }, ref) => (
    <div className={cn("relative", className?.includes("w-") ? "" : "w-full", className)}>
      <select
        ref={ref}
        className={cn(
          "h-9 w-full appearance-none rounded-md border border-input bg-card pl-3 pr-8 text-sm text-foreground shadow-xs",
          "focus:outline-none focus:ring-2 focus:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
);
NativeSelect.displayName = "NativeSelect";

/**
 * SelectBox — drop-in replacement for a native <select> that renders the
 * design-system Radix popover instead of the OS dropdown.
 *
 * Same API as <select>: `value`, `onChange` (receives an event-shaped object
 * whose `target.value` is the picked value), `disabled`, and `<option>`
 * children (static, mapped, or conditional). An option with value="" acts as
 * the placeholder: it is shown when nothing is selected but is not offered as
 * a pickable item (matching combobox convention).
 */
interface SelectBoxProps {
  value: string;
  onChange?: (e: { target: { value: string } }) => void;
  disabled?: boolean;
  /** Accepted for native-select API parity; enforcement stays in form logic. */
  required?: boolean;
  /**
   * Show a type-to-filter search field at the top of the popover.
   * Defaults to automatic: on when there are more than 8 options.
   */
  searchable?: boolean;
  id?: string;
  className?: string;
  children?: React.ReactNode;
}

type ParsedOption = { value: string; label: React.ReactNode; disabled?: boolean };

function collectOptions(children: React.ReactNode, out: ParsedOption[]): void {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === "option") {
      const props = child.props as React.OptionHTMLAttributes<HTMLOptionElement>;
      out.push({
        value: String(props.value ?? ""),
        label: props.children,
        disabled: props.disabled,
      });
    } else if (child.type === React.Fragment || (child.props as { children?: React.ReactNode }).children) {
      collectOptions((child.props as { children?: React.ReactNode }).children, out);
    }
  });
}

/** Flatten a ReactNode option label to plain text for search matching. */
function labelToText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(labelToText).join("");
  if (React.isValidElement(node)) return labelToText((node.props as { children?: React.ReactNode }).children);
  return "";
}

const SEARCHABLE_AUTO_THRESHOLD = 8;

const SelectBox = ({ value, onChange, disabled, searchable, id, className, children }: SelectBoxProps) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const searchRef = React.useRef<HTMLInputElement>(null);

  const options: ParsedOption[] = [];
  collectOptions(children, options);
  const placeholder = options.find((o) => o.value === "");
  const items = options.filter((o) => o.value !== "");
  const selected = options.find((o) => o.value === value);

  const showSearch = searchable ?? items.length > SEARCHABLE_AUTO_THRESHOLD;
  const q = query.trim().toLowerCase();
  const visibleItems = showSearch && q
    ? items.filter((o) => labelToText(o.label).toLowerCase().includes(q) || o.value.toLowerCase().includes(q))
    : items;

  return (
    <Select
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
        else if (showSearch) setTimeout(() => searchRef.current?.focus(), 0);
      }}
      value={value === "" ? "" : value}
      onValueChange={(v) => onChange?.({ target: { value: v } })}
      disabled={disabled}
    >
      <SelectTrigger id={id} className={cn(className)}>
        {/* Render the selected option's label ourselves so value="" shows the placeholder */}
        <span className={cn("line-clamp-1 text-left", !selected || selected.value === "" ? "text-muted-foreground" : "")}>
          {selected ? selected.label : placeholder ? placeholder.label : "Select…"}
        </span>
      </SelectTrigger>
      <SelectContent>
        {showSearch && (
          <div className="sticky top-0 z-10 -m-1 mb-1 border-b border-border bg-popover p-1.5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="h-8 w-full rounded-sm border border-input bg-card pl-7 pr-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                onKeyDown={(e) => {
                  // Keep typing in the field; let Radix handle list nav + close
                  if (!["ArrowDown", "ArrowUp", "Enter", "Escape", "Tab"].includes(e.key)) {
                    e.stopPropagation();
                  }
                }}
              />
            </div>
          </div>
        )}
        {visibleItems.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">No matches found.</div>
        ) : (
          visibleItems.map((o, i) => (
            <SelectItem key={`${o.value}-${i}`} value={o.value} disabled={o.disabled}>
              {o.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};
SelectBox.displayName = "SelectBox";

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  NativeSelect,
  SelectBox,
};
