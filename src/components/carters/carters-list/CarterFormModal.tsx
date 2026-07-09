import React from "react";
import { Truck, X, MapPin, Phone, DollarSign } from "lucide-react";

interface CarterFormModalProps {
  isOpen: boolean;
  formMode: "add" | "edit";
  editingCarterId: string | null;
  fieldName: string;
  setFieldName: (value: string) => void;
  fieldPhone: string;
  setFieldPhone: (value: string) => void;
  fieldEmail: string;
  setFieldEmail: (value: string) => void;
  fieldAddress: string;
  setFieldAddress: (value: string) => void;
  fieldRate: number;
  setFieldRate: (value: number) => void;
  fieldStatus: "Active" | "Inactive";
  setFieldStatus: (value: "Active" | "Inactive") => void;
  fieldNotes: string;
  setFieldNotes: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  onSaveAndAddAnother: () => void;
}

export default function CarterFormModal({
  isOpen,
  formMode,
  editingCarterId,
  fieldName,
  setFieldName,
  fieldPhone,
  setFieldPhone,
  fieldEmail,
  setFieldEmail,
  fieldAddress,
  setFieldAddress,
  fieldRate,
  setFieldRate,
  fieldStatus,
  setFieldStatus,
  fieldNotes,
  setFieldNotes,
  onClose,
  onSave,
  onSaveAndAddAnother
}: CarterFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-gray-200 max-w-lg w-full shadow-2xl overflow-hidden animate-zoom-in">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-slate-50 flex items-center justify-between">
          <h2 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <Truck className="h-4 w-4 text-blue-600" />
            {formMode === "add" ? "Register New Transport Carter" : `Modify Carter: ${editingCarterId}`}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Carter Name */}
          <div className="space-y-1.5">
            <label className="font-bold text-gray-500 block">Carter Name *</label>
            <input
              type="text"
              placeholder="Enter company/provider name..."
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
            />
          </div>

          {/* Physical Address */}
          <div className="space-y-1.5">
            <label className="font-bold text-gray-500 block">Physical Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="E.g., 12 Industrial Parkway, Somerton VIC"
                value={fieldAddress}
                onChange={(e) => setFieldAddress(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Contact Grid: Phone Number & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-gray-500 block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="E.g., 1300 551 229"
                  value={fieldPhone}
                  onChange={(e) => setFieldPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-500 block">Email Address</label>
              <input
                type="email"
                placeholder="dispatch@company.com"
                value={fieldEmail}
                onChange={(e) => setFieldEmail(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition font-mono"
              />
            </div>
          </div>

          {/* Rate & Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-gray-500 block">Transport Rate ($ / Tonne)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  placeholder="12.50"
                  value={fieldRate}
                  onChange={(e) => setFieldRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition font-mono"
                />
              </div>
            </div>

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
            <label className="font-bold text-gray-500 block">Carter Notes & Operational Directives</label>
            <textarea
              placeholder="Enter contract conditions, site limitations, or transport directives..."
              value={fieldNotes}
              onChange={(e) => setFieldNotes(e.target.value)}
              rows={3}
              className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
            />
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
            {formMode === "add" && (
              <button
                onClick={onSaveAndAddAnother}
                className="rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 px-4 py-2 text-xs font-extrabold text-blue-700 transition select-none"
              >
                Save & Add Another
              </button>
            )}
            <button
              onClick={onSave}
              className="rounded-lg bg-gray-900 hover:bg-gray-800 active:scale-95 text-white px-5 py-2 text-xs font-black transition shadow-xs select-none"
            >
              Save Carter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
