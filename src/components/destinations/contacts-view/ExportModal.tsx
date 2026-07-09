import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, X, FileText, FileSpreadsheet, FileDown } from "lucide-react";
import { DestinationContact } from "../../../types";
import {
  executeContactsExport,
  ContactsExportType,
  ContactsExportFormat,
} from "./utils/exportHelpers";

interface ExportModalProps {
  show: boolean;
  onClose: () => void;
  exportType: ContactsExportType;
  setExportType: (type: ContactsExportType) => void;
  exportFormat: ContactsExportFormat;
  setExportFormat: (format: ContactsExportFormat) => void;
  filteredContacts: DestinationContact[];
  contacts: DestinationContact[];
  selectedContactIds: string[];
  selectedContact: DestinationContact | null;
  currentMode: string;
  showToast: (msg: string) => void;
}

export default function ExportModal({
  show,
  onClose,
  exportType,
  setExportType,
  exportFormat,
  setExportFormat,
  filteredContacts,
  contacts,
  selectedContactIds,
  selectedContact,
  currentMode,
  showToast,
}: ExportModalProps) {
  const handleExport = () => {
    executeContactsExport({
      exportType,
      exportFormat,
      filteredContacts,
      contacts,
      selectedContactIds,
      selectedContact,
      showToast,
      onComplete: onClose,
    });
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl max-w-md w-full border border-gray-200 shadow-2xl overflow-hidden text-xs text-gray-755"
          >
            {/* Header */}
            <div className="border-b border-gray-150 p-4 flex justify-between items-center bg-slate-50/70">
              <div className="flex items-center gap-2">
                <FileDown className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-black text-gray-950">
                  Export Contacts Report Wizard
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded text-gray-400 hover:bg-gray-150 hover:text-gray-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 font-semibold text-gray-700">
              {/* Scope selector */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase text-gray-400 tracking-wider">
                  Report scope & Filter target
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded">
                    <input
                      type="radio"
                      name="exportScope"
                      checked={exportType === "all_filtered"}
                      onChange={() => setExportType("all_filtered")}
                      className="text-blue-600 focus:ring-blue-550"
                    />
                    <div>
                      <span className="font-bold text-gray-900 block">
                        All current directory entries ({filteredContacts.length}
                        )
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        Exports all contacts matching current active search &
                        filters.
                      </span>
                    </div>
                  </label>

                  {selectedContactIds.length > 0 && (
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded">
                      <input
                        type="radio"
                        name="exportScope"
                        checked={exportType === "selected"}
                        onChange={() => setExportType("selected")}
                        className="text-blue-600 focus:ring-blue-550"
                      />
                      <div>
                        <span className="font-bold text-indigo-700 block">
                          Selected entries ({selectedContactIds.length})
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          Exports only checked table rows.
                        </span>
                      </div>
                    </label>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded">
                    <input
                      type="radio"
                      name="exportScope"
                      checked={exportType === "safety"}
                      onChange={() => setExportType("safety")}
                      className="text-blue-600 focus:ring-blue-550"
                    />
                    <div>
                      <span className="font-bold text-emerald-700 block">
                        Safety contacts report
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        Generates listing focusing purely on safety
                        coordinators.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded">
                    <input
                      type="radio"
                      name="exportScope"
                      checked={exportType === "site_access"}
                      onChange={() => setExportType("site_access")}
                      className="text-blue-600 focus:ring-blue-550"
                    />
                    <div>
                      <span className="font-bold text-blue-700 block">
                        Site access contacts report
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        Listing of contacts certified for driver induction
                        gating.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded">
                    <input
                      type="radio"
                      name="exportScope"
                      checked={exportType === "emergency"}
                      onChange={() => setExportType("emergency")}
                      className="text-blue-600 focus:ring-blue-550"
                    />
                    <div>
                      <span className="font-bold text-rose-700 block">
                        Emergency contacts report
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        Evacuation and emergency responders dispatcher report.
                      </span>
                    </div>
                  </label>

                  {selectedContact && currentMode === "detail" && (
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded">
                      <input
                        type="radio"
                        name="exportScope"
                        checked={exportType === "profile"}
                        onChange={() => setExportType("profile")}
                        className="text-blue-600 focus:ring-blue-550"
                      />
                      <div>
                        <span className="font-bold text-purple-700 block">
                          Individual Contact Profile card
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          Export all safety, access, and details for{" "}
                          {selectedContact.name}.
                        </span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Format selection */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase text-gray-400 tracking-wider">
                  Target Report File Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "CSV", icon: FileText, label: "CSV" },
                    { id: "Excel", icon: FileSpreadsheet, label: "Excel" },
                    { id: "PDF", icon: FileDown, label: "PDF / Print" },
                  ].map((fmt) => {
                    const Icon = fmt.icon;
                    const isFmtSelected = exportFormat === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() =>
                          setExportFormat(fmt.id as ContactsExportFormat)
                        }
                        className={`border rounded-lg p-3 text-center transition cursor-pointer flex flex-col items-center gap-1.5 font-bold ${
                          isFmtSelected
                            ? "border-blue-600 bg-blue-50/50 text-blue-750"
                            : "border-gray-220 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{fmt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-150 p-4 bg-slate-50/80 flex items-center justify-end gap-3.5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-220 bg-white text-xs font-bold text-gray-700 px-4 py-2 hover:bg-gray-50 transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="rounded-lg bg-blue-600 text-xs font-bold text-white px-5 py-2 hover:bg-blue-750 transition cursor-pointer flex items-center gap-1 shadow"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Report</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
