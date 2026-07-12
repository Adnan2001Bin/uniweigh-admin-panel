import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { Circle } from "lucide-react";
import { cn } from "@/src/lib/utils";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} ref={ref} />
));
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      "aspect-square size-4 rounded-full border border-input bg-card text-primary shadow-xs cursor-pointer",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:border-primary",
      className
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
      <Circle className="size-2.5 fill-primary text-primary" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = "RadioGroupItem";

/**
 * RadioBox — drop-in replacement for a native <input type="radio"> used with
 * the `checked={x === v} onChange={() => setX(v)}` idiom. Same visual as
 * RadioGroupItem; works inside a wrapping <label> (buttons are labelable).
 */
interface RadioBoxProps {
  checked: boolean;
  onChange?: () => void;
  disabled?: boolean;
  id?: string;
  className?: string;
}

const RadioBox = ({ checked, onChange, disabled, id, className }: RadioBoxProps) => (
  <button
    type="button"
    role="radio"
    aria-checked={checked}
    disabled={disabled}
    id={id}
    onClick={() => {
      if (!checked) onChange?.();
    }}
    className={cn(
      "inline-flex aspect-square size-4 shrink-0 items-center justify-center rounded-full border border-input bg-card text-primary shadow-xs cursor-pointer",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "disabled:cursor-not-allowed disabled:opacity-50",
      checked && "border-primary",
      className
    )}
  >
    {checked && <Circle className="size-2.5 fill-primary text-primary" />}
  </button>
);
RadioBox.displayName = "RadioBox";

export { RadioGroup, RadioGroupItem, RadioBox };
