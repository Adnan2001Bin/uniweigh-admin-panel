import React from "react";
import { Vehicle } from "../../../../types";

interface AxleSetsTabProps {
  vehicle: Vehicle;
}

export default function AxleSetsTab({ vehicle }: AxleSetsTabProps) {
  return (
    <div className="bg-white border border-gray-150 rounded-xl shadow-2xs overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
          Axle Set Specifications Configuration
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-150 text-[10px] font-black text-gray-500 uppercase tracking-wider select-none">
              <th className="px-5 py-3">Axle Set Number</th>
              <th className="px-5 py-3">Tare Weight</th>
              <th className="px-5 py-3">Gross Maximum</th>
              <th className="px-5 py-3">Variance Tolerance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!vehicle.axleSets || vehicle.axleSets.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-xs text-gray-400 font-medium">
                  No Axle Sets configured for this vehicle.
                </td>
              </tr>
            ) : (
              vehicle.axleSets.map((set) => (
                <tr key={set.axleSetNumber} className="hover:bg-slate-50/50 transition duration-150">
                  <td className="px-5 py-3.5 font-bold text-gray-900">
                    Axle Set #{set.axleSetNumber}
                  </td>
                  <td className="px-5 py-3.5 font-bold font-mono text-slate-800">
                    {set.tareWeight.toFixed(2)} t
                  </td>
                  <td className="px-5 py-3.5 font-bold font-mono text-purple-700">
                    {set.weightMax.toFixed(2)} t
                  </td>
                  <td className="px-5 py-3.5 font-bold font-mono text-amber-700">
                    &plusmn; {set.variance.toFixed(2)} t
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
