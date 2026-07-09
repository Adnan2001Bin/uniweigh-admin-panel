export interface DatasheetFile {
  name: string;
  size: string;
  uploadedAt: string;
}

export function getDefaultProductDatasheets(productName: string): DatasheetFile[] {
  return [
    {
      name: `${productName.replace(/\s+/g, "_")}_Technical_Specification_v4.pdf`,
      size: "1.4 MB",
      uploadedAt: "2026-05-12 10:30"
    },
    {
      name: "Material_Safety_Data_Sheet_MSDS_Compliance.pdf",
      size: "820 KB",
      uploadedAt: "2026-06-01 14:15"
    }
  ];
}

export function getDefaultLotDatasheet(lotNumber: string): DatasheetFile {
  return {
    name: `SGS_Quality_Certificate_Lot_${lotNumber}.pdf`,
    size: "450 KB",
    uploadedAt: "2026-06-15 09:00"
  };
}
