import React from "react";
import { Truck, Scale, ShieldCheck, Clock } from "lucide-react";
import { Vehicle } from "../../../types";

interface VehicleSummaryCardProps {
  vehicle: Vehicle;
}

export default function VehicleSummaryCard({ vehicle }: VehicleSummaryCardProps) {
  const tareWeight = vehicle.tareWeight;
  const weightMax = vehicle.weightMax ?? Number((tareWeight * 2.5).toFixed(2));
  const variance = vehicle.variance ?? 0.5;
  const isMultiaxel = vehicle.category === "Multiaxel";

  return (
    <div className="bg-white border border-gray-150 rounded-xl shadow-2xs overflow-hidden">
      {/* Card Header Banner */}
      <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-blue-600 shrink-0" />
          <span className="text-xs font-black text-gray-500 uppercase tracking-wider">
            Vehicle Spec Matrix Summary
          </span>
        </div>
        <span
          className={`rounded px-2.5 py-0.5 text-[9px] font-black border uppercase tracking-widest ${
            vehicle.status === "Active"
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : "bg-red-50 text-red-700 border-red-100"
          }`}
        >
          {vehicle.status}
        </span>
      </div>

      {/* Spec Information Details */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        {/* Group 1: Identity Specs */}
        <div className="space-y-3 border-r border-gray-100 pr-4 last:border-0 last:pr-0">
          <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
            Vehicle Details
          </h4>
          <div className="space-y-2.5">
            <div className="flex justify-between">
              <span className="text-gray-400 font-bold">Vehicle ID:</span>
              <span className="font-bold font-mono text-gray-900">{vehicle.id || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-bold">Category:</span>
              <span className="font-extrabold text-blue-700 uppercase tracking-wider">
                {vehicle.category || "Standard"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-bold">Vehicle Name:</span>
              <span className="font-black text-gray-900">{vehicle.name || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-bold">Registration Plate:</span>
              <span className="font-bold font-mono text-slate-700 bg-slate-100 px-1.5 py-0.25 rounded border border-slate-200">
                {vehicle.plateNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-bold">Carter Partner:</span>
              <span className="font-extrabold text-slate-800 underline decoration-dotted">
                {vehicle.carrierName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-bold">Vehicle Type:</span>
              <span className="font-extrabold text-slate-700">{vehicle.vehicleType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-bold">Make and Model:</span>
              <span className="font-bold text-gray-700">{vehicle.makeModel || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Group 2: Weight Verification Metrics */}
        <div className="space-y-3 border-r border-gray-100 pr-4 last:border-0 last:pr-0">
          <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
            Weight Details & Limits
          </h4>
          <div className="space-y-2.5">
            {!isMultiaxel ? (
              /* Standard Vehicle Weights */
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold flex items-center gap-1">
                    <Scale className="h-3.5 w-3.5 text-gray-400" />
                    Tare Weight:
                  </span>
                  <span className="font-black font-mono text-slate-800 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[13px]">
                    {tareWeight.toFixed(2)} t
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                    Weight Max:
                  </span>
                  <span className="font-black font-mono text-slate-900 bg-blue-50/50 border border-blue-200 px-2 py-0.5 rounded text-[13px]">
                    {weightMax.toFixed(2)} t
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    Variance Tolerance:
                  </span>
                  <span className="font-black font-mono text-amber-800 bg-amber-50/50 border border-amber-200 px-2 py-0.5 rounded text-[13px]">
                    &plusmn; {variance.toFixed(2)} t
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-gray-400 font-bold">Permissible Margin:</span>
                  <span className="font-extrabold text-slate-600 font-mono">
                    {(weightMax - variance).toFixed(2)}t &mdash; {(weightMax + variance).toFixed(2)}t
                  </span>
                </div>
              </>
            ) : (
              /* Multiaxel Vehicle Weights */
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">Weighed As:</span>
                  <span className="font-extrabold text-purple-700">
                    {vehicle.weighedAs || "Weighed as Whole"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold flex items-center gap-1">
                    <Scale className="h-3.5 w-3.5 text-gray-400" />
                    Combined Tare:
                  </span>
                  <span className="font-black font-mono text-slate-800 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[13px]">
                    {tareWeight.toFixed(2)} t
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                    Gross Maximum:
                  </span>
                  <span className="font-black font-mono text-slate-900 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded text-[13px]">
                    {weightMax.toFixed(2)} t
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">Axle Sets Count:</span>
                  <span className="font-bold text-gray-900 font-mono">
                    {vehicle.axleSets?.length || 0} Sets
                  </span>
                </div>
                <div className="p-2 bg-purple-50 border border-purple-100 rounded text-[10.5px] text-purple-800 font-bold">
                  Combined Tare is sum: {vehicle.enableCombinedTare ? "ON (Automatic)" : "OFF (Manual)"}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Group 3: Operator Notes and Logs */}
        <div className="space-y-3 pr-4">
          <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
            Compliance Notes
          </h4>
          <div className="space-y-2 bg-slate-50/80 p-3 rounded-lg border border-slate-100 h-28 overflow-y-auto">
            {vehicle.notes ? (
              <p className="font-bold text-gray-600 leading-relaxed text-[11px]">{vehicle.notes}</p>
            ) : (
              <p className="font-semibold text-gray-400 italic">
                No additional special operational or routing compliance notes registered for this
                hauling plate.
              </p>
            )}
          </div>
          <div className="text-[9.5px] text-gray-400 font-bold">
            Last Tare calibration:{" "}
            <span className="font-mono text-gray-600">{vehicle.lastTareDate || "Unknown"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
