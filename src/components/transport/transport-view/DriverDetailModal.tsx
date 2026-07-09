import { motion } from "motion/react";
import { Users2, X } from "lucide-react";
import { Driver } from "../../../types";

interface DriverDetailModalProps {
  driver: Driver;
  onClose: () => void;
}

export default function DriverDetailModal({ driver, onClose }: DriverDetailModalProps) {
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
            <Users2 className="h-5 w-5 text-blue-600" />
            <span className="text-base font-bold text-gray-900">Driver License Record</span>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-xs text-gray-400 font-bold">Driver Name</div>
            <div className="text-base font-bold text-gray-900">{driver.name}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-400 font-bold">License Number</div>
              <div className="font-mono text-gray-800 font-semibold">{driver.licenseNumber}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-bold">Status</div>
              <span className="inline-flex rounded-xs bg-emerald-50 text-emerald-800 font-bold text-[11px] px-2 py-0.2 border border-emerald-100">
                Cleared Active
              </span>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 font-bold">Designated Logistical Carrier</div>
            <div className="font-semibold text-gray-800">{driver.carrierName}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 font-bold">Last weighbridge session date</div>
            <div className="font-mono text-gray-600">{driver.lastWeighedDate}</div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50/50 text-xs text-blue-900 border border-blue-100/50 leading-relaxed">
            Driver credentials verified on state regulatory weigh logs. Authorized to self-submit ticks on all digital station scale panels.
          </div>
        </div>
      </motion.div>
    </div>
  );
}
