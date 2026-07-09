import { FileText, FileSpreadsheet, FileCheck, X } from "lucide-react";

interface ExportModalProps {
  exportScope: string;
  exportFormat: string;
  setExportFormat: (format: string) => void;
  onCancel: () => void;
  onGenerate: () => void;
  isExporting: boolean;
  exportMessage: string;
}

export default function ExportModal({
  exportScope,
  exportFormat,
  setExportFormat,
  onCancel,
  onGenerate,
  isExporting,
  exportMessage,
}: ExportModalProps) {
  return (
    <>
      {exportScope && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-150 shadow-2xl p-6 relative animate-zoom-in">
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider mb-2">
              Export Configuration
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Exporting transaction list based on selected scope:{" "}
              <span className="font-bold text-gray-800 uppercase bg-gray-100 px-1.5 py-0.5 rounded">
                {exportScope === "current" && "Current Page View"}
                {exportScope === "selected" && "Manually Checked Rows"}
                {exportScope === "filtered" && "Filtered Results"}
                {exportScope === "all" && "All Registry Data"}
                {exportScope === "invoicing" && "Invoicing Queue Ledger"}
              </span>
            </p>

            <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">
              Select Output Format
            </label>
            <div className="grid grid-cols-3 gap-2.5 mb-6">
              {["CSV", "Excel", "PDF"].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setExportFormat(fmt)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2.5 rounded-xl border-2 text-xs font-semibold cursor-pointer transition ${
                    exportFormat === fmt
                      ? "border-blue-600 bg-blue-50/50 text-blue-800"
                      : "border-gray-150 bg-white text-gray-600 hover:border-gray-250"
                  }`}
                >
                  {fmt === "CSV" && (
                    <FileText className="h-5 w-5 text-gray-500" />
                  )}
                  {fmt === "Excel" && (
                    <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                  )}
                  {fmt === "PDF" && (
                    <FileCheck className="h-5 w-5 text-red-500" />
                  )}
                  <span>{fmt} Spreadsheet</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onGenerate}
                className="px-4 py-2 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 transition"
              >
                Generate & Export
              </button>
            </div>
          </div>
        </div>
      )}

      {isExporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-150 shadow-2xl p-6 max-w-sm w-full text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
            <h4 className="text-sm font-bold text-gray-950 uppercase tracking-widest">
              Generating Export
            </h4>
            <p className="text-xs text-gray-500 font-mono bg-gray-50 p-2.5 rounded border border-gray-100">
              {exportMessage}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
