import { AlertTriangle } from "lucide-react";
import { Transaction } from "../../../types";

interface TicketPricingSectionProps {
  transaction: Transaction;
}

export default function TicketPricingSection({ transaction }: TicketPricingSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
          Estimated Receivables Invoice Bill
        </h4>
        <p className="text-xs text-gray-500">
          Pricing structure auto-calculated based on bulk product standard catalogs and tonnage parameters.
        </p>
      </div>

      <div className="rounded-xl border border-green-150 bg-green-50/20 p-5 space-y-4">
        <div className="flex justify-between text-xs">
          <span className="font-semibold text-gray-500">Net Carged Weight:</span>
          <span className="font-bold text-slate-800">{transaction.netWeight.toFixed(2)} Tonnes</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="font-semibold text-gray-500">Price per unit Tonne (standard list rate):</span>
          <span className="font-bold text-slate-800">${transaction.basePrice.toFixed(2)}</span>
        </div>
        <hr className="border-green-100" />
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-slate-700 block">Estimated subtotal value:</span>
            <span className="text-xs text-gray-400">Exclusive of GST standard taxes</span>
          </div>
          <span className="text-2xl font-black font-mono text-emerald-700">
            ${transaction.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-yellow-100 bg-yellow-50/30 p-4 flex gap-3 text-xs leading-normal">
        <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-yellow-904 block uppercase tracking-wider text-[10px] mb-0.5">
            Security warning
          </span>
          <p className="text-yellow-800">
            This calculation refers to simulated pricing tiers. Real client bills are finalized during formal invoicing cycles, taking into account negotiated active contract terms and tax credit options.
          </p>
        </div>
      </div>
    </div>
  );
}
