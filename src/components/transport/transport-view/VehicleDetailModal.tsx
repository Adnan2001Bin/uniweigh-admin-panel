import { motion } from "motion/react";
import { Truck, X } from "lucide-react";
import { Vehicle } from "../../../types";

interface VehicleDetailModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export default function VehicleDetailModal({ vehicle, onClose }: VehicleDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="fixed inset-0" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative z-10 space-y-4 text-sm text-gray-700"
      >
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            <span className="text-base font-bold text-gray-900">Vehicle Specification</span>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-xs text-gray-400 font-bold">Plates Registration</div>
            <div className="text-lg font-black text-slate-900 font-mono">{vehicle.plateNumber}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-400 font-bold">Type Profile</div>
              <div className="font-bold text-gray-800">{vehicle.vehicleType}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-bold">Calibration Tare Weight</div>
              <div className="font-mono font-black text-blue-700 text-sm">{vehicle.tareWeight.toFixed(2)} tonnes</div>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 font-bold">Carter Company Owner</div>
            <div className="font-semibold text-gray-800">{vehicle.carrierName}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 font-bold">Last Registered Tare Calibration</div>
            <div className="font-mono text-gray-500">{vehicle.lastTareDate}</div>
          </div>

          <div className="p-3 bg-slate-50 border rounded-lg text-xs leading-relaxed space-y-1">
            <span className="font-bold block text-gray-700">Digital Scale Safety Check:</span>
            <p className="text-gray-500">
              Calculated tare corresponds to a dry configuration. Any modifications to truck chassis or dual-fuel tanks require scale recalibration at Altona depot.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
