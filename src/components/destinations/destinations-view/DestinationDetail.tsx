import React from "react";
import { motion } from "motion/react";
import {
  MapPin,
  Building,
  FileText,
  Activity,
  Download,
  Edit2,
  Eye
} from "lucide-react";
import { Destination, Job, Transaction } from "../../../types";

interface DestinationDetailProps {
  activeDestination: Destination;
  linkedTransactions: Transaction[];
  linkedJob: Job | null;
  jobMetrics: { delivered: number; remaining: number };
  detailTab: "transactions" | "jobs";
  setDetailTab: (tab: "transactions" | "jobs") => void;
  onEdit: (dest: Destination) => void;
  onExportProfile: () => void;
  onExportTransactions: () => void;
  onViewTicketDetails: (ticketId: string) => void;
}

export default function DestinationDetail({
  activeDestination,
  linkedTransactions,
  linkedJob,
  jobMetrics,
  detailTab,
  setDetailTab,
  onEdit,
  onExportProfile,
  onExportTransactions,
  onViewTicketDetails
}: DestinationDetailProps) {
  return (
    <motion.div
      key="destinations-detail-mode"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
      id="destination-summary-sheet"
    >
      {/* DESTINATION SUMMARY CARD */}
      <div className="bg-white border border-gray-150 rounded-xl shadow-3xs overflow-hidden">
        <div className="bg-slate-50 border-b border-gray-150 p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 font-mono text-xs font-bold">
              {activeDestination.id.substring(activeDestination.id.length - 2)}
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 tracking-tight leading-none">
                {activeDestination.name}
              </h2>
              <span className="text-[10px] font-mono text-gray-400">
                SYSTEM ID: {activeDestination.id}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                activeDestination.status === "Active"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              {activeDestination.status}
            </span>
            <button
              onClick={onExportProfile}
              className="px-2.5 py-1.2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
              title="Export destination profile report"
            >
              <Download className="h-3 w-3 text-gray-400" />
              <span>Export Profile</span>
            </button>
            <button
              onClick={() => onEdit(activeDestination)}
              className="px-2.5 py-1.2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-sm transition cursor-pointer"
            >
              <Edit2 className="h-3 w-3" />
              <span>Edit Destination</span>
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Destination Details */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
              <Building className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <span>Destination Details</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                  Destination ID
                </span>
                <span className="font-mono font-bold text-blue-700">{activeDestination.id}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                  Destination Name
                </span>
                <span className="font-bold text-slate-900">{activeDestination.name}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                  Linked Job
                </span>
                <span className="inline-flex items-center gap-1 bg-slate-100 font-mono font-bold text-slate-700 px-1.5 py-0.5 rounded text-[11px] mt-0.5">
                  {activeDestination.jobId} (Ref: {activeDestination.jobRef})
                </span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                  Customer
                </span>
                <span className="font-semibold text-slate-800">{activeDestination.customerName}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                  Phone
                </span>
                <span className="font-mono font-semibold text-slate-700">
                  {activeDestination.phone || <span className="text-gray-300">N/A</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
              <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Address Details</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                  Address Line 1
                </span>
                <span className="font-semibold text-slate-900">{activeDestination.addressLine1}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                  Address Line 2
                </span>
                <span className="font-semibold text-slate-700">
                  {activeDestination.addressLine2 || <span className="text-gray-300">N/A</span>}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                    Suburb
                  </span>
                  <span className="font-bold text-slate-800">{activeDestination.suburb}</span>
                </div>
                <div className="col-span-1">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                    State
                  </span>
                  <span className="font-bold text-slate-800">{activeDestination.state}</span>
                </div>
                <div className="col-span-1">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                    Postcode
                  </span>
                  <span className="font-mono font-bold text-slate-850">{activeDestination.postcode}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Column */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
              <FileText className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>Notes</span>
            </h4>
            <div className="bg-slate-50 border border-slate-150 rounded-lg p-3 text-xs font-medium text-slate-600 leading-relaxed min-h-[100px]">
              {activeDestination.notes || "No special logistics notes configured."}
            </div>
          </div>
        </div>
      </div>

      {/* TWO TABS NAVIGATION */}
      <div className="space-y-4">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setDetailTab("transactions")}
            className={`px-4 py-2 text-xs font-bold border-b-2 tracking-wide transition-all cursor-pointer ${
              detailTab === "transactions"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Transactions ({linkedTransactions.length})
          </button>
          <button
            onClick={() => setDetailTab("jobs")}
            className={`px-4 py-2 text-xs font-bold border-b-2 tracking-wide transition-all cursor-pointer ${
              detailTab === "jobs"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Jobs ({linkedJob ? 1 : 0})
          </button>
        </div>

        {/* TAB 1: TRANSACTIONS */}
        {detailTab === "transactions" && (
          <div className="bg-white border border-gray-150 rounded-xl shadow-3xs overflow-hidden">
            <div className="bg-slate-50 border-b border-gray-150 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Associated Transit Records ({linkedTransactions.length})
                </h4>
              </div>

              {linkedTransactions.length > 0 && (
                <button
                  onClick={onExportTransactions}
                  className="px-2.5 py-1.2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  <span>Export Transactions ({linkedTransactions.length})</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-gray-150 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="px-4 py-3">Transaction ID</th>
                    <th className="px-4 py-3">Transaction Type</th>
                    <th className="px-4 py-3">Ticket Number</th>
                    <th className="px-4 py-3">Transaction Code</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Job</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Product Lot</th>
                    <th className="px-4 py-3 text-right">Net Weight</th>
                    <th className="px-4 py-3 text-right">Total Amount</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3">Created Date</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[11px] font-semibold text-gray-700">
                  {linkedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="px-4 py-10 text-center text-gray-400">
                        No weighbridge transactions recorded for this destination yet.
                      </td>
                    </tr>
                  ) : (
                    linkedTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/40">
                        <td className="px-4 py-3 font-mono text-blue-600 font-bold">{tx.id}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              tx.type === "Account"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-teal-100 text-teal-800"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-900">{tx.ticketNo}</td>
                        <td className="px-4 py-3 font-mono text-slate-500">
                          {tx.transactionCode || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-[130px] truncate">
                          {tx.customerName}
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-500">{tx.jobOrder}</td>
                        <td className="px-4 py-3 text-gray-600 max-w-[130px] truncate">
                          {tx.productName}
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-500">{tx.lotNo || "N/A"}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-gray-900">
                          {tx.netWeight.toFixed(2)} t
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-emerald-700 font-bold">
                          ${tx.totalValue.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wide ${
                              tx.status === "Approved" || tx.status === "Committed"
                                ? "bg-emerald-100 text-emerald-800"
                                : tx.status === "Pending"
                                ? "bg-amber-100 text-amber-800 animate-pulse"
                                : tx.status === "Invoiced"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {tx.firstWeighTime
                            ? new Date(tx.firstWeighTime).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => onViewTicketDetails(tx.id)}
                            className="p-1 rounded text-blue-600 hover:bg-slate-100 transition cursor-pointer"
                            title="Open weighbridge ticket dossier"
                          >
                            <Eye className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: JOBS */}
        {detailTab === "jobs" && (
          <div className="bg-white border border-gray-150 rounded-xl shadow-3xs overflow-hidden">
            <div className="bg-slate-50 border-b border-gray-150 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Linked Job Contract Profile
                </h4>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-gray-150 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="px-4 py-3">Job ID</th>
                    <th className="px-4 py-3">Customer Order Reference</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3 text-right">Order Quantity</th>
                    <th className="px-4 py-3 text-right">Delivered Quantity</th>
                    <th className="px-4 py-3 text-right">Remaining Quantity</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
                  {!linkedJob ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                        No job associated with this destination.
                      </td>
                    </tr>
                  ) : (
                    <tr className="hover:bg-slate-50/40">
                      <td className="px-4 py-3.5 font-mono text-blue-600 font-bold">{linkedJob.id}</td>
                      <td className="px-4 py-3.5 text-slate-900">{linkedJob.customerOrderRef}</td>
                      <td className="px-4 py-3.5 text-gray-600">{linkedJob.customerName}</td>
                      <td className="px-4 py-3.5 text-gray-600">{linkedJob.productName}</td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                        {linkedJob.orderQty.toLocaleString()} t
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-emerald-700 font-semibold">
                        {jobMetrics.delivered.toLocaleString()} t
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-amber-700 font-semibold">
                        {jobMetrics.remaining.toLocaleString()} t
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            linkedJob.status === "Active"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : linkedJob.status === "Completed"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          {linkedJob.status}
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
