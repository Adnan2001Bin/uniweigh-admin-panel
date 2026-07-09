import React from "react";
import { CircleAlert, DollarSign } from "lucide-react";
import { Job } from "../../../../types";

interface PricingTabProps {
  defaultPrice: number;
  p1Price?: number;
  p2Price?: number;
  p3Price?: number;
  productJobs: Job[];
}

export default function PricingTab({ defaultPrice, p1Price, p2Price, p3Price, productJobs }: PricingTabProps) {
  const jobsByDefaultPrice = productJobs.filter(
    (j) => j.pricingType === "Default Product Price" || j.appliedRate === defaultPrice
  );
  const jobsByP1 = p1Price ? productJobs.filter((j) => j.pricingType === "Product Tier 1" || j.appliedRate === p1Price) : [];
  const jobsByP2 = p2Price ? productJobs.filter((j) => j.pricingType === "Product Tier 2" || j.appliedRate === p2Price) : [];
  const jobsByP3 = p3Price ? productJobs.filter((j) => j.pricingType === "Product Tier 3" || j.appliedRate === p3Price) : [];
  const jobsByCustom = productJobs.filter((j) => j.pricingType === "Custom Contract Price");

  return (
    <div className="space-y-6">
      <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <CircleAlert className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-black text-blue-900 uppercase tracking-wide">Pricing Ownership Rule</h4>
          <p className="text-[11px] text-blue-800 leading-normal mt-1">
            Products own the base and scale levels. Individual Jobs subscribe to a pricing strategy, which locks the contract price on delivery tickets. Lots never affect ticket valuation metrics. Editing these properties can only be performed via the Product List edit action.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-xs">
        <div className="bg-white border border-gray-150 rounded-xl p-4 shadow-3xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
              <span className="font-extrabold text-gray-900">Default Price</span>
              <span className="font-mono font-black text-blue-700 text-sm">${defaultPrice.toFixed(2)}</span>
            </div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">
              Jobs Subscribing ({jobsByDefaultPrice.length})
            </span>
            {jobsByDefaultPrice.length === 0 ? (
              <p className="text-[11px] text-gray-400 italic">No active contracts using Default Price.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {jobsByDefaultPrice.map((j) => (
                  <div key={j.id} className="bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="font-bold text-gray-800 block">{j.id}</span>
                    <span className="text-[10px] text-gray-500">{j.customerName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-150 rounded-xl p-4 shadow-3xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
              <span className="font-extrabold text-gray-900">Price Level 1</span>
              <span className="font-mono font-black text-gray-700 text-sm">
                {p1Price !== undefined ? `$${p1Price.toFixed(2)}` : "Not Config"}
              </span>
            </div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">
              Jobs Subscribing ({jobsByP1.length})
            </span>
            {p1Price === undefined ? (
              <p className="text-[11px] text-gray-400 italic">Level is not configured.</p>
            ) : jobsByP1.length === 0 ? (
              <p className="text-[11px] text-gray-400 italic">No active contracts using Price Level 1.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {jobsByP1.map((j) => (
                  <div key={j.id} className="bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="font-bold text-gray-800 block">{j.id}</span>
                    <span className="text-[10px] text-gray-500">{j.customerName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-150 rounded-xl p-4 shadow-3xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
              <span className="font-extrabold text-gray-900">Price Level 2</span>
              <span className="font-mono font-black text-gray-700 text-sm">
                {p2Price !== undefined ? `$${p2Price.toFixed(2)}` : "Not Config"}
              </span>
            </div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">
              Jobs Subscribing ({jobsByP2.length})
            </span>
            {p2Price === undefined ? (
              <p className="text-[11px] text-gray-400 italic">Level is not configured.</p>
            ) : jobsByP2.length === 0 ? (
              <p className="text-[11px] text-gray-400 italic">No active contracts using Price Level 2.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {jobsByP2.map((j) => (
                  <div key={j.id} className="bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="font-bold text-gray-800 block">{j.id}</span>
                    <span className="text-[10px] text-gray-500">{j.customerName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-150 rounded-xl p-4 shadow-3xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
              <span className="font-extrabold text-gray-900">Price Level 3</span>
              <span className="font-mono font-black text-gray-700 text-sm">
                {p3Price !== undefined ? `$${p3Price.toFixed(2)}` : "Not Config"}
              </span>
            </div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">
              Jobs Subscribing ({jobsByP3.length})
            </span>
            {p3Price === undefined ? (
              <p className="text-[11px] text-gray-400 italic">Level is not configured.</p>
            ) : jobsByP3.length === 0 ? (
              <p className="text-[11px] text-gray-400 italic">No active contracts using Price Level 3.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {jobsByP3.map((j) => (
                  <div key={j.id} className="bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="font-bold text-gray-800 block">{j.id}</span>
                    <span className="text-[10px] text-gray-500">{j.customerName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-amber-50/20 border border-amber-100 rounded-xl p-4 shadow-3xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-amber-200 pb-2 mb-2">
              <span className="font-extrabold text-amber-900">Custom Contract</span>
              <span className="font-semibold text-amber-800">Variable</span>
            </div>
            <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest block mb-2">
              Jobs Subscribing ({jobsByCustom.length})
            </span>
            {jobsByCustom.length === 0 ? (
              <p className="text-[11px] text-amber-600/70 italic">No active custom-linked jobs.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {jobsByCustom.map((j) => (
                  <div key={j.id} className="bg-amber-100/30 p-2 rounded border border-amber-100/50">
                    <span className="font-bold text-amber-900 block">{j.id}</span>
                    <span className="text-[10px] text-amber-800/80 block leading-tight">{j.customerName}</span>
                    <span className="text-[9px] font-mono font-black text-amber-900 block mt-1">
                      Rate: ${(j.customProductRate ?? j.appliedRate ?? 0).toFixed(2)}/t
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
