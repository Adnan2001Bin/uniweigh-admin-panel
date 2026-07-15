import React, { useState, useMemo, useEffect } from "react";
import {
  MapPin,
  Eye,
  Edit,
  Plus,
  Search,
  Download,
  Check,
  X,
  Filter,
  FileText,
  Activity,
  ArrowLeft,
  Building,
  Phone,
  FileSpreadsheet,
  AlertCircle,
  ChevronDown,
  RefreshCw
} from "lucide-react";
import { Destination, Customer, Job, Transaction, TransactionStatus } from "../types";
import { INITIAL_DESTINATIONS } from "../data_destinations";
import { motion, AnimatePresence } from "motion/react";
import { SelectBox } from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import { Checkbox } from "@/src/components/ui/checkbox";
import { RadioBox } from "@/src/components/ui/radio-group";
import PageHeader, { PAGE_HEADER_ADD_BUTTON_CLASS } from "@/src/components/shared/PageHeader";
import StatusBadge from "@/src/components/shared/StatusBadge";
import { TABLE_ACTION_ICON_BUTTON_CLASS } from "@/src/components/shared/table-action-styles";

const DESTINATION_FORM_INPUT_CLASS = "h-9 text-xs font-semibold bg-muted";
const DESTINATION_FORM_SELECT_CLASS = "w-full text-xs font-semibold bg-muted";
const DESTINATION_FORM_TEXTAREA_CLASS =
  "w-full min-h-[80px] resize-y rounded-md border border-border bg-muted px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring";
const DESTINATION_FORM_ACTION_CLASS =
  "inline-flex h-9 items-center justify-center rounded-md text-xs font-bold transition cursor-pointer";

interface DestinationsViewProps {
  customers: Customer[];
  jobs: Job[];
  transactions: Transaction[];
  onViewTicketDetails: (ticketId: string) => void;
  searchQuery: string;
}

export default function DestinationsView({
  customers,
  jobs,
  transactions,
  onViewTicketDetails,
  searchQuery: externalSearchQuery
}: DestinationsViewProps) {
  // Destinations State (with LocalStorage persistence)
  const [destinations, setDestinations] = useState<Destination[]>(() => {
    const saved = localStorage.getItem("uniweigh_destinations");
    return saved ? JSON.parse(saved) : INITIAL_DESTINATIONS;
  });

  useEffect(() => {
    localStorage.setItem("uniweigh_destinations", JSON.stringify(destinations));
  }, [destinations]);

  // UI state
  // Navigation: 'list' | 'add' | 'edit' | 'detail'
  const [currentMode, setCurrentMode] = useState<"list" | "add" | "edit" | "detail">("list");
  const [selectedDestId, setSelectedDestId] = useState<string | null>(null);
  const [checkedDestIds, setCheckedDestIds] = useState<string[]>([]);
  
  // Detail page Tab: 'transactions' | 'jobs'
  const [detailTab, setDetailTab] = useState<"transactions" | "jobs">("transactions");

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [customerFilter, setCustomerFilter] = useState<string>("All");
  const [localSearchQuery, setLocalSearchQuery] = useState<string>("");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Export Modal state
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [exportScope, setExportScope] = useState<"current" | "selected" | "filtered" | "individual-summary" | "destination-transactions">("current");
  const [exportFormat, setExportFormat] = useState<"CSV" | "Excel" | "PDF">("CSV");

  // Form Field States
  const [formName, setFormName] = useState("");
  const [formCustomerId, setFormCustomerId] = useState("");
  const [formJobId, setFormJobId] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formStatus, setFormStatus] = useState<"Active" | "Inactive">("Active");
  const [formAddressLine1, setFormAddressLine1] = useState("");
  const [formAddressLine2, setFormAddressLine2] = useState("");
  const [formSuburb, setFormSuburb] = useState("");
  const [formState, setFormState] = useState("");
  const [formPostcode, setFormPostcode] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Automatically filter Jobs when Customer changes in the Add/Edit form
  const availableJobsForFormCustomer = useMemo(() => {
    if (!formCustomerId) return [];
    return jobs.filter((j) => j.customerId === formCustomerId);
  }, [formCustomerId, jobs]);

  // Keep Form Job ID valid based on selected Customer
  useEffect(() => {
    if (availableJobsForFormCustomer.length > 0) {
      // If current formJobId is not in the filtered jobs, set to first available
      const exists = availableJobsForFormCustomer.some((j) => j.id === formJobId);
      if (!exists) {
        setFormJobId(availableJobsForFormCustomer[0].id);
      }
    } else {
      setFormJobId("");
    }
  }, [formCustomerId, availableJobsForFormCustomer, formJobId]);

  // Combined Search
  const activeSearchQuery = externalSearchQuery || localSearchQuery;

  // Filtered Destinations for list
  const filteredDestinations = useMemo(() => {
    return destinations.filter((d) => {
      const q = activeSearchQuery.toLowerCase();
      const matchesSearch =
        d.id.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q) ||
        d.customerName.toLowerCase().includes(q) ||
        d.jobRef.toLowerCase().includes(q) ||
        d.suburb.toLowerCase().includes(q) ||
        d.phone.includes(q);

      const matchesStatus = statusFilter === "All" || d.status === statusFilter;
      const matchesCustomer = customerFilter === "All" || d.customerId === customerFilter;

      return matchesSearch && matchesStatus && matchesCustomer;
    });
  }, [destinations, activeSearchQuery, statusFilter, customerFilter]);

  const hasDestFilters = statusFilter !== "All" || customerFilter !== "All";

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const resetDestFilters = () => {
    setStatusFilter("All");
    setCustomerFilter("All");
    setLocalSearchQuery("");
  };

  // Currently Selected/Active Destination Object
  const activeDestination = useMemo(() => {
    if (!selectedDestId) return null;
    return destinations.find((d) => d.id === selectedDestId) || null;
  }, [selectedDestId, destinations]);

  // Transactions linked to active destination (linked via Job ID)
  const linkedTransactions = useMemo(() => {
    if (!activeDestination) return [];
    return transactions.filter((t) => t.jobOrder === activeDestination.jobId);
  }, [activeDestination, transactions]);

  // Job linked to active destination
  const linkedJob = useMemo(() => {
    if (!activeDestination) return null;
    return jobs.find((j) => j.id === activeDestination.jobId) || null;
  }, [activeDestination, jobs]);

  // Delivered and Remaining values for the linked job
  const jobMetrics = useMemo(() => {
    if (!linkedJob) return { delivered: 0, remaining: 0 };
    const delWeight = transactions
      .filter(
        (tx) =>
          tx.jobOrder === linkedJob.id &&
          (tx.status === TransactionStatus.APPROVED ||
            tx.status === TransactionStatus.INVOICED ||
            tx.status === TransactionStatus.COMMITTED)
      )
      .reduce((sum, tx) => sum + (tx.netWeight || 0), 0);
    const delivered = Number(delWeight.toFixed(2));
    const remaining = Number(Math.max(0, linkedJob.orderQty - delivered).toFixed(2));
    return { delivered, remaining };
  }, [linkedJob, transactions]);

  // Helper: Open Add Form
  const handleOpenAdd = () => {
    // Generate new Destination ID
    const nextNum = destinations.length + 1;
    const nextId = `DEST-2026-${nextNum.toString().padStart(2, "0")}`;
    
    // Set defaults
    setFormName("");
    const defaultCust = customers[0]?.id || "";
    setFormCustomerId(defaultCust);
    const matchingJobs = jobs.filter((j) => j.customerId === defaultCust);
    setFormJobId(matchingJobs[0]?.id || "");
    setFormPhone("");
    setFormStatus("Active");
    setFormAddressLine1("");
    setFormAddressLine2("");
    setFormSuburb("");
    setFormState("VIC");
    setFormPostcode("");
    setFormNotes("");

    setCurrentMode("add");
  };

  // Helper: Open Edit Form
  const handleOpenEdit = (dest: Destination) => {
    setSelectedDestId(dest.id);
    setFormName(dest.name);
    setFormCustomerId(dest.customerId);
    setFormJobId(dest.jobId);
    setFormPhone(dest.phone);
    setFormStatus(dest.status);
    setFormAddressLine1(dest.addressLine1);
    setFormAddressLine2(dest.addressLine2 || "");
    setFormSuburb(dest.suburb);
    setFormState(dest.state);
    setFormPostcode(dest.postcode);
    setFormNotes(dest.notes || "");

    setCurrentMode("edit");
  };

  // Save Destination
  const handleSaveDestination = (e?: React.FormEvent, isAddAnother = false) => {
    if (e) e.preventDefault();

    if (!formName.trim()) {
      showToast("Error: Destination Name is required.");
      return;
    }
    if (!formCustomerId) {
      showToast("Error: Customer selection is required.");
      return;
    }
    if (!formJobId) {
      showToast("Error: Associated Job order is required.");
      return;
    }
    if (!formAddressLine1.trim() || !formSuburb.trim() || !formState.trim() || !formPostcode.trim()) {
      showToast("Error: Core Address fields are required.");
      return;
    }

    const selectedCustObj = customers.find((c) => c.id === formCustomerId);
    const selectedJobObj = jobs.find((j) => j.id === formJobId);

    if (currentMode === "add") {
      const nextNum = destinations.length + 1;
      const nextId = `DEST-2026-${nextNum.toString().padStart(2, "0")}`;

      const newDest: Destination = {
        id: nextId,
        name: formName,
        jobId: formJobId,
        jobRef: selectedJobObj?.customerOrderRef || formJobId,
        customerId: formCustomerId,
        customerName: selectedCustObj?.name || "Unknown Customer",
        phone: formPhone,
        status: formStatus,
        addressLine1: formAddressLine1,
        addressLine2: formAddressLine2 || undefined,
        suburb: formSuburb,
        state: formState,
        postcode: formPostcode,
        notes: formNotes || undefined
      };

      setDestinations((prev) => [...prev, newDest]);
      showToast(`Destination [${nextId}] successfully registered.`);

      if (isAddAnother) {
        // Reset form for next entry but keep Customer and Job if helpful
        setFormName("");
        setFormPhone("");
        setFormAddressLine1("");
        setFormAddressLine2("");
        setFormSuburb("");
        setFormPostcode("");
        setFormNotes("");
      } else {
        setCurrentMode("list");
      }
    } else {
      // Edit mode
      if (!selectedDestId) return;

      const updatedDestinations = destinations.map((d) => {
        if (d.id === selectedDestId) {
          return {
            ...d,
            name: formName,
            jobId: formJobId,
            jobRef: selectedJobObj?.customerOrderRef || formJobId,
            customerId: formCustomerId,
            customerName: selectedCustObj?.name || "Unknown Customer",
            phone: formPhone,
            status: formStatus,
            addressLine1: formAddressLine1,
            addressLine2: formAddressLine2 || undefined,
            suburb: formSuburb,
            state: formState,
            postcode: formPostcode,
            notes: formNotes || undefined
          };
        }
        return d;
      });

      setDestinations(updatedDestinations);
      showToast(`Destination [${selectedDestId}] successfully updated.`);
      setCurrentMode("list");
      setSelectedDestId(null);
    }
  };

  // Checkbox functions
  const handleToggleCheckAll = () => {
    if (checkedDestIds.length === filteredDestinations.length) {
      setCheckedDestIds([]);
    } else {
      setCheckedDestIds(filteredDestinations.map((d) => d.id));
    }
  };

  const handleToggleCheckOne = (id: string) => {
    if (checkedDestIds.includes(id)) {
      setCheckedDestIds((prev) => prev.filter((x) => x !== id));
    } else {
      setCheckedDestIds((prev) => [...prev, id]);
    }
  };

  // Export processing
  const triggerExport = () => {
    let dataset: any[] = [];
    let headers: string[] = [];
    let reportTitle = "";

    if (exportScope === "current") {
      dataset = destinations;
      headers = ["Destination ID", "Destination Name", "Job Reference", "Customer Name", "Phone", "Address Line 1", "Address Line 2", "Suburb", "State", "Postcode", "Status", "Notes"];
      reportTitle = "Uniweigh_All_Destinations_Report";
    } else if (exportScope === "filtered") {
      dataset = filteredDestinations;
      headers = ["Destination ID", "Destination Name", "Job Reference", "Customer Name", "Phone", "Address Line 1", "Address Line 2", "Suburb", "State", "Postcode", "Status", "Notes"];
      reportTitle = `Uniweigh_Filtered_Destinations_Report_${statusFilter}_${customerFilter}`;
    } else if (exportScope === "selected") {
      dataset = destinations.filter((d) => checkedDestIds.includes(d.id));
      if (dataset.length === 0) {
        showToast("Error: No destinations selected for export.");
        setShowExportModal(false);
        return;
      }
      headers = ["Destination ID", "Destination Name", "Job Reference", "Customer Name", "Phone", "Address Line 1", "Address Line 2", "Suburb", "State", "Postcode", "Status", "Notes"];
      reportTitle = "Uniweigh_Selected_Destinations_Report";
    } else if (exportScope === "individual-summary") {
      if (!activeDestination) {
        showToast("Error: No active destination loaded for summary export.");
        setShowExportModal(false);
        return;
      }
      dataset = [activeDestination];
      headers = ["Destination ID", "Destination Name", "Job Reference", "Customer Name", "Phone", "Address Line 1", "Address Line 2", "Suburb", "State", "Postcode", "Status", "Notes"];
      reportTitle = `Uniweigh_Destination_Summary_${activeDestination.id}`;
    } else if (exportScope === "destination-transactions") {
      if (!activeDestination) {
        showToast("Error: No active destination loaded for transactions export.");
        setShowExportModal(false);
        return;
      }
      dataset = linkedTransactions;
      headers = ["Transaction ID", "Type", "Ticket Number", "Transaction Code", "Customer", "Job Order", "Product", "Lot Number", "Net Weight", "Total Value", "Status", "Timestamp"];
      reportTitle = `Uniweigh_Transactions_Destination_${activeDestination.id}`;
    }

    const fileDateStr = new Date().toISOString().split("T")[0];
    const fullFileName = `${reportTitle}_${fileDateStr}`;

    if (exportFormat === "CSV" || exportFormat === "Excel") {
      // Build text rows
      const fileHeadersLine = headers.join(",");
      let rowsLines: string[] = [];

      if (exportScope === "destination-transactions") {
        rowsLines = (dataset as Transaction[]).map((t) => {
          return [
            t.id,
            t.type,
            t.ticketNo,
            t.transactionCode || "N/A",
            `"${t.customerName.replace(/"/g, '""')}"`,
            t.jobOrder,
            `"${t.productName.replace(/"/g, '""')}"`,
            t.lotNo || "N/A",
            t.netWeight,
            t.totalValue,
            t.status,
            t.firstWeighTime || "N/A"
          ].join(",");
        });
      } else {
        rowsLines = (dataset as Destination[]).map((d) => {
          const fullAddr2 = d.addressLine2 || "";
          return [
            d.id,
            `"${d.name.replace(/"/g, '""')}"`,
            d.jobId,
            `"${d.customerName.replace(/"/g, '""')}"`,
            `"${d.phone}"`,
            `"${d.addressLine1.replace(/"/g, '""')}"`,
            `"${fullAddr2.replace(/"/g, '""')}"`,
            `"${d.suburb}"`,
            `"${d.state}"`,
            `"${d.postcode}"`,
            d.status,
            `"${(d.notes || "").replace(/"/g, '""')}"`
          ].join(",");
        });
      }

      const csvContent = "data:text/csv;charset=utf-8," + [fileHeadersLine, ...rowsLines].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${fullFileName}.${exportFormat === "Excel" ? "xls" : "csv"}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Successfully downloaded ${exportFormat} export report: ${dataset.length} items.`);
    } else {
      // PDF Mock Representation - Beautiful text based printable document (.txt format)
      let printContent = `
====================================================================================
           UNIWEIGH SYSTEMS - ENTERPRISE BUSINESS GATEWAY LOGISTICS REPORT
====================================================================================
Report Title: ${reportTitle.replace(/_/g, " ")}
Generated On: ${new Date().toLocaleString()}
Export Format: PDF (Document Raw Format)
Records Count: ${dataset.length}
====================================================================================

`;

      if (exportScope === "destination-transactions") {
        printContent += `TRANSACTIONS LEDGER ASSOCIATED WITH DESTINATION: ${activeDestination?.name} (${activeDestination?.id})
------------------------------------------------------------------------------------\n`;
        printContent += String("").padEnd(14) + " | " + String("TICKET").padEnd(10) + " | " + String("TYPE").padEnd(8) + " | " + String("PRODUCT").padEnd(25) + " | " + String("NET WT").padStart(10) + " | " + String("AMOUNT").padStart(12) + " | " + "STATUS\n";
        printContent += "-".repeat(95) + "\n";
        (dataset as Transaction[]).forEach((t) => {
          printContent += `${t.id.padEnd(14)} | ${t.ticketNo.padEnd(10)} | ${t.type.padEnd(8)} | ${t.productName.substring(0, 25).padEnd(25)} | ${String(t.netWeight.toFixed(2) + " t").padStart(10)} | ${String("$" + t.totalValue.toFixed(2)).padStart(12)} | ${t.status}\n`;
        });
      } else {
        printContent += `DESTINATIONS MASTER FILE DATA
------------------------------------------------------------------------------------\n`;
        (dataset as Destination[]).forEach((d) => {
          printContent += `
[${d.id}] ${d.name}
--------------------------------------------------------
Customer:  ${d.customerName} (${d.customerId})
Job Code:  ${d.jobId} (Ref: ${d.jobRef})
Telephone: ${d.phone}
Status:    ${d.status}
Address:   ${d.addressLine1}
           ${d.addressLine2 ? d.addressLine2 + "\n           " : ""}${d.suburb}, ${d.state} ${d.postcode}
Notes:     ${d.notes || "None registered"}
--------------------------------------------------------
`;
        });
      }

      const blob = new Blob([printContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fullFileName}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast("Successfully downloaded printable PDF report (TXT format, simulated PDF).");
    }

    setShowExportModal(false);
  };

  return (
    <div className="space-y-6" id="destinations-module-container">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-2.5 rounded-md bg-primary px-4 py-3 text-xs font-semibold text-white shadow-lg border border-primary"
          >
            <Check className="h-4 w-4 text-success shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <PageHeader
        title="Destinations"
        icon={MapPin}
        breadcrumbs={[
          { label: "Customers & Sales" },
          { label: "Destinations Directory" },
        ]}
        actions={
          currentMode === "list" ? (
            <button
              type="button"
              onClick={handleOpenAdd}
              className={PAGE_HEADER_ADD_BUTTON_CLASS}
              id="btn-add-destination"
            >
              <Plus className="h-4 w-4" />
              <span>Add Destination</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setCurrentMode("list");
                setSelectedDestId(null);
              }}
              className={`${DESTINATION_FORM_ACTION_CLASS} gap-2 border border-border bg-card px-3 text-foreground shadow-xs hover:bg-muted`}
              id="btn-back-to-listing"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              <span>Back to Listing</span>
            </button>
          )
        }
      />

      <AnimatePresence mode="wait">
        {/* ======================= MODE 1: DESTINATIONS LISTING PAGE ======================= */}
        {currentMode === "list" && (
          <motion.div
            key="destinations-list-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* SEARCH AND FILTERS TOOLBAR — Products pattern */}
            <div className="bg-card border border-border rounded-md p-4 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                  <div className="relative w-64">
                    <input
                      type="text"
                      placeholder="Search destinations..."
                      value={localSearchQuery}
                      onChange={(e) => setLocalSearchQuery(e.target.value)}
                      className="w-full bg-muted border border-border hover:border-input focus:bg-card rounded-md pl-3 pr-8 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    {localSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setLocalSearchQuery("")}
                        className="absolute right-2.5 top-2 text-muted-foreground hover:text-muted-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                    className={`rounded-md border px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 select-none ${
                      isFilterExpanded || hasDestFilters
                        ? "bg-info/10 border-info/25 text-info hover:bg-info/10"
                        : "bg-card border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    <Filter className="h-3.5 w-3.5" />
                    Filters
                    {hasDestFilters && (
                      <span className="bg-primary text-white font-mono text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {[statusFilter !== "All", customerFilter !== "All"].filter(Boolean).length}
                      </span>
                    )}
                  </button>

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

              {(isFilterExpanded || hasDestFilters) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-muted border border-border p-3.5 rounded-md text-xs">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                      Status
                    </label>
                    <SelectBox
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full rounded-md border border-border bg-card p-1.5 text-xs font-semibold focus:outline-none"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </SelectBox>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                      Customer
                    </label>
                    <SelectBox
                      value={customerFilter}
                      onChange={(e) => setCustomerFilter(e.target.value)}
                      className="w-full rounded-md border border-border bg-card p-1.5 text-xs font-semibold focus:outline-none"
                    >
                      <option value="All">All Customers</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </SelectBox>
                  </div>

                  <div className="sm:col-span-2 md:col-span-4 flex justify-end gap-1.5 pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={resetDestFilters}
                      className="text-muted-foreground hover:text-foreground font-bold px-2 py-1 text-xs"
                    >
                      Reset All Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* DESTINATIONS TABLE LEDGER */}
            <div className="bg-card border border-border rounded-md shadow-xs overflow-hidden">
              {/* Table summary / selection bar — matches Transactions */}
              <div className="border-b border-border px-5 py-3 flex items-center justify-between bg-muted min-h-[56px]">
                {checkedDestIds.length > 0 ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2.5 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-xs">
                        {checkedDestIds.length}
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        Destination(s) selected
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowExportMenu(!showExportMenu)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-foreground bg-card border border-border hover:bg-muted cursor-pointer shadow-xs transition"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Export
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        {showExportMenu && (
                          <div className="absolute right-0 mt-1.5 w-64 z-50 rounded-md border border-border bg-card py-2 shadow-lg animate-fade-in text-xs text-foreground">
                            <div className="px-3 py-1.5 border-b border-border bg-muted text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Select Export Scope
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setShowExportMenu(false);
                                setExportScope("selected");
                                setShowExportModal(true);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-muted font-semibold"
                            >
                              Export Selected ({checkedDestIds.length})
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowExportMenu(false);
                                setExportScope("filtered");
                                setShowExportModal(true);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-muted"
                            >
                              Export Filtered Results ({filteredDestinations.length})
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowExportMenu(false);
                                setExportScope("current");
                                setShowExportModal(true);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-muted"
                            >
                              Export All Records ({destinations.length})
                            </button>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setCheckedDestIds([])}
                        className="text-xs font-bold text-muted-foreground hover:text-foreground px-2.5 py-1.5 border border-border rounded-md hover:bg-card cursor-pointer transition"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full gap-3">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Showing {filteredDestinations.length} of {destinations.length} records found
                      {(hasDestFilters || !!localSearchQuery.trim()) && (
                        <span className="ml-1.5 text-foreground font-bold">· Filtered view</span>
                      )}
                    </span>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer transition"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Export Records</span>
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      {showExportMenu && (
                        <div className="absolute right-0 mt-1.5 w-64 z-50 rounded-md border border-border bg-card py-2 shadow-lg animate-fade-in text-xs text-foreground">
                          <div className="px-3 py-1.5 border-b border-border bg-muted text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Select Export Scope
                          </div>
                          <button
                            type="button"
                            disabled={checkedDestIds.length === 0}
                            onClick={() => {
                              if (checkedDestIds.length === 0) return;
                              setShowExportMenu(false);
                              setExportScope("selected");
                              setShowExportModal(true);
                            }}
                            className={`w-full text-left px-3 py-2 hover:bg-muted ${
                              checkedDestIds.length === 0 ? "opacity-40 cursor-not-allowed" : "font-semibold"
                            }`}
                          >
                            Export Selected ({checkedDestIds.length})
                            {checkedDestIds.length === 0 && (
                              <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                                Check rows in the table first
                              </span>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowExportMenu(false);
                              setExportScope("filtered");
                              setShowExportModal(true);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-muted"
                          >
                            Export Filtered Results ({filteredDestinations.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowExportMenu(false);
                              setExportScope("current");
                              setShowExportModal(true);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-muted"
                          >
                            Export All Records ({destinations.length})
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse" id="destinations-table">
                  <thead>
                    <tr className="bg-muted border-b border-border text-xs font-bold uppercase text-muted-foreground tracking-wider">
                      <th className="px-4 py-3 text-center w-10">
                        <Checkbox checked={filteredDestinations.length > 0 && checkedDestIds.length === filteredDestinations.length} onCheckedChange={(checked) => ((handleToggleCheckAll) as any)({ target: { checked } })} className="rounded text-info focus:ring-ring cursor-pointer" />
                      </th>
                      <th className="px-4 py-3">Destination ID</th>
                      <th className="px-4 py-3">Destination Name</th>
                      <th className="px-4 py-3">Job</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Address</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs font-semibold text-foreground">
                    {filteredDestinations.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground font-medium">
                          No destinations matched the given filters or search inputs.
                        </td>
                      </tr>
                    ) : (
                      filteredDestinations.map((d) => {
                        const isChecked = checkedDestIds.includes(d.id);
                        const formattedAddress = `${d.addressLine1}${d.addressLine2 ? ", " + d.addressLine2 : ""}, ${d.suburb} ${d.state} ${d.postcode}`;
                        return (
                          <tr
                            key={d.id}
                            className={`hover:bg-muted transition-colors ${
                              isChecked ? "bg-info/10" : ""
                            }`}
                          >
                            {/* Checkbox */}
                            <td className="px-4 py-3.5 text-center">
                              <Checkbox checked={isChecked} onCheckedChange={(checked) => ((() => handleToggleCheckOne(d.id)) as any)({ target: { checked } })} className="rounded text-info focus:ring-ring cursor-pointer" />
                            </td>

                            {/* Destination ID */}
                            <td className="px-4 py-3.5 font-mono text-info">
                              {d.id}
                            </td>

                            {/* Destination Name */}
                            <td className="px-4 py-3.5 text-foreground font-bold max-w-[200px] truncate">
                              {d.name}
                            </td>

                            {/* Linked Job */}
                            <td className="px-4 py-3.5">
                              <span className="inline-flex items-center gap-1 bg-muted text-foreground px-2 py-0.5 rounded-full font-mono text-xs">
                                {d.jobId}
                              </span>
                              <span className="block text-xs text-muted-foreground font-medium mt-0.5">
                                Ref: {d.jobRef}
                              </span>
                            </td>

                            {/* Customer */}
                            <td className="px-4 py-3.5 text-muted-foreground font-medium max-w-[160px] truncate">
                              {d.customerName}
                            </td>

                            {/* Address */}
                            <td className="px-4 py-3.5 text-muted-foreground max-w-[220px] truncate" title={formattedAddress}>
                              {formattedAddress}
                            </td>

                            {/* Phone */}
                            <td className="px-4 py-3.5 text-muted-foreground font-mono">
                              {d.phone || <span className="text-muted-foreground">N/A</span>}
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3.5 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                  d.status === "Active"
                                    ? "bg-success/10 text-success border border-success/25"
                                    : "bg-destructive/10 text-destructive border border-destructive/25"
                                }`}
                              >
                                {d.status}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedDestId(d.id);
                                    setDetailTab("transactions");
                                    setCurrentMode("detail");
                                  }}
                                  className={TABLE_ACTION_ICON_BUTTON_CLASS}
                                  title="View Destination Summary & Logs"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(d)}
                                  className={TABLE_ACTION_ICON_BUTTON_CLASS}
                                  title="Edit Destination Parameters"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="bg-muted border-t border-border px-4 py-3 text-xs text-muted-foreground font-medium">
                Showing <span className="font-bold text-foreground">{filteredDestinations.length}</span> of{" "}
                <span className="font-bold text-foreground">{destinations.length}</span> logistics destinations.
              </div>
            </div>
          </motion.div>
        )}

        {/* ======================= MODE 2: ADD / EDIT DESTINATION FORM ======================= */}
        {(currentMode === "add" || currentMode === "edit") && (
          <motion.form
            key="destinations-form-mode"
            onSubmit={(e) => handleSaveDestination(e, false)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
            id="destination-entry-form"
          >
            <div className="bg-card border border-border rounded-md shadow-xs overflow-hidden">
              <div className="bg-muted border-b border-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-info/10 text-info">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                      {currentMode === "add" ? "Register New Destination" : `Modify Destination Details [${selectedDestId}]`}
                    </h3>
                    <p className="text-xs text-muted-foreground">Provide geographical address, customer mappings, and notes.</p>
                  </div>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {currentMode === "add" ? "Draft Mode" : "Modifying Live Record"}
                </span>
              </div>

              {/* SECTION 1: DESTINATION DETAILS */}
              <div className="p-6 space-y-4">
                <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
                  <Building className="h-4 w-4 text-info" />
                  <span>Destination Details</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Destination Name */}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Destination Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Altona North Aggregate Plant"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className={DESTINATION_FORM_INPUT_CLASS}
                    />
                  </div>

                  {/* Customer Selection */}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Associated Customer <span className="text-destructive">*</span>
                    </label>
                    <SelectBox
                      value={formCustomerId}
                      onChange={(e) => setFormCustomerId(e.target.value)}
                      className={DESTINATION_FORM_SELECT_CLASS}
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          [{c.id}] {c.name}
                        </option>
                      ))}
                    </SelectBox>
                  </div>

                  {/* Job Selection (Filtered by Customer) */}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Associated Job <span className="text-destructive">*</span>
                    </label>
                    <SelectBox
                      value={formJobId}
                      onChange={(e) => setFormJobId(e.target.value)}
                      className={DESTINATION_FORM_SELECT_CLASS}
                    >
                      {availableJobsForFormCustomer.length === 0 ? (
                        <option value="">-- No jobs active for this customer --</option>
                      ) : (
                        availableJobsForFormCustomer.map((j) => (
                          <option key={j.id} value={j.id}>
                            [{j.id}] Contract Ref: {j.customerOrderRef} ({j.productName})
                          </option>
                        ))
                      )}
                    </SelectBox>
                    {availableJobsForFormCustomer.length === 0 && (
                      <p className="text-xs text-warning mt-1">
                        Please register a Job for this customer first in the Jobs tab.
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Telephone / Site Dispatch Phone
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. +61 3 9522 9900"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className={DESTINATION_FORM_INPUT_CLASS}
                    />
                  </div>

                  {/* Status Selection */}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <SelectBox
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className={DESTINATION_FORM_SELECT_CLASS}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </SelectBox>
                  </div>
                </div>
              </div>

              {/* SECTION 2: ADDRESS DETAILS */}
              <div className="p-6 space-y-4 bg-muted border-t border-border">
                <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
                  <MapPin className="h-4 w-4 text-success" />
                  <span>Address Details</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Address Line 1 */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Address Line 1 <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. 102 Quarry Rd"
                      value={formAddressLine1}
                      onChange={(e) => setFormAddressLine1(e.target.value)}
                      className={DESTINATION_FORM_INPUT_CLASS}
                    />
                  </div>

                  {/* Address Line 2 */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Address Line 2 (Optional)
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Gate 4 entrance next to silo"
                      value={formAddressLine2}
                      onChange={(e) => setFormAddressLine2(e.target.value)}
                      className={DESTINATION_FORM_INPUT_CLASS}
                    />
                  </div>

                  {/* Suburb */}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Suburb <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Lilydale"
                      value={formSuburb}
                      onChange={(e) => setFormSuburb(e.target.value)}
                      className={DESTINATION_FORM_INPUT_CLASS}
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      State <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. VIC"
                      value={formState}
                      onChange={(e) => setFormState(e.target.value)}
                      className={DESTINATION_FORM_INPUT_CLASS}
                    />
                  </div>

                  {/* Postcode */}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Postcode <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. 3140"
                      value={formPostcode}
                      onChange={(e) => setFormPostcode(e.target.value)}
                      className={DESTINATION_FORM_INPUT_CLASS}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: NOTES */}
              <div className="p-6 space-y-4 border-t border-border">
                <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
                  <FileText className="h-4 w-4 text-warning" />
                  <span>Operational & Dispatch Notes</span>
                </h4>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide logistics comments, special entrance instructions, speed limits, or restrictions..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className={DESTINATION_FORM_TEXTAREA_CLASS}
                  />
                </div>
              </div>

              {/* ACTION BUTTON BAR */}
              <div className="bg-muted border-t border-border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest font-mono">
                  * MANDATORY FLDS
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentMode("list");
                      setSelectedDestId(null);
                    }}
                    className={`${DESTINATION_FORM_ACTION_CLASS} border border-border bg-card px-4 text-foreground shadow-xs hover:bg-muted`}
                  >
                    Cancel
                  </button>

                  {currentMode === "add" && (
                    <button
                      type="button"
                      onClick={() => handleSaveDestination(undefined, true)}
                      className={`${DESTINATION_FORM_ACTION_CLASS} gap-1 border border-info/25 bg-info/10 px-5 text-info hover:bg-info/10`}
                    >
                      <Plus className="h-4 w-4 shrink-0" />
                      <span>Save & Add Another</span>
                    </button>
                  )}

                  <button
                    type="submit"
                    className={`${DESTINATION_FORM_ACTION_CLASS} bg-primary px-5 text-white shadow-sm hover:bg-primary/90`}
                  >
                    Save Destination
                  </button>
                </div>
              </div>
            </div>
          </motion.form>
        )}

        {/* ======================= MODE 3: DESTINATION VIEW PAGE (DETAIL) ======================= */}
        {currentMode === "detail" && activeDestination && (
          <motion.div
            key="destinations-detail-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
            id="destination-summary-sheet"
          >
            {/* Hero header card */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card border border-border rounded-md px-6 py-5 shadow-xs">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-muted border border-border text-info flex items-center justify-center font-mono font-bold text-lg shadow-inner shrink-0">
                  {activeDestination.id.substring(activeDestination.id.length - 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      System ID: {activeDestination.id}
                    </span>
                    <StatusBadge status={activeDestination.status} className="rounded-md" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 mt-1">
                    <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                      {activeDestination.name}
                    </h1>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground bg-muted border border-border rounded-md px-2.5 py-1 select-none">
                      <Building className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{activeDestination.customerName}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 self-start md:self-center items-center">
                <button
                  type="button"
                  onClick={() => {
                    setExportScope("individual-summary");
                    setShowExportModal(true);
                  }}
                  className={`${DESTINATION_FORM_ACTION_CLASS} gap-1.5 border border-border bg-card px-3.5 text-foreground shadow-xs hover:bg-muted`}
                  title="Export destination profile report"
                >
                  <Download className="h-4 w-4 shrink-0" />
                  <span>Export Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(activeDestination)}
                  className={`${DESTINATION_FORM_ACTION_CLASS} gap-1.5 border border-primary bg-primary px-3.5 text-primary-foreground shadow-xs hover:bg-primary/90`}
                >
                  <Edit className="h-4 w-4 shrink-0" />
                  <span>Edit Destination</span>
                </button>
              </div>
            </div>

            {/* Main grid: left metadata (4) + right address profile (8) */}
            <div className="grid gap-6 lg:grid-cols-12 items-start">
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-card border border-border rounded-md p-5 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border pb-2">
                    Destination Details
                  </h3>
                  <div className="space-y-4 text-sm text-foreground font-normal">
                    <div className="flex items-start gap-2.5">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-muted-foreground font-semibold mb-0.5">Destination ID</div>
                        <div className="font-mono font-bold text-foreground">{activeDestination.id}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-muted-foreground font-semibold mb-0.5">Destination Name</div>
                        <div className="font-bold text-foreground">{activeDestination.name}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <FileSpreadsheet className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-muted-foreground font-semibold mb-0.5">Linked Job</div>
                        <span className="inline-flex items-center font-mono font-bold text-foreground bg-muted border border-border px-1.5 py-0.5 rounded-sm text-xs mt-0.5">
                          {activeDestination.jobId} (Ref: {activeDestination.jobRef})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Building className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-muted-foreground font-semibold mb-0.5">Customer</div>
                        <div className="font-bold text-foreground">{activeDestination.customerName}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-muted-foreground font-semibold mb-0.5">Phone</div>
                        <div className="font-mono font-semibold text-foreground">
                          {activeDestination.phone || "N/A"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-muted-foreground font-semibold mb-0.5">Status</div>
                        <StatusBadge status={activeDestination.status} className="mt-0.5 rounded-md" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted border border-border rounded-md p-4 text-xs space-y-2">
                  <span className="font-bold text-foreground block uppercase tracking-wider text-xs">
                    Site Snapshot
                  </span>
                  <div className="space-y-1.5 font-medium">
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Linked Transactions:</span>
                      <span className="text-foreground font-mono font-bold">{linkedTransactions.length}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Linked Jobs:</span>
                      <span className="text-foreground font-mono font-bold">{linkedJob ? 1 : 0}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Site State:</span>
                      <span className={activeDestination.status === "Active" ? "text-success font-bold" : "text-destructive font-bold"}>
                        {activeDestination.status === "Active" ? "Operational" : activeDestination.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 bg-card border border-border rounded-md shadow-xs overflow-hidden">
                <div className="p-6 space-y-6 text-sm leading-relaxed text-foreground min-h-[360px]">
                  <div>
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2">
                      Address & Logistics Profile
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Registered dump location locality and operational notes for weighbridge dispatch.
                    </p>
                  </div>

                  <div className="rounded-md border border-info/25 bg-info/10 p-5 space-y-4">
                    <h4 className="text-xs font-bold text-info uppercase tracking-widest flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      Address Details
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address Line 1</div>
                        <div className="text-sm font-bold text-foreground mt-0.5">{activeDestination.addressLine1}</div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address Line 2</div>
                        <div className="text-sm font-semibold text-foreground mt-0.5">
                          {activeDestination.addressLine2 || "N/A"}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Suburb</div>
                          <div className="text-sm font-semibold text-foreground mt-0.5">{activeDestination.suburb}</div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">State</div>
                          <div className="text-sm font-semibold text-foreground mt-0.5">{activeDestination.state}</div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Postcode</div>
                          <div className="text-sm font-mono font-bold text-foreground mt-0.5">{activeDestination.postcode}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                      Site Notes
                    </h4>
                    <div className="p-4 rounded-md bg-warning/10 border border-warning/30 text-xs font-medium italic text-warning">
                      &ldquo;{activeDestination.notes || "No special logistics notes configured."}&rdquo;
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TWO TABS NAVIGATION */}
            <div className="space-y-4">
              <div className="flex border-b border-border">
                <button
                  onClick={() => setDetailTab("transactions")}
                  className={`px-4 py-2 text-xs font-bold border-b-2 tracking-wide transition-all cursor-pointer ${
                    detailTab === "transactions"
                      ? "border-primary text-info"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Transactions ({linkedTransactions.length})
                </button>
                <button
                  onClick={() => setDetailTab("jobs")}
                  className={`px-4 py-2 text-xs font-bold border-b-2 tracking-wide transition-all cursor-pointer ${
                    detailTab === "jobs"
                      ? "border-primary text-info"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Jobs ({linkedJob ? 1 : 0})
                </button>
              </div>

              {/* ======================= TAB 1: TRANSACTIONS ======================= */}
              {detailTab === "transactions" && (
                <div className="bg-card border border-border rounded-md shadow-xs overflow-hidden">
                  <div className="bg-muted border-b border-border px-4 py-3 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-info" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Associated Transit Records ({linkedTransactions.length})
                      </h4>
                    </div>

                    {linkedTransactions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setExportScope("destination-transactions");
                          setShowExportModal(true);
                        }}
                        className={`${DESTINATION_FORM_ACTION_CLASS} gap-1.5 border border-border bg-card px-3.5 text-foreground shadow-xs hover:bg-muted`}
                      >
                        <Download className="h-4 w-4 shrink-0" />
                        <span>Export Transactions ({linkedTransactions.length})</span>
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-muted border-b border-border text-xs font-bold uppercase text-muted-foreground tracking-wider">
                          <th className="px-4 py-3">Transaction ID</th>
                          <th className="px-4 py-3">Transaction Type</th>
                          <th className="px-4 py-3">Ticket Number</th>
                          <th className="px-4 py-3">Transaction Code</th>
                          <th className="px-4 py-3">Customer</th>
                          <th className="px-4 py-3">Job</th>
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3">Product Lot</th>
                          <th className="px-4 py-3 text-right">Net Weight</th>
                          <th className="px-4 py-3 text-right">Total Amount</th>
                          <th className="px-4 py-3 text-center">Status</th>
                          <th className="px-4 py-3">Created Date</th>
                          <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-xs font-semibold text-foreground">
                        {linkedTransactions.length === 0 ? (
                          <tr>
                            <td colSpan={13} className="px-4 py-10 text-center text-muted-foreground">
                              No weighbridge transactions recorded for this destination yet.
                            </td>
                          </tr>
                        ) : (
                          linkedTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-muted">
                              <td className="px-4 py-3 font-mono text-info font-bold">{tx.id}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                  tx.type === "Account" ? "bg-info/10 text-info" : "bg-success/10 text-success"
                                }`}>
                                  {tx.type}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-mono text-foreground">{tx.ticketNo}</td>
                              <td className="px-4 py-3 font-mono text-muted-foreground">{tx.transactionCode || "N/A"}</td>
                              <td className="px-4 py-3 text-muted-foreground max-w-[130px] truncate">{tx.customerName}</td>
                              <td className="px-4 py-3 font-mono text-muted-foreground">{tx.jobOrder}</td>
                              <td className="px-4 py-3 text-muted-foreground max-w-[130px] truncate">{tx.productName}</td>
                              <td className="px-4 py-3 font-mono text-muted-foreground">{tx.lotNo || "N/A"}</td>
                              <td className="px-4 py-3 text-right font-mono font-bold text-foreground">{tx.netWeight.toFixed(2)} t</td>
                              <td className="px-4 py-3 text-right font-mono text-success font-bold">${tx.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${
                                  tx.status === "Approved" || tx.status === "Committed"
                                    ? "bg-success/10 text-success"
                                    : tx.status === "Pending"
                                    ? "bg-warning/10 text-warning animate-pulse"
                                    : tx.status === "Invoiced"
                                    ? "bg-info/10 text-info"
                                    : "bg-destructive/10 text-destructive"
                                }`}>
                                  {tx.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {tx.firstWeighTime ? new Date(tx.firstWeighTime).toLocaleDateString() : "N/A"}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => onViewTicketDetails(tx.id)}
                                  className={TABLE_ACTION_ICON_BUTTON_CLASS}
                                  title="Open weighbridge ticket dossier"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ======================= TAB 2: JOBS ======================= */}
              {detailTab === "jobs" && (
                <div className="bg-card border border-border rounded-md shadow-xs overflow-hidden">
                  <div className="bg-muted border-b border-border px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-success" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Linked Job Contract Profile
                      </h4>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-muted border-b border-border text-xs font-bold uppercase text-muted-foreground tracking-wider">
                          <th className="px-4 py-3">Job ID</th>
                          <th className="px-4 py-3">Customer Order Reference</th>
                          <th className="px-4 py-3">Customer</th>
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3 text-right">Order Quantity</th>
                          <th className="px-4 py-3 text-right">Delivered Quantity</th>
                          <th className="px-4 py-3 text-right">Remaining Quantity</th>
                          <th className="px-4 py-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-xs font-semibold text-foreground">
                        {!linkedJob ? (
                          <tr>
                            <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                              No job associated with this destination.
                            </td>
                          </tr>
                        ) : (
                          <tr className="hover:bg-muted">
                            <td className="px-4 py-3.5 font-mono text-info font-bold">{linkedJob.id}</td>
                            <td className="px-4 py-3.5 text-foreground">{linkedJob.customerOrderRef}</td>
                            <td className="px-4 py-3.5 text-muted-foreground">{linkedJob.customerName}</td>
                            <td className="px-4 py-3.5 text-muted-foreground">{linkedJob.productName}</td>
                            <td className="px-4 py-3.5 text-right font-mono font-bold text-foreground">{linkedJob.orderQty.toLocaleString()} t</td>
                            <td className="px-4 py-3.5 text-right font-mono text-success font-semibold">{jobMetrics.delivered.toLocaleString()} t</td>
                            <td className="px-4 py-3.5 text-right font-mono text-warning font-semibold">{jobMetrics.remaining.toLocaleString()} t</td>
                            <td className="px-4 py-3.5 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                linkedJob.status === "Active"
                                  ? "bg-success/10 text-success border border-success/25"
                                  : linkedJob.status === "Completed"
                                  ? "bg-info/10 text-info border border-info/25"
                                  : "bg-destructive/10 text-destructive border border-destructive/25"
                              }`}>
                                {linkedJob.status}
                              </span>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* ======================= GLOBAL EXPORT REPORT DIALOG ===================== */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-card border border-border rounded-md shadow-lg overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-muted border-b border-border px-4 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-info">
                  <Download className="h-4.5 w-4.5" />
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Export Logistics Gateway Reports
                  </span>
                </div>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-muted-foreground hover:text-muted-foreground transition cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4">
                {/* Export Scope Select */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Report Data Scope
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2.5 p-2 bg-muted hover:bg-muted border border-border rounded-md text-xs font-semibold text-foreground cursor-pointer">
                      <RadioBox checked={exportScope === "current"} onChange={() => setExportScope("current")} />
                      <div>
                        <span>All Destinations ({destinations.length})</span>
                        <span className="block text-xs font-medium text-muted-foreground">Export complete registered destinations directory</span>
                      </div>
                    </label>

                    {checkedDestIds.length > 0 && (
                      <label className="flex items-center gap-2.5 p-2 bg-muted hover:bg-muted border border-border rounded-md text-xs font-semibold text-foreground cursor-pointer">
                        <RadioBox checked={exportScope === "selected"} onChange={() => setExportScope("selected")} />
                        <div>
                          <span>Selected Destinations ({checkedDestIds.length})</span>
                          <span className="block text-xs font-medium text-muted-foreground">Export only explicitly ticked destination points</span>
                        </div>
                      </label>
                    )}

                    <label className="flex items-center gap-2.5 p-2 bg-muted hover:bg-muted border border-border rounded-md text-xs font-semibold text-foreground cursor-pointer">
                      <RadioBox checked={exportScope === "filtered"} onChange={() => setExportScope("filtered")} />
                      <div>
                        <span>Filtered Destinations ({filteredDestinations.length})</span>
                        <span className="block text-xs font-medium text-muted-foreground">Export based on active search parameters & status/customer filters</span>
                      </div>
                    </label>

                    {currentMode === "detail" && activeDestination && (
                      <>
                        <label className="flex items-center gap-2.5 p-2 bg-muted hover:bg-muted border border-border rounded-md text-xs font-semibold text-foreground cursor-pointer">
                          <RadioBox checked={exportScope === "individual-summary"} onChange={() => setExportScope("individual-summary")} />
                          <div>
                            <span>Destination Summary profile</span>
                            <span className="block text-xs font-medium text-muted-foreground">Export profile summary sheet for {activeDestination.id}</span>
                          </div>
                        </label>

                        {linkedTransactions.length > 0 && (
                          <label className="flex items-center gap-2.5 p-2 bg-muted hover:bg-muted border border-border rounded-md text-xs font-semibold text-foreground cursor-pointer">
                            <RadioBox checked={exportScope === "destination-transactions"} onChange={() => setExportScope("destination-transactions")} />
                            <div>
                              <span>Destination Transactions ledger ({linkedTransactions.length})</span>
                              <span className="block text-xs font-medium text-muted-foreground">Export historical weighbridge transit lists linked to this location</span>
                            </div>
                          </label>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Export format buttons */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Export Format
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "CSV", label: "CSV Spreadsheet", icon: FileSpreadsheet, style: "text-info bg-info/10 border-info/25" },
                      { id: "Excel", label: "Microsoft Excel", icon: FileSpreadsheet, style: "text-success bg-success/10 border-success/25" },
                      { id: "PDF", label: "Printable PDF", icon: FileText, style: "text-destructive bg-destructive/10 border-destructive/25" }
                    ].map((fmt) => {
                      const isFmtSelected = exportFormat === fmt.id;
                      const Icon = fmt.icon;
                      return (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => setExportFormat(fmt.id as any)}
                          className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-md border text-center transition cursor-pointer ${
                            isFmtSelected
                              ? `${fmt.style} ring-1 ring-offset-1 ring-border font-bold`
                              : "bg-card border-border hover:bg-muted font-semibold"
                          }`}
                        >
                          <Icon className={`h-5 w-5 ${isFmtSelected ? "" : "text-muted-foreground"}`} />
                          <span className="text-xs">{fmt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-muted border-t border-border px-4 py-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className={`${DESTINATION_FORM_ACTION_CLASS} gap-1.5 border border-border bg-card px-4 text-foreground shadow-xs hover:bg-muted`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={triggerExport}
                  className={`${DESTINATION_FORM_ACTION_CLASS} gap-1.5 border border-primary bg-primary px-4 text-primary-foreground shadow-xs hover:bg-primary/90`}
                >
                  <Download className="h-4 w-4 shrink-0" />
                  <span>Generate Report</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
