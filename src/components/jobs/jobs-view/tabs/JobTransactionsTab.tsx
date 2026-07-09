import React from "react";
import { Activity, Download, Eye } from "lucide-react";
import { Transaction, TransactionStatus, Job } from "../../../../types";

interface JobTransactionsTabProps {
  activeJob: Job;
  transactions: Transaction[];
  onViewTicketDetails: (ticketId: string) => void;
  onExportLedger: () => void;
}

export default function JobTransactionsTab({
  activeJob,
  transactions,
  onViewTicketDetails,
  onExportLedger
}: JobTransactionsTabProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
          <Activity className="h-4.5 w-4.5 text-blue-500" />
          <span>Project Delivery Ledger Transactions</span>
        </h4>
        {transactions.length > 0 && (
          <button
            onClick={onExportLedger}
            className="text-[10px] text-indigo-600 font-black flex items-center gap-0.8 hover:underline"
          >
            <Download className="h-3 w-3" />
            <span>Export Ledger List</span>
          </button>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="py-10 text-center text-gray-400 font-medium">
          No transactions have been logged under this project job yet.
        </div>
      ) : (
        <div className="border border-gray-150 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50/50 text-[10px] font-bold text-gray-500 uppercase tracking-wider select-none">
                <th className="px-4 py-3">Transaction ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Ticket No</th>
                <th className="px-4 py-3">Tx Code</th>
                <th className="px-4 py-3">Product Lot</th>
                <th className="px-4 py-3">Carter</th>
                <th className="px-4 py-3">Driver</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3 text-right">Net Weight</th>
                <th className="px-4 py-3 text-right">Total Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Created Date</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-700 text-xs">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/30 transition">
                  <td className="px-4 py-3 font-mono font-bold text-slate-500">{tx.id}</td>
                  <td className="px-4 py-3 font-medium">{tx.type}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{tx.ticketNo}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-gray-500">
                    {tx.transactionCode || "N/A"}
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-purple-700">{tx.lotNo || "N/A"}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{tx.carrierName || "N/A"}</td>
                  <td className="px-4 py-3 text-gray-600">{tx.driverName || "N/A"}</td>
                  <td className="px-4 py-3 font-mono text-gray-600">{tx.vehicleReg || "N/A"}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    {tx.netWeight?.toFixed(2)} t
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-black text-emerald-700">
                    ${(tx.netWeight * activeJob.appliedRate).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                        tx.status === TransactionStatus.APPROVED
                          ? "bg-emerald-100 text-emerald-800"
                          : tx.status === TransactionStatus.INVOICED
                          ? "bg-blue-100 text-blue-800"
                          : tx.status === TransactionStatus.PENDING
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-gray-400">
                    {tx.secondWeighTime || tx.firstWeighTime}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onViewTicketDetails(tx.id)}
                      className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-slate-100 transition"
                      title="Open weighbridge ticket dossier"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
