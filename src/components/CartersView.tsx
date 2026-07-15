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
  Phone,
  DollarSign,
  MapPin,
  ArrowLeft
} from "lucide-react";
import { Carrier } from "../types";
import { toast } from "sonner";
import { SelectBox } from "@/src/components/ui/select";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import PageHeader, { PAGE_HEADER_ADD_BUTTON_CLASS } from "@/src/components/shared/PageHeader";
import { TABLE_ACTION_ICON_BUTTON_CLASS } from "@/src/components/shared/table-action-styles";
import FormPage, {
  FORM_PAGE_INPUT_CLASS,
  FORM_PAGE_SELECT_CLASS,
  FORM_PAGE_TEXTAREA_CLASS,
  FORM_PAGE_ACTION_CLASS,
  FORM_PAGE_SECTION_CLASS,
  FORM_PAGE_LABEL_CLASS,
} from "@/src/components/shared/FormPage";

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
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [exportScope, setExportScope] = useState<"all" | "filtered" | "selected" | null>(null);
  const [exportFormat, setExportFormat] = useState<"CSV" | "Excel" | "PDF">("CSV");

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

  // Full-page form state for Add / Edit
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
      filterCreatedDate !== ""
    );
  }, [filterStatus, filterRateRange, filterCreatedDate]);

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

  // Select / deselect row helpers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredCarters.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCarters.map((c) => c.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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
      toast.info("Please provide a Carter Name before saving.");
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

  // Global Exports Helper: "Allow exporting: Carter List, Selected Carters, Filtered Carters"
  const handleExportDataset = (source: "all" | "selected" | "filtered", format: "CSV" | "Excel" | "PDF") => {
    setIsExportDropdownOpen(false);
    setExportScope(null);
    let listToExport = carriers;
    let fileNameSuffix = "All_Carters";

    if (source === "selected") {
      listToExport = carriers.filter((c) => selectedIds.includes(c.id));
      fileNameSuffix = "Selected_Carters";
      if (listToExport.length === 0) {
        toast.info("Please select at least one Carter in the listing table first.");
        return;
      }
    } else if (source === "filtered") {
      listToExport = filteredCarters;
      fileNameSuffix = "Filtered_Carters";
    }

    const headers = ["Carter ID", "Carter Name", "Phone Number", "Email", "Transport Rate ($/t)", "Status", "Address", "Notes", "Created Date"];
    const rows = listToExport.map((c) => [
      c.id,
      c.name,
      c.contactNo,
      c.email,
      (c.transportRate ?? 12.50).toFixed(2),
      c.status,
      c.address || "N/A",
      c.notes || "",
      c.createdDate || "2024-03-12"
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
        toast.error("Pop-up blocked. Please enable pop-ups to generate PDF lists.");
        return;
      }

      const htmlRows = rows
        .map(
          (r) => `
        <tr style="border-bottom: 1px solid #ddd; font-size: 11px;">
          <td style="padding: 8px; font-weight: bold; font-family: monospace;">${r[0]}</td>
          <td style="padding: 8px; font-weight: bold;">${r[1]}</td>
          <td style="padding: 8px;">${r[2]}</td>
          <td style="padding: 8px; font-family: monospace; color: green;">$${r[4]}/t</td>
          <td style="padding: 8px; font-weight: bold; color: ${r[5] === "Active" ? "green" : "red"};">${r[5]}</td>
          <td style="padding: 8px;">${r[6]}</td>
          <td style="padding: 8px; font-size: 10px; color: #555;">${r[8]}</td>
        </tr>`
        )
        .join("");

      printWindow.document.write(`
        <html>
        <head>
          <title>Carters Transport Report</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; color: #333; }
            h1 { font-size: 18px; border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 4px; }
            .meta { font-size: 11px; color: #666; margin-bottom: 25px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f5f5f5; border-bottom: 2px solid #ccc; padding: 8px; font-size: 11px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Transport Carters Administration Directory</h1>
          <div class="meta">Export Type: ${fileNameSuffix.replace("_", " ")} | Count: ${listToExport.length} | Generated: ${new Date().toLocaleString()}</div>
          <table>
            <thead>
              <tr>
                <th>Carter ID</th>
                <th>Carter Name</th>
                <th>Phone Number</th>
                <th>Transport Rate</th>
                <th>Status</th>
                <th>Address</th>
                <th>Created Date</th>
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
    <div className="space-y-6">
      <PageHeader
        title="Registered Transport Carters"
        icon={Truck}
        breadcrumbs={[
          { label: "Transport" },
          { label: "Carters" },
        ]}
        actions={
          isFormOpen ? (
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className={`${FORM_PAGE_ACTION_CLASS} gap-2 border border-border bg-card px-3 text-foreground shadow-xs hover:bg-muted`}
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              Back to Listing
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenAddForm}
              className={PAGE_HEADER_ADD_BUTTON_CLASS}
            >
              <Plus className="h-4 w-4" />
              Add New Carter
            </button>
          )
        }
      />

      {!isFormOpen && (
        <>
          {/* Sync ledger simulated notification */}
          {refreshNotification && (
            <div className="bg-success/10 border border-success/25 text-success text-xs font-bold rounded-md p-3.5 flex items-center gap-2 animate-fade-in shadow-xs">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              {refreshNotification}
            </div>
          )}

          {/* Toolbar — Products pattern */}
          <div className="bg-card border border-border rounded-md p-4 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="Search carters..."
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
                      {[filterStatus !== "All", filterRateRange !== "All", filterCreatedDate !== ""].filter(Boolean).length}
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
                          {col === "phone" ? "Phone Number" : col === "rate" ? "Transport Rate" : col.charAt(0).toUpperCase() + col.slice(1)}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleRefresh}
                  className="rounded-md border border-border bg-card hover:bg-muted p-1.5 text-xs font-bold text-foreground transition flex items-center justify-center select-none"
                  title="Refresh dataset"
                >
                  <RefreshCw className={`h-4 w-4 text-muted-foreground ${isRefreshing ? "animate-spin text-info" : ""}`} />
                </button>
              </div>
            </div>

            {(showFilters || isFiltersActive) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-muted border border-border p-3.5 rounded-md text-xs">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                    Carter Status
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

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                    Transport Rate Range
                  </label>
                  <SelectBox
                    value={filterRateRange}
                    onChange={(e) => setFilterRateRange(e.target.value)}
                    className="w-full rounded-md border border-border bg-card p-1.5 text-xs font-semibold focus:outline-none"
                  >
                    <option value="All">All Rates</option>
                    <option value="Low">Low Rates (&lt; $12.00/t)</option>
                    <option value="Medium">Medium Rates ($12.00 - $15.00/t)</option>
                    <option value="High">High Rates (&gt; $15.00/t)</option>
                  </SelectBox>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                    Registration Date
                  </label>
                  <input
                    type="date"
                    value={filterCreatedDate}
                    onChange={(e) => setFilterCreatedDate(e.target.value)}
                    className="w-full rounded-md border border-border bg-card p-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                  />
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

          {/* Carters Table listing */}
          <div className="bg-card border border-border rounded-md shadow-xs overflow-hidden">
            {/* Table summary / selection bar — matches Product Lots / Destinations */}
            <div className="border-b border-border px-5 py-3 flex items-center justify-between bg-muted min-h-[56px]">
              {selectedIds.length > 0 ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2.5 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-xs">
                      {selectedIds.length}
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      Carter(s) selected
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setIsExportDropdownOpen(!isExportDropdownOpen);
                          setShowColumnsMenu(false);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-foreground bg-card border border-border hover:bg-muted cursor-pointer shadow-xs transition"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Export
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      {isExportDropdownOpen && (
                        <div className="absolute right-0 mt-1.5 w-64 z-50 rounded-md border border-border bg-card py-2 shadow-lg animate-fade-in text-xs text-foreground">
                          <div className="px-3 py-1.5 border-b border-border bg-muted text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Select Export Scope
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsExportDropdownOpen(false);
                              setExportScope("selected");
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-muted font-semibold"
                          >
                            Export Selected ({selectedIds.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsExportDropdownOpen(false);
                              setExportScope("filtered");
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-muted"
                          >
                            Export Filtered Results ({filteredCarters.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsExportDropdownOpen(false);
                              setExportScope("all");
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-muted"
                          >
                            Export All Records ({carriers.length})
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedIds([])}
                      className="text-xs font-bold text-muted-foreground hover:text-foreground px-2.5 py-1.5 border border-border rounded-md hover:bg-card cursor-pointer transition"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full gap-3">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Showing {filteredCarters.length} of {carriers.length} records found
                    {(isFiltersActive || !!localSearch.trim() || !!topSearchQuery.trim()) && (
                      <span className="ml-1.5 text-foreground font-bold">· Filtered view</span>
                    )}
                  </span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsExportDropdownOpen(!isExportDropdownOpen);
                        setShowColumnsMenu(false);
                      }}
                      className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer transition"
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
                          disabled={selectedIds.length === 0}
                          onClick={() => {
                            if (selectedIds.length === 0) return;
                            setIsExportDropdownOpen(false);
                            setExportScope("selected");
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-muted ${
                            selectedIds.length === 0 ? "opacity-40 cursor-not-allowed" : "font-semibold"
                          }`}
                        >
                          Export Selected ({selectedIds.length})
                          {selectedIds.length === 0 && (
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
                          Export Filtered Results ({filteredCarters.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsExportDropdownOpen(false);
                            setExportScope("all");
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-muted"
                        >
                          Export All Records ({carriers.length})
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-muted border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
                    <th className="px-5 py-3 w-10 text-center">
                      <Checkbox checked={filteredCarters.length > 0 && selectedIds.length === filteredCarters.length} onCheckedChange={(checked) => ((handleToggleSelectAll) as any)({ target: { checked } })} className="rounded text-info focus:ring-ring cursor-pointer h-3.5 w-3.5" />
                    </th>
                    {visibleColumns.id && <th className="px-5 py-3">Carter ID</th>}
                    {visibleColumns.name && <th className="px-5 py-3">Carter Name</th>}
                    {visibleColumns.phone && <th className="px-5 py-3">Phone Number</th>}
                    {visibleColumns.rate && <th className="px-5 py-3">Transport Rate</th>}
                    {visibleColumns.status && <th className="px-5 py-3 text-center">Status</th>}
                    {visibleColumns.actions && <th className="px-5 py-3 text-center">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCarters.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-muted-foreground font-medium">
                        No Carters matched your search filters or search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredCarters.map((c) => {
                      const rate = c.transportRate ?? 12.50;
                      const isChecked = selectedIds.includes(c.id);
                      return (
                        <tr
                          key={c.id}
                          className={`hover:bg-muted transition duration-150 ${isChecked ? "bg-info/10" : ""}`}
                        >
                          <td className="px-5 py-4 text-center">
                            <Checkbox checked={isChecked} onCheckedChange={(checked) => ((() => handleToggleSelectRow(c.id)) as any)({ target: { checked } })} className="rounded text-info focus:ring-ring cursor-pointer h-3.5 w-3.5" />
                          </td>
                          {visibleColumns.id && (
                            <td className="px-5 py-4 font-bold font-mono text-foreground">{c.id}</td>
                          )}
                          {visibleColumns.name && (
                            <td className="px-5 py-4 font-bold text-foreground">{c.name}</td>
                          )}
                          {visibleColumns.phone && (
                            <td className="px-5 py-4 font-medium text-muted-foreground">{c.contactNo}</td>
                          )}
                          {visibleColumns.rate && (
                            <td className="px-5 py-4 font-bold font-mono text-foreground">
                              ${rate.toFixed(2)} / tonne
                            </td>
                          )}
                          {visibleColumns.status && (
                            <td className="px-5 py-4 text-center">
                              <span
                                className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-bold border uppercase tracking-wider ${
                                  c.status === "Active"
                                    ? "bg-success/10 text-success border-success/25"
                                    : "bg-destructive/10 text-destructive border-destructive/25"
                                }`}
                              >
                                {c.status}
                              </span>
                            </td>
                          )}
                          {visibleColumns.actions && (
                            <td className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => onViewCarterDetails(c.id)}
                                  className={TABLE_ACTION_ICON_BUTTON_CLASS}
                                  title="View Carter summary with tabs"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditForm(c)}
                                  className={TABLE_ACTION_ICON_BUTTON_CLASS}
                                  title="Edit Carter parameters"
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
        </>
      )}

      {/* Add / Edit Carter Form Page */}
      {isFormOpen && (
        <FormPage
          icon={Truck}
          title={formMode === "add" ? "Register New Transport Carter" : `Modify Carter Details [${editingCarterId}]`}
          subtitle="Enter carter contact details, transport rate, status and operational notes."
          modeBadge={formMode === "add" ? "Draft Mode" : "Modifying Live Record"}
          saveLabel="Save Carter"
          saveAndAddAnotherLabel="Save & Add Another"
          onCancel={() => setIsFormOpen(false)}
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveCarter(false);
          }}
          onSaveAndAddAnother={formMode === "add" ? () => handleSaveCarter(true) : undefined}
        >
          <div className="p-6 space-y-4">
            <h4 className={FORM_PAGE_SECTION_CLASS}>
              <Truck className="h-4 w-4 text-info" />
              <span>Carter Details</span>
            </h4>

            {/* Carter Name */}
            <div>
              <label className={FORM_PAGE_LABEL_CLASS}>
                Carter Name <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter company/provider name..."
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                className={FORM_PAGE_INPUT_CLASS}
              />
            </div>

            {/* Physical Address */}
            <div>
              <label className={FORM_PAGE_LABEL_CLASS}>Physical Address</label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="E.g., 12 Industrial Parkway, Somerton VIC"
                  value={fieldAddress}
                  onChange={(e) => setFieldAddress(e.target.value)}
                  className={`${FORM_PAGE_INPUT_CLASS} pl-9`}
                />
              </div>
            </div>

            {/* Contact Grid: Phone Number & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={FORM_PAGE_LABEL_CLASS}>Phone Number</label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="E.g., 1300 551 229"
                    value={fieldPhone}
                    onChange={(e) => setFieldPhone(e.target.value)}
                    className={`${FORM_PAGE_INPUT_CLASS} pl-9`}
                  />
                </div>
              </div>

              <div>
                <label className={FORM_PAGE_LABEL_CLASS}>Email Address</label>
                <Input
                  type="email"
                  placeholder="dispatch@company.com"
                  value={fieldEmail}
                  onChange={(e) => setFieldEmail(e.target.value)}
                  className={`${FORM_PAGE_INPUT_CLASS} font-mono`}
                />
              </div>
            </div>

            {/* Rate & Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={FORM_PAGE_LABEL_CLASS}>Transport Rate ($ / Tonne)</label>
                <div className="relative">
                  <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="12.50"
                    value={fieldRate}
                    onChange={(e) => setFieldRate(parseFloat(e.target.value) || 0)}
                    className={`${FORM_PAGE_INPUT_CLASS} pl-9 font-mono`}
                  />
                </div>
              </div>

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
              <label className={FORM_PAGE_LABEL_CLASS}>Carter Notes & Operational Directives</label>
              <Textarea
                placeholder="Enter contract conditions, site limitations, or transport directives..."
                value={fieldNotes}
                onChange={(e) => setFieldNotes(e.target.value)}
                rows={3}
                className={FORM_PAGE_TEXTAREA_CLASS}
              />
            </div>
          </div>
        </FormPage>
      )}

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
              Exporting carters based on selected scope:{" "}
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
                onClick={() => handleExportDataset(exportScope, exportFormat)}
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
