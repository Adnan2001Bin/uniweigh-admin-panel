import React from "react";
import { Product } from "../../../../types";

interface ProductSpecTabProps {
  parentProduct: Product | null;
}

export default function ProductSpecTab({ parentProduct }: ProductSpecTabProps) {
  return (
    <div className="bg-white border border-gray-150 rounded-xl shadow-2xs p-6 space-y-6">
      <div>
        <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Parent Product Specifications</h3>
        <p className="text-[10px] text-gray-400 font-bold">Detailed specifications of the material associated with this batch.</p>
      </div>

      {parentProduct ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs">
          <div className="space-y-3.5">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-bold text-gray-500">Product ID</span>
              <span className="font-mono font-bold text-gray-900">{parentProduct.id}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-bold text-gray-500">Product Code</span>
              <span className="font-mono font-bold text-slate-800">
                {parentProduct.productCode || parentProduct.id}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-bold text-gray-500">Product Name</span>
              <span className="font-extrabold text-blue-700">{parentProduct.name}</span>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-bold text-gray-500">Weighbridge Site</span>
              <span className="font-extrabold text-gray-700">
                {parentProduct.site || "Melbourne Eastern Quarry"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-bold text-gray-500">Default Catalog Price</span>
              <span className="font-mono font-black text-slate-800">
                ${(parentProduct.defaultPrice ?? parentProduct.basePrice ?? 0).toFixed(2)} / tonne
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-bold text-gray-500">Catalog Status</span>
              <span
                className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-black border uppercase tracking-wide ${
                  parentProduct.status === "Active"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : "bg-red-50 text-red-700 border-red-100"
                }`}
              >
                {parentProduct.status}
              </span>
            </div>
          </div>

          {parentProduct.notes && (
            <div className="md:col-span-2 bg-slate-50 border border-slate-150 rounded-lg p-4 mt-2">
              <span className="text-[10px] font-bold text-gray-400 block mb-1">Product Description / Notes</span>
              <p className="text-gray-600 font-medium italic">{parentProduct.notes}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-400 italic text-center py-6">Parent product specifications are not loaded.</p>
      )}
    </div>
  );
}
