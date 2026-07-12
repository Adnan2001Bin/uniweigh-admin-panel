#!/usr/bin/env bash
# Design-system drift gates for UniWeigh.
# Fails if any component reintroduces raw Tailwind palette classes,
# arbitrary pixel font sizes, invalid classes, or radius/shadow drift.
# All styling must go through the semantic tokens in src/index.css.
set -u
fail=0

check() {
  local label="$1" pattern="$2"
  local hits
  hits=$(grep -Ern "$pattern" src/components --include='*.tsx' 2>/dev/null)
  if [ -n "$hits" ]; then
    echo "FAIL: $label"
    echo "$hits" | head -10
    fail=1
  else
    echo "PASS: $label"
  fi
}

# 1. Raw palette utilities (use bg-card/muted/primary/accent/success/... instead)
check "no raw palette classes" \
  '[a-z:.-]*(gray|slate|zinc|stone|neutral|emerald|green|blue|red|amber|yellow|violet|indigo|purple|sky|teal|orange|pink|rose|cyan|lime|fuchsia)-[0-9]'

# 2. Arbitrary pixel font sizes (use the text-xs..text-5xl scale)
check "no arbitrary px font sizes" 'text-\[[0-9]+px\]'

# 3. Weight discipline (font-medium/semibold/bold only)
check "no font-black/font-extrabold" 'font-(black|extrabold)'

# 4. Radius drift (cards rounded-lg, controls rounded-md)
check "no rounded-2xl/3xl" 'rounded-(2xl|3xl)'

# 5. Shadow drift (xs/sm surfaces, lg dialogs only)
check "no shadow-xl/2xl/invalid shadows" 'shadow-(xl|2xl|2xs|3xs|red)\b'

# 6. Native OS dialogs (use sonner toasts / confirmDialog / promptDialog)
check "no native alert/confirm/prompt" '(^|[^A-Za-z_.])(alert|confirm|prompt)\('

# 7. Native form controls (use SelectBox / Checkbox / RadioBox / Slider).
#    src/components/ui is exempt: the adapters wrapping the natives live there.
hits=$(grep -Ern '<select[^A-Za-z]|type="(checkbox|radio|range)"' src/components --include='*.tsx' 2>/dev/null | grep -v '^src/components/ui/')
if [ -n "$hits" ]; then
  echo "FAIL: no native select/checkbox/radio/range"
  echo "$hits" | head -10
  fail=1
else
  echo "PASS: no native select/checkbox/radio/range"
fi

exit $fail
