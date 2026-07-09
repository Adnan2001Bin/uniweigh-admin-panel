import React from "react";
import { Eye } from "lucide-react";
import { Vehicle, Transaction, TransactionStatus } from "../../../../types";

interface TransactionsTabProps {
  vehicle: Vehicle;
  linkedTransactions: Transaction[];
  onViewTicketDetails: (ticketId: string) => void;
}

export default function TransactionsTab({
  vehicle,
  linkedTransactions,
  onViewTicketDetails
}: TransactionsTabProps) {
  return (
    <div className="bg-white border border-gray-150 rounded-xl shadow-2xs overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
          Weighbridge logs for plate: {vehicle.plateNumber}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-150 text-[10px] font-black text-gray-500 uppercase tracking-wider select-none">
              <th className="px-5 py-3">Transaction ID</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Ticket Number</th>
              <th className="px-5 py-3">Transaction Code</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Job</th>
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Driver</th>
              <th className="px-5 py-3">Carter</th>
              <th className="px-5 py-3">Net Weight</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Created Date</th>
              <th className="px-5 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {linkedTransactions.length === 0 ? (
              <tr>
                <td colSpan={13} className="py-12 text-center text-xs text-gray-400 font-medium">
                  No transactions registered under this vehicle plate number yet.
                </td>
              </tr>
            ) : (
              linkedTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition duration-150">
                  <td className="px-5 py-3.5 font-bold font-mono text-gray-900">{t.id}</td>
                  <td className="px-5 py-3.5 font-semibold text-gray-600">{t.type || "Account"}</td>
                  <td className="px-5 py-3.5 font-bold font-mono text-blue-600">{t.ticketNo}</td>
                  <td className="px-5 py-3.5 font-bold font-mono text-gray-600">
                    {t.transactionCode || "N/A"}
                  </td>
                  <td className="px-5 py-3.5 font-black text-gray-950">{t.customerName}</td>
                  <td className="px-5 py-3.5 font-semibold text-gray-700">{t.jobOrder || "N/A"}</td>
                  <td className="px-5 py-3.5 font-extrabold text-blue-900">{t.productName}</td>
                  <td className="px-5 py-3.5 font-semibold text-gray-700">{t.driverName}</td>
                  <td className="px-5 py-3.5 font-semibold text-gray-600">{t.carrierName}</td>
                  <td className="px-5 py-3.5 font-bold font-mono text-right text-slate-900">
                    {t.netWeight.toFixed(2)} t
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-[9px] font-black border uppercase tracking-wider ${
                        t.status === TransactionStatus.APPROVED
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : t.status === TransactionStatus.PENDING
                          ? "bg-amber-50 text-amber-700 border-amber-100"
                          : "bg-red-50 text-red-700 border-red-100"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 font-mono text-[11px] whitespace-nowrap">
                    {t.firstWeighTime}
                  </td>
                  <td className="px-5 py-3.5 text-center font-black">
                    <button
                      onClick={() => onViewTicketDetails(t.id)}
                      className="rounded-md border border-gray-200 bg-white hover:bg-slate-50 text-gray-700 p-1 px-2.5 text-[10px] transition flex items-center gap-1 cursor-pointer select-none font-bold"
                      title="Open direct weighbridge ticket receipt"
                    >
                      <Eye className="h-3 w-3" />
                      View Ticket
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
