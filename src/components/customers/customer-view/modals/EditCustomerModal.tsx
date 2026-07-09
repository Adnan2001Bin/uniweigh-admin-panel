import React from "react";
import { Edit, X } from "lucide-react";
import { Customer } from "../../../../types";

interface EditCustomerModalProps {
  isOpen: boolean;
  customerToEdit: Customer | null;
  onClose: () => void;
  onSave: () => void;
  formName: string;
  setFormName: (value: string) => void;
  formCode: string;
  setFormCode: (value: string) => void;
  formContact: string;
  setFormContact: (value: string) => void;
  formEmail: string;
  setFormEmail: (value: string) => void;
  formPhone: string;
  setFormPhone: (value: string) => void;
  formMobile: string;
  setFormMobile: (value: string) => void;
  formFax: string;
  setFormFax: (value: string) => void;
  formAddress1: string;
  setFormAddress1: (value: string) => void;
  formAddress2: string;
  setFormAddress2: (value: string) => void;
  formSuburb: string;
  setFormSuburb: (value: string) => void;
  formState: string;
  setFormState: (value: string) => void;
  formPostcode: string;
  setFormPostcode: (value: string) => void;
  formClientSince: string;
  setFormClientSince: (value: string) => void;
  formPricingTier: string;
  setFormPricingTier: (value: string) => void;
  formBalance: number;
  setFormBalance: (value: number) => void;
  formStatus: "Active" | "Suspended";
  setFormStatus: (value: "Active" | "Suspended") => void;
  formNotes: string;
  setFormNotes: (value: string) => void;
}

export default function EditCustomerModal({
  isOpen,
  customerToEdit,
  onClose,
  onSave,
  formName,
  setFormName,
  formCode,
  setFormCode,
  formContact,
  setFormContact,
  formEmail,
  setFormEmail,
  formPhone,
  setFormPhone,
  formMobile,
  setFormMobile,
  formFax,
  setFormFax,
  formAddress1,
  setFormAddress1,
  formAddress2,
  setFormAddress2,
  formSuburb,
  setFormSuburb,
  formState,
  setFormState,
  formPostcode,
  setFormPostcode,
  formClientSince,
  setFormClientSince,
  formPricingTier,
  setFormPricingTier,
  formBalance,
  setFormBalance,
  formStatus,
  setFormStatus,
  formNotes,
  setFormNotes
}: EditCustomerModalProps) {
  if (!isOpen || !customerToEdit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-xs"
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10 flex flex-col">
        <div className="sticky top-0 bg-slate-50 px-6 py-4 flex items-center justify-between shrink-0 z-10 shadow-xs">
          <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider flex items-center gap-2">
            <Edit className="h-5 w-5 text-blue-600" />
            <span>Edit Customer: {customerToEdit.name}</span>
          </h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs">
          <div className="space-y-4">
            <h4 className="font-black text-gray-400 uppercase tracking-widest text-[10px] border-b border-gray-100 pb-1.5">
              Customer Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-500">Customer Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-500">Customer Code</label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-500">Contact Person *</label>
                <input
                  type="text"
                  value={formContact}
                  onChange={(e) => setFormContact(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-500">Email Address *</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-500">Phone *</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-500">Mobile Phone</label>
                <input
                  type="text"
                  value={formMobile}
                  onChange={(e) => setFormMobile(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-500">Fax</label>
                <input
                  type="text"
                  value={formFax}
                  onChange={(e) => setFormFax(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Address details */}
          <div className="space-y-4">
            <h4 className="font-black text-gray-400 uppercase tracking-widest text-[10px] border-b border-gray-100 pb-1.5">
              Billing Address details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-500">Address Line 1</label>
                <input
                  type="text"
                  value={formAddress1}
                  onChange={(e) => setFormAddress1(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-500">Address Line 2</label>
                <input
                  type="text"
                  value={formAddress2}
                  onChange={(e) => setFormAddress2(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-500">Suburb</label>
                <input
                  type="text"
                  value={formSuburb}
                  onChange={(e) => setFormSuburb(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-500">State</label>
                <select
                  value={formState}
                  onChange={(e) => setFormState(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="VIC">Victoria (VIC)</option>
                  <option value="NSW">New South Wales (NSW)</option>
                  <option value="QLD">Queensland (QLD)</option>
                  <option value="WA">Western Australia (WA)</option>
                  <option value="SA">South Australia (SA)</option>
                  <option value="TAS">Tasmania (TAS)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-500">Postcode</label>
                <input
                  type="text"
                  value={formPostcode}
                  onChange={(e) => setFormPostcode(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Commercial rules */}
          <div className="space-y-4">
            <h4 className="font-black text-gray-400 uppercase tracking-widest text-[10px] border-b border-gray-100 pb-1.5">
              Commercial & Financial Rules
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-500">Client Since (Year)</label>
                <input
                  type="text"
                  value={formClientSince}
                  onChange={(e) => setFormClientSince(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-500">Product Rule / Pricing Tier</label>
                <select
                  value={formPricingTier}
                  onChange={(e) => setFormPricingTier(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Tier 1 - Standard Rate">Tier 1 - Standard Rate</option>
                  <option value="Tier 2 - Volume Pricing">Tier 2 - Volume Pricing</option>
                  <option value="Tier 3 - Concrete Aggregate Special">Tier 3 - Concrete Aggregate Special</option>
                  <option value="Tier 4 - Major Infrastructure Rate">Tier 4 - Major Infrastructure Rate</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-500">Account Balance ($)</label>
                <input
                  type="number"
                  value={formBalance}
                  onChange={(e) => setFormBalance(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-500">Account Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as "Active" | "Suspended")}
                  className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="block text-[10px] font-black uppercase text-gray-500">Operation Annotations & Notes</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <div className="bg-white pt-4 flex gap-2 justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 bg-slate-50 hover:bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 shadow-xs transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-black shadow-sm transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
