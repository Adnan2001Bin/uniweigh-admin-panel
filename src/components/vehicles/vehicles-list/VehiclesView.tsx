import React, { useState, useMemo } from "react";
import { Truck, Plus } from "lucide-react";
import { Vehicle, AxleSet, Carrier } from "../../../types";
import VehiclesToolbar from "./VehiclesToolbar";
import VehiclesTable from "./VehiclesTable";
import VehicleFormModal from "./VehicleFormModal";
import { handleVehicleExport } from "./utils/exportHelpers";

export interface VehiclesViewProps {
  vehicles: Vehicle[];
  carriers: Carrier[];
  onAddVehicle: (newVehicle: Vehicle) => void;
  onUpdateVehicle: (updatedVehicle: Vehicle) => void;
  onViewVehicleDetails: (plateNumber: string) => void;
  searchQuery: string;
}

export default function VehiclesView({
  vehicles,
  carriers,
  onAddVehicle,
  onUpdateVehicle,
  onViewVehicleDetails,
  searchQuery: topSearchQuery,
}: VehiclesViewProps) {
  // UI and display states
  const [localSearch, setLocalSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotification, setRefreshNotification] = useState("");
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Filter fields
  const [filterCarter, setFilterCarter] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterRegNum, setFilterRegNum] = useState("");

  // Selected row IDs (plateNumber)
  const [selectedPlates, setSelectedPlates] = useState<string[]>([]);

  // Column Visibility state
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    {
      id: true,
      name: true,
      regNum: true,
      category: true,
      type: true,
      carter: true,
      tare: true,
      maxWeight: true,
      status: true,
      actions: true,
    },
  );

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingPlateNumber, setEditingPlateNumber] = useState<string | null>(
    null,
  );

  // Form Fields
  const [fieldCategory, setFieldCategory] = useState<"Standard" | "Multiaxel">(
    "Standard",
  );
  const [fieldName, setFieldName] = useState("");
  const [fieldPlateNumber, setFieldPlateNumber] = useState("");
  const [fieldCarterName, setFieldCarterName] = useState("");
  const [fieldVehicleType, setFieldVehicleType] = useState("Truck");
  const [fieldMakeModel, setFieldMakeModel] = useState("");
  const [fieldStatus, setFieldStatus] = useState<"Active" | "Inactive">(
    "Active",
  );
  const [fieldNotes, setFieldNotes] = useState("");

  // Standard Weight Fields
  const [fieldTareWeight, setFieldTareWeight] = useState<number>(10.0);
  const [fieldWeightMax, setFieldWeightMax] = useState<number>(25.0);
  const [fieldVariance, setFieldVariance] = useState<number>(0.5);

  // Multiaxel Specific Fields
  const [fieldWeighedAs, setFieldWeighedAs] =
    useState<string>("Weighed as Whole");
  const [fieldEnableCombinedTare, setFieldEnableCombinedTare] =
    useState<boolean>(true);
  const [fieldCombinedTareWeight, setFieldCombinedTareWeight] =
    useState<number>(15.0);
  const [fieldGrossMaximum, setFieldGrossMaximum] = useState<number>(42.0);
  const [fieldAxleSets, setFieldAxleSets] = useState<AxleSet[]>([
    { axleSetNumber: 1, tareWeight: 5.0, weightMax: 14.0, variance: 0.2 },
  ]);

  // Computed Combined Tare Weight for multiaxel vehicles
  const computedCombinedTare = useMemo(() => {
    if (fieldEnableCombinedTare) {
      return Number(
        fieldAxleSets
          .reduce((sum, s) => sum + (s.tareWeight || 0), 0)
          .toFixed(2),
      );
    }
    return fieldCombinedTareWeight;
  }, [fieldEnableCombinedTare, fieldAxleSets, fieldCombinedTareWeight]);

  // Combine top search & local search
  const effectiveSearch = (topSearchQuery || localSearch).trim().toLowerCase();

  // Reset all filters
  const handleResetFilters = () => {
    setFilterCarter("All");
    setFilterType("All");
    setFilterCategory("All");
    setFilterStatus("All");
    setFilterRegNum("");
    setLocalSearch("");
  };

  const isFiltersActive = useMemo(() => {
    return (
      filterCarter !== "All" ||
      filterType !== "All" ||
      filterCategory !== "All" ||
      filterStatus !== "All" ||
      filterRegNum !== "" ||
      localSearch !== ""
    );
  }, [
    filterCarter,
    filterType,
    filterCategory,
    filterStatus,
    filterRegNum,
    localSearch,
  ]);

  // Support vehicle types
  const vehicleTypesList = [
    "Truck",
    "Prime Mover",
    "Trailer",
    "A Trailer",
    "B Trailer",
  ];

  // Unique list of Carters for filtering dropdown
  const carterNames = useMemo(() => {
    return Array.from(new Set(carriers.map((c) => c.name)));
  }, [carriers]);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      // 1. Text Search
      if (effectiveSearch) {
        const textToMatch = [
          v.id || "",
          v.name || "",
          v.plateNumber,
          v.carrierName,
          v.vehicleType,
          v.category || "Standard",
          v.makeModel || "",
          v.notes || "",
        ]
          .join(" ")
          .toLowerCase();
        if (!textToMatch.includes(effectiveSearch)) return false;
      }

      // 2. Carter Filter
      if (filterCarter !== "All" && v.carrierName !== filterCarter)
        return false;

      // 3. Vehicle Type Filter
      if (filterType !== "All" && v.vehicleType !== filterType) return false;

      // 4. Vehicle Category Filter
      const cat = v.category || "Standard";
      if (filterCategory !== "All" && cat !== filterCategory) return false;

      // 5. Status Filter
      if (filterStatus !== "All" && v.status !== filterStatus) return false;

      // 6. Registration Number Filter
      if (filterRegNum.trim()) {
        if (
          !v.plateNumber
            .toLowerCase()
            .includes(filterRegNum.trim().toLowerCase())
        )
          return false;
      }

      return true;
    });
  }, [
    vehicles,
    effectiveSearch,
    filterCarter,
    filterType,
    filterCategory,
    filterStatus,
    filterRegNum,
  ]);

  // Simulated Refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshNotification(
        "Vehicle scale verification logs successfully synchronized.",
      );
      setTimeout(() => setRefreshNotification(""), 3500);
    }, 800);
  };

  // Open Form for Adding
  const handleOpenAddForm = () => {
    setFormMode("add");
    setEditingPlateNumber(null);
    setFieldCategory("Standard");
    setFieldName("");
    setFieldPlateNumber("");
    setFieldCarterName(carterNames[0] || "Star Bulk Haulage");
    setFieldVehicleType("Truck");
    setFieldMakeModel("");
    setFieldStatus("Active");
    setFieldNotes("");

    // Standard Defaults
    setFieldTareWeight(10.0);
    setFieldWeightMax(25.0);
    setFieldVariance(0.5);

    // Multiaxel Defaults
    setFieldWeighedAs("Weighed as Whole");
    setFieldEnableCombinedTare(true);
    setFieldCombinedTareWeight(15.0);
    setFieldGrossMaximum(42.0);
    setFieldAxleSets([
      { axleSetNumber: 1, tareWeight: 8.0, weightMax: 15.0, variance: 0.2 },
    ]);

    setIsFormOpen(true);
  };

  // Open Form for Editing
  const handleOpenEditForm = (v: Vehicle) => {
    setFormMode("edit");
    setEditingPlateNumber(v.plateNumber);
    setFieldCategory(v.category || "Standard");
    setFieldName(v.name || "");
    setFieldPlateNumber(v.plateNumber);
    setFieldCarterName(v.carrierName);
    setFieldVehicleType(v.vehicleType || "Truck");
    setFieldMakeModel(v.makeModel || "");
    setFieldStatus(v.status);
    setFieldNotes(v.notes || "");

    if (v.category === "Multiaxel") {
      setFieldWeighedAs(v.weighedAs || "Weighed as Whole");
      setFieldEnableCombinedTare(v.enableCombinedTare !== false);
      setFieldCombinedTareWeight(v.tareWeight);
      setFieldGrossMaximum(v.weightMax || 42.0);
      setFieldAxleSets(
        v.axleSets || [
          {
            axleSetNumber: 1,
            tareWeight: v.tareWeight,
            weightMax: v.weightMax || 42.0,
            variance: v.variance || 0.5,
          },
        ],
      );
    } else {
      setFieldTareWeight(v.tareWeight);
      setFieldWeightMax(v.weightMax ?? Number((v.tareWeight * 2.5).toFixed(2)));
      setFieldVariance(v.variance ?? 0.5);

      // Also sync some defaults to multiaxel states
      setFieldWeighedAs("Weighed as Whole");
      setFieldEnableCombinedTare(true);
      setFieldCombinedTareWeight(v.tareWeight);
      setFieldGrossMaximum(v.weightMax || 25.0);
      setFieldAxleSets([
        {
          axleSetNumber: 1,
          tareWeight: v.tareWeight,
          weightMax: v.weightMax || 25.0,
          variance: v.variance || 0.5,
        },
      ]);
    }

    setIsFormOpen(true);
  };

  // Save actions
  const handleSaveVehicle = (andAddAnother = false) => {
    if (!fieldPlateNumber.trim()) {
      alert("Registration Number (Plate Number) is required.");
      return;
    }
    if (!fieldName.trim()) {
      alert("Vehicle Name is required.");
      return;
    }

    const finalTare =
      fieldCategory === "Standard"
        ? Number(fieldTareWeight)
        : Number(computedCombinedTare);

    const finalMax =
      fieldCategory === "Standard"
        ? Number(fieldWeightMax)
        : Number(fieldGrossMaximum);

    const finalVariance =
      fieldCategory === "Standard"
        ? Number(fieldVariance)
        : Number(
            fieldAxleSets
              .reduce((sum, s) => sum + (s.variance || 0), 0)
              .toFixed(2),
          );

    if (formMode === "add") {
      // Check duplicate plate
      const duplicate = vehicles.find(
        (v) =>
          v.plateNumber.toLowerCase() === fieldPlateNumber.trim().toLowerCase(),
      );
      if (duplicate) {
        alert(
          `A vehicle with Registration Number "${fieldPlateNumber.toUpperCase()}" already exists.`,
        );
        return;
      }

      const generatedId = `VH-${String(vehicles.length + 1).padStart(3, "0")}`;
      const newVehicle: Vehicle = {
        id: generatedId,
        name: fieldName,
        plateNumber: fieldPlateNumber.trim().toUpperCase(),
        carrierName: fieldCarterName,
        vehicleType: fieldVehicleType,
        category: fieldCategory,
        makeModel: fieldMakeModel,
        status: fieldStatus,
        notes: fieldNotes,
        tareWeight: finalTare,
        weightMax: finalMax,
        variance: finalVariance,
        lastTareDate: new Date().toISOString().split("T")[0],
        // Multiaxel Fields
        ...(fieldCategory === "Multiaxel"
          ? {
              weighedAs: fieldWeighedAs,
              enableCombinedTare: fieldEnableCombinedTare,
              axleSets: fieldAxleSets,
            }
          : {}),
      };
      onAddVehicle(newVehicle);
    } else {
      const existing = vehicles.find(
        (v) => v.plateNumber === editingPlateNumber,
      );
      if (existing) {
        const updatedVehicle: Vehicle = {
          ...existing,
          name: fieldName,
          carrierName: fieldCarterName,
          vehicleType: fieldVehicleType,
          category: fieldCategory,
          makeModel: fieldMakeModel,
          status: fieldStatus,
          notes: fieldNotes,
          tareWeight: finalTare,
          weightMax: finalMax,
          variance: finalVariance,
          // Multiaxel Fields
          weighedAs: fieldCategory === "Multiaxel" ? fieldWeighedAs : undefined,
          enableCombinedTare:
            fieldCategory === "Multiaxel" ? fieldEnableCombinedTare : undefined,
          axleSets: fieldCategory === "Multiaxel" ? fieldAxleSets : undefined,
        };
        onUpdateVehicle(updatedVehicle);
      }
    }

    if (andAddAnother && formMode === "add") {
      // Clear fields for next entry
      setFieldName("");
      setFieldPlateNumber("");
      setFieldMakeModel("");
      setFieldNotes("");
      setFieldTareWeight(10.0);
      setFieldWeightMax(25.0);
      setFieldVariance(0.5);
      setFieldAxleSets([
        { axleSetNumber: 1, tareWeight: 8.0, weightMax: 15.0, variance: 0.2 },
      ]);
    } else {
      setIsFormOpen(false);
    }
  };

  const toggleColumn = (colKey: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [colKey]: !prev[colKey],
    }));
  };

  const onExport = (
    source: "all" | "selected" | "filtered",
    format: "CSV" | "Excel" | "PDF",
  ) => {
    handleVehicleExport(
      source,
      format,
      vehicles,
      selectedPlates,
      filteredVehicles,
      setExportDropdownOpen,
    );
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight sm:text-2xl flex items-center gap-2">
            <Truck className="h-6 w-6 text-blue-600 animate-pulse" />
            Registered Fleet Vehicles
          </h1>
          <p className="text-xs text-gray-400 font-bold">
            Administrative tracking, tare weight compliance validations, and
            logistical carriage specifications.
          </p>
        </div>

        <button
          onClick={handleOpenAddForm}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-xs font-black transition flex items-center gap-2 self-start md:self-auto shadow-sm cursor-pointer select-none"
        >
          <Plus className="h-4 w-4" />
          Add New Vehicle
        </button>
      </div>

      {/* Sync Ledger feedback */}
      {refreshNotification && (
        <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs font-bold rounded-lg p-3.5 flex items-center gap-2 animate-fade-in shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          {refreshNotification}
        </div>
      )}

      <VehiclesToolbar
        localSearch={localSearch}
        setLocalSearch={setLocalSearch}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        isFiltersActive={isFiltersActive}
        filterCarter={filterCarter}
        setFilterCarter={setFilterCarter}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filterType={filterType}
        setFilterType={setFilterType}
        filterRegNum={filterRegNum}
        setFilterRegNum={setFilterRegNum}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        carterNames={carterNames}
        vehicleTypesList={vehicleTypesList}
        visibleColumns={visibleColumns}
        toggleColumn={toggleColumn}
        showColumnsMenu={showColumnsMenu}
        setShowColumnsMenu={setShowColumnsMenu}
        handleRefresh={handleRefresh}
        handleResetFilters={handleResetFilters}
        isRefreshing={isRefreshing}
      />

      <VehiclesTable
        filteredVehicles={filteredVehicles}
        selectedPlates={selectedPlates}
        setSelectedPlates={setSelectedPlates}
        exportDropdownOpen={exportDropdownOpen}
        setExportDropdownOpen={setExportDropdownOpen}
        handleExport={onExport}
        visibleColumns={visibleColumns}
        onViewVehicleDetails={onViewVehicleDetails}
        onEditVehicle={handleOpenEditForm}
      />

      <VehicleFormModal
        isFormOpen={isFormOpen}
        setIsFormOpen={setIsFormOpen}
        formMode={formMode}
        editingPlateNumber={editingPlateNumber}
        fieldCategory={fieldCategory}
        setFieldCategory={setFieldCategory}
        fieldName={fieldName}
        setFieldName={setFieldName}
        fieldPlateNumber={fieldPlateNumber}
        setFieldPlateNumber={setFieldPlateNumber}
        fieldCarterName={fieldCarterName}
        setFieldCarterName={setFieldCarterName}
        fieldVehicleType={fieldVehicleType}
        setFieldVehicleType={setFieldVehicleType}
        fieldMakeModel={fieldMakeModel}
        setFieldMakeModel={setFieldMakeModel}
        fieldStatus={fieldStatus}
        setFieldStatus={setFieldStatus}
        fieldNotes={fieldNotes}
        setFieldNotes={setFieldNotes}
        fieldTareWeight={fieldTareWeight}
        setFieldTareWeight={setFieldTareWeight}
        fieldWeightMax={fieldWeightMax}
        setFieldWeightMax={setFieldWeightMax}
        fieldVariance={fieldVariance}
        setFieldVariance={setFieldVariance}
        fieldWeighedAs={fieldWeighedAs}
        setFieldWeighedAs={setFieldWeighedAs}
        fieldEnableCombinedTare={fieldEnableCombinedTare}
        setFieldEnableCombinedTare={setFieldEnableCombinedTare}
        fieldCombinedTareWeight={fieldCombinedTareWeight}
        setFieldCombinedTareWeight={setFieldCombinedTareWeight}
        fieldGrossMaximum={fieldGrossMaximum}
        setFieldGrossMaximum={setFieldGrossMaximum}
        fieldAxleSets={fieldAxleSets}
        setFieldAxleSets={setFieldAxleSets}
        computedCombinedTare={computedCombinedTare}
        carterNames={carterNames}
        vehicleTypesList={vehicleTypesList}
        handleSaveVehicle={handleSaveVehicle}
      />
    </div>
  );
}
