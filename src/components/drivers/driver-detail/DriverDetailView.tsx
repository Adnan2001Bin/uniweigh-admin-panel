import React, { useState, useMemo } from "react";
import { ArrowLeft, Download, ChevronDown } from "lucide-react";
import { Carrier, Driver, Transaction } from "../../../types";
import DriverSummaryCard from "./DriverSummaryCard";
import TransactionsTab from "./tabs/TransactionsTab";
import CarterInfoTab from "./tabs/CarterInfoTab";
import {
  exportDriverSummary,
  exportDriverTransactions
} from "./utils/exportHelpers";

interface DriverDetailViewProps {
  driverId: string;
  drivers: Driver[];
  carriers: Carrier[];
  transactions: Transaction[];
  onBack: () => void;
  onViewTicketDetails: (ticketId: string) => void;
}

export default function DriverDetailView({
  driverId,
  drivers,
  carriers,
  transactions,
  onBack,
  onViewTicketDetails
}: DriverDetailViewProps) {
  const [activeTab, setActiveTab] = useState<"transactions" | "carter">("transactions");
  const [isExportOpen, setIsExportOpen] = useState(false);

  const driver = useMemo(() => {
    return drivers.find(
      (d) => d.id.toLowerCase() === driverId.toLowerCase()
    );
  }, [drivers, driverId]);

  const linkedCarter = useMemo(() => {
    if (!driver) return null;
    return carriers.find(
      (c) =>
        c.name.toLowerCase() === driver.carrierName.toLowerCase() ||
        c.id.toLowerCase() === driver.carrierId.toLowerCase()
    );
  }, [carriers, driver]);

  const linkedTransactions = useMemo(() => {
    if (!driver) return [];
    return transactions.filter(
      (t) => t.driverName.toLowerCase() === driver.name.toLowerCase()
    );
  }, [transactions, driver]);

  if (!driver) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6 text-center text-xs font-bold space-y-3">
        <p>Error: Driver with ID "{driverId}" was not found.</p>
        <button
          onClick={onBack}
          className="bg-red-800 hover:bg-red-900 text-white rounded-lg px-4 py-2 font-black transition text-[11px]"
        >
          Return to Drivers Listing
        </button>
      </div>
    );
  }

  const closeExportDropdown = () => setIsExportOpen(false);

  return (
    <div className="space-y-6">
      {/* Back Button & Main Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onBack}
            className="group rounded-lg border border-gray-250 bg-white hover:bg-slate-50 p-2 text-gray-700 transition active:scale-95 cursor-pointer select-none"
            title="Return to drivers ledger list"
          >
            <ArrowLeft className="h-4.5 w-4.5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-50 text-blue-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-blue-100">
                {driver.id}
              </span>
              <h1 className="text-xl font-black text-gray-900 tracking-tight sm:text-2xl">
                {driver.name}
              </h1>
            </div>
            <p className="text-xs text-gray-400 font-bold mt-0.5">
              Licence:{" "}
              <span className="font-mono text-gray-700">{driver.licenseNumber}</span>{" "}
              &bull; Carter:{" "}
              <span className="text-gray-700">{driver.carrierName}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
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
              <div className="absolute right-0 mt-1.5 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-20 text-xs">
                <div className="px-3 py-1 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 mb-1">
                  Export Summary Card
                </div>
                <button
                  onClick={() => exportDriverSummary("CSV", driver, closeExportDropdown)}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 font-bold text-gray-700 flex items-center gap-2"
                >
                  Export Specs to CSV
                </button>
                <button
                  onClick={() => exportDriverSummary("PDF", driver, closeExportDropdown)}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 font-bold text-gray-700 flex items-center gap-2"
                >
                  Print Specs Sheet (PDF)
                </button>

                <div className="px-3 py-1 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-t border-gray-100 my-1">
                  Export Transaction List
                </div>
                <button
                  onClick={() =>
                    exportDriverTransactions("CSV", driver, linkedTransactions, closeExportDropdown)
                  }
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 font-bold text-gray-700 flex items-center gap-2 disabled:opacity-50"
                  disabled={linkedTransactions.length === 0}
                >
                  Export Transactions (CSV)
                </button>
                <button
                  onClick={() =>
                    exportDriverTransactions("PDF", driver, linkedTransactions, closeExportDropdown)
                  }
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 font-bold text-gray-700 flex items-center gap-2 disabled:opacity-50"
                  disabled={linkedTransactions.length === 0}
                >
                  Print Transactions PDF (PDF)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <DriverSummaryCard driver={driver} />

      {/* TWO TABS SEGMENT */}
      <div className="space-y-4">
        <div className="flex border-b border-gray-150 text-xs bg-white p-1 rounded-lg border max-w-xs">
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
              activeTab === "carter"
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Carter Info
          </button>
        </div>

        {activeTab === "transactions" && (
          <TransactionsTab
            driver={driver}
            linkedTransactions={linkedTransactions}
            onViewTicketDetails={onViewTicketDetails}
          />
        )}

        {activeTab === "carter" && (
          <CarterInfoTab driver={driver} linkedCarter={linkedCarter} />
        )}
      </div>
    </div>
  );
}
