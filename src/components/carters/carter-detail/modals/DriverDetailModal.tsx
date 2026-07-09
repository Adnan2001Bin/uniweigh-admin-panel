import React from "react";
import { User } from "lucide-react";
import { Driver } from "../../../../types";

interface DriverDetailModalProps {
  driver: Driver;
  onClose: () => void;
}

export default function DriverDetailModal({ driver, onClose }: DriverDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-gray-200 max-w-md w-full shadow-2xl p-6 relative">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider border-b pb-3 mb-4 flex items-center gap-2">
          <User className="h-4 w-4 text-blue-600" />
          Driver Profile Specs
        </h3>
        <div className="space-y-3.5 text-xs">
          <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
            <span className="font-bold text-gray-400 uppercase">Driver ID</span>
            <span className="font-bold font-mono text-gray-900">{driver.id}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
            <span className="font-bold text-gray-400 uppercase">Driver Name</span>
            <span className="font-extrabold text-gray-900">{driver.name}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
            <span className="font-bold text-gray-400 uppercase">Licence Number</span>
            <span className="font-bold font-mono text-gray-700">{driver.licenseNumber}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
            <span className="font-bold text-gray-400 uppercase">Phone Number</span>
            <span className="font-bold text-gray-700">+61 400 123 456</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
            <span className="font-bold text-gray-400 uppercase">Last Weigh Date</span>
            <span className="font-bold text-gray-500">{driver.lastWeighedDate || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
            <span className="font-bold text-gray-400 uppercase">Status</span>
            <span
              className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                driver.status === "Active"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-red-50 text-red-700 border-red-100"
              }`}
            >
              {driver.status}
            </span>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-4 py-2 text-xs font-black transition"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
