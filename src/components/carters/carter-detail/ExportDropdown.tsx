import React from "react";
import { Download, ChevronDown, FileText } from "lucide-react";

interface ExportDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onExportCarterSummary: (format: "CSV" | "Excel" | "PDF") => void;
  onExportDrivers: (format: "CSV" | "PDF") => void;
  onExportVehicles: (format: "CSV" | "PDF") => void;
  onExportTransactions: (format: "CSV" | "PDF") => void;
}

export default function ExportDropdown({
  isOpen,
  onToggle,
  onExportCarterSummary,
  onExportDrivers,
  onExportVehicles,
  onExportTransactions
}: ExportDropdownProps) {
  return (
    <div className="relative self-start sm:self-auto">
      <button
        onClick={onToggle}
        className="rounded-lg border border-gray-200 bg-white hover:bg-gray-50 px-3.5 py-1.5 text-xs font-bold text-gray-700 transition flex items-center gap-1.5 select-none"
      >
        <Download className="h-3.5 w-3.5 text-gray-500" />
        Export Carter Data
        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1.5 z-20 text-xs">
          <div className="px-3 py-1 font-black text-gray-400 text-[9px] uppercase tracking-widest border-b border-gray-100 mb-1">
            Carter Profile Sheets
          </div>
          <button
            onClick={() => onExportCarterSummary("CSV")}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-semibold text-gray-700 flex items-center gap-2 text-[11px]"
          >
            <FileText className="h-3 w-3 text-emerald-600" />
            Export Carter Summary (CSV)
          </button>
          <button
            onClick={() => onExportCarterSummary("Excel")}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-semibold text-gray-700 flex items-center gap-2 text-[11px]"
          >
            <FileText className="h-3 w-3 text-blue-600" />
            Export Carter Summary (Excel)
          </button>
          <button
            onClick={() => onExportCarterSummary("PDF")}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-semibold text-gray-700 flex items-center gap-2 text-[11px]"
          >
            <FileText className="h-3 w-3 text-red-600" />
            Print Carter Summary PDF
          </button>

          <div className="px-3 py-1 font-black text-gray-400 text-[9px] uppercase tracking-widest border-b border-t border-gray-100 my-1">
            Linked Drivers Sheet
          </div>
          <button
            onClick={() => onExportDrivers("CSV")}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-semibold text-gray-700 flex items-center gap-2 text-[11px]"
          >
            <FileText className="h-3 w-3 text-emerald-600" />
            Export Drivers (CSV)
          </button>
          <button
            onClick={() => onExportDrivers("PDF")}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-semibold text-gray-700 flex items-center gap-2 text-[11px]"
          >
            <FileText className="h-3 w-3 text-red-600" />
            Print Drivers PDF
          </button>

          <div className="px-3 py-1 font-black text-gray-400 text-[9px] uppercase tracking-widest border-b border-t border-gray-100 my-1">
            Linked Vehicles Fleet
          </div>
          <button
            onClick={() => onExportVehicles("CSV")}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-semibold text-gray-700 flex items-center gap-2 text-[11px]"
          >
            <FileText className="h-3 w-3 text-emerald-600" />
            Export Vehicles (CSV)
          </button>
          <button
            onClick={() => onExportVehicles("PDF")}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-semibold text-gray-700 flex items-center gap-2 text-[11px]"
          >
            <FileText className="h-3 w-3 text-red-600" />
            Print Vehicles PDF
          </button>

          <div className="px-3 py-1 font-black text-gray-400 text-[9px] uppercase tracking-widest border-b border-t border-gray-100 my-1">
            Linked Transactions
          </div>
          <button
            onClick={() => onExportTransactions("CSV")}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-semibold text-gray-700 flex items-center gap-2 text-[11px]"
          >
            <FileText className="h-3 w-3 text-emerald-600" />
            Export Transactions (CSV)
          </button>
          <button
            onClick={() => onExportTransactions("PDF")}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-semibold text-gray-700 flex items-center gap-2 text-[11px]"
          >
            <FileText className="h-3 w-3 text-red-600" />
            Print Transactions PDF
          </button>
        </div>
      )}
    </div>
  );
}
