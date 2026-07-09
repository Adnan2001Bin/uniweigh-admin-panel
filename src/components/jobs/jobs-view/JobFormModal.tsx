import React from "react";
import { motion } from "motion/react";
import { Briefcase, Check, FileCheck2, Layers, DollarSign } from "lucide-react";
import { Customer, Product, Job } from "../../../types";
import { ProductRates } from "./utils/pricingHelpers";

interface JobFormModalProps {
  mode: "add" | "edit";
  editingJobId: string | null;
  customers: Customer[];
  products: Product[];
  availableRates: ProductRates;
  computedAppliedRate: number;
  formOrderRef: string;
  setFormOrderRef: (value: string) => void;
  formCustomerId: string;
  setFormCustomerId: (value: string) => void;
  formProductId: string;
  setFormProductId: (value: string) => void;
  formOrderQty: number;
  setFormOrderQty: (value: number) => void;
  formNotes: string;
  setFormNotes: (value: string) => void;
  formStatus: "Active" | "Completed" | "Suspended";
  setFormStatus: (value: "Active" | "Completed" | "Suspended") => void;
  formPricingType: Job["pricingType"];
  setFormPricingType: (value: Job["pricingType"]) => void;
  formCustomRate: number;
  setFormCustomRate: (value: number) => void;
  formPricingNotes: string;
  setFormPricingNotes: (value: string) => void;
  formEffectiveFrom: string;
  setFormEffectiveFrom: (value: string) => void;
  formEffectiveTo: string;
  setFormEffectiveTo: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function JobFormModal({
  mode,
  editingJobId,
  customers,
  products,
  availableRates,
  computedAppliedRate,
  formOrderRef,
  setFormOrderRef,
  formCustomerId,
  setFormCustomerId,
  formProductId,
  setFormProductId,
  formOrderQty,
  setFormOrderQty,
  formNotes,
  setFormNotes,
  formStatus,
  setFormStatus,
  formPricingType,
  setFormPricingType,
  formCustomRate,
  setFormCustomRate,
  formPricingNotes,
  setFormPricingNotes,
  formEffectiveFrom,
  setFormEffectiveFrom,
  formEffectiveTo,
  setFormEffectiveTo,
  onSubmit,
  onCancel
}: JobFormModalProps) {
  return (
    <motion.form
      key="jobs-form-mode"
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <div className="bg-white border border-gray-100 rounded-2xl shadow-md overflow-hidden divide-y divide-gray-100">
        {/* Form Title Banner */}
        <div className="bg-slate-50/50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                {mode === "add" ? "Create New Project Job" : `Modify Job Contract Rules [${editingJobId}]`}
              </h3>
              <p className="text-[11px] text-gray-500">
                Provide procurement quotas, customer mapping, and contract locked rates.
              </p>
            </div>
          </div>
          <span className="font-mono text-xs text-slate-400">
            {mode === "add" ? "Draft Mode" : "Modifying Live Contract"}
          </span>
        </div>

        {/* SECTION 1: JOB DETAILS */}
        <div className="p-6 space-y-4">
          <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2">
            <Layers className="h-4 w-4 text-blue-500" />
            <span>Job Details & Target Quotas</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Order Reference */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Customer Order Reference <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. PO-2026-APEX"
                value={formOrderRef}
                onChange={(e) => setFormOrderRef(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 hover:border-gray-250 focus:bg-white text-xs font-semibold text-gray-900 rounded-lg px-3 py-2 shadow-xs focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400"
              />
            </div>

            {/* Status selection */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Job Status
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                className="w-full bg-slate-50 border border-gray-200 hover:border-gray-250 focus:bg-white text-xs font-semibold text-gray-900 rounded-lg px-3 py-2 shadow-xs focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400"
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Suspended">Suspended (Locks delivery transactions)</option>
              </select>
            </div>

            {/* Customer Selection */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Associated Customer <span className="text-red-500">*</span>
              </label>
              <select
                value={formCustomerId}
                onChange={(e) => setFormCustomerId(e.target.value)}
                disabled={mode === "edit"}
                className="w-full bg-slate-50 border border-gray-200 text-xs font-semibold text-gray-900 rounded-lg px-3 py-2 shadow-xs focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 disabled:bg-slate-100 disabled:text-gray-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.id}] {c.name} ({c.pricingTier || "Standard"})
                  </option>
                ))}
              </select>
            </div>

            {/* Product Selection */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Material Product <span className="text-red-500">*</span>
              </label>
              <select
                value={formProductId}
                onChange={(e) => setFormProductId(e.target.value)}
                disabled={mode === "edit"}
                className="w-full bg-slate-50 border border-gray-200 text-xs font-semibold text-gray-900 rounded-lg px-3 py-2 shadow-xs focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 disabled:bg-slate-100 disabled:text-gray-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.id}] {p.name} (Base: ${p.basePrice.toFixed(2)}/t)
                  </option>
                ))}
              </select>
            </div>

            {/* Order Quantity in Tonnes */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Order Quantity quota (Tonnes) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  required
                  value={formOrderQty}
                  onChange={(e) => setFormOrderQty(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-gray-200 hover:border-gray-250 focus:bg-white text-xs font-semibold text-gray-900 rounded-lg px-3 py-2 shadow-xs focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400"
                />
                <span className="absolute right-3 top-2 text-[10px] font-black text-gray-400 uppercase">t</span>
              </div>
            </div>

            {/* Notes */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Operational Quota Notes
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Delivery sites, access codes, project limits..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 hover:border-gray-250 focus:bg-white text-xs font-medium text-gray-900 rounded-lg px-3 py-2 shadow-xs focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: PRODUCT & CONTRACT PRICING */}
        <div className="p-6 space-y-4 bg-slate-50/20">
          <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            <span>Product & Contract pricing details</span>
          </h4>

          {/* Available catalog price info panel */}
          <div className="bg-slate-100/50 rounded-xl p-4 border border-slate-150 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Product Tier 1 Rate
              </span>
              <span className="font-mono font-bold text-slate-900">${availableRates.tier1.toFixed(2)} /t</span>
            </div>
            <div>
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Product Tier 2 Rate
              </span>
              <span className="font-mono font-bold text-slate-900">${availableRates.tier2.toFixed(2)} /t</span>
            </div>
            <div>
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Product Tier 3 Rate
              </span>
              <span className="font-mono font-bold text-slate-900">${availableRates.tier3.toFixed(2)} /t</span>
            </div>
            <div>
              {formPricingType === "Custom Contract Price" ? (
                <>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Custom Contract Rate
                  </span>
                  <span className="font-mono font-bold text-emerald-700">${formCustomRate.toFixed(2)} /t</span>
                </>
              ) : (
                <>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Default Product Rate
                  </span>
                  <span className="font-mono font-bold text-slate-700">${availableRates.basePrice.toFixed(2)} /t</span>
                </>
              )}
            </div>
          </div>

          {/* Dropdown for selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Pricing Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formPricingType}
                onChange={(e) => setFormPricingType(e.target.value as Job["pricingType"])}
                className="w-full bg-slate-50 border border-gray-200 hover:border-gray-250 focus:bg-white text-xs font-semibold text-gray-900 rounded-lg px-3 py-2 shadow-xs focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400"
              >
                <option value="Default Product Price">
                  Default Product Price (${availableRates.basePrice.toFixed(2)}/t)
                </option>
                <option value="Product Tier 1">Product Tier 1 (${availableRates.tier1.toFixed(2)}/t)</option>
                <option value="Product Tier 2">Product Tier 2 (${availableRates.tier2.toFixed(2)}/t)</option>
                <option value="Product Tier 3">Product Tier 3 (${availableRates.tier3.toFixed(2)}/t)</option>
                <option value="Custom Contract Price">Custom Contract Price</option>
              </select>
            </div>

            {/* Conditional custom rate field */}
            {formPricingType === "Custom Contract Price" ? (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Custom Contract Rate ($/Tonne) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.10"
                    value={formCustomRate}
                    onChange={(e) => setFormCustomRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-gray-200 text-xs font-bold text-gray-900 rounded-lg pl-6 pr-3 py-2 shadow-xs focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Applied Rate (Auto calculated)
                </label>
                <input
                  type="text"
                  readOnly
                  value={`$${computedAppliedRate.toFixed(2)} / tonne`}
                  className="w-full bg-slate-100 border border-gray-200 text-xs font-bold text-gray-500 rounded-lg px-3 py-2 shadow-xs select-none"
                />
              </div>
            )}
          </div>

          {/* Additional Pricing Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Pricing Notes / Reason
              </label>
              <input
                type="text"
                placeholder="e.g. Contract rate override, winter promo"
                value={formPricingNotes}
                onChange={(e) => setFormPricingNotes(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 text-xs text-gray-900 rounded-lg px-3 py-2 shadow-xs focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Effective From
              </label>
              <input
                type="date"
                value={formEffectiveFrom}
                onChange={(e) => setFormEffectiveFrom(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 text-xs text-gray-900 rounded-lg px-3 py-2 shadow-xs focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Effective To
              </label>
              <input
                type="date"
                value={formEffectiveTo}
                onChange={(e) => setFormEffectiveTo(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 text-xs text-gray-900 rounded-lg px-3 py-2 shadow-xs focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400"
              />
            </div>
          </div>

          {/* Applied Summary Locked Panel */}
          <div className="bg-emerald-50 border border-emerald-150 rounded-xl px-5 py-3 flex items-center justify-between mt-3 text-xs shadow-xs">
            <div className="flex items-center gap-2 text-emerald-900">
              <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
              <div>
                <strong className="block text-[11px] font-black uppercase tracking-wider">
                  Locked Contract Job pricing rate:
                </strong>
                <span className="text-gray-600 text-[10.5px]">
                  This locked rate applies across all transactional invoicing. Product Lots ignore standard adjustments.
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Final Applied Job Rate</span>
              <strong className="text-lg text-emerald-800 font-mono">${computedAppliedRate.toFixed(2)}/t</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Form actions row */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-white border border-gray-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs transition"
        >
          Cancel Changes
        </button>
        <button
          type="submit"
          className="px-5 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition"
        >
          <FileCheck2 className="h-4.5 w-4.5" />
          <span>Save Supply Job Contract</span>
        </button>
      </div>
    </motion.form>
  );
}
