import React, { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Job, Customer } from "../../../types";
import JobsTable from "./JobsTable";

interface JobsListProps {
  filteredJobs: Job[];
  totalJobs: number;
  jobDeliveredQuantities: Record<string, number>;
  checkedJobIds: string[];
  setCheckedJobIds: React.Dispatch<React.SetStateAction<string[]>>;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  customerFilter: string;
  setCustomerFilter: (value: string) => void;
  customers: Customer[];
  onExport: () => void;
  onViewDetail: (jobId: string) => void;
  onEdit: (job: Job) => void;
}

const columnLabels: Record<string, string> = {
  jobId: "Job ID",
  customer: "Customer",
  product: "Product",
  orderQty: "Order Quantity",
  deliveredQty: "Delivered Quantity",
  remainingQty: "Remaining Quantity",
  status: "Status",
  actions: "Actions",
};

export default function JobsList({
  filteredJobs,
  totalJobs,
  jobDeliveredQuantities,
  checkedJobIds,
  setCheckedJobIds,
  statusFilter,
  setStatusFilter,
  customerFilter,
  setCustomerFilter,
  customers,
  onExport,
  onViewDetail,
  onEdit,
}: JobsListProps) {
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    jobId: true,
    customer: true,
    product: true,
    orderQty: true,
    deliveredQty: true,
    remainingQty: true,
    status: true,
    actions: true
  });
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);

  return (
    <div className="space-y-4">
      {/* SEARCH AND FILTERS TOOLBAR */}
      <div className="bg-white rounded-xl p-3 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border-0 text-gray-700 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {/* Customer Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customer:</span>
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="bg-slate-50 border-0 text-gray-700 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-blue-500 cursor-pointer max-w-[180px]"
            >
              <option value="All">All Customers</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Column Visibility */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowColumnsMenu(!showColumnsMenu)}
              className="flex items-center gap-2 rounded-lg border border-gray-220 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition select-none"
            >
              <span>Column Visibility</span>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>

            {showColumnsMenu && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-20 text-xs">
                <div className="px-3.5 py-1 text-gray-400 font-black text-[9px] uppercase tracking-widest border-b border-gray-100 mb-1.5">
                  Toggle Columns
                </div>
                {Object.keys(visibleColumns).map((col) => (
                  <button
                    key={col}
                    onClick={() => {
                      setVisibleColumns((prev) => ({
                        ...prev,
                        [col]: !prev[col],
                      }));
                    }}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 font-bold text-gray-700 flex items-center justify-between cursor-pointer"
                  >
                    <span>{columnLabels[col] || col}</span>
                    {visibleColumns[col] && (
                      <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AG Grid Table */}
      <JobsTable
        filteredJobs={filteredJobs}
        totalJobs={totalJobs}
        jobDeliveredQuantities={jobDeliveredQuantities}
        visibleColumns={visibleColumns}
        checkedJobIds={checkedJobIds}
        setCheckedJobIds={setCheckedJobIds}
        onViewDetail={onViewDetail}
        onExport={onExport}
        onEdit={onEdit}
      />
    </div>
  );
}
