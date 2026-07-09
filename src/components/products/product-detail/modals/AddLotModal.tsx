import React from "react";
import { X } from "lucide-react";

interface AddLotModalProps {
  isOpen: boolean;
  lotNo: string;
  setLotNo: (value: string) => void;
  quantity: string;
  setQuantity: (value: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AddLotModal({ isOpen, lotNo, setLotNo, quantity, setQuantity, onClose, onSubmit }: AddLotModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" />
      <div className="relative bg-white rounded-xl border border-gray-150 p-6 shadow-xl max-w-sm w-full space-y-4 z-10">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-extrabold text-sm text-gray-900">Register Product Lot Batch</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500 block">Lot Identifier ID</label>
            <input
              type="text"
              required
              value={lotNo}
              onChange={(e) => setLotNo(e.target.value)}
              className="w-full rounded-lg border border-gray-200 p-2 text-xs font-mono font-bold"
              placeholder="e.g. PL-123-003"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500 block">Initial Quantity Allocation (Tonnes)</label>
            <input
              type="number"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-lg border border-gray-200 p-2 text-xs font-bold"
              placeholder="e.g. 1500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-xs font-black transition"
            >
              Register Lot
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 text-xs font-bold transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
