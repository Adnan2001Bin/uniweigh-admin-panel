import React from "react";
import { User, Eye } from "lucide-react";
import { Driver } from "../../../../types";

interface DriversTabProps {
  linkedDrivers: Driver[];
  onViewDriver: (driver: Driver) => void;
}

export default function DriversTab({ linkedDrivers, onViewDriver }: DriversTabProps) {
  return (
    <div className="bg-white border border-gray-150 rounded-xl shadow-2xs overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Linked Carter Drivers</h3>
          <p className="text-[10px] text-gray-400 font-bold">Drivers approved to operate under this Carter's account.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-150 bg-slate-50 text-[10px] font-black text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3">Driver ID</th>
              <th className="px-6 py-3">Driver Name</th>
              <th className="px-6 py-3">Licence Number</th>
              <th className="px-6 py-3">Phone Number</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {linkedDrivers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-xs text-gray-400 font-medium">
                  No drivers registered under this Carter.
                </td>
              </tr>
            ) : (
              linkedDrivers.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-bold font-mono text-gray-900">{d.id}</td>
                  <td className="px-6 py-4 font-extrabold text-gray-950">{d.name}</td>
                  <td className="px-6 py-4 font-mono font-bold text-gray-600">{d.licenseNumber}</td>
                  <td className="px-6 py-4 text-gray-600">+61 400 123 456</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-black border uppercase tracking-wider ${
                        d.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-red-50 text-red-700 border-red-100"
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onViewDriver(d)}
                      className="rounded-md border border-gray-200 hover:border-blue-200 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-700 p-1 px-2 text-[10px] font-black transition flex items-center gap-1 mx-auto select-none"
                    >
                      <Eye className="h-3 w-3" />
                      Quick View
                    </button>
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
