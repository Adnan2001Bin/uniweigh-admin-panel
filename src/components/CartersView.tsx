import React, { useState, useMemo } from "react";
import {
  Truck,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  Check,
  Edit,
  Eye,
  X,
  FileText,
  Phone,
  DollarSign,
  MapPin,
  Calendar
} from "lucide-react";
import { Carrier } from "../types";
import { toast } from "sonner";
import { SelectBox } from "@/src/components/ui/select";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Input } from "@/src/components/ui/input";

const CARTER_FORM_INPUT_CLASS = "h-9 text-xs";
const CARTER_FORM_TEXTAREA_CLASS =
  "w-full rounded-md border border-border bg-card p-2 text-xs focus:ring-1 focus:ring-ring focus:outline-none resize-y min-h-[80px]";
const CARTER_MODAL_ACTION_CLASS =
  "inline-flex h-9 items-center justify-center rounded-md px-4 text-xs font-bold transition select-none";

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
    setExportDropdownOpen(false);
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
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight sm:text-2xl flex items-center gap-2">
            <Truck className="h-6 w-6 text-info" />
            Registered Transport Carters
          </h1>
          <p className="text-xs text-muted-foreground font-bold">
            Administrative registry of freight, fleet cartage carriers, and transport logistics.
          </p>
        </div>

        <button
          onClick={handleOpenAddForm}
          className="bg-primary hover:bg-primary/90 active:scale-95 text-white rounded-md px-4 py-2 text-xs font-bold transition flex items-center gap-2 self-start md:self-auto shadow-sm select-none cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add New Carter
        </button>
      </div>

      {/* Sync ledger simulated notification */}
      {refreshNotification && (
        <div className="bg-success/10 border border-success/25 text-success text-xs font-bold rounded-md p-3.5 flex items-center gap-2 animate-fade-in shadow-xs">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          {refreshNotification}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-card border border-border rounded-md p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          {/* Leftside inputs (Search & filters toggler) */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search carters by name, ID, phone..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-muted border border-border rounded-md pl-9 pr-4 py-2 text-xs font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:bg-card transition"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch("")}
                  className="absolute right-3 top-2.5 hover:text-destructive text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`rounded-md border px-3 py-2 text-xs font-bold transition flex items-center gap-1.5 select-none ${
                showFilters || isFiltersActive
                  ? "bg-info/10 border-info/25 text-info"
                  : "bg-card border-border text-foreground hover:bg-muted"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {isFiltersActive && (
                <span className="bg-primary text-white rounded-full h-4 min-w-4 px-1 text-xs font-bold flex items-center justify-center">
                  !
                </span>
              )}
            </button>
          </div>

          {/* Rightside controls (Column Visibility, Refresh, Export dropdowns) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Column visibility dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowColumnsMenu(!showColumnsMenu)}
                className="rounded-md border border-border bg-card hover:bg-muted px-3 py-2 text-xs font-bold text-foreground transition flex items-center gap-1.5 select-none"
              >
                Column Visibility
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              {showColumnsMenu && (
                <div className="absolute right-0 mt-1.5 w-48 bg-card border border-border rounded-md shadow-lg py-2 z-20 text-xs">
                  <div className="px-3.5 py-1 text-muted-foreground font-bold text-xs uppercase tracking-widest border-b border-border mb-1.5">
                    Toggle Columns
                  </div>
                  {Object.keys(visibleColumns).map((col) => (
                    <button
                      key={col}
                      onClick={() => toggleColumn(col)}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-muted font-bold text-foreground flex items-center justify-between"
                    >
                      <span className="capitalize">{col === "phone" ? "Phone Number" : col === "rate" ? "Transport Rate" : col}</span>
                      {visibleColumns[col] && <Check className="h-3.5 w-3.5 text-info shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Export Dropdown options */}
            <div className="relative">
              <button
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                className="rounded-md border border-border bg-card hover:bg-muted px-3 py-2 text-xs font-bold text-foreground transition flex items-center gap-1.5 select-none"
              >
                <Download className="h-3.5 w-3.5 text-muted-foreground" />
                Export Data
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              {exportDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-60 bg-card border border-border rounded-md shadow-lg py-2 z-20 text-xs">
                  <div className="px-3 py-1 font-bold text-muted-foreground text-xs uppercase tracking-widest border-b border-border mb-1">
                    Export Full Carter List
                  </div>
                  <button
                    onClick={() => handleExportDataset("all", "CSV")}
                    className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2 text-xs"
                  >
                    <FileText className="h-3 w-3 text-success" />
                    Export Full List (CSV)
                  </button>
                  <button
                    onClick={() => handleExportDataset("all", "Excel")}
                    className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2 text-xs"
                  >
                    <FileText className="h-3 w-3 text-info" />
                    Export Full List (Excel)
                  </button>
                  <button
                    onClick={() => handleExportDataset("all", "PDF")}
                    className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2 text-xs"
                  >
                    <FileText className="h-3 w-3 text-destructive" />
                    Print Full List (PDF)
                  </button>

                  <div className="px-3 py-1 font-bold text-muted-foreground text-xs uppercase tracking-widest border-b border-t border-border my-1">
                    Export Selected Rows ({selectedIds.length})
                  </div>
                  <button
                    onClick={() => handleExportDataset("selected", "CSV")}
                    className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2 text-xs disabled:opacity-50"
                    disabled={selectedIds.length === 0}
                  >
                    <FileText className="h-3 w-3 text-success" />
                    Export Selected (CSV)
                  </button>
                  <button
                    onClick={() => handleExportDataset("selected", "PDF")}
                    className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2 text-xs disabled:opacity-50"
                    disabled={selectedIds.length === 0}
                  >
                    <FileText className="h-3 w-3 text-destructive" />
                    Print Selected PDF (PDF)
                  </button>

                  <div className="px-3 py-1 font-bold text-muted-foreground text-xs uppercase tracking-widest border-b border-t border-border my-1">
                    Export Filtered Results ({filteredCarters.length})
                  </div>
                  <button
                    onClick={() => handleExportDataset("filtered", "CSV")}
                    className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2 text-xs"
                  >
                    <FileText className="h-3 w-3 text-success" />
                    Export Filtered (CSV)
                  </button>
                  <button
                    onClick={() => handleExportDataset("filtered", "PDF")}
                    className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2 text-xs"
                  >
                    <FileText className="h-3 w-3 text-destructive" />
                    Print Filtered PDF (PDF)
                  </button>
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              className="rounded-md border border-border bg-card hover:bg-muted p-2 text-xs font-bold text-foreground transition flex items-center justify-center select-none"
              title="Refresh ledger dataset"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${isRefreshing ? "animate-spin text-info" : ""}`} />
            </button>
          </div>
        </div>

        {/* Expandable filters box */}
        {showFilters && (
          <div className="bg-muted border border-border rounded-md p-4 animate-fade-in grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            {/* Filter 1: Status */}
            <div className="space-y-1.5">
              <label className="font-bold text-muted-foreground block">Carter Status</label>
              <SelectBox
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-card border border-border rounded-md p-1.5 font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </SelectBox>
            </div>

            {/* Filter 2: Transport Rate */}
            <div className="space-y-1.5">
              <label className="font-bold text-muted-foreground block">Transport Rate Range</label>
              <SelectBox
                value={filterRateRange}
                onChange={(e) => setFilterRateRange(e.target.value)}
                className="w-full bg-card border border-border rounded-md p-1.5 font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="All">All Rates</option>
                <option value="Low">Low Rates (&lt; $12.00/t)</option>
                <option value="Medium">Medium Rates ($12.00 - $15.00/t)</option>
                <option value="High">High Rates (&gt; $15.00/t)</option>
              </SelectBox>
            </div>

            {/* Filter 3: Created Date */}
            <div className="space-y-1.5">
              <label className="font-bold text-muted-foreground block">Registration Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={filterCreatedDate}
                  onChange={(e) => setFilterCreatedDate(e.target.value)}
                  className="w-full bg-card border border-border rounded-md p-1.5 font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono text-xs"
                />
                {filterCreatedDate && (
                  <button
                    onClick={() => setFilterCreatedDate("")}
                    className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Reset button block */}
            <div className="flex items-end">
              <button
                onClick={handleResetFilters}
                className="w-full bg-secondary hover:bg-input text-foreground font-bold p-2 rounded-md transition select-none text-xs"
              >
                Reset Filter Fields
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Carters Table listing */}
      <div className="bg-card border border-border rounded-md shadow-xs overflow-hidden">
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
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onViewCarterDetails(c.id)}
                              className="rounded-md border border-border hover:border-info/25 bg-card hover:bg-info/10 text-foreground hover:text-info p-1 px-2.5 text-xs font-bold transition flex items-center gap-1 select-none cursor-pointer"
                              title="View Carter summary with tabs"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </button>
                            <button
                              onClick={() => handleOpenEditForm(c)}
                              className="rounded-md border border-border hover:border-warning/30 bg-card hover:bg-warning/10 text-foreground hover:text-warning p-1 px-2.5 text-xs font-bold transition flex items-center gap-1 select-none cursor-pointer"
                              title="Edit Carter parameters"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
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

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-card rounded-md border border-border max-w-lg w-full shadow-lg overflow-hidden animate-zoom-in">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border bg-muted flex items-center justify-between">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Truck className="h-4 w-4 text-info" />
                {formMode === "add" ? "Register New Transport Carter" : `Modify Carter: ${editingCarterId}`}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {/* Carter Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground block">Carter Name *</label>
                <Input
                  type="text"
                  placeholder="Enter company/provider name..."
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  className={`${CARTER_FORM_INPUT_CLASS} font-bold`}
                />
              </div>

              {/* Physical Address */}
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground block">Physical Address</label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="E.g., 12 Industrial Parkway, Somerton VIC"
                    value={fieldAddress}
                    onChange={(e) => setFieldAddress(e.target.value)}
                    className={`${CARTER_FORM_INPUT_CLASS} pl-9 font-semibold`}
                  />
                </div>
              </div>

              {/* Contact Grid: Phone Number & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground block">Phone Number</label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="E.g., 1300 551 229"
                      value={fieldPhone}
                      onChange={(e) => setFieldPhone(e.target.value)}
                      className={`${CARTER_FORM_INPUT_CLASS} pl-9 font-semibold`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground block">Email Address</label>
                  <Input
                    type="email"
                    placeholder="dispatch@company.com"
                    value={fieldEmail}
                    onChange={(e) => setFieldEmail(e.target.value)}
                    className={`${CARTER_FORM_INPUT_CLASS} font-mono font-semibold`}
                  />
                </div>
              </div>

              {/* Rate & Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground block">Transport Rate ($ / Tonne)</label>
                  <div className="relative">
                    <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="12.50"
                      value={fieldRate}
                      onChange={(e) => setFieldRate(parseFloat(e.target.value) || 0)}
                      className={`${CARTER_FORM_INPUT_CLASS} pl-9 font-mono font-bold`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground block">Status</label>
                  <SelectBox
                    value={fieldStatus}
                    onChange={(e) => setFieldStatus(e.target.value as "Active" | "Inactive")}
                    className={CARTER_FORM_INPUT_CLASS}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </SelectBox>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground block">Carter Notes & Operational Directives</label>
                <textarea
                  placeholder="Enter contract conditions, site limitations, or transport directives..."
                  value={fieldNotes}
                  onChange={(e) => setFieldNotes(e.target.value)}
                  rows={3}
                  className={CARTER_FORM_TEXTAREA_CLASS}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-border bg-muted flex flex-wrap items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className={`${CARTER_MODAL_ACTION_CLASS} border border-border bg-card text-foreground hover:bg-muted`}
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                {formMode === "add" && (
                  <button
                    type="button"
                    onClick={() => handleSaveCarter(true)}
                    className={`${CARTER_MODAL_ACTION_CLASS} gap-1 border border-info/25 bg-info/10 text-info hover:bg-info/10`}
                  >
                    <Plus className="h-3.5 w-3.5 shrink-0" />
                    Save & Add Another
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleSaveCarter(false)}
                  className={`${CARTER_MODAL_ACTION_CLASS} bg-primary px-5 text-white hover:bg-primary/90 shadow-xs active:scale-95`}
                >
                  Save Carter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
