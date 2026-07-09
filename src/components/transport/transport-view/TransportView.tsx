import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { Carrier, Driver, Vehicle } from "../../../types";
import TransportTabs from "./TransportTabs";
import CarriersSection from "./CarriersSection";
import DriversSection from "./DriversSection";
import VehiclesSection from "./VehiclesSection";
import DriverDetailModal from "./DriverDetailModal";
import VehicleDetailModal from "./VehicleDetailModal";

interface TransportViewProps {
  carriers: Carrier[];
  drivers: Driver[];
  vehicles: Vehicle[];
  subView: "carters" | "drivers" | "vehicles" | "multiaxis";
  searchQuery: string;
}

export default function TransportView({
  carriers,
  drivers,
  vehicles,
  subView,
  searchQuery
}: TransportViewProps) {
  const [activeTab, setActiveTab] = useState<"carters" | "drivers" | "vehicles">(
    subView === "drivers" ? "drivers" : subView === "vehicles" || subView === "multiaxis" ? "vehicles" : "carters"
  );

  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const filteredCarriers = carriers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDrivers = drivers.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.carrierName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVehicles = vehicles.filter((v) => {
    const matchQuery =
      v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vehicleType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.carrierName.toLowerCase().includes(searchQuery.toLowerCase());

    const isMultiaxisView = subView === "multiaxis";
    if (isMultiaxisView) {
      return matchQuery && (v.vehicleType === "B-Double" || v.vehicleType === "Quad-Dog");
    }
    return matchQuery;
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight sm:text-2xl">Logistical Hauler Fleet</h1>
        <p className="text-xs text-gray-500">Transport / Registered Carriers, Drivers, and Plates</p>
      </div>

      <TransportTabs activeTab={activeTab} onChange={setActiveTab} />

      <div className="bg-white border border-gray-150 rounded-xl shadow-xs overflow-hidden">
        {activeTab === "carters" && <CarriersSection carriers={filteredCarriers} />}
        {activeTab === "drivers" && <DriversSection drivers={filteredDrivers} onViewDriver={setSelectedDriver} />}
        {activeTab === "vehicles" && <VehiclesSection vehicles={filteredVehicles} onViewVehicle={setSelectedVehicle} />}
      </div>

      <AnimatePresence>
        {selectedDriver && (
          <DriverDetailModal driver={selectedDriver} onClose={() => setSelectedDriver(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedVehicle && (
          <VehicleDetailModal vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
