# UniWeigh Design System

High-contrast industrial: dark steel chrome, light content canvas, safety-amber
accent, sharp radii, borders over shadows, mono digits for data. **All styling
goes through the semantic tokens in `src/index.css` — never raw Tailwind
palette classes.** `npm run check:design` (also part of `npm run lint`)
enforces this.

## Tokens (`src/index.css`)

| Token | Use |
|---|---|
| `background` / `foreground` | Page canvas (light steel) / near-black ink text |
| `card` / `card-foreground` | White surfaces (cards, tables, panels) |
| `muted` / `muted-foreground` | Subtle fills (table headers, insets) / secondary text |
| `primary` / `primary-foreground` | Dark-ink actions (default buttons, solid chips) |
| `secondary` | Low-emphasis fills |
| `accent` / `accent-foreground` | Safety amber — active tab underline, highlights, clerk CTA |
| `success` / `warning` / `destructive` / `info` | Semantic states; soft chips use `/10` bg + `/25` border tints |
| `border` / `input` / `ring` | Hairlines / control borders / amber focus ring |
| `chart-1..5` | recharts palette via `chartColor(n)` from `src/lib/chart-theme.ts` |
| `sidebar-*` | Dark chrome family: Sidebar, Header, and ClerkView terminal panels |

Radius: `rounded-md` (4px) controls, `rounded-lg` (6px) cards, `rounded-sm` badges.
Shadows: `shadow-xs`/`shadow-sm` surfaces, `shadow-lg` dialogs only.
Type: Tailwind default scale (`text-xs` 12px … ), min legible size 12px, no `text-[Npx]`.
Weights: `font-medium`/`font-semibold` labels, `font-bold` max; micro-labels are
`text-xs font-semibold uppercase tracking-wider`. Numbers/IDs/weights/money:
`font-mono tabular-nums`.

## Components

Primitives (`src/components/ui/`): button, input, textarea, label, select,
checkbox, radio-group, switch, slider, badge, card, dialog, alert-dialog,
dropdown-menu, popover, tooltip, tabs, table, separator, skeleton, avatar,
sonner toaster. shadcn/ui-style, Radix-based (unified `radix-ui` package),
styled by the tokens above.

**Never use native form controls** (`<select>`, `<input type="checkbox">`,
`type="radio"`, `type="range"`) — the lint gate blocks them. Drop-in adapters
keep the native API so handlers don't change:

- **SelectBox** (`ui/select.tsx`) — native-select API (`value`, `onChange`
  with `e.target.value`, `<option>` children incl. mapped/conditional ones)
  rendered as the Radix popover. An `<option value="">` acts as the
  placeholder. A type-to-filter search field appears automatically when there
  are more than 8 options; force it with `searchable` (entity pickers should
  always set it — data grows). Use the full Radix `Select` parts directly for
  new code.
- **Checkbox** (`ui/checkbox.tsx`) — Radix; `onCheckedChange`.
- **RadioBox** (`ui/radio-group.tsx`) — for the `checked={x === v}
  onChange={() => setX(v)}` idiom; works inside a wrapping label. Use
  `RadioGroup`/`RadioGroupItem` for new code.
- **Slider** (`ui/slider.tsx`) — Radix; `value={[n]}` / `onValueChange`.

Composites (`src/components/shared/`):

- **StatusBadge** — the single status→color map for every status in
  `src/types.ts`. Never hand-color a status chip.
- **DataTable** — presentation-only table (views keep their own filter/sort
  state). Numeric columns get `mono: true`.
- **PageHeader**, **StatCard** (left accent rule + mono value), **Toolbar**,
  **EmptyState**, **ConfirmDialog**, **FormField**, **ChartCard** +
  `src/lib/chart-theme.ts`.
- **dialog-service** (`shared/dialog-service.tsx`) — promise-based
  `await confirmDialog(msg)` / `await promptDialog(msg)` rendered with the
  design-system dialogs; `<DialogHost />` is mounted in every App root branch.
  **Never use native `alert()` / `confirm()` / `prompt()`** — use
  `toast.success/error/info(...)` (sonner) for notifications and the dialog
  service for confirmations/input.

## Rules

1. New UI starts from `ui/` + `shared/` components; only compose with token
   utilities (`bg-card`, `text-muted-foreground`, `border-border`, …).
2. Dark contexts (Sidebar, Header, ClerkView terminal) use the `sidebar-*`
   family, amber (`sidebar-primary`) for accents, `.glow-accent` for LED-style
   weight readouts.
3. **Never edit inside print template strings** (`printWindow.document.write`
   / `const htmlContent = \`...\``) — they are isolated printed documents
   (dockets, invoices, exports) with their own intentional inline CSS.
4. Rebrand/retheme = edit the `:root` block in `src/index.css` only.
