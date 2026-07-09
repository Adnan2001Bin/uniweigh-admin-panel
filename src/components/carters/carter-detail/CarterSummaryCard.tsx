import React from "react";
import {
  Truck,
  Clock,
  Calendar,
  Phone,
  Mail,
  DollarSign,
  MapPin
} from "lucide-react";
import { Carrier } from "../../../types";

interface CarterSummaryCardProps {
  selectedCarter: Carrier;
  transportRate: number;
}

export default function CarterSummaryCard({ selectedCarter, transportRate }: CarterSummaryCardProps) {
  return (
    <div className="bg-white border border-gray-150 rounded-xl p-6 shadow-2xs">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-5 mb-5">
        <div className="space-y-1">
          <span className="bg-blue-50 text-blue-700 font-mono font-bold text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-sm border border-blue-100">
            Carter Profile
          </span>
          <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            {selectedCarter.name}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-semibold text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-gray-300" />
              Carter ID: <strong className="text-gray-600 font-mono font-bold">{selectedCarter.id}</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-gray-300" />
              Registered: <strong className="text-gray-600">{selectedCarter.createdDate || "2024-03-12"}</strong>
            </span>
          </div>
        </div>

        <div className="self-start md:self-auto">
          <span
            className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-black border uppercase tracking-wider ${
              selectedCarter.status === "Active"
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-red-50 text-red-700 border-red-100"
            }`}
          >
            {selectedCarter.status}
          </span>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 text-xs">
        <div className="bg-slate-50/50 border border-gray-100 rounded-lg p-3.5 space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Phone Number</span>
          <div className="flex items-center gap-1.5 text-gray-800 font-extrabold">
            <Phone className="h-3.5 w-3.5 text-gray-400" />
            {selectedCarter.contactNo}
          </div>
        </div>

        <div className="bg-slate-50/50 border border-gray-100 rounded-lg p-3.5 space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Email Address</span>
          <div className="flex items-center gap-1.5 text-gray-800 font-extrabold font-mono">
            <Mail className="h-3.5 w-3.5 text-gray-400" />
            {selectedCarter.email}
          </div>
        </div>

        <div className="bg-emerald-50/20 border border-emerald-100/50 rounded-lg p-3.5 space-y-1">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Transport Rate</span>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-black text-emerald-800 font-mono">
              ${transportRate.toFixed(2)}
            </span>
            <span className="text-[10px] text-emerald-600/70 font-bold">/ tonne</span>
          </div>
        </div>

        <div className="bg-blue-50/20 border border-blue-100/50 rounded-lg p-3.5 space-y-1">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">Physical Address</span>
          <div className="flex items-center gap-1.5 text-gray-800 font-bold line-clamp-1">
            <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="truncate" title={selectedCarter.address}>{selectedCarter.address || "No address supplied."}</span>
          </div>
        </div>
      </div>

      {/* Notes Block */}
      <div className="bg-slate-50 border border-gray-150 rounded-lg p-4 text-xs">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Internal Notes</span>
        <p className="font-medium text-gray-700 whitespace-pre-line leading-relaxed">
          {selectedCarter.notes || "No custom notes or instructions listed for this transport provider."}
        </p>
      </div>
    </div>
  );
}
