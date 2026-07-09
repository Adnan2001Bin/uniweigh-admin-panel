import React, { useState, useMemo } from "react";
import { ArrowLeft, User, Truck, FileText } from "lucide-react";
import { Carrier, Driver, Vehicle, Transaction } from "../../../types";
import CarterSummaryCard from "./CarterSummaryCard";
import ExportDropdown from "./ExportDropdown";
import DriversTab from "./tabs/DriversTab";
import VehiclesTab from "./tabs/VehiclesTab";
import TransactionsTab from "./tabs/TransactionsTab";
import DriverDetailModal from "./modals/DriverDetailModal";
import VehicleDetailModal from "./modals/VehicleDetailModal";
import {
  exportCarterSummary,
  exportDrivers,
  exportVehicles,
  exportTransactions
} from "./utils/exportHelpers";

interface CarterDetailViewProps {
  carterId: string;
  carriers: Carrier[];
  drivers: Driver[];
  vehicles: Vehicle[];
  transactions: Transaction[];
  onBack: () => void;
  onViewTicketDetails: (ticketId: string) => void;
}

export default function CarterDetailView({
  carterId,
  carriers,
  drivers,
  vehicles,
  transactions,
  onBack,
  onViewTicketDetails
}: CarterDetailViewProps) {
  const [activeTab, setActiveTab] = useState<"drivers" | "vehicles" | "transactions">("drivers");
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Detail Modal States for items inside tabs
  const [selectedDriverDetails, setSelectedDriverDetails] = useState<Driver | null>(null);
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState<Vehicle | null>(null);

  // Find the selected carter
  const selectedCarter = useMemo(() => {
    return carriers.find((c) => c.id === carterId);
  }, [carriers, carterId]);

  // Find linked drivers
  const linkedDrivers = useMemo(() => {
    if (!selectedCarter) return [];
    return drivers.filter(
      (d) => d.carrierId === selectedCarter.id || d.carrierName.toLowerCase() === selectedCarter.name.toLowerCase()
    );
  }, [drivers, selectedCarter]);

  // Find linked vehicles (including standard and multiaxis)
  const linkedVehicles = useMemo(() => {
    if (!selectedCarter) return [];
    return vehicles.filter(
      (v) => v.carrierName.toLowerCase() === selectedCarter.name.toLowerCase()
    );
  }, [vehicles, selectedCarter]);

  // Find linked transactions
  const linkedTransactions = useMemo(() => {
    if (!selectedCarter) return [];
    return transactions.filter(
      (t) => t.carrierName.toLowerCase() === selectedCarter.name.toLowerCase()
    );
  }, [transactions, selectedCarter]);

  if (!selectedCarter) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6 text-center text-xs font-bold space-y-3">
        <p>Error: Carter with ID "{carterId}" was not found or has been removed.</p>
        <button
          onClick={onBack}
          className="bg-red-800 hover:bg-red-900 text-white rounded-lg px-4 py-2 font-black transition text-[11px]"
        >
          Return to Carter Listing
        </button>
      </div>
    );
  }

  const transportRate = selectedCarter.transportRate ?? 12.50;

  const handleExportCarterSummary = (format: "CSV" | "Excel" | "PDF") => {
    setIsExportOpen(false);
    exportCarterSummary(selectedCarter, transportRate, linkedDrivers, linkedVehicles, linkedTransactions, format);
  };

  const handleExportDrivers = (format: "CSV" | "PDF") => {
    setIsExportOpen(false);
    exportDrivers(selectedCarter, linkedDrivers, format);
  };

  const handleExportVehicles = (format: "CSV" | "PDF") => {
    setIsExportOpen(false);
    exportVehicles(selectedCarter, linkedVehicles, format);
  };

  const handleExportTransactions = (format: "CSV" | "PDF") => {
    setIsExportOpen(false);
    exportTransactions(selectedCarter, linkedTransactions, transportRate, format);
  };

  return (
    <div className="space-y-6">
      {/* Back Button & Dropdown Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 text-xs font-extrabold text-blue-600 hover:text-blue-800 transition select-none"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition" />
          Back to Carters List
        </button>

        <ExportDropdown
          isOpen={isExportOpen}
          onToggle={() => setIsExportOpen(!isExportOpen)}
          onExportCarterSummary={handleExportCarterSummary}
          onExportDrivers={handleExportDrivers}
          onExportVehicles={handleExportVehicles}
          onExportTransactions={handleExportTransactions}
        />
      </div>

      <CarterSummaryCard selectedCarter={selectedCarter} transportRate={transportRate} />

      {/* Tabs Menu - Exactly Three Tabs as requested */}
      <div className="space-y-4">
        <div className="border-b border-gray-200">
          <nav className="flex gap-6 -mb-px" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("drivers")}
              className={`py-2 px-1 border-b-2 font-black text-xs select-none transition flex items-center gap-1.5 ${
                activeTab === "drivers"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              Drivers ({linkedDrivers.length})
            </button>
            <button
              onClick={() => setActiveTab("vehicles")}
              className={`py-2 px-1 border-b-2 font-black text-xs select-none transition flex items-center gap-1.5 ${
                activeTab === "vehicles"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Truck className="h-3.5 w-3.5" />
              Vehicles ({linkedVehicles.length})
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`py-2 px-1 border-b-2 font-black text-xs select-none transition flex items-center gap-1.5 ${
                activeTab === "transactions"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Transactions ({linkedTransactions.length})
            </button>
          </nav>
        </div>

        {/* Tab Contents */}
        {activeTab === "drivers" && (
          <DriversTab linkedDrivers={linkedDrivers} onViewDriver={setSelectedDriverDetails} />
        )}
        {activeTab === "vehicles" && (
          <VehiclesTab linkedVehicles={linkedVehicles} onViewVehicle={setSelectedVehicleDetails} />
        )}
        {activeTab === "transactions" && (
          <TransactionsTab
            linkedTransactions={linkedTransactions}
            transportRate={transportRate}
            onViewTicketDetails={onViewTicketDetails}
          />
        )}
      </div>

      {/* Driver Detail Dialog Modal */}
      {selectedDriverDetails && (
        <DriverDetailModal driver={selectedDriverDetails} onClose={() => setSelectedDriverDetails(null)} />
      )}

      {/* Vehicle Detail Dialog Modal */}
      {selectedVehicleDetails && (
        <VehicleDetailModal vehicle={selectedVehicleDetails} onClose={() => setSelectedVehicleDetails(null)} />
      )}
    </div>
  );
}
