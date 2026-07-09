import React from "react";
import { Printer } from "lucide-react";

interface CustomerInvoice {
  id: string;
  invoiceNo: string;
  date: string;
  amountIncl: number;
  status: string;
  exGst: number;
  gst: number;
}

interface InvoicesTabProps {
  customerInvoices: CustomerInvoice[];
}

export default function InvoicesTab({ customerInvoices }: InvoicesTabProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none">
            <th className="px-6 py-3">Invoice ID</th>
            <th className="px-6 py-3">Invoice Number</th>
            <th className="px-6 py-3">Invoice Date</th>
            <th className="px-6 py-3 text-right">Amount Ex GST</th>
            <th className="px-6 py-3 text-right">GST (10%)</th>
            <th className="px-6 py-3 text-right">Amount Incl GST</th>
            <th className="px-6 py-3 text-center">Status</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-xs">
          {customerInvoices.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-10 text-gray-400 font-medium">
                No invoices found for this customer.
              </td>
            </tr>
          ) : (
            customerInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-3.5 font-mono font-bold text-gray-700">{inv.id}</td>
                <td className="px-6 py-3.5 font-mono text-slate-700">{inv.invoiceNo}</td>
                <td className="px-6 py-3.5 text-gray-500 font-medium">{inv.date}</td>
                <td className="px-6 py-3.5 text-right font-mono text-gray-700">
                  ${inv.exGst.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-3.5 text-right font-mono text-gray-500">
                  ${inv.gst.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-3.5 text-right font-mono font-black text-gray-950">
                  ${inv.amountIncl.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-3.5 text-center">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    inv.status === "Paid"
                      ? "bg-emerald-50 text-emerald-700"
                      : inv.status === "Overdue"
                      ? "bg-red-50 text-red-700 border border-red-100 animate-pulse"
                      : "bg-blue-50 text-blue-700"
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-right">
                  <button
                    onClick={() => alert(`Opening official PDF for Invoice reference ${inv.invoiceNo}`)}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
                  >
                    <Printer className="h-3 w-3" />
                    <span>View PDF</span>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
