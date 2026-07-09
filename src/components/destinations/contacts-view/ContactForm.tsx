import React from "react";
import { Plus, Save, Upload } from "lucide-react";
import { Customer } from "../../../types";

interface ContactFormProps {
  isEditing: boolean;
  formName: string;
  setFormName: (value: string) => void;
  formCustomer: string;
  setFormCustomer: (value: string) => void;
  formPhoto: string;
  setFormPhoto: (value: string) => void;
  formCode: string;
  setFormCode: (value: string) => void;
  formRole: string;
  setFormRole: (value: string) => void;
  formPhone: string;
  setFormPhone: (value: string) => void;
  formMobile: string;
  setFormMobile: (value: string) => void;
  formEmail: string;
  setFormEmail: (value: string) => void;
  formStatus: "Active" | "Inactive";
  setFormStatus: (value: "Active" | "Inactive") => void;
  formSafety: boolean;
  setFormSafety: (value: boolean) => void;
  formSiteAccess: boolean;
  setFormSiteAccess: (value: boolean) => void;
  formEmergency: boolean;
  setFormEmergency: (value: boolean) => void;
  formSafetyInstructions: string;
  setFormSafetyInstructions: (value: string) => void;
  formSiteAccessNotes: string;
  setFormSiteAccessNotes: (value: string) => void;
  formPPE: string;
  setFormPPE: (value: string) => void;
  formInduction: boolean;
  setFormInduction: (value: boolean) => void;
  formInductionExpiry: string;
  setFormInductionExpiry: (value: string) => void;
  formGeneralNotes: string;
  setFormGeneralNotes: (value: string) => void;
  customers: Customer[];
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: (addAnother: boolean) => void;
  onCancel: () => void;
}

export default function ContactForm({
  isEditing,
  formName,
  setFormName,
  formCustomer,
  setFormCustomer,
  formPhoto,
  setFormPhoto,
  formCode,
  setFormCode,
  formRole,
  setFormRole,
  formPhone,
  setFormPhone,
  formMobile,
  setFormMobile,
  formEmail,
  setFormEmail,
  formStatus,
  setFormStatus,
  formSafety,
  setFormSafety,
  formSiteAccess,
  setFormSiteAccess,
  formEmergency,
  setFormEmergency,
  formSafetyInstructions,
  setFormSafetyInstructions,
  formSiteAccessNotes,
  setFormSiteAccessNotes,
  formPPE,
  setFormPPE,
  formInduction,
  setFormInduction,
  formInductionExpiry,
  setFormInductionExpiry,
  formGeneralNotes,
  setFormGeneralNotes,
  customers,
  onImageChange,
  onSave,
  onCancel
}: ContactFormProps) {
  return (
    <div
      className="bg-white border border-gray-100 rounded-2xl p-6 shadow-md animate-fade-in"
      id="contact-form-container"
    >
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">
          {isEditing ? `Edit Contact: ${formName}` : "Register New Destination Contact"}
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Configure company link, safety inductions, and site gate parameters.
        </p>
      </div>

      <div className="space-y-6 text-xs text-gray-700">
        {/* Subsection A: Contact Details */}
        <div className="space-y-4">
          <h3 className="text-[11px] uppercase tracking-wider text-blue-700 font-extrabold border-b border-gray-100 pb-1.5">
            1. Contact Profile & Organization Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Customer Mapped Link */}
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-650">Company Customer Link *</label>
              <select
                value={formCustomer}
                onChange={(e) => setFormCustomer(e.target.value)}
                className="w-full border border-gray-200 bg-white rounded-lg p-2 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400"
                required
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-650">Contact Full Name *</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Alistair Cooke"
                className="w-full border border-gray-200 rounded-lg p-2 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400"
                required
              />
            </div>

            {/* Contact Code */}
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-650">Contact Code</label>
              <input
                type="text"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-2 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 font-mono"
                placeholder="e.g. CON-APX-05"
              />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-650">Role / Position Title</label>
              <input
                type="text"
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                placeholder="e.g. HSE Manager"
                className="w-full border border-gray-200 rounded-lg p-2 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-650">Office Direct Phone</label>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="e.g. +61 3 9999 1111"
                className="w-full border border-gray-200 rounded-lg p-2 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 font-mono"
              />
            </div>

            {/* Mobile */}
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-650">Mobile Dispatch Contact</label>
              <input
                type="text"
                value={formMobile}
                onChange={(e) => setFormMobile(e.target.value)}
                placeholder="e.g. +61 412 345 678"
                className="w-full border border-gray-200 rounded-lg p-2 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 font-mono"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-650">Email Address</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="e.g. a.cooke@apex.com"
                className="w-full border border-gray-200 rounded-lg p-2 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 font-mono"
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-650">Communication Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as "Active" | "Inactive")}
                className="w-full border border-gray-200 bg-white rounded-lg p-2 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Photo Upload block */}
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-650">Profile Picture / Avatar</label>
              <div className="flex items-center gap-3">
                {formPhoto ? (
                  <div className="relative h-11 w-11 rounded-full border border-gray-200 shadow-xs overflow-hidden shrink-0">
                    <img
                      src={formPhoto}
                      alt="Upload preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={() => setFormPhoto("")}
                      className="absolute inset-0 bg-black/60 text-white opacity-0 hover:opacity-100 transition flex items-center justify-center font-bold text-[8px]"
                    >
                      REMOVE
                    </button>
                  </div>
                ) : (
                  <div className="h-11 w-11 rounded-full bg-slate-100 border border-slate-200 shadow-xs flex items-center justify-center font-bold text-slate-400 text-xs shrink-0">
                    No Photo
                  </div>
                )}
                <label className="border border-dashed border-gray-250 rounded-lg p-2 cursor-pointer bg-slate-50 hover:bg-slate-100 shadow-xs transition flex items-center gap-1">
                  <Upload className="h-3.5 w-3.5 text-gray-500" />
                  <span>Upload JPG/PNG</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Subsection B: Safety & Access */}
        <div className="space-y-4 pt-2">
          <h3 className="text-[11px] uppercase tracking-wider text-rose-700 font-extrabold border-b border-gray-100 pb-1.5">
            2. Safety Protocols & Site access parameters
          </h3>

          {/* Boolean Toggles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-gray-100 p-4 rounded-xl bg-slate-50/50 shadow-xs">
            <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded hover:bg-white transition">
              <input
                type="checkbox"
                checked={formSafety}
                onChange={(e) => setFormSafety(e.target.checked)}
                className="rounded text-rose-600 border-gray-300 focus:ring-rose-550 mt-0.5"
              />
              <div>
                <span className="font-bold block text-gray-800">Safety contact</span>
                <span className="text-[10px] text-gray-400 font-medium">
                  Designated point of contact for safety auditing and incident reporting.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded hover:bg-white transition">
              <input
                type="checkbox"
                checked={formSiteAccess}
                onChange={(e) => setFormSiteAccess(e.target.checked)}
                className="rounded text-blue-600 border-gray-300 focus:ring-blue-550 mt-0.5"
              />
              <div>
                <span className="font-bold block text-gray-800">Site Access Coordinator</span>
                <span className="text-[10px] text-gray-400 font-medium">
                  Grants induction passes, barrier PIN keycodes, and logistics entry permissions.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded hover:bg-white transition">
              <input
                type="checkbox"
                checked={formEmergency}
                onChange={(e) => setFormEmergency(e.target.checked)}
                className="rounded text-red-650 border-gray-300 focus:ring-red-550 mt-0.5"
              />
              <div>
                <span className="font-bold block text-gray-800">Emergency Dispatcher</span>
                <span className="text-[10px] text-gray-400 font-medium">
                  Primary receiver of high-priority fire, hazard, or safety evacuation alerts.
                </span>
              </div>
            </label>
          </div>

          {/* Text Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Safety instructions */}
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-650">
                Safety Instructions / Inductions Mandate
              </label>
              <textarea
                value={formSafetyInstructions}
                onChange={(e) => setFormSafetyInstructions(e.target.value)}
                placeholder="e.g. Standard steel cap boots required. No lone working permitted."
                className="w-full border border-gray-200 rounded-lg p-2 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 min-h-[80px]"
              />
            </div>

            {/* Site access notes */}
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-650">
                Site access & Gate keycode notes
              </label>
              <textarea
                value={formSiteAccessNotes}
                onChange={(e) => setFormSiteAccessNotes(e.target.value)}
                placeholder="e.g. Enter via Gate B. Keypad security barrier code is #4092."
                className="w-full border border-gray-200 rounded-lg p-2 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 min-h-[80px]"
              />
            </div>

            {/* PPE list */}
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-650">
                PPE Requirements (comma-separated list)
              </label>
              <input
                type="text"
                value={formPPE}
                onChange={(e) => setFormPPE(e.target.value)}
                placeholder="e.g. Hi-Vis Vest, Steel Cap Boots, Hard Hat, Protective Glasses"
                className="w-full border border-gray-200 rounded-lg p-2 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400"
              />
            </div>

            {/* Induction toggle & date */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-650">Induction Required?</label>
                <select
                  value={formInduction ? "Yes" : "No"}
                  onChange={(e) => setFormInduction(e.target.value === "Yes")}
                  className="w-full border border-gray-200 bg-white rounded-lg p-2 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes (Mandatory)</option>
                </select>
              </div>

              {formInduction && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="block font-bold text-gray-650">Induction Expiry Date</label>
                  <input
                    type="date"
                    value={formInductionExpiry}
                    onChange={(e) => setFormInductionExpiry(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 font-mono"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subsection C: General Notes */}
        <div className="space-y-4 pt-2">
          <h3 className="text-[11px] uppercase tracking-wider text-slate-700 font-extrabold border-b border-gray-100 pb-1.5">
            3. General logistics notes
          </h3>

          <div className="space-y-1.5">
            <label className="block font-bold text-gray-650">
              Operational & Dispatch Notes
            </label>
            <textarea
              value={formGeneralNotes}
              onChange={(e) => setFormGeneralNotes(e.target.value)}
              placeholder="e.g. Prefers site dispatches via SMS before truck transit departure. High-priority client."
              className="w-full border border-gray-200 rounded-lg p-2 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 min-h-[80px]"
            />
          </div>
        </div>

        {/* Form actions block */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-150">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-700 px-5 py-2.5 hover:bg-gray-50 shadow-xs transition cursor-pointer"
          >
            Cancel
          </button>

          {!isEditing && (
            <button
              type="button"
              onClick={() => onSave(true)}
            className="rounded-lg border border-blue-150 bg-blue-50 text-xs font-bold text-blue-700 px-5 py-2.5 hover:bg-blue-100 shadow-xs transition cursor-pointer flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>Save & Add Another</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onSave(false)}
            className="rounded-lg bg-blue-600 text-xs font-bold text-white px-6 py-2.5 hover:bg-blue-750 transition cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <Save className="h-4 w-4" />
            <span>Save Contact Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}
