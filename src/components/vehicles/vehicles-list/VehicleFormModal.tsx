import React from "react";
import { Truck, X, Info, Layers } from "lucide-react";
import { Vehicle, AxleSet } from "../../../types";

interface VehicleFormModalProps {
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  formMode: "add" | "edit";
  editingPlateNumber: string | null;
  fieldCategory: "Standard" | "Multiaxel";
  setFieldCategory: (category: "Standard" | "Multiaxel") => void;
  fieldName: string;
  setFieldName: (name: string) => void;
  fieldPlateNumber: string;
  setFieldPlateNumber: (plate: string) => void;
  fieldCarterName: string;
  setFieldCarterName: (name: string) => void;
  fieldVehicleType: string;
  setFieldVehicleType: (type: string) => void;
  fieldMakeModel: string;
  setFieldMakeModel: (makeModel: string) => void;
  fieldStatus: "Active" | "Inactive";
  setFieldStatus: (status: "Active" | "Inactive") => void;
  fieldNotes: string;
  setFieldNotes: (notes: string) => void;
  fieldTareWeight: number;
  setFieldTareWeight: (weight: number) => void;
  fieldWeightMax: number;
  setFieldWeightMax: (weight: number) => void;
  fieldVariance: number;
  setFieldVariance: (variance: number) => void;
  fieldWeighedAs: string;
  setFieldWeighedAs: (weighedAs: string) => void;
  fieldEnableCombinedTare: boolean;
  setFieldEnableCombinedTare: (enabled: boolean) => void;
  fieldCombinedTareWeight: number;
  setFieldCombinedTareWeight: (weight: number) => void;
  fieldGrossMaximum: number;
  setFieldGrossMaximum: (weight: number) => void;
  fieldAxleSets: AxleSet[];
  setFieldAxleSets: (sets: AxleSet[]) => void;
  computedCombinedTare: number;
  carterNames: string[];
  vehicleTypesList: string[];
  handleSaveVehicle: (andAddAnother?: boolean) => void;
}

export default function VehicleFormModal({
  isFormOpen,
  setIsFormOpen,
  formMode,
  editingPlateNumber,
  fieldCategory,
  setFieldCategory,
  fieldName,
  setFieldName,
  fieldPlateNumber,
  setFieldPlateNumber,
  fieldCarterName,
  setFieldCarterName,
  fieldVehicleType,
  setFieldVehicleType,
  fieldMakeModel,
  setFieldMakeModel,
  fieldStatus,
  setFieldStatus,
  fieldNotes,
  setFieldNotes,
  fieldTareWeight,
  setFieldTareWeight,
  fieldWeightMax,
  setFieldWeightMax,
  fieldVariance,
  setFieldVariance,
  fieldWeighedAs,
  setFieldWeighedAs,
  fieldEnableCombinedTare,
  setFieldEnableCombinedTare,
  fieldCombinedTareWeight,
  setFieldCombinedTareWeight,
  fieldGrossMaximum,
  setFieldGrossMaximum,
  fieldAxleSets,
  setFieldAxleSets,
  computedCombinedTare,
  carterNames,
  vehicleTypesList,
  handleSaveVehicle
}: VehicleFormModalProps) {
  if (!isFormOpen) return null;

  const getAxleSetCount = (weighedAs: string): number => {
    switch (weighedAs) {
      case "2 Axle Sets":
        return 2;
      case "3 Axle Sets":
        return 3;
      case "4 Axle Sets":
        return 4;
      case "5 Axle Sets":
        return 5;
      default:
        return 1; // "Weighed as Whole"
    }
  };

  const handleWeighedAsChange = (weighedAsVal: string) => {
    setFieldWeighedAs(weighedAsVal);
    const count = getAxleSetCount(weighedAsVal);
    const updatedSets: AxleSet[] = [];
    for (let i = 1; i <= count; i++) {
      const existing = fieldAxleSets.find((s) => s.axleSetNumber === i);
      if (existing) {
        updatedSets.push(existing);
      } else {
        updatedSets.push({
          axleSetNumber: i,
          tareWeight: 5.0,
          weightMax: 14.0,
          variance: 0.2
        });
      }
    }
    setFieldAxleSets(updatedSets);
  };

  const handleAxleSetChange = (index: number, key: keyof AxleSet, value: number) => {
    const updated = [...fieldAxleSets];
    updated[index] = {
      ...updated[index],
      [key]: value
    };
    setFieldAxleSets(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-gray-200 max-w-3xl w-full shadow-2xl overflow-hidden animate-zoom-in">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-slate-50 flex items-center justify-between">
          <h2 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <Truck className="h-4 w-4 text-blue-600" />
            {formMode === "add" ? "Register New Fleet Vehicle" : `Edit Vehicle Specs: ${editingPlateNumber}`}
          </h2>
          <button
            onClick={() => setIsFormOpen(false)}
            className="rounded-lg p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs overflow-y-auto max-h-[75vh]">
          {/* Vehicle Category Selector */}
          <div className="p-4 bg-slate-50 rounded-lg border border-gray-150 space-y-2">
            <label className="font-bold text-gray-600 block uppercase tracking-wider text-[10px]">
              Vehicle Category Selection
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 font-bold text-gray-800 cursor-pointer">
                <input
                  type="radio"
                  name="vehicle_category"
                  value="Standard"
                  checked={fieldCategory === "Standard"}
                  onChange={() => setFieldCategory("Standard")}
                  className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                Standard Vehicle
              </label>
              <label className="flex items-center gap-2 font-bold text-gray-800 cursor-pointer">
                <input
                  type="radio"
                  name="vehicle_category"
                  value="Multiaxel"
                  checked={fieldCategory === "Multiaxel"}
                  onChange={() => setFieldCategory("Multiaxel")}
                  className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                Multiaxel Vehicle
              </label>
            </div>
          </div>

          {/* Section 1: Vehicle Details */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-wider border-b border-gray-100 pb-1.5">
              Vehicle Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Vehicle Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-500 block">Vehicle Name *</label>
                <input
                  type="text"
                  placeholder="E.g., Star Bulker #5"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
                />
              </div>

              {/* Registration Plate */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-500 block">Registration Number *</label>
                <input
                  type="text"
                  placeholder="E.g., XY-99-ZZ"
                  value={fieldPlateNumber}
                  onChange={(e) => setFieldPlateNumber(e.target.value)}
                  disabled={formMode === "edit"}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition font-mono uppercase disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Carter Link */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-500 block">Carter *</label>
                <select
                  value={fieldCarterName}
                  onChange={(e) => setFieldCarterName(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
                >
                  {carterNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vehicle Type Class */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-500 block">Vehicle Type *</label>
                <select
                  value={fieldVehicleType}
                  onChange={(e) => setFieldVehicleType(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
                >
                  {vehicleTypesList.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Make and Model */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-500 block">Make and Model</label>
                <input
                  type="text"
                  placeholder="E.g., Kenworth T610"
                  value={fieldMakeModel}
                  onChange={(e) => setFieldMakeModel(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-500 block">Status</label>
                <select
                  value={fieldStatus}
                  onChange={(e) => setFieldStatus(e.target.value as "Active" | "Inactive")}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="font-bold text-gray-500 block">Notes</label>
              <textarea
                placeholder="Enter special access notes, permit codes, or compliance records..."
                value={fieldNotes}
                onChange={(e) => setFieldNotes(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Section 2: Weight Specifications */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-wider border-b border-gray-100 pb-1.5">
              Weight Specifications & Compliance (Tonnes)
            </h3>

            {fieldCategory === "Standard" ? (
              /* Standard Weights */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
                {/* Tare Weight */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-500 block">Tare Weight (t) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={fieldTareWeight}
                    onChange={(e) => setFieldTareWeight(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition font-mono text-[13px]"
                  />
                </div>

                {/* Weight Max */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-500 block">Weight Max (t) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={fieldWeightMax}
                    onChange={(e) => setFieldWeightMax(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition font-mono text-[13px]"
                  />
                </div>

                {/* Variance */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-500 block">Variance (t)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={fieldVariance}
                    onChange={(e) => setFieldVariance(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition font-mono text-[13px]"
                  />
                </div>
              </div>
            ) : (
              /* Multiaxel Weights */
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {/* Weighed As Option */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-500 block">Weighed As</label>
                    <select
                      value={fieldWeighedAs}
                      onChange={(e) => handleWeighedAsChange(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
                    >
                      <option value="Weighed as Whole">Weighed as Whole</option>
                      <option value="2 Axle Sets">2 Axle Sets</option>
                      <option value="3 Axle Sets">3 Axle Sets</option>
                      <option value="4 Axle Sets">4 Axle Sets</option>
                      <option value="5 Axle Sets">5 Axle Sets</option>
                    </select>
                  </div>

                  {/* Enable Combined Tare */}
                  <div className="space-y-1.5 flex flex-col justify-center">
                    <label className="font-bold text-gray-500 block mb-1">Enable Combined Tare</label>
                    <label className="flex items-center gap-2 font-bold text-gray-700 cursor-pointer h-10 select-none">
                      <input
                        type="checkbox"
                        checked={fieldEnableCombinedTare}
                        onChange={(e) => setFieldEnableCombinedTare(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                      />
                      Sum of Axle Sets
                    </label>
                  </div>

                  {/* Combined Tare Weight */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-500 block">Combined Tare Weight (t)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={computedCombinedTare}
                      onChange={(e) => setFieldCombinedTareWeight(parseFloat(e.target.value) || 0)}
                      disabled={fieldEnableCombinedTare}
                      className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition font-mono text-[13px] disabled:opacity-50"
                    />
                  </div>

                  {/* Gross Maximum */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-500 block">Gross Maximum (t) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={fieldGrossMaximum}
                      onChange={(e) => setFieldGrossMaximum(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition font-mono text-[13px]"
                    />
                  </div>
                </div>

                {/* Axle Set Cards */}
                <div className="space-y-2">
                  <label className="font-bold text-gray-600 block uppercase tracking-wider text-[10px]">
                    Axle Set Specifications
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {fieldAxleSets.map((set, idx) => (
                      <div
                        key={set.axleSetNumber}
                        className="bg-slate-50/50 p-3.5 rounded-lg border border-gray-250/70 space-y-3 relative"
                      >
                        <div className="flex items-center justify-between border-b border-gray-150 pb-1 mb-1">
                          <span className="font-black text-blue-700 uppercase tracking-widest text-[9.5px] flex items-center gap-1.5">
                            <Layers className="h-3 w-3" />
                            Axle Set #{set.axleSetNumber}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400">Tare Weight</label>
                            <input
                              type="number"
                              step="0.01"
                              value={set.tareWeight}
                              onChange={(e) => handleAxleSetChange(idx, "tareWeight", parseFloat(e.target.value) || 0)}
                              className="w-full bg-white border border-gray-200 rounded p-1 font-bold text-gray-800 font-mono text-[11px]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400">Gross Max</label>
                            <input
                              type="number"
                              step="0.01"
                              value={set.weightMax}
                              onChange={(e) => handleAxleSetChange(idx, "weightMax", parseFloat(e.target.value) || 0)}
                              className="w-full bg-white border border-gray-200 rounded p-1 font-bold text-gray-800 font-mono text-[11px]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400">Variance</label>
                            <input
                              type="number"
                              step="0.01"
                              value={set.variance}
                              onChange={(e) => handleAxleSetChange(idx, "variance", parseFloat(e.target.value) || 0)}
                              className="w-full bg-white border border-gray-200 rounded p-1 font-bold text-gray-800 font-mono text-[11px]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50/50 border border-blue-150 p-3 rounded-lg text-[11px] text-blue-800 flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="font-semibold leading-relaxed">
                Weight values are validated during weighing processes. Weigh-in checks evaluate if total loaded weight
                exceeds <strong> Weight Max + Variance </strong> limits.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-slate-50 flex flex-wrap items-center justify-between gap-2.5">
          <button
            onClick={() => setIsFormOpen(false)}
            className="rounded-lg border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2 text-xs font-bold text-gray-700 transition select-none"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {formMode === "add" && (
              <button
                onClick={() => handleSaveVehicle(true)}
                className="rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 px-4 py-2 text-xs font-extrabold text-blue-700 transition select-none"
              >
                Save & Add Another
              </button>
            )}
            <button
              onClick={() => handleSaveVehicle(false)}
              className="rounded-lg bg-gray-900 hover:bg-gray-800 active:scale-95 text-white px-5 py-2 text-xs font-black transition shadow-xs select-none"
            >
              Save Vehicle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
