import React, { useState, useMemo } from "react";
import { Carrier } from "../../../types";
import CartersHeader from "./CartersHeader";
import CartersToolbar from "./CartersToolbar";
import CartersTable from "./CartersTable";
import CarterFormModal from "./CarterFormModal";
import { exportCartersDataset } from "./utils/exportHelpers";

interface CartersViewProps {
  carriers: Carrier[];
  onAddCarter: (newCarter: Carrier) => void;
  onUpdateCarter: (updatedCarter: Carrier) => void;
  onViewCarterDetails: (carterId: string) => void;
  searchQuery: string;
}

export default function CartersView({
  carriers,
  onAddCarter,
  onUpdateCarter,
  onViewCarterDetails,
  searchQuery: topSearchQuery
}: CartersViewProps) {
  // UI states
  const [localSearch, setLocalSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotification, setRefreshNotification] = useState("");
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Filter values
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterRateRange, setFilterRateRange] = useState("All");
  const [filterCreatedDate, setFilterCreatedDate] = useState("");

  // Table selections
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Column Visibility States
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    id: true,
    name: true,
    phone: true,
    rate: true,
    status: true,
    actions: true
  });

  // Modal / Form state for Add / Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingCarterId, setEditingCarterId] = useState<string | null>(null);

  // Form Fields
  const [fieldName, setFieldName] = useState("");
  const [fieldPhone, setFieldPhone] = useState("");
  const [fieldEmail, setFieldEmail] = useState("");
  const [fieldAddress, setFieldAddress] = useState("");
  const [fieldRate, setFieldRate] = useState<number>(12.50);
  const [fieldStatus, setFieldStatus] = useState<"Active" | "Inactive">("Active");
  const [fieldNotes, setFieldNotes] = useState("");

  // Combine top search and local search
  const effectiveSearch = (topSearchQuery || localSearch).trim().toLowerCase();

  // Reset Filters helper
  const handleResetFilters = () => {
    setFilterStatus("All");
    setFilterRateRange("All");
    setFilterCreatedDate("");
    setLocalSearch("");
  };

  const isFiltersActive = useMemo(() => {
    return (
      filterStatus !== "All" ||
      filterRateRange !== "All" ||
      filterCreatedDate !== "" ||
      localSearch !== ""
    );
  }, [filterStatus, filterRateRange, filterCreatedDate, localSearch]);

  // Filter logic
  const filteredCarters = useMemo(() => {
    return carriers.filter((c) => {
      // 1. Text Search
      if (effectiveSearch) {
        const textToMatch = [
          c.id,
          c.name,
          c.contactNo,
          c.email,
          c.address || "",
          c.notes || ""
        ].join(" ").toLowerCase();
        if (!textToMatch.includes(effectiveSearch)) return false;
      }

      // 2. Status Filter
      if (filterStatus !== "All" && c.status !== filterStatus) return false;

      // 3. Transport Rate Filter
      if (filterRateRange !== "All") {
        const rate = c.transportRate ?? 12.50;
        if (filterRateRange === "Low" && rate >= 12) return false;
        if (filterRateRange === "Medium" && (rate < 12 || rate > 15)) return false;
        if (filterRateRange === "High" && rate <= 15) return false;
      }

      // 4. Created Date Filter
      if (filterCreatedDate) {
        const created = c.createdDate || "2024-03-12";
        if (!created.includes(filterCreatedDate)) return false;
      }

      return true;
    });
  }, [carriers, effectiveSearch, filterStatus, filterRateRange, filterCreatedDate]);

  // Refresh trigger simulation
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshNotification("Transport provider ledger records synchronized with system cloud DB.");
      setTimeout(() => setRefreshNotification(""), 3500);
    }, 850);
  };

  // Open Form for Adding
  const handleOpenAddForm = () => {
    setFormMode("add");
    setEditingCarterId(null);
    setFieldName("");
    setFieldPhone("");
    setFieldEmail("");
    setFieldAddress("");
    setFieldRate(12.50);
    setFieldStatus("Active");
    setFieldNotes("");
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const handleOpenEditForm = (carter: Carrier) => {
    setFormMode("edit");
    setEditingCarterId(carter.id);
    setFieldName(carter.name);
    setFieldPhone(carter.contactNo);
    setFieldEmail(carter.email);
    setFieldAddress(carter.address || "");
    setFieldRate(carter.transportRate ?? 12.50);
    setFieldStatus(carter.status);
    setFieldNotes(carter.notes || "");
    setIsFormOpen(true);
  };

  // Form Save Actions
  const handleSaveCarter = (andAddAnother = false) => {
    if (!fieldName.trim()) {
      alert("Please provide a Carter Name before saving.");
      return;
    }

    if (formMode === "add") {
      const newId = `CR-${String(carriers.length + 1).padStart(2, "0")}`;
      const newCarter: Carrier = {
        id: newId,
        name: fieldName,
        contactNo: fieldPhone || "1300 555 123",
        email: fieldEmail || `dispatch@${fieldName.toLowerCase().replace(/[^a-z0-9]/g, "") || "generic"}.com.au`,
        status: fieldStatus,
        vehicleCount: 0,
        address: fieldAddress,
        transportRate: Number(fieldRate),
        notes: fieldNotes,
        createdDate: new Date().toISOString().split("T")[0]
      };
      onAddCarter(newCarter);
    } else {
      const existing = carriers.find((c) => c.id === editingCarterId);
      if (existing) {
        const updatedCarter: Carrier = {
          ...existing,
          name: fieldName,
          contactNo: fieldPhone,
          email: fieldEmail,
          status: fieldStatus,
          address: fieldAddress,
          transportRate: Number(fieldRate),
          notes: fieldNotes
        };
        onUpdateCarter(updatedCarter);
      }
    }

    if (andAddAnother && formMode === "add") {
      // Clear for next entry
      setFieldName("");
      setFieldPhone("");
      setFieldEmail("");
      setFieldAddress("");
      setFieldRate(12.50);
      setFieldStatus("Active");
      setFieldNotes("");
    } else {
      setIsFormOpen(false);
    }
  };

  // Column toggle helper
  const toggleColumn = (colKey: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [colKey]: !prev[colKey]
    }));
  };

  // Global Exports Helper
  const handleExportDataset = (source: "all" | "selected" | "filtered", format: "CSV" | "Excel" | "PDF") => {
    setExportDropdownOpen(false);
    exportCartersDataset(carriers, selectedIds, filteredCarters, source, format);
  };

  return (
    <div className="space-y-6">
      <CartersHeader onAddCarter={handleOpenAddForm} />

      {/* Sync ledger simulated notification */}
      {refreshNotification && (
        <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs font-bold rounded-lg p-3.5 flex items-center gap-2 animate-fade-in shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          {refreshNotification}
        </div>
      )}

      <CartersToolbar
        localSearch={localSearch}
        setLocalSearch={setLocalSearch}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        isFiltersActive={isFiltersActive}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterRateRange={filterRateRange}
        setFilterRateRange={setFilterRateRange}
        filterCreatedDate={filterCreatedDate}
        setFilterCreatedDate={setFilterCreatedDate}
        onResetFilters={handleResetFilters}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
        showColumnsMenu={showColumnsMenu}
        setShowColumnsMenu={setShowColumnsMenu}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      <CartersTable
        filteredCarters={filteredCarters}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        exportDropdownOpen={exportDropdownOpen}
        setExportDropdownOpen={setExportDropdownOpen}
        onExportDataset={handleExportDataset}
        visibleColumns={visibleColumns}
        onViewCarterDetails={onViewCarterDetails}
        onEditCarter={handleOpenEditForm}
      />

      <CarterFormModal
        isOpen={isFormOpen}
        formMode={formMode}
        editingCarterId={editingCarterId}
        fieldName={fieldName}
        setFieldName={setFieldName}
        fieldPhone={fieldPhone}
        setFieldPhone={setFieldPhone}
        fieldEmail={fieldEmail}
        setFieldEmail={setFieldEmail}
        fieldAddress={fieldAddress}
        setFieldAddress={setFieldAddress}
        fieldRate={fieldRate}
        setFieldRate={setFieldRate}
        fieldStatus={fieldStatus}
        setFieldStatus={setFieldStatus}
        fieldNotes={fieldNotes}
        setFieldNotes={setFieldNotes}
        onClose={() => setIsFormOpen(false)}
        onSave={() => handleSaveCarter(false)}
        onSaveAndAddAnother={() => handleSaveCarter(true)}
      />
    </div>
  );
}
