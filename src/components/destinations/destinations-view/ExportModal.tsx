import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, X, FileSpreadsheet, FileText } from "lucide-react";
import { Destination, Transaction } from "../../../types";
import {
  executeDestinationExport,
  ExportScope,
  ExportFormat
} from "./utils/exportHelpers";

interface ExportModalProps {
  show: boolean;
  onClose: () => void;
  exportScope: ExportScope;
  setExportScope: (scope: ExportScope) => void;
  exportFormat: ExportFormat;
  setExportFormat: (format: ExportFormat) => void;
  destinations: Destination[];
  filteredDestinations: Destination[];
  checkedDestIds: string[];
  activeDestination: Destination | null;
  linkedTransactions: Transaction[];
  statusFilter: string;
  customerFilter: string;
  currentMode: string;
  showToast: (msg: string) => void;
}

export default function ExportModal({
  show,
  onClose,
  exportScope,
  setExportScope,
  exportFormat,
  setExportFormat,
  destinations,
  filteredDestinations,
  checkedDestIds,
  activeDestination,
  linkedTransactions,
  statusFilter,
  customerFilter,
  currentMode,
  showToast
}: ExportModalProps) {
  const handleExport = () => {
    executeDestinationExport({
      exportScope,
      exportFormat,
      destinations,
      filteredDestinations,
      checkedDestIds,
      activeDestination,
      linkedTransactions,
      statusFilter,
      customerFilter,
      currentMode,
      showToast,
      onComplete: onClose
    });
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md bg-white border border-slate-150 rounded-xl shadow-xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-gray-150 px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-700">
                <Download className="h-4.5 w-4.5" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Export Logistics Gateway Reports
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Export Scope Select */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Report Data Scope
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="exportScope"
                      checked={exportScope === "current"}
                      onChange={() => setExportScope("current")}
                      className="text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div>
                      <span>Current Destinations Ledger</span>
                      <span className="block text-[9px] font-medium text-slate-400">
                        Export complete registered destinations directory ({destinations.length}{" "}
                        records)
                      </span>
                    </div>
                  </label>

                  {checkedDestIds.length > 0 && (
                    <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="exportScope"
                        checked={exportScope === "selected"}
                        onChange={() => setExportScope("selected")}
                        className="text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <span>Selected Destinations ({checkedDestIds.length})</span>
                        <span className="block text-[9px] font-medium text-slate-400">
                          Export only explicitly ticked destination points
                        </span>
                      </div>
                    </label>
                  )}

                  <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="exportScope"
                      checked={exportScope === "filtered"}
                      onChange={() => setExportScope("filtered")}
                      className="text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div>
                      <span>Filtered Destinations ledger ({filteredDestinations.length})</span>
                      <span className="block text-[9px] font-medium text-slate-400">
                        Export based on active search parameters & status/customer filters
                      </span>
                    </div>
                  </label>

                  {currentMode === "detail" && activeDestination && (
                    <>
                      <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer">
                        <input
                          type="radio"
                          name="exportScope"
                          checked={exportScope === "individual-summary"}
                          onChange={() => setExportScope("individual-summary")}
                          className="text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <div>
                          <span>Destination Summary profile</span>
                          <span className="block text-[9px] font-medium text-slate-400">
                            Export profile summary sheet for {activeDestination.id}
                          </span>
                        </div>
                      </label>

                      {linkedTransactions.length > 0 && (
                        <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer">
                          <input
                            type="radio"
                            name="exportScope"
                            checked={exportScope === "destination-transactions"}
                            onChange={() => setExportScope("destination-transactions")}
                            className="text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <div>
                            <span>
                              Destination Transactions ledger ({linkedTransactions.length})
                            </span>
                            <span className="block text-[9px] font-medium text-slate-400">
                              Export historical weighbridge transit lists linked to this location
                            </span>
                          </div>
                        </label>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Export format buttons */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Export Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      id: "CSV",
                      label: "CSV Spreadsheet",
                      icon: FileSpreadsheet,
                      style: "text-blue-600 bg-blue-50 border-blue-200"
                    },
                    {
                      id: "Excel",
                      label: "Microsoft Excel",
                      icon: FileSpreadsheet,
                      style: "text-emerald-700 bg-emerald-50 border-emerald-200"
                    },
                    {
                      id: "PDF",
                      label: "Printable PDF",
                      icon: FileText,
                      style: "text-red-600 bg-red-50 border-red-200"
                    }
                  ].map((fmt) => {
                    const isFmtSelected = exportFormat === fmt.id;
                    const Icon = fmt.icon;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setExportFormat(fmt.id as ExportFormat)}
                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border text-center transition cursor-pointer ${
                          isFmtSelected
                            ? `${fmt.style} ring-1 ring-offset-1 ring-slate-400 font-bold`
                            : "bg-white border-slate-150 hover:bg-slate-50 font-semibold"
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${isFmtSelected ? "" : "text-gray-400"}`} />
                        <span className="text-[10px]">{fmt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-gray-150 px-4 py-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.8 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="px-4 py-1.8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition cursor-pointer flex items-center gap-1.5"
              >
                <Download className="h-3.8 w-3.8" />
                <span>Execute Download</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
