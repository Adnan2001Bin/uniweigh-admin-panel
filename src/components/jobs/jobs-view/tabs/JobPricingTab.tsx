import React from "react";
import { DollarSign, Download } from "lucide-react";
import { Job } from "../../../../types";

interface JobPricingTabProps {
  activeJob: Job;
  onExportPriceSheet: () => void;
}

export default function JobPricingTab({ activeJob, onExportPriceSheet }: JobPricingTabProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
          <DollarSign className="h-4.5 w-4.5 text-emerald-500" />
          <span>Contract Pricing Information</span>
        </h4>
        <button
          onClick={onExportPriceSheet}
          className="text-[10px] text-indigo-600 font-black flex items-center gap-0.8 hover:underline"
        >
          <Download className="h-3 w-3" />
          <span>Export Price Sheet</span>
        </button>
      </div>

      <div className="bg-slate-50 border border-slate-150 rounded-xl p-6 max-w-2xl">
        <div className="space-y-6">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Selected Pricing Type
            </span>
            <span className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-150">
              {activeJob.pricingType}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {activeJob.pricingType === "Custom Contract Price" && (
              <>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Custom Contract Rate
                  </span>
                  <span className="font-mono text-base font-black text-slate-900">
                    ${activeJob.appliedRate.toFixed(2)} / t
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Pricing Notes
                  </span>
                  <span className="text-gray-700 block font-medium">{activeJob.pricingNotes || "N/A"}</span>
                </div>
              </>
            )}

            {(activeJob.pricingType === "Product Tier 1" ||
              activeJob.pricingType === "Product Tier 2" ||
              activeJob.pricingType === "Product Tier 3") && (
              <>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Selected Tier
                  </span>
                  <span className="font-semibold text-slate-900 block">{activeJob.pricingType}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Applied Product Rate
                  </span>
                  <span className="font-mono text-base font-black text-slate-900">
                    ${activeJob.appliedRate.toFixed(2)} / t
                  </span>
                </div>
              </>
            )}

            {activeJob.pricingType === "Default Product Price" && (
              <>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Default Product Rate
                  </span>
                  <span className="font-mono text-base font-black text-slate-900">
                    ${activeJob.appliedRate.toFixed(2)} / t
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Pricing Notes
                  </span>
                  <span className="text-gray-700 block font-medium">{activeJob.pricingNotes || "N/A"}</span>
                </div>
              </>
            )}

            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Effective From
              </span>
              <span className="font-mono font-semibold text-slate-800 block">
                {activeJob.effectiveFrom || "N/A"}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Effective To
              </span>
              <span className="font-mono font-semibold text-slate-800 block">
                {activeJob.effectiveTo || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
