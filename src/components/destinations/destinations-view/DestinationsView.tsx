import React, { useState, useMemo, useEffect } from "react";
import {
  MapPin,
  Plus,
  ChevronRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import {
  Destination,
  Customer,
  Job,
  Transaction,
  TransactionStatus,
} from "../../../types";
import { INITIAL_DESTINATIONS } from "../../../data_destinations";
import { motion, AnimatePresence } from "motion/react";
import DestinationsList from "./DestinationsList";
import DestinationForm from "./DestinationForm";
import DestinationDetail from "./DestinationDetail";
import ExportModal from "./ExportModal";
import { ExportScope, ExportFormat } from "./utils/exportHelpers";

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
  searchQuery: externalSearchQuery,
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
  const [currentMode, setCurrentMode] = useState<
    "list" | "add" | "edit" | "detail"
  >("list");
  const [selectedDestId, setSelectedDestId] = useState<string | null>(null);
  const [checkedDestIds, setCheckedDestIds] = useState<string[]>([]);

  // Detail page Tab
  const [detailTab, setDetailTab] = useState<"transactions" | "jobs">(
    "transactions",
  );

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [customerFilter, setCustomerFilter] = useState<string>("All");
  const [localSearchQuery, setLocalSearchQuery] = useState<string>("");



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
  const [exportScope, setExportScope] = useState<ExportScope>("current");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("CSV");

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
      const exists = availableJobsForFormCustomer.some(
        (j) => j.id === formJobId,
      );
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
      const matchesCustomer =
        customerFilter === "All" || d.customerId === customerFilter;

      return matchesSearch && matchesStatus && matchesCustomer;
    });
  }, [destinations, activeSearchQuery, statusFilter, customerFilter]);

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
            tx.status === TransactionStatus.COMMITTED),
      )
      .reduce((sum, tx) => sum + (tx.netWeight || 0), 0);
    const delivered = Number(delWeight.toFixed(2));
    const remaining = Number(
      Math.max(0, linkedJob.orderQty - delivered).toFixed(2),
    );
    return { delivered, remaining };
  }, [linkedJob, transactions]);

  // Helper: Open Add Form
  const handleOpenAdd = () => {
    const defaultCust = customers[0]?.id || "";
    const matchingJobs = jobs.filter((j) => j.customerId === defaultCust);

    setFormName("");
    setFormCustomerId(defaultCust);
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
  const handleSaveDestination = (
    _e?: React.FormEvent,
    isAddAnother = false,
  ) => {
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
    if (
      !formAddressLine1.trim() ||
      !formSuburb.trim() ||
      !formState.trim() ||
      !formPostcode.trim()
    ) {
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
        notes: formNotes || undefined,
      };

      setDestinations((prev) => [...prev, newDest]);
      showToast(`Destination [${nextId}] successfully registered.`);

      if (isAddAnother) {
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
            notes: formNotes || undefined,
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

  const handleViewDetail = (id: string) => {
    setSelectedDestId(id);
    setDetailTab("transactions");
    setCurrentMode("detail");
  };

  const handleBackToList = () => {
    setCurrentMode("list");
    setSelectedDestId(null);
  };

  const openExportModal = (scope: ExportScope) => {
    setExportScope(scope);
    setShowExportModal(true);
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
            className="fixed top-4 right-4 z-50 flex items-center gap-2.5 rounded-lg bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-lg border border-slate-800"
          >
            <Check className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUB-HEADER & NAVIGATION BANNER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight sm:text-2xl flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-600 shrink-0" />
            <span>Destinations</span>
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
            <span>Customers & Sales</span>
            <ChevronRight className="h-3 w-3 text-gray-300" />
            <span className="font-semibold text-blue-700">
              Destinations Directory
            </span>
          </div>
        </div>

        {/* Top-Right Action Toolbar */}
        {currentMode === "list" && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              id="btn-add-destination"
            >
              <Plus className="h-4 w-4" />
              <span>Add Destination</span>
            </button>
          </div>
        )}

        {currentMode !== "list" && (
          <button
            onClick={handleBackToList}
            className="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            id="btn-back-to-listing"
          >
            <ArrowLeft className="h-4 w-4 text-gray-400" />
            <span>Back to Listing</span>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {currentMode === "list" && (
          <DestinationsList
            destinations={destinations}
            filteredDestinations={filteredDestinations}
            customers={customers}
            checkedDestIds={checkedDestIds}
            localSearchQuery={localSearchQuery}
            setLocalSearchQuery={setLocalSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            customerFilter={customerFilter}
            setCustomerFilter={setCustomerFilter}
            onExport={() => openExportModal("current")}
            onViewDetail={handleViewDetail}
            onEdit={handleOpenEdit}
            setCheckedDestIds={setCheckedDestIds}
          />
        )}

        {(currentMode === "add" || currentMode === "edit") && (
          <DestinationForm
            mode={currentMode}
            selectedDestId={selectedDestId}
            customers={customers}
            availableJobsForFormCustomer={availableJobsForFormCustomer}
            formName={formName}
            setFormName={setFormName}
            formCustomerId={formCustomerId}
            setFormCustomerId={setFormCustomerId}
            formJobId={formJobId}
            setFormJobId={setFormJobId}
            formPhone={formPhone}
            setFormPhone={setFormPhone}
            formStatus={formStatus}
            setFormStatus={setFormStatus}
            formAddressLine1={formAddressLine1}
            setFormAddressLine1={setFormAddressLine1}
            formAddressLine2={formAddressLine2}
            setFormAddressLine2={setFormAddressLine2}
            formSuburb={formSuburb}
            setFormSuburb={setFormSuburb}
            formState={formState}
            setFormState={setFormState}
            formPostcode={formPostcode}
            setFormPostcode={setFormPostcode}
            formNotes={formNotes}
            setFormNotes={setFormNotes}
            onSave={handleSaveDestination}
            onCancel={handleBackToList}
          />
        )}

        {currentMode === "detail" && activeDestination && (
          <DestinationDetail
            activeDestination={activeDestination}
            linkedTransactions={linkedTransactions}
            linkedJob={linkedJob}
            jobMetrics={jobMetrics}
            detailTab={detailTab}
            setDetailTab={setDetailTab}
            onEdit={handleOpenEdit}
            onExportProfile={() => openExportModal("individual-summary")}
            onExportTransactions={() =>
              openExportModal("destination-transactions")
            }
            onViewTicketDetails={onViewTicketDetails}
          />
        )}
      </AnimatePresence>

      <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        exportScope={exportScope}
        setExportScope={setExportScope}
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
        destinations={destinations}
        filteredDestinations={filteredDestinations}
        checkedDestIds={checkedDestIds}
        activeDestination={activeDestination}
        linkedTransactions={linkedTransactions}
        statusFilter={statusFilter}
        customerFilter={customerFilter}
        currentMode={currentMode}
        showToast={showToast}
      />
    </div>
  );
}

export type { DestinationsViewProps };
