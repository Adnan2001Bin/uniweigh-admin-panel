import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  FileText,
  Download,
  Calendar,
  Tag,
  Ticket,
  Briefcase,
  User,
  Info,
  DollarSign,
  Layers,
  ChevronDown,
  ExternalLink,
  Eye
} from "lucide-react";
import { ProductLot, Product, Transaction, TransactionStatus } from "../types";
import { toast } from "sonner";
import { downloadLotCertificate } from "@/src/lib/lot-certificate";
import StatusBadge from "@/src/components/shared/StatusBadge";
import { TABLE_ACTION_ICON_BUTTON_CLASS } from "@/src/components/shared/table-action-styles";

const LOT_DETAIL_ACTION_CLASS =
  "inline-flex h-9 items-center justify-center rounded-md text-xs font-bold transition cursor-pointer shadow-xs";

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

  // Find the selected product lot
  const selectedLot = useMemo(() => {
    return productLots.find((l) => l.id === lotId);
  }, [productLots, lotId]);

  // Find parent product
  const parentProduct = useMemo(() => {
    if (!selectedLot) return null;
    return products.find((p) => p.id === selectedLot.productId) || null;
  }, [products, selectedLot]);

  // Find completed/approved transactions linked to this lot
  const lotTransactions = useMemo(() => {
    if (!selectedLot) return [];
    // A transaction is linked to this lot if t.lotNo === selectedLot.id
    return transactions.filter((t) => t.lotNo === selectedLot.id);
  }, [transactions, selectedLot]);

  // Dynamic system calculation for Used Quantity (approved/completed transactions)
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

  // Auto-calculated status: "If Remaining Quantity reaches zero, the Product Lot should be marked as completed or fully used."
  const displayedStatus = useMemo(() => {
    if (!selectedLot) return "Pending";
    if (remainingQuantity <= 0 && selectedLot.status === "Active") {
      return "Completed";
    }
    return selectedLot.status;
  }, [selectedLot, remainingQuantity]);

  const lotDatasheets = useMemo(() => {
    if (!selectedLot) return [];
    return selectedLot.datasheets ?? [];
  }, [selectedLot]);

  if (!selectedLot) {
    return (
      <div className="bg-destructive/10 border border-destructive/25 text-destructive rounded-md p-6 text-center text-xs font-bold space-y-3">
        <p>Error: Product Lot with ID "{lotId}" was not found or has been removed.</p>
        <button
          onClick={onBack}
          className="bg-destructive hover:bg-destructive text-white rounded-md px-4 py-2 font-bold transition text-xs"
        >
          Return to Lot Listing
        </button>
      </div>
    );
  }

  // Export individual product lot summary
  const handleExportSummary = (format: "CSV" | "Excel" | "PDF") => {
    setIsExportOpen(false);
    const prodName = parentProduct ? parentProduct.name : "Unknown Product";
    const prodCode = parentProduct ? (parentProduct.productCode || parentProduct.id) : "N/A";

    if (format === "CSV" || format === "Excel") {
      const csvData = [
        ["Uniweigh Admin Panel - Product Lot Summary Report"],
        ["Generated on", new Date().toLocaleString()],
        [],
        ["Field", "Value"],
        ["Product Lot ID", selectedLot.id],
        ["Product Lot Name", selectedLot.name],
        ["Parent Product ID", selectedLot.productId],
        ["Parent Product Code", prodCode],
        ["Parent Product Name", prodName],
        ["Order Quantity (Tonnes)", selectedLot.orderQuantity.toFixed(2)],
        ["Used Quantity (Tonnes)", usedQuantity.toFixed(2)],
        ["Remaining Quantity (Tonnes)", remainingQuantity.toFixed(2)],
        ["Status", displayedStatus],
        ["Notes", selectedLot.notes || ""],
        ["Created Date", selectedLot.createdDate || "N/A"]
      ];

      const csvContent =
        "data:text/csv;charset=utf-8," +
        csvData.map((e) => e.map((val) => `"${val}"`).join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Product_Lot_Summary_${selectedLot.id}.${format === "CSV" ? "csv" : "xlsx"}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "PDF") {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Pop-up blocked. Please allow pop-ups to view printable summaries.");
        return;
      }
      printWindow.document.write(`
        <html>
        <head>
          <title>Lot Summary - ${selectedLot.id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; line-height: 1.5; }
            h1 { font-size: 22px; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 5px; }
            .meta { font-size: 11px; color: #666; margin-bottom: 30px; }
            .section { font-size: 14px; font-weight: bold; background: #f5f5f5; padding: 6px 12px; margin-top: 20px; border-left: 4px solid #0066cc; }
            .grid { display: grid; grid-template-cols: 150px 1fr; gap: 8px; margin-top: 15px; font-size: 12px; }
            .label { font-weight: bold; color: #666; }
            .value { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Product Lot Summary Report</h1>
          <div class="meta">Generated: ${new Date().toLocaleString()}</div>
          
          <div class="section">LOT ALLOCATION DETAILS</div>
          <div class="grid">
            <div class="label">Product Lot ID:</div><div class="value">${selectedLot.id}</div>
            <div class="label">Product Lot Name:</div><div class="value">${selectedLot.name}</div>
            <div class="label">Status:</div><div class="value"><span style="background: #eef2f3; padding: 2px 6px; border-radius: 4px; border: 1px solid #ccc;">${displayedStatus}</span></div>
            <div class="label">Created Date:</div><div class="value">${selectedLot.createdDate || "N/A"}</div>
            <div class="label">Notes:</div><div class="value">${selectedLot.notes || "No notes available."}</div>
          </div>

          <div class="section">PRODUCT DETAILS</div>
          <div class="grid">
            <div class="label">Product ID:</div><div class="value">${selectedLot.productId}</div>
            <div class="label">Product Code:</div><div class="value">${prodCode}</div>
            <div class="label">Product Name:</div><div class="value">${prodName}</div>
            <div class="label">Weighbridge Site:</div><div class="value">${parentProduct?.site || "N/A"}</div>
          </div>

          <div class="section">QUANTITY BALANCES (TONNES)</div>
          <div class="grid">
            <div class="label">Order Quantity:</div><div class="value">${selectedLot.orderQuantity.toFixed(2)} t</div>
            <div class="label">Used Quantity:</div><div class="value" style="color: green;">${usedQuantity.toFixed(2)} t</div>
            <div class="label">Remaining Quantity:</div><div class="value" style="color: blue; font-size: 13px;">${remainingQuantity.toFixed(2)} t</div>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Export linked transactions
  const handleExportTransactions = (format: "CSV" | "Excel" | "PDF") => {
    setIsExportOpen(false);

    if (lotTransactions.length === 0) {
      toast.info("No transaction records found linked to this product lot.");
      return;
    }

    const headers = [
      "Transaction ID",
      "Type",
      "Ticket Number",
      "Transaction Code",
      "Customer",
      "Job",
      "Net Weight (t)",
      "Status",
      "Created Date"
    ];

    const rows = lotTransactions.map((t) => [
      t.id,
      t.type || "Account",
      t.ticketNo,
      t.transactionCode || "N/A",
      t.customerName,
      t.jobOrder,
      t.netWeight.toFixed(2),
      t.status,
      t.auditHistory?.[0]?.timestamp || "N/A"
    ]);

    const fileTitle = `Product_Lot_Transactions_${selectedLot.id}`;

    if (format === "CSV" || format === "Excel") {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${fileTitle}.${format === "CSV" ? "csv" : "xlsx"}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "PDF") {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Pop-up blocked. Please allow pop-ups to print transactions list.");
        return;
      }

      const htmlRows = rows
        .map(
          (r) => `
        <tr style="border-bottom: 1px solid #ddd; font-size: 11px;">
          <td style="padding: 6px; font-family: monospace; font-weight: bold;">${r[0]}</td>
          <td style="padding: 6px;">${r[1]}</td>
          <td style="padding: 6px; font-family: monospace;">${r[2]}</td>
          <td style="padding: 6px;">${r[4]}</td>
          <td style="padding: 6px; font-family: monospace;">${r[5]}</td>
          <td style="padding: 6px; text-align: right; font-family: monospace;">${r[6]} t</td>
          <td style="padding: 6px; text-align: center;">${r[7]}</td>
        </tr>`
        )
        .join("");

      printWindow.document.write(`
        <html>
        <head>
          <title>Transactions List - Lot ${selectedLot.id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; color: #333; }
            h1 { font-size: 18px; border-bottom: 2px solid #333; padding-bottom: 8px; }
            .meta { font-size: 11px; color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f5f5f5; border-bottom: 2px solid #ccc; padding: 6px; font-size: 11px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Transactions Linked to Product Lot: ${selectedLot.id} (${selectedLot.name})</h1>
          <div class="meta">Generated: ${new Date().toLocaleString()}</div>
          <table>
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Type</th>
                <th>Ticket No</th>
                <th>Customer</th>
                <th>Job</th>
                <th style="text-align: right;">Net Weight</th>
                <th style="text-align: center;">Status</th>
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
      {/* Return Navigation + Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="group inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-info transition bg-card border border-border rounded-md px-3.5 py-2 shadow-xs cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Product Lots List</span>
        </button>

        <div className="relative self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsExportOpen(!isExportOpen)}
            className={`${LOT_DETAIL_ACTION_CLASS} gap-1.5 border border-border bg-card px-3.5 text-foreground hover:bg-muted`}
          >
            <Download className="h-4 w-4 shrink-0" />
            <span>Export Lot Data</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {isExportOpen && (
            <div className="absolute right-0 mt-1.5 w-56 bg-card border border-border rounded-md shadow-lg py-1.5 z-20 text-xs">
              <div className="px-3 py-1 font-bold text-muted-foreground text-xs uppercase tracking-widest border-b border-border mb-1">
                Summary Sheet Reports
              </div>
              <button
                onClick={() => handleExportSummary("CSV")}
                className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2 text-xs"
              >
                <FileText className="h-3 w-3 text-success" />
                Export Lot Summary (CSV)
              </button>
              <button
                onClick={() => handleExportSummary("Excel")}
                className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2 text-xs"
              >
                <FileText className="h-3 w-3 text-info" />
                Export Lot Summary (Excel)
              </button>
              <button
                onClick={() => handleExportSummary("PDF")}
                className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2 text-xs"
              >
                <FileText className="h-3 w-3 text-destructive" />
                Print Lot Summary PDF
              </button>

              <div className="px-3 py-1 font-bold text-muted-foreground text-xs uppercase tracking-widest border-b border-t border-border my-1">
                Linked Transactions Sheet
              </div>
              <button
                onClick={() => handleExportTransactions("CSV")}
                className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2 text-xs"
              >
                <FileText className="h-3 w-3 text-success" />
                Export Transactions (CSV)
              </button>
              <button
                onClick={() => handleExportTransactions("Excel")}
                className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2 text-xs"
              >
                <FileText className="h-3 w-3 text-info" />
                Export Transactions (Excel)
              </button>
              <button
                onClick={() => handleExportTransactions("PDF")}
                className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2 text-xs"
              >
                <FileText className="h-3 w-3 text-destructive" />
                Print Transactions PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hero header card */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card border border-border rounded-md px-6 py-5 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-muted border border-border text-info flex items-center justify-center shadow-inner shrink-0">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Lot ID: {selectedLot.id}
              </span>
              <StatusBadge
                status={displayedStatus === "Completed" ? "Completed" : displayedStatus}
                className="rounded-md"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2.5 mt-1">
              <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                {selectedLot.name}
              </h1>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground bg-muted border border-border rounded-md px-2.5 py-1 select-none">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Registered: {selectedLot.createdDate || "N/A"}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid: left metadata (4) + right tonnage profile (8) */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-card border border-border rounded-md p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border pb-2">
              Lot Details
            </h3>
            <div className="space-y-4 text-sm text-foreground font-normal">
              <div className="flex items-start gap-2.5">
                <Tag className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground font-semibold mb-0.5">Lot ID</div>
                  <div className="font-mono font-bold text-foreground">{selectedLot.id}</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Layers className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground font-semibold mb-0.5">Lot Name</div>
                  <div className="font-bold text-foreground">{selectedLot.name}</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground font-semibold mb-0.5">Parent Product</div>
                  <div className="font-bold text-foreground">{parentProduct?.name || "N/A"}</div>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">{selectedLot.productId}</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground font-semibold mb-0.5">Registered</div>
                  <div className="font-semibold text-foreground">{selectedLot.createdDate || "N/A"}</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground font-semibold mb-0.5">Status</div>
                  <StatusBadge
                    status={displayedStatus === "Completed" ? "Completed" : displayedStatus}
                    className="mt-0.5 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted border border-border rounded-md p-4 text-xs space-y-2">
            <span className="font-bold text-foreground block uppercase tracking-wider text-xs">
              Lot Snapshot
            </span>
            <div className="space-y-1.5 font-medium">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Linked Transactions:</span>
                <span className="text-foreground font-mono font-bold">{lotTransactions.length}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Quality Certificates:</span>
                <span className="text-foreground font-mono font-bold">{lotDatasheets.length}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Lot State:</span>
                <span className={displayedStatus === "Active" ? "text-success font-bold" : "text-foreground font-bold"}>
                  {displayedStatus === "Completed" ? "Fully Used" : displayedStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-card border border-border rounded-md shadow-xs overflow-hidden">
          <div className="p-6 space-y-6 text-sm leading-relaxed text-foreground min-h-[360px]">
            <div>
              <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2">
                Batch Allocation & Tonnage Balance
              </h4>
              <p className="text-xs text-muted-foreground">
                Allocated batch tonnage versus used and remaining capacity for this product lot.
              </p>
            </div>

            <div className="rounded-md border border-info/25 bg-info/10 p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1 opacity-10">
                <Layers className="h-28 w-28 text-info" />
              </div>
              <h4 className="text-xs font-bold text-info uppercase tracking-widest mb-3 flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" />
                Quantity Progress (Tonnes)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center items-stretch">
                <div className="rounded-md bg-card p-3 border border-border">
                  <div className="text-xs font-bold text-muted-foreground uppercase">Order Quantity</div>
                  <div className="text-lg font-bold font-mono text-foreground mt-1">
                    {selectedLot.orderQuantity.toFixed(2)} t
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Total allocated for batch</p>
                </div>
                <div className="rounded-md bg-card p-3 border border-border">
                  <div className="text-xs font-bold text-muted-foreground uppercase">Used Quantity</div>
                  <div className="text-lg font-bold font-mono text-success mt-1">
                    {usedQuantity.toFixed(2)} t
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">From approved records</p>
                </div>
                <div className="rounded-md bg-card p-3 border border-border">
                  <div className="text-xs font-bold text-muted-foreground uppercase">Remaining Quantity</div>
                  <div className={`text-lg font-bold font-mono mt-1 ${remainingQuantity < 0 ? "text-destructive" : "text-info"}`}>
                    {remainingQuantity.toFixed(2)} t
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Capacity remaining</p>
                </div>
              </div>

              <div className="mt-4 border-t border-info/25 pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-muted-foreground">Parent Product:</span>
                  <span className="text-sm font-bold text-foreground block mt-0.5">
                    {parentProduct?.name || "N/A"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-muted-foreground block mb-0.5">Remaining Capacity:</span>
                  <span className={`text-xl font-bold font-mono px-3.5 py-1 rounded-md inline-block border ${
                    remainingQuantity < 0
                      ? "text-destructive bg-destructive/10 border-destructive/25"
                      : "text-info bg-info/10 border-info/25"
                  }`}>
                    {remainingQuantity.toFixed(2)} Tonnes
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                Lot Notes & Directives
              </h4>
              <div className="p-4 rounded-md bg-warning/10 border border-warning/30 text-xs font-medium italic text-warning whitespace-pre-line">
                &ldquo;{selectedLot.notes || "No notes, comments, or custom directives provided for this batch lot."}&rdquo;
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab controls - only 2 tabs as per request: Transactions and Product */}
      <div className="space-y-4">
        <div className="border-b border-border">
          <nav className="flex gap-4 -mb-px" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("transactions")}
              className={`py-2 px-1 border-b-2 font-bold text-xs select-none transition ${
                activeTab === "transactions"
                  ? "border-primary text-info"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-input"
              }`}
            >
              Transactions Log ({lotTransactions.length})
            </button>
            <button
              onClick={() => setActiveTab("product")}
              className={`py-2 px-1 border-b-2 font-bold text-xs select-none transition ${
                activeTab === "product"
                  ? "border-primary text-info"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-input"
              }`}
            >
              Product Specification
            </button>
            <button
              onClick={() => setActiveTab("datasheets")}
              className={`py-2 px-1 border-b-2 font-bold text-xs select-none transition ${
                activeTab === "datasheets"
                  ? "border-primary text-info"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-input"
              }`}
            >
              Quality Certificates ({lotDatasheets.length})
            </button>
          </nav>
        </div>

        {/* Tab Contents */}
        {activeTab === "transactions" && (
          <div className="bg-card border border-border rounded-md shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Linked Transactions Registry</h3>
                <p className="text-xs text-muted-foreground font-bold">Records that are tracked against or deducted from this lot allocation.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-3">Transaction ID</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Ticket Number</th>
                    <th className="px-6 py-3">Transaction Code</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Job</th>
                    <th className="px-6 py-3 text-right">Net Weight</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-center font-bold">Created Date</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lotTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-xs text-muted-foreground font-medium">
                        No transactions registered with Lot No "{selectedLot.id}".
                      </td>
                    </tr>
                  ) : (
                    lotTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-muted transition duration-150">
                        <td className="px-6 py-4 font-bold font-mono text-foreground">{tx.id}</td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-foreground">{tx.type || "Account"}</span>
                        </td>
                        <td className="px-6 py-4 font-bold font-mono text-muted-foreground">{tx.ticketNo}</td>
                        <td className="px-6 py-4 font-mono font-bold text-muted-foreground">{tx.transactionCode || "N/A"}</td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-foreground block">{tx.customerName}</span>
                          <span className="text-xs text-muted-foreground font-mono font-bold">ID: {tx.customerId}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono font-bold bg-muted text-foreground px-1.5 py-0.5 rounded text-xs">
                            {tx.jobOrder}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-foreground">
                          {tx.netWeight.toFixed(2)} t
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-bold border uppercase tracking-wider ${
                              tx.status === TransactionStatus.APPROVED || tx.status === TransactionStatus.COMMITTED || tx.status === TransactionStatus.INVOICED
                                ? "bg-success/10 text-success border-success/25"
                                : tx.status === TransactionStatus.CANCELLED
                                ? "bg-destructive/10 text-destructive border-destructive/25"
                                : "bg-warning/10 text-warning border-warning/30"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-mono text-xs text-muted-foreground font-bold">
                          {tx.auditHistory?.[0]?.timestamp || tx.comments ? "2026-06-22" : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => onViewTicketDetails(tx.id)}
                            className={`${TABLE_ACTION_ICON_BUTTON_CLASS} mx-auto`}
                            title="Open ticket details"
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

        {activeTab === "product" && (
          <div className="bg-card border border-border rounded-md shadow-xs p-6 space-y-6">
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Parent Product Specifications</h3>
              <p className="text-xs text-muted-foreground font-bold">Detailed specifications of the material associated with this batch.</p>
            </div>

            {parentProduct ? (
              <div className="grid grid-cols-1 gap-y-4 text-xs max-w-xl">
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="font-bold text-muted-foreground">Product ID</span>
                    <span className="font-mono font-bold text-foreground">{parentProduct.id}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="font-bold text-muted-foreground">Product Code</span>
                    <span className="font-mono font-bold text-foreground">{parentProduct.productCode || parentProduct.id}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="font-bold text-muted-foreground">Product Name</span>
                    <span className="font-bold text-info">{parentProduct.name}</span>
                  </div>
                </div>

                {parentProduct.notes && (
                  <div className="bg-muted border border-border rounded-md p-4 mt-2">
                    <span className="text-xs font-bold text-muted-foreground block mb-1">Product Description / Notes</span>
                    <p className="text-muted-foreground font-medium italic">{parentProduct.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground italic text-center py-6">Parent product specifications are not loaded.</p>
            )}
          </div>
        )}

        {activeTab === "datasheets" && (
          <div className="bg-card border border-border rounded-md p-6 shadow-xs space-y-6 text-xs">
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Lot Quality Certifications & Lab Specifications</span>
                <span className="bg-warning/10 text-warning text-xs font-bold px-2 py-0.5 rounded-full font-mono">
                  {selectedLot.id}
                </span>
              </h3>
              <p className="text-xs text-muted-foreground font-bold mt-1">
                Material safety, composition analysis, and quality standards for this active batch lot.
              </p>
            </div>

            {lotDatasheets.length === 0 ? (
              <div className="bg-muted rounded-md p-6 text-center text-muted-foreground italic font-medium">
                No quality certificates registered for this specific lot.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lotDatasheets.map((ds, idx) => (
                  <div key={idx} className="border border-border rounded-md p-4 flex items-center justify-between gap-4 bg-muted hover:bg-muted transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="bg-warning/10 text-warning p-2.5 rounded-md shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-foreground block truncate" title={ds.name}>
                          {ds.name}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium block mt-0.5">
                          {ds.size} • Uploaded {ds.uploadedAt}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (ds.url) {
                          downloadLotCertificate(ds);
                          return;
                        }
                        toast.error("Certificate file is not available for download.");
                      }}
                      className="p-1.5 text-muted-foreground hover:text-info hover:bg-card border border-transparent hover:border-border rounded-md transition shrink-0 cursor-pointer"
                      title="Download certificate"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-info/10 border border-info/25 rounded-md p-4 flex items-start gap-3 mt-4">
              <Info className="h-5 w-5 text-info shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-info block text-xs uppercase tracking-wider">Need to Register a New Certificate?</span>
                <p className="text-xs text-info leading-normal mt-0.5 font-medium">
                  Upload PDF certificates when creating or editing a product lot from the <strong>Product Lots</strong> listing screen.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
