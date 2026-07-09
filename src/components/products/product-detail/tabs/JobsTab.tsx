import React from "react";
import { Search, Briefcase } from "lucide-react";
import { Job } from "../../../../types";

interface JobsTabProps {
  jobs: Job[];
  search: string;
  setSearch: (value: string) => void;
}

export default function JobsTab({ jobs, search, setSearch }: JobsTabProps) {
  const filteredJobs = jobs.filter(
    (j) =>
      j.id.toLowerCase().includes(search.toLowerCase()) ||
      j.customerName.toLowerCase().includes(search.toLowerCase()) ||
      j.customerOrderRef.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 border border-slate-100 rounded-lg p-3">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search active job requirements..."
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
              <th className="px-5 py-3">Job ID</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Order Reference</th>
              <th className="px-5 py-3 text-right">Order Quantity</th>
              <th className="px-5 py-3 text-right">Delivered Quantity</th>
              <th className="px-5 py-3 text-right">Remaining Quantity</th>
              <th className="px-5 py-3 text-center">Status</th>
              <th className="px-5 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-gray-400 font-medium">
                  No jobs currently utilizing this product specification.
                </td>
              </tr>
            ) : (
              filteredJobs.map((j) => {
                const rem = Math.max(0, j.orderQty - j.deliveredQty);
                return (
                  <tr key={j.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-3.5 font-bold font-mono text-gray-900">{j.id}</td>
                    <td className="px-5 py-3.5 font-extrabold text-gray-950">{j.customerName}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-600">{j.customerOrderRef}</td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-gray-700">
                      {j.orderQty.toLocaleString()} t
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-emerald-600">
                      {j.deliveredQty.toLocaleString()} t
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-amber-600">
                      {rem.toLocaleString()} t
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-black border ${
                          j.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : j.status === "Completed"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}
                      >
                        {j.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() =>
                          alert(
                            `Relational View: Navigating to Job Profile: ${j.id}. Please access via Customer / Jobs module for full modifications.`
                          )
                        }
                        className="text-blue-600 hover:text-blue-800 font-black text-xs"
                      >
                        View Job
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
