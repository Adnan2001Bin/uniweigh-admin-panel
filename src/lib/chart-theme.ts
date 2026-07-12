import type * as React from "react";

/**
 * Shared recharts theming — SVG resolves CSS variables in fill/stroke,
 * so every chart reads its colors from the design tokens in index.css.
 */
export function chartColor(n: 1 | 2 | 3 | 4 | 5): string {
  return `var(--chart-${n})`;
}

export const CHART_AXIS = {
  stroke: "var(--muted-foreground)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
} as const;

export const CHART_GRID = {
  stroke: "var(--border)",
  strokeDasharray: "3 3",
  vertical: false,
} as const;

export const CHART_TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  fontSize: "0.75rem",
  color: "var(--foreground)",
  boxShadow: "0 4px 12px -2px oklch(0.2 0.015 260 / 0.1)",
};
