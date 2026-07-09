import React from "react";
import { Download, X } from "lucide-react";
import { Job } from "../../../types";
import { ExportScope } from "./utils/exportHelpers";

interface JobExportModalProps {
  show: boolean;
  isExporting: boolean;
  exportProgress: number;
  exportMessage: string;
  exportScope: ExportScope;
  setExportScope: (scope: ExportScope) => void;
  exportFormat: "CSV" | "Excel" | "PDF";
  setExportFormat: (format: "CSV" | "Excel" | "PDF") => void;
  jobsCount: number;
  checkedJobIds: string[];
  filteredJobs: Job[];
  activeJob: Job | null;
  activeJobTransactionsCount: number;
  onClose: () => void;
  onExport: (scope: ExportScope, format: "CSV" | "Excel" | "PDF") => void;
}

export default function JobExportModal({
  show,
  isExporting,
  exportProgress,
  exportMessage,
  exportScope,
  setExportScope,
  exportFormat,
  setExportFormat,
  jobsCount,
  checkedJobIds,
  filteredJobs,
  activeJob,
  activeJobTransactionsCount,
  onClose,
  onExport
}: JobExportModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fade-in text-xs text-slate-700">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
            <Download className="h-5 w-5 text-indigo-600 shrink-0" />
            <span>Export Job Contract Reports</span>
          </h4>
          <button
            disabled={isExporting}
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {isExporting ? (
          <div className="py-6 space-y-4 text-center">
            <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 bottom-0 bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between font-bold text-slate-500 font-mono text-[11px]">
              <span>{exportMessage}</span>
              <span className="text-slate-800 font-black">{exportProgress}%</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Export Source Scope selection */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                Select Data Payload scope
              </label>
              <select
                value={exportScope}
                onChange={(e) => setExportScope(e.target.value as ExportScope)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500"
              >
                <option value="current">All Jobs list directory ({jobsCount})</option>
                {checkedJobIds.length > 0 && (
                  <option value="selected">Selected checked Jobs ({checkedJobIds.length})</option>
                )}
                <option value="filtered">Filtered jobs list ({filteredJobs.length})</option>
                {activeJob && (
                  <>
                    <option value="individual">Job {activeJob.id} Summary card</option>
                    <option value="txs">
                      Job {activeJob.id} Delivery Transaction ledger ({activeJobTransactionsCount})
                    </option>
                    <option value="pricing">Job {activeJob.id} Contract Pricing audit rule sheet</option>
                  </>
                )}
              </select>
            </div>

            {/* Export Format selection */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Select Document Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["CSV", "Excel", "PDF"].map((fmt) => {
                  const isSelected = exportFormat === fmt;
                  return (
                    <div
                      key={fmt}
                      onClick={() => setExportFormat(fmt as "CSV" | "Excel" | "PDF")}
                      className={`cursor-pointer rounded-xl border p-2.5 text-center font-bold text-xs select-none transition-all ${
                        isSelected
                          ? "bg-indigo-50 border-indigo-400 text-indigo-700 font-black"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {fmt}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description footer */}
            <p className="text-[10px] text-gray-400 leading-normal">
              Reports generated under back-office compliance directory are cryptographically sealed with auditor timestamps.
            </p>

            {/* Dialog actions */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={onClose}
                className="px-3.5 py-1.8 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => onExport(exportScope, exportFormat)}
                className="px-4 py-1.8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm"
              >
                Generate Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
