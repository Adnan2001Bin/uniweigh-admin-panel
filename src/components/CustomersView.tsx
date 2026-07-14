import React, { useState, useMemo, useEffect } from "react";
import {
  Users2,
  X,
  CreditCard,
  Building,
  Mail,
  Phone,
  Layers,
  Calendar,
  Eye,
  CheckCircle,
  AlertTriangle,
  FileCheck2,
  Sparkles,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  FileText,
  User,
  ShieldCheck,
  Ban,
  Search,
  Plus,
  Filter,
  Download,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  Check,
  Edit,
  Trash2,
  Briefcase,
  MapPin,
  UserCheck,
  Receipt,
  History,
  Clock,
  MoreVertical,
  XCircle,
  FileSpreadsheet,
  Settings,
  HelpCircle
} from "lucide-react";
import { Customer, Transaction, TransactionStatus } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { SelectBox } from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import PageHeader, { PAGE_HEADER_ADD_BUTTON_CLASS } from "@/src/components/shared/PageHeader";
import StatusBadge from "@/src/components/shared/StatusBadge";
import { TABLE_ACTION_ICON_BUTTON_CLASS } from "@/src/components/shared/table-action-styles";
import FormPage, {
  FORM_PAGE_INPUT_CLASS,
  FORM_PAGE_SELECT_CLASS,
  FORM_PAGE_TEXTAREA_CLASS,
  FORM_PAGE_SECTION_CLASS,
  FORM_PAGE_LABEL_CLASS
} from "@/src/components/shared/FormPage";

const CUSTOMER_DETAIL_ACTION_CLASS =
  "inline-flex h-9 items-center justify-center rounded-md text-xs font-bold transition cursor-pointer shadow-xs";

interface CustomersViewProps {
  customers: Customer[];
  onUpdateCustomer: (updatedCustomer: Customer) => void;
  searchQuery: string;
  transactions?: Transaction[];
}

export default function CustomersView({
  customers,
  onUpdateCustomer,
  searchQuery: topSearchQuery,
  transactions = []
}: CustomersViewProps) {
  // Core UI layout states
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewTab, setPreviewTab] = useState<"overview" | "commercial" | "related" | "audit">("overview");

  // Filter States
  const [localSearch, setLocalSearch] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterPricingTier, setFilterPricingTier] = useState<string>("All");
  const [filterActiveContracts, setFilterActiveContracts] = useState<string>("All");
  const [filterAccountBalance, setFilterAccountBalance] = useState<string>("All");
  const [filterState, setFilterState] = useState<string>("All");
  const [filterCreatedDate, setFilterCreatedDate] = useState<string>("");
  const [filterLastTxDate, setFilterLastTxDate] = useState<string>("");

  // Column visibility states
  const [showColumnDropdown, setShowColumnDropdown] = useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    id: true,
    code: true,
    clientNumber: true,
    name: true,
    contact: true,
    phone: false,
    mobile: false,
    email: false,
    address: true, // Primary Address (enabled by default)
    suburb: false,
    state: false,
    pricingTier: true,
    contracts: true, // Active Contract
    balance: true, // Account Balances
    pricingTierOrState: true,
    status: true,
    lastTx: true, // Last Transaction Date
    createdOn: false,
    actions: true
  });

  // Checklist Selection for bulk/selected operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // View mode: list | add | edit (detail preview uses showPreview separately)
  const [currentMode, setCurrentMode] = useState<"list" | "add" | "edit">("list");
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  // Form Field States
  const [formName, setFormName] = useState<string>("");
  const [formCode, setFormCode] = useState<string>("");
  const [formContact, setFormContact] = useState<string>("");
  const [formEmail, setFormEmail] = useState<string>("");
  const [formPhone, setFormPhone] = useState<string>("");
  const [formMobile, setFormMobile] = useState<string>("");
  const [formFax, setFormFax] = useState<string>("");
  const [formAddress1, setFormAddress1] = useState<string>("");
  const [formAddress2, setFormAddress2] = useState<string>("");
  const [formSuburb, setFormSuburb] = useState<string>("");
  const [formState, setFormState] = useState<string>("");
  const [formPostcode, setFormPostcode] = useState<string>("");
  const [formClientSince, setFormClientSince] = useState<string>("");
  const [formPricingTier, setFormPricingTier] = useState<string>("");
  const [formBalance, setFormBalance] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<"Active" | "Suspended">("Active");
  const [formNotes, setFormNotes] = useState<string>("");

  // Export states
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportScope, setExportScope] = useState<"current" | "selected" | "filtered" | "profile" | "txSummary" | "jobsReport">("current");
  const [exportFormat, setExportFormat] = useState<"CSV" | "Excel" | "PDF">("CSV");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string>("");

  // Refresh spinner state
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshNotification, setRefreshNotification] = useState<string>("");

  // Quick reset helper
  const resetFilters = () => {
    setFilterStatus("All");
    setFilterPricingTier("All");
    setFilterActiveContracts("All");
    setFilterAccountBalance("All");
    setFilterState("All");
    setFilterCreatedDate("");
    setFilterLastTxDate("");
    setLocalSearch("");
  };

  const isFiltersActive = useMemo(() => {
    return (
      filterStatus !== "All" ||
      filterPricingTier !== "All" ||
      filterActiveContracts !== "All" ||
      filterAccountBalance !== "All" ||
      filterState !== "All" ||
      filterCreatedDate !== "" ||
      filterLastTxDate !== ""
    );
  }, [filterStatus, filterPricingTier, filterActiveContracts, filterAccountBalance, filterState, filterCreatedDate, filterLastTxDate]);

  // Handle Refresh simulation
  const handleRefreshDataset = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshNotification("Customer directory records synchronized with main ledger.");
      setTimeout(() => setRefreshNotification(""), 4000);
    }, 900);
  };

  // Combine top search query and local search
  const effectiveSearch = (topSearchQuery || localSearch).trim().toLowerCase();

  // Process filters
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // 1. Text Search
      if (effectiveSearch) {
        const matchText = [
          c.id,
          c.customerCode,
          c.name,
          c.contactPerson,
          c.email,
          c.phone,
          c.billingAddress,
          c.suburbName,
          c.stateCode,
          c.postCodeVal
        ].join(" ").toLowerCase();
        if (!matchText.includes(effectiveSearch)) return false;
      }

      // 2. Status Filter
      if (filterStatus !== "All" && c.status !== filterStatus) return false;

      // 3. Pricing Tier Filter
      if (filterPricingTier !== "All") {
        const tierStr = (c.pricingTier || "").toLowerCase();
        if (filterPricingTier === "Tier 1" && !tierStr.includes("tier 1")) return false;
        if (filterPricingTier === "Tier 2" && !tierStr.includes("tier 2")) return false;
        if (filterPricingTier === "Tier 3" && !tierStr.includes("tier 3")) return false;
        if (filterPricingTier === "Tier 4" && !tierStr.includes("tier 4")) return false;
      }

      // 4. Active Contracts Filter
      if (filterActiveContracts !== "All") {
        const hasContracts = (c.activeContracts || 0) > 0;
        if (filterActiveContracts === "Has Contracts" && !hasContracts) return false;
        if (filterActiveContracts === "No Contracts" && hasContracts) return false;
      }

      // 5. Account Balance Filter
      if (filterAccountBalance !== "All") {
        const bal = c.accountBalance || 0;
        if (filterAccountBalance === "Debit Balance" && bal <= 0) return false; // owes money
        if (filterAccountBalance === "Credit Balance" && bal >= 0) return false; // negative balance
        if (filterAccountBalance === "Zero Balance" && bal !== 0) return false;
      }

      // 6. State Filter
      if (filterState !== "All") {
        const stateStr = (c.stateCode || c.billingAddress || "").toUpperCase();
        if (!stateStr.includes(filterState)) return false;
      }

      // 7. Created Date Filter
      if (filterCreatedDate && c.createdOn) {
        if (!c.createdOn.includes(filterCreatedDate)) return false;
      }

      // 8. Last Transaction Date Filter
      if (filterLastTxDate && c.lastTransactionDate) {
        if (!c.lastTransactionDate.includes(filterLastTxDate)) return false;
      }

      return true;
    });
  }, [customers, effectiveSearch, filterStatus, filterPricingTier, filterActiveContracts, filterAccountBalance, filterState, filterCreatedDate, filterLastTxDate]);

  // Row Selection Helpers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredCustomers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCustomers.map((c) => c.id));
    }
  };

  const handleToggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Find active customer object for preview panel
  const activeCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // Compute stats for the active preview customer from real transactions
  const activeCustomerStats = useMemo(() => {
    if (!activeCustomer) return { totalTonnes: 0, totalRevenue: 0, matchingTxs: [] as Transaction[] };
    const matchingTxs = transactions.filter((t) => t.customerId === activeCustomer.id);
    const totalTonnes = matchingTxs.reduce((sum, t) => sum + (t.netWeight || 0), 0);
    const totalRevenue = matchingTxs.reduce((sum, t) => sum + (t.totalValue || 0), 0);
    return { totalTonnes, totalRevenue, matchingTxs };
  }, [activeCustomer, transactions]);

  // Simulated static details for related records (Jobs)
  const customerJobs = useMemo(() => {
    if (!activeCustomer) return [];
    const cid = activeCustomer.id;
    if (cid === "C-401") {
      return [
        { id: "JOB-401-01", ref: "PO-2024-991", product: "20mm Class 3 Crushed Rock", orderQty: 50000, delQty: 31450.25, status: "Active" },
        { id: "JOB-401-02", ref: "PO-2023-884", product: "Class 1 Crushed Rock", orderQty: 12500, delQty: 12500, status: "Completed" }
      ];
    } else if (cid === "C-402") {
      return [
        { id: "JOB-402-01", ref: "PO-2024-001", product: "10mm Bayside Sand Blend", orderQty: 20000, delQty: 14205.50, status: "Active" }
      ];
    } else if (cid === "C-403") {
      return [
        { id: "JOB-403-01", ref: "PO-2025-PINN", product: "Pinnacle Concrete Sand", orderQty: 10000, delQty: 9800.00, status: "Active" }
      ];
    } else if (cid === "C-404") {
      return [
        { id: "JOB-404-01", ref: "REF-BOURKE-4", product: "Class 1 Crushed Rock", orderQty: 150000, delQty: 121540.20, status: "Active" }
      ];
    } else if (cid === "C-405") {
      return [
        { id: "JOB-405-01", ref: "PO-YARRA-ECO", product: "Premium Eco Topsoil", orderQty: 5000, delQty: 3150.00, status: "Active" }
      ];
    } else {
      return [
        { id: `JOB-${cid}-01`, ref: `REF-${cid}-01`, product: "Standard Aggregate Supply", orderQty: 15000, delQty: 2450.10, status: "Active" }
      ];
    }
  }, [activeCustomer]);

  // Add / Edit Customer form validation & submission
  const openAddModal = () => {
    // Reset state fields to blank for creating
    setFormName("");
    setFormCode("");
    setFormContact("");
    setFormEmail("");
    setFormPhone("");
    setFormMobile("");
    setFormFax("");
    setFormAddress1("");
    setFormAddress2("");
    setFormSuburb("");
    setFormState("VIC");
    setFormPostcode("");
    setFormClientSince("2026");
    setFormPricingTier("Tier 1 - Standard Rate");
    setFormBalance(0);
    setFormStatus("Active");
    setFormNotes("");
    setCurrentMode("add");
  };

  const openEditModal = (c: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomerToEdit(c);
    setFormName(c.name);
    setFormCode(c.customerCode || "");
    setFormContact(c.contactPerson);
    setFormEmail(c.email);
    setFormPhone(c.phone);
    setFormMobile(c.mobileNo || "");
    setFormFax(c.fax || "");
    setFormAddress1(c.addressLine1 || c.billingAddress);
    setFormAddress2(c.addressLine2 || "");
    setFormSuburb(c.suburbName || "");
    setFormState(c.stateCode || "VIC");
    setFormPostcode(c.postCodeVal || "");
    setFormClientSince(c.clientSince || "2026");
    setFormPricingTier(c.pricingTier || "Tier 1 - Standard Rate");
    setFormBalance(c.accountBalance || 0);
    setFormStatus(c.status);
    setFormNotes(c.notes || "");
    setShowPreview(false);
    setCurrentMode("edit");
  };

  const handleSaveCustomer = (addAnother: boolean) => {
    if (!formName.trim() || !formContact.trim() || !formEmail.trim() || !formPhone.trim()) {
      toast.info("Please fill in all mandatory fields: Customer Name, Contact Person, Email, and Phone.");
      return;
    }

    const nextId = "C-" + (400 + customers.length + 1);
    const calculatedBillingAddress = `${formAddress1}${formAddress2 ? ", " + formAddress2 : ""}, ${formSuburb} ${formState} ${formPostcode}`.trim();

    const newCustomer: Customer = {
      id: currentMode === "edit" && customerToEdit ? customerToEdit.id : nextId,
      name: formName,
      contactPerson: formContact,
      email: formEmail,
      phone: formPhone,
      status: formStatus,
      billingAddress: calculatedBillingAddress || "VIC Australia",
      paymentTerms: formPricingTier.includes("Major") ? "60 Days Net" : formPricingTier.includes("Volume") ? "30 Days Net" : "14 Days Net",
      creditLimit: formStatus === "Suspended" ? 0 : formPricingTier.includes("Major") ? 800000 : formPricingTier.includes("Volume") ? 250000 : 50000,
      activeContracts: currentMode === "edit" && customerToEdit ? customerToEdit.activeContracts : 1,
      recentActivityDate: new Date().toISOString().split("T")[0],

      customerCode: formCode || formName.replace(/\s+/g, "").slice(0, 10).toUpperCase(),
      mobileNo: formMobile,
      fax: formFax,
      addressLine1: formAddress1,
      addressLine2: formAddress2,
      suburbName: formSuburb,
      stateCode: formState,
      postCodeVal: formPostcode,
      pricingTier: formPricingTier,
      accountBalance: formBalance,
      lastTransactionDate: currentMode === "edit" && customerToEdit ? customerToEdit.lastTransactionDate : new Date().toISOString().split("T")[0],
      createdOn: currentMode === "edit" && customerToEdit ? customerToEdit.createdOn : new Date().toISOString().split("T")[0],
      createdBy: currentMode === "edit" && customerToEdit ? customerToEdit.createdBy : "Admin User",
      modifiedOn: new Date().toISOString().split("T")[0],
      modifiedBy: "Admin User",
      notes: formNotes,
      clientSince: formClientSince
    };

    onUpdateCustomer(newCustomer);

    if (currentMode === "edit") {
      setCurrentMode("list");
      setCustomerToEdit(null);
      toast.success(`Customer record for "${formName}" updated successfully.`);
    } else {
      toast.success(`New customer "${formName}" added successfully with ID ${nextId}.`);
      if (addAnother) {
        // Clear fields except defaults for another add
        setFormName("");
        setFormCode("");
        setFormContact("");
        setFormEmail("");
        setFormPhone("");
        setFormMobile("");
        setFormFax("");
        setFormAddress1("");
        setFormAddress2("");
        setFormSuburb("");
        setFormPostcode("");
        setFormNotes("");
      } else {
        setCurrentMode("list");
      }
    }
  };

  // Export report flow simulation
  const handleTriggerExport = (scopeName?: string, formatOverride?: "CSV" | "Excel" | "PDF") => {
    const scopeToUse = scopeName || exportScope;
    const formatToUse = formatOverride || exportFormat;
    
    setIsExporting(true);
    setExportProgress(5);
    setExportSuccessMessage("");

    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExporting(false);
            
            let reportName = "Report";
            if (scopeToUse === "profile") {
              reportName = `Customer Profile - ${activeCustomer?.name || "Customer"}`;
            } else if (scopeToUse === "jobs") {
              reportName = `Jobs list for ${activeCustomer?.name || "Customer"}`;
            } else if (scopeToUse === "transactions") {
              reportName = `Transactions ledger for ${activeCustomer?.name || "Customer"}`;
            } else if (scopeToUse === "invoices") {
              reportName = `Invoices registry for ${activeCustomer?.name || "Customer"}`;
            } else if (scopeToUse === "current") {
              reportName = "Current Customer List";
            } else if (scopeToUse === "selected") {
              reportName = `${selectedIds.length} Selected Customer(s)`;
            } else if (scopeToUse === "filtered") {
              reportName = `${filteredCustomers.length} Filtered Customer(s)`;
            } else {
              reportName = "Registered Job/Contracts Audit Report";
            }

            setExportSuccessMessage(`Download Completed! "${reportName}" saved successfully as uniweigh_export_${Date.now()}.${formatToUse.toLowerCase()}`);
          }, 350);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 10;
      });
    }, 150);
  };

  // Helper safe avatars
  const getInitials = (name: string) => {
    if (!name) return "C";
    return name
      .split(" ")
      .map((n) => n[0] || "")
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (showPreview && activeCustomer) {
    const { matchingTxs } = activeCustomerStats;
    return (
      <div className="space-y-6 animate-fade-in" id="customer-detail-page">
        {/* Dynamic Alerts / Notifications inside details view if needed */}
        {refreshNotification && (
          <div className="bg-primary text-white px-5 py-3 rounded-md flex items-center justify-between text-xs font-semibold shadow-lg animate-bounce">
            <span className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>{refreshNotification}</span>
            </span>
            <button onClick={() => setRefreshNotification("")} className="text-white/80 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {exportSuccessMessage && (
          <div className="bg-success text-white px-5 py-4 rounded-md flex items-start gap-3 justify-between text-xs font-semibold shadow-lg">
            <span className="flex items-start gap-2">
              <FileCheck2 className="h-5 w-5 text-success-foreground shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm">Export File Generated</div>
                <p className="text-success-foreground mt-1 font-normal leading-relaxed">{exportSuccessMessage}</p>
              </div>
            </span>
            <button onClick={() => setExportSuccessMessage("")} className="text-white/80 hover:text-white">
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        )}

        {/* Return Navigation */}
        <button
          type="button"
          onClick={() => {
            setShowPreview(false);
            setPreviewTab("jobs");
          }}
          className="group inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-info transition bg-card border border-border rounded-md px-3.5 py-2 shadow-xs cursor-pointer"
          title="Return to customer registry"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Directory</span>
        </button>

        {/* Hero header card — matches Ticket Detail layout */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card border border-border rounded-md px-6 py-5 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-muted border border-border text-info flex items-center justify-center font-bold text-lg shadow-inner shrink-0">
              {getInitials(activeCustomer.name)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Customer ID: {activeCustomer.id}
                </span>
                <StatusBadge status={activeCustomer.status} className="rounded-md" />
                <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-foreground">
                  {activeCustomer.customerCode || "N/A"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 mt-1">
                <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                  {activeCustomer.name}
                </h1>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground bg-muted border border-border rounded-md px-2.5 py-1 select-none">
                  <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Client Number: CL-100{activeCustomer.id.replace("C-", "")}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 self-start md:self-center items-center">
            <button
              type="button"
              onClick={(e) => openEditModal(activeCustomer, e)}
              className={`${CUSTOMER_DETAIL_ACTION_CLASS} gap-1.5 border border-border bg-card px-4 text-foreground hover:bg-muted`}
            >
              <Edit className="h-4 w-4 shrink-0" />
              <span>Edit Account Parameters</span>
            </button>
            <button
              type="button"
              onClick={handleRefreshDataset}
              title="Refresh profile details"
              className={`${CUSTOMER_DETAIL_ACTION_CLASS} w-9 border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted ${isRefreshing ? "bg-muted" : ""}`}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-info" : ""}`} />
            </button>
          </div>
        </div>

        {/* Main grid: left metadata (4) + right expanded profile (8) — matches Ticket Detail */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Left column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-card border border-border rounded-md p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border pb-2">
                Customer Details
              </h3>
              <div className="space-y-4 text-sm text-foreground font-normal">
                <div className="flex items-start gap-2.5">
                  <CreditCard className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold mb-0.5">Customer ID</div>
                    <div className="font-mono font-bold text-foreground">{activeCustomer.id}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold mb-0.5">Customer Code</div>
                    <div className="font-mono font-bold text-foreground">{activeCustomer.customerCode || "N/A"}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Building className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold mb-0.5">Customer Name</div>
                    <div className="font-bold text-foreground">{activeCustomer.name}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold mb-0.5">Primary Contact</div>
                    <div className="font-bold text-foreground">{activeCustomer.contactPerson}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold mb-0.5">Phone Number</div>
                    <div className="font-semibold text-foreground">{activeCustomer.phone}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Mobile: {activeCustomer.mobileNo || "N/A"}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold mb-0.5">Email Address</div>
                    <div className="font-semibold text-foreground select-all">{activeCustomer.email}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold mb-0.5">Status</div>
                    <StatusBadge status={activeCustomer.status} className="mt-0.5 rounded-md" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted border border-border rounded-md p-4 text-xs space-y-2">
              <span className="font-bold text-foreground block uppercase tracking-wider text-xs">
                Account Snapshot
              </span>
              <div className="space-y-1.5 font-medium">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Linked Jobs:</span>
                  <span className="text-foreground font-mono font-bold">{customerJobs.length}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Linked Transactions:</span>
                  <span className="text-foreground font-mono font-bold">{matchingTxs.length}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Account State:</span>
                  <span className={activeCustomer.status === "Active" ? "text-success font-bold" : "text-destructive font-bold"}>
                    {activeCustomer.status === "Active" ? "Operational" : activeCustomer.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column — wide profile card */}
          <div className="lg:col-span-8 bg-card border border-border rounded-md shadow-xs overflow-hidden">
            <div className="p-6 space-y-6 text-sm leading-relaxed text-foreground min-h-[360px]">
              <div>
                <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2">
                  Address & Commercial Profile
                </h4>
                <p className="text-xs text-muted-foreground">
                  Registered billing locality and commercial trading parameters for this customer account.
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
                    <div className="text-sm font-bold text-foreground mt-0.5">
                      {activeCustomer.addressLine1 || activeCustomer.billingAddress?.split(',')[0] || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address Line 2</div>
                    <div className="text-sm font-semibold text-foreground mt-0.5">{activeCustomer.addressLine2 || "N/A"}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Suburb</div>
                      <div className="text-sm font-semibold text-foreground mt-0.5">{activeCustomer.suburbName || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">State</div>
                      <div className="text-sm font-semibold text-foreground mt-0.5">{activeCustomer.stateCode || "VIC"}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Postcode</div>
                      <div className="text-sm font-mono font-bold text-foreground mt-0.5">{activeCustomer.postCodeVal || "N/A"}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 border-b border-border pb-5">
                <div className="p-3 bg-muted border border-border rounded-md">
                  <div className="text-xs text-muted-foreground font-bold flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                    Product Rule / Pricing Tier
                  </div>
                  <div className="mt-1.5">
                    <span className="inline-flex items-center rounded-md border border-info/25 bg-info/10 px-2.5 py-0.5 text-xs font-bold font-mono text-info">
                      {activeCustomer.pricingTier || "Tier 1 - Standard"}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-muted border border-border rounded-md">
                  <div className="text-xs text-muted-foreground font-bold flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    Client Since
                  </div>
                  <div className="text-xs font-semibold text-foreground font-mono mt-1">
                    {activeCustomer.clientSince || "2024"}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                  Operational Notes
                </h4>
                <div className="p-4 rounded-md bg-warning/10 border border-warning/30 text-xs font-medium italic text-warning">
                  &ldquo;{activeCustomer.notes || "No operational notes recorded."}&rdquo;
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* WORKSPACE AREA */}
        {/* TWO TABS CONTAINER */}
        <div className="space-y-4">
          <div className="border-b border-border">
            <nav className="flex gap-6 -mb-px">
              {[
                { id: "jobs", label: "Jobs", count: customerJobs.length },
                { id: "transactions", label: "Transactions", count: matchingTxs.length }
              ].map((tab) => {
                const isActive = previewTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setPreviewTab(tab.id as any)}
                    className={`pb-4 px-1 border-b-2 text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? "border-primary text-info font-bold"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-input"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                      isActive ? "bg-info/10 text-info" : "bg-muted text-muted-foreground"
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* TAB CONTENT */}
          <div className="bg-card border border-border rounded-md shadow-xs overflow-hidden w-full">
            
            {/* JOBS TAB */}
            {previewTab === "jobs" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
                      <th className="px-6 py-3">Job ID</th>
                      <th className="px-6 py-3">Customer Order Reference</th>
                      <th className="px-6 py-3">Product</th>
                      <th className="px-6 py-3 text-right">Order Quantity</th>
                      <th className="px-6 py-3 text-right">Delivered Quantity</th>
                      <th className="px-6 py-3 text-right">Remaining Quantity</th>
                      <th className="px-6 py-3 text-center">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {customerJobs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-10 text-muted-foreground font-medium">
                          No jobs found for this customer.
                        </td>
                      </tr>
                    ) : (
                      customerJobs.map((job) => {
                        const remaining = Math.max(0, job.orderQty - job.delQty);
                        return (
                          <tr key={job.id} className="hover:bg-muted transition-colors">
                            <td className="px-6 py-3.5 font-mono font-bold text-foreground">{job.id}</td>
                            <td className="px-6 py-3.5 font-semibold text-foreground">{job.ref}</td>
                            <td className="px-6 py-3.5 font-medium text-foreground">{job.product}</td>
                            <td className="px-6 py-3.5 text-right font-mono text-foreground">{job.orderQty.toLocaleString()} t</td>
                            <td className="px-6 py-3.5 text-right font-mono text-success font-semibold">{job.delQty.toLocaleString()} t</td>
                            <td className="px-6 py-3.5 text-right font-mono text-foreground font-semibold">
                              {remaining === 0 ? (
                                <span className="text-muted-foreground">0.00 t (Filled)</span>
                              ) : (
                                <span>{remaining.toLocaleString()} t</span>
                              )}
                            </td>
                            <td className="px-6 py-3.5 text-center">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                                job.status === "Active"
                                  ? "bg-success/10 text-success"
                                  : "bg-info/10 text-info"
                              }`}>
                                {job.status}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-right">
                              <button
                                onClick={() => toast.info(`Reviewing operational ledger dossier for supply contract reference ${job.ref}`)}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-info hover:text-info hover:underline cursor-pointer"
                              >
                                <FileText className="h-3 w-3" />
                                <span>Details</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TRANSACTIONS TAB */}
            {previewTab === "transactions" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
                      <th className="px-4 py-3">Transaction ID</th>
                      <th className="px-4 py-3">Transaction Type</th>
                      <th className="px-4 py-3">Ticket Number</th>
                      <th className="px-4 py-3">Transaction Code</th>
                      <th className="px-4 py-3">Job</th>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Lot</th>
                      <th className="px-4 py-3 text-right">Net Weight</th>
                      <th className="px-4 py-3 text-right">Total Amount</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3">Created Date</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {matchingTxs.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="text-center py-10 text-muted-foreground font-medium">
                          No weight-bridge ticket transactions recorded for this customer.
                        </td>
                      </tr>
                    ) : (
                      matchingTxs.map((t) => (
                        <tr key={t.id} className="hover:bg-muted transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-foreground">{t.id}</td>
                          <td className="px-4 py-3 font-semibold text-foreground">
                            <span className="capitalize">{t.type}</span>
                          </td>
                          <td className="px-4 py-3 font-mono text-foreground">{t.ticketNo}</td>
                          <td className="px-4 py-3 font-mono text-muted-foreground">{t.transactionCode || `TC-${t.id.replace("TX-", "")}`}</td>
                          <td className="px-4 py-3 font-mono text-muted-foreground">{t.jobOrder || "N/A"}</td>
                          <td className="px-4 py-3 font-medium text-foreground truncate max-w-[150px]">{t.productName}</td>
                          <td className="px-4 py-3 font-mono text-muted-foreground">{t.lotNo || "LOT-1"}</td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-foreground">{t.netWeight.toLocaleString()} t</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-foreground">
                            ${(t.totalValue || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                              t.status === "Approved" ? "bg-success/10 text-success" :
                              t.status === "Pending" ? "bg-warning/10 text-warning" :
                              t.status === "Invoiced" ? "bg-info/10 text-info" :
                              "bg-muted text-foreground"
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground font-medium">{t.firstWeighTime.split("T")[0]}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => toast.info(`Reviewing weight bridge ticket record ${t.ticketNo}`)}
                              className="text-info hover:text-info font-bold hover:underline cursor-pointer"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}


          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-4" id="customers-module-container">
      {/* Dynamic Alerts / Notifications */}
      {refreshNotification && (
        <div className="bg-primary text-white px-5 py-3 rounded-md flex items-center justify-between text-xs font-semibold shadow-lg animate-bounce">
          <span className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>{refreshNotification}</span>
          </span>
          <button onClick={() => setRefreshNotification("")} className="text-white/80 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {exportSuccessMessage && (
        <div className="bg-success text-white px-5 py-4 rounded-md flex items-start gap-3 justify-between text-xs font-semibold shadow-lg">
          <span className="flex items-start gap-2">
            <FileCheck2 className="h-5 w-5 text-success-foreground shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">Export File Generated</div>
              <p className="text-success-foreground mt-1 font-normal leading-relaxed">{exportSuccessMessage}</p>
            </div>
          </span>
          <button onClick={() => setExportSuccessMessage("")} className="text-white/80 hover:text-white">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      )}

      {/* Main Module Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT HAND PANE: CUSTOMER DIRECTORY TABLE AND TOPBAR */}
        <div className="lg:col-span-12 space-y-4 transition-all duration-300">
          
          <PageHeader
            title="Customers"
            icon={Users2}
            breadcrumbs={[
              { label: "Customers & Sales" },
              { label: "Customers" },
            ]}
            actions={
              currentMode === "list" ? (
                <button
                  type="button"
                  onClick={openAddModal}
                  className={PAGE_HEADER_ADD_BUTTON_CLASS}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Customer</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentMode("list");
                    setCustomerToEdit(null);
                  }}
                  className="inline-flex h-9 items-center justify-center rounded-md text-xs font-bold transition cursor-pointer gap-2 border border-border bg-card px-3 text-foreground shadow-xs hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  <span>Back to Listing</span>
                </button>
              )
            }
          />

          {currentMode === "list" && (
            <>
              {/* Top toolbar */}
              <div className="bg-card border border-border rounded-md p-4 shadow-xs flex flex-wrap gap-3 items-center justify-between">
                {/* Search Input bar */}
                <div className="relative w-full sm:max-w-xs shrink-0">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="w-full rounded-md border border-border bg-card pl-9.5 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition"
                  />
                  {(localSearch || topSearchQuery) && (
                    <button 
                      onClick={() => setLocalSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground p-0.5 rounded"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Customers Registry Table */}
              <div className="bg-card border border-border rounded-md shadow-xs overflow-hidden w-full">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
                        <th className="px-4 py-3.5">Customer ID</th>
                        <th className="px-4 py-3.5">Customer Name</th>
                        <th className="px-4 py-3.5">Primary Contact</th>
                        <th className="px-4 py-3.5">Phone Number</th>
                        <th className="px-4 py-3.5">Email Address</th>
                        <th className="px-4 py-3.5 text-center">Status</th>
                        <th className="px-4 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-10 text-muted-foreground font-medium text-xs">
                            <XCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <span>No customer records matching search criteria.</span>
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map((c) => {
                          return (
                            <tr
                              key={c.id}
                              className="group text-xs transition-colors hover:bg-muted cursor-pointer"
                              onClick={() => {
                                setSelectedCustomerId(c.id);
                                setShowPreview(true);
                              }}
                            >
                              <td className="px-4 py-3.5 font-mono font-bold text-muted-foreground">{c.id}</td>
                              <td className="px-4 py-3.5 font-bold text-foreground group-hover:text-info hover:underline transition-colors">
                                {c.name}
                              </td>
                              <td className="px-4 py-3.5 font-semibold text-foreground">{c.contactPerson}</td>
                              <td className="px-4 py-3.5 text-muted-foreground font-medium">{c.phone || "N/A"}</td>
                              <td className="px-4 py-3.5 text-muted-foreground select-all font-medium">{c.email || "N/A"}</td>
                              <td className="px-4 py-3.5 text-center">
                                <span
                                  className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                                    c.status === "Active"
                                      ? "bg-success/10 text-success border border-success/25"
                                      : "bg-destructive/10 text-destructive border border-destructive/25"
                                  }`}
                                >
                                  {c.status}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-right font-semibold text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedCustomerId(c.id);
                                      setShowPreview(true);
                                    }}
                                    className={TABLE_ACTION_ICON_BUTTON_CLASS}
                                    title="View Customer Details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => openEditModal(c, e)}
                                    className={TABLE_ACTION_ICON_BUTTON_CLASS}
                                    title="Edit Customer Details"
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

                {/* Pagination / Table Summary Footer */}
                <div className="border-t border-border px-5 py-3 flex items-center justify-between bg-muted">
                  <span className="text-xs text-muted-foreground font-semibold">
                    Showing {filteredCustomers.length} of {customers.length} customer records
                  </span>
                  <div className="flex gap-1">
                    <button disabled className="rounded border border-border bg-muted px-2 py-1 text-xs text-muted-foreground cursor-not-allowed">
                      Previous
                    </button>
                    <button disabled className="rounded border border-primary bg-info/10 px-2.5 py-1 text-xs text-info font-bold">
                      1
                    </button>
                    <button disabled className="rounded border border-border bg-muted px-2 py-1 text-xs text-muted-foreground cursor-not-allowed">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {(currentMode === "add" || currentMode === "edit") && (
            <FormPage
              icon={Users2}
              title={currentMode === "add" ? "Add New Customer Profile" : `Edit Customer: ${customerToEdit?.name}`}
              subtitle="Manage customer contact details, billing address, and commercial rules."
              modeBadge={currentMode === "add" ? "Draft Mode" : "Modifying Live Record"}
              saveLabel={currentMode === "add" ? "Save Customer" : "Save Changes"}
              onSaveAndAddAnother={currentMode === "add" ? () => handleSaveCustomer(true) : undefined}
              onCancel={() => {
                setCurrentMode("list");
                setCustomerToEdit(null);
              }}
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveCustomer(false);
              }}
            >
              {/* SECTION 1: CUSTOMER DETAILS */}
              <div className="p-6 space-y-4">
                <h4 className={FORM_PAGE_SECTION_CLASS}>
                  <Building className="h-4 w-4 text-info" />
                  <span>Customer Details {currentMode === "add" && "(Mandatory)"}</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={FORM_PAGE_LABEL_CLASS}>Customer Name *</label>
                    <Input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Acme Roadworks Ltd"
                      className={FORM_PAGE_INPUT_CLASS}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={FORM_PAGE_LABEL_CLASS}>Customer Code (Optional)</label>
                    <Input
                      type="text"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      placeholder="e.g. ACMEROAD"
                      className={FORM_PAGE_INPUT_CLASS}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={FORM_PAGE_LABEL_CLASS}>Contact Person *</label>
                    <Input
                      type="text"
                      value={formContact}
                      onChange={(e) => setFormContact(e.target.value)}
                      placeholder="e.g. John Doe"
                      className={FORM_PAGE_INPUT_CLASS}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={FORM_PAGE_LABEL_CLASS}>Email address *</label>
                    <Input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="e.g. billing@acme.com"
                      className={FORM_PAGE_INPUT_CLASS}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={FORM_PAGE_LABEL_CLASS}>Phone *</label>
                    <Input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="e.g. +61 3 9988 7766"
                      className={FORM_PAGE_INPUT_CLASS}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={FORM_PAGE_LABEL_CLASS}>Mobile Phone</label>
                    <Input
                      type="text"
                      value={formMobile}
                      onChange={(e) => setFormMobile(e.target.value)}
                      placeholder="e.g. +61 400 999 888"
                      className={FORM_PAGE_INPUT_CLASS}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={FORM_PAGE_LABEL_CLASS}>Fax</label>
                    <Input
                      type="text"
                      value={formFax}
                      onChange={(e) => setFormFax(e.target.value)}
                      placeholder="e.g. +61 3 9988 7767"
                      className={FORM_PAGE_INPUT_CLASS}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: ADDRESS */}
              <div className="p-6 space-y-4 bg-muted border-t border-border">
                <h4 className={FORM_PAGE_SECTION_CLASS}>
                  <MapPin className="h-4 w-4 text-success" />
                  <span>Billing Address Details</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={FORM_PAGE_LABEL_CLASS}>Address Line 1</label>
                    <Input
                      type="text"
                      value={formAddress1}
                      onChange={(e) => setFormAddress1(e.target.value)}
                      placeholder="e.g. 100 Industrial Parkway"
                      className={FORM_PAGE_INPUT_CLASS}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={FORM_PAGE_LABEL_CLASS}>Address Line 2</label>
                    <Input
                      type="text"
                      value={formAddress2}
                      onChange={(e) => setFormAddress2(e.target.value)}
                      placeholder="e.g. Warehouse B"
                      className={FORM_PAGE_INPUT_CLASS}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={FORM_PAGE_LABEL_CLASS}>Suburb</label>
                    <Input
                      type="text"
                      value={formSuburb}
                      onChange={(e) => setFormSuburb(e.target.value)}
                      placeholder="e.g. Dandenong"
                      className={FORM_PAGE_INPUT_CLASS}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={FORM_PAGE_LABEL_CLASS}>State</label>
                    <SelectBox
                      value={formState}
                      onChange={(e) => setFormState(e.target.value)}
                      className={FORM_PAGE_SELECT_CLASS}
                    >
                      <option value="VIC">Victoria (VIC)</option>
                      <option value="NSW">New South Wales (NSW)</option>
                      <option value="QLD">Queensland (QLD)</option>
                      <option value="WA">Western Australia (WA)</option>
                      <option value="SA">South Australia (SA)</option>
                      <option value="TAS">Tasmania (TAS)</option>
                    </SelectBox>
                  </div>
                  <div className="space-y-1">
                    <label className={FORM_PAGE_LABEL_CLASS}>Postcode</label>
                    <Input
                      type="text"
                      value={formPostcode}
                      onChange={(e) => setFormPostcode(e.target.value)}
                      placeholder="e.g. 3175"
                      className={FORM_PAGE_INPUT_CLASS}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: COMMERCIAL */}
              <div className="p-6 space-y-4 border-t border-border">
                <h4 className={FORM_PAGE_SECTION_CLASS}>
                  <DollarSign className="h-4 w-4 text-warning" />
                  <span>Commercial & Financial Rules</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={FORM_PAGE_LABEL_CLASS}>Client Since (Year)</label>
                    <Input
                      type="text"
                      value={formClientSince}
                      onChange={(e) => setFormClientSince(e.target.value)}
                      placeholder="e.g. 2026"
                      className={FORM_PAGE_INPUT_CLASS}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={FORM_PAGE_LABEL_CLASS}>Product Rule / Pricing Tier</label>
                    <SelectBox
                      value={formPricingTier}
                      onChange={(e) => setFormPricingTier(e.target.value)}
                      className={FORM_PAGE_SELECT_CLASS}
                    >
                      <option value="Tier 1 - Standard Rate">Tier 1 - Standard Rate</option>
                      <option value="Tier 2 - Volume Pricing">Tier 2 - Volume Pricing</option>
                      <option value="Tier 3 - Concrete Aggregate Special">Tier 3 - Concrete Aggregate Special</option>
                      <option value="Tier 4 - Major Infrastructure Rate">Tier 4 - Major Infrastructure Rate</option>
                    </SelectBox>
                  </div>
                  <div className="space-y-1">
                    <label className={FORM_PAGE_LABEL_CLASS}>Initial Account Balance ($)</label>
                    <Input
                      type="number"
                      value={formBalance}
                      onChange={(e) => setFormBalance(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className={FORM_PAGE_INPUT_CLASS}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={FORM_PAGE_LABEL_CLASS}>Account Status</label>
                    <SelectBox
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className={FORM_PAGE_SELECT_CLASS}
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                    </SelectBox>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className={FORM_PAGE_LABEL_CLASS}>Operation Annotations & Notes</label>
                    <Textarea
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="Enter internal dispatch caveats or credit override rules."
                      rows={3}
                      className={FORM_PAGE_TEXTAREA_CLASS}
                    />
                  </div>
                </div>
              </div>
            </FormPage>
          )}
        </div>
      </div>

      {/* MODAL 3: EXPORT REPORTS DIALOG */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-card rounded-md border border-border shadow-lg p-6 relative animate-zoom-in">
            <button onClick={() => setShowExportModal(false)} className="absolute top-4 right-4 p-1.5 rounded-md text-muted-foreground hover:bg-muted transition">
              <X className="h-4.5 w-4.5" />
            </button>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
              <Download className="h-5 w-5 text-info" />
              <span>Export Custom Customer Reports</span>
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Select report scope and output document format to generate bulk ledger dispatches.
            </p>

            {isExporting ? (
              <div className="space-y-4 py-6 text-center">
                <RefreshCw className="h-8 w-8 text-info animate-spin mx-auto" />
                <div className="space-y-1.5 max-w-xs mx-auto">
                  <div className="flex justify-between text-xs font-bold text-muted-foreground">
                    <span>Compiling ledger records...</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-150" style={{ width: `${exportProgress}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase text-muted-foreground">Report Scope</label>
                  <SelectBox
                    value={exportScope}
                    onChange={(e) => setExportScope(e.target.value as any)}
                    className="w-full text-xs rounded-md border border-border bg-card p-2.5 focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="current">Current Customer Directory List ({customers.length} total)</option>
                    <option value="filtered">Filtered Customers Subset ({filteredCustomers.length} matching)</option>
                    <option value="selected" disabled={selectedIds.length === 0}>
                      Selected Customers Only ({selectedIds.length} checked rows)
                    </option>
                    {activeCustomer && (
                      <>
                        <option value="profile">Individual Profile Dossier: {activeCustomer.name}</option>
                        <option value="txSummary">Customer Transaction Weight Ledger Summary</option>
                        <option value="jobsReport">Customer Project Jobs & Contracts Report</option>
                      </>
                    )}
                  </SelectBox>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase text-muted-foreground">Output Format</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["CSV", "Excel", "PDF"].map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setExportFormat(fmt as any)}
                        className={`py-2 rounded-md border text-xs font-bold transition cursor-pointer text-center ${
                          exportFormat === fmt
                            ? "bg-info/10 border-primary text-info"
                            : "bg-card border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {fmt === "CSV" ? "📄 CSV Plain" : fmt === "Excel" ? "📊 MS Excel" : "📕 PDF Document"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 border-t border-border pt-4 mt-5">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTriggerExport}
                    className="px-5 py-2 rounded-md bg-primary hover:bg-primary/90 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Download className="h-4 w-4" />
                    <span>Generate Export File</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
