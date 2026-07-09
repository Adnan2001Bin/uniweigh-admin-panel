import React from "react";
import { Package, X, Check, DollarSign } from "lucide-react";
import { Product } from "../../../types";

interface ProductFormModalProps {
  isOpen: boolean;
  editingProduct: Product | null;
  formName: string;
  setFormName: (value: string) => void;
  formProductCode: string;
  setFormProductCode: (value: string) => void;
  formSite: string;
  setFormSite: (value: string) => void;
  formUnit: string;
  setFormUnit: (value: string) => void;
  formStatus: "Active" | "Inactive";
  setFormStatus: (value: "Active" | "Inactive") => void;
  formNotes: string;
  setFormNotes: (value: string) => void;
  formDefaultPrice: string;
  setFormDefaultPrice: (value: string) => void;
  formPriceLevel1: string;
  setFormPriceLevel1: (value: string) => void;
  formPriceLevel2: string;
  setFormPriceLevel2: (value: string) => void;
  formPriceLevel3: string;
  setFormPriceLevel3: (value: string) => void;
  formCustomPrice: string;
  setFormCustomPrice: (value: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ProductFormModal({
  isOpen,
  editingProduct,
  formName,
  setFormName,
  formProductCode,
  setFormProductCode,
  formSite,
  setFormSite,
  formUnit,
  setFormUnit,
  formStatus,
  setFormStatus,
  formNotes,
  setFormNotes,
  formDefaultPrice,
  setFormDefaultPrice,
  formPriceLevel1,
  setFormPriceLevel1,
  formPriceLevel2,
  setFormPriceLevel2,
  formPriceLevel3,
  setFormPriceLevel3,
  formCustomPrice,
  setFormCustomPrice,
  onClose,
  onSubmit
}: ProductFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-xs"
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10 animate-fade-in flex flex-col">
        <div className="sticky top-0 bg-slate-50 px-6 py-4 flex items-center justify-between shrink-0 z-10 shadow-xs">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <h3 className="font-extrabold text-sm text-gray-900">
              {editingProduct ? "Edit Product Specifications" : "Register New Product"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="pb-1">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">1. Product Core Specifications</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500">Product Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-slate-50 px-3 py-2 text-xs font-bold text-gray-800 shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Concrete Crusher Sand"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500">Product Code</label>
                <input
                  type="text"
                  required
                  value={formProductCode}
                  onChange={(e) => setFormProductCode(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold text-gray-800 shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. P-123"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500">Operating Site</label>
                <select
                  value={formSite}
                  onChange={(e) => setFormSite(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-gray-800 shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Melbourne Eastern Quarry">Melbourne Eastern Quarry</option>
                  <option value="Bayside Coastal Sands">Bayside Coastal Sands</option>
                  <option value="Western Eco-Recycling Depot">Western Eco-Recycling Depot</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500">Unit of Measure</label>
                <input
                  type="text"
                  required
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-gray-800 shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Default: Tonnes"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as "Active" | "Inactive")}
                  className="w-full rounded-lg border border-gray-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-gray-800 shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500">Product Notes / Specifications</label>
              <textarea
                rows={2}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-slate-50 p-3 text-xs font-semibold text-gray-600 shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter any material grades, origin descriptions, or compliance notes..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="pb-1">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">2. Product Pricing & Scale Levels</h4>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 shadow-xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-blue-900 flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-blue-600" />
                    Default Price ($ / {formUnit}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formDefaultPrice}
                    onChange={(e) => setFormDefaultPrice(e.target.value)}
                    className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-mono font-black text-blue-700 shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                  <p className="text-[9px] text-gray-400">Must be maintained for generic transactions.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700">Price Level 1 (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formPriceLevel1}
                    onChange={(e) => setFormPriceLevel1(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-mono text-gray-700 shadow-xs focus:outline-none"
                    placeholder="None"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700">Price Level 2 (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formPriceLevel2}
                    onChange={(e) => setFormPriceLevel2(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-mono text-gray-700 shadow-xs focus:outline-none"
                    placeholder="None"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700">Price Level 3 (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formPriceLevel3}
                    onChange={(e) => setFormPriceLevel3(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-mono text-gray-700 shadow-xs focus:outline-none"
                    placeholder="None"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 block">Custom Contract Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formCustomPrice}
                    onChange={(e) => setFormCustomPrice(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-mono text-gray-700 shadow-xs focus:outline-none"
                    placeholder="Managed inside Job"
                  />
                  <p className="text-[9px] text-gray-400 leading-normal">Used only when specifically selected within an active Job configuration.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white pt-4 flex gap-2 justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 bg-slate-50 hover:bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 shadow-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-black shadow-sm transition flex items-center gap-1"
            >
              <Check className="h-4 w-4" />
              Save Product specifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
