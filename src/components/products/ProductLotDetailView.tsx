import React, { useState, useMemo } from "react";
import { ArrowLeft, Download, ChevronDown, FileText } from "lucide-react";
import { ProductLot, Product, Transaction, TransactionStatus } from "../../types";
import ProductLotSummaryCard from "./product-lot-detail/ProductLotSummaryCard";
import TransactionsTab from "./product-lot-detail/tabs/TransactionsTab";
import ProductSpecTab from "./product-lot-detail/tabs/ProductSpecTab";
import DatasheetsTab from "./product-lot-detail/tabs/DatasheetsTab";
import { exportLotSummary, exportLotTransactions } from "./product-lot-detail/utils/exportHelpers";
import { getDefaultLotDatasheet } from "./product-lot-detail/utils/certificateHelpers";

interface ProductLotDetailViewProps {
  lotId: string;
  productLots: ProductLot[];
  products: Product[];
  transactions: Transaction[];
  onBack: () => void;
  onViewTicketDetails: (ticketId: string) => void;
}

export default function ProductLotDetailView({
  lotId,
  productLots,
  products,
  transactions,
  onBack,
  onViewTicketDetails
}: ProductLotDetailViewProps) {
  const [activeTab, setActiveTab] = useState<"transactions" | "product" | "datasheets">("transactions");
  const [isExportOpen, setIsExportOpen] = useState(false);

  const selectedLot = useMemo(() => {
    return productLots.find((l) => l.id === lotId);
  }, [productLots, lotId]);

  const parentProduct = useMemo(() => {
    if (!selectedLot) return null;
    return products.find((p) => p.id === selectedLot.productId) || null;
  }, [products, selectedLot]);

  const lotTransactions = useMemo(() => {
    if (!selectedLot) return [];
    return transactions.filter((t) => t.lotNo === selectedLot.id);
  }, [transactions, selectedLot]);

  const usedQuantity = useMemo(() => {
    if (!selectedLot) return 0;
    const completedTxs = lotTransactions.filter(
      (t) =>
        t.status === TransactionStatus.APPROVED ||
        t.status === TransactionStatus.INVOICED ||
        t.status === TransactionStatus.COMMITTED
    );
    const sum = completedTxs.reduce((acc, t) => acc + (t.netWeight || 0), 0);
    return Number(sum.toFixed(2));
  }, [lotTransactions, selectedLot]);

  const remainingQuantity = useMemo(() => {
    if (!selectedLot) return 0;
    return Number((selectedLot.orderQuantity - usedQuantity).toFixed(2));
  }, [selectedLot, usedQuantity]);

  const displayedStatus = useMemo(() => {
    if (!selectedLot) return "Pending";
    if (remainingQuantity <= 0 && selectedLot.status === "Active") {
      return "Completed";
    }
    return selectedLot.status;
  }, [selectedLot, remainingQuantity]);

  const currentLotRecentLotObj = useMemo(() => {
    if (!parentProduct || !selectedLot) return null;
    return (parentProduct.recentLots || []).find((l) => l.lotNumber === selectedLot.lotNumber) || null;
  }, [parentProduct, selectedLot]);

  const lotDatasheets = useMemo(() => {
    if (!selectedLot) return [];
    if (currentLotRecentLotObj && currentLotRecentLotObj.datasheets) {
      return currentLotRecentLotObj.datasheets;
    }
    return [getDefaultLotDatasheet(selectedLot.lotNumber || selectedLot.id)];
  }, [currentLotRecentLotObj, selectedLot]);

  if (!selectedLot) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6 text-center text-xs font-bold space-y-3">
        <p>Error: Product Lot with ID "{lotId}" was not found or has been removed.</p>
        <button
          onClick={onBack}
          className="bg-red-800 hover:bg-red-900 text-white rounded-lg px-4 py-2 font-black transition text-[11px]"
        >
          Return to Lot Listing
        </button>
      </div>
    );
  }

  const handleExportSummary = (format: "CSV" | "Excel" | "PDF") => {
    setIsExportOpen(false);
    exportLotSummary(selectedLot, parentProduct, usedQuantity, remainingQuantity, displayedStatus, format);
  };

  const handleExportTransactions = (format: "CSV" | "Excel" | "PDF") => {
    setIsExportOpen(false);
    exportLotTransactions(selectedLot, lotTransactions, format);
  };

  const tabButtonClass = (tab: typeof activeTab) =>
    `py-2 px-1 border-b-2 font-black text-xs select-none transition ${
      activeTab === tab
        ? "border-blue-600 text-blue-700"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    }`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 text-xs font-extrabold text-blue-600 hover:text-blue-800 transition select-none"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition" />
          Back to Product Lots List
        </button>

        <div className="relative self-start sm:self-auto">
          <button
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="rounded-lg border border-gray-200 bg-white hover:bg-gray-50 px-3.5 py-1.5 text-xs font-bold text-gray-700 transition flex items-center gap-1.5 select-none"
          >
            <Download className="h-3.5 w-3.5 text-gray-500" />
            Export Lot Data
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </button>

          {isExportOpen && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1.5 z-20 text-xs">
              <div className="px-3 py-1 font-black text-gray-400 text-[9px] uppercase tracking-widest border-b border-gray-100 mb-1">
                Summary Sheet Reports
              </div>
              <button
                onClick={() => handleExportSummary("CSV")}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-semibold text-gray-700 flex items-center gap-2 text-[11px]"
              >
                <FileText className="h-3 w-3 text-emerald-600" />
                Export Lot Summary (CSV)
              </button>
              <button
                onClick={() => handleExportSummary("Excel")}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-semibold text-gray-700 flex items-center gap-2 text-[11px]"
              >
                <FileText className="h-3 w-3 text-blue-600" />
                Export Lot Summary (Excel)
              </button>
              <button
                onClick={() => handleExportSummary("PDF")}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-semibold text-gray-700 flex items-center gap-2 text-[11px]"
              >
                <FileText className="h-3 w-3 text-red-600" />
                Print Lot Summary PDF
              </button>

              <div className="px-3 py-1 font-black text-gray-400 text-[9px] uppercase tracking-widest border-b border-t border-gray-100 my-1">
                Linked Transactions Sheet
              </div>
              <button
                onClick={() => handleExportTransactions("CSV")}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-semibold text-gray-700 flex items-center gap-2 text-[11px]"
              >
                <FileText className="h-3 w-3 text-emerald-600" />
                Export Transactions (CSV)
              </button>
              <button
                onClick={() => handleExportTransactions("Excel")}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-semibold text-gray-700 flex items-center gap-2 text-[11px]"
              >
                <FileText className="h-3 w-3 text-blue-600" />
                Export Transactions (Excel)
              </button>
              <button
                onClick={() => handleExportTransactions("PDF")}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-semibold text-gray-700 flex items-center gap-2 text-[11px]"
              >
                <FileText className="h-3 w-3 text-red-600" />
                Print Transactions PDF
              </button>
            </div>
          )}
        </div>
      </div>

      <ProductLotSummaryCard
        selectedLot={selectedLot}
        displayedStatus={displayedStatus}
        usedQuantity={usedQuantity}
        remainingQuantity={remainingQuantity}
      />

      <div className="space-y-4">
        <div className="border-b border-gray-200">
          <nav className="flex gap-4 -mb-px" aria-label="Tabs">
            <button onClick={() => setActiveTab("transactions")} className={tabButtonClass("transactions")}>
              Transactions Log ({lotTransactions.length})
            </button>
            <button onClick={() => setActiveTab("product")} className={tabButtonClass("product")}>
              Product Specification
            </button>
            <button onClick={() => setActiveTab("datasheets")} className={tabButtonClass("datasheets")}>
              Quality Certificates ({lotDatasheets.length})
            </button>
          </nav>
        </div>

        {activeTab === "transactions" && (
          <TransactionsTab
            selectedLot={selectedLot}
            lotTransactions={lotTransactions}
            onViewTicketDetails={onViewTicketDetails}
          />
        )}

        {activeTab === "product" && <ProductSpecTab parentProduct={parentProduct} />}

        {activeTab === "datasheets" && <DatasheetsTab selectedLot={selectedLot} lotDatasheets={lotDatasheets} />}
      </div>
    </div>
  );
}
