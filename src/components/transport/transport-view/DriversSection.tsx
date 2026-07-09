import { Driver } from "../../../types";

interface DriversSectionProps {
  drivers: Driver[];
  onViewDriver: (driver: Driver) => void;
}

export default function DriversSection({ drivers, onViewDriver }: DriversSectionProps) {
  return (
    <div>
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
        <span className="text-xs font-bold text-gray-500">Registered Carter Drivers ({drivers.length})</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500 text-[11px] uppercase tracking-wider select-none">
              <th className="px-5 py-3">Driver ID</th>
              <th className="px-5 py-3">Driver Name</th>
              <th className="px-5 py-3">Assigned Carrier</th>
              <th className="px-5 py-3">License Code</th>
              <th className="px-5 py-3">Last Weigh Date</th>
              <th className="px-5 py-3 text-center">Status</th>
              <th className="px-5 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {drivers.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50/40">
                <td className="px-5 py-4 font-mono font-bold text-gray-500">{d.id}</td>
                <td className="px-5 py-4 font-bold text-gray-950">{d.name}</td>
                <td className="px-5 py-4 text-slate-700 font-semibold">{d.carrierName}</td>
                <td className="px-5 py-4 text-gray-500 font-mono">{d.licenseNumber}</td>
                <td className="px-5 py-4 text-gray-400 font-mono">{d.lastWeighedDate}</td>
                <td className="px-5 py-4 text-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-xs border uppercase ${
                    d.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
                  }`}>
                    {d.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <button
                    onClick={() => onViewDriver(d)}
                    className="rounded-md p-1 bg-slate-50 text-blue-600 text-xs font-bold hover:bg-blue-50 px-2"
                  >
                    View
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
