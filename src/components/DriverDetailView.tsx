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
import { TABLE_ACTION_ICON_BUTTON_CLASS } from "@/src/components/shared/table-action-styles";

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
      {/* Back Button & Main Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onBack}
            className="group rounded-md border border-border bg-card hover:bg-muted p-2 text-foreground transition active:scale-95 cursor-pointer select-none"
            title="Return to drivers ledger list"
          >
            <ArrowLeft className="h-4.5 w-4.5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-info/10 text-info text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-info/25">
                {driver.id}
              </span>
              <h1 className="text-xl font-bold text-foreground tracking-tight sm:text-2xl">
                {driver.name}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground font-bold mt-0.5">
              Licence: <span className="font-mono text-foreground">{driver.licenseNumber}</span> &bull; Carter: <span className="text-foreground">{driver.carrierName}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Individual Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="rounded-md border border-border bg-card hover:bg-muted px-4 py-2 text-xs font-bold text-foreground transition flex items-center gap-1.5 select-none cursor-pointer"
            >
              <Download className="h-4 w-4 text-muted-foreground" />
              Export Options
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
      </div>

      {/* TOP: Driver Summary Card */}
      <div className="bg-card border border-border rounded-md shadow-xs overflow-hidden">
        {/* Card Header Banner */}
        <div className="px-6 py-4 border-b border-border bg-muted flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-info shrink-0" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Driver specification summary
            </span>
          </div>
          <span
            className={`rounded px-2.5 py-0.5 text-xs font-bold border uppercase tracking-widest ${
              driver.status === "Active"
                ? "bg-success/10 text-success border-success/25"
                : "bg-destructive/10 text-destructive border-destructive/25"
            }`}
          >
            {driver.status}
          </span>
        </div>

        {/* Spec Information Details */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Group 1: Identity & Licence */}
          <div className="space-y-3 border-r border-border pr-4 last:border-0 last:pr-0">
            <h4 className="text-xs font-bold text-info uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-border">
              Driver Details
            </h4>
            <div className="space-y-2.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Driver ID:</span>
                <span className="font-bold font-mono text-foreground">{driver.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Driver Name:</span>
                <span className="font-bold text-foreground">{driver.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Licence Number:</span>
                <span className="font-bold font-mono text-foreground bg-muted px-1.5 py-0.25 rounded border border-border font-mono">
                  {driver.licenseNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Phone Number:</span>
                <span className="font-bold text-foreground flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {driver.phoneNumber || "0400 000 000"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Carter Company:</span>
                <span className="font-bold text-foreground underline decoration-dotted">
                  {driver.carrierName}
                </span>
              </div>
            </div>
          </div>

          {/* Group 2: Operational Notes & Compliance Logs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-info uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-border">
              Compliance & Safety Notes
            </h4>
            <div className="space-y-2 bg-muted p-3 rounded-md border border-border h-24 overflow-y-auto">
              {driver.notes ? (
                <p className="font-bold text-muted-foreground leading-relaxed text-xs">
                  {driver.notes}
                </p>
              ) : (
                <p className="font-semibold text-muted-foreground italic">
                  No additional safety inductions or special routing compliance comments registered for this driver.
                </p>
              )}
            </div>
            <div className="text-[9.5px] text-muted-foreground font-bold">
              Last Weighbridge Activity: <span className="font-mono text-muted-foreground">{driver.lastWeighedDate || "None"}</span>
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
