import React from "react";
import {
  ArrowLeft,
  Edit,
  FileText,
  Trash2,
  User,
  ShieldAlert,
  FileText as FileTextIcon
} from "lucide-react";
import { DestinationContact } from "../../../types";

interface ContactDetailProps {
  selectedContact: DestinationContact;
  getInitials: (fullName: string) => string;
  onBack: () => void;
  onEdit: (contact: DestinationContact) => void;
  onExportProfile: () => void;
  onDelete: (contactId: string) => void;
}

export default function ContactDetail({
  selectedContact,
  getInitials,
  onBack,
  onEdit,
  onExportProfile,
  onDelete
}: ContactDetailProps) {
  return (
    <div className="space-y-6 animate-fade-in" id="contact-detail-page">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-5">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-220 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Directory</span>
          </button>

          <div className="h-12 w-12 rounded-full border border-blue-100 overflow-hidden shadow-md shrink-0">
            {selectedContact.photoUrl ? (
              <img
                src={selectedContact.photoUrl}
                alt={selectedContact.name}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-base">
                {getInitials(selectedContact.name)}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight sm:text-2xl">
                {selectedContact.name}
              </h1>
              <span
                className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                  selectedContact.status === "Active"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    : "bg-red-50 text-red-700 border border-red-100"
                }`}
              >
                {selectedContact.status}
              </span>
            </div>
            <div className="text-xs text-gray-500 font-mono mt-0.5">
              ID: <span className="font-bold">{selectedContact.id}</span> | Code:{" "}
              <span className="font-semibold text-gray-700">{selectedContact.contactCode}</span>{" "}
              | Customer:{" "}
              <span className="font-bold text-blue-600">{selectedContact.customerName}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onEdit(selectedContact)}
            className="rounded-lg border border-gray-220 bg-white text-xs font-bold text-gray-700 px-4 py-2 hover:bg-gray-50 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Edit className="h-4 w-4 text-emerald-600" />
            <span>Edit Profile Settings</span>
          </button>

          <button
            onClick={onExportProfile}
            className="rounded-lg border border-gray-220 bg-white text-xs font-bold text-gray-700 px-4 py-2 hover:bg-gray-50 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FileText className="h-4 w-4 text-indigo-600" />
            <span>Export Profile Report</span>
          </button>

          <button
            onClick={() => onDelete(selectedContact.id)}
            className="rounded-lg border border-red-200 bg-red-50 text-xs font-bold text-red-700 px-4 py-2 hover:bg-red-100 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Contact</span>
          </button>
        </div>
      </div>

      {/* CONTACT SUMMARY CARD */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Contact Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <User className="h-4 w-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Contact Details
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-3 text-xs">
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Contact ID
                </span>
                <span className="font-mono font-bold text-gray-800">{selectedContact.id}</span>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Contact Code
                </span>
                <span className="font-mono font-bold text-gray-800">
                  {selectedContact.contactCode}
                </span>
              </div>
              <div className="col-span-2">
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Contact Name
                </span>
                <span className="font-bold text-gray-950 text-sm block mt-0.5">
                  {selectedContact.name}
                </span>
              </div>
              <div className="col-span-2">
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Associated Company / Customer
                </span>
                <span className="font-semibold text-gray-800 block mt-0.5">
                  {selectedContact.customerName}
                </span>
              </div>
              <div className="col-span-2">
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Role / Position
                </span>
                <span className="font-semibold text-gray-800 block mt-0.5">
                  {selectedContact.role || "N/A"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Phone
                </span>
                <span className="font-semibold text-gray-800 font-mono block mt-0.5">
                  {selectedContact.phone || "N/A"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Mobile
                </span>
                <span className="font-semibold text-gray-800 font-mono block mt-0.5">
                  {selectedContact.mobile || "N/A"}
                </span>
              </div>
              <div className="col-span-2">
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Email
                </span>
                <span className="font-semibold text-blue-600 font-mono block mt-0.5 break-all select-all">
                  {selectedContact.email || "N/A"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Status
                </span>
                <span
                  className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedContact.status === "Active"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedContact.status}
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Safety & Site Access Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Safety & Site Access
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-3 text-xs">
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Safety Contact
                </span>
                <span
                  className={`font-bold block mt-0.5 ${
                    selectedContact.isSafetyContact ? "text-emerald-700" : "text-gray-500"
                  }`}
                >
                  {selectedContact.isSafetyContact ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Site Access Contact
                </span>
                <span
                  className={`font-bold block mt-0.5 ${
                    selectedContact.isSiteAccessContact ? "text-blue-700" : "text-gray-500"
                  }`}
                >
                  {selectedContact.isSiteAccessContact ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Emergency Contact
                </span>
                <span
                  className={`font-bold block mt-0.5 ${
                    selectedContact.isEmergencyContact
                      ? "text-rose-700 animate-pulse"
                      : "text-gray-500"
                  }`}
                >
                  {selectedContact.isEmergencyContact ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Induction Required
                </span>
                <span className="font-semibold block mt-0.5">
                  {selectedContact.inductionRequired ? "Yes" : "No"}
                </span>
              </div>
              {selectedContact.inductionRequired && (
                <div className="col-span-2">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Induction Expiry Date
                  </span>
                  <span className="font-semibold text-gray-800 font-mono block mt-0.5">
                    {selectedContact.inductionExpiryDate || "N/A"}
                  </span>
                </div>
              )}
              <div className="col-span-2">
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
                  PPE Requirements
                </span>
                <span className="font-semibold text-gray-800 block mt-0.5">
                  {selectedContact.ppeRequirements || "N/A"}
                </span>
              </div>
              <div className="col-span-2">
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Safety Instructions
                </span>
                <p
                  className="text-[11px] text-gray-600 leading-relaxed italic mt-0.5 line-clamp-2"
                  title={selectedContact.safetyInstructions}
                >
                  {selectedContact.safetyInstructions ||
                    "No explicit safety instructions specified."}
                </p>
              </div>
              <div className="col-span-2">
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Site Access Notes
                </span>
                <p
                  className="text-[11px] text-gray-600 leading-relaxed italic mt-0.5 line-clamp-2"
                  title={selectedContact.siteAccessNotes}
                >
                  {selectedContact.siteAccessNotes || "No site access notes logged."}
                </p>
              </div>
            </div>
          </div>

          {/* Column 3: Notes Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <FileTextIcon className="h-4 w-4 text-amber-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Notes</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
                  General Notes
                </span>
                <p className="text-[11px] text-gray-600 italic leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-gray-100 mt-1 max-h-56 overflow-y-auto">
                  {selectedContact.notes || "No general operational notes recorded."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
