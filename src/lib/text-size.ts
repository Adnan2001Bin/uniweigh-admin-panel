export type TextSize = "small" | "medium" | "large";

export const TEXT_SIZE_STORAGE_KEY = "uniweigh_text_size";

export const TEXT_SIZE_OPTIONS: { id: TextSize; label: string; hint: string }[] = [
  { id: "small", label: "Small", hint: "Compact labels and tables" },
  { id: "medium", label: "Medium", hint: "Default readability" },
  { id: "large", label: "Large", hint: "Increased legibility" },
];

export function normalizeTextSize(value: string | null | undefined): TextSize {
  if (value === "small" || value === "large") return value;
  return "medium";
}

export function loadTextSize(): TextSize {
  return normalizeTextSize(localStorage.getItem(TEXT_SIZE_STORAGE_KEY));
}

export function applyTextSize(size: TextSize): void {
  document.documentElement.dataset.textSize = size;
}

export function saveTextSize(size: TextSize): void {
  localStorage.setItem(TEXT_SIZE_STORAGE_KEY, size);
  applyTextSize(size);
}
