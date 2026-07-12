import React, { useState, useEffect } from "react";
import {
  Scale,
  Clock,
  Eye,
  CheckCircle2,
  AlertOctagon,
  TrendingUp,
  X,
  FileText,
  DollarSign,
  User,
  Truck,
  Grid,
  Filter,
  Check,
  AlertTriangle,
  History,
  Download,
  ExternalLink,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  FileSpreadsheet,
  FileCheck,
  Building2,
  Lock,
  ArrowRight,
  ChevronDown,
  Trash2,
  Play
} from "lucide-react";
import { Transaction, TransactionStatus } from "../types";
import { motion, AnimatePresence } from "motion/react";
import StatusBadge from "@/src/components/shared/StatusBadge";
import { toast } from "sonner";
import { confirmDialog, promptDialog } from "@/src/components/shared/dialog-service";
import { SelectBox } from "@/src/components/ui/select";
import { Checkbox } from "@/src/components/ui/checkbox";

interface TransactionsViewProps {
  transactions: Transaction[];
  onUpdateTransaction: (updatedTx: Transaction) => void;
  subView: "all" | "pending" | "approved" | "invoicing" | "weighbridge";
  searchQuery: string;
  onViewTicketDetails: (ticketId: string) => void;
}

export default function TransactionsView({
  transactions,
  onUpdateTransaction,
  subView,
  searchQuery,
  onViewTicketDetails
}: TransactionsViewProps) {
  // Navigation trigger chip filter state
  const [activeChip, setActiveChip] = useState<string>(() => {
    if (subView === "pending") return "Pending";
    if (subView === "approved") return "Approved";
    if (subView === "invoicing") return "Invoiced";
    return "All";
  });

  // Keep activeChip in sync with subView when it changes
  useEffect(() => {
    if (subView === "pending") setActiveChip("Pending");
    else if (subView === "approved") setActiveChip("Approved");
    else if (subView === "invoicing") setActiveChip("Invoiced");
    else if (subView === "all") setActiveChip("All");
  }, [subView]);

  // Master-Detail Split Pane Selection State
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewTab, setPreviewTab] = useState<"overview" | "pricing" | "weights" | "audit">("overview");

  // Advanced Filters toggle
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Row selection checkboxes state for Exporting
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Bulk actions states
  const [showBulkCommentModal, setShowBulkCommentModal] = useState<boolean>(false);
  const [bulkCommentText, setBulkCommentText] = useState<string>("");

  // Export dropdown state
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [exportScope, setExportScope] = useState<string | null>(null); // "current" | "selected" | "filtered" | "all" | "invoicing"
  const [exportFormat, setExportFormat] = useState<string>("CSV"); // "CSV" | "Excel" | "PDF"
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string>("");

  // Column visibility state variables
  const [showColumnsMenu, setShowColumnsMenu] = useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    ticketCode: true,
    date: true,
    vehicleDriver: true,
    customer: true,
    material: true,
    netWeight: true,
    type: true,
    status: true,
    action: true
  });

  // Advanced Filters State
  const [advType, setAdvType] = useState<string>("All");
  const [advStatus, setAdvStatus] = useState<string>("All");
  const [advCustomer, setAdvCustomer] = useState<string>("");
  const [advJobOrder, setAdvJobOrder] = useState<string>("");
  const [advProduct, setAdvProduct] = useState<string>("");
  const [advLot, setAdvLot] = useState<string>("");
  const [advCarter, setAdvCarter] = useState<string>("");
  const [advDriver, setAdvDriver] = useState<string>("");
  const [advVehicle, setAdvVehicle] = useState<string>("");
  const [advTicketNo, setAdvTicketNo] = useState<string>("");
  const [advTxCode, setAdvTxCode] = useState<string>("");
  const [advBalanceMin, setAdvBalanceMin] = useState<string>("");
  const [advBalanceMax, setAdvBalanceMax] = useState<string>("");
  const [advDateFrom, setAdvDateFrom] = useState<string>("");
  const [advDateTo, setAdvDateTo] = useState<string>("");

  // Quick reset for advanced filters
  const resetFilters = () => {
    setAdvType("All");
    setAdvStatus("All");
    setAdvCustomer("");
    setAdvJobOrder("");
    setAdvProduct("");
    setAdvLot("");
    setAdvCarter("");
    setAdvDriver("");
    setAdvVehicle("");
    setAdvTicketNo("");
    setAdvTxCode("");
    setAdvBalanceMin("");
    setAdvBalanceMax("");
    setAdvDateFrom("");
    setAdvDateTo("");
    setActiveChip("All");
  };

  // Check if any advanced filter is active
  const activeAdvancedFilterCount = [
    advType !== "All",
    advStatus !== "All",
    advCustomer !== "",
    advJobOrder !== "",
    advProduct !== "",
    advLot !== "",
    advCarter !== "",
    advDriver !== "",
    advVehicle !== "",
    advTicketNo !== "",
    advTxCode !== "",
    advBalanceMin !== "",
    advBalanceMax !== "",
    advDateFrom !== "",
    advDateTo !== ""
  ].filter(Boolean).length;

  // Process and filter transactions
  let processedTransactions = transactions;

  // 1. Chip Filter
  if (activeChip !== "All") {
    if (activeChip === "Account") {
      processedTransactions = processedTransactions.filter((tx) => tx.type === "Account");
    } else if (activeChip === "Cash") {
      processedTransactions = processedTransactions.filter((tx) => tx.type === "Cash");
    } else {
      processedTransactions = processedTransactions.filter(
        (tx) => tx.status.toLowerCase() === activeChip.toLowerCase()
      );
    }
  }

  // 2. Search Query (Global Filter)
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    processedTransactions = processedTransactions.filter(
      (tx) =>
        tx.id.toLowerCase().includes(q) ||
        tx.ticketNo.toLowerCase().includes(q) ||
        tx.vehicleReg.toLowerCase().includes(q) ||
        tx.driverName.toLowerCase().includes(q) ||
        tx.customerName.toLowerCase().includes(q) ||
        tx.productName.toLowerCase().includes(q) ||
        tx.carrierName.toLowerCase().includes(q)
    );
  }

  // 3. Advanced Filters
  processedTransactions = processedTransactions.filter((tx) => {
    if (advType !== "All" && tx.type !== advType) return false;
    if (advStatus !== "All" && tx.status !== advStatus) return false;

    if (
      advCustomer &&
      !tx.customerName.toLowerCase().includes(advCustomer.toLowerCase()) &&
      !tx.customerId.toLowerCase().includes(advCustomer.toLowerCase())
    )
      return false;

    if (advJobOrder && !tx.jobOrder.toLowerCase().includes(advJobOrder.toLowerCase())) return false;

    if (
      advProduct &&
      !tx.productName.toLowerCase().includes(advProduct.toLowerCase()) &&
      !tx.productId.toLowerCase().includes(advProduct.toLowerCase())
    )
      return false;

    if (advLot && !tx.lotNo.toLowerCase().includes(advLot.toLowerCase())) return false;
    if (advCarter && !tx.carrierName.toLowerCase().includes(advCarter.toLowerCase())) return false;
    if (advDriver && !tx.driverName.toLowerCase().includes(advDriver.toLowerCase())) return false;
    if (advVehicle && !tx.vehicleReg.toLowerCase().includes(advVehicle.toLowerCase())) return false;
    if (advTicketNo && !tx.ticketNo.toLowerCase().includes(advTicketNo.toLowerCase())) return false;

    if (
      advTxCode &&
      !tx.transactionCode.toLowerCase().includes(advTxCode.toLowerCase()) &&
      !tx.id.toLowerCase().includes(advTxCode.toLowerCase())
    )
      return false;

    if (advBalanceMin) {
      const min = parseFloat(advBalanceMin);
      if (!isNaN(min) && tx.accountBalance < min) return false;
    }
    if (advBalanceMax) {
      const max = parseFloat(advBalanceMax);
      if (!isNaN(max) && tx.accountBalance > max) return false;
    }

    if (advDateFrom) {
      const txDate = new Date(tx.firstWeighTime.substring(0, 10));
      const fromDate = new Date(advDateFrom);
      if (!isNaN(fromDate.getTime()) && txDate < fromDate) return false;
    }
    if (advDateTo) {
      const txDate = new Date(tx.firstWeighTime.substring(0, 10));
      const toDate = new Date(advDateTo);
      if (!isNaN(toDate.getTime()) && txDate > toDate) return false;
    }

    return true;
  });

  // Select first transaction in processed list to show in preview if none selected
  const activeTx =
    processedTransactions.find((tx) => tx.id === selectedTxId) || processedTransactions[0];

  // Sync selected ID
  useEffect(() => {
    if (activeTx && selectedTxId !== activeTx.id) {
      setSelectedTxId(activeTx.id);
    }
  }, [activeTx, selectedTxId]);

  // Handle Export download trigger
  const triggerExportDownload = (scope: string, format: string) => {
    setIsExporting(true);
    setExportScope(null); // hide choice modal
    
    let scopeLabel = "";
    let itemsToExport = processedTransactions;

    if (scope === "current") {
      scopeLabel = "Current View";
      itemsToExport = processedTransactions;
    } else if (scope === "selected") {
      scopeLabel = "Selected Rows";
      itemsToExport = transactions.filter((t) => selectedIds.includes(t.id));
    } else if (scope === "filtered") {
      scopeLabel = "Filtered Results";
      itemsToExport = processedTransactions;
    } else if (scope === "all") {
      scopeLabel = "All Transactions";
      itemsToExport = transactions;
    } else if (scope === "invoicing") {
      scopeLabel = "Invoicing Staged Queue";
      itemsToExport = transactions.filter(
        (t) => (t.status === "Approved" || t.status === "Committed") && t.type === "Account"
      );
    }

    setExportMessage(`Pre-allocating buffers & formatting ${itemsToExport.length} entries as ${format}...`);

    setTimeout(() => {
      // Create and trigger file download
      const dateStr = new Date().toISOString().split("T")[0];
      const fileName = `uniweigh_${scope}_export_${dateStr}`;

      if (format === "CSV") {
        let csv = "Ticket No,ID,Type,Status,Vehicle,Driver,Customer,Product,Net Weight(t),Job Order,Lot,Tx Code,Account Balance($)\n";
        itemsToExport.forEach((t) => {
          csv += `"${t.ticketNo}","${t.id}","${t.type}","${t.status}","${t.vehicleReg}","${t.driverName}","${t.customerName}","${t.productName}",${t.netWeight},"${t.jobOrder}","${t.lotNo}","${t.transactionCode}",${t.accountBalance}\n`;
        });
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${fileName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (format === "Excel") {
        let xls = "Ticket No\tID\tType\tStatus\tVehicle\tDriver\tCustomer\tProduct\tNet Weight(t)\tJob Order\tLot\tTx Code\tAccount Balance($)\n";
        itemsToExport.forEach((t) => {
          xls += `${t.ticketNo}\t${t.id}\t${t.type}\t${t.status}\t${t.vehicleReg}\t${t.driverName}\t${t.customerName}\t${t.productName}\t${t.netWeight}\t${t.jobOrder}\t${t.lotNo}\t${t.transactionCode}\t${t.accountBalance}\n`;
        });
        const blob = new Blob([xls], { type: "application/vnd.ms-excel;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${fileName}.xls`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (format === "PDF") {
        let pdfText = `========================================================================\n`;
        pdfText += `              UNIWEIGH WEIGHBRIDGE SYSTEMS - AUDIT REPORT               \n`;
        pdfText += `              Export Scope: ${scopeLabel.toUpperCase()}                 \n`;
        pdfText += `              Timestamp: ${new Date().toLocaleString()}                 \n`;
        pdfText += `========================================================================\n\n`;
        pdfText += `Summary: ${itemsToExport.length} transactions exported.\n\n`;

        itemsToExport.forEach((t, i) => {
          pdfText += `${i + 1}. Ticket: ${t.ticketNo}  |  Code: ${t.id}  |  Type: ${t.type}  |  Status: ${t.status}\n`;
          pdfText += `   Vehicle: ${t.vehicleReg}  |  Driver: ${t.driverName}  |  Carter: ${t.carrierName}\n`;
          pdfText += `   Customer: ${t.customerName} [${t.customerId}]\n`;
          pdfText += `   Product: ${t.productName}  |  Net Weight: ${t.netWeight.toFixed(2)} t\n`;
          pdfText += `   Job Order: ${t.jobOrder || "N/A"}  |  Lot Number: ${t.lotNo || "N/A"}  |  Tx Code: ${t.transactionCode || "N/A"}\n`;
          pdfText += `   Account Balance: $${t.accountBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}\n`;
          pdfText += `   Remarks: ${t.comments || "No back-office comments."}\n`;
          pdfText += `   Weigh Times: Inbound ${t.firstWeighTime} | Outbound ${t.secondWeighTime}\n`;
          pdfText += `------------------------------------------------------------------------\n`;
        });

        const blob = new Blob([pdfText], { type: "text/plain;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${fileName}.txt`); // downloading highly structured report text which acts as simulated PDF print log
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setIsExporting(false);
      setShowExportMenu(false);
    }, 1500);
  };

  // Row checkbox multi-select toggling
  const toggleSelectAll = () => {
    if (selectedIds.length === processedTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(processedTransactions.map((tx) => tx.id));
    }
  };

  const toggleSelectRow = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Audit action handlers for the active transaction
  const handleUpdateStatus = (newStatus: TransactionStatus, commentText: string) => {
    if (!activeTx) return;

    const updated: Transaction = {
      ...activeTx,
      status: newStatus,
      auditHistory: [
        ...activeTx.auditHistory,
        {
          timestamp: new Date().toLocaleString(),
          action: `Status set to ${newStatus}`,
          user: "Admin User",
          details: commentText || `Status transitioned back-office to ${newStatus}.`
        }
      ]
    };
    onUpdateTransaction(updated);
  };

  // Bulk operation handlers for checked transactions
  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    const pendingAndHold = transactions.filter(
      (tx) => selectedIds.includes(tx.id) && (tx.status === TransactionStatus.PENDING || tx.status === TransactionStatus.ON_HOLD)
    );

    if (pendingAndHold.length === 0) {
      toast.error("None of the selected tickets are in a state that can be approved (must be Pending or On Hold).");
      return;
    }

    const confirmApprove = await confirmDialog(
      `Are you sure you want to bulk APPROVE the ${pendingAndHold.length} eligible selected transaction(s)?`
    );
    if (!confirmApprove) return;

    pendingAndHold.forEach((tx) => {
      const updated: Transaction = {
        ...tx,
        status: TransactionStatus.APPROVED,
        auditHistory: [
          ...tx.auditHistory,
          {
            timestamp: new Date().toLocaleString(),
            action: `Bulk Approved`,
            user: "Admin User",
            details: `Approved via bulk actions toolbar. Selected in batch of ${selectedIds.length} items.`
          }
        ]
      };
      onUpdateTransaction(updated);
    });

    toast.success(`Successfully approved ${pendingAndHold.length} transaction(s).`);
    setSelectedIds([]);
  };

  const handleBulkCancel = async () => {
    if (selectedIds.length === 0) return;
    const cancelable = transactions.filter(
      (tx) => selectedIds.includes(tx.id) && tx.status !== TransactionStatus.CANCELLED
    );

    if (cancelable.length === 0) {
      toast.info("None of the selected tickets can be cancelled (already Cancelled).");
      return;
    }

    const confirmCancel = await confirmDialog(
      `Are you sure you want to bulk CANCEL the ${cancelable.length} selected transaction(s)? This action is permanent.`
    );
    if (!confirmCancel) return;

    cancelable.forEach((tx) => {
      const updated: Transaction = {
        ...tx,
        status: TransactionStatus.CANCELLED,
        auditHistory: [
          ...tx.auditHistory,
          {
            timestamp: new Date().toLocaleString(),
            action: `Bulk Cancelled`,
            user: "Admin User",
            details: `Cancelled via bulk actions toolbar. Selected in batch of ${selectedIds.length} items.`
          }
        ]
      };
      onUpdateTransaction(updated);
    });

    toast.success(`Successfully cancelled ${cancelable.length} transaction(s).`);
    setSelectedIds([]);
  };

  const handleBulkCommentSubmit = () => {
    const trimmed = bulkCommentText.trim();
    if (!trimmed || selectedIds.length === 0) return;

    selectedIds.forEach((id) => {
      const tx = transactions.find((t) => t.id === id);
      if (tx) {
        const updated: Transaction = {
          ...tx,
          auditHistory: [
            ...tx.auditHistory,
            {
              timestamp: new Date().toLocaleString(),
              action: `Bulk Comment Added`,
              user: "Admin User",
              details: trimmed
            }
          ]
        };
        onUpdateTransaction(updated);
      }
    });

    toast.success(`Successfully attached comment to all ${selectedIds.length} selected transaction(s).`);
    setBulkCommentText("");
    setShowBulkCommentModal(false);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-4">
      {/* 1. Header and Page Title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between font-normal">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight sm:text-2xl">
            Weighbridge Transactions & Audit Log
          </h1>
          <p className="text-xs text-muted-foreground">
            Operations / Transactions Control Hub
          </p>
        </div>

        {/* 2. Interactive Controls & Export */}
        <div className="flex items-center gap-2 self-start sm:self-auto relative">
          {/* Advanced Filter Drawer Trigger */}
          <button
            id="btn-toggle-filters"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold cursor-pointer transition ${
              showFilters
                ? "border-ring bg-info/10 text-info"
                : "border-border bg-card text-foreground hover:bg-muted"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Advanced Filters</span>
            {activeAdvancedFilterCount > 0 && (
              <span className="ml-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {activeAdvancedFilterCount}
              </span>
            )}
          </button>

          {/* Column Visibility dropdown */}
          <div className="relative">
            <button
              id="btn-toggle-columns"
              onClick={() => setShowColumnsMenu(!showColumnsMenu)}
              className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer transition select-none"
            >
              <span>Column Visibility</span>
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
                    onClick={() => {
                      setVisibleColumns((prev) => ({
                        ...prev,
                        [col]: !prev[col]
                      }));
                    }}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-muted font-bold text-foreground flex items-center justify-between cursor-pointer"
                  >
                    <span className="capitalize">
                      {col === "ticketCode"
                        ? "Ticket / Code"
                        : col === "date"
                        ? "Transaction Date"
                        : col === "vehicleDriver"
                        ? "Vehicle & Driver"
                        : col === "customer"
                        ? "Invoiced To"
                        : col === "material"
                        ? "Material"
                        : col === "netWeight"
                        ? "Net Weight"
                        : col === "type"
                        ? "Type"
                        : col === "status"
                        ? "Status"
                        : col === "action"
                        ? "Action"
                        : col}
                    </span>
                    {visibleColumns[col] && <Check className="h-3.5 w-3.5 text-info shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 3. Export Dialog Modal overlay */}
      {exportScope && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-card rounded-md border border-border shadow-lg p-6 relative animate-zoom-in">
            <button
              onClick={() => setExportScope(null)}
              className="absolute top-4 right-4 p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-muted-foreground transition"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2">
              Export Configuration
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Exporting transaction list based on selected scope:{" "}
              <span className="font-bold text-foreground uppercase bg-muted px-1.5 py-0.5 rounded">
                {exportScope === "current" && "Current Page View"}
                {exportScope === "selected" && "Manually Checked Rows"}
                {exportScope === "filtered" && "Filtered Results"}
                {exportScope === "all" && "All Registry Data"}
                {exportScope === "invoicing" && "Invoicing Queue Ledger"}
              </span>
            </p>

            <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">
              Select Output Format
            </label>
            <div className="grid grid-cols-3 gap-2.5 mb-6">
              {["CSV", "Excel", "PDF"].map((fmt) => (
                <button
                  key={fmt}
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
                  <span>{fmt} Spreadsheet</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={() => setExportScope(null)}
                className="px-4 py-2 rounded-md border border-border text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => triggerExportDownload(exportScope, exportFormat)}
                className="px-4 py-2 rounded-md bg-primary text-xs font-semibold text-white hover:bg-primary/90 transition"
              >
                Generate & Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Loading/Generating Progress Overlay */}
      {isExporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-xs">
          <div className="bg-card rounded-md border border-border shadow-lg p-6 max-w-sm w-full text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
            <h4 className="text-sm font-bold text-foreground uppercase tracking-widest">
              Generating Export
            </h4>
            <p className="text-xs text-muted-foreground font-mono bg-muted p-2.5 rounded border border-border">
              {exportMessage}
            </p>
          </div>
        </div>
      )}

      {/* 4. Top Filtering Chips */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-3">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mr-2 select-none">
          Category Filters:
        </span>
        {[
          "All",
          "Account",
          "Cash",
          "Pending",
          "Approved",
          "Cancelled",
          "Committed",
          "Invoiced"
        ].map((chip) => {
          const isActive = activeChip === chip;
          return (
            <button
              key={chip}
              onClick={() => {
                setActiveChip(chip);
                // Clear state when user chooses standard status filters
                if (chip !== "All" && chip !== "Account" && chip !== "Cash") {
                  setAdvStatus("All");
                }
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition cursor-pointer select-none ${
                isActive
                  ? "bg-primary border-primary text-white shadow-xs"
                  : "bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {chip}
            </button>
          );
        })}
      </div>

      {/* 5. Advanced Filter Drawer Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-md border border-border bg-muted p-4 shadow-inner space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  Advanced Multi-Criteria Filtering Engine
                </span>
                <button
                  onClick={resetFilters}
                  className="text-xs font-bold text-info hover:text-info hover:underline cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2 md:grid-cols-4">
                {/* 1. Transaction Type */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">
                    Transaction Type
                  </label>
                  <SelectBox
                    value={advType}
                    onChange={(e) => setAdvType(e.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  >
                    <option value="All">All Types</option>
                    <option value="Account">Account</option>
                    <option value="Cash">Cash</option>
                  </SelectBox>
                </div>

                {/* 2. Status */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">
                    Operational Status
                  </label>
                  <SelectBox
                    value={advStatus}
                    onChange={(e) => setAdvStatus(e.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Committed">Committed</option>
                    <option value="Invoiced">Invoiced</option>
                  </SelectBox>
                </div>

                {/* 3. Customer */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">
                    Customer Name or ID
                  </label>
                  <input
                    type="text"
                    value={advCustomer}
                    onChange={(e) => setAdvCustomer(e.target.value)}
                    placeholder="e.g. Apex"
                    className="w-full rounded-md border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  />
                </div>

                {/* 4. Job / Order */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">
                    Job / Order Number
                  </label>
                  <input
                    type="text"
                    value={advJobOrder}
                    onChange={(e) => setAdvJobOrder(e.target.value)}
                    placeholder="e.g. JOB-2026-01"
                    className="w-full rounded-md border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  />
                </div>

                {/* 5. Product */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">
                    Product / Material
                  </label>
                  <input
                    type="text"
                    value={advProduct}
                    onChange={(e) => setAdvProduct(e.target.value)}
                    placeholder="e.g. Crushed Rock"
                    className="w-full rounded-md border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  />
                </div>

                {/* 6. Lot */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">
                    Lot Number
                  </label>
                  <input
                    type="text"
                    value={advLot}
                    onChange={(e) => setAdvLot(e.target.value)}
                    placeholder="e.g. LOT-A-42"
                    className="w-full rounded-md border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  />
                </div>

                {/* 7. Carter / Hauler */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">
                    Carter (Carrier Name)
                  </label>
                  <input
                    type="text"
                    value={advCarter}
                    onChange={(e) => setAdvCarter(e.target.value)}
                    placeholder="e.g. Star Bulk"
                    className="w-full rounded-md border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  />
                </div>

                {/* 8. Driver */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">
                    Driver Name
                  </label>
                  <input
                    type="text"
                    value={advDriver}
                    onChange={(e) => setAdvDriver(e.target.value)}
                    placeholder="e.g. Peterson"
                    className="w-full rounded-md border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  />
                </div>

                {/* 9. Vehicle */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">
                    Vehicle License Plate
                  </label>
                  <input
                    type="text"
                    value={advVehicle}
                    onChange={(e) => setAdvVehicle(e.target.value)}
                    placeholder="e.g. XY-99-ZZ"
                    className="w-full rounded-md border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  />
                </div>

                {/* 10. Ticket Number */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">
                    Ticket Number
                  </label>
                  <input
                    type="text"
                    value={advTicketNo}
                    onChange={(e) => setAdvTicketNo(e.target.value)}
                    placeholder="e.g. WB-991244"
                    className="w-full rounded-md border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  />
                </div>

                {/* 11. Transaction Code */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">
                    Transaction Code / ID
                  </label>
                  <input
                    type="text"
                    value={advTxCode}
                    onChange={(e) => setAdvTxCode(e.target.value)}
                    placeholder="e.g. TR-AC-912"
                    className="w-full rounded-md border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  />
                </div>

                {/* 12. Account Balance Range */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">
                    Account Balance Threshold
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={advBalanceMin}
                      onChange={(e) => setAdvBalanceMin(e.target.value)}
                      placeholder="Min $"
                      className="w-1/2 rounded-md border border-border bg-card px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <input
                      type="number"
                      value={advBalanceMax}
                      onChange={(e) => setAdvBalanceMax(e.target.value)}
                      placeholder="Max $"
                      className="w-1/2 rounded-md border border-border bg-card px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                </div>

                {/* 13. Date Range */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">
                    Weigh Date Interval
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative w-1/2">
                      <input
                        type="date"
                        value={advDateFrom}
                        onChange={(e) => setAdvDateFrom(e.target.value)}
                        className="w-full rounded-md border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <span className="text-muted-foreground text-xs">to</span>
                    <div className="relative w-1/2">
                      <input
                        type="date"
                        value={advDateTo}
                        onChange={(e) => setAdvDateTo(e.target.value)}
                        className="w-full rounded-md border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Full-Width Transaction Ledger Table */}
      <div className="w-full animate-fade-in">
        {/* Data Table Grid */}
        <div className="bg-card border border-border rounded-md shadow-xs overflow-hidden w-full">
          {/* Table summary header & Bulk operations bar */}
          <div className="border-b border-border px-5 py-3 flex items-center justify-between bg-muted min-h-[56px] transition-colors duration-200">
            {selectedIds.length > 0 ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2.5 animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-xs">
                    {selectedIds.length}
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    Weighbridge ticket(s) selected
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleBulkApprove}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-white bg-success hover:bg-success/90 cursor-pointer shadow-sm transition"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approve Selected
                  </button>
                  <button
                    onClick={() => setShowBulkCommentModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-info bg-info/10 border border-info/25 hover:bg-info/10 cursor-pointer shadow-xs transition"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Comment Selected
                  </button>
                  <button
                    onClick={handleBulkCancel}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-destructive bg-destructive/10 border border-destructive/25 hover:bg-destructive/15 cursor-pointer shadow-xs transition"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel Selected
                  </button>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="text-xs font-bold text-muted-foreground hover:text-foreground px-2.5 py-1.5 border border-border rounded-md hover:bg-card cursor-pointer transition"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-muted-foreground">
                  Showing {processedTransactions.length} of {transactions.length} records found
                </span>
                <div className="relative">
                  <button
                    id="btn-export-dropdown"
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export Records</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>

                  {/* Export Dropdown list */}
                  {showExportMenu && (
                    <div className="absolute right-0 mt-1.5 w-64 z-50 rounded-md border border-border bg-card py-2 shadow-lg ring-1 ring-black/5 animate-fade-in text-xs text-foreground">
                      <div className="px-3 py-1.5 border-b border-border bg-muted text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Select Export Scope
                      </div>
                      <button
                        onClick={() => setExportScope("current")}
                        className="w-full text-left px-3 py-2 hover:bg-muted flex items-center justify-between"
                      >
                        <span>Export Current View ({processedTransactions.length} items)</span>
                      </button>
                      <button
                        disabled={selectedIds.length === 0}
                        onClick={() => setExportScope("selected")}
                        className={`w-full text-left px-3 py-2 hover:bg-muted flex items-center justify-between ${
                          selectedIds.length === 0 ? "opacity-40 cursor-not-allowed" : ""
                        }`}
                      >
                        <span>Export Selected Rows ({selectedIds.length} items)</span>
                      </button>
                      <button
                        onClick={() => setExportScope("filtered")}
                        className="w-full text-left px-3 py-2 hover:bg-muted flex items-center justify-between"
                      >
                        <span>Export Filtered Results ({processedTransactions.length} items)</span>
                      </button>
                      <button
                        onClick={() => setExportScope("all")}
                        className="w-full text-left px-3 py-2 hover:bg-muted flex items-center justify-between"
                      >
                        <span>Export All Transactions ({transactions.length} items)</span>
                      </button>
                      <button
                        onClick={() => setExportScope("invoicing")}
                        className="w-full text-left px-3 py-2 hover:bg-muted flex items-center justify-between text-info hover:text-info font-semibold"
                      >
                        <span>Export for Invoicing</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
                  {/* Select Columns */}
                  <th className="px-4 py-3.5 text-center w-8">
                    <Checkbox checked={
                        processedTransactions.length > 0 &&
                        selectedIds.length === processedTransactions.length
                      } onCheckedChange={(checked) => ((toggleSelectAll) as any)({ target: { checked } })} className="rounded-sm cursor-pointer accent-primary" />
                  </th>
                  {visibleColumns.ticketCode && <th className="px-4 py-3.5">Ticket / Code</th>}
                  {visibleColumns.date && <th className="px-4 py-3.5">Transaction Date</th>}
                  {visibleColumns.vehicleDriver && <th className="px-4 py-3.5">Vehicle & Driver</th>}
                  {visibleColumns.customer && <th className="px-4 py-3.5">Invoiced To</th>}
                  {visibleColumns.material && <th className="px-4 py-3.5">Material</th>}
                  {visibleColumns.netWeight && <th className="px-4 py-3.5 text-right">Net Wt (t)</th>}
                  {visibleColumns.type && <th className="px-4 py-3.5 text-center">Type</th>}
                  {visibleColumns.status && <th className="px-4 py-3.5 text-center">Status</th>}
                  {visibleColumns.action && <th className="px-4 py-3.5 text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {processedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={1 + Object.values(visibleColumns).filter(Boolean).length} className="py-16 text-center text-xs text-muted-foreground">
                      No matching back-office weigh tickets found.
                    </td>
                  </tr>
                ) : (
                  processedTransactions.map((tx) => {
                    const isChecked = selectedIds.includes(tx.id);
                    return (
                      <tr
                        key={tx.id}
                        onClick={() => {
                          onViewTicketDetails(tx.id);
                        }}
                        className="group cursor-pointer select-none transition-colors border-l-3 border-l-transparent hover:bg-muted"
                      >
                        {/* Checkbox selector */}
                        <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <Checkbox checked={isChecked} onCheckedChange={(checked) => (((e) => {
                              if (isChecked) {
                                setSelectedIds(selectedIds.filter((item) => item !== tx.id));
                              } else {
                                setSelectedIds([...selectedIds, tx.id]);
                              }
                            }) as any)({ target: { checked } })} className="rounded-sm cursor-pointer accent-primary" />
                        </td>

                        {/* ID Code / Ticket */}
                        {visibleColumns.ticketCode && (
                          <td className="px-4 py-4">
                            <div className="text-sm font-bold text-foreground group-hover:text-info transition-colors">
                              {tx.ticketNo}
                            </div>
                            <div className="font-mono text-xs text-muted-foreground">{tx.id}</div>
                          </td>
                        )}

                        {/* Transaction Date */}
                        {visibleColumns.date && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span>{tx.firstWeighTime.substring(0, 10)}</span>
                            </div>
                            <div className="text-xs text-muted-foreground pl-5">
                              {tx.firstWeighTime.substring(11)}
                            </div>
                          </td>
                        )}

                        {/* Vehicle Registration & Driver */}
                        {visibleColumns.vehicleDriver && (
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                              <Truck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span>{tx.vehicleReg}</span>
                            </div>
                            <div className="text-xs text-muted-foreground pl-5 truncate max-w-[120px]">
                              {tx.driverName}
                            </div>
                          </td>
                        )}

                        {/* Customer */}
                        {visibleColumns.customer && (
                          <td className="px-4 py-4">
                            <div className="text-sm font-bold text-foreground truncate max-w-[150px]" title={tx.customerName}>
                              {tx.customerName}
                            </div>
                            <div className="text-xs text-muted-foreground">ID: {tx.customerId}</div>
                          </td>
                        )}

                        {/* Material Product */}
                        {visibleColumns.material && (
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-foreground truncate max-w-[150px]">{tx.productName}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[150px]">{tx.siteName}</div>
                          </td>
                        )}

                        {/* Net Weight */}
                        {visibleColumns.netWeight && (
                          <td className="px-4 py-4 text-right">
                            <span className="text-sm font-bold font-mono text-foreground">
                              {tx.netWeight.toFixed(2)}
                            </span>
                            <span className="text-xs text-muted-foreground ml-0.5">t</span>
                          </td>
                        )}

                        {/* Transaction Type (Account vs Cash) */}
                        {visibleColumns.type && (
                          <td className="px-4 py-4 text-center">
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold tracking-wider ${
                                tx.type === "Account"
                                  ? "bg-muted text-foreground border border-border"
                                  : "bg-warning/10 text-warning border border-warning/30"
                              }`}
                            >
                              {tx.type}
                            </span>
                          </td>
                        )}

                        {/* Status */}
                        {visibleColumns.status && (
                          <td className="px-4 py-4 text-center">
                            <StatusBadge status={tx.status} />
                          </td>
                        )}

                        {/* Action Eye Button */}
                        {visibleColumns.action && (
                          <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => {
                                  onViewTicketDetails(tx.id);
                                }}
                                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-info transition"
                                title="Review weight ticket details"
                              >
                                <Eye className="h-4.5 w-4.5 text-muted-foreground" />
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

          {/* Simple Pagination Footer */}
          <div className="border-t border-border px-5 py-3.5 flex items-center justify-between bg-muted">
            <span className="text-xs text-muted-foreground font-medium">
              Showing {processedTransactions.length} of {transactions.length} records
            </span>
            <div className="flex gap-1.5">
              <button
                disabled
                className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled
                className="rounded-md border border-border bg-card px-2.5 py-1 text-xs text-foreground font-semibold shadow-xs"
              >
                1
              </button>
              <button
                disabled
                className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Right Hand Pane: Transaction Preview Panel */}
        {showPreview && activeTx && (
          <div className="lg:col-span-4 bg-card border border-border rounded-md shadow-lg overflow-hidden shrink-0 h-auto sticky top-4 animate-fade-in">
            {/* Header */}
            <div className="border-b border-border p-4 bg-muted flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-foreground">
                    {activeTx.ticketNo}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                      activeTx.type === "Account"
                        ? "bg-muted text-foreground border border-border"
                        : "bg-warning/10 text-warning border border-warning/30"
                    }`}
                  >
                    {activeTx.type}
                  </span>
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  Code: {activeTx.id} | {activeTx.transactionCode || "N/A"}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <StatusBadge status={activeTx.status} />
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-muted-foreground transition cursor-pointer"
                  title="Close preview"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Compact Tab switcher */}
            <div className="flex border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider select-none bg-muted">
              {[
                { id: "overview", label: "Overview" },
                { id: "pricing", label: "Financials" },
                { id: "weights", label: "Weights" },
                { id: "audit", label: "Audits" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPreviewTab(tab.id as any)}
                  className={`w-1/4 py-2.5 text-center transition cursor-pointer ${
                    previewTab === tab.id
                      ? "bg-card border-b-2 border-b-accent text-foreground font-bold"
                      : "hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content area */}
            <div className="p-4 space-y-4 min-h-[280px]">
              {/* Tab: Overview */}
              {previewTab === "overview" && (
                <div className="space-y-3">
                  <div>
                    <span className="block text-xs font-bold uppercase text-muted-foreground">
                      Customer / Ledger account
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {activeTx.customerName}
                    </span>
                    <span className="block font-mono text-xs text-muted-foreground">
                      Ledger ID: {activeTx.customerId}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-xs font-bold uppercase text-muted-foreground">
                        Job / Order Ref
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        {activeTx.jobOrder || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold uppercase text-muted-foreground">
                        Lot Registered
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        {activeTx.lotNo || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-xs font-bold uppercase text-muted-foreground">
                      Material / Product
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {activeTx.productName}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Code: {activeTx.productId}
                    </span>
                  </div>

                  <div>
                    <span className="block text-xs font-bold uppercase text-muted-foreground">
                      Transport Logistics
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {activeTx.carrierName}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Driver: {activeTx.driverName} • Truck: {activeTx.vehicleReg}
                    </span>
                  </div>
                </div>
              )}

              {/* Tab: Financials */}
              {previewTab === "pricing" && (
                <div className="space-y-4">
                  <div className="rounded-md bg-muted p-3 border border-border">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-muted-foreground font-medium">Net Weight:</span>
                      <span className="font-bold font-mono text-foreground">{activeTx.netWeight.toFixed(2)} t</span>
                    </div>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="text-muted-foreground font-medium">Unit Price:</span>
                      <span className="font-bold font-mono text-foreground">${activeTx.basePrice.toFixed(2)} / t</span>
                    </div>
                    <div className="border-t border-border my-1.5 pt-1.5 flex justify-between items-center">
                      <span className="text-xs font-bold text-foreground uppercase">Staged Value:</span>
                      <span className="text-sm font-bold font-mono text-info">
                        ${activeTx.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                      Client Account Status
                    </span>
                    <div
                      className={`rounded-md p-3 border ${
                        activeTx.accountBalance < 0
                          ? "bg-destructive/10 border-destructive/25 text-destructive"
                          : "bg-success/10 border-success/25 text-success"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>Current Ledger Balance:</span>
                        <span className="font-bold font-mono">
                          ${activeTx.accountBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activeTx.accountBalance < 0
                          ? "CRITICAL WARNING: Client account exhibits negative credit balance limit or is currently marked suspended."
                          : "Ledger status healthy. Clear to post further transactional weight batches."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Weights */}
              {previewTab === "weights" && (
                <div className="space-y-3">
                  {/* Gauge indicator */}
                  <div className="rounded-md border border-border bg-muted p-3 text-center">
                    <span className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                      Load Audit Gauge
                    </span>
                    <div className="flex justify-center items-baseline gap-1">
                      <span className="text-2xl font-bold font-mono text-foreground">
                        {activeTx.netWeight.toFixed(2)}
                      </span>
                      <span className="text-sm font-bold text-muted-foreground">t Net Weight</span>
                    </div>
                    <div className="mt-2.5 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min((activeTx.netWeight / 50) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 border border-border rounded-md">
                      <span className="block text-xs font-bold text-muted-foreground uppercase">Gross Weight</span>
                      <span className="font-mono font-bold text-foreground">{activeTx.grossWeight.toFixed(2)} t</span>
                    </div>
                    <div className="p-2 border border-border rounded-md">
                      <span className="block text-xs font-bold text-muted-foreground uppercase">Tare Weight</span>
                      <span className="font-mono font-bold text-foreground">{activeTx.tareWeight.toFixed(2)} t</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1 bg-muted p-2.5 rounded-md border border-border">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>Inbound Weigh: <span className="font-semibold">{activeTx.firstWeighTime}</span></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>Outbound Weigh: <span className="font-semibold">{activeTx.secondWeighTime}</span></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Audits */}
              {previewTab === "audit" && (
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  <span className="block text-xs font-bold uppercase text-muted-foreground">
                    Transaction Audit Ledger
                  </span>
                  <div className="space-y-3 relative pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-muted">
                    {activeTx.auditHistory.map((h, i) => (
                      <div key={i} className="text-xs relative">
                        <span className="absolute -left-4.5 top-1 h-2 w-2 rounded-full bg-primary"></span>
                        <div className="font-bold text-foreground">{h.action}</div>
                        <div className="text-xs text-muted-foreground">
                          {h.timestamp} • User: {h.user}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{h.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Back-office Quick Admin Actions */}
            <div className="border-t border-border p-4 bg-muted space-y-2">
              <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1 flex items-center justify-between">
                <span>Back-office Operations Workflow</span>
                <span className="text-muted-foreground text-xs">ID: {activeTx.id}</span>
              </div>

              {/* Status workflow transitions button group */}
              <div className="grid grid-cols-2 gap-2">
                {activeTx.status === TransactionStatus.PENDING && (
                  <>
                    <button
                      onClick={() => {
                        handleUpdateStatus(
                          TransactionStatus.APPROVED,
                          "Enterprise back-office billing approval issued."
                        );
                        toast.success(`Ticket ${activeTx.ticketNo} has been APPROVED.`);
                      }}
                      className="flex items-center justify-center gap-1.5 bg-success hover:bg-success/90 text-white font-bold py-2 px-2.5 rounded-md text-xs cursor-pointer transition shadow-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Approve</span>
                    </button>

                    <button
                      onClick={async () => {
                        const reason = await promptDialog("Enter the reason for flagging or locking this ticket on hold:");
                        if (!reason) return;
                        handleUpdateStatus(
                          TransactionStatus.ON_HOLD,
                          `Locked on audit hold: ${reason}`
                        );
                        toast.info(`Ticket ${activeTx.ticketNo} placed ON HOLD.`);
                      }}
                      className="flex items-center justify-center gap-1.5 bg-destructive hover:bg-destructive/90 text-white font-bold py-2 px-2.5 rounded-md text-xs cursor-pointer transition shadow-xs"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>On Hold</span>
                    </button>
                  </>
                )}

                {(activeTx.status === TransactionStatus.APPROVED || activeTx.status === TransactionStatus.COMMITTED) && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(
                        TransactionStatus.INVOICED,
                        "Invoice generated and posted to client ledger."
                      );
                      toast.info(`Ticket ${activeTx.ticketNo} has been INVOICED.`);
                    }}
                    className="col-span-2 flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-white font-bold py-2 px-3 rounded-md text-xs cursor-pointer transition shadow-xs"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Dispatch Invoice Batch</span>
                  </button>
                )}

                {activeTx.status === TransactionStatus.ON_HOLD && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(
                        TransactionStatus.PENDING,
                        "Released from billing block. Returned to review list."
                      );
                      toast.info(`Hold on ticket ${activeTx.ticketNo} has been RELEASED.`);
                    }}
                    className="col-span-2 flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-white font-bold py-2 px-3 rounded-md text-xs cursor-pointer transition shadow-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Release Audit Hold</span>
                  </button>
                )}
              </div>

              {/* Extra transitions: Commit & Cancel */}
              <div className="flex gap-2">
                {activeTx.status !== TransactionStatus.CANCELLED && (
                  <button
                    onClick={async () => {
                      const yes = await confirmDialog(`Are you sure you want to CANCEL ticket ${activeTx.ticketNo}? This action is permanent.`);
                      if (!yes) return;
                      handleUpdateStatus(
                        TransactionStatus.CANCELLED,
                        "Transaction canceled by back-office controller."
                      );
                    }}
                    className="w-1/2 border border-destructive/25 bg-destructive/10 text-destructive hover:bg-destructive/10 font-bold py-1.5 px-2 rounded-md text-xs text-center cursor-pointer transition"
                  >
                    Cancel Transaction
                  </button>
                )}

                {activeTx.status === TransactionStatus.PENDING && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(
                        TransactionStatus.COMMITTED,
                        "Transaction committed by back-office controller, ready for invoicing."
                      );
                      toast.info(`Ticket ${activeTx.ticketNo} committed to queue.`);
                    }}
                    className="w-1/2 border border-info/25 bg-info/10 text-info hover:bg-info/10 font-bold py-1.5 px-2 rounded-md text-xs text-center cursor-pointer transition"
                  >
                    Commit Queue
                  </button>
                )}
              </div>

              {/* Full details redirection link */}
              <button
                id="btn-full-details-redirect"
                onClick={() => onViewTicketDetails(activeTx.id)}
                className="w-full mt-2 border border-border bg-card hover:bg-muted text-foreground font-bold py-2 px-3 rounded-md text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs"
              >
                <span>Open Full Page Overview</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Comment Dialog Modal */}
      {showBulkCommentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-card rounded-md border border-border shadow-lg p-6 relative animate-zoom-in">
            <button
              onClick={() => {
                setShowBulkCommentModal(false);
                setBulkCommentText("");
              }}
              className="absolute top-4 right-4 p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-muted-foreground transition"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-info" />
              <span>Add Bulk Comment / Annotation</span>
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Add a custom back-office comment or operation annotation to all{" "}
              <span className="font-bold text-foreground bg-info/10 px-2 py-0.5 rounded border border-info/25">
                {selectedIds.length} selected ticket(s)
              </span>{" "}
              simultaneously. This will be permanently recorded in their audit log history.
            </p>

            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase text-muted-foreground">
                Comment Text
              </label>
              <textarea
                value={bulkCommentText}
                onChange={(e) => setBulkCommentText(e.target.value)}
                placeholder="e.g. Approved and verified as per dispatch sheet #401. Loading site approved."
                rows={4}
                className="w-full rounded-md border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border mt-5 pt-4">
              <button
                onClick={() => {
                  setShowBulkCommentModal(false);
                  setBulkCommentText("");
                }}
                className="px-4 py-2 rounded-md border border-border text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkCommentSubmit}
                disabled={!bulkCommentText.trim()}
                className={`px-4 py-2 rounded-md text-xs font-bold text-white transition ${
                  bulkCommentText.trim()
                    ? "bg-primary hover:bg-primary/90 cursor-pointer"
                    : "bg-input cursor-not-allowed opacity-60"
                }`}
              >
                Apply Comment ({selectedIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
