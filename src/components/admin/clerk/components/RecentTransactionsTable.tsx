import React from "react";
import { Printer } from "lucide-react";
import { Transaction } from "../../../../types";

interface RecentTransactionsTableProps {
  transactions: Transaction[];
  onPrint: (tx: Transaction) => void;
}

export default function RecentTransactionsTable({ transactions, onPrint }: RecentTransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-sm text-gray-400">
        No transactions recorded yet. Completed tickets will appear here for quick reprinting.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-100 text-[11px] font-medium uppercase tracking-wider text-gray-400">
            <th className="px-5 py-3">Ticket / Time</th>
            <th className="px-5 py-3">Customer & Vehicle</th>
            <th className="px-5 py-3">Product / Lot</th>
            <th className="px-5 py-3 text-right">Net Weight</th>
            <th className="px-5 py-3 text-right">Type / Value</th>
            <th className="px-5 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {transactions.map((tx) => (
            <tr key={tx.id || tx.ticketNo} className="text-sm transition-colors hover:bg-gray-50/60">
              <td className="px-5 py-3.5">
                <span className="font-mono text-sm font-medium text-gray-900">{tx.ticketNo}</span>
                <span className="mt-0.5 block text-xs text-gray-400">{tx.firstWeighTime}</span>
              </td>
              <td className="px-5 py-3.5">
                <span className="block max-w-[200px] truncate font-medium text-gray-800" title={tx.customerName}>
                  {tx.customerName}
                </span>
                <span className="mt-1 inline-block rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] uppercase text-gray-500">
                  {tx.vehicleReg}
                </span>
              </td>
              <td className="px-5 py-3.5">
                <span className="block font-medium text-gray-700">{tx.productName}</span>
                {tx.lotNo && (
                  <span className="mt-1 inline-block rounded bg-sky-50 px-1.5 py-0.5 text-[11px] font-medium text-sky-700 ring-1 ring-sky-100">
                    Lot {tx.lotNo}
                  </span>
                )}
              </td>
              <td className="px-5 py-3.5 text-right">
                <span className="font-mono text-sm font-medium text-gray-900">{tx.netWeight.toFixed(2)} t</span>
              </td>
              <td className="px-5 py-3.5 text-right">
                {tx.type === "Account" ? (
                  <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 ring-1 ring-blue-100">
                    Account
                  </span>
                ) : (
                  <div>
                    <span className="block font-mono text-sm font-medium text-emerald-700">${tx.totalValue.toFixed(2)}</span>
                    <span className="mt-0.5 block text-[11px] text-amber-600/80">Cash sale</span>
                  </div>
                )}
              </td>
              <td className="px-5 py-3.5 text-center">
                <button
                  type="button"
                  onClick={() => onPrint(tx)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                  title="Print copy of this docket"
                >
                  <Printer className="h-3.5 w-3.5 text-blue-500" />
                  <span>Reprint</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
