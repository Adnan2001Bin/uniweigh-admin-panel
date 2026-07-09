import React from "react";
import { Layers, Clock, Calendar } from "lucide-react";
import { ProductLot } from "../../../types";

interface ProductLotSummaryCardProps {
  selectedLot: ProductLot;
  displayedStatus: string;
  usedQuantity: number;
  remainingQuantity: number;
}

export default function ProductLotSummaryCard({
  selectedLot,
  displayedStatus,
  usedQuantity,
  remainingQuantity
}: ProductLotSummaryCardProps) {
  return (
    <div className="bg-white border border-gray-150 rounded-xl p-6 shadow-2xs">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-5 mb-5">
        <div className="space-y-1">
          <span className="bg-blue-50 text-blue-700 font-mono font-bold text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-sm border border-blue-100">
            Product Lot Profile
          </span>
          <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-600" />
            {selectedLot.name}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-semibold text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-gray-300" />
              Lot ID: <strong className="text-gray-600 font-mono font-bold">{selectedLot.id}</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-gray-300" />
              Registered: <strong className="text-gray-600">{selectedLot.createdDate || "N/A"}</strong>
            </span>
          </div>
        </div>

        <div className="self-start md:self-auto">
          <span
            className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-black border uppercase tracking-wider ${
              displayedStatus === "Completed"
                ? "bg-slate-100 text-slate-700 border-slate-200"
                : displayedStatus === "Active"
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-amber-50 text-amber-700 border-amber-100"
            }`}
          >
            {displayedStatus === "Completed" ? "Fully Used / Completed" : displayedStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-50/50 border border-gray-100 rounded-lg p-4">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Order Quantity</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-gray-900 font-mono">
              {selectedLot.orderQuantity.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500 font-bold">Tonnes</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 font-semibold">Total quantity allocated for batch.</p>
        </div>

        <div className="bg-emerald-50/20 border border-emerald-100/50 rounded-lg p-4">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-1">Used Quantity</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-emerald-800 font-mono">{usedQuantity.toFixed(2)}</span>
            <span className="text-xs text-emerald-600/70 font-bold">Tonnes</span>
          </div>
          <p className="text-[10px] text-emerald-600/60 mt-1 font-semibold">Summed weight from approved records.</p>
        </div>

        <div className="bg-blue-50/20 border border-blue-100/50 rounded-lg p-4">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">Remaining Quantity</span>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-xl font-black font-mono ${
                remainingQuantity < 0 ? "text-red-700" : "text-blue-800"
              }`}
            >
              {remainingQuantity.toFixed(2)}
            </span>
            <span className="text-xs text-blue-600/70 font-bold">Tonnes</span>
          </div>
          <p className="text-[10px] text-blue-600/60 mt-1 font-semibold">Capacity remaining for processing.</p>
        </div>
      </div>

      <div className="bg-slate-50 border border-gray-150 rounded-lg p-4 text-xs">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">
          Lot Notes & Directives
        </span>
        <p className="font-medium text-gray-700 whitespace-pre-line leading-relaxed">
          {selectedLot.notes || "No notes, comments, or custom directives provided for this batch lot."}
        </p>
      </div>
    </div>
  );
}
