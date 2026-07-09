import { useState, useEffect } from "react";
import { Transaction, TransactionStatus } from "../../../types";
import { buildTransactionExport } from "./utils/exportHelpers";
import TransactionsToolbar from "./TransactionsToolbar";
import TransactionsTable from "./TransactionsTable";
import TransactionPreviewPanel from "./TransactionPreviewPanel";
import ExportModal from "./ExportModal";
import BulkCommentModal from "./BulkCommentModal";

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
  const [activeChip, setActiveChip] = useState<string>(() => {
    if (subView === "pending") return "Pending";
    if (subView === "approved") return "Approved";
    if (subView === "invoicing") return "Invoiced";
    return "All";
  });

  useEffect(() => {
    if (subView === "pending") setActiveChip("Pending");
    else if (subView === "approved") setActiveChip("Approved");
    else if (subView === "invoicing") setActiveChip("Invoiced");
    else if (subView === "all") setActiveChip("All");
  }, [subView]);

  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkCommentModal, setShowBulkCommentModal] = useState<boolean>(false);
  const [bulkCommentText, setBulkCommentText] = useState<string>("");
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [exportScope, setExportScope] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<string>("CSV");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string>("");

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

  let processedTransactions = transactions;

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

  const activeTx =
    processedTransactions.find((tx) => tx.id === selectedTxId) || processedTransactions[0];

  useEffect(() => {
    if (activeTx && selectedTxId !== activeTx.id) {
      setSelectedTxId(activeTx.id);
    }
  }, [activeTx, selectedTxId]);

  const triggerExportDownload = (scope: string, format: string) => {
    setIsExporting(true);
    setExportScope(null);

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
      const { blob, fileName } = buildTransactionExport(itemsToExport, format, scope);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsExporting(false);
      setShowExportMenu(false);
    }, 1500);
  };

  const handleBulkCommentSubmit = () => {
    const trimmed = bulkCommentText.trim();
    if (!trimmed || selectedIds.length === 0) return;

    selectedIds.forEach((id) => {
      const tx = transactions.find((t) => t.id === id);
      if (tx) {
        onUpdateTransaction({
          ...tx,
          auditHistory: [
            ...tx.auditHistory,
            {
              timestamp: new Date().toLocaleString(),
              action: "Bulk Comment Added",
              user: "Admin User",
              details: trimmed
            }
          ]
        });
      }
    });

    alert(`Successfully attached comment to all ${selectedIds.length} selected transaction(s).`);
    setBulkCommentText("");
    setShowBulkCommentModal(false);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-3">
      <TransactionsToolbar
        activeChip={activeChip}
        setActiveChip={setActiveChip}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        activeAdvancedFilterCount={activeAdvancedFilterCount}
        resetFilters={resetFilters}
        advType={advType}
        setAdvType={setAdvType}
        advStatus={advStatus}
        setAdvStatus={setAdvStatus}
        advCustomer={advCustomer}
        setAdvCustomer={setAdvCustomer}
        advJobOrder={advJobOrder}
        setAdvJobOrder={setAdvJobOrder}
        advProduct={advProduct}
        setAdvProduct={setAdvProduct}
        advLot={advLot}
        setAdvLot={setAdvLot}
        advCarter={advCarter}
        setAdvCarter={setAdvCarter}
        advDriver={advDriver}
        setAdvDriver={setAdvDriver}
        advVehicle={advVehicle}
        setAdvVehicle={setAdvVehicle}
        advTicketNo={advTicketNo}
        setAdvTicketNo={setAdvTicketNo}
        advTxCode={advTxCode}
        setAdvTxCode={setAdvTxCode}
        advBalanceMin={advBalanceMin}
        setAdvBalanceMin={setAdvBalanceMin}
        advBalanceMax={advBalanceMax}
        setAdvBalanceMax={setAdvBalanceMax}
        advDateFrom={advDateFrom}
        setAdvDateFrom={setAdvDateFrom}
        advDateTo={advDateTo}
        setAdvDateTo={setAdvDateTo}
      />

      <div className="w-full animate-fade-in">
        <TransactionsTable
          processedTransactions={processedTransactions}
          transactions={transactions}
          visibleColumns={visibleColumns}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          showExportMenu={showExportMenu}
          setShowExportMenu={setShowExportMenu}
          onExportScope={setExportScope}
          onViewTicketDetails={onViewTicketDetails}
          onUpdateTransaction={onUpdateTransaction}
          onBulkComment={() => setShowBulkCommentModal(true)}
        />
      </div>

      {showPreview && activeTx && (
        <TransactionPreviewPanel
          activeTx={activeTx}
          onUpdateTransaction={onUpdateTransaction}
          onViewTicketDetails={onViewTicketDetails}
          onClose={() => setShowPreview(false)}
        />
      )}

      <ExportModal
        exportScope={exportScope || ""}
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
        onCancel={() => setExportScope(null)}
        onGenerate={() => triggerExportDownload(exportScope || "", exportFormat)}
        isExporting={isExporting}
        exportMessage={exportMessage}
      />

      <BulkCommentModal
        show={showBulkCommentModal}
        selectedIds={selectedIds}
        commentText={bulkCommentText}
        setCommentText={setBulkCommentText}
        onCancel={() => {
          setShowBulkCommentModal(false);
          setBulkCommentText("");
        }}
        onSubmit={handleBulkCommentSubmit}
      />
    </div>
  );
}
