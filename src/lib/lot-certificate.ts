import { ProductLot } from "../types";

export type LotCertificate = NonNullable<ProductLot["datasheets"]>[number];

export const MAX_LOT_CERTIFICATE_BYTES = 5 * 1024 * 1024;

export function formatCertificateSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatCertificateTimestamp(date = new Date()): string {
  return date.toISOString().replace("T", " ").slice(0, 16);
}

export async function readPdfCertificate(file: File): Promise<LotCertificate> {
  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    throw new Error("Only PDF certificate files are supported.");
  }

  if (file.size > MAX_LOT_CERTIFICATE_BYTES) {
    throw new Error("Each PDF must be 5 MB or smaller.");
  }

  const url = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read the PDF file."));
    reader.readAsDataURL(file);
  });

  return {
    name: file.name,
    size: formatCertificateSize(file.size),
    uploadedAt: formatCertificateTimestamp(),
    url,
  };
}

export function downloadLotCertificate(cert: LotCertificate): void {
  if (!cert.url) return;

  const link = document.createElement("a");
  link.href = cert.url;
  link.download = cert.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
