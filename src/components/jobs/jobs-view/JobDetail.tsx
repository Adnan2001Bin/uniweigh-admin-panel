import React from "react";
import { motion } from "motion/react";
import { Edit2, Briefcase } from "lucide-react";
import { Job, Transaction } from "../../../types";
import JobDestinationsTab, { JobDestination } from "./tabs/JobDestinationsTab";
import JobTransactionsTab from "./tabs/JobTransactionsTab";
import JobPricingTab from "./tabs/JobPricingTab";

interface JobDetailProps {
  activeJob: Job;
  jobDeliveredQuantities: Record<string, number>;
  activeJobDestinations: JobDestination[];
  activeJobTransactions: Transaction[];
  detailTab: "destinations" | "transactions" | "pricing";
  setDetailTab: (tab: "destinations" | "transactions" | "pricing") => void;
  onEdit: (job: Job) => void;
  onViewTicketDetails: (ticketId: string) => void;
  onExportTxs: () => void;
  onExportPricing: () => void;
}

export default function JobDetail({
  activeJob,
  jobDeliveredQuantities,
  activeJobDestinations,
  activeJobTransactions,
  detailTab,
  setDetailTab,
  onEdit,
  onViewTicketDetails,
  onExportTxs,
  onExportPricing
}: JobDetailProps) {
  const deliveredQty = jobDeliveredQuantities[activeJob.id] || 0;
  const remainingQty = Math.max(0, activeJob.orderQty - deliveredQty);

  const tabs = [
    { id: "destinations" as const, label: "Destinations", count: activeJobDestinations.length },
    { id: "transactions" as const, label: "Transactions", count: activeJobTransactions.length },
    { id: "pricing" as const, label: "Pricing" }
  ];

  return (
    <motion.div
      key="jobs-detail-mode"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* JOB SUMMARY CARD (TOP SECTION) */}
      <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shrink-0 font-extrabold text-sm">
              {activeJob.id.split("-").pop()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-sm font-black text-slate-900 font-mono tracking-tight">
                  {activeJob.id}
                </strong>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    activeJob.status === "Active"
                      ? "bg-emerald-100 text-emerald-800"
                      : activeJob.status === "Completed"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {activeJob.status}
                </span>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                Job Contract Profile
              </p>
            </div>
          </div>
          <button
            onClick={() => onEdit(activeJob)}
            className="px-2.5 py-1.2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg flex items-center gap-1 transition"
          >
            <Edit2 className="h-3 w-3" />
            <span>Edit Contract</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs text-gray-700">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Job ID</span>
            <span className="font-mono font-bold text-slate-800 select-all">{activeJob.id}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              Order Reference Number
            </span>
            <span className="font-semibold text-slate-800 select-all">{activeJob.customerOrderRef}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Customer</span>
            <span className="font-bold text-gray-950">{activeJob.customerName}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Product</span>
            <span className="font-bold text-slate-850">{activeJob.productName}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              Order Quantity
            </span>
            <span className="font-mono font-bold text-gray-900 text-sm">{activeJob.orderQty.toLocaleString()} t</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              Delivered Quantity
            </span>
            <span className="font-mono font-black text-emerald-700 text-sm">
              {deliveredQty.toLocaleString()} t
            </span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              Remaining Quantity
            </span>
            <span className="font-mono font-black text-amber-700 text-sm">
              {remainingQty.toLocaleString()} t
            </span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Status</span>
            <span
              className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                activeJob.status === "Active"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : activeJob.status === "Completed"
                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              {activeJob.status}
            </span>
          </div>
          <div className="col-span-1 sm:col-span-2 md:col-span-4">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Notes</span>
            <p className="text-gray-600 bg-slate-50/50 rounded-lg p-3 leading-relaxed text-[11px] font-medium border border-slate-100">
              {activeJob.notes || "No operational notes recorded."}
            </p>
          </div>
        </div>
      </div>

      {/* LOWER PORTION TABS NAVIGATION */}
      <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-2xs">
        <div className="flex border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-slate-50/40">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setDetailTab(t.id)}
              className={`flex-1 py-4 text-center transition cursor-pointer font-bold border-b-2 flex items-center justify-center gap-1.5 ${
                detailTab === t.id
                  ? "bg-white border-b-blue-600 text-blue-700 font-bold"
                  : "border-b-transparent hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span
                  className={`px-1.8 py-0.2 rounded-full text-[9px] font-bold ${
                    detailTab === t.id ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-4 text-xs">
          {detailTab === "destinations" && <JobDestinationsTab destinations={activeJobDestinations} />}
          {detailTab === "transactions" && (
            <JobTransactionsTab
              activeJob={activeJob}
              transactions={activeJobTransactions}
              onViewTicketDetails={onViewTicketDetails}
              onExportLedger={onExportTxs}
            />
          )}
          {detailTab === "pricing" && <JobPricingTab activeJob={activeJob} onExportPriceSheet={onExportPricing} />}
        </div>
      </div>
    </motion.div>
  );
}
