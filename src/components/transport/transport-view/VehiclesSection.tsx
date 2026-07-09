import { Vehicle } from "../../../types";

interface VehiclesSectionProps {
  vehicles: Vehicle[];
  onViewVehicle: (vehicle: Vehicle) => void;
}

export default function VehiclesSection({ vehicles, onViewVehicle }: VehiclesSectionProps) {
  return (
    <div>
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
        <span className="text-xs font-bold text-gray-500">Fleet Vehicles & Tares ({vehicles.length})</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500 text-[11px] uppercase tracking-wider select-none">
              <th className="px-5 py-3">Registration Plate</th>
              <th className="px-5 py-3">Vehicle Configuration</th>
              <th className="px-5 py-3">Logistics Carrier</th>
              <th className="px-5 py-3 text-right">Standard Tare Wt (t)</th>
              <th className="px-5 py-3">Tare Date Audit</th>
              <th className="px-5 py-3 text-center">Status</th>
              <th className="px-5 py-3 text-center">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vehicles.map((v) => (
              <tr key={v.plateNumber} className="hover:bg-gray-50/40">
                <td className="px-5 py-4 font-mono font-bold text-gray-900">{v.plateNumber}</td>
                <td className="px-5 py-4 font-semibold text-gray-700">{v.vehicleType}</td>
                <td className="px-5 py-4 text-gray-500">{v.carrierName}</td>
                <td className="px-5 py-4 text-right font-mono font-extrabold text-blue-700">{v.tareWeight.toFixed(2)} t</td>
                <td className="px-5 py-4 text-gray-400 font-mono">{v.lastTareDate}</td>
                <td className="px-5 py-4 text-center">
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-xs border border-emerald-100 uppercase">
                    {v.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <button
                    onClick={() => onViewVehicle(v)}
                    className="rounded-md p-1 bg-slate-50 text-blue-600 text-xs font-bold hover:bg-blue-50 px-2"
                  >
                    Details
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
