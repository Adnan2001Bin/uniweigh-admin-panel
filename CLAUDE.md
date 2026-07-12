# UniWeigh Admin Panel

React 19 + Vite + TypeScript + Tailwind CSS v4 (CSS-first theming, no config
file). No router — `activeView` switch in `src/App.tsx`; state persists to
localStorage (`uniweigh_*` keys).

- **Read `DESIGN.md` before touching any UI.** All styling goes through the
  semantic tokens in `src/index.css` and the components in
  `src/components/ui/` and `src/components/shared/` — never raw Tailwind
  palette classes (`gray-500`, `blue-600`, …) or `text-[Npx]` sizes.
- `npm run lint` = typecheck + design-drift gates (`scripts/check-design.sh`).
  It must pass before committing.
- Never edit inside print template strings (`printWindow.document.write` /
  `const htmlContent = \`...\``) — they are isolated printed documents.
