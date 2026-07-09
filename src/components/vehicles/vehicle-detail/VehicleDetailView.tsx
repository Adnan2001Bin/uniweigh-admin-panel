import React, { useState, useMemo } from "react";
import { ArrowLeft, Download, ChevronDown, Layers } from "lucide-react";
import { Carrier, Vehicle, Transaction } from "../../../types";
import VehicleSummaryCard from "./VehicleSummaryCard";
import TransactionsTab from "./tabs/TransactionsTab";
import AxleSetsTab from "./tabs/AxleSetsTab";
import CarterInfoTab from "./tabs/CarterInfoTab";
import {
  handleExportIndividualSummary,
  handleExportAxleSets,
  handleExportTransactions
} from "./utils/exportHelpers";

export interface VehicleDetailViewProps {
  plateNumber: string;
  vehicles: Vehicle[];
  carriers: Carrier[];
  transactions: Transaction[];
  onBack: () => void;
  onViewTicketDetails: (ticketId: string) => void;
}

export default function VehicleDetailView({
  plateNumber,
  vehicles,
  carriers,
  transactions,
  onBack,
  onViewTicketDetails
}: VehicleDetailViewProps) {
  // Find the selected vehicle
  const vehicle = useMemo(() => {
    return vehicles.find((v) => v.plateNumber.toLowerCase() === plateNumber.toLowerCase());
  }, [vehicles, plateNumber]);

  const defaultTab = vehicle && vehicle.category === "Multiaxel" ? "axlesets" : "transactions";
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Find linked carter (Carrier)
  const linkedCarter = useMemo(() => {
    if (!vehicle) return null;
    return carriers.find((c) => c.name.toLowerCase() === vehicle.carrierName.toLowerCase());
  }, [carriers, vehicle]);

  // Find linked transactions
  const linkedTransactions = useMemo(() => {
    if (!vehicle) return [];
    return transactions.filter(
      (t) => t.vehicleReg.toLowerCase() === vehicle.plateNumber.toLowerCase()
    );
  }, [transactions, vehicle]);

  if (!vehicle) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6 text-center text-xs font-bold space-y-3">
        <p>Error: Vehicle with Registration Number &quot;{plateNumber}&quot; was not found.</p>
        <button
          onClick={onBack}
          className="bg-red-800 hover:bg-red-900 text-white rounded-lg px-4 py-2 font-black transition text-[11px]"
        >
          Return to Vehicles Listing
        </button>
      </div>
    );
  }

  const isMultiaxel = vehicle.category === "Multiaxel";

  return (
    <div className="space-y-6">
      {/* Back Button & Main Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onBack}
            className="group rounded-lg border border-gray-250 bg-white hover:bg-slate-50 p-2 text-gray-700 transition active:scale-95 cursor-pointer select-none"
            title="Return to vehicles ledger list"
          >
            <ArrowLeft className="h-4.5 w-4.5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-50 text-blue-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-blue-100">
                {vehicle.id || "VEH-N/A"}
              </span>
              <h1 className="text-xl font-black text-gray-900 tracking-tight sm:text-2xl">
                {vehicle.name || "N/A"}
              </h1>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isMultiaxel
                    ? "bg-purple-50 text-purple-700 border border-purple-150"
                    : "bg-blue-50 text-blue-700 border border-blue-150"
                }`}
              >
                {vehicle.category || "Standard"}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-bold mt-0.5">
              Registration: <span className="font-mono text-gray-700">{vehicle.plateNumber}</span>{" "}
              &bull; Carter: <span className="text-gray-700">{vehicle.carrierName}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Individual Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="rounded-lg border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2 text-xs font-black text-gray-700 transition flex items-center gap-1.5 select-none cursor-pointer"
            >
              <Download className="h-4 w-4 text-gray-500" />
              Export Options
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>

            {isExportOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-20 text-xs font-bold">
                <div className="px-3 py-1 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 mb-1">
                  Export Summary Card
                </div>
                <button
                  onClick={() => handleExportIndividualSummary("CSV", vehicle, setIsExportOpen)}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 text-gray-700 flex items-center gap-2"
                >
                  Export Specs to CSV
                </button>
                <button
                  onClick={() => handleExportIndividualSummary("PDF", vehicle, setIsExportOpen)}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 text-gray-700 flex items-center gap-2"
                >
                  Print Specs Sheet (PDF)
                </button>

                {isMultiaxel && (
                  <>
                    <div className="px-3 py-1 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-t border-gray-100 my-1">
                      Export Axle Sets Config
                    </div>
                    <button
                      onClick={() => handleExportAxleSets("CSV", vehicle, setIsExportOpen)}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 text-gray-700 flex items-center gap-2"
                    >
                      Export Axles to CSV
                    </button>
                    <button
                      onClick={() => handleExportAxleSets("PDF", vehicle, setIsExportOpen)}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 text-gray-700 flex items-center gap-2"
                    >
                      Print Axles Config (PDF)
                    </button>
                  </>
                )}

                <div className="px-3 py-1 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-t border-gray-100 my-1">
                  Export Transaction List
                </div>
                <button
                  onClick={() =>
                    handleExportTransactions("CSV", vehicle, linkedTransactions, setIsExportOpen)
                  }
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 text-gray-700 flex items-center gap-2 disabled:opacity-50"
                  disabled={linkedTransactions.length === 0}
                >
                  Export Transactions (CSV)
                </button>
                <button
                  onClick={() =>
                    handleExportTransactions("PDF", vehicle, linkedTransactions, setIsExportOpen)
                  }
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 text-gray-700 flex items-center gap-2 disabled:opacity-50"
                  disabled={linkedTransactions.length === 0}
                >
                  Print Transactions PDF (PDF)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <VehicleSummaryCard vehicle={vehicle} />

      {/* TABS SEGMENT */}
      <div className="space-y-4">
        {/* Tabs Switcher */}
        <div className="flex border-b border-gray-150 text-xs bg-white p-1 rounded-lg border max-w-sm">
          {isMultiaxel && (
            <button
              onClick={() => setActiveTab("axlesets")}
              className={`flex-1 py-1.5 text-center font-black rounded-md transition flex items-center justify-center gap-1 ${
                activeTab === "axlesets"
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Axle Sets ({vehicle.axleSets?.length || 0})
            </button>
          )}
          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex-1 py-1.5 text-center font-black rounded-md transition ${
              activeTab === "transactions"
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Transactions ({linkedTransactions.length})
          </button>
          <button
            onClick={() => setActiveTab("carter")}
            className={`flex-1 py-1.5 text-center font-black rounded-md transition ${
              activeTab === "carter" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Carter Info
          </button>
        </div>

        {isMultiaxel && activeTab === "axlesets" && <AxleSetsTab vehicle={vehicle} />}

        {activeTab === "transactions" && (
          <TransactionsTab
            vehicle={vehicle}
            linkedTransactions={linkedTransactions}
            onViewTicketDetails={onViewTicketDetails}
          />
        )}

        {activeTab === "carter" && <CarterInfoTab vehicle={vehicle} linkedCarter={linkedCarter} />}
      </div>
    </div>
  );
}
