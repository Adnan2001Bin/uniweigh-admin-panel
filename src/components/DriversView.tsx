import React, { useState, useMemo } from "react";
import {
  User,
  Plus,
  Filter,
  Download,
  RefreshCw,
  Sliders,
  ChevronDown,
  Edit,
  Eye,
  ArrowLeft,
  FileText,
  FileSpreadsheet,
  FileCheck,
  Info,
  X
} from "lucide-react";
import { Driver, Carrier } from "../types";
import { toast } from "sonner";
import { SelectBox } from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Checkbox } from "@/src/components/ui/checkbox";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
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
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [exportScope, setExportScope] = useState<"all" | "filtered" | "selected" | null>(null);
  const [exportFormat, setExportFormat] = useState<"CSV" | "Excel" | "PDF">("CSV");

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

  // Full-page form state
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
      filterLicence !== ""
    );
  }, [filterCarter, filterStatus, filterLicence]);

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

  // Selection helpers
  const handleToggleSelectAll = () => {
    if (selectedDriverIds.length === filteredDrivers.length) {
      setSelectedDriverIds([]);
    } else {
      setSelectedDriverIds(filteredDrivers.map((d) => d.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedDriverIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
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
      toast.error("Driver Name is required.");
      return;
    }
    if (!fieldLicence.trim()) {
      toast.error("Licence Number is required.");
      return;
    }

    // Find linked carter ID
    const selectedCarter = carriers.find(c => c.name === fieldCarterName);
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
      const existing = drivers.find(d => d.id === editingDriverId);
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
  const handleExport = (format: "CSV" | "Excel" | "PDF", scope: "all" | "selected" | "filtered") => {
    setIsExportDropdownOpen(false);
    setExportScope(null);

    let listToExport = drivers;
    let fileNameSuffix = "All_Drivers";

    if (scope === "selected") {
      listToExport = drivers.filter((d) => selectedDriverIds.includes(d.id));
      fileNameSuffix = "Selected_Drivers";
      if (listToExport.length === 0) {
        toast.info("Please select at least one Driver in the table first.");
        return;
      }
    } else if (scope === "filtered") {
      listToExport = filteredDrivers;
      fileNameSuffix = "Filtered_Drivers";
    }

    if (listToExport.length === 0) {
      toast.info("No data available to export.");
      return;
    }

    const headers = [
      "Driver ID",
      "Driver Name",
      "Licence Number",
      "Phone Number",
      "Carter Name",
      "Status",
      "Notes"
    ];

    const rows = listToExport.map((d) => [
      d.id,
      d.name,
      d.licenseNumber,
      d.phoneNumber || "N/A",
      d.carrierName,
      d.status,
      d.notes || ""
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
          <td style="padding: 8px; font-weight: bold; color: ${r[5] === "Active" ? "green" : "red"};">${r[5]}</td>
        </tr>`
        )
        .join("");

      printWindow.document.write(`
        <html>
        <head>
          <title>Registered Drivers Listing</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; color: #333; }
            h1 { font-size: 18px; border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 4px; }
            .meta { font-size: 11px; color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f5f5f5; border-bottom: 2px solid #ccc; padding: 8px; font-size: 11px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Registered Logistics Drivers Administration Report</h1>
          <div class="meta">Dataset: ${fileNameSuffix.replace("_", " ")} | Total Records: ${listToExport.length} | Generated: ${new Date().toLocaleString()}</div>
          <table>
            <thead>
              <tr>
                <th>Driver ID</th>
                <th>Driver Name</th>
                <th>Licence Number</th>
                <th>Phone Number</th>
                <th>Carter Name</th>
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
        title="Registered Logistics Drivers"
        icon={User}
        breadcrumbs={[
          { label: "Transport" },
          { label: "Drivers" },
        ]}
        actions={
          !isFormOpen ? (
            <button
              type="button"
              onClick={handleOpenAddForm}
              className={PAGE_HEADER_ADD_BUTTON_CLASS}
            >
              <Plus className="h-4 w-4" />
              Add New Driver
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className={`${FORM_PAGE_ACTION_CLASS} gap-2 border border-border bg-card px-3 text-foreground shadow-xs hover:bg-muted`}
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              Back to Listing
            </button>
          )
        }
      />

      <AnimatePresence mode="wait">
        {!isFormOpen ? (
          <motion.div
            key="drivers-list-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Sync feedback notification */}
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
                      placeholder="Search drivers..."
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
                        {[filterCarter !== "All", filterStatus !== "All", filterLicence !== ""].filter(Boolean).length}
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
                            {col === "licence" ? "Licence Number" : col === "phone" ? "Phone Number" : col.charAt(0).toUpperCase() + col.slice(1)}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="rounded-md border border-border bg-card hover:bg-muted p-1.5 text-xs font-bold text-foreground transition flex items-center justify-center select-none cursor-pointer"
                    title="Refresh drivers database"
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
                        disabled={selectedDriverIds.length === 0}
                        onClick={() => {
                          if (selectedDriverIds.length === 0) return;
                          setIsExportDropdownOpen(false);
                          setExportScope("selected");
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-muted ${
                          selectedDriverIds.length === 0 ? "opacity-40 cursor-not-allowed" : "font-semibold"
                        }`}
                      >
                        Export Selected ({selectedDriverIds.length})
                        {selectedDriverIds.length === 0 && (
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
                        Export Filtered Results ({filteredDrivers.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsExportDropdownOpen(false);
                          setExportScope("all");
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-muted"
                      >
                        Export All Records ({drivers.length})
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {(showFilters || isFiltersActive) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-muted border border-border p-3.5 rounded-md text-xs">
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
                      Licence Search
                    </label>
                    <input
                      type="text"
                      placeholder="E.g., VIC-88..."
                      value={filterLicence}
                      onChange={(e) => setFilterLicence(e.target.value)}
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

                  <div className="sm:col-span-2 md:col-span-4 flex justify-end gap-1.5 pt-2 border-t border-border">
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
              {selectedDriverIds.length > 0 && (
                <div className="border-b border-border px-5 py-3 flex items-center justify-between bg-muted min-h-[56px]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2.5 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-xs">
                        {selectedDriverIds.length}
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        Driver(s) selected
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedDriverIds([])}
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
                        <Checkbox checked={filteredDrivers.length > 0 && selectedDriverIds.length === filteredDrivers.length} onCheckedChange={(checked) => ((handleToggleSelectAll) as any)({ target: { checked } })} className="rounded text-info focus:ring-ring cursor-pointer" />
                      </th>
                      {visibleColumns.id && <th className="px-4 py-3.5">Driver ID</th>}
                      {visibleColumns.name && <th className="px-4 py-3.5">Driver Name</th>}
                      {visibleColumns.licence && <th className="px-4 py-3.5">Licence Number</th>}
                      {visibleColumns.phone && <th className="px-4 py-3.5">Phone Number</th>}
                      {visibleColumns.carter && <th className="px-4 py-3.5">Carter</th>}
                      {visibleColumns.status && <th className="px-4 py-3.5 text-center">Status</th>}
                      {visibleColumns.actions && <th className="px-4 py-3.5 text-center">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredDrivers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-16 text-center text-xs text-muted-foreground">
                          No Drivers found matching your search criteria or active filters.
                        </td>
                      </tr>
                    ) : (
                      filteredDrivers.map((d) => {
                        const isChecked = selectedDriverIds.includes(d.id);
                        return (
                          <tr
                            key={d.id}
                            className={`group select-none transition-colors hover:bg-muted ${isChecked ? "bg-info/10" : ""}`}
                          >
                            <td className="px-4 py-4 text-center">
                              <Checkbox checked={isChecked} onCheckedChange={(checked) => ((() => handleToggleSelectRow(d.id)) as any)({ target: { checked } })} className="rounded text-info focus:ring-ring cursor-pointer" />
                            </td>
                            {visibleColumns.id && (
                              <td className="px-4 py-4">
                                <span className="font-mono text-sm font-bold text-foreground">{d.id}</span>
                              </td>
                            )}
                            {visibleColumns.name && (
                              <td className="px-4 py-4">
                                <span className="text-sm font-bold text-foreground">{d.name}</span>
                              </td>
                            )}
                            {visibleColumns.licence && (
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className="font-mono text-sm font-bold text-foreground">{d.licenseNumber}</span>
                              </td>
                            )}
                            {visibleColumns.phone && (
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className="text-sm font-medium text-muted-foreground">
                                  {d.phoneNumber || "0400 000 000"}
                                </span>
                              </td>
                            )}
                            {visibleColumns.carter && (
                              <td className="px-4 py-4">
                                <span className="text-sm font-semibold text-foreground">{d.carrierName}</span>
                              </td>
                            )}
                            {visibleColumns.status && (
                              <td className="px-4 py-4 text-center">
                                <StatusBadge status={d.status} />
                              </td>
                            )}
                            {visibleColumns.actions && (
                              <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => onViewDriverDetails(d.id)}
                                    className={TABLE_ACTION_ICON_BUTTON_CLASS}
                                    title="View detailed summary and transactions log"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditForm(d)}
                                    className={TABLE_ACTION_ICON_BUTTON_CLASS}
                                    title="Modify driver details"
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
          <React.Fragment key="drivers-form-page">
            <FormPage
              icon={User}
              title={formMode === "add" ? "Register New Logistics Driver" : `Edit Driver Details [${editingDriverId}]`}
              subtitle="Provide driver identification, licensing, carter linkage, and operational notes."
              modeBadge={formMode === "add" ? "Draft Mode" : "Modifying Live Record"}
              onCancel={() => setIsFormOpen(false)}
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveDriver(false);
              }}
              saveLabel="Save Driver"
              onSaveAndAddAnother={formMode === "add" ? () => handleSaveDriver(true) : undefined}
              saveAndAddAnotherLabel="Save & Add Another"
            >
              <div className="p-6 space-y-4">
                <h4 className={FORM_PAGE_SECTION_CLASS}>
                  <Info className="h-4 w-4 text-info" />
                  <span>Driver Specification Details</span>
                </h4>

                {/* Driver Name */}
                <div>
                  <label className={FORM_PAGE_LABEL_CLASS}>
                    Driver Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="E.g., David Miller"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    className={FORM_PAGE_INPUT_CLASS}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Licence Number */}
                  <div>
                    <label className={FORM_PAGE_LABEL_CLASS}>
                      Licence Number <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="E.g., VIC-110293Y"
                      value={fieldLicence}
                      onChange={(e) => setFieldLicence(e.target.value)}
                      className={cn(FORM_PAGE_INPUT_CLASS, "font-mono uppercase")}
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className={FORM_PAGE_LABEL_CLASS}>Phone Number</label>
                    <Input
                      type="text"
                      placeholder="E.g., 0499 123 456"
                      value={fieldPhone}
                      onChange={(e) => setFieldPhone(e.target.value)}
                      className={cn(FORM_PAGE_INPUT_CLASS, "font-mono")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Carter Link */}
                  <div>
                    <label className={FORM_PAGE_LABEL_CLASS}>
                      Carter Company <span className="text-destructive">*</span>
                    </label>
                    <SelectBox
                      value={fieldCarterName}
                      onChange={(e) => setFieldCarterName(e.target.value)}
                      className={FORM_PAGE_SELECT_CLASS}
                      searchable
                    >
                      {carterNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </SelectBox>
                  </div>

                  {/* Status */}
                  <div>
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
                <div>
                  <label className={FORM_PAGE_LABEL_CLASS}>Operational Notes</label>
                  <Textarea
                    placeholder="Enter special site access compliance notes, inductions completed, or safety records..."
                    value={fieldNotes}
                    onChange={(e) => setFieldNotes(e.target.value)}
                    rows={3}
                    className={FORM_PAGE_TEXTAREA_CLASS}
                  />
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
              Exporting drivers based on selected scope:{" "}
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
