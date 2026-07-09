import React from "react";
import { ExternalLink } from "lucide-react";
import { Transaction, TransactionStatus } from "../../../../types";

interface TransactionsTabProps {
  linkedTransactions: Transaction[];
  transportRate: number;
  onViewTicketDetails: (ticketId: string) => void;
}

export default function TransactionsTab({
  linkedTransactions,
  transportRate,
  onViewTicketDetails
}: TransactionsTabProps) {
  return (
    <div className="bg-white border border-gray-150 rounded-xl shadow-2xs overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Transport Transactions Log</h3>
          <p className="text-[10px] text-gray-400 font-bold">Durable ledger records and dynamically calculated cartage fees ($) for this Carter.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-150 bg-slate-50 text-[10px] font-black text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3">Transaction ID</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Ticket Number</th>
              <th className="px-6 py-3">Transaction Code</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Job</th>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Driver</th>
              <th className="px-6 py-3">Vehicle</th>
              <th className="px-6 py-3 text-right">Net Weight</th>
              <th className="px-6 py-3 text-right font-bold text-emerald-700">Cartage Amount</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-center">Created Date</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {linkedTransactions.length === 0 ? (
              <tr>
                <td colSpan={14} className="py-12 text-center text-xs text-gray-400 font-medium">
                  No transactions registered under this Carter's account.
                </td>
              </tr>
            ) : (
              linkedTransactions.map((tx) => {
                const cartageAmt = tx.netWeight * transportRate;
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-bold font-mono text-gray-900">{tx.id}</td>
                    <td className="px-6 py-4 font-semibold text-gray-700">{tx.type || "Account"}</td>
                    <td className="px-6 py-4 font-bold font-mono text-gray-600">{tx.ticketNo}</td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-500">{tx.transactionCode || "N/A"}</td>
                    <td className="px-6 py-4">
                      <span className="font-extrabold text-gray-900 block">{tx.customerName}</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold bg-slate-50 rounded text-[10px] text-gray-600 px-1.5 py-0.5 text-center shrink-0">
                      {tx.jobOrder}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{tx.productName}</td>
                    <td className="px-6 py-4 font-semibold text-gray-700">{tx.driverName}</td>
                    <td className="px-6 py-4 font-mono text-gray-600">{tx.vehicleReg}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">
                      {tx.netWeight.toFixed(2)} t
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-black text-emerald-700 bg-emerald-50/20">
                      ${cartageAmt.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-black border uppercase tracking-wider ${
                          tx.status === TransactionStatus.APPROVED || tx.status === TransactionStatus.COMMITTED || tx.status === TransactionStatus.INVOICED
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : tx.status === TransactionStatus.CANCELLED
                            ? "bg-red-50 text-red-700 border-red-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-[10px] font-bold text-gray-500">
                      {tx.firstWeighTime ? tx.firstWeighTime.split(" ")[0] : "2026-06-22"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => onViewTicketDetails(tx.id)}
                        className="rounded-md border border-gray-200 hover:border-blue-200 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-700 p-1 px-2.5 text-[10px] font-black transition flex items-center gap-1 mx-auto select-none font-sans"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Ticket
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
