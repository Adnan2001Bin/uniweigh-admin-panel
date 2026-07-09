import React from "react";
import { User, Phone } from "lucide-react";
import { Driver } from "../../../types";

interface DriverSummaryCardProps {
  driver: Driver;
}

export default function DriverSummaryCard({ driver }: DriverSummaryCardProps) {
  return (
    <div className="bg-white border border-gray-150 rounded-xl shadow-2xs overflow-hidden">
      {/* Card Header Banner */}
      <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600 shrink-0" />
          <span className="text-xs font-black text-gray-500 uppercase tracking-wider">
            Driver specification summary
          </span>
        </div>
        <span
          className={`rounded px-2.5 py-0.5 text-[9px] font-black border uppercase tracking-widest ${
            driver.status === "Active"
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : "bg-red-50 text-red-700 border-red-100"
          }`}
        >
          {driver.status}
        </span>
      </div>

      {/* Spec Information Details */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Group 1: Identity & Licence */}
        <div className="space-y-3 border-r border-gray-100 pr-4 last:border-0 last:pr-0">
          <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
            Driver Details
          </h4>
          <div className="space-y-2.5">
            <div className="flex justify-between">
              <span className="text-gray-400 font-bold">Driver ID:</span>
              <span className="font-bold font-mono text-gray-900">{driver.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-bold">Driver Name:</span>
              <span className="font-black text-gray-900">{driver.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-bold">Licence Number:</span>
              <span className="font-bold font-mono text-slate-700 bg-slate-100 px-1.5 py-0.25 rounded border border-slate-200 font-mono">
                {driver.licenseNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-bold">Phone Number:</span>
              <span className="font-bold text-gray-800 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-gray-400" />
                {driver.phoneNumber || "0400 000 000"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-bold">Carter Company:</span>
              <span className="font-extrabold text-slate-800 underline decoration-dotted">
                {driver.carrierName}
              </span>
            </div>
          </div>
        </div>

        {/* Group 2: Operational Notes & Compliance Logs */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
            Compliance & Safety Notes
          </h4>
          <div className="space-y-2 bg-slate-50/80 p-3 rounded-lg border border-slate-100 h-24 overflow-y-auto">
            {driver.notes ? (
              <p className="font-bold text-gray-600 leading-relaxed text-[11px]">
                {driver.notes}
              </p>
            ) : (
              <p className="font-semibold text-gray-400 italic">
                No additional safety inductions or special routing compliance comments registered for this driver.
              </p>
            )}
          </div>
          <div className="text-[9.5px] text-gray-400 font-bold">
            Last Weighbridge Activity:{" "}
            <span className="font-mono text-gray-600">{driver.lastWeighedDate || "None"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
