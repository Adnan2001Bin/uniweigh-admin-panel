import { Scale, Clock } from "lucide-react";
import { Transaction } from "../../../types";

interface TicketWeightSummaryProps {
  transaction: Transaction;
}

export default function TicketWeightSummary({ transaction }: TicketWeightSummaryProps) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
          Bulk Materials & Loaded weight readings
        </h4>
        <p className="text-xs text-gray-500">
          Calculated mass measurements registered by legal-for-trade load cells during inbound and outbound operations.
        </p>
      </div>

      <div className="rounded-xl border border-blue-50 bg-blue-50/20 p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-1 opacity-10">
          <Scale className="h-28 w-28 text-blue-900" />
        </div>
        <h4 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-1">
          <Scale className="h-3.5 w-3.5" />
          Weighbridge Scale Readings (In & Out)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center items-center">
          <div className="rounded-lg bg-white p-3 border border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Gross Weight (Weigh-In)</div>
            <div className="text-lg font-bold font-mono text-gray-900 mt-1">
              {transaction.grossWeight.toFixed(2)} t
            </div>
            <span className="text-[10px] text-gray-400 block truncate" title={transaction.scaleIdInbound}>
              {transaction.scaleIdInbound}
            </span>
          </div>

          <div className="flex items-center justify-center text-xs font-bold text-gray-400">
            ― minus tare weight ―
          </div>

          <div className="rounded-lg bg-white p-3 border border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Tare Weight (Weigh-Out)</div>
            <div className="text-lg font-bold font-mono text-gray-900 mt-1">
              {transaction.tareWeight.toFixed(2)} t
            </div>
            <span className="text-[10px] text-gray-400 block truncate" title={transaction.scaleIdOutbound}>
              {transaction.scaleIdOutbound}
            </span>
          </div>
        </div>

        <div className="mt-4 border-t border-blue-50/60 pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-slate-500">Loaded Cargo Item:</span>
            <span className="text-sm font-bold text-slate-900 block mt-0.5">{transaction.productName}</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-600 block mb-0.5">Total Net Cargo:</span>
            <span className="text-xl font-black font-mono text-blue-700 bg-blue-50/70 border border-blue-150 px-3.5 py-1 rounded-md inline-block">
              {transaction.netWeight.toFixed(2)} Tonnes
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 border-b border-gray-100 pb-5">
        <div className="p-3 bg-gray-50 border border-gray-150 rounded-lg">
          <div className="text-xs text-gray-400 font-bold flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-gray-400" />
            Inbound entry time
          </div>
          <div className="text-xs font-semibold text-slate-800 font-mono mt-1">
            {transaction.firstWeighTime}
          </div>
        </div>
        <div className="p-3 bg-gray-50 border border-gray-150 rounded-lg">
          <div className="text-xs text-gray-400 font-bold flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-gray-400" />
            Outbound resolution time
          </div>
          <div className="text-xs font-semibold text-slate-800 font-mono mt-1">
            {transaction.secondWeighTime}
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
          Weighbridge scale comments
        </h4>
        <div className="p-4 rounded-lg bg-amber-50/20 border border-amber-100 text-xs font-medium italic text-amber-900">
          &ldquo;{transaction.comments || "No comments registered during transaction lifecycle."}&rdquo;
        </div>
      </div>
    </div>
  );
}
