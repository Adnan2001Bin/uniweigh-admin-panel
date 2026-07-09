import React from "react";
import { X, Download } from "lucide-react";
import { ExportTarget } from "../utils/exportHelpers";

interface ExportProductModalProps {
  isOpen: boolean;
  exportTarget: ExportTarget;
  setExportTarget: (value: ExportTarget) => void;
  exportFormat: "CSV" | "Excel" | "PDF";
  setExportFormat: (value: "CSV" | "Excel" | "PDF") => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ExportProductModal({
  isOpen,
  exportTarget,
  setExportTarget,
  exportFormat,
  setExportFormat,
  onClose,
  onSubmit
}: ExportProductModalProps) {
  if (!isOpen) return null;

  const targets: { id: ExportTarget; label: string }[] = [
    { id: "summary", label: "Product Summary" },
    { id: "lots", label: "Product Lots" },
    { id: "jobs", label: "Jobs Using Product" },
    { id: "transactions", label: "Product Transactions" },
    { id: "pricing", label: "Product Pricing Flows" },
    { id: "all", label: "All Combined Metrics" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" />
      <div className="relative bg-white rounded-xl border border-gray-150 p-6 shadow-xl max-w-md w-full space-y-4 z-10 text-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-extrabold text-sm text-gray-900">Export Product Data Matrix</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-500 block">1. Select Data Segment to Export</label>
            <div className="grid grid-cols-2 gap-2">
              {targets.map((target) => (
                <label
                  key={target.id}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer font-bold text-gray-700 transition ${
                    exportTarget === target.id
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-white border-gray-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="exportTarget"
                    checked={exportTarget === target.id}
                    onChange={() => setExportTarget(target.id)}
                    className="text-blue-600 focus:ring-blue-500 h-3 w-3"
                  />
                  {target.label}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-500 block">2. Select Export Document Format</label>
            <div className="flex gap-3">
              {(["CSV", "Excel", "PDF"] as const).map((fmt) => (
                <label
                  key={fmt}
                  className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg border cursor-pointer font-bold text-gray-700 transition ${
                    exportFormat === fmt
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-white border-gray-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="exportFormat"
                    checked={exportFormat === fmt}
                    onChange={() => setExportFormat(fmt)}
                    className="text-blue-600 focus:ring-blue-500 h-3 w-3"
                  />
                  {fmt}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-xs font-black transition flex items-center justify-center gap-1.5"
            >
              <Download className="h-4 w-4" />
              Generate Download
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 text-xs font-bold transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
