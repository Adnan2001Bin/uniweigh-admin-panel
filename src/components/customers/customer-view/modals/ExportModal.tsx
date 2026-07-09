import React from "react";
import { X, Download, RefreshCw } from "lucide-react";
import { Customer } from "../../../../types";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportScope: "current" | "selected" | "filtered" | "profile" | "txSummary" | "jobsReport";
  setExportScope: (value: "current" | "selected" | "filtered" | "profile" | "txSummary" | "jobsReport") => void;
  exportFormat: "CSV" | "Excel" | "PDF";
  setExportFormat: (value: "CSV" | "Excel" | "PDF") => void;
  isExporting: boolean;
  exportProgress: number;
  onExport: () => void;
  activeCustomer: Customer | null;
  totalCustomers: number;
  filteredCustomersCount: number;
  selectedIdsCount: number;
}

export default function ExportModal({
  isOpen,
  onClose,
  exportScope,
  setExportScope,
  exportFormat,
  setExportFormat,
  isExporting,
  exportProgress,
  onExport,
  activeCustomer,
  totalCustomers,
  filteredCustomersCount,
  selectedIdsCount
}: ExportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-150 shadow-2xl p-6 relative animate-zoom-in">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 transition">
          <X className="h-4.5 w-4.5" />
        </button>
        <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Download className="h-5 w-5 text-blue-600" />
          <span>Export Custom Customer Reports</span>
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Select report scope and output document format to generate bulk ledger dispatches.
        </p>

        {isExporting ? (
          <div className="space-y-4 py-6 text-center">
            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
            <div className="space-y-1.5 max-w-xs mx-auto">
              <div className="flex justify-between text-xs font-bold text-gray-600">
                <span>Compiling ledger records...</span>
                <span>{exportProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full transition-all duration-150" style={{ width: `${exportProgress}%` }} />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase text-gray-500">Report Scope</label>
              <select
                value={exportScope}
                onChange={(e) => setExportScope(e.target.value as any)}
                className="w-full text-xs rounded-lg border border-gray-220 bg-white p-2.5 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                <option value="current">Current Customer Directory List ({totalCustomers} total)</option>
                <option value="filtered">Filtered Customers Subset ({filteredCustomersCount} matching)</option>
                <option value="selected" disabled={selectedIdsCount === 0}>
                  Selected Customers Only ({selectedIdsCount} checked rows)
                </option>
                {activeCustomer && (
                  <>
                    <option value="profile">Individual Profile Dossier: {activeCustomer.name}</option>
                    <option value="txSummary">Customer Transaction Weight Ledger Summary</option>
                    <option value="jobsReport">Customer Project Jobs & Contracts Report</option>
                  </>
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase text-gray-500">Output Format</label>
              <div className="grid grid-cols-3 gap-2">
                {["CSV", "Excel", "PDF"].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setExportFormat(fmt as any)}
                    className={`py-2 rounded-lg border text-xs font-bold transition cursor-pointer text-center ${
                      exportFormat === fmt
                        ? "bg-blue-50 border-blue-600 text-blue-700"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-55"
                    }`}
                  >
                    {fmt === "CSV" ? "📄 CSV Plain" : fmt === "Excel" ? "📊 MS Excel" : "📕 PDF Document"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 pt-4 mt-5">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-55 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={onExport}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Download className="h-4 w-4" />
                <span>Generate Export File</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
