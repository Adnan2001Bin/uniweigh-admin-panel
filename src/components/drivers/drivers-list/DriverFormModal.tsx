import React from "react";
import { User, X } from "lucide-react";
import { Carrier } from "../../../types";

interface DriverFormModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  editingDriverId: string | null;
  carriers: Carrier[];
  carterNames: string[];
  fieldName: string;
  setFieldName: (value: string) => void;
  fieldLicence: string;
  setFieldLicence: (value: string) => void;
  fieldPhone: string;
  setFieldPhone: (value: string) => void;
  fieldCarterName: string;
  setFieldCarterName: (value: string) => void;
  fieldStatus: "Active" | "Inactive";
  setFieldStatus: (value: "Active" | "Inactive") => void;
  fieldNotes: string;
  setFieldNotes: (value: string) => void;
  onClose: () => void;
  onSave: (andAddAnother?: boolean) => void;
}

export default function DriverFormModal({
  isOpen,
  mode,
  editingDriverId,
  carterNames,
  fieldName,
  setFieldName,
  fieldLicence,
  setFieldLicence,
  fieldPhone,
  setFieldPhone,
  fieldCarterName,
  setFieldCarterName,
  fieldStatus,
  setFieldStatus,
  fieldNotes,
  setFieldNotes,
  onClose,
  onSave
}: DriverFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-gray-200 max-w-xl w-full shadow-2xl overflow-hidden animate-zoom-in">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-slate-50 flex items-center justify-between">
          <h2 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            {mode === "add" ? "Register New Logistics Driver" : `Edit Driver Details: ${editingDriverId}`}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-wider border-b border-gray-100 pb-1.5">
              Driver Specification details
            </h3>

            {/* Driver Name */}
            <div className="space-y-1.5">
              <label className="font-bold text-gray-500 block">Driver Name *</label>
              <input
                type="text"
                placeholder="E.g., David Miller"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Licence Number */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-500 block">Licence Number *</label>
                <input
                  type="text"
                  placeholder="E.g., VIC-110293Y"
                  value={fieldLicence}
                  onChange={(e) => setFieldLicence(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition font-mono uppercase"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-500 block">Phone Number</label>
                <input
                  type="text"
                  placeholder="E.g., 0499 123 456"
                  value={fieldPhone}
                  onChange={(e) => setFieldPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Carter Link */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-500 block">Carter Company *</label>
                <select
                  value={fieldCarterName}
                  onChange={(e) => setFieldCarterName(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
                >
                  {carterNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-500 block">Status</label>
                <select
                  value={fieldStatus}
                  onChange={(e) => setFieldStatus(e.target.value as "Active" | "Inactive")}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="font-bold text-gray-500 block">Operational Notes</label>
              <textarea
                placeholder="Enter special site access compliance notes, inductions completed, or safety records..."
                value={fieldNotes}
                onChange={(e) => setFieldNotes(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-slate-50 flex flex-wrap items-center justify-between gap-2.5">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2 text-xs font-bold text-gray-700 transition select-none"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {mode === "add" && (
              <button
                onClick={() => onSave(true)}
                className="rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 px-4 py-2 text-xs font-extrabold text-blue-700 transition select-none"
              >
                Save & Add Another
              </button>
            )}
            <button
              onClick={() => onSave(false)}
              className="rounded-lg bg-gray-900 hover:bg-gray-800 active:scale-95 text-white px-5 py-2 text-xs font-black transition shadow-xs select-none"
            >
              Save Driver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
