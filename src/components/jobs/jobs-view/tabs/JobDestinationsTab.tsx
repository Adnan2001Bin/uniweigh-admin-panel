import React from "react";
import { MapPin } from "lucide-react";

export interface JobDestination {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: string;
}

interface JobDestinationsTabProps {
  destinations: JobDestination[];
}

export default function JobDestinationsTab({ destinations }: JobDestinationsTabProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
          <MapPin className="h-4.5 w-4.5 text-blue-500" />
          <span>Contract Bound Delivery Sites</span>
        </h4>
        <p className="text-[10px] text-gray-400">Target dump locations authorized for weighbridge loading.</p>
      </div>

      <div className="border border-gray-150 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-slate-50/50 text-[10px] font-bold text-gray-500 uppercase tracking-wider select-none">
              <th className="px-4 py-3">Destination ID</th>
              <th className="px-4 py-3">Destination Name</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-slate-700 text-xs">
            {destinations.map((dest) => (
              <tr key={dest.id} className="hover:bg-slate-50/30 transition">
                <td className="px-4 py-3 font-mono font-bold text-slate-500">{dest.id}</td>
                <td className="px-4 py-3 font-bold text-gray-950">{dest.name}</td>
                <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={dest.address}>
                  {dest.address}
                </td>
                <td className="px-4 py-3 font-mono text-gray-500">{dest.phone}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      dest.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {dest.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => alert(`Reviewing access credentials for location ${dest.name}`)}
                    className="text-[10px] text-blue-600 font-bold hover:underline"
                  >
                    View Info
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
