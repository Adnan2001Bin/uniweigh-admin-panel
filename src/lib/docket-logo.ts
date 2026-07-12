export const MAX_DOCKET_LOGO_BYTES = 2 * 1024 * 1024;

const ACCEPTED_LOGO_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
]);

export function hasDocketLogo(logoUrl?: string): boolean {
  return Boolean(logoUrl?.trim());
}

export async function readDocketLogo(file: File): Promise<string> {
  const isImage =
    ACCEPTED_LOGO_TYPES.has(file.type) ||
    /\.(png|jpe?g|webp|svg)$/i.test(file.name);

  if (!isImage) {
    throw new Error("Only PNG, JPG, WebP, or SVG logo files are supported.");
  }

  if (file.size > MAX_DOCKET_LOGO_BYTES) {
    throw new Error("Logo image must be 2 MB or smaller.");
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read the logo file."));
    reader.readAsDataURL(file);
  });
}
