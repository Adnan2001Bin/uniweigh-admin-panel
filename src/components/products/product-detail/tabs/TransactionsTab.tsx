import React from "react";
import { Search, Receipt } from "lucide-react";
import { Transaction } from "../../../../types";

interface TransactionsTabProps {
  transactions: Transaction[];
  search: string;
  setSearch: (value: string) => void;
}

export default function TransactionsTab({ transactions, search, setSearch }: TransactionsTabProps) {
  const filteredTxs = transactions.filter(
    (t) =>
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketNo.toLowerCase().includes(search.toLowerCase()) ||
      t.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 border border-slate-100 rounded-lg p-3">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search ticket transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold focus:outline-none"
          />
          <Search className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
        </div>
      </div>

      <div className="border border-gray-100 rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-150 bg-slate-50 text-[10px] font-black text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3">Transaction ID</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Ticket Number</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Job ID</th>
              <th className="px-4 py-3">Lot</th>
              <th className="px-4 py-3 text-right">Net Weight</th>
              <th className="px-4 py-3 text-right">Total Amount</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3">Created Date</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredTxs.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-10 text-center text-gray-400 font-medium">
                  No weighbridge transactions recorded for this material type.
                </td>
              </tr>
            ) : (
              filteredTxs.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3 font-bold font-mono text-gray-950">{t.id}</td>
                  <td className="px-4 py-3 font-semibold text-gray-600">{t.type || "Account"}</td>
                  <td className="px-4 py-3 font-bold font-mono text-gray-900">{t.ticketNo}</td>
                  <td className="px-4 py-3 font-bold text-gray-700">{t.customerName}</td>
                  <td className="px-4 py-3 font-semibold font-mono text-gray-500">{t.jobOrder || "N/A"}</td>
                  <td className="px-4 py-3 font-mono text-gray-500">{t.lotNo || "N/A"}</td>
                  <td className="px-4 py-3 text-right font-bold font-mono">{t.netWeight.toFixed(2)} t</td>
                  <td className="px-4 py-3 text-right font-bold font-mono text-blue-700">${t.totalValue.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-black border ${
                        t.status === "Approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : t.status === "Pending"
                          ? "bg-amber-50 text-amber-700 border-amber-100"
                          : "bg-blue-50 text-blue-700 border-blue-100"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-400 text-[10px] whitespace-nowrap">
                    {t.firstWeighTime?.split(" ")[0] || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() =>
                        alert(`Consolidated ticket layout: #${t.ticketNo}. Access via Transactions panel for formal approvals.`)
                      }
                      className="text-blue-600 hover:text-blue-800 font-black text-xs"
                    >
                      Ticket
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
