import React from "react";
import { Eye } from "lucide-react";
import { Vehicle } from "../../../../types";

interface VehiclesTabProps {
  linkedVehicles: Vehicle[];
  onViewVehicle: (vehicle: Vehicle) => void;
}

export default function VehiclesTab({ linkedVehicles, onViewVehicle }: VehiclesTabProps) {
  return (
    <div className="bg-white border border-gray-150 rounded-xl shadow-2xs overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Linked Vehicles Fleet</h3>
          <p className="text-[10px] text-gray-400 font-bold">Includes standard and heavy-duty multiaxel vehicles linked to this Carter.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-150 bg-slate-50 text-[10px] font-black text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3">Vehicle ID</th>
              <th className="px-6 py-3">Vehicle Name</th>
              <th className="px-6 py-3">Registration Number</th>
              <th className="px-6 py-3">Vehicle Type</th>
              <th className="px-6 py-3">Tare Weight</th>
              <th className="px-6 py-3">Weight Max</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {linkedVehicles.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-xs text-gray-400 font-medium">
                  No vehicles registered under this Carter.
                </td>
              </tr>
            ) : (
              linkedVehicles.map((v, idx) => {
                const vId = v.id || `V-${v.plateNumber.replace("-", "")}`;
                const vName = v.name || `${v.vehicleType} #${idx + 1}`;
                const isMulti = v.vehicleType === "B-Double" || v.vehicleType === "Quad-Dog" || v.vehicleType === "Semi-Trailer";
                const weightMax = v.weightMax || Number((v.tareWeight * 2.5).toFixed(2));
                return (
                  <tr key={v.plateNumber} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-bold font-mono text-gray-900">{vId}</td>
                    <td className="px-6 py-4 font-extrabold text-gray-950 flex items-center gap-1.5">
                      {vName}
                      {isMulti && (
                        <span className="bg-purple-50 text-purple-700 text-[8px] font-black px-1.5 py-0.2 rounded border border-purple-100 uppercase scale-90">
                          Multiaxel
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-gray-600">{v.plateNumber}</td>
                    <td className="px-6 py-4 text-gray-600">{v.vehicleType}</td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-800">{v.tareWeight.toFixed(2)} t</td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-500">{weightMax.toFixed(2)} t</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-black border uppercase tracking-wider ${
                          v.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-red-50 text-red-700 border-red-100"
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => onViewVehicle(v)}
                        className="rounded-md border border-gray-200 hover:border-blue-200 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-700 p-1 px-2 text-[10px] font-black transition flex items-center gap-1 mx-auto select-none"
                      >
                        <Eye className="h-3 w-3" />
                        Quick View
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
