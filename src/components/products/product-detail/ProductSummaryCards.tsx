import React from "react";
import { DollarSign, Building, FileText } from "lucide-react";
import { Product } from "../../../types";

interface ProductSummaryCardsProps {
  selectedProduct: Product;
  defaultPrice: number;
  p1Price?: number;
  p2Price?: number;
  p3Price?: number;
}

export default function ProductSummaryCards({
  selectedProduct,
  defaultPrice,
  p1Price,
  p2Price,
  p3Price
}: ProductSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div className="bg-white border border-gray-150 rounded-xl shadow-2xs overflow-hidden flex flex-col justify-between">
        <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center gap-2">
          <Building className="h-4 w-4 text-gray-400" />
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Product Details</h3>
        </div>
        <div className="p-5 space-y-3.5 flex-1">
          <div className="grid grid-cols-2 gap-y-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Product ID</span>
              <span className="font-bold text-gray-900 font-mono text-[13px]">{selectedProduct.id}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Product Code</span>
              <span className="font-bold text-gray-900 font-mono text-[13px]">
                {selectedProduct.productCode || selectedProduct.id}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Product Name</span>
              <span className="font-extrabold text-gray-950 text-[13px]">{selectedProduct.name}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Weighbridge Site</span>
              <span className="font-semibold text-gray-700 text-[13px]">
                {selectedProduct.site || "Melbourne Eastern Quarry"}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Unit of Measure</span>
              <span className="font-bold text-gray-700 text-[13px]">
                {selectedProduct.unitOfMeasure || "Tonnes"}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Status</span>
              <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-black border mt-1 ${
                  selectedProduct.status === "Active"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : "bg-red-50 text-red-700 border-red-100"
                }`}
              >
                {selectedProduct.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-150 rounded-xl shadow-2xs overflow-hidden flex flex-col justify-between">
        <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-blue-600" />
          <h3 className="text-xs font-black text-blue-800 uppercase tracking-widest">Central Pricing</h3>
        </div>
        <div className="p-5 flex-1 flex flex-col justify-between gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-2.5">
              <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest block">Default Price</span>
              <span className="text-base font-extrabold text-blue-800 font-mono">${defaultPrice.toFixed(2)}</span>
              <span className="text-[8px] text-gray-400 block mt-0.5">
                Per {selectedProduct.unitOfMeasure || "Tonne"}
              </span>
            </div>

            <div className="bg-slate-50 border border-gray-100 rounded-lg p-2.5">
              <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest block">Price Level 1</span>
              <span className="text-sm font-extrabold text-gray-800 font-mono">
                {p1Price !== undefined ? `$${p1Price.toFixed(2)}` : "Not Set"}
              </span>
            </div>

            <div className="bg-slate-50 border border-gray-100 rounded-lg p-2.5">
              <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest block">Price Level 2</span>
              <span className="text-sm font-extrabold text-gray-800 font-mono">
                {p2Price !== undefined ? `$${p2Price.toFixed(2)}` : "Not Set"}
              </span>
            </div>

            <div className="bg-slate-50 border border-gray-100 rounded-lg p-2.5">
              <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest block">Price Level 3</span>
              <span className="text-sm font-extrabold text-gray-800 font-mono">
                {p3Price !== undefined ? `$${p3Price.toFixed(2)}` : "Not Set"}
              </span>
            </div>
          </div>
          <p className="text-[9px] text-gray-400 leading-tight">
            These tier properties are maintained globally within the Product profile. Individual Job modules link to their preferred level on dispatch.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-150 rounded-xl shadow-2xs overflow-hidden flex flex-col justify-between">
        <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-400" />
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Product Notes</h3>
        </div>
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div className="bg-amber-50/40 border border-amber-100/60 rounded-lg p-3.5 text-xs text-amber-900 leading-relaxed font-medium italic min-h-[100px]">
            {selectedProduct.notes ||
              selectedProduct.description ||
              "No specific guidelines or product specifications recorded for this material register."}
          </div>
          <span className="text-[9px] text-gray-400 text-right block mt-2">Last updated by Admin Operator</span>
        </div>
      </div>
    </div>
  );
}
