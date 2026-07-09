import React from "react";
import { motion } from "motion/react";
import { MapPin, Building, FileText } from "lucide-react";
import { Customer, Job } from "../../../types";

interface DestinationFormProps {
  mode: "add" | "edit";
  selectedDestId: string | null;
  customers: Customer[];
  availableJobsForFormCustomer: Job[];
  formName: string;
  setFormName: (value: string) => void;
  formCustomerId: string;
  setFormCustomerId: (value: string) => void;
  formJobId: string;
  setFormJobId: (value: string) => void;
  formPhone: string;
  setFormPhone: (value: string) => void;
  formStatus: "Active" | "Inactive";
  setFormStatus: (value: "Active" | "Inactive") => void;
  formAddressLine1: string;
  setFormAddressLine1: (value: string) => void;
  formAddressLine2: string;
  setFormAddressLine2: (value: string) => void;
  formSuburb: string;
  setFormSuburb: (value: string) => void;
  formState: string;
  setFormState: (value: string) => void;
  formPostcode: string;
  setFormPostcode: (value: string) => void;
  formNotes: string;
  setFormNotes: (value: string) => void;
  onSave: (e?: React.FormEvent, isAddAnother?: boolean) => void;
  onCancel: () => void;
}

export default function DestinationForm({
  mode,
  selectedDestId,
  customers,
  availableJobsForFormCustomer,
  formName,
  setFormName,
  formCustomerId,
  setFormCustomerId,
  formJobId,
  setFormJobId,
  formPhone,
  setFormPhone,
  formStatus,
  setFormStatus,
  formAddressLine1,
  setFormAddressLine1,
  formAddressLine2,
  setFormAddressLine2,
  formSuburb,
  setFormSuburb,
  formState,
  setFormState,
  formPostcode,
  setFormPostcode,
  formNotes,
  setFormNotes,
  onSave,
  onCancel
}: DestinationFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(e, false);
  };

  return (
    <motion.form
      key="destinations-form-mode"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
      id="destination-entry-form"
    >
      <div className="bg-white border border-gray-100 rounded-xl shadow-md overflow-hidden">
        <div className="bg-slate-50 border-b border-gray-150 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                {mode === "add"
                  ? "Register New Destination"
                  : `Modify Destination Details [${selectedDestId}]`}
              </h3>
              <p className="text-[11px] text-gray-500">
                Provide geographical address, customer mappings, and notes.
              </p>
            </div>
          </div>
          <span className="font-mono text-xs text-slate-400">
            {mode === "add" ? "Draft Mode" : "Modifying Live Record"}
          </span>
        </div>

        {/* SECTION 1: DESTINATION DETAILS */}
        <div className="p-6 space-y-4">
          <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2">
            <Building className="h-4 w-4 text-blue-500" />
            <span>Destination Details</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Destination Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Destination Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Altona North Aggregate Plant"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 hover:border-gray-250 focus:bg-white text-xs font-semibold text-gray-900 rounded-lg px-3 py-2 shadow-xs focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400"
              />
            </div>

            {/* Customer Selection */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Associated Customer <span className="text-red-500">*</span>
              </label>
              <select
                value={formCustomerId}
                onChange={(e) => setFormCustomerId(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 text-xs font-semibold text-gray-900 rounded-lg px-3 py-2 shadow-xs focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 cursor-pointer"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.id}] {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Selection (Filtered by Customer) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Associated Job <span className="text-red-500">*</span>
              </label>
              <select
                value={formJobId}
                onChange={(e) => setFormJobId(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 text-xs font-semibold text-gray-900 rounded-lg px-3 py-2 shadow-xs focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 cursor-pointer"
              >
                {availableJobsForFormCustomer.length === 0 ? (
                  <option value="">-- No jobs active for this customer --</option>
                ) : (
                  availableJobsForFormCustomer.map((j) => (
                    <option key={j.id} value={j.id}>
                      [{j.id}] Contract Ref: {j.customerOrderRef} ({j.productName})
                    </option>
                  ))
                )}
              </select>
              {availableJobsForFormCustomer.length === 0 && (
                <p className="text-[10px] text-amber-600 mt-1">
                  Please register a Job for this customer first in the Jobs tab.
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Telephone / Site Dispatch Phone
              </label>
              <input
                type="text"
                placeholder="e.g. +61 3 9522 9900"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 hover:border-gray-250 focus:bg-white text-xs font-semibold text-gray-900 rounded-lg px-3 py-2 shadow-xs focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400"
              />
            </div>

            {/* Status Selection */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as "Active" | "Inactive")}
                className="w-full bg-slate-50 border border-gray-200 text-xs font-semibold text-gray-900 rounded-lg px-3 py-2 shadow-xs focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: ADDRESS DETAILS */}
        <div className="p-6 space-y-4 bg-slate-50/40 border-t border-gray-100">
          <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2">
            <MapPin className="h-4 w-4 text-emerald-500" />
            <span>Address Details</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Address Line 1 */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 102 Quarry Rd"
                value={formAddressLine1}
                onChange={(e) => setFormAddressLine1(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 hover:border-gray-250 focus:bg-white text-xs font-semibold text-gray-900 rounded-lg px-3 py-2 shadow-xs focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400"
              />
            </div>

            {/* Address Line 2 */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Address Line 2 (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Gate 4 entrance next to silo"
                value={formAddressLine2}
                onChange={(e) => setFormAddressLine2(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 hover:border-gray-250 focus:bg-white text-xs font-semibold text-gray-900 rounded-lg px-3 py-2 shadow-xs focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400"
              />
            </div>

            {/* Suburb */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Suburb <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Lilydale"
                value={formSuburb}
                onChange={(e) => setFormSuburb(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 hover:border-gray-250 focus:bg-white text-xs font-semibold text-gray-900 rounded-lg px-3 py-2 shadow-xs focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. VIC"
                value={formState}
                onChange={(e) => setFormState(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 hover:border-gray-250 focus:bg-white text-xs font-semibold text-gray-900 rounded-lg px-3 py-2 shadow-xs focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400"
              />
            </div>

            {/* Postcode */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Postcode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 3140"
                value={formPostcode}
                onChange={(e) => setFormPostcode(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 hover:border-gray-250 focus:bg-white text-xs font-semibold text-gray-900 rounded-lg px-3 py-2 shadow-xs focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: NOTES */}
        <div className="p-6 space-y-4 border-t border-gray-100">
          <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2">
            <FileText className="h-4 w-4 text-amber-500" />
            <span>Operational & Dispatch Notes</span>
          </h4>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              placeholder="Provide logistics comments, special entrance instructions, speed limits, or restrictions..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 hover:border-gray-250 focus:bg-white text-xs font-medium text-gray-900 rounded-lg px-3 py-2 shadow-xs focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400"
            />
          </div>
        </div>

        {/* ACTION BUTTON BAR */}
        <div className="bg-slate-50 border-t border-gray-150 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest font-mono">
            * MANDATORY FLDS
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              Cancel
            </button>

            {mode === "add" && (
                <button
                  type="button"
                  onClick={() => onSave(undefined, true)}
                  className="px-4 py-2 bg-slate-100 border border-gray-200 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  Save & Add Another
                </button>
            )}

            <button
              type="submit"
              className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition cursor-pointer"
            >
              Save Destination
            </button>
          </div>
        </div>
      </div>
    </motion.form>
  );
}
