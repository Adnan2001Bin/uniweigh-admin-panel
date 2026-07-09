import React, { useState, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Briefcase, Plus, X, ChevronRight } from "lucide-react";
import {
  Job,
  Customer,
  Product,
  Transaction,
  TransactionStatus,
} from "../../../types";
import JobsList from "./JobsList";
import JobFormModal from "./JobFormModal";
import JobDetail from "./JobDetail";
import JobExportModal from "./JobExportModal";
import { getProductTiers, getCustomerTierRate } from "./utils/pricingHelpers";
import { triggerExportSimulation, ExportScope } from "./utils/exportHelpers";
import { JobDestination } from "./tabs/JobDestinationsTab";

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
const JOB_DESTINATIONS: Record<string, JobDestination[]> = {
  "JOB-2026-01": [
    {
      id: "DEST-401-01",
      name: "Melbourne Eastern Quarry Terminal",
      address: "102 Quarry Rd, Lilydale VIC 3140",
      phone: "+61 3 9845 2200",
      status: "Active",
    },
    {
      id: "DEST-401-02",
      name: "Monash Freeway Upgrade Site B",
      address: "Exit 18, M1 Highway, Glen Waverley VIC 3150",
      phone: "+61 412 345 611",
      status: "Active",
    },
  ],
  "JOB-2026-02": [
    {
      id: "DEST-402-01",
      name: "Dandenong South Industrial Depot",
      address: "88 Industry Blvd, Dandenong South VIC 3175",
      phone: "+61 3 9522 9900",
      status: "Active",
    },
    {
      id: "DEST-402-02",
      name: "Bayside Recycling Landfill Yard",
      address: "12 Beach Rd, Frankston VIC 3199",
      phone: "+61 3 9522 9922",
      status: "Inactive",
    },
  ],
  "JOB-2026-C3": [
    {
      id: "DEST-403-01",
      name: "Altona Concrete Blending Complex",
      address: "Altona Road Gate A, Altona VIC 3018",
      phone: "+61 411 988 500",
      status: "Active",
    },
  ],
  "JOB-2026-04": [
    {
      id: "DEST-401-03",
      name: "Western Ring Road Interchange",
      address: "Furlong Rd, Sunshine VIC 3020",
      phone: "+61 3 9845 2200",
      status: "Active",
    },
  ],
  "JOB-2026-05": [
    {
      id: "DEST-405-01",
      name: "Yarra Botanical Gardens Expansion",
      address: "322 Melba Hwy, Yarra Glen VIC 3775",
      phone: "+61 422 931 004",
      status: "Active",
    },
  ],
  "JOB-2026-06": [
    {
      id: "DEST-406-01",
      name: "Gippsland Water Supply Gate 2",
      address: "Latrobe Rd, Morwell VIC 3840",
      phone: "+61 422 121 009",
      status: "Active",
    },
  ],
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
  const [currentMode, setCurrentMode] = useState<
    "list" | "add" | "edit" | "detail"
  >("list");

  // Selection
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [checkedJobIds, setCheckedJobIds] = useState<string[]>([]);

  // Tabs in Detail view
  const [detailTab, setDetailTab] = useState<
    "destinations" | "transactions" | "pricing"
  >("destinations");

  // Search & Status filters for Jobs
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [customerFilter, setCustomerFilter] = useState<string>("All");



  // Form states
  const [formOrderRef, setFormOrderRef] = useState("");
  const [formCustomerId, setFormCustomerId] = useState("");
  const [formProductId, setFormProductId] = useState("");
  const [formOrderQty, setFormOrderQty] = useState<number>(10000);
  const [formNotes, setFormNotes] = useState("");
  const [formStatus, setFormStatus] = useState<
    "Active" | "Completed" | "Suspended"
  >("Active");
  const [formPricingType, setFormPricingType] = useState<Job["pricingType"]>(
    "Default Product Price",
  );

  // Custom Pricing states (toggled on Custom Contract Price)
  const [formCustomRate, setFormCustomRate] = useState<number>(20.0);
  const [formPricingNotes, setFormPricingNotes] = useState("");
  const [formEffectiveFrom, setFormEffectiveFrom] = useState("");
  const [formEffectiveTo, setFormEffectiveTo] = useState("");

  // Export states
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportScope, setExportScope] = useState<ExportScope>("current");
  const [exportFormat, setExportFormat] = useState<"CSV" | "Excel" | "PDF">(
    "CSV",
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportMessage, setExportMessage] = useState("");

  // Target Job for detail view
  const activeJob = useMemo(() => {
    return jobs.find((j) => j.id === selectedJobId) || null;
  }, [jobs, selectedJobId]);

  // Dynamic pricing calculation helper
  const availableRates = useMemo(() => {
    if (!formProductId)
      return {
        tier1: 0,
        tier2: 0,
        tier3: 0,
        customerRate: 0,
        customerLabel: "Standard Tier 1",
        basePrice: 0,
      };
    const tiers = getProductTiers(products, formProductId);
    const custRateInfo = getCustomerTierRate(
      customers,
      formCustomerId,
      products,
      formProductId,
    );
    return {
      tier1: tiers.tier1,
      tier2: tiers.tier2,
      tier3: tiers.tier3,
      customerRate: custRateInfo.rate,
      customerLabel: custRateInfo.label,
      basePrice: tiers.basePrice,
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
      // Default Product Price and Use Customer Pricing Tier
      return availableRates.basePrice;
    }
  }, [formPricingType, formCustomRate, availableRates]);

  // Delivered quantity calculator for all jobs
  const jobDeliveredQuantities = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach((j) => {
      const delWeight = transactions
        .filter(
          (tx) =>
            tx.jobOrder === j.id &&
            (tx.status === TransactionStatus.APPROVED ||
              tx.status === TransactionStatus.INVOICED ||
              tx.status === TransactionStatus.COMMITTED),
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
      const matchesCustomer =
        customerFilter === "All" || j.customerId === customerFilter;

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
    setFormCustomRate(20.0);
    setFormPricingNotes("");
    setFormEffectiveFrom(new Date().toISOString().split("T")[0]);
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
    setFormCustomRate(j.customProductRate || 20.0);
    setFormPricingNotes(j.pricingNotes || "");
    setFormEffectiveFrom(
      j.effectiveFrom || new Date().toISOString().split("T")[0],
    );
    setFormEffectiveTo(j.effectiveTo || "");

    setCurrentMode("edit");
  };

  // Save Job execution
  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formOrderRef.trim()) {
      alert("Please provide a valid Customer Order Reference.");
      return;
    }
    if (formOrderQty <= 0) {
      alert("Please provide an Order Quantity greater than zero.");
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
        customProductRate:
          formPricingType === "Custom Contract Price"
            ? formCustomRate
            : undefined,
        appliedRate: Number(computedAppliedRate.toFixed(2)),
        pricingNotes: formPricingNotes || undefined,
        effectiveFrom: formEffectiveFrom || undefined,
        effectiveTo: formEffectiveTo || undefined,
      };
      onAddJob(newJob);
      alert(
        `Job "${nextId}" saved successfully with contract pricing locked at $${computedAppliedRate.toFixed(2)}/t.`,
      );
    } else {
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
        customProductRate:
          formPricingType === "Custom Contract Price"
            ? formCustomRate
            : undefined,
        appliedRate: Number(computedAppliedRate.toFixed(2)),
        pricingNotes: formPricingNotes || undefined,
        effectiveFrom: formEffectiveFrom || undefined,
        effectiveTo: formEffectiveTo || undefined,
      };
      onUpdateJob(updatedJob);
      alert(
        `Job "${selectedJobId}" update successfully written. Contract pricing updated to $${computedAppliedRate.toFixed(2)}/t.`,
      );
    }

    setCurrentMode("list");
  };

  // Export execution wrapper
  const handleExport = (
    scope: ExportScope,
    format: "CSV" | "Excel" | "PDF",
  ) => {
    triggerExportSimulation(scope, format, {
      jobsCount: jobs.length,
      checkedCount: checkedJobIds.length,
      filteredCount: filteredJobs.length,
      activeJob,
      activeJobTxCount: activeJobTransactions.length,
      setIsExporting,
      setExportProgress,
      setExportMessage,
      onComplete: (filename, desc) => {
        alert(
          `Export Success! "${filename}.${format.toLowerCase()}" generated successfully.\n\nType: ${desc}\nFormat: ${format}`,
        );
        setShowExportModal(false);
      },
    });
  };

  // Get current active job destinations
  const activeJobDestinations = useMemo<JobDestination[]>(() => {
    if (!selectedJobId) return [];
    return (
      JOB_DESTINATIONS[selectedJobId] || [
        {
          id: `DEST-${selectedJobId}-01`,
          name: `${activeJob?.customerName} Depot Alpha`,
          address: "Lot 15 Commercial Drive, Ravenhall VIC 3023",
          phone: "+61 3 9845 2200",
          status: "Active",
        },
      ]
    );
  }, [selectedJobId, activeJob]);

  // Get current active job transactions
  const activeJobTransactions = useMemo(() => {
    if (!selectedJobId) return [];
    return transactions.filter((tx) => tx.jobOrder === selectedJobId);
  }, [selectedJobId, transactions]);

  const openExportModal = (scope: ExportScope) => {
    setExportScope(scope);
    setShowExportModal(true);
  };

  const returnToList = () => {
    setCurrentMode("list");
    setSelectedJobId(null);
  };

  const viewJobDetail = (jobId: string) => {
    setSelectedJobId(jobId);
    setDetailTab("destinations");
    setCurrentMode("detail");
  };

  return (
    <div className="space-y-6" id="jobs-module-container">
      {/* SUB-HEADER & NAVIGATION BANNER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight sm:text-2xl flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-blue-600 shrink-0" />
            <span>Jobs</span>
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
            <span>Customers & Sales</span>
            <ChevronRight className="h-3 w-3 text-gray-300" />
            <span className="font-semibold text-blue-700">
              Jobs & Supply Contracts
            </span>
          </div>
        </div>

        {/* Top-Right Action Toolbar */}
        {currentMode === "list" && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenAddForm}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Job</span>
            </button>
          </div>
        )}

        {currentMode !== "list" && (
          <button
            onClick={returnToList}
            className="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
          >
            <X className="h-4 w-4 text-gray-400" />
            <span>Back to Listing</span>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {currentMode === "list" && (
          <motion.div
            key="jobs-list-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <JobsList
              filteredJobs={filteredJobs}
              totalJobs={jobs.length}
              jobDeliveredQuantities={jobDeliveredQuantities}
              checkedJobIds={checkedJobIds}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              customerFilter={customerFilter}
              setCustomerFilter={setCustomerFilter}
              customers={customers}
              onExport={() => openExportModal("current")}
              onViewDetail={viewJobDetail}
              onEdit={handleOpenEditForm}
              setCheckedJobIds={setCheckedJobIds}
            />
          </motion.div>
        )}

        {(currentMode === "add" || currentMode === "edit") && (
          <JobFormModal
            key="jobs-form-mode"
            mode={currentMode}
            editingJobId={selectedJobId}
            customers={customers}
            products={products}
            availableRates={availableRates}
            computedAppliedRate={computedAppliedRate}
            formOrderRef={formOrderRef}
            setFormOrderRef={setFormOrderRef}
            formCustomerId={formCustomerId}
            setFormCustomerId={setFormCustomerId}
            formProductId={formProductId}
            setFormProductId={setFormProductId}
            formOrderQty={formOrderQty}
            setFormOrderQty={setFormOrderQty}
            formNotes={formNotes}
            setFormNotes={setFormNotes}
            formStatus={formStatus}
            setFormStatus={setFormStatus}
            formPricingType={formPricingType}
            setFormPricingType={setFormPricingType}
            formCustomRate={formCustomRate}
            setFormCustomRate={setFormCustomRate}
            formPricingNotes={formPricingNotes}
            setFormPricingNotes={setFormPricingNotes}
            formEffectiveFrom={formEffectiveFrom}
            setFormEffectiveFrom={setFormEffectiveFrom}
            formEffectiveTo={formEffectiveTo}
            setFormEffectiveTo={setFormEffectiveTo}
            onSubmit={handleSaveJob}
            onCancel={returnToList}
          />
        )}

        {currentMode === "detail" && activeJob && (
          <JobDetail
            key="jobs-detail-mode"
            activeJob={activeJob}
            jobDeliveredQuantities={jobDeliveredQuantities}
            activeJobDestinations={activeJobDestinations}
            activeJobTransactions={activeJobTransactions}
            detailTab={detailTab}
            setDetailTab={setDetailTab}
            onEdit={handleOpenEditForm}
            onViewTicketDetails={onViewTicketDetails}
            onExportTxs={() => openExportModal("txs")}
            onExportPricing={() => openExportModal("pricing")}
          />
        )}
      </AnimatePresence>

      <JobExportModal
        show={showExportModal}
        isExporting={isExporting}
        exportProgress={exportProgress}
        exportMessage={exportMessage}
        exportScope={exportScope}
        setExportScope={setExportScope}
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
        jobsCount={jobs.length}
        checkedJobIds={checkedJobIds}
        filteredJobs={filteredJobs}
        activeJob={activeJob}
        activeJobTransactionsCount={activeJobTransactions.length}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />
    </div>
  );
}
