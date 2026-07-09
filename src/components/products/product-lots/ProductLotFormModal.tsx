import React from "react";
import { X } from "lucide-react";
import { Product } from "../../../types";
import { ComputedProductLot } from "./utils/exportHelpers";

interface ProductLotFormModalProps {
  isOpen: boolean;
  editingLot: ComputedProductLot | null;
  products: Product[];
  formName: string;
  setFormName: (value: string) => void;
  formProductId: string;
  setFormProductId: (value: string) => void;
  formOrderQuantity: string;
  setFormOrderQuantity: (value: string) => void;
  formStatus: "Active" | "Completed" | "Pending";
  setFormStatus: (value: "Active" | "Completed" | "Pending") => void;
  formNotes: string;
  setFormNotes: (value: string) => void;
  onClose: () => void;
  onSave: (e?: React.FormEvent, addAnother?: boolean) => void;
}

export default function ProductLotFormModal({
  isOpen,
  editingLot,
  products,
  formName,
  setFormName,
  formProductId,
  setFormProductId,
  formOrderQuantity,
  setFormOrderQuantity,
  formStatus,
  setFormStatus,
  formNotes,
  setFormNotes,
  onClose,
  onSave
}: ProductLotFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden my-8">
        <div className="bg-slate-50 border-b border-gray-150 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
              {editingLot ? `Edit Product Lot - ${editingLot.id}` : "Add New Product Lot"}
            </h3>
            <p className="text-[10px] text-gray-500 font-bold">
              {editingLot ? "Update specific lot details" : "Configure a new material lot partition"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-slate-100 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={(e) => onSave(e, false)} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-600 uppercase tracking-wide block">
                Product Lot Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Lot A-42 or PL-123-001"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 focus:bg-white rounded-lg px-3 py-2 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-600 uppercase tracking-wide block">
                Product <span className="text-red-500">*</span>
              </label>
              <select
                value={formProductId}
                onChange={(e) => setFormProductId(e.target.value)}
                required
                className="w-full bg-slate-50 border border-gray-200 focus:bg-white rounded-lg px-3 py-2 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="" disabled>-- Select Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.productCode || p.id}] {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-600 uppercase tracking-wide block">
                Order Quantity (Tonnes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="e.g. 1500.00"
                value={formOrderQuantity}
                onChange={(e) => setFormOrderQuantity(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 focus:bg-white rounded-lg px-3 py-2 font-semibold font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-600 uppercase tracking-wide block">Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as "Active" | "Completed" | "Pending")}
                className="w-full bg-slate-50 border border-gray-200 focus:bg-white rounded-lg px-3 py-2 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed / Fully Used</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-600 uppercase tracking-wide block">Notes / Comments</label>
              <textarea
                rows={3}
                placeholder="Describe batch allocation, customer priority, or tracking terms..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 focus:bg-white rounded-lg px-3 py-2 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {editingLot && (
              <div className="mt-2 bg-slate-50 border border-slate-150 rounded-lg p-3.5 space-y-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                  System Calculated Values
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 block">Used Quantity</span>
                    <span className="font-mono font-bold text-emerald-700 text-sm">
                      {editingLot.usedQuantity.toFixed(2)} t
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 block">Remaining Quantity</span>
                    <span
                      className={`font-mono font-extrabold text-sm ${
                        editingLot.remainingQuantity < 0
                          ? "text-red-600"
                          : editingLot.remainingQuantity === 0
                          ? "text-gray-500"
                          : "text-blue-600"
                      }`}
                    >
                      {editingLot.remainingQuantity.toFixed(2)} t
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 font-bold select-none transition"
            >
              Cancel
            </button>

            {!editingLot && (
              <button
                type="button"
                onClick={() => onSave(undefined, true)}
                className="rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 font-black select-none transition"
              >
                Save & Add Another
              </button>
            )}

            <button
              type="submit"
              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-black tracking-wide shadow-sm select-none transition"
            >
              Save Product Lot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
