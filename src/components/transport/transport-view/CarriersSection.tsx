import { Carrier } from "../../../types";

interface CarriersSectionProps {
  carriers: Carrier[];
}

export default function CarriersSection({ carriers }: CarriersSectionProps) {
  return (
    <div>
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
        <span className="text-xs font-bold text-gray-500">Fleet Transport Companies ({carriers.length})</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500 text-[11px] uppercase tracking-wider select-none">
              <th className="px-5 py-3">Carrier ID</th>
              <th className="px-5 py-3">Transport Company</th>
              <th className="px-5 py-3">Operations Dispatch</th>
              <th className="px-5 py-3">Operations Email</th>
              <th className="px-5 py-3 text-center">Active Trucks</th>
              <th className="px-5 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {carriers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/40">
                <td className="px-5 py-4 font-mono font-bold text-gray-500">{c.id}</td>
                <td className="px-5 py-4 font-bold text-gray-950">{c.name}</td>
                <td className="px-5 py-4 text-gray-600">{c.contactNo}</td>
                <td className="px-5 py-4 text-gray-400 font-mono">{c.email}</td>
                <td className="px-5 py-4 text-center font-bold text-gray-800">{c.vehicleCount} trucks</td>
                <td className="px-5 py-4 text-center">
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-xs border border-emerald-100 uppercase">
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
