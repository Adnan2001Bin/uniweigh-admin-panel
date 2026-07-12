import React, { useState, useMemo } from "react";
import {
  Briefcase,
  Eye,
  Edit2,
  Plus,
  Search,
  Download,
  Check,
  X,
  Calendar,
  DollarSign,
  AlertCircle,
  TrendingUp,
  MapPin,
  Activity,
  ChevronRight,
  Filter,
  Layers,
  FileCheck2,
  Clock,
  Shield,
  FileText
} from "lucide-react";
import { Job, Customer, Product, Transaction, TransactionStatus } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { SelectBox } from "@/src/components/ui/select";

interface JobsViewProps {
  jobs: Job[];
  customers: Customer[];
  products: Product[];
  transactions: Transaction[];
  onAddJob: (newJob: Job) => void;
  onUpdateJob: (updatedJob: Job) => void;
  onViewTicketDetails: (ticketId: string) => void;
  searchQuery: string;
}

// Simulated static destinations for each Job
const JOB_DESTINATIONS: Record<string, { id: string; name: string; address: string; phone: string; status: string }[]> = {
  "JOB-2026-01": [
    { id: "DEST-401-01", name: "Melbourne Eastern Quarry Terminal", address: "102 Quarry Rd, Lilydale VIC 3140", phone: "+61 3 9845 2200", status: "Active" },
    { id: "DEST-401-02", name: "Monash Freeway Upgrade Site B", address: "Exit 18, M1 Highway, Glen Waverley VIC 3150", phone: "+61 412 345 611", status: "Active" }
  ],
  "JOB-2026-02": [
    { id: "DEST-402-01", name: "Dandenong South Industrial Depot", address: "88 Industry Blvd, Dandenong South VIC 3175", phone: "+61 3 9522 9900", status: "Active" },
    { id: "DEST-402-02", name: "Bayside Recycling Landfill Yard", address: "12 Beach Rd, Frankston VIC 3199", phone: "+61 3 9522 9922", status: "Inactive" }
  ],
  "JOB-2026-C3": [
    { id: "DEST-403-01", name: "Altona Concrete Blending Complex", address: "Altona Road Gate A, Altona VIC 3018", phone: "+61 411 988 500", status: "Active" }
  ],
  "JOB-2026-04": [
    { id: "DEST-401-03", name: "Western Ring Road Interchange", address: "Furlong Rd, Sunshine VIC 3020", phone: "+61 3 9845 2200", status: "Active" }
  ],
  "JOB-2026-05": [
    { id: "DEST-405-01", name: "Yarra Botanical Gardens Expansion", address: "322 Melba Hwy, Yarra Glen VIC 3775", phone: "+61 422 931 004", status: "Active" }
  ],
  "JOB-2026-06": [
    { id: "DEST-406-01", name: "Gippsland Water Supply Gate 2", address: "Latrobe Rd, Morwell VIC 3840", phone: "+61 422 121 009", status: "Active" }
  ]
};

export default function JobsView({
  jobs,
  customers,
  products,
  transactions,
  onAddJob,
  onUpdateJob,
  onViewTicketDetails,
  searchQuery
}: JobsViewProps) {
  // Navigation modes: 'list' | 'add' | 'edit' | 'detail'
  const [currentMode, setCurrentMode] = useState<"list" | "add" | "edit" | "detail">("list");

  // Selection
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [checkedJobIds, setCheckedJobIds] = useState<string[]>([]);

  // Tabs in Detail view: 'destinations' | 'transactions' | 'pricing'
  const [detailTab, setDetailTab] = useState<"destinations" | "transactions" | "pricing">("destinations");

  // Search & Status filters for Jobs
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [customerFilter, setCustomerFilter] = useState<string>("All");

  // Form states
  const [formOrderRef, setFormOrderRef] = useState("");
  const [formCustomerId, setFormCustomerId] = useState("");
  const [formProductId, setFormProductId] = useState("");
  const [formOrderQty, setFormOrderQty] = useState<number>(10000);
  const [formNotes, setFormNotes] = useState("");
  const [formStatus, setFormStatus] = useState<"Active" | "Completed" | "Suspended">("Active");
  const [formPricingType, setFormPricingType] = useState<Job["pricingType"]>("Default Product Price");

  // Custom Pricing states (toggled on Custom Contract Price)
  const [formCustomRate, setFormCustomRate] = useState<number>(20.00);
  const [formPricingNotes, setFormPricingNotes] = useState("");
  const [formEffectiveFrom, setFormEffectiveFrom] = useState("");
  const [formEffectiveTo, setFormEffectiveTo] = useState("");

  // Export states
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportScope, setExportScope] = useState<"current" | "selected" | "filtered" | "individual" | "txs" | "pricing">("current");
  const [exportFormat, setExportFormat] = useState<"CSV" | "Excel" | "PDF">("CSV");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportMessage, setExportMessage] = useState("");

  // Target Job for detail view
  const activeJob = useMemo(() => {
    return jobs.find((j) => j.id === selectedJobId) || null;
  }, [jobs, selectedJobId]);

  // Helper: Retrieve rates from product
  const getProductTiers = (prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return { tier1: 0, tier2: 0, tier3: 0, basePrice: 0 };
    const t1 = prod.pricingTiers?.find((t) => t.tier === "Tier 1")?.pricePerTonne ?? prod.basePrice;
    const t2 = prod.pricingTiers?.find((t) => t.tier === "Tier 2")?.pricePerTonne ?? Number((prod.basePrice * 0.93).toFixed(2));
    const t3 = prod.pricingTiers?.find((t) => t.tier === "Tier 3")?.pricePerTonne ?? Number((prod.basePrice * 0.86).toFixed(2));
    return {
      tier1: t1,
      tier2: t2,
      tier3: t3,
      basePrice: prod.basePrice
    };
  };

  // Helper: Get customer's pricing tier level (1, 2, or 3)
  const getCustomerTierLevel = (cust: Customer | undefined) => {
    if (!cust) return 1;
    const tierStr = cust.pricingTier || "";
    if (tierStr.includes("Tier 2")) return 2;
    if (tierStr.includes("Tier 3")) return 3;
    return 1;
  };

  // Helper: Get customer tier rate for product
  const getCustomerTierRate = (custId: string, prodId: string) => {
    const cust = customers.find((c) => c.id === custId);
    const tiers = getProductTiers(prodId);
    const level = getCustomerTierLevel(cust);
    if (level === 2) return { level: 2, label: "Tier 2 - Volume Pricing", rate: tiers.tier2 };
    if (level === 3) return { level: 3, label: "Tier 3 - Premium Corporate", rate: tiers.tier3 };
    return { level: 1, label: "Tier 1 - Standard Rate", rate: tiers.tier1 };
  };

  // Dynamic pricing calculation helper
  const availableRates = useMemo(() => {
    if (!formProductId) return { tier1: 0, tier2: 0, tier3: 0, customerRate: 0, customerLabel: "Standard Tier 1", basePrice: 0 };
    const tiers = getProductTiers(formProductId);
    const custRateInfo = getCustomerTierRate(formCustomerId, formProductId);
    return {
      tier1: tiers.tier1,
      tier2: tiers.tier2,
      tier3: tiers.tier3,
      customerRate: custRateInfo.rate,
      customerLabel: custRateInfo.label,
      basePrice: tiers.basePrice
    };
  }, [formCustomerId, formProductId, customers, products]);

  // Dynamic values on current form modifications
  const computedAppliedRate = useMemo(() => {
    if (formPricingType === "Custom Contract Price") {
      return formCustomRate;
    } else if (formPricingType === "Product Tier 1") {
      return availableRates.tier1;
    } else if (formPricingType === "Product Tier 2") {
      return availableRates.tier2;
    } else if (formPricingType === "Product Tier 3") {
      return availableRates.tier3;
    } else {
      // Default Product Price
      return availableRates.basePrice;
    }
  }, [formPricingType, formCustomRate, availableRates]);

  // Delivered quantity calculator for all jobs
  const jobDeliveredQuantities = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach((j) => {
      // Filter transactions matching this job order with Approved, Invoiced, or Committed status
      const delWeight = transactions
        .filter(
          (tx) =>
            tx.jobOrder === j.id &&
            (tx.status === TransactionStatus.APPROVED ||
              tx.status === TransactionStatus.INVOICED ||
              tx.status === TransactionStatus.COMMITTED)
        )
        .reduce((sum, tx) => sum + (tx.netWeight || 0), 0);
      counts[j.id] = Number(delWeight.toFixed(2));
    });
    return counts;
  }, [jobs, transactions]);

  // Filter and search logic for Jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        j.id.toLowerCase().includes(q) ||
        j.customerOrderRef.toLowerCase().includes(q) ||
        j.customerName.toLowerCase().includes(q) ||
        j.productName.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "All" || j.status === statusFilter;
      const matchesCustomer = customerFilter === "All" || j.customerId === customerFilter;

      return matchesSearch && matchesStatus && matchesCustomer;
    });
  }, [jobs, searchQuery, statusFilter, customerFilter]);

  // Start Form helper for adding job
  const handleOpenAddForm = () => {
    const nextNum = jobs.length + 1;
    const paddedNum = nextNum.toString().padStart(2, "0");
    setFormOrderRef(`PO-2026-${paddedNum}`);
    setFormCustomerId(customers[0]?.id || "");
    setFormProductId(products[0]?.id || "");
    setFormOrderQty(25000);
    setFormNotes("Contracted aggregate supply agreement.");
    setFormStatus("Active");
    setFormPricingType("Use Customer Pricing Tier");
    setFormCustomRate(20.00);
    setFormPricingNotes("");
    setFormEffectiveFrom(new Date().toISOString().split("T")[0]);
    // 1 year effective date default
    const yearLater = new Date();
    yearLater.setFullYear(yearLater.getFullYear() + 1);
    setFormEffectiveTo(yearLater.toISOString().split("T")[0]);

    setCurrentMode("add");
  };

  // Start Form helper for editing job
  const handleOpenEditForm = (j: Job) => {
    setSelectedJobId(j.id);
    setFormOrderRef(j.customerOrderRef);
    setFormCustomerId(j.customerId);
    setFormProductId(j.productId);
    setFormOrderQty(j.orderQty);
    setFormNotes(j.notes);
    setFormStatus(j.status);
    setFormPricingType(j.pricingType);
    setFormCustomRate(j.customProductRate || 20.00);
    setFormPricingNotes(j.pricingNotes || "");
    setFormEffectiveFrom(j.effectiveFrom || new Date().toISOString().split("T")[0]);
    setFormEffectiveTo(j.effectiveTo || "");

    setCurrentMode("edit");
  };

  // Save Job execution
  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formOrderRef.trim()) {
      toast.info("Please provide a valid Customer Order Reference.");
      return;
    }
    if (formOrderQty <= 0) {
      toast.info("Please provide an Order Quantity greater than zero.");
      return;
    }

    const selectedCust = customers.find((c) => c.id === formCustomerId);
    const selectedProd = products.find((p) => p.id === formProductId);

    if (currentMode === "add") {
      const nextId = `JOB-2026-${(jobs.length + 1).toString().padStart(2, "0")}`;
      const newJob: Job = {
        id: nextId,
        customerOrderRef: formOrderRef,
        customerId: formCustomerId,
        customerName: selectedCust?.name || "Unknown Customer",
        productId: formProductId,
        productName: selectedProd?.name || "Unknown Product",
        orderQty: formOrderQty,
        deliveredQty: 0,
        notes: formNotes,
        status: formStatus,
        pricingType: formPricingType,
        customProductRate: formPricingType === "Custom Contract Price" ? formCustomRate : undefined,
        appliedRate: Number(computedAppliedRate.toFixed(2)),
        pricingNotes: formPricingNotes || undefined,
        effectiveFrom: formEffectiveFrom || undefined,
        effectiveTo: formEffectiveTo || undefined
      };
      onAddJob(newJob);
      toast.error(`Job "${nextId}" saved successfully with contract pricing locked at $${computedAppliedRate.toFixed(2)}/t.`);
    } else {
      // Edit mode
      const updatedJob: Job = {
        id: selectedJobId!,
        customerOrderRef: formOrderRef,
        customerId: formCustomerId,
        customerName: selectedCust?.name || "Unknown Customer",
        productId: formProductId,
        productName: selectedProd?.name || "Unknown Product",
        orderQty: formOrderQty,
        deliveredQty: jobDeliveredQuantities[selectedJobId!] || 0,
        notes: formNotes,
        status: formStatus,
        pricingType: formPricingType,
        customProductRate: formPricingType === "Custom Contract Price" ? formCustomRate : undefined,
        appliedRate: Number(computedAppliedRate.toFixed(2)),
        pricingNotes: formPricingNotes || undefined,
        effectiveFrom: formEffectiveFrom || undefined,
        effectiveTo: formEffectiveTo || undefined
      };
      onUpdateJob(updatedJob);
      toast.success(`Job "${selectedJobId}" update successfully written. Contract pricing updated to $${computedAppliedRate.toFixed(2)}/t.`);
    }

    setCurrentMode("list");
  };

  // Export execution
  const triggerExportSimulation = (scope: typeof exportScope, format: typeof exportFormat) => {
    setIsExporting(true);
    setExportProgress(10);
    setExportMessage("Filtering selected records...");

    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExporting(false);

            let filename = "uniweigh_jobs_report";
            let desc = "";

            if (scope === "individual" && activeJob) {
              filename = `uniweigh_job_summary_${activeJob.id}`;
              desc = `Individual Job Summary report for contract ${activeJob.id} (${activeJob.customerOrderRef}).`;
            } else if (scope === "txs" && activeJob) {
              filename = `uniweigh_job_txs_${activeJob.id}`;
              desc = `Full operational delivery ledger containing transactions for job ${activeJob.id}.`;
            } else if (scope === "pricing" && activeJob) {
              filename = `uniweigh_job_pricing_${activeJob.id}`;
              desc = `Contract pricing rule sheet for job ${activeJob.id}.`;
            } else if (scope === "selected") {
              filename = `uniweigh_selected_jobs_export`;
              desc = `Export payload containing ${checkedJobIds.length} checked jobs.`;
            } else if (scope === "filtered") {
              filename = `uniweigh_filtered_jobs_export`;
              desc = `Export payload containing ${filteredJobs.length} filtered jobs.`;
            } else {
              filename = `uniweigh_all_jobs_master`;
              desc = `Master customer projects & jobs directory registry listing (${jobs.length} jobs).`;
            }

            toast.success(`Export Success! "${filename}.${format.toLowerCase()}" generated successfully.\n\nType: ${desc}\nFormat: ${format}`);
            setShowExportModal(false);
          }, 350);
          return 100;
        }

        if (prev === 40) {
          setExportMessage("Parsing data headers & ledger weights...");
        } else if (prev === 80) {
          setExportMessage(`Assembling ${format} document format...`);
        }
        return prev + 30;
      });
    }, 200);
  };

  // Helper toggle checkboxes
  const handleToggleCheckAll = () => {
    if (checkedJobIds.length === filteredJobs.length) {
      setCheckedJobIds([]);
    } else {
      setCheckedJobIds(filteredJobs.map((j) => j.id));
    }
  };

  const handleToggleCheckOne = (id: string) => {
    if (checkedJobIds.includes(id)) {
      setCheckedJobIds((prev) => prev.filter((item) => item !== id));
    } else {
      setCheckedJobIds((prev) => [...prev, id]);
    }
  };

  // Get current active job destinations
  const activeJobDestinations = useMemo(() => {
    if (!selectedJobId) return [];
    return JOB_DESTINATIONS[selectedJobId] || [
      { id: `DEST-${selectedJobId}-01`, name: `${activeJob?.customerName} Depot Alpha`, address: "Lot 15 Commercial Drive, Ravenhall VIC 3023", phone: "+61 3 9845 2200", status: "Active" }
    ];
  }, [selectedJobId, activeJob]);

  // Get current active job transactions
  const activeJobTransactions = useMemo(() => {
    if (!selectedJobId) return [];
    return transactions.filter((tx) => tx.jobOrder === selectedJobId);
  }, [selectedJobId, transactions]);

  return (
    <div className="space-y-6" id="jobs-module-container">

      {/* ----------------- SUB-HEADER & NAVIGATION BANNER ----------------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight sm:text-2xl flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-info shrink-0" />
            <span>Jobs</span>
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
            <span>Customers & Sales</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <span className="font-semibold text-info">Jobs & Supply Contracts</span>
          </div>
        </div>

        {/* Top-Right Action Toolbar */}
        {currentMode === "list" && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setExportScope("current");
                setShowExportModal(true);
              }}
              className="px-4 py-2 bg-card border border-border hover:bg-muted text-foreground rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              title="Export job ledger reports"
            >
              <Download className="h-3.8 w-3.8 text-muted-foreground" />
              <span>Export</span>
            </button>
            <button
              onClick={handleOpenAddForm}
              className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Job</span>
            </button>
          </div>
        )}

        {currentMode !== "list" && (
          <button
            onClick={() => {
              setCurrentMode("list");
              setSelectedJobId(null);
            }}
            className="px-3 py-1.8 bg-card border border-border hover:bg-muted text-foreground rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
          >
            <X className="h-4 w-4 text-muted-foreground" />
            <span>Back to Listing</span>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">

        {/* ========================================================================= */}
        {/* ======================= MODE 1: JOBS LISTING PAGE ======================= */}
        {/* ========================================================================= */}
        {currentMode === "list" && (
          <motion.div
            key="jobs-list-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* SEARCH AND FILTERS TOOLBAR */}
            <div className="bg-card border border-border rounded-md p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-3xl">
                {/* Status Filter */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status:</span>
                  <SelectBox
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-muted border border-border text-foreground rounded-md px-2.5 py-1.2 text-xs font-medium focus:ring-1 focus:ring-ring"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Suspended">Suspended</option>
                  </SelectBox>
                </div>

                {/* Customer Filter */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Customer:</span>
                  <SelectBox
                    value={customerFilter}
                    onChange={(e) => setCustomerFilter(e.target.value)}
                    className="bg-muted border border-border text-foreground rounded-md px-2.5 py-1.2 text-xs font-medium focus:ring-1 focus:ring-ring max-w-[180px]"
                  >
                    <option value="All">All Customers</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </SelectBox>
                </div>
              </div>

              {/* Selection actions showing context actions */}
              {checkedJobIds.length > 0 && (
                <div className="flex items-center gap-2 bg-info/10 border border-info/25 px-3 py-1.5 rounded-md text-xs font-semibold text-info animate-fade-in">
                  <span>{checkedJobIds.length} Job(s) selected</span>
                  <div className="h-4 w-px bg-info/10 mx-1"></div>
                  <button
                    onClick={() => {
                      setExportScope("selected");
                      setShowExportModal(true);
                    }}
                    className="text-info hover:text-info font-bold hover:underline flex items-center gap-1 transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export Selected</span>
                  </button>
                </div>
              )}
            </div>

            {/* MAIN TABLE CANVAS */}
            <div className="bg-card border border-border rounded-md overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted text-xs font-bold uppercase text-muted-foreground tracking-wider">
                      <th className="px-4 py-3.5">Job ID</th>
                      <th className="px-4 py-3.5">Order Reference Number</th>
                      <th className="px-4 py-3.5">Customer</th>
                      <th className="px-4 py-3.5">Product</th>
                      <th className="px-4 py-3.5 text-right">Order Quantity</th>
                      <th className="px-4 py-3.5 text-right">Delivered Quantity</th>
                      <th className="px-4 py-3.5 text-right">Remaining Quantity</th>
                      <th className="px-4 py-3.5 text-center">Status</th>
                      <th className="px-4 py-3.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs text-foreground">
                    {filteredJobs.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground font-medium">
                          No jobs found matching the search criteria or selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredJobs.map((j) => {
                        const deliveredQty = jobDeliveredQuantities[j.id] || 0;
                        const remainingQty = Math.max(0, j.orderQty - deliveredQty);
                        return (
                          <tr
                            key={j.id}
                            className="hover:bg-muted transition-colors"
                          >
                            {/* Job ID */}
                            <td
                              onClick={() => {
                                setSelectedJobId(j.id);
                                setDetailTab("destinations");
                                setCurrentMode("detail");
                              }}
                              className="px-4 py-3.5 font-mono font-bold text-info hover:text-info cursor-pointer hover:underline"
                            >
                              {j.id}
                            </td>

                            {/* Order Reference Number */}
                            <td className="px-4 py-3.5 font-semibold text-foreground">
                              {j.customerOrderRef}
                            </td>

                            {/* Customer */}
                            <td className="px-4 py-3.5 font-bold text-foreground">
                              {j.customerName}
                            </td>

                            {/* Product */}
                            <td className="px-4 py-3.5 text-muted-foreground">
                              {j.productName}
                            </td>

                            {/* Order Quantity */}
                            <td className="px-4 py-3.5 text-right font-mono font-bold text-foreground">
                              {j.orderQty.toLocaleString()} t
                            </td>

                            {/* Delivered Quantity */}
                            <td className="px-4 py-3.5 text-right font-mono text-success font-semibold">
                              {deliveredQty.toLocaleString()} t
                            </td>

                            {/* Remaining Quantity */}
                            <td className="px-4 py-3.5 text-right font-mono text-warning font-semibold">
                              {remainingQty.toLocaleString()} t
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3.5 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${j.status === "Active"
                                ? "bg-success/10 text-success border border-success/25"
                                : j.status === "Completed"
                                  ? "bg-info/10 text-info border border-info/25"
                                  : "bg-destructive/10 text-destructive border border-destructive/25"
                                }`}>
                                {j.status}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3.5 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedJobId(j.id);
                                    setDetailTab("destinations");
                                    setCurrentMode("detail");
                                  }}
                                  className="px-2.5 py-1 bg-info/10 hover:bg-info/10 text-info text-xs font-bold rounded transition"
                                >
                                  View
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditForm(j)}
                                  className="px-2.5 py-1 bg-muted hover:bg-muted text-foreground text-xs font-bold rounded border border-border transition"
                                >
                                  Edit
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
              <div className="bg-muted border-t border-border px-4 py-3 flex items-center justify-between text-xs text-muted-foreground font-medium">
                <div>
                  Showing <span className="font-bold text-foreground">{filteredJobs.length}</span> of <span className="font-bold text-foreground">{jobs.length}</span> project contracts.
                </div>
                {filteredJobs.length > 0 && (
                  <button
                    onClick={() => {
                      setExportScope("filtered");
                      setShowExportModal(true);
                    }}
                    className="text-info hover:text-info font-bold transition flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export Filtered ({filteredJobs.length})</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* ======================= MODE 2: ADD / EDIT JOB FORM ===================== */}
        {/* ========================================================================= */}
        {(currentMode === "add" || currentMode === "edit") && (
          <motion.form
            key="jobs-form-mode"
            onSubmit={handleSaveJob}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 max-w-4xl mx-auto"
          >
            <div className="bg-card border border-border rounded-md shadow-sm overflow-hidden divide-y divide-border">

              {/* Form Title Banner */}
              <div className="bg-muted px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-info/10 text-info">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                      {currentMode === "add" ? "Create New Project Job" : `Modify Job Contract Rules [${selectedJobId}]`}
                    </h3>
                    <p className="text-xs text-muted-foreground">Provide procurement quotas, customer mapping, and contract locked rates.</p>
                  </div>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {currentMode === "add" ? "Draft Mode" : "Modifying Live Contract"}
                </span>
              </div>

              {/* SECTION 1: JOB DETAILS */}
              <div className="p-6 space-y-4">
                <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
                  <Layers className="h-4 w-4 text-info" />
                  <span>Job Details & Target Quotas</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Customer Order Reference */}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Customer Order Reference <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PO-2026-APEX"
                      value={formOrderRef}
                      onChange={(e) => setFormOrderRef(e.target.value)}
                      className="w-full bg-muted border border-border hover:border-input focus:bg-card text-xs font-semibold text-foreground rounded-md px-3 py-2 focus:ring-1 focus:ring-ring"
                    />
                  </div>

                  {/* Status selection */}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Job Status
                    </label>
                    <SelectBox
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full bg-muted border border-border hover:border-input focus:bg-card text-xs font-semibold text-foreground rounded-md px-3 py-2 focus:ring-1 focus:ring-ring"
                    >
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Suspended">Suspended (Locks delivery transactions)</option>
                    </SelectBox>
                  </div>

                  {/* Customer Selection */}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Associated Customer <span className="text-destructive">*</span>
                    </label>
                    <SelectBox
                      value={formCustomerId}
                      onChange={(e) => setFormCustomerId(e.target.value)}
                      disabled={currentMode === "edit"} // Locked on edit as requested: standard practice
                      className="w-full bg-muted border border-border text-xs font-semibold text-foreground rounded-md px-3 py-2 focus:ring-1 focus:ring-ring disabled:bg-muted disabled:text-muted-foreground"
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          [{c.id}] {c.name} ({c.pricingTier || "Standard"})
                        </option>
                      ))}
                    </SelectBox>
                  </div>

                  {/* Product Selection */}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Material Product <span className="text-destructive">*</span>
                    </label>
                    <SelectBox
                      value={formProductId}
                      onChange={(e) => setFormProductId(e.target.value)}
                      disabled={currentMode === "edit"} // Locked on edit
                      className="w-full bg-muted border border-border text-xs font-semibold text-foreground rounded-md px-3 py-2 focus:ring-1 focus:ring-ring disabled:bg-muted disabled:text-muted-foreground"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          [{p.id}] {p.name} (Base: ${p.basePrice.toFixed(2)}/t)
                        </option>
                      ))}
                    </SelectBox>
                  </div>

                  {/* Order Quantity in Tonnes */}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Order Quantity quota (Tonnes) <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        required
                        value={formOrderQty}
                        onChange={(e) => setFormOrderQty(Number(e.target.value))}
                        className="w-full bg-muted border border-border hover:border-input focus:bg-card text-xs font-semibold text-foreground rounded-md px-3 py-2 focus:ring-1 focus:ring-ring"
                      />
                      <span className="absolute right-3 top-2 text-xs font-bold text-muted-foreground uppercase">t</span>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Operational Quota Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Delivery sites, access codes, project limits..."
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      className="w-full bg-muted border border-border hover:border-input focus:bg-card text-xs font-medium text-foreground rounded-md px-3 py-2 focus:ring-1 focus:ring-ring"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: PRODUCT & CONTRACT PRICING */}
              <div className="p-6 space-y-4 bg-muted">
                <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
                  <DollarSign className="h-4 w-4 text-success" />
                  <span>Product & Contract pricing details</span>
                </h4>

                {/* Available catalog price info panel */}
                <div className="bg-muted rounded-md p-4 border border-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Product Tier 1 Rate</span>
                    <span className="font-mono font-bold text-foreground">${availableRates.tier1.toFixed(2)} /t</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Product Tier 2 Rate</span>
                    <span className="font-mono font-bold text-foreground">${availableRates.tier2.toFixed(2)} /t</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Product Tier 3 Rate</span>
                    <span className="font-mono font-bold text-foreground">${availableRates.tier3.toFixed(2)} /t</span>
                  </div>
                  <div>
                    {formPricingType === "Custom Contract Price" ? (
                      <>
                        <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Custom Contract Rate</span>
                        <span className="font-mono font-bold text-success">${formCustomRate.toFixed(2)} /t</span>
                      </>
                    ) : (
                      <>
                        <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Default Product Rate</span>
                        <span className="font-mono font-bold text-foreground">${availableRates.basePrice.toFixed(2)} /t</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Dropdown for selector */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Pricing Type <span className="text-destructive">*</span>
                    </label>
                    <SelectBox
                      value={formPricingType}
                      onChange={(e) => setFormPricingType(e.target.value as any)}
                      className="w-full bg-muted border border-border hover:border-input focus:bg-card text-xs font-semibold text-foreground rounded-md px-3 py-2 focus:ring-1 focus:ring-ring"
                    >
                      <option value="Default Product Price">Default Product Price (${availableRates.basePrice.toFixed(2)}/t)</option>
                      <option value="Product Tier 1">Product Tier 1 (${availableRates.tier1.toFixed(2)}/t)</option>
                      <option value="Product Tier 2">Product Tier 2 (${availableRates.tier2.toFixed(2)}/t)</option>
                      <option value="Product Tier 3">Product Tier 3 (${availableRates.tier3.toFixed(2)}/t)</option>
                      <option value="Custom Contract Price">Custom Contract Price</option>
                    </SelectBox>
                  </div>

                  {/* Conditional custom rate field */}
                  {formPricingType === "Custom Contract Price" ? (
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        Custom Contract Rate ($/Tonne) <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.10"
                          value={formCustomRate}
                          onChange={(e) => setFormCustomRate(parseFloat(e.target.value) || 0)}
                          className="w-full bg-muted border border-border text-xs font-bold text-foreground rounded-md pl-6 pr-3 py-2 focus:ring-1 focus:ring-ring"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        Applied Rate (Auto calculated)
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={`$${computedAppliedRate.toFixed(2)} / tonne`}
                        className="w-full bg-muted border border-border text-xs font-bold text-muted-foreground rounded-md px-3 py-2 select-none"
                      />
                    </div>
                  )}
                </div>

                {/* Additional Pricing Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Pricing Notes / Reason
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Contract rate override, winter promo"
                      value={formPricingNotes}
                      onChange={(e) => setFormPricingNotes(e.target.value)}
                      className="w-full bg-muted border border-border text-xs text-foreground rounded-md px-3 py-2 focus:ring-1 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Effective From
                    </label>
                    <input
                      type="date"
                      value={formEffectiveFrom}
                      onChange={(e) => setFormEffectiveFrom(e.target.value)}
                      className="w-full bg-muted border border-border text-xs text-foreground rounded-md px-3 py-2 focus:ring-1 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Effective To
                    </label>
                    <input
                      type="date"
                      value={formEffectiveTo}
                      onChange={(e) => setFormEffectiveTo(e.target.value)}
                      className="w-full bg-muted border border-border text-xs text-foreground rounded-md px-3 py-2 focus:ring-1 focus:ring-ring"
                    />
                  </div>
                </div>

                {/* Applied Summary Locked Panel */}
                <div className="bg-success/10 border border-success/25 rounded-md px-5 py-3 flex items-center justify-between mt-3 text-xs">
                  <div className="flex items-center gap-2 text-success">
                    <Check className="h-4.5 w-4.5 text-success shrink-0" />
                    <div>
                      <strong className="block text-xs font-bold uppercase tracking-wider">Locked Contract Job pricing rate:</strong>
                      <span className="text-muted-foreground text-[10.5px]">This locked rate applies across all transactional invoicing. Product Lots ignore standard adjustments.</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground text-xs uppercase font-bold block">Final Applied Job Rate</span>
                    <strong className="text-lg text-success font-mono">${computedAppliedRate.toFixed(2)}/t</strong>
                  </div>
                </div>

              </div>

            </div>

            {/* Form actions row */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setCurrentMode("list");
                  setSelectedJobId(null);
                }}
                className="px-4 py-2 bg-card border border-border text-foreground hover:bg-muted rounded-md text-xs font-semibold shadow-xs transition"
              >
                Cancel Changes
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-primary text-white hover:bg-primary/90 rounded-md text-xs font-bold shadow-sm flex items-center gap-1.5 transition"
              >
                <FileCheck2 className="h-4.5 w-4.5" />
                <span>Save Supply Job Contract</span>
              </button>
            </div>
          </motion.form>
        )}

        {/* ========================================================================= */}
        {/* ========================== MODE 3: JOB VIEW PAGE ======================== */}
        {/* ========================================================================= */}
        {currentMode === "detail" && activeJob && (
          <motion.div
            key="jobs-detail-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >

            {/* JOB SUMMARY CARD (TOP SECTION) */}
            <div className="bg-card border border-border rounded-md overflow-hidden shadow-xs p-6 space-y-4">

              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-info/10 text-info shrink-0 font-bold text-sm">
                    {activeJob.id.split("-").pop()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-bold text-foreground font-mono tracking-tight">{activeJob.id}</strong>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${activeJob.status === "Active"
                        ? "bg-success/10 text-success"
                        : activeJob.status === "Completed"
                          ? "bg-info/10 text-info"
                          : "bg-destructive/10 text-destructive"
                        }`}>{activeJob.status}</span>
                    </div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Job Contract Profile</p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenEditForm(activeJob)}
                  className="px-2.5 py-1.2 bg-muted hover:bg-secondary text-foreground text-xs font-bold rounded-md flex items-center gap-1 transition"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Edit Contract</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs text-foreground">
                <div>
                  <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Job ID</span>
                  <span className="font-mono font-bold text-foreground select-all">{activeJob.id}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Order Reference Number</span>
                  <span className="font-semibold text-foreground select-all">{activeJob.customerOrderRef}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Customer</span>
                  <span className="font-bold text-foreground">{activeJob.customerName}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Product</span>
                  <span className="font-bold text-foreground">{activeJob.productName}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Order Quantity</span>
                  <span className="font-mono font-bold text-foreground text-sm">
                    {activeJob.orderQty.toLocaleString()} t
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Delivered Quantity</span>
                  <span className="font-mono font-bold text-success text-sm">
                    {(jobDeliveredQuantities[activeJob.id] || 0).toLocaleString()} t
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Remaining Quantity</span>
                  <span className="font-mono font-bold text-warning text-sm">
                    {Math.max(0, activeJob.orderQty - (jobDeliveredQuantities[activeJob.id] || 0)).toLocaleString()} t
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Status</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${activeJob.status === "Active"
                    ? "bg-success/10 text-success border border-success/25"
                    : activeJob.status === "Completed"
                      ? "bg-info/10 text-info border border-info/25"
                      : "bg-destructive/10 text-destructive border border-destructive/25"
                    }`}>{activeJob.status}</span>
                </div>
                <div className="col-span-1 sm:col-span-2 md:col-span-4">
                  <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Notes</span>
                  <p className="text-muted-foreground bg-muted rounded-md p-3 leading-relaxed text-xs font-medium border border-border">
                    {activeJob.notes || "No operational notes recorded."}
                  </p>
                </div>
              </div>

            </div>

            {/* LOWER PORTION TABS NAVIGATION */}
            <div className="bg-card border border-border rounded-md overflow-hidden shadow-xs">

              {/* Tabs list (Show ONLY Destinations, Transactions, Pricing) */}
              <div className="flex border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted">
                {[
                  { id: "destinations", label: "Destinations", count: activeJobDestinations.length },
                  { id: "transactions", label: "Transactions", count: activeJobTransactions.length },
                  { id: "pricing", label: "Pricing" }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setDetailTab(t.id as any)}
                    className={`flex-1 py-4 text-center transition cursor-pointer font-bold border-b-2 flex items-center justify-center gap-1.5 ${detailTab === t.id
                      ? "bg-card border-b-accent text-info font-bold"
                      : "border-b-transparent hover:bg-muted hover:text-foreground"
                      }`}
                  >
                    <span>{t.label}</span>
                    {t.count !== undefined && (
                      <span className={`px-1.8 py-0.2 rounded-full text-xs font-bold ${detailTab === t.id ? "bg-info/10 text-info" : "bg-muted text-muted-foreground"
                        }`}>{t.count}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* TAB CONTENTS CONTAINER */}
              <div className="p-4 text-xs">

                {/* ======================= TAB 1: DESTINATIONS ======================= */}
                {detailTab === "destinations" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-foreground flex items-center gap-1.5">
                        <MapPin className="h-4.5 w-4.5 text-info" />
                        <span>Contract Bound Delivery Sites</span>
                      </h4>
                      <p className="text-xs text-muted-foreground">Target dump locations authorized for weighbridge loading.</p>
                    </div>

                    <div className="border border-border rounded-md overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border bg-muted text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
                            <th className="px-4 py-3">Destination ID</th>
                            <th className="px-4 py-3">Destination Name</th>
                            <th className="px-4 py-3">Address</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-foreground text-xs">
                          {activeJobDestinations.map((dest) => (
                            <tr key={dest.id} className="hover:bg-muted transition">
                              <td className="px-4 py-3 font-mono font-bold text-muted-foreground">{dest.id}</td>
                              <td className="px-4 py-3 font-bold text-foreground">{dest.name}</td>
                              <td className="px-4 py-3 text-muted-foreground max-w-xs truncate" title={dest.address}>{dest.address}</td>
                              <td className="px-4 py-3 font-mono text-muted-foreground">{dest.phone}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase ${dest.status === "Active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                                  }`}>{dest.status}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={() => toast.info(`Reviewing access credentials for location ${dest.name}`)}
                                  className="text-xs text-info font-bold hover:underline"
                                >
                                  View Info
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ======================= TAB 2: TRANSACTIONS ======================= */}
                {detailTab === "transactions" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-foreground flex items-center gap-1.5">
                        <Activity className="h-4.5 w-4.5 text-info" />
                        <span>Project Delivery Ledger Transactions</span>
                      </h4>
                      {activeJobTransactions.length > 0 && (
                        <button
                          onClick={() => {
                            setExportScope("txs");
                            setShowExportModal(true);
                          }}
                          className="text-xs text-info font-bold flex items-center gap-0.8 hover:underline"
                        >
                          <Download className="h-3 w-3" />
                          <span>Export Ledger List</span>
                        </button>
                      )}
                    </div>

                    {activeJobTransactions.length === 0 ? (
                      <div className="py-10 text-center text-muted-foreground font-medium">
                        No transactions have been logged under this project job yet.
                      </div>
                    ) : (
                      <div className="border border-border rounded-md overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-border bg-muted text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
                              <th className="px-4 py-3">Transaction ID</th>
                              <th className="px-4 py-3">Type</th>
                              <th className="px-4 py-3">Ticket No</th>
                              <th className="px-4 py-3">Tx Code</th>
                              <th className="px-4 py-3">Product Lot</th>
                              <th className="px-4 py-3">Carter</th>
                              <th className="px-4 py-3">Driver</th>
                              <th className="px-4 py-3">Vehicle</th>
                              <th className="px-4 py-3 text-right">Net Weight</th>
                              <th className="px-4 py-3 text-right">Total Amount</th>
                              <th className="px-4 py-3 text-center">Status</th>
                              <th className="px-4 py-3">Created Date</th>
                              <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border text-foreground text-xs">
                            {activeJobTransactions.map((tx) => (
                              <tr key={tx.id} className="hover:bg-muted transition">
                                <td className="px-4 py-3 font-mono font-bold text-muted-foreground">{tx.id}</td>
                                <td className="px-4 py-3 font-medium">{tx.type}</td>
                                <td className="px-4 py-3 font-semibold text-foreground">{tx.ticketNo}</td>
                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tx.transactionCode || "N/A"}</td>
                                <td className="px-4 py-3 font-mono font-medium text-info">{tx.lotNo || "N/A"}</td>
                                <td className="px-4 py-3 font-medium text-foreground">{tx.carrierName || "N/A"}</td>
                                <td className="px-4 py-3 text-muted-foreground">{tx.driverName || "N/A"}</td>
                                <td className="px-4 py-3 font-mono text-muted-foreground">{tx.vehicleReg || "N/A"}</td>
                                <td className="px-4 py-3 text-right font-mono font-bold text-foreground">{tx.netWeight?.toFixed(2)} t</td>
                                <td className="px-4 py-3 text-right font-mono font-bold text-success">${(tx.netWeight * activeJob.appliedRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${tx.status === TransactionStatus.APPROVED
                                    ? "bg-success/10 text-success"
                                    : tx.status === TransactionStatus.INVOICED
                                      ? "bg-info/10 text-info"
                                      : tx.status === TransactionStatus.PENDING
                                        ? "bg-warning/10 text-warning"
                                        : "bg-destructive/10 text-destructive"
                                    }`}>{tx.status}</span>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tx.secondWeighTime || tx.firstWeighTime}</td>
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={() => onViewTicketDetails(tx.id)}
                                    className="p-1 rounded text-muted-foreground hover:text-info hover:bg-muted transition"
                                    title="Open weighbridge ticket dossier"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* ======================= TAB 3: PRICING ======================= */}
                {detailTab === "pricing" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <h4 className="font-bold text-foreground flex items-center gap-1.5">
                        <DollarSign className="h-4.5 w-4.5 text-success" />
                        <span>Contract Pricing Information</span>
                      </h4>
                      <button
                        onClick={() => {
                          setExportScope("pricing");
                          setShowExportModal(true);
                        }}
                        className="text-xs text-info font-bold flex items-center gap-0.8 hover:underline"
                      >
                        <Download className="h-3 w-3" />
                        <span>Export Price Sheet</span>
                      </button>
                    </div>

                    <div className="bg-muted border border-border rounded-md p-6 max-w-2xl">
                      <div className="space-y-6">
                        <div>
                          <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                            Selected Pricing Type
                          </span>
                          <span className="inline-flex items-center rounded-md bg-success/10 px-3 py-1.5 text-xs font-bold text-success border border-success/25">
                            {activeJob.pricingType}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {activeJob.pricingType === "Custom Contract Price" && (
                            <>
                              <div>
                                <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Custom Contract Rate</span>
                                <span className="font-mono text-base font-bold text-foreground">${activeJob.appliedRate.toFixed(2)} / t</span>
                              </div>
                              <div>
                                <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Pricing Notes</span>
                                <span className="text-foreground block font-medium">{activeJob.pricingNotes || "N/A"}</span>
                              </div>
                            </>
                          )}

                          {(activeJob.pricingType === "Product Tier 1" ||
                            activeJob.pricingType === "Product Tier 2" ||
                            activeJob.pricingType === "Product Tier 3") && (
                              <>
                                <div>
                                  <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Selected Tier</span>
                                  <span className="font-semibold text-foreground block">{activeJob.pricingType}</span>
                                </div>
                                <div>
                                  <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Applied Product Rate</span>
                                  <span className="font-mono text-base font-bold text-foreground">${activeJob.appliedRate.toFixed(2)} / t</span>
                                </div>
                              </>
                            )}

                          {activeJob.pricingType === "Default Product Price" && (
                            <>
                              <div>
                                <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Default Product Rate</span>
                                <span className="font-mono text-base font-bold text-foreground">${activeJob.appliedRate.toFixed(2)} / t</span>
                              </div>
                              <div>
                                <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Pricing Notes</span>
                                <span className="text-foreground block font-medium">{activeJob.pricingNotes || "N/A"}</span>
                              </div>
                            </>
                          )}

                          <div>
                            <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Effective From</span>
                            <span className="font-mono font-semibold text-foreground block">{activeJob.effectiveFrom || "N/A"}</span>
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Effective To</span>
                            <span className="font-mono font-semibold text-foreground block">{activeJob.effectiveTo || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

              </div>

            </div>

          </motion.div>
        )}

      </AnimatePresence>

      {/* ========================================================================= */}
      {/* ====================== EXPORT UTILITY MODAL (DIALOG) ==================== */}
      {/* ========================================================================= */}
      {showExportModal && (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-md max-w-md w-full p-6 shadow-lg space-y-4 animate-fade-in text-xs text-foreground">

            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Download className="h-5 w-5 text-info shrink-0" />
                <span>Export Job Contract Reports</span>
              </h4>
              <button
                disabled={isExporting}
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded text-muted-foreground hover:text-muted-foreground hover:bg-muted transition"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {isExporting ? (
              <div className="py-6 space-y-4 text-center">
                <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between font-bold text-muted-foreground font-mono text-xs">
                  <span>{exportMessage}</span>
                  <span className="text-foreground font-bold">{exportProgress}%</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">

                {/* Export Source Scope selection */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Select Data Payload scope
                  </label>
                  <SelectBox
                    value={exportScope}
                    onChange={(e) => setExportScope(e.target.value as any)}
                    className="w-full bg-muted border border-border rounded-md p-2 text-xs font-semibold text-foreground focus:ring-1 focus:ring-ring"
                  >
                    <option value="current">All Jobs list directory ({jobs.length})</option>
                    {checkedJobIds.length > 0 && (
                      <option value="selected">Selected checked Jobs ({checkedJobIds.length})</option>
                    )}
                    <option value="filtered">Filtered jobs list ({filteredJobs.length})</option>
                    {activeJob && (
                      <>
                        <option value="individual">Job {activeJob.id} Summary card</option>
                        <option value="txs">Job {activeJob.id} Delivery Transaction ledger ({activeJobTransactions.length})</option>
                        <option value="pricing">Job {activeJob.id} Contract Pricing audit rule sheet</option>
                      </>
                    )}
                  </SelectBox>
                </div>

                {/* Export Format selection */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Select Document Format
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["CSV", "Excel", "PDF"].map((fmt) => {
                      const isSelected = exportFormat === fmt;
                      return (
                        <div
                          key={fmt}
                          onClick={() => setExportFormat(fmt as any)}
                          className={`cursor-pointer rounded-md border p-2.5 text-center font-bold text-xs select-none transition-all ${isSelected
                            ? "bg-info/10 border-info text-info font-bold"
                            : "bg-card border-border text-muted-foreground hover:border-input"
                            }`}
                        >
                          {fmt}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Description footer */}
                <p className="text-xs text-muted-foreground leading-normal">
                  Reports generated under back-office compliance directory are cryptographically sealed with auditor timestamps.
                </p>

                {/* Dialog actions */}
                <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="px-3.5 py-1.8 bg-card border border-border text-foreground hover:bg-muted rounded-md font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => triggerExportSimulation(exportScope, exportFormat)}
                    className="px-4 py-1.8 bg-primary hover:bg-info text-white font-bold rounded-md shadow-sm"
                  >
                    Generate Report
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
