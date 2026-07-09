import React from "react";
import { Truck } from "lucide-react";
import { Vehicle } from "../../../../types";

interface VehicleDetailModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export default function VehicleDetailModal({ vehicle, onClose }: VehicleDetailModalProps) {
  const vehicleId = vehicle.id || `V-${vehicle.plateNumber.replace("-", "")}`;
  const vehicleName = vehicle.name || `${vehicle.vehicleType} Fleet`;
  const weightMax = vehicle.weightMax || vehicle.tareWeight * 2.5;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-gray-200 max-w-md w-full shadow-2xl p-6 relative">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider border-b pb-3 mb-4 flex items-center gap-2">
          <Truck className="h-4 w-4 text-blue-600" />
          Vehicle Specifications
        </h3>
        <div className="space-y-3.5 text-xs">
          <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
            <span className="font-bold text-gray-400 uppercase">Vehicle ID</span>
            <span className="font-bold font-mono text-gray-900">{vehicleId}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
            <span className="font-bold text-gray-400 uppercase">Vehicle Name</span>
            <span className="font-extrabold text-gray-900">{vehicleName}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
            <span className="font-bold text-gray-400 uppercase">Plate Number</span>
            <span className="font-bold font-mono text-gray-700">{vehicle.plateNumber}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
            <span className="font-bold text-gray-400 uppercase">Vehicle Type</span>
            <span className="font-bold text-gray-700">{vehicle.vehicleType}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
            <span className="font-bold text-gray-400 uppercase">Registered Tare</span>
            <span className="font-bold font-mono text-gray-900">{vehicle.tareWeight.toFixed(2)} t</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
            <span className="font-bold text-gray-400 uppercase">Max Gross Limit</span>
            <span className="font-bold font-mono text-gray-900">{weightMax.toFixed(2)} t</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
            <span className="font-bold text-gray-400 uppercase">Last Tare Calibration</span>
            <span className="font-bold text-gray-500">{vehicle.lastTareDate || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
            <span className="font-bold text-gray-400 uppercase">Status</span>
            <span
              className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                vehicle.status === "Active"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-red-50 text-red-700 border-red-100"
              }`}
            >
              {vehicle.status}
            </span>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-4 py-2 text-xs font-black transition"
          >
            Close Specs
          </button>
        </div>
      </div>
    </div>
  );
}
