import React from "react";
import {
  X,
  FileCheck2,
  ArrowLeft,
  Edit,
  RefreshCw,
  Building,
  MapPin,
  DollarSign
} from "lucide-react";
import { Customer, Transaction } from "../../../types";
import JobsTab from "./tabs/JobsTab";
import TransactionsTab from "./tabs/TransactionsTab";

interface CustomerJob {
  id: string;
  ref: string;
  product: string;
  orderQty: number;
  delQty: number;
  status: string;
}

interface CustomerDetailProps {
  activeCustomer: Customer;
  matchingTxs: Transaction[];
  customerJobs: CustomerJob[];
  previewTab: "jobs" | "transactions";
  setPreviewTab: (tab: "jobs" | "transactions") => void;
  onBack: () => void;
  onEditCustomer: (e: React.MouseEvent) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  refreshNotification: string;
  setRefreshNotification: (value: string) => void;
  exportSuccessMessage: string;
  setExportSuccessMessage: (value: string) => void;
}

function getInitials(name: string) {
  if (!name) return "C";
  return name
    .split(" ")
    .map((n) => n[0] || "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function CustomerDetail({
  activeCustomer,
  matchingTxs,
  customerJobs,
  previewTab,
  setPreviewTab,
  onBack,
  onEditCustomer,
  onRefresh,
  isRefreshing,
  refreshNotification,
  setRefreshNotification,
  exportSuccessMessage,
  setExportSuccessMessage
}: CustomerDetailProps) {
  const tabs = [
    { id: "jobs" as const, label: "Jobs", count: customerJobs.length },
    { id: "transactions" as const, label: "Transactions", count: matchingTxs.length },
  ];

  return (
    <div className="space-y-6 animate-fade-in" id="customer-detail-page">
      {/* Dynamic Alerts / Notifications inside details view if needed */}
      {refreshNotification && (
        <div className="bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center justify-between text-xs font-semibold shadow-xl animate-bounce">
          <span className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>{refreshNotification}</span>
          </span>
          <button onClick={() => setRefreshNotification("")} className="text-white/80 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {exportSuccessMessage && (
        <div className="bg-emerald-600 text-white px-5 py-4 rounded-xl flex items-start gap-3 justify-between text-xs font-semibold shadow-xl">
          <span className="flex items-start gap-2">
            <FileCheck2 className="h-5 w-5 text-emerald-150 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">Export File Generated</div>
              <p className="text-emerald-50 mt-1 font-normal leading-relaxed">{exportSuccessMessage}</p>
            </div>
          </span>
          <button onClick={() => setExportSuccessMessage("")} className="text-white/80 hover:text-white">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      )}

      {/* Detail View Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-5">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-220 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer shadow-xs"
            title="Return to customer registry"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Directory</span>
          </button>

          <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-base shadow-md">
            {getInitials(activeCustomer.name)}
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight sm:text-2xl">
                {activeCustomer.name}
              </h1>
              <span
                className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                  activeCustomer.status === "Active"
                    ? "bg-emerald-55 text-emerald-700 border border-emerald-100"
                    : "bg-red-50 text-red-700 border border-red-100"
                }`}
              >
                {activeCustomer.status}
              </span>
            </div>
            <div className="text-xs text-gray-500 font-mono mt-0.5">
              Customer ID: <span className="font-bold text-gray-900">{activeCustomer.id}</span> | Customer Code: <span className="font-semibold text-gray-750">{activeCustomer.customerCode || "N/A"}</span> | Client Number: <span className="font-semibold text-gray-750">CL-100{activeCustomer.id.replace("C-", "")}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEditCustomer}
            className="rounded-lg border border-gray-220 bg-white text-xs font-bold text-gray-700 px-4 py-2 hover:bg-gray-50 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Edit className="h-4 w-4 text-blue-600" />
            <span>Edit Account parameters</span>
          </button>

          <button
            onClick={onRefresh}
            title="Refresh profile details"
            className={`rounded-lg border border-gray-220 bg-white p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition cursor-pointer shadow-xs ${isRefreshing ? "bg-slate-50" : ""}`}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* CUSTOMER SUMMARY CARD */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden p-6 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* 1. Customer Details */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Building className="h-4 w-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Customer Details</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">Customer ID</span>
                <span className="font-mono font-bold text-gray-800">{activeCustomer.id}</span>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">Customer Code</span>
                <span className="font-mono font-bold text-gray-800">{activeCustomer.customerCode || "N/A"}</span>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">Customer Name</span>
                <span className="font-bold text-gray-900">{activeCustomer.name}</span>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">Primary Contact</span>
                <span className="font-semibold text-gray-800">{activeCustomer.contactPerson}</span>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">Phone Number</span>
                <span className="font-semibold text-gray-800">{activeCustomer.phone}</span>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">Mobile Number</span>
                <span className="font-semibold text-gray-800">{activeCustomer.mobileNo || "N/A"}</span>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">Email Address</span>
                <span className="font-semibold text-gray-800 select-all">{activeCustomer.email}</span>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">Status</span>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                  activeCustomer.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                }`}>{activeCustomer.status}</span>
              </div>
            </div>
          </div>

          {/* 2. Address Details */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Address Details</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">Address Line 1</span>
                <span className="font-semibold text-gray-800">{activeCustomer.addressLine1 || activeCustomer.billingAddress?.split(',')[0] || "N/A"}</span>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">Address Line 2</span>
                <span className="font-semibold text-gray-800">{activeCustomer.addressLine2 || "N/A"}</span>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">Suburb</span>
                <span className="font-semibold text-gray-800">{activeCustomer.suburbName || "N/A"}</span>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">State</span>
                <span className="font-semibold text-gray-800">{activeCustomer.stateCode || "VIC"}</span>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">Postcode</span>
                <span className="font-semibold text-gray-800">{activeCustomer.postCodeVal || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* 3. Commercial Details */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Commercial Details</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">Product Rule / Pricing Tier</span>
                <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded inline-block mt-1 font-mono">
                  {activeCustomer.pricingTier || "Tier 1 - Standard"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">Client Since</span>
                <span className="font-semibold text-gray-800">{activeCustomer.clientSince || "2024"}</span>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">Notes</span>
                <p className="text-[11px] text-gray-500 italic leading-relaxed mt-0.5">{activeCustomer.notes || "No operational notes recorded."}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* THREE TABS CONTAINER */}
      <div className="space-y-4">
        <div className="border-b border-gray-200 px-1">
          <nav className="flex gap-6 -mb-px">
            {tabs.map((tab) => {
              const isActive = previewTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setPreviewTab(tab.id)}
                  className={`pb-3 px-1 border-b-2 text-xs font-semibold uppercase tracking-wide transition flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? "border-blue-600 text-blue-700"
                      : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isActive ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* TAB CONTENT */}
        <div className="bg-white border border-gray-150 rounded-xl shadow-xs overflow-hidden w-full">
          {previewTab === "jobs" && <JobsTab customerJobs={customerJobs} />}
          {previewTab === "transactions" && <TransactionsTab matchingTxs={matchingTxs} />}
        </div>
      </div>
    </div>
  );
}
