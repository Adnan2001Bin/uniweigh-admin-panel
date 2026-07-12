import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "@/src/lib/utils";

const Tabs = TabsPrimitive.Root;

/**
 * Industrial underline style: flat bar, active tab carries a 2px amber
 * bottom border. Use TabsList variant="pills" for compact filter chips.
 */
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & { variant?: "underline" | "pills" }
>(({ className, variant = "underline", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    data-variant={variant}
    className={cn(
      variant === "underline"
        ? "flex items-center gap-1 border-b border-border"
        : "inline-flex items-center gap-1 rounded-md bg-muted p-1",
      className
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-sm font-semibold text-muted-foreground transition-colors cursor-pointer",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "disabled:pointer-events-none disabled:opacity-50",
      // underline variant (parent data-variant)
      "[[data-variant=underline]_&]:-mb-px [[data-variant=underline]_&]:border-b-2 [[data-variant=underline]_&]:border-transparent [[data-variant=underline]_&]:px-3 [[data-variant=underline]_&]:py-2",
      "[[data-variant=underline]_&]:hover:text-foreground",
      "[[data-variant=underline]_&]:data-[state=active]:border-accent [[data-variant=underline]_&]:data-[state=active]:text-foreground",
      // pills variant
      "[[data-variant=pills]_&]:rounded-sm [[data-variant=pills]_&]:px-3 [[data-variant=pills]_&]:py-1",
      "[[data-variant=pills]_&]:data-[state=active]:bg-card [[data-variant=pills]_&]:data-[state=active]:text-foreground [[data-variant=pills]_&]:data-[state=active]:shadow-xs",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("mt-4 focus-visible:outline-none", className)}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
