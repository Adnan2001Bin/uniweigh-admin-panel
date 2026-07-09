import React, { useState, useMemo } from "react";
import { Customer, Transaction } from "../../../types";
import CustomersToolbar from "./CustomersToolbar";
import CustomersTable from "./CustomersTable";
import CustomerDetail from "./CustomerDetail";
import AddCustomerModal from "./modals/AddCustomerModal";
import EditCustomerModal from "./modals/EditCustomerModal";
import ExportModal from "./modals/ExportModal";
import { getExportReportName } from "./utils/exportHelpers";

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
  transactions = [],
}: CustomersViewProps) {
  // Core UI layout states
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewTab, setPreviewTab] = useState<"jobs" | "transactions">("jobs");

  // Filter States
  const [localSearch, setLocalSearch] = useState<string>("");
  const [activeChip, setActiveChip] = useState<string>("All");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    {
      customerId: true,
      name: true,
      contact: true,
      phone: true,
      email: true,
      status: true,
      action: true,
    },
  );
  const [filterPricingTier, setFilterPricingTier] = useState<string>("All");
  const [filterActiveContracts, setFilterActiveContracts] =
    useState<string>("All");
  const [filterAccountBalance, setFilterAccountBalance] =
    useState<string>("All");
  const [filterState, setFilterState] = useState<string>("All");
  const [filterCreatedDate, setFilterCreatedDate] = useState<string>("");
  const [filterLastTxDate, setFilterLastTxDate] = useState<string>("");

  // Checklist Selection for bulk/selected operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals / forms states
  const [showAddCustomerModal, setShowAddCustomerModal] =
    useState<boolean>(false);
  const [showEditCustomerModal, setShowEditCustomerModal] =
    useState<boolean>(false);
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
  const [formStatus, setFormStatus] = useState<"Active" | "Suspended">(
    "Active",
  );
  const [formNotes, setFormNotes] = useState<string>("");

  // Export states
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportScope, setExportScope] = useState<
    "current" | "selected" | "filtered" | "profile" | "txSummary" | "jobsReport"
  >("current");
  const [exportFormat, setExportFormat] = useState<"CSV" | "Excel" | "PDF">(
    "CSV",
  );
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string>("");

  // Refresh spinner state
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshNotification, setRefreshNotification] = useState<string>("");

  // Quick reset helper
  const resetFilters = () => {
    setActiveChip("All");
    setFilterPricingTier("All");
    setFilterActiveContracts("All");
    setFilterAccountBalance("All");
    setFilterState("All");
    setFilterCreatedDate("");
    setFilterLastTxDate("");
    setLocalSearch("");
  };

  const activeAdvancedFilterCount = [
    filterPricingTier !== "All",
    filterActiveContracts !== "All",
    filterAccountBalance !== "All",
    filterState !== "All",
    filterCreatedDate !== "",
    filterLastTxDate !== "",
  ].filter(Boolean).length;

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
          c.postCodeVal,
        ]
          .join(" ")
          .toLowerCase();
        if (!matchText.includes(effectiveSearch)) return false;
      }

      // 2. Status Filter
      if (activeChip !== "All" && c.status !== activeChip) return false;

      // 3. Pricing Tier Filter
      if (filterPricingTier !== "All") {
        const tierStr = (c.pricingTier || "").toLowerCase();
        if (filterPricingTier === "Tier 1" && !tierStr.includes("tier 1"))
          return false;
        if (filterPricingTier === "Tier 2" && !tierStr.includes("tier 2"))
          return false;
        if (filterPricingTier === "Tier 3" && !tierStr.includes("tier 3"))
          return false;
        if (filterPricingTier === "Tier 4" && !tierStr.includes("tier 4"))
          return false;
      }

      // 4. Active Contracts Filter
      if (filterActiveContracts !== "All") {
        const hasContracts = (c.activeContracts || 0) > 0;
        if (filterActiveContracts === "Has Contracts" && !hasContracts)
          return false;
        if (filterActiveContracts === "No Contracts" && hasContracts)
          return false;
      }

      // 5. Account Balance Filter
      if (filterAccountBalance !== "All") {
        const bal = c.accountBalance || 0;
        if (filterAccountBalance === "Debit Balance" && bal <= 0) return false;
        if (filterAccountBalance === "Credit Balance" && bal >= 0) return false;
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
  }, [
    customers,
    effectiveSearch,
    activeChip,
    filterPricingTier,
    filterActiveContracts,
    filterAccountBalance,
    filterState,
    filterCreatedDate,
    filterLastTxDate,
  ]);

  // Find active customer object for preview panel
  const activeCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // Compute stats for the active preview customer from real transactions
  const activeCustomerStats = useMemo(() => {
    if (!activeCustomer)
      return {
        totalTonnes: 0,
        totalRevenue: 0,
        matchingTxs: [] as Transaction[],
      };
    const matchingTxs = transactions.filter(
      (t) => t.customerId === activeCustomer.id,
    );
    const totalTonnes = matchingTxs.reduce(
      (sum, t) => sum + (t.netWeight || 0),
      0,
    );
    const totalRevenue = matchingTxs.reduce(
      (sum, t) => sum + (t.totalValue || 0),
      0,
    );
    return { totalTonnes, totalRevenue, matchingTxs };
  }, [activeCustomer, transactions]);

  // Simulated static details for related records (Jobs, Invoices)
  const customerJobs = useMemo(() => {
    if (!activeCustomer) return [];
    const cid = activeCustomer.id;
    if (cid === "C-401") {
      return [
        {
          id: "JOB-401-01",
          ref: "PO-2024-991",
          product: "20mm Class 3 Crushed Rock",
          orderQty: 50000,
          delQty: 31450.25,
          status: "Active",
        },
        {
          id: "JOB-401-02",
          ref: "PO-2023-884",
          product: "Class 1 Crushed Rock",
          orderQty: 12500,
          delQty: 12500,
          status: "Completed",
        },
      ];
    } else if (cid === "C-402") {
      return [
        {
          id: "JOB-402-01",
          ref: "PO-2024-001",
          product: "10mm Bayside Sand Blend",
          orderQty: 20000,
          delQty: 14205.5,
          status: "Active",
        },
      ];
    } else if (cid === "C-403") {
      return [
        {
          id: "JOB-403-01",
          ref: "PO-2025-PINN",
          product: "Pinnacle Concrete Sand",
          orderQty: 10000,
          delQty: 9800.0,
          status: "Active",
        },
      ];
    } else if (cid === "C-404") {
      return [
        {
          id: "JOB-404-01",
          ref: "REF-BOURKE-4",
          product: "Class 1 Crushed Rock",
          orderQty: 150000,
          delQty: 121540.2,
          status: "Active",
        },
      ];
    } else if (cid === "C-405") {
      return [
        {
          id: "JOB-405-01",
          ref: "PO-YARRA-ECO",
          product: "Premium Eco Topsoil",
          orderQty: 5000,
          delQty: 3150.0,
          status: "Active",
        },
      ];
    } else {
      return [
        {
          id: `JOB-${cid}-01`,
          ref: `REF-${cid}-01`,
          product: "Standard Aggregate Supply",
          orderQty: 15000,
          delQty: 2450.1,
          status: "Active",
        },
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
    setShowAddCustomerModal(true);
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
    setShowEditCustomerModal(true);
  };

  const handleSaveCustomer = (addAnother: boolean) => {
    if (
      !formName.trim() ||
      !formContact.trim() ||
      !formEmail.trim() ||
      !formPhone.trim()
    ) {
      alert(
        "Please fill in all mandatory fields: Customer Name, Contact Person, Email, and Phone.",
      );
      return;
    }

    const nextId = "C-" + (400 + customers.length + 1);
    const calculatedBillingAddress =
      `${formAddress1}${formAddress2 ? ", " + formAddress2 : ""}, ${formSuburb} ${formState} ${formPostcode}`.trim();

    const newCustomer: Customer = {
      id: showEditCustomerModal && customerToEdit ? customerToEdit.id : nextId,
      name: formName,
      contactPerson: formContact,
      email: formEmail,
      phone: formPhone,
      status: formStatus,
      billingAddress: calculatedBillingAddress || "VIC Australia",
      paymentTerms: formPricingTier.includes("Major")
        ? "60 Days Net"
        : formPricingTier.includes("Volume")
          ? "30 Days Net"
          : "14 Days Net",
      creditLimit:
        formStatus === "Suspended"
          ? 0
          : formPricingTier.includes("Major")
            ? 800000
            : formPricingTier.includes("Volume")
              ? 250000
              : 50000,
      activeContracts:
        showEditCustomerModal && customerToEdit
          ? customerToEdit.activeContracts
          : 1,
      recentActivityDate: new Date().toISOString().split("T")[0],

      customerCode:
        formCode || formName.replace(/\s+/g, "").slice(0, 10).toUpperCase(),
      mobileNo: formMobile,
      fax: formFax,
      addressLine1: formAddress1,
      addressLine2: formAddress2,
      suburbName: formSuburb,
      stateCode: formState,
      postCodeVal: formPostcode,
      pricingTier: formPricingTier,
      accountBalance: formBalance,
      lastTransactionDate:
        showEditCustomerModal && customerToEdit
          ? customerToEdit.lastTransactionDate
          : new Date().toISOString().split("T")[0],
      createdOn:
        showEditCustomerModal && customerToEdit
          ? customerToEdit.createdOn
          : new Date().toISOString().split("T")[0],
      createdBy:
        showEditCustomerModal && customerToEdit
          ? customerToEdit.createdBy
          : "Admin User",
      modifiedOn: new Date().toISOString().split("T")[0],
      modifiedBy: "Admin User",
      notes: formNotes,
      clientSince: formClientSince,
    };

    onUpdateCustomer(newCustomer);

    if (showEditCustomerModal) {
      setShowEditCustomerModal(false);
      setCustomerToEdit(null);
      alert(`Customer record for "${formName}" updated successfully.`);
    } else {
      alert(`New customer "${formName}" added successfully with ID ${nextId}.`);
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
        setShowAddCustomerModal(false);
      }
    }
  };

  // Export report flow simulation
  const handleTriggerExport = () => {
    setIsExporting(true);
    setExportProgress(5);
    setExportSuccessMessage("");

    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExporting(false);
            const reportName = getExportReportName(
              exportScope,
              activeCustomer,
              selectedIds.length,
              filteredCustomers.length,
            );
            setExportSuccessMessage(
              `Download Completed! "${reportName}" saved successfully as uniweigh_export_${Date.now()}.${exportFormat.toLowerCase()}`,
            );
          }, 350);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 10;
      });
    }, 150);
  };

  // Handle Refresh simulation
  const handleRefreshDataset = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshNotification(
        "Customer directory records synchronized with main ledger.",
      );
      setTimeout(() => setRefreshNotification(""), 4000);
    }, 900);
  };

  const handleOpenExport = (scope: "current" | "filtered" | "selected") => {
    setExportScope(scope);
    setShowExportModal(true);
  };

  const handleSelectCustomer = (c: Customer) => {
    setSelectedCustomerId(c.id);
    setShowPreview(true);
  };

  const handleBackToDirectory = () => {
    setShowPreview(false);
    setPreviewTab("jobs");
  };

  if (showPreview && activeCustomer) {
    return (
      <CustomerDetail
        activeCustomer={activeCustomer}
        matchingTxs={activeCustomerStats.matchingTxs}
        customerJobs={customerJobs}
        previewTab={previewTab}
        setPreviewTab={setPreviewTab}
        onBack={handleBackToDirectory}
        onEditCustomer={(e) => openEditModal(activeCustomer, e)}
        onRefresh={handleRefreshDataset}
        isRefreshing={isRefreshing}
        refreshNotification={refreshNotification}
        setRefreshNotification={setRefreshNotification}
        exportSuccessMessage={exportSuccessMessage}
        setExportSuccessMessage={setExportSuccessMessage}
      />
    );
  }

  return (
    <>
      <CustomersToolbar
        activeChip={activeChip}
        setActiveChip={setActiveChip}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        onAddCustomer={openAddModal}
        activeAdvancedFilterCount={activeAdvancedFilterCount}
        resetFilters={resetFilters}
        localSearch={localSearch}
        setLocalSearch={setLocalSearch}
        topSearchQuery={topSearchQuery}
        filterPricingTier={filterPricingTier}
        setFilterPricingTier={setFilterPricingTier}
        filterActiveContracts={filterActiveContracts}
        setFilterActiveContracts={setFilterActiveContracts}
        filterAccountBalance={filterAccountBalance}
        setFilterAccountBalance={setFilterAccountBalance}
        filterState={filterState}
        setFilterState={setFilterState}
        filterCreatedDate={filterCreatedDate}
        setFilterCreatedDate={setFilterCreatedDate}
        filterLastTxDate={filterLastTxDate}
        setFilterLastTxDate={setFilterLastTxDate}
      />

      <div className="px-4 pb-4">
        <CustomersTable
          processedCustomers={filteredCustomers}
          customers={customers}
          visibleColumns={visibleColumns}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          onExportClick={handleOpenExport}
          onSelectCustomer={handleSelectCustomer}
          onEditCustomer={openEditModal}
          onUpdateCustomer={onUpdateCustomer}
        />
      </div>

      <AddCustomerModal
        isOpen={showAddCustomerModal}
        onClose={() => setShowAddCustomerModal(false)}
        onSave={() => handleSaveCustomer(false)}
        onSaveAndAddAnother={() => handleSaveCustomer(true)}
        formName={formName}
        setFormName={setFormName}
        formCode={formCode}
        setFormCode={setFormCode}
        formContact={formContact}
        setFormContact={setFormContact}
        formEmail={formEmail}
        setFormEmail={setFormEmail}
        formPhone={formPhone}
        setFormPhone={setFormPhone}
        formMobile={formMobile}
        setFormMobile={setFormMobile}
        formFax={formFax}
        setFormFax={setFormFax}
        formAddress1={formAddress1}
        setFormAddress1={setFormAddress1}
        formAddress2={formAddress2}
        setFormAddress2={setFormAddress2}
        formSuburb={formSuburb}
        setFormSuburb={setFormSuburb}
        formState={formState}
        setFormState={setFormState}
        formPostcode={formPostcode}
        setFormPostcode={setFormPostcode}
        formClientSince={formClientSince}
        setFormClientSince={setFormClientSince}
        formPricingTier={formPricingTier}
        setFormPricingTier={setFormPricingTier}
        formBalance={formBalance}
        setFormBalance={setFormBalance}
        formStatus={formStatus}
        setFormStatus={setFormStatus}
        formNotes={formNotes}
        setFormNotes={setFormNotes}
      />

      <EditCustomerModal
        isOpen={showEditCustomerModal}
        customerToEdit={customerToEdit}
        onClose={() => {
          setShowEditCustomerModal(false);
          setCustomerToEdit(null);
        }}
        onSave={() => handleSaveCustomer(false)}
        formName={formName}
        setFormName={setFormName}
        formCode={formCode}
        setFormCode={setFormCode}
        formContact={formContact}
        setFormContact={setFormContact}
        formEmail={formEmail}
        setFormEmail={setFormEmail}
        formPhone={formPhone}
        setFormPhone={setFormPhone}
        formMobile={formMobile}
        setFormMobile={setFormMobile}
        formFax={formFax}
        setFormFax={setFormFax}
        formAddress1={formAddress1}
        setFormAddress1={setFormAddress1}
        formAddress2={formAddress2}
        setFormAddress2={setFormAddress2}
        formSuburb={formSuburb}
        setFormSuburb={setFormSuburb}
        formState={formState}
        setFormState={setFormState}
        formPostcode={formPostcode}
        setFormPostcode={setFormPostcode}
        formClientSince={formClientSince}
        setFormClientSince={setFormClientSince}
        formPricingTier={formPricingTier}
        setFormPricingTier={setFormPricingTier}
        formBalance={formBalance}
        setFormBalance={setFormBalance}
        formStatus={formStatus}
        setFormStatus={setFormStatus}
        formNotes={formNotes}
        setFormNotes={setFormNotes}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        exportScope={exportScope}
        setExportScope={setExportScope}
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
        isExporting={isExporting}
        exportProgress={exportProgress}
        onExport={handleTriggerExport}
        activeCustomer={activeCustomer}
        totalCustomers={customers.length}
        filteredCustomersCount={filteredCustomers.length}
        selectedIdsCount={selectedIds.length}
      />
    </>
  );
}
