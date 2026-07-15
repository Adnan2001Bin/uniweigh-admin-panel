import React, { useState, useMemo } from "react";
import {
  Truck,
  Plus,
  Filter,
  Download,
  RefreshCw,
  Sliders,
  ChevronDown,
  Edit,
  Eye,
  X,
  FileText,
  FileSpreadsheet,
  FileCheck,
  DollarSign,
  Scale,
  Calendar,
  Building,
  Info,
  Layers,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Vehicle, Carrier, AxleSet } from "../types";
import { toast } from "sonner";
import { SelectBox } from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Checkbox } from "@/src/components/ui/checkbox";
import { RadioBox } from "@/src/components/ui/radio-group";
import PageHeader, { PAGE_HEADER_ADD_BUTTON_CLASS } from "@/src/components/shared/PageHeader";
import StatusBadge from "@/src/components/shared/StatusBadge";
import { TABLE_ACTION_ICON_BUTTON_CLASS } from "@/src/components/shared/table-action-styles";
import FormPage, {
  FORM_PAGE_INPUT_CLASS,
  FORM_PAGE_SELECT_CLASS,
  FORM_PAGE_TEXTAREA_CLASS,
  FORM_PAGE_ACTION_CLASS,
  FORM_PAGE_SECTION_CLASS,
  FORM_PAGE_LABEL_CLASS
} from "@/src/components/shared/FormPage";

interface VehiclesViewProps {
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
  searchQuery: topSearchQuery
}: VehiclesViewProps) {
  // UI and display states
  const [localSearch, setLocalSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotification, setRefreshNotification] = useState("");
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [exportScope, setExportScope] = useState<"all" | "filtered" | "selected" | null>(null);
  const [exportFormat, setExportFormat] = useState<"CSV" | "Excel" | "PDF">("CSV");

  // Filter fields
  const [filterCarter, setFilterCarter] = useState("All");
  const [filterType, setFilterType] = useState("All"); // Vehicle Type filter (Truck, etc.)
  const [filterCategory, setFilterCategory] = useState("All"); // Vehicle Category (Standard, Multiaxel)
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterRegNum, setFilterRegNum] = useState("");

  // Selected row IDs (plateNumber)
  const [selectedPlates, setSelectedPlates] = useState<string[]>([]);

  // Column Visibility state
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    id: true,
    name: true,
    regNum: true,
    category: true,
    type: true,
    carter: true,
    tare: true,
    maxWeight: true,
    status: true,
    actions: true
  });

  // Full-page form mode
  const [currentMode, setCurrentMode] = useState<"list" | "add" | "edit">("list");
  const [editingPlateNumber, setEditingPlateNumber] = useState<string | null>(null);

  // Form Fields
  const [fieldCategory, setFieldCategory] = useState<"Standard" | "Multiaxel">("Standard");
  const [fieldName, setFieldName] = useState("");
  const [fieldPlateNumber, setFieldPlateNumber] = useState("");
  const [fieldCarterName, setFieldCarterName] = useState("");
  const [fieldVehicleType, setFieldVehicleType] = useState("Truck"); // Truck, Prime Mover, Trailer, A Trailer, B Trailer
  const [fieldMakeModel, setFieldMakeModel] = useState("");
  const [fieldStatus, setFieldStatus] = useState<"Active" | "Inactive">("Active");
  const [fieldNotes, setFieldNotes] = useState("");

  // Standard Weight Fields
  const [fieldTareWeight, setFieldTareWeight] = useState<number>(10.00);
  const [fieldWeightMax, setFieldWeightMax] = useState<number>(25.00);
  const [fieldVariance, setFieldVariance] = useState<number>(0.50);

  // Multiaxel Specific Fields
  const [fieldWeighedAs, setFieldWeighedAs] = useState<string>("Weighed as Whole");
  const [fieldEnableCombinedTare, setFieldEnableCombinedTare] = useState<boolean>(true);
  const [fieldCombinedTareWeight, setFieldCombinedTareWeight] = useState<number>(15.00);
  const [fieldGrossMaximum, setFieldGrossMaximum] = useState<number>(42.00);
  const [fieldAxleSets, setFieldAxleSets] = useState<AxleSet[]>([
    { axleSetNumber: 1, tareWeight: 5.00, weightMax: 14.00, variance: 0.20 }
  ]);

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
      filterRegNum !== ""
    );
  }, [filterCarter, filterType, filterCategory, filterStatus, filterRegNum]);

  // Support vehicle types
  const vehicleTypesList = ["Truck", "Prime Mover", "Trailer", "A Trailer", "B Trailer"];

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
          v.notes || ""
        ].join(" ").toLowerCase();
        if (!textToMatch.includes(effectiveSearch)) return false;
      }

      // 2. Carter Filter
      if (filterCarter !== "All" && v.carrierName !== filterCarter) return false;

      // 3. Vehicle Type Filter
      if (filterType !== "All" && v.vehicleType !== filterType) return false;

      // 4. Vehicle Category Filter
      const cat = v.category || "Standard";
      if (filterCategory !== "All" && cat !== filterCategory) return false;

      // 5. Status Filter
      if (filterStatus !== "All" && v.status !== filterStatus) return false;

      // 6. Registration Number Filter
      if (filterRegNum.trim()) {
        if (!v.plateNumber.toLowerCase().includes(filterRegNum.trim().toLowerCase())) return false;
      }

      return true;
    });
  }, [vehicles, effectiveSearch, filterCarter, filterType, filterCategory, filterStatus, filterRegNum]);

  // Simulated Refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshNotification("Vehicle scale verification logs successfully synchronized.");
      setTimeout(() => setRefreshNotification(""), 3500);
    }, 800);
  };

  // Row selection helpers
  const handleToggleSelectAll = () => {
    if (selectedPlates.length === filteredVehicles.length) {
      setSelectedPlates([]);
    } else {
      setSelectedPlates(filteredVehicles.map((v) => v.plateNumber));
    }
  };

  const handleToggleSelectRow = (plate: string) => {
    setSelectedPlates((prev) =>
      prev.includes(plate) ? prev.filter((p) => p !== plate) : [...prev, plate]
    );
  };

  const getAxleSetCount = (weighedAs: string): number => {
    switch (weighedAs) {
      case "2 Axle Sets": return 2;
      case "3 Axle Sets": return 3;
      case "4 Axle Sets": return 4;
      case "5 Axle Sets": return 5;
      default: return 1; // "Weighed as Whole"
    }
  };

  // Handle change in Weighed As selection
  const handleWeighedAsChange = (weighedAsVal: string) => {
    setFieldWeighedAs(weighedAsVal);
    const count = getAxleSetCount(weighedAsVal);
    const updatedSets: AxleSet[] = [];
    for (let i = 1; i <= count; i++) {
      const existing = fieldAxleSets.find((s) => s.axleSetNumber === i);
      if (existing) {
        updatedSets.push(existing);
      } else {
        updatedSets.push({
          axleSetNumber: i,
          tareWeight: 5.00,
          weightMax: 14.00,
          variance: 0.20
        });
      }
    }
    setFieldAxleSets(updatedSets);
  };

  // Handle individual axle set input changes
  const handleAxleSetChange = (index: number, key: keyof AxleSet, value: number) => {
    const updated = [...fieldAxleSets];
    updated[index] = {
      ...updated[index],
      [key]: value
    };
    setFieldAxleSets(updated);
  };

  // Computed Combined Tare Weight for rendering
  const computedCombinedTare = useMemo(() => {
    if (fieldEnableCombinedTare) {
      return Number(fieldAxleSets.reduce((sum, s) => sum + (s.tareWeight || 0), 0).toFixed(2));
    }
    return fieldCombinedTareWeight;
  }, [fieldEnableCombinedTare, fieldAxleSets, fieldCombinedTareWeight]);

  // Open Form for Adding
  const handleOpenAddForm = () => {
    setCurrentMode("add");
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
    setFieldTareWeight(10.00);
    setFieldWeightMax(25.00);
    setFieldVariance(0.50);

    // Multiaxel Defaults
    setFieldWeighedAs("Weighed as Whole");
    setFieldEnableCombinedTare(true);
    setFieldCombinedTareWeight(15.00);
    setFieldGrossMaximum(42.00);
    setFieldAxleSets([
      { axleSetNumber: 1, tareWeight: 8.00, weightMax: 15.00, variance: 0.20 }
    ]);
  };

  // Open Form for Editing
  const handleOpenEditForm = (v: Vehicle) => {
    setCurrentMode("edit");
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
      setFieldGrossMaximum(v.weightMax || 42.00);
      setFieldAxleSets(v.axleSets || [
        { axleSetNumber: 1, tareWeight: v.tareWeight, weightMax: v.weightMax || 42.00, variance: v.variance || 0.50 }
      ]);
    } else {
      setFieldTareWeight(v.tareWeight);
      setFieldWeightMax(v.weightMax ?? Number((v.tareWeight * 2.5).toFixed(2)));
      setFieldVariance(v.variance ?? 0.50);

      // Also sync some defaults to multiaxel states
      setFieldWeighedAs("Weighed as Whole");
      setFieldEnableCombinedTare(true);
      setFieldCombinedTareWeight(v.tareWeight);
      setFieldGrossMaximum(v.weightMax || 25.00);
      setFieldAxleSets([
        { axleSetNumber: 1, tareWeight: v.tareWeight, weightMax: v.weightMax || 25.00, variance: v.variance || 0.50 }
      ]);
    }
  };

  // Save actions
  const handleSaveVehicle = (andAddAnother = false) => {
    if (!fieldPlateNumber.trim()) {
      toast.error("Registration Number (Plate Number) is required.");
      return;
    }
    if (!fieldName.trim()) {
      toast.error("Vehicle Name is required.");
      return;
    }

    const finalTare = fieldCategory === "Standard"
      ? Number(fieldTareWeight)
      : Number(computedCombinedTare);

    const finalMax = fieldCategory === "Standard"
      ? Number(fieldWeightMax)
      : Number(fieldGrossMaximum);

    const finalVariance = fieldCategory === "Standard"
      ? Number(fieldVariance)
      : Number((fieldAxleSets.reduce((sum, s) => sum + (s.variance || 0), 0)).toFixed(2));

    if (currentMode === "add") {
      // Check duplicate plate
      const duplicate = vehicles.find(v => v.plateNumber.toLowerCase() === fieldPlateNumber.trim().toLowerCase());
      if (duplicate) {
        toast.error(`A vehicle with Registration Number "${fieldPlateNumber.toUpperCase()}" already exists.`);
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
        ...(fieldCategory === "Multiaxel" ? {
          weighedAs: fieldWeighedAs,
          enableCombinedTare: fieldEnableCombinedTare,
          axleSets: fieldAxleSets
        } : {})
      };
      onAddVehicle(newVehicle);
    } else {
      const existing = vehicles.find(v => v.plateNumber === editingPlateNumber);
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
          enableCombinedTare: fieldCategory === "Multiaxel" ? fieldEnableCombinedTare : undefined,
          axleSets: fieldCategory === "Multiaxel" ? fieldAxleSets : undefined
        };
        onUpdateVehicle(updatedVehicle);
      }
    }

    if (andAddAnother && currentMode === "add") {
      // Clear fields for next entry
      setFieldName("");
      setFieldPlateNumber("");
      setFieldMakeModel("");
      setFieldNotes("");
      setFieldTareWeight(10.00);
      setFieldWeightMax(25.00);
      setFieldVariance(0.50);
      setFieldAxleSets([
        { axleSetNumber: 1, tareWeight: 8.00, weightMax: 15.00, variance: 0.20 }
      ]);
    } else {
      setCurrentMode("list");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveVehicle(false);
  };

  const handleCancelForm = () => {
    setCurrentMode("list");
    setEditingPlateNumber(null);
  };

  const toggleColumn = (colKey: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [colKey]: !prev[colKey]
    }));
  };

  // Export handling
  const handleExport = (format: "CSV" | "Excel" | "PDF", source: "all" | "selected" | "filtered") => {
    setIsExportDropdownOpen(false);
    setExportScope(null);
    let listToExport = vehicles;
    let fileNameSuffix = "All_Vehicles";

    if (source === "selected") {
      listToExport = vehicles.filter((v) => selectedPlates.includes(v.plateNumber));
      fileNameSuffix = "Selected_Vehicles";
      if (listToExport.length === 0) {
        toast.info("Please select at least one Vehicle in the table first.");
        return;
      }
    } else if (source === "filtered") {
      listToExport = filteredVehicles;
      fileNameSuffix = "Filtered_Vehicles";
    }

    const headers = [
      "Vehicle ID",
      "Vehicle Name",
      "Registration Number",
      "Vehicle Category",
      "Vehicle Type",
      "Carter",
      "Tare Weight (t)",
      "Gross Maximum / Weight Max (t)",
      "Variance (t)",
      "Status",
      "Weighed As",
      "Combined Tare Enabled",
      "Notes"
    ];

    const rows = listToExport.map((v) => [
      v.id || "N/A",
      v.name || "N/A",
      v.plateNumber,
      v.category || "Standard",
      v.vehicleType,
      v.carrierName,
      v.tareWeight.toFixed(2),
      (v.weightMax ?? v.tareWeight * 2.5).toFixed(2),
      (v.variance ?? 0.50).toFixed(2),
      v.status,
      v.weighedAs || "N/A",
      v.enableCombinedTare ? "Yes" : "No",
      v.notes || ""
    ]);

    if (format === "CSV" || format === "Excel") {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Uniweigh_${fileNameSuffix}.${format === "CSV" ? "csv" : "xlsx"}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "PDF") {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Pop-up blocked. Please enable pop-ups to print PDF reports.");
        return;
      }

      const htmlRows = rows
        .map(
          (r) => `
        <tr style="border-bottom: 1px solid #ddd; font-size: 11px;">
          <td style="padding: 8px; font-weight: bold; font-family: monospace;">${r[0]}</td>
          <td style="padding: 8px; font-weight: bold;">${r[1]}</td>
          <td style="padding: 8px; font-family: monospace;">${r[2]}</td>
          <td style="padding: 8px;">${r[3]}</td>
          <td style="padding: 8px;">${r[4]}</td>
          <td style="padding: 8px;">${r[5]}</td>
          <td style="padding: 8px; text-align: right; font-family: monospace;">${r[6]} t</td>
          <td style="padding: 8px; text-align: right; font-family: monospace;">${r[7]} t</td>
          <td style="padding: 8px; font-weight: bold; color: ${r[9] === "Active" ? "green" : "red"};">${r[9]}</td>
        </tr>`
        )
        .join("");

      printWindow.document.write(`
        <html>
        <head>
          <title>Registered Fleet Vehicles</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; color: #333; }
            h1 { font-size: 18px; border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 4px; }
            .meta { font-size: 11px; color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f5f5f5; border-bottom: 2px solid #ccc; padding: 8px; font-size: 11px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Registered Fleet Vehicles Administration Report</h1>
          <div class="meta">Dataset: ${fileNameSuffix.replace("_", " ")} | Total Records: ${listToExport.length} | Generated: ${new Date().toLocaleString()}</div>
          <table>
            <thead>
              <tr>
                <th>Vehicle ID</th>
                <th>Vehicle Name</th>
                <th>Registration</th>
                <th>Category</th>
                <th>Vehicle Type</th>
                <th>Carter Name</th>
                <th style="text-align: right;">Tare Weight</th>
                <th style="text-align: right;">Weight Max</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${htmlRows}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Registered Fleet Vehicles"
        icon={Truck}
        breadcrumbs={[
          { label: "Transport" },
          { label: "Vehicles" },
        ]}
        actions={
          currentMode === "list" ? (
            <button
              type="button"
              onClick={handleOpenAddForm}
              className={PAGE_HEADER_ADD_BUTTON_CLASS}
            >
              <Plus className="h-4 w-4" />
              Add New Vehicle
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCancelForm}
              className={`${FORM_PAGE_ACTION_CLASS} gap-2 border border-border bg-card px-3 text-foreground shadow-xs hover:bg-muted`}
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              Back to Listing
            </button>
          )
        }
      />

      <AnimatePresence mode="wait">
        {currentMode === "list" ? (
          <motion.div
            key="vehicles-list-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
          {/* Sync Ledger feedback */}
          {refreshNotification && (
              <div className="bg-success/10 border border-success/25 text-success text-xs font-bold rounded-md p-3.5 flex items-center gap-2 animate-fade-in shadow-xs">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                {refreshNotification}
              </div>
            )}

            {/* Toolbar: Search + Filters + Columns + Refresh | Export */}
            <div className="bg-card border border-border rounded-md p-4 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <div className="relative w-64">
                    <input
                      type="text"
                      placeholder="Search vehicles..."
                      value={localSearch}
                      onChange={(e) => setLocalSearch(e.target.value)}
                      className="w-full bg-muted border border-border hover:border-input focus:bg-card rounded-md pl-3 pr-8 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    {localSearch && (
                      <button
                        type="button"
                        onClick={() => setLocalSearch("")}
                        className="absolute right-2.5 top-2 text-muted-foreground hover:text-muted-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`rounded-md border px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 select-none ${
                      showFilters || isFiltersActive
                        ? "bg-info/10 border-info/25 text-info hover:bg-info/10"
                        : "bg-card border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    <Filter className="h-3.5 w-3.5" />
                    Filters
                    {isFiltersActive && (
                      <span className="bg-primary text-white font-mono text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {[
                          filterCarter !== "All",
                          filterCategory !== "All",
                          filterType !== "All",
                          filterRegNum !== "",
                          filterStatus !== "All",
                        ].filter(Boolean).length}
                      </span>
                    )}
                  </button>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setShowColumnsMenu(!showColumnsMenu);
                        setIsExportDropdownOpen(false);
                      }}
                      className="rounded-md border border-border bg-card hover:bg-muted px-3 py-1.5 text-xs font-bold text-foreground transition flex items-center gap-1.5 select-none"
                    >
                      <Sliders className="h-3.5 w-3.5 text-muted-foreground" />
                      Columns
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>

                    {showColumnsMenu && (
                      <div className="absolute left-0 mt-1.5 w-48 bg-card border border-border rounded-md shadow-lg py-1.5 z-25 text-xs">
                        <div className="px-3 py-1 font-bold text-muted-foreground text-xs uppercase tracking-widest border-b border-border mb-1">
                          Toggle Columns
                        </div>
                        {Object.keys(visibleColumns).map((col) => (
                          <label
                            key={col}
                            className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-muted cursor-pointer font-bold text-foreground"
                          >
                            <Checkbox
                              checked={visibleColumns[col]}
                              onCheckedChange={() => toggleColumn(col)}
                              className="rounded text-info focus:ring-ring"
                            />
                            {col === "regNum"
                              ? "Registration"
                              : col === "maxWeight"
                              ? "Weight Max / Gross"
                              : col === "tare"
                              ? "Tare Weight"
                              : col.charAt(0).toUpperCase() + col.slice(1)}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="rounded-md border border-border bg-card hover:bg-muted p-1.5 text-xs font-bold text-foreground transition flex items-center justify-center select-none cursor-pointer"
                    title="Refresh vehicle database"
                  >
                    <RefreshCw className={`h-4 w-4 text-muted-foreground ${isRefreshing ? "animate-spin text-info" : ""}`} />
                  </button>
                </div>

                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsExportDropdownOpen(!isExportDropdownOpen);
                      setShowColumnsMenu(false);
                    }}
                    className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted cursor-pointer transition select-none"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export Records</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  {isExportDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-64 z-50 rounded-md border border-border bg-card py-2 shadow-lg animate-fade-in text-xs text-foreground">
                      <div className="px-3 py-1.5 border-b border-border bg-muted text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Select Export Scope
                      </div>
                      <button
                        type="button"
                        disabled={selectedPlates.length === 0}
                        onClick={() => {
                          if (selectedPlates.length === 0) return;
                          setIsExportDropdownOpen(false);
                          setExportScope("selected");
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-muted ${
                          selectedPlates.length === 0 ? "opacity-40 cursor-not-allowed" : "font-semibold"
                        }`}
                      >
                        Export Selected ({selectedPlates.length})
                        {selectedPlates.length === 0 && (
                          <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                            Check rows in the table first
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsExportDropdownOpen(false);
                          setExportScope("filtered");
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-muted"
                      >
                        Export Filtered Results ({filteredVehicles.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsExportDropdownOpen(false);
                          setExportScope("all");
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-muted"
                      >
                        Export All Records ({vehicles.length})
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {(showFilters || isFiltersActive) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-muted border border-border p-3.5 rounded-md text-xs">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                      Carter Transport Provider
                    </label>
                    <SelectBox
                      value={filterCarter}
                      onChange={(e) => setFilterCarter(e.target.value)}
                      className="w-full rounded-md border border-border bg-card p-1.5 text-xs font-semibold focus:outline-none"
                    >
                      <option value="All">All Carters</option>
                      {carterNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </SelectBox>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                      Vehicle Category
                    </label>
                    <SelectBox
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full rounded-md border border-border bg-card p-1.5 text-xs font-semibold focus:outline-none"
                    >
                      <option value="All">All Categories</option>
                      <option value="Standard">Standard</option>
                      <option value="Multiaxel">Multiaxel</option>
                    </SelectBox>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                      Vehicle Type Class
                    </label>
                    <SelectBox
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full rounded-md border border-border bg-card p-1.5 text-xs font-semibold focus:outline-none"
                    >
                      <option value="All">All Types</option>
                      {vehicleTypesList.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </SelectBox>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                      Registration Search
                    </label>
                    <Input
                      type="text"
                      placeholder="E.g., IC-88"
                      value={filterRegNum}
                      onChange={(e) => setFilterRegNum(e.target.value)}
                      className="w-full rounded-md border border-border bg-card p-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                      Status
                    </label>
                    <SelectBox
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full rounded-md border border-border bg-card p-1.5 text-xs font-semibold focus:outline-none"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </SelectBox>
                  </div>

                  <div className="sm:col-span-2 md:col-span-5 flex justify-end gap-1.5 pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-muted-foreground hover:text-foreground font-bold px-2 py-1 text-xs"
                    >
                      Reset All Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Listing Grid */}
            <div className="bg-card border border-border rounded-md shadow-xs overflow-hidden">
              {/* Selection bar — only when rows are checked */}
              {selectedPlates.length > 0 && (
                <div className="border-b border-border px-5 py-3 flex items-center justify-between bg-muted min-h-[56px]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2.5 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-xs">
                        {selectedPlates.length}
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        Vehicle(s) selected
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedPlates([])}
                      className="text-xs font-bold text-muted-foreground hover:text-foreground px-2.5 py-1.5 border border-border rounded-md hover:bg-card cursor-pointer transition"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
                      <th className="px-4 py-3.5 w-10 text-center">
                        <Checkbox checked={filteredVehicles.length > 0 && selectedPlates.length === filteredVehicles.length} onCheckedChange={(checked) => ((handleToggleSelectAll) as any)({ target: { checked } })} className="rounded text-info focus:ring-ring cursor-pointer" />
                      </th>
                      {visibleColumns.id && <th className="px-4 py-3.5">Vehicle ID</th>}
                      {visibleColumns.name && <th className="px-4 py-3.5">Vehicle Name</th>}
                      {visibleColumns.regNum && <th className="px-4 py-3.5">Registration Number</th>}
                      {visibleColumns.category && <th className="px-4 py-3.5">Vehicle Category</th>}
                      {visibleColumns.type && <th className="px-4 py-3.5">Vehicle Type</th>}
                      {visibleColumns.carter && <th className="px-4 py-3.5">Carter</th>}
                      {visibleColumns.tare && <th className="px-4 py-3.5">Tare Weight</th>}
                      {visibleColumns.maxWeight && <th className="px-4 py-3.5">Gross Maximum</th>}
                      {visibleColumns.status && <th className="px-4 py-3.5 text-center">Status</th>}
                      {visibleColumns.actions && <th className="px-4 py-3.5 text-center">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredVehicles.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-16 text-center text-xs text-muted-foreground">
                          No Vehicles found matching your search criteria or active filters.
                        </td>
                      </tr>
                    ) : (
                      filteredVehicles.map((v) => {
                        const isChecked = selectedPlates.includes(v.plateNumber);
                        const maxWeight = v.weightMax ?? Number((v.tareWeight * 2.5).toFixed(2));
                        const cat = v.category || "Standard";
                        return (
                          <tr
                            key={v.plateNumber}
                            className={`group select-none transition-colors hover:bg-muted ${isChecked ? "bg-info/10" : ""}`}
                          >
                            <td className="px-4 py-4 text-center">
                              <Checkbox checked={isChecked} onCheckedChange={(checked) => ((() => handleToggleSelectRow(v.plateNumber)) as any)({ target: { checked } })} className="rounded text-info focus:ring-ring cursor-pointer" />
                            </td>
                            {visibleColumns.id && (
                              <td className="px-4 py-4">
                                <span className="font-mono text-sm font-bold text-foreground">{v.id || "N/A"}</span>
                              </td>
                            )}
                            {visibleColumns.name && (
                              <td className="px-4 py-4">
                                <span className="text-sm font-bold text-foreground">{v.name || "N/A"}</span>
                              </td>
                            )}
                            {visibleColumns.regNum && (
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className="font-mono text-sm font-bold text-foreground">{v.plateNumber}</span>
                              </td>
                            )}
                            {visibleColumns.category && (
                              <td className="px-4 py-4">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-info/10 text-info border border-info/25">
                                  {cat}
                                </span>
                              </td>
                            )}
                            {visibleColumns.type && (
                              <td className="px-4 py-4">
                                <span className="text-sm font-medium text-muted-foreground">{v.vehicleType || "Truck"}</span>
                              </td>
                            )}
                            {visibleColumns.carter && (
                              <td className="px-4 py-4">
                                <span className="text-sm font-semibold text-foreground">{v.carrierName}</span>
                              </td>
                            )}
                            {visibleColumns.tare && (
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className="text-sm font-bold font-mono text-foreground">{v.tareWeight.toFixed(2)}</span>
                                <span className="text-xs text-muted-foreground ml-0.5">t</span>
                              </td>
                            )}
                            {visibleColumns.maxWeight && (
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className="text-sm font-bold font-mono text-muted-foreground">{maxWeight.toFixed(2)}</span>
                                <span className="text-xs text-muted-foreground ml-0.5">t</span>
                              </td>
                            )}
                            {visibleColumns.status && (
                              <td className="px-4 py-4 text-center">
                                <StatusBadge status={v.status} />
                              </td>
                            )}
                            {visibleColumns.actions && (
                              <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => onViewVehicleDetails(v.plateNumber)}
                                    className={TABLE_ACTION_ICON_BUTTON_CLASS}
                                    title="View detailed summary and transactions log"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditForm(v)}
                                    className={TABLE_ACTION_ICON_BUTTON_CLASS}
                                    title="Modify vehicle details & weights"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          <React.Fragment key="vehicles-form-page">
            <FormPage
              icon={Truck}
              title={currentMode === "add" ? "Register New Fleet Vehicle" : `Edit Vehicle Specs: ${editingPlateNumber}`}
              subtitle="Configure vehicle identity, carter linkage, and weight compliance rules."
              modeBadge={currentMode === "add" ? "Draft Mode" : "Modifying Live Record"}
              saveLabel="Save Vehicle"
              saveAndAddAnotherLabel="Save & Add Another"
              onCancel={handleCancelForm}
              onSubmit={handleFormSubmit}
              onSaveAndAddAnother={currentMode === "add" ? () => handleSaveVehicle(true) : undefined}
            >
            <div className="p-6 space-y-5 text-xs">
              {/* Vehicle Category Selector */}
              <div className="p-4 bg-muted rounded-md border border-border space-y-2">
                <label className={FORM_PAGE_LABEL_CLASS}>Vehicle Category Selection</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 font-bold text-foreground cursor-pointer">
                    <RadioBox checked={fieldCategory === "Standard"} onChange={() => setFieldCategory("Standard")} />
                    Standard Vehicle
                  </label>
                  <label className="flex items-center gap-2 font-bold text-foreground cursor-pointer">
                    <RadioBox checked={fieldCategory === "Multiaxel"} onChange={() => setFieldCategory("Multiaxel")} />
                    Multiaxel Vehicle
                  </label>
                </div>
              </div>

              {/* Section 1: Vehicle Details */}
              <div className="space-y-4">
                <h3 className={FORM_PAGE_SECTION_CLASS}>
                  <Truck className="h-4 w-4 text-info" />
                  <span>Vehicle Details</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Vehicle Name */}
                  <div className="space-y-1.5">
                    <label className={FORM_PAGE_LABEL_CLASS}>Vehicle Name *</label>
                    <Input
                      type="text"
                      placeholder="E.g., Star Bulker #5"
                      value={fieldName}
                      onChange={(e) => setFieldName(e.target.value)}
                      className={FORM_PAGE_INPUT_CLASS}
                    />
                  </div>

                  {/* Registration Plate */}
                  <div className="space-y-1.5">
                    <label className={FORM_PAGE_LABEL_CLASS}>Registration Number *</label>
                    <Input
                      type="text"
                      placeholder="E.g., XY-99-ZZ"
                      value={fieldPlateNumber}
                      onChange={(e) => setFieldPlateNumber(e.target.value)}
                      disabled={currentMode === "edit"}
                      className={`${FORM_PAGE_INPUT_CLASS} font-mono uppercase disabled:opacity-50`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Carter Link */}
                  <div className="space-y-1.5">
                    <label className={FORM_PAGE_LABEL_CLASS}>Carter *</label>
                    <SelectBox
                      value={fieldCarterName}
                      onChange={(e) => setFieldCarterName(e.target.value)}
                      className={FORM_PAGE_SELECT_CLASS}
                    >
                      {carterNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </SelectBox>
                  </div>

                  {/* Vehicle Type Class */}
                  <div className="space-y-1.5">
                    <label className={FORM_PAGE_LABEL_CLASS}>Vehicle Type *</label>
                    <SelectBox
                      value={fieldVehicleType}
                      onChange={(e) => setFieldVehicleType(e.target.value)}
                      className={FORM_PAGE_SELECT_CLASS}
                    >
                      {vehicleTypesList.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </SelectBox>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Make and Model */}
                  <div className="space-y-1.5">
                    <label className={FORM_PAGE_LABEL_CLASS}>Make and Model</label>
                    <Input
                      type="text"
                      placeholder="E.g., Kenworth T610"
                      value={fieldMakeModel}
                      onChange={(e) => setFieldMakeModel(e.target.value)}
                      className={FORM_PAGE_INPUT_CLASS}
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <label className={FORM_PAGE_LABEL_CLASS}>Status</label>
                    <SelectBox
                      value={fieldStatus}
                      onChange={(e) => setFieldStatus(e.target.value as "Active" | "Inactive")}
                      className={FORM_PAGE_SELECT_CLASS}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </SelectBox>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className={FORM_PAGE_LABEL_CLASS}>Notes</label>
                  <Textarea
                    placeholder="Enter special access notes, permit codes, or compliance records..."
                    value={fieldNotes}
                    onChange={(e) => setFieldNotes(e.target.value)}
                    rows={2}
                    className={FORM_PAGE_TEXTAREA_CLASS}
                  />
                </div>
              </div>

              {/* Section 2: Weight Specifications */}
              <div className="space-y-4">
                <h3 className={FORM_PAGE_SECTION_CLASS}>
                  <Scale className="h-4 w-4 text-success" />
                  <span>Weight Specifications & Compliance (Tonnes)</span>
                </h3>

                {fieldCategory === "Standard" ? (
                  /* Standard Weights */
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
                    {/* Tare Weight */}
                    <div className="space-y-1.5">
                      <label className={FORM_PAGE_LABEL_CLASS}>Tare Weight (t) *</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={fieldTareWeight}
                        onChange={(e) => setFieldTareWeight(parseFloat(e.target.value) || 0)}
                        className={`${FORM_PAGE_INPUT_CLASS} font-mono`}
                      />
                    </div>

                    {/* Weight Max */}
                    <div className="space-y-1.5">
                      <label className={FORM_PAGE_LABEL_CLASS}>Weight Max (t) *</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={fieldWeightMax}
                        onChange={(e) => setFieldWeightMax(parseFloat(e.target.value) || 0)}
                        className={`${FORM_PAGE_INPUT_CLASS} font-mono`}
                      />
                    </div>

                    {/* Variance */}
                    <div className="space-y-1.5">
                      <label className={FORM_PAGE_LABEL_CLASS}>Variance (t)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={fieldVariance}
                        onChange={(e) => setFieldVariance(parseFloat(e.target.value) || 0)}
                        className={`${FORM_PAGE_INPUT_CLASS} font-mono`}
                      />
                    </div>
                  </div>
                ) : (
                  /* Multiaxel Weights */
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      {/* Weighed As Option */}
                      <div className="space-y-1.5">
                        <label className={FORM_PAGE_LABEL_CLASS}>Weighed As</label>
                        <SelectBox
                          value={fieldWeighedAs}
                          onChange={(e) => handleWeighedAsChange(e.target.value)}
                          className={FORM_PAGE_SELECT_CLASS}
                        >
                          <option value="Weighed as Whole">Weighed as Whole</option>
                          <option value="2 Axle Sets">2 Axle Sets</option>
                          <option value="3 Axle Sets">3 Axle Sets</option>
                          <option value="4 Axle Sets">4 Axle Sets</option>
                          <option value="5 Axle Sets">5 Axle Sets</option>
                        </SelectBox>
                      </div>

                      {/* Enable Combined Tare */}
                      <div className="space-y-1.5 flex flex-col justify-center">
                        <label className={FORM_PAGE_LABEL_CLASS}>Enable Combined Tare</label>
                        <label className="flex items-center gap-2 font-bold text-foreground cursor-pointer h-10 select-none">
                          <Checkbox checked={fieldEnableCombinedTare} onCheckedChange={(checked) => (((e) => setFieldEnableCombinedTare(e.target.checked)) as any)({ target: { checked } })} className="rounded text-info focus:ring-ring h-4 w-4 cursor-pointer" />
                          Sum of Axle Sets
                        </label>
                      </div>

                      {/* Combined Tare Weight */}
                      <div className="space-y-1.5">
                        <label className={FORM_PAGE_LABEL_CLASS}>Combined Tare Weight (t)</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={computedCombinedTare}
                          onChange={(e) => setFieldCombinedTareWeight(parseFloat(e.target.value) || 0)}
                          disabled={fieldEnableCombinedTare}
                          className={`${FORM_PAGE_INPUT_CLASS} font-mono disabled:opacity-50`}
                        />
                      </div>

                      {/* Gross Maximum */}
                      <div className="space-y-1.5">
                        <label className={FORM_PAGE_LABEL_CLASS}>Gross Maximum (t) *</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={fieldGrossMaximum}
                          onChange={(e) => setFieldGrossMaximum(parseFloat(e.target.value) || 0)}
                          className={`${FORM_PAGE_INPUT_CLASS} font-mono`}
                        />
                      </div>
                    </div>

                    {/* Axle Set Cards */}
                    <div className="space-y-2">
                      <h4 className={FORM_PAGE_SECTION_CLASS}>
                        <Layers className="h-4 w-4 text-info" />
                        <span>Axle Set Specifications</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {fieldAxleSets.map((set, idx) => (
                          <div key={set.axleSetNumber} className="bg-muted p-3.5 rounded-md border border-border space-y-3 relative">
                            <div className="flex items-center justify-between border-b border-border pb-1 mb-1">
                              <span className="font-bold text-info uppercase tracking-widest text-xs flex items-center gap-1.5">
                                <Layers className="h-3 w-3" />
                                Axle Set #{set.axleSetNumber}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="space-y-1">
                                <label className={FORM_PAGE_LABEL_CLASS}>Tare Weight</label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={set.tareWeight}
                                  onChange={(e) => handleAxleSetChange(idx, "tareWeight", parseFloat(e.target.value) || 0)}
                                  className={`${FORM_PAGE_INPUT_CLASS} font-mono`}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className={FORM_PAGE_LABEL_CLASS}>Gross Max</label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={set.weightMax}
                                  onChange={(e) => handleAxleSetChange(idx, "weightMax", parseFloat(e.target.value) || 0)}
                                  className={`${FORM_PAGE_INPUT_CLASS} font-mono`}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className={FORM_PAGE_LABEL_CLASS}>Variance</label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={set.variance}
                                  onChange={(e) => handleAxleSetChange(idx, "variance", parseFloat(e.target.value) || 0)}
                                  className={`${FORM_PAGE_INPUT_CLASS} font-mono`}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-info/10 border border-info/25 p-3 rounded-md text-xs text-info flex items-start gap-2">
                  <Info className="h-4 w-4 text-info shrink-0 mt-0.5" />
                  <p className="font-semibold leading-relaxed">
                    Weight values are validated during weighing processes. Weigh-in checks evaluate if total loaded weight exceeds
                    <strong> Weight Max + Variance </strong> limits.
                  </p>
                </div>
              </div>
            </div>
            </FormPage>
          </React.Fragment>
        )}
      </AnimatePresence>

      {exportScope && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-card rounded-md border border-border shadow-lg p-6 relative animate-zoom-in">
            <button
              type="button"
              onClick={() => setExportScope(null)}
              className="absolute top-4 right-4 p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-muted-foreground transition"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2">
              Export Configuration
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Exporting vehicles based on selected scope:{" "}
              <span className="font-bold text-foreground uppercase bg-muted px-1.5 py-0.5 rounded">
                {exportScope === "selected" && "Manually Checked Rows"}
                {exportScope === "filtered" && "Filtered Results"}
                {exportScope === "all" && "All Registry Data"}
              </span>
            </p>

            <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">
              Select Output Format
            </label>
            <div className="grid grid-cols-3 gap-2.5 mb-6">
              {(["CSV", "Excel", "PDF"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setExportFormat(fmt)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2.5 rounded-md border-2 text-xs font-semibold cursor-pointer transition ${
                    exportFormat === fmt
                      ? "border-primary bg-info/10 text-info"
                      : "border-border bg-card text-muted-foreground hover:border-border"
                  }`}
                >
                  {fmt === "CSV" && <FileText className="h-5 w-5 text-muted-foreground" />}
                  {fmt === "Excel" && <FileSpreadsheet className="h-5 w-5 text-success" />}
                  {fmt === "PDF" && <FileCheck className="h-5 w-5 text-destructive" />}
                  <span>{fmt}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setExportScope(null)}
                className="px-4 py-2 rounded-md border border-border text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleExport(exportFormat, exportScope)}
                className="px-4 py-2 rounded-md bg-primary text-xs font-semibold text-white hover:bg-primary/90 transition"
              >
                Generate & Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
