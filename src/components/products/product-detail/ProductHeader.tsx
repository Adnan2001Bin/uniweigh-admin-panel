import React from "react";
import { Package, Download, ArrowLeft } from "lucide-react";
import { Product } from "../../../types";

interface ProductHeaderProps {
  selectedProduct: Product;
  onBack?: () => void;
  onExport: () => void;
}

export default function ProductHeader({ selectedProduct, onBack, onExport }: ProductHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-gray-150 pb-3">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="rounded-lg border border-gray-200 hover:border-gray-300 bg-white hover:bg-slate-50 p-1.5 transition text-gray-500 hover:text-gray-900"
            title="Return to Product Listing"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            {selectedProduct.name} Profile Page
          </h2>
          <p className="text-xs text-gray-500 font-semibold">
            Product ID: <span className="font-mono text-gray-800">{selectedProduct.id}</span> • Code:{" "}
            <span className="font-mono text-gray-800">{selectedProduct.productCode || selectedProduct.id}</span>
          </p>
        </div>
      </div>

      <button
        onClick={onExport}
        className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg px-3.5 py-1.5 text-xs font-black tracking-wide shadow-sm flex items-center gap-1.5 transition select-none"
      >
        <Download className="h-4 w-4 text-gray-500" />
        Export Product Report
      </button>
    </div>
  );
}
