import React, { useState, useMemo } from "react";
import { Driver, Carrier } from "../../../types";
import DriversHeader from "./DriversHeader";
import DriversToolbar from "./DriversToolbar";
import DriversTable from "./DriversTable";
import DriverFormModal from "./DriverFormModal";
import { exportDrivers } from "./utils/exportHelpers";

interface DriversViewProps {
  drivers: Driver[];
  carriers: Carrier[];
  onAddDriver: (newDriver: Driver) => void;
  onUpdateDriver: (updatedDriver: Driver) => void;
  onViewDriverDetails: (driverId: string) => void;
  searchQuery: string;
}

export default function DriversView({
  drivers,
  carriers,
  onAddDriver,
  onUpdateDriver,
  onViewDriverDetails,
  searchQuery: topSearchQuery
}: DriversViewProps) {
  // UI states
  const [localSearch, setLocalSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotification, setRefreshNotification] = useState("");
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Filter fields
  const [filterCarter, setFilterCarter] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterLicence, setFilterLicence] = useState("");

  // Selected row IDs (driver.id)
  const [selectedDriverIds, setSelectedDriverIds] = useState<string[]>([]);

  // Column Visibility state
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    id: true,
    name: true,
    licence: true,
    phone: true,
    carter: true,
    status: true,
    actions: true
  });

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);

  // Form Fields
  const [fieldName, setFieldName] = useState("");
  const [fieldLicence, setFieldLicence] = useState("");
  const [fieldPhone, setFieldPhone] = useState("");
  const [fieldCarterName, setFieldCarterName] = useState("");
  const [fieldStatus, setFieldStatus] = useState<"Active" | "Inactive">("Active");
  const [fieldNotes, setFieldNotes] = useState("");

  // Combine searches
  const effectiveSearch = (topSearchQuery || localSearch).trim().toLowerCase();

  // Reset filters
  const handleResetFilters = () => {
    setFilterCarter("All");
    setFilterStatus("All");
    setFilterLicence("");
    setLocalSearch("");
  };

  const isFiltersActive = useMemo(() => {
    return (
      filterCarter !== "All" ||
      filterStatus !== "All" ||
      filterLicence !== "" ||
      localSearch !== ""
    );
  }, [filterCarter, filterStatus, filterLicence, localSearch]);

  const carterNames = useMemo(() => {
    return Array.from(new Set(carriers.map((c) => c.name)));
  }, [carriers]);

  // Filtered drivers
  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      // 1. Text Search
      if (effectiveSearch) {
        const textToMatch = [
          d.id,
          d.name,
          d.licenseNumber,
          d.carrierName,
          d.phoneNumber || "",
          d.notes || ""
        ].join(" ").toLowerCase();
        if (!textToMatch.includes(effectiveSearch)) return false;
      }

      // 2. Carter Filter
      if (filterCarter !== "All" && d.carrierName !== filterCarter) return false;

      // 3. Status Filter
      if (filterStatus !== "All" && d.status !== filterStatus) return false;

      // 4. Licence Filter
      if (filterLicence.trim()) {
        if (!d.licenseNumber.toLowerCase().includes(filterLicence.trim().toLowerCase())) return false;
      }

      return true;
    });
  }, [drivers, effectiveSearch, filterCarter, filterStatus, filterLicence]);

  // Simulate sync / refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshNotification("Driver licensing & compliance databases successfully synchronized.");
      setTimeout(() => setRefreshNotification(""), 3500);
    }, 800);
  };

  // Open Form for Adding
  const handleOpenAddForm = () => {
    setFormMode("add");
    setEditingDriverId(null);
    setFieldName("");
    setFieldLicence("");
    setFieldPhone("");
    setFieldCarterName(carterNames[0] || "Star Bulk Haulage");
    setFieldStatus("Active");
    setFieldNotes("");
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const handleOpenEditForm = (d: Driver) => {
    setFormMode("edit");
    setEditingDriverId(d.id);
    setFieldName(d.name);
    setFieldLicence(d.licenseNumber);
    setFieldPhone(d.phoneNumber || "");
    setFieldCarterName(d.carrierName);
    setFieldStatus(d.status);
    setFieldNotes(d.notes || "");
    setIsFormOpen(true);
  };

  // Save driver
  const handleSaveDriver = (andAddAnother = false) => {
    if (!fieldName.trim()) {
      alert("Driver Name is required.");
      return;
    }
    if (!fieldLicence.trim()) {
      alert("Licence Number is required.");
      return;
    }

    // Find linked carter ID
    const selectedCarter = carriers.find((c) => c.name === fieldCarterName);
    const carrierId = selectedCarter ? selectedCarter.id : "CR-01";

    if (formMode === "add") {
      const generatedId = `D-${String(drivers.length + 1).padStart(3, "0")}`;
      const newDriver: Driver = {
        id: generatedId,
        name: fieldName.trim(),
        licenseNumber: fieldLicence.trim().toUpperCase(),
        carrierId,
        carrierName: fieldCarterName,
        status: fieldStatus,
        phoneNumber: fieldPhone.trim() || "0400 000 000",
        notes: fieldNotes.trim(),
        lastWeighedDate: new Date().toISOString().split("T")[0]
      };
      onAddDriver(newDriver);
    } else {
      const existing = drivers.find((d) => d.id === editingDriverId);
      if (existing) {
        const updatedDriver: Driver = {
          ...existing,
          name: fieldName.trim(),
          licenseNumber: fieldLicence.trim().toUpperCase(),
          carrierId,
          carrierName: fieldCarterName,
          status: fieldStatus,
          phoneNumber: fieldPhone.trim(),
          notes: fieldNotes.trim()
        };
        onUpdateDriver(updatedDriver);
      }
    }

    if (andAddAnother && formMode === "add") {
      setFieldName("");
      setFieldLicence("");
      setFieldPhone("");
      setFieldNotes("");
    } else {
      setIsFormOpen(false);
    }
  };

  const toggleColumn = (colKey: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [colKey]: !prev[colKey]
    }));
  };

  // Export handlers
  const handleExport = (source: "all" | "selected" | "filtered", format: "CSV" | "Excel" | "PDF") => {
    setExportDropdownOpen(false);
    exportDrivers(format, source, {
      drivers,
      filteredDrivers,
      selectedDriverIds
    });
  };

  return (
    <div className="space-y-6">
      <DriversHeader onAddDriver={handleOpenAddForm} />

      {/* Sync feedback notification */}
      {refreshNotification && (
        <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs font-bold rounded-lg p-3.5 flex items-center gap-2 animate-fade-in shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          {refreshNotification}
        </div>
      )}

      <DriversToolbar
        localSearch={localSearch}
        setLocalSearch={setLocalSearch}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        isFiltersActive={isFiltersActive}
        filterCarter={filterCarter}
        setFilterCarter={setFilterCarter}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterLicence={filterLicence}
        setFilterLicence={setFilterLicence}
        carterNames={carterNames}
        showColumnsMenu={showColumnsMenu}
        setShowColumnsMenu={setShowColumnsMenu}
        visibleColumns={visibleColumns}
        toggleColumn={toggleColumn}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onResetFilters={handleResetFilters}
      />

      <DriversTable
        filteredDrivers={filteredDrivers}
        visibleColumns={visibleColumns}
        selectedDriverIds={selectedDriverIds}
        setSelectedDriverIds={setSelectedDriverIds}
        exportDropdownOpen={exportDropdownOpen}
        setExportDropdownOpen={setExportDropdownOpen}
        onExport={handleExport}
        onViewDriverDetails={onViewDriverDetails}
        onEditDriver={handleOpenEditForm}
      />

      <DriverFormModal
        isOpen={isFormOpen}
        mode={formMode}
        editingDriverId={editingDriverId}
        carriers={carriers}
        carterNames={carterNames}
        fieldName={fieldName}
        setFieldName={setFieldName}
        fieldLicence={fieldLicence}
        setFieldLicence={setFieldLicence}
        fieldPhone={fieldPhone}
        setFieldPhone={setFieldPhone}
        fieldCarterName={fieldCarterName}
        setFieldCarterName={setFieldCarterName}
        fieldStatus={fieldStatus}
        setFieldStatus={setFieldStatus}
        fieldNotes={fieldNotes}
        setFieldNotes={setFieldNotes}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveDriver}
      />
    </div>
  );
}
