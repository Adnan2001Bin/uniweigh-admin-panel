import React from "react";
import { Phone, Info } from "lucide-react";
import { Carrier, Vehicle } from "../../../../types";

interface CarterInfoTabProps {
  vehicle: Vehicle;
  linkedCarter: Carrier | null;
}

export default function CarterInfoTab({ vehicle, linkedCarter }: CarterInfoTabProps) {
  return (
    <div className="bg-white border border-gray-150 rounded-xl shadow-2xs overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
          Carter Entity Information & Logistics Details
        </span>
      </div>

      <div className="p-6">
        {linkedCarter ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs max-w-2xl font-bold">
            {/* Basic Identifiers */}
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
                Carrier Profile
              </h5>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Carter ID:</span>
                  <span className="font-black font-mono text-gray-900 bg-slate-100 px-2 py-0.5 rounded">
                    {linkedCarter.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Carter Name:</span>
                  <span className="font-extrabold text-gray-900">{linkedCarter.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Operational Status:</span>
                  <span
                    className={`inline-flex items-center rounded px-2 py-0.25 text-[9px] font-black border uppercase tracking-wider ${
                      linkedCarter.status === "Active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-red-50 text-red-700 border-red-100"
                    }`}
                  >
                    {linkedCarter.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial & Contact */}
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
                Billing & Contact Data
              </h5>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Phone Number:</span>
                  <span className="font-bold text-gray-800 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    {linkedCarter.contactNo || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Default Transport Rate:</span>
                  <span className="font-black font-mono text-slate-900 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                    $ {(linkedCarter.transportRate ?? 12.5).toFixed(2)} / t
                  </span>
                </div>
                {linkedCarter.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Dispatch Email:</span>
                    <span className="font-bold font-mono text-gray-600">{linkedCarter.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Address and comments */}
            {linkedCarter.address && (
              <div className="col-span-1 md:col-span-2 space-y-1 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                  Headquarters Depot Location
                </span>
                <p className="font-bold text-gray-700 text-[11px] leading-relaxed">
                  {linkedCarter.address}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-150 rounded-lg p-5 flex items-start gap-3 text-xs text-gray-500">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-gray-700 mb-1">Unregistered Independent Carter</p>
              <p className="font-semibold text-gray-500 leading-relaxed">
                The carter labeled <strong>&quot;{vehicle.carrierName}&quot;</strong> is currently listed as an
                independent, or does not match any active primary Carter ID records. Register this
                Carter under the <span className="underline font-bold">Carters</span> tab to log
                dispatch profiles and transport rates.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
