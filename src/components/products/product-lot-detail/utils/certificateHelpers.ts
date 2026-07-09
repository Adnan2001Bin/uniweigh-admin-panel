export interface DatasheetFile {
  name: string;
  size: string;
  uploadedAt: string;
}

export function getDefaultLotDatasheet(lotNumber: string): DatasheetFile {
  return {
    name: `SGS_Quality_Certificate_Lot_${lotNumber}.pdf`,
    size: "450 KB",
    uploadedAt: "2026-06-15 09:00"
  };
}
