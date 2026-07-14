import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Download,
  Calendar,
  Phone,
  DollarSign,
  FileText,
  User,
  Building,
  CheckCircle,
  Eye,
  ChevronDown,
  Clock,
  ExternalLink,
  ShieldCheck,
  Check,
  Scale,
  X,
  Info
} from "lucide-react";
import { Carrier, Driver, Transaction, TransactionStatus } from "../types";
import { toast } from "sonner";
import StatusBadge from "@/src/components/shared/StatusBadge";
import { TABLE_ACTION_ICON_BUTTON_CLASS } from "@/src/components/shared/table-action-styles";

const DRIVER_DETAIL_ACTION_CLASS =
  "inline-flex h-9 items-center justify-center rounded-md text-xs font-bold transition cursor-pointer shadow-xs";

interface DriverDetailViewProps {
  driverId: string;
  drivers: Driver[];
  carriers: Carrier[];
  transactions: Transaction[];
  onBack: () => void;
  onViewTicketDetails: (ticketId: string) => void;
}

export default function DriverDetailView({
  driverId,
  drivers,
  carriers,
  transactions,
  onBack,
  onViewTicketDetails
}: DriverDetailViewProps) {
  const [activeTab, setActiveTab] = useState<"transactions" | "carter">("transactions");
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Find the selected driver
  const driver = useMemo(() => {
    return drivers.find(
      (d) => d.id.toLowerCase() === driverId.toLowerCase()
    );
  }, [drivers, driverId]);

  // Find linked carter (Carrier)
  const linkedCarter = useMemo(() => {
    if (!driver) return null;
    return carriers.find(
      (c) => c.name.toLowerCase() === driver.carrierName.toLowerCase() || c.id.toLowerCase() === driver.carrierId.toLowerCase()
    );
  }, [carriers, driver]);

  // Find linked transactions
  const linkedTransactions = useMemo(() => {
    if (!driver) return [];
    return transactions.filter(
      (t) => t.driverName.toLowerCase() === driver.name.toLowerCase()
    );
  }, [transactions, driver]);

  if (!driver) {
    return (
      <div className="bg-destructive/10 border border-destructive/25 text-destructive rounded-md p-6 text-center text-xs font-bold space-y-3">
        <p>Error: Driver with ID "{driverId}" was not found.</p>
        <button
          onClick={onBack}
          className="bg-destructive hover:bg-destructive text-white rounded-md px-4 py-2 font-bold transition text-xs"
        >
          Return to Drivers Listing
        </button>
      </div>
    );
  }

  // Individual Export of Driver Specification Summary
  const handleExportIndividualSummary = (format: "CSV" | "Excel" | "PDF") => {
    setIsExportOpen(false);
    const summaryData = [
      ["Driver Field", "Value"],
      ["Driver ID", driver.id],
      ["Driver Name", driver.name],
      ["Licence Number", driver.licenseNumber],
      ["Phone Number", driver.phoneNumber || "N/A"],
      ["Carter Name", driver.carrierName],
      ["Status", driver.status],
      ["Operational Notes", driver.notes || ""]
    ];

    if (format === "CSV" || format === "Excel") {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        summaryData.map((e) => e.map((val) => `"${val}"`).join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Uniweigh_Driver_Summary_${driver.id}.${format === "CSV" ? "csv" : "xlsx"}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "PDF") {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Pop-up blocked. Please enable pop-ups to print PDF reports.");
        return;
      }
      printWindow.document.write(`
        <html>
        <head>
          <title>Driver Specification Summary - ${driver.id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 35px; color: #333; }
            h1 { font-size: 20px; border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 15px; }
            .grid-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .grid-table td { padding: 10px; border: 1px solid #e2e8f0; font-size: 12px; }
            .grid-table td.label { font-weight: bold; background: #f8fafc; width: 30%; color: #475569; }
            .meta { font-size: 11px; color: #64748b; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>Logistics Driver Specification Summary Sheet</h1>
          <table class="grid-table">
            <tr><td class="label">Driver ID</td><td style="font-family: monospace; font-weight: bold;">${driver.id}</td></tr>
            <tr><td class="label">Driver Name</td><td style="font-weight: bold;">${driver.name}</td></tr>
            <tr><td class="label">Licence Number</td><td style="font-family: monospace;">${driver.licenseNumber}</td></tr>
            <tr><td class="label">Phone Number</td><td>${driver.phoneNumber || "0400 000 000"}</td></tr>
            <tr><td class="label">Carter Link</td><td>${driver.carrierName}</td></tr>
            <tr><td class="label">Operational Status</td><td style="font-weight: bold; color: ${driver.status === "Active" ? "green" : "red"};">${driver.status}</td></tr>
            <tr><td class="label">Operational Notes</td><td>${driver.notes || "No operational safety notes recorded."}</td></tr>
          </table>
          <div class="meta">Uniweigh Logistics Compliance System | Generated: ${new Date().toLocaleString()}</div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Export linked Transactions list
  const handleExportTransactions = (format: "CSV" | "Excel" | "PDF") => {
    setIsExportOpen(false);
    const headers = [
      "Transaction ID",
      "Type",
      "Ticket Number",
      "Transaction Code",
      "Customer",
      "Job",
      "Product",
      "Carter",
      "Vehicle",
      "Net Weight (t)",
      "Status",
      "Created Date"
    ];

    const rows = linkedTransactions.map((t) => [
      t.id,
      t.type || "Account",
      t.ticketNo,
      t.transactionCode || "N/A",
      t.customerName,
      t.jobOrder || "N/A",
      t.productName,
      t.carrierName,
      t.vehicleReg,
      t.netWeight.toFixed(2),
      t.status,
      t.firstWeighTime
    ]);

    if (format === "CSV" || format === "Excel") {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Uniweigh_Driver_Transactions_${driver.id}.${format === "CSV" ? "csv" : "xlsx"}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "PDF") {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Pop-up blocked. Please enable pop-ups to print PDF reports.");
        return;
      }
      const htmlRows = rows
        .map(
          (r) => `
        <tr style="border-bottom: 1px solid #eee; font-size: 10px;">
          <td style="padding: 6px; font-weight: bold;">${r[0]}</td>
          <td style="padding: 6px;">${r[2]}</td>
          <td style="padding: 6px;">${r[4]}</td>
          <td style="padding: 6px;">${r[6]}</td>
          <td style="padding: 6px; font-family: monospace;">${r[8]}</td>
          <td style="padding: 6px; text-align: right; font-weight: bold;">${r[9]} t</td>
          <td style="padding: 6px;">${r[10]}</td>
          <td style="padding: 6px;">${r[11]}</td>
        </tr>`
        )
        .join("");

      printWindow.document.write(`
        <html>
        <head>
          <title>Weighbridge Transactions - Driver: ${driver.name}</title>
          <style>
            body { font-family: sans-serif; padding: 30px; color: #222; }
            h1 { font-size: 16px; border-bottom: 2px solid #111; padding-bottom: 6px; margin-bottom: 4px; }
            .subtitle { font-size: 11px; color: #555; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f4f4f5; text-align: left; padding: 6px; font-size: 10px; border-bottom: 1px solid #ccc; }
          </style>
        </head>
        <body>
          <h1>Weighbridge Inbound/Outbound Transactions Log</h1>
          <div class="subtitle">Driver: ${driver.name} | ID: ${driver.id} | Carter: ${driver.carrierName}</div>
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Ticket No</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Vehicle</th>
                <th style="text-align: right;">Net Weight</th>
                <th>Status</th>
                <th>Weigh Date</th>
              </tr>
            </thead>
            <tbody>
              ${htmlRows}
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); }</script>
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
          title="Return to drivers ledger list"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Drivers List</span>
        </button>

        <div className="relative self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsExportOpen(!isExportOpen)}
            className={`${DRIVER_DETAIL_ACTION_CLASS} gap-1.5 border border-border bg-card px-3.5 text-foreground hover:bg-muted`}
          >
            <Download className="h-4 w-4 shrink-0" />
            <span>Export Options</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {isExportOpen && (
            <div className="absolute right-0 mt-1.5 w-56 bg-card border border-border rounded-md shadow-lg py-2 z-20 text-xs">
              <div className="px-3 py-1 text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border mb-1">
                Export Summary Card
              </div>
              <button
                onClick={() => handleExportIndividualSummary("CSV")}
                className="w-full text-left px-3.5 py-1.5 hover:bg-muted font-bold text-foreground flex items-center gap-2"
              >
                Export Specs to CSV
              </button>
              <button
                onClick={() => handleExportIndividualSummary("PDF")}
                className="w-full text-left px-3.5 py-1.5 hover:bg-muted font-bold text-foreground flex items-center gap-2"
              >
                Print Specs Sheet (PDF)
              </button>

              <div className="px-3 py-1 text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-t border-border my-1">
                Export Transaction List
              </div>
              <button
                onClick={() => handleExportTransactions("CSV")}
                className="w-full text-left px-3.5 py-1.5 hover:bg-muted font-bold text-foreground flex items-center gap-2 disabled:opacity-50"
                disabled={linkedTransactions.length === 0}
              >
                Export Transactions (CSV)
              </button>
              <button
                onClick={() => handleExportTransactions("PDF")}
                className="w-full text-left px-3.5 py-1.5 hover:bg-muted font-bold text-foreground flex items-center gap-2 disabled:opacity-50"
                disabled={linkedTransactions.length === 0}
              >
                Print Transactions PDF (PDF)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hero header card */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card border border-border rounded-md px-6 py-5 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-muted border border-border text-info flex items-center justify-center shadow-inner shrink-0">
            <User className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Driver ID: {driver.id}
              </span>
              <StatusBadge status={driver.status} className="rounded-md" />
            </div>
            <div className="flex flex-wrap items-center gap-2.5 mt-1">
              <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                {driver.name}
              </h1>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground bg-muted border border-border rounded-md px-2.5 py-1 select-none">
                <Building className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{driver.carrierName}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid: left metadata (4) + right compliance profile (8) */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-card border border-border rounded-md p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border pb-2">
              Driver Details
            </h3>
            <div className="space-y-4 text-sm text-foreground font-normal">
              <div className="flex items-start gap-2.5">
                <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground font-semibold mb-0.5">Driver ID</div>
                  <div className="font-mono font-bold text-foreground">{driver.id}</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground font-semibold mb-0.5">Driver Name</div>
                  <div className="font-bold text-foreground">{driver.name}</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground font-semibold mb-0.5">Licence Number</div>
                  <div className="font-mono font-bold text-foreground">{driver.licenseNumber}</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground font-semibold mb-0.5">Phone Number</div>
                  <div className="font-semibold text-foreground">{driver.phoneNumber || "0400 000 000"}</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Building className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground font-semibold mb-0.5">Carter Company</div>
                  <div className="font-bold text-foreground">{driver.carrierName}</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground font-semibold mb-0.5">Status</div>
                  <StatusBadge status={driver.status} className="mt-0.5 rounded-md" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted border border-border rounded-md p-4 text-xs space-y-2">
            <span className="font-bold text-foreground block uppercase tracking-wider text-xs">
              Activity Snapshot
            </span>
            <div className="space-y-1.5 font-medium">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Linked Transactions:</span>
                <span className="text-foreground font-mono font-bold">{linkedTransactions.length}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Last Weighbridge:</span>
                <span className="text-foreground font-mono font-bold">{driver.lastWeighedDate || "None"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Driver State:</span>
                <span className={driver.status === "Active" ? "text-success font-bold" : "text-destructive font-bold"}>
                  {driver.status === "Active" ? "Operational" : driver.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-card border border-border rounded-md shadow-xs overflow-hidden">
          <div className="p-6 space-y-6 text-sm leading-relaxed text-foreground min-h-[360px]">
            <div>
              <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2">
                Compliance & Safety Profile
              </h4>
              <p className="text-xs text-muted-foreground">
                Induction, routing, and safety directives registered against this driver account.
              </p>
            </div>

            <div className="rounded-md border border-info/25 bg-info/10 p-5 space-y-4">
              <h4 className="text-xs font-bold text-info uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Licence & Carter Assignment
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Licence Number</div>
                  <div className="text-sm font-mono font-bold text-foreground mt-0.5">{driver.licenseNumber}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Carter Company</div>
                  <div className="text-sm font-bold text-foreground mt-0.5">{driver.carrierName}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone Number</div>
                  <div className="text-sm font-semibold text-foreground mt-0.5">{driver.phoneNumber || "0400 000 000"}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Weighbridge Activity</div>
                  <div className="text-sm font-mono font-bold text-foreground mt-0.5">{driver.lastWeighedDate || "None"}</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                Compliance & Safety Notes
              </h4>
              <div className="p-4 rounded-md bg-warning/10 border border-warning/30 text-xs font-medium italic text-warning">
                &ldquo;{driver.notes || "No additional safety inductions or special routing compliance comments registered for this driver."}&rdquo;
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TWO TABS SEGMENT */}
      <div className="space-y-4">
        {/* Tabs Switcher - Displaying ONLY two tabs: "Transactions" and "Carter" */}
        <div className="flex border-b border-border text-xs bg-card p-1 rounded-md border max-w-xs">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex-1 py-1.5 text-center font-bold rounded-md transition ${
              activeTab === "transactions" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Transactions ({linkedTransactions.length})
          </button>
          <button
            onClick={() => setActiveTab("carter")}
            className={`flex-1 py-1.5 text-center font-bold rounded-md transition ${
              activeTab === "carter" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Carter Info
          </button>
        </div>

        {/* Tab 1: Transactions list */}
        {activeTab === "transactions" && (
          <div className="bg-card border border-border rounded-md shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-muted">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Weighbridge logs for Driver: {driver.name}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-muted border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
                    <th className="px-5 py-3">Transaction ID</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Ticket Number</th>
                    <th className="px-5 py-3">Transaction Code</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Job</th>
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">Carter</th>
                    <th className="px-5 py-3">Vehicle</th>
                    <th className="px-5 py-3">Net Weight</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Created Date</th>
                    <th className="px-5 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {linkedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="py-12 text-center text-xs text-muted-foreground font-medium">
                        No transactions registered under this driver yet.
                      </td>
                    </tr>
                  ) : (
                    linkedTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-muted transition duration-150">
                        <td className="px-5 py-3.5 font-bold font-mono text-foreground">{t.id}</td>
                        <td className="px-5 py-3.5 font-semibold text-muted-foreground">{t.type || "Account"}</td>
                        <td className="px-5 py-3.5 font-bold font-mono text-info">{t.ticketNo}</td>
                        <td className="px-5 py-3.5 font-bold font-mono text-muted-foreground">{t.transactionCode || "N/A"}</td>
                        <td className="px-5 py-3.5 font-bold text-foreground">{t.customerName}</td>
                        <td className="px-5 py-3.5 font-semibold text-foreground">{t.jobOrder || "N/A"}</td>
                        <td className="px-5 py-3.5 font-bold text-info">{t.productName}</td>
                        <td className="px-5 py-3.5 font-semibold text-muted-foreground">{t.carrierName}</td>
                        <td className="px-5 py-3.5 font-bold font-mono text-foreground">{t.vehicleReg}</td>
                        <td className="px-5 py-3.5 font-bold font-mono text-right text-foreground">{t.netWeight.toFixed(2)} t</td>
                        <td className="px-5 py-3.5 text-center">
                          <span
                            className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-bold border uppercase tracking-wider ${
                              t.status === TransactionStatus.APPROVED
                                ? "bg-success/10 text-success border-success/25"
                                : t.status === TransactionStatus.PENDING
                                ? "bg-warning/10 text-warning border-warning/30"
                                : "bg-destructive/10 text-destructive border-destructive/25"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs whitespace-nowrap">
                          {t.firstWeighTime}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => onViewTicketDetails(t.id)}
                            className={`${TABLE_ACTION_ICON_BUTTON_CLASS} mx-auto`}
                            title="Open direct weighbridge ticket receipt"
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

        {/* Tab 2: Carter linked info */}
        {activeTab === "carter" && (
          <div className="bg-card border border-border rounded-md shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-muted">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Carter Entity Information & Logistics Details
              </span>
            </div>

            <div className="p-6">
              {linkedCarter ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs max-w-2xl">
                  {/* Basic Identifiers */}
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border pb-1">
                      Carrier Profile
                    </h5>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-bold">Carter ID:</span>
                        <span className="font-bold font-mono text-foreground bg-muted px-2 py-0.5 rounded">
                          {linkedCarter.id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-bold">Carter Name:</span>
                        <span className="font-bold text-foreground">{linkedCarter.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-bold">Operational Status:</span>
                        <span
                          className={`inline-flex items-center rounded px-2 py-0.25 text-xs font-bold border uppercase tracking-wider ${
                            linkedCarter.status === "Active"
                              ? "bg-success/10 text-success border-success/25"
                              : "bg-destructive/10 text-destructive border-destructive/25"
                          }`}
                        >
                          {linkedCarter.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financial & Contact */}
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border pb-1">
                      Billing & Contact Data
                    </h5>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-bold">Phone Number:</span>
                        <span className="font-bold text-foreground flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          {linkedCarter.contactNo || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-bold">Default Transport Rate:</span>
                        <span className="font-bold font-mono text-foreground bg-success/10 border border-success/25 px-2 py-0.5 rounded">
                          $ {(linkedCarter.transportRate ?? 12.50).toFixed(2)} / t
                        </span>
                      </div>
                      {linkedCarter.email && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-bold">Dispatch Email:</span>
                          <span className="font-bold font-mono text-muted-foreground">{linkedCarter.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Address and comments */}
                  {linkedCarter.address && (
                    <div className="col-span-1 md:col-span-2 space-y-1 bg-muted p-4 rounded-md border border-border">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">
                        Headquarters Depot Location
                      </span>
                      <p className="font-bold text-foreground text-xs leading-relaxed">
                        {linkedCarter.address}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-muted border border-border rounded-md p-5 flex items-start gap-3 text-xs text-muted-foreground">
                  <Info className="h-4 w-4 text-info mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-foreground mb-1">Unregistered Independent Carter</p>
                    <p className="font-semibold text-muted-foreground leading-relaxed">
                      The carter labeled <strong>"{driver.carrierName}"</strong> is currently listed as an independent, or does not 
                      match any active primary Carter ID records. Register this Carter under the <span className="underline font-bold">Carters</span> tab to log dispatch profiles and transport rates.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
