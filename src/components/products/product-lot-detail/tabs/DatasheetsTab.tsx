import React from "react";
import { FileText, Download, Info } from "lucide-react";
import { ProductLot } from "../../../../types";
import { DatasheetFile } from "../utils/certificateHelpers";

interface DatasheetsTabProps {
  selectedLot: ProductLot;
  lotDatasheets: DatasheetFile[];
}

export default function DatasheetsTab({ selectedLot, lotDatasheets }: DatasheetsTabProps) {
  return (
    <div className="bg-white border border-gray-150 rounded-xl p-6 shadow-2xs space-y-6 text-xs">
      <div>
        <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center justify-between">
          <span>Lot Quality Certifications & Lab Specifications</span>
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
            {selectedLot.lotNumber}
          </span>
        </h3>
        <p className="text-[10px] text-gray-400 font-bold mt-1">
          Material safety, composition analysis, and quality standards for this active batch lot.
        </p>
      </div>

      {lotDatasheets.length === 0 ? (
        <div className="bg-slate-50 rounded-lg p-6 text-center text-gray-400 italic font-medium">
          No quality certificates registered for this specific lot.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lotDatasheets.map((ds, idx) => (
            <div
              key={idx}
              className="border border-gray-150 rounded-xl p-4 flex items-center justify-between gap-4 bg-slate-50/40 hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="bg-amber-50 text-amber-700 p-2.5 rounded-lg shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="font-extrabold text-gray-800 block truncate" title={ds.name}>
                    {ds.name}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium block mt-0.5">
                    {ds.size} • Uploaded {ds.uploadedAt}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  alert(`Downloading certificate: ${ds.name}. In a production environment, this serves the real lab certified document.`);
                }}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white border border-transparent hover:border-gray-200 rounded-lg transition shrink-0 cursor-pointer"
                title="Download Cert"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50/50 border border-blue-100/70 rounded-xl p-4 flex items-start gap-3 mt-4">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-black text-blue-950 block text-[11px] uppercase tracking-wider">
            Need to Register a New Certificate?
          </span>
          <p className="text-[11px] text-blue-800 leading-normal mt-0.5 font-medium">
            New laboratory analysis and quality certificates can be registered, named, and uploaded directly through the main{" "}
            <strong>Product Specifications Panel &rsaquo; Data Sheets & Certs</strong> tab.
          </p>
        </div>
      </div>
    </div>
  );
}
