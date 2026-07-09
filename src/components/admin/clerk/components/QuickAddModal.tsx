import React from "react";
import { Plus, X } from "lucide-react";

interface QuickAddModalProps {
  activeQuickAdd: string | null;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;

  newCustName: string;
  setNewCustName: (v: string) => void;
  newCustTerms: string;
  setNewCustTerms: (v: string) => void;

  newJobRef: string;
  setNewJobRef: (v: string) => void;
  newJobQty: string;
  setNewJobQty: (v: string) => void;
  newJobRate: string;
  setNewJobRate: (v: string) => void;

  newDestName: string;
  setNewDestName: (v: string) => void;
  newDestAddress: string;
  setNewDestAddress: (v: string) => void;

  newContactName: string;
  setNewContactName: (v: string) => void;
  newContactPhone: string;
  setNewContactPhone: (v: string) => void;

  newLotName: string;
  setNewLotName: (v: string) => void;
  newLotQty: string;
  setNewLotQty: (v: string) => void;

  newCarterName: string;
  setNewCarterName: (v: string) => void;
  newCarterRate: string;
  setNewCarterRate: (v: string) => void;

  newDriverName: string;
  setNewDriverName: (v: string) => void;
  newDriverLicense: string;
  setNewDriverLicense: (v: string) => void;

  newVehiclePlate: string;
  setNewVehiclePlate: (v: string) => void;
  newVehicleTare: string;
  setNewVehicleTare: (v: string) => void;
  newVehicleMax: string;
  setNewVehicleMax: (v: string) => void;
  newVehicleCategory: "Standard" | "Multiaxel";
  setNewVehicleCategory: (v: "Standard" | "Multiaxel") => void;
}

export default function QuickAddModal(props: QuickAddModalProps) {
  const {
    activeQuickAdd,
    onCancel,
    onSubmit,
    newCustName, setNewCustName,
    newCustTerms, setNewCustTerms,
    newJobRef, setNewJobRef,
    newJobQty, setNewJobQty,
    newJobRate, setNewJobRate,
    newDestName, setNewDestName,
    newDestAddress, setNewDestAddress,
    newContactName, setNewContactName,
    newContactPhone, setNewContactPhone,
    newLotName, setNewLotName,
    newLotQty, setNewLotQty,
    newCarterName, setNewCarterName,
    newCarterRate, setNewCarterRate,
    newDriverName, setNewDriverName,
    newDriverLicense, setNewDriverLicense,
    newVehiclePlate, setNewVehiclePlate,
    newVehicleTare, setNewVehicleTare,
    newVehicleMax, setNewVehicleMax,
    newVehicleCategory, setNewVehicleCategory
  } = props;

  if (!activeQuickAdd) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-950">
          <span className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-500" />
            Quick-Add New {activeQuickAdd}
          </span>
          <button onClick={onCancel} className="text-slate-400 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs font-medium">
          {/* CUSTOMER QUICK FORM */}
          {activeQuickAdd === "customer" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold block">Company / Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Victorian Pipelaying Co."
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold block">Payment Terms</label>
                <select
                  value={newCustTerms}
                  onChange={(e) => setNewCustTerms(e.target.value)}
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 focus:outline-none"
                >
                  <option value="Immediate">Immediate Cash Payment</option>
                  <option value="30 Days Net">30 Days Net Invoice</option>
                  <option value="14 Days Net">14 Days Net Invoice</option>
                </select>
              </div>
            </div>
          )}

          {/* JOB QUICK FORM */}
          {activeQuickAdd === "job" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold block">Job Purchase Order Reference *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PO-ROAD-MELB-09"
                  value={newJobRef}
                  onChange={(e) => setNewJobRef(e.target.value)}
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold block">Order Qty (Tonnes)</label>
                  <input
                    type="number"
                    placeholder="500"
                    value={newJobQty}
                    onChange={(e) => setNewJobQty(e.target.value)}
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold block">Applied Rate ($/t)</label>
                  <input
                    type="number"
                    placeholder="45.00"
                    value={newJobRate}
                    onChange={(e) => setNewJobRate(e.target.value)}
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DESTINATION QUICK FORM */}
          {activeQuickAdd === "destination" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold block">Destination Name / Terminal *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Geelong Depot Gate 2"
                  value={newDestName}
                  onChange={(e) => setNewDestName(e.target.value)}
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold block">Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. 102 Corio Wharf Rd"
                  value={newDestAddress}
                  onChange={(e) => setNewDestAddress(e.target.value)}
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* CONTACT QUICK FORM */}
          {activeQuickAdd === "contact" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold block">Supervisor Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Hasselhoff"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold block">Mobile Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 0411 999 000"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* PRODUCT LOT QUICK FORM */}
          {activeQuickAdd === "lot" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold block">Product Allocation Lot Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lot G-991 Quarry"
                  value={newLotName}
                  onChange={(e) => setNewLotName(e.target.value)}
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold block">Total Lot Quantity (t)</label>
                <input
                  type="number"
                  placeholder="1000"
                  value={newLotQty}
                  onChange={(e) => setNewLotQty(e.target.value)}
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* CARTER QUICK FORM */}
          {activeQuickAdd === "carter" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold block">Carter Company *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Toll Freight Express"
                  value={newCarterName}
                  onChange={(e) => setNewCarterName(e.target.value)}
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold block">Default Cartage Rate ($ per Tonne)</label>
                <input
                  type="number"
                  placeholder="12.50"
                  value={newCarterRate}
                  onChange={(e) => setNewCarterRate(e.target.value)}
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* DRIVER QUICK FORM */}
          {activeQuickAdd === "driver" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold block">Driver Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arthur Pendragon"
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold block">Truck Driver License No.</label>
                <input
                  type="text"
                  placeholder="e.g. DL-40091"
                  value={newDriverLicense}
                  onChange={(e) => setNewDriverLicense(e.target.value)}
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* VEHICLE QUICK FORM */}
          {activeQuickAdd === "vehicle" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold block">Registration Plate Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MELB-882-TR"
                  value={newVehiclePlate}
                  onChange={(e) => setNewVehiclePlate(e.target.value)}
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold block">Tare Weight (t)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="14.50"
                    value={newVehicleTare}
                    onChange={(e) => setNewVehicleTare(e.target.value)}
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold block">Max Gross Weight (t)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="42.50"
                    value={newVehicleMax}
                    onChange={(e) => setNewVehicleMax(e.target.value)}
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold block">Vehicle Type Classification</label>
                <select
                  value={newVehicleCategory}
                  onChange={(e) => setNewVehicleCategory(e.target.value as "Standard" | "Multiaxel")}
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 focus:outline-none"
                >
                  <option value="Standard">Standard (Single Semi/Rigid)</option>
                  <option value="Multiaxel">Multiaxel Setup (Multi-trailer / Quad-dog)</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-150">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-slate-100 hover:bg-slate-250 text-slate-700 font-bold h-11 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold h-11 rounded-xl transition"
            >
              Create & Select
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
