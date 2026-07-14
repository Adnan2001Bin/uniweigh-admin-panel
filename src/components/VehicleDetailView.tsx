import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Download,
  Calendar,
  Phone,
  DollarSign,
  FileText,
  User,
  Truck,
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
  Info,
  Layers
} from "lucide-react";
import { Carrier, Vehicle, Transaction, TransactionStatus, AxleSet } from "../types";
import { toast } from "sonner";
import { TABLE_ACTION_ICON_BUTTON_CLASS } from "@/src/components/shared/table-action-styles";

interface VehicleDetailViewProps {
  plateNumber: string;
  vehicles: Vehicle[];
  carriers: Carrier[];
  transactions: Transaction[];
  onBack: () => void;
  onViewTicketDetails: (ticketId: string) => void;
}

export default function VehicleDetailView({
  plateNumber,
  vehicles,
  carriers,
  transactions,
  onBack,
  onViewTicketDetails
}: VehicleDetailViewProps) {
  // Find the selected vehicle
  const vehicle = useMemo(() => {
    return vehicles.find(
      (v) => v.plateNumber.toLowerCase() === plateNumber.toLowerCase()
    );
  }, [vehicles, plateNumber]);

  const defaultTab = vehicle && vehicle.category === "Multiaxel" ? "axlesets" : "transactions";
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Find linked carter (Carrier)
  const linkedCarter = useMemo(() => {
    if (!vehicle) return null;
    return carriers.find(
      (c) => c.name.toLowerCase() === vehicle.carrierName.toLowerCase()
    );
  }, [carriers, vehicle]);

  // Find linked transactions
  const linkedTransactions = useMemo(() => {
    if (!vehicle) return [];
    return transactions.filter(
      (t) => t.vehicleReg.toLowerCase() === vehicle.plateNumber.toLowerCase()
    );
  }, [transactions, vehicle]);

  if (!vehicle) {
    return (
      <div className="bg-destructive/10 border border-destructive/25 text-destructive rounded-md p-6 text-center text-xs font-bold space-y-3">
        <p>Error: Vehicle with Registration Number "{plateNumber}" was not found.</p>
        <button
          onClick={onBack}
          className="bg-destructive hover:bg-destructive text-white rounded-md px-4 py-2 font-bold transition text-xs"
        >
          Return to Vehicles Listing
        </button>
      </div>
    );
  }

  // Weight values and calculations
  const tareWeight = vehicle.tareWeight;
  const weightMax = vehicle.weightMax ?? Number((tareWeight * 2.5).toFixed(2));
  const variance = vehicle.variance ?? 0.50;
  const isMultiaxel = vehicle.category === "Multiaxel";

  // Individual Export - Specs summary
  const handleExportIndividualSummary = (format: "CSV" | "Excel" | "PDF") => {
    setIsExportOpen(false);
    const summaryData = [
      ["Vehicle Field", "Value"],
      ["Vehicle ID", vehicle.id || "N/A"],
      ["Vehicle Name", vehicle.name || "N/A"],
      ["Registration Number", vehicle.plateNumber],
      ["Vehicle Category", vehicle.category || "Standard"],
      ["Carter Name", vehicle.carrierName],
      ["Vehicle Type Class", vehicle.vehicleType],
      ["Make and Model", vehicle.makeModel || "N/A"],
      ["Status", vehicle.status],
      ["Tare Weight (t)", tareWeight.toFixed(2)],
      ["Weight Max / Gross Max (t)", weightMax.toFixed(2)],
      ["Variance (t)", variance.toFixed(2)],
      ["Weighed As", vehicle.weighedAs || "N/A"],
      ["Combined Tare Enabled", vehicle.enableCombinedTare ? "Yes" : "No"],
      ["Operational Notes", vehicle.notes || ""]
    ];

    if (format === "CSV" || format === "Excel") {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        summaryData.map((e) => e.map((val) => `"${val}"`).join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Uniweigh_Vehicle_Summary_${vehicle.plateNumber}.${format === "CSV" ? "csv" : "xlsx"}`);
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
          <title>Vehicle Specification Summary - ${vehicle.plateNumber}</title>
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
          <h1>Vehicle Specification Summary Sheet</h1>
          <table class="grid-table">
            <tr><td class="label">Vehicle ID</td><td style="font-family: monospace; font-weight: bold;">${vehicle.id || "N/A"}</td></tr>
            <tr><td class="label">Vehicle Name</td><td style="font-weight: bold;">${vehicle.name || "N/A"}</td></tr>
            <tr><td class="label">Registration Number</td><td style="font-family: monospace;">${vehicle.plateNumber}</td></tr>
            <tr><td class="label">Vehicle Category</td><td>${vehicle.category || "Standard"}</td></tr>
            <tr><td class="label">Carter Link</td><td>${vehicle.carrierName}</td></tr>
            <tr><td class="label">Vehicle Type</td><td>${vehicle.vehicleType}</td></tr>
            <tr><td class="label">Make & Model</td><td>${vehicle.makeModel || "N/A"}</td></tr>
            <tr><td class="label">Operational Status</td><td style="font-weight: bold; color: ${vehicle.status === "Active" ? "green" : "red"};">${vehicle.status}</td></tr>
            <tr><td class="label">Tare Weight (t)</td><td style="font-family: monospace; font-weight: bold;">${tareWeight.toFixed(2)} t</td></tr>
            <tr><td class="label">Weight Max / Gross Max (t)</td><td style="font-family: monospace; font-weight: bold;">${weightMax.toFixed(2)} t</td></tr>
            <tr><td class="label">Variance Tolerance (t)</td><td style="font-family: monospace;">${variance.toFixed(2)} t</td></tr>
            ${vehicle.category === "Multiaxel" ? `
              <tr><td class="label">Weighed As</td><td>${vehicle.weighedAs || "N/A"}</td></tr>
              <tr><td class="label">Combined Tare Enabled</td><td>${vehicle.enableCombinedTare ? "Yes" : "No"}</td></tr>
            ` : ""}
            <tr><td class="label">Operational Notes</td><td>${vehicle.notes || "No operational notes recorded."}</td></tr>
          </table>
          <div class="meta">Uniweigh Fleet Compliance System | Generated: ${new Date().toLocaleString()}</div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Export Axle Set Configuration
  const handleExportAxleSets = (format: "CSV" | "Excel" | "PDF") => {
    setIsExportOpen(false);
    if (!vehicle.axleSets || vehicle.axleSets.length === 0) {
      toast.info("No axle sets configured for this vehicle.");
      return;
    }

    const headers = ["Axle Set Number", "Tare Weight (t)", "Gross Maximum (t)", "Variance (t)"];
    const rows = vehicle.axleSets.map((set) => [
      `Axle Set #${set.axleSetNumber}`,
      set.tareWeight.toFixed(2),
      set.weightMax.toFixed(2),
      set.variance.toFixed(2)
    ]);

    if (format === "CSV" || format === "Excel") {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Uniweigh_Axle_Sets_${vehicle.plateNumber}.${format === "CSV" ? "csv" : "xlsx"}`);
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
        <tr style="border-bottom: 1px solid #ddd; font-size: 11px;">
          <td style="padding: 10px; font-weight: bold; font-family: monospace;">${r[0]}</td>
          <td style="padding: 10px; text-align: right; font-family: monospace;">${r[1]} t</td>
          <td style="padding: 10px; text-align: right; font-family: monospace;">${r[2]} t</td>
          <td style="padding: 10px; text-align: right; font-family: monospace;">&plusmn; ${r[3]} t</td>
        </tr>`
        )
        .join("");

      printWindow.document.write(`
        <html>
        <head>
          <title>Axle Sets Configuration - ${vehicle.plateNumber}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 35px; color: #333; }
            h1 { font-size: 18px; border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background: #f8fafc; border-bottom: 2px solid #ccc; padding: 10px; font-size: 12px; text-align: left; }
            td { font-size: 11px; }
          </style>
        </head>
        <body>
          <h1>Axle Sets Compliance Configuration</h1>
          <div>Vehicle Registration: <strong>${vehicle.plateNumber}</strong> | Name: <strong>${vehicle.name}</strong></div>
          <table>
            <thead>
              <tr>
                <th>Axle Set Number</th>
                <th style="text-align: right;">Tare Weight</th>
                <th style="text-align: right;">Gross Maximum</th>
                <th style="text-align: right;">Variance Tolerance</th>
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

  // Export Transactions List
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
      "Driver",
      "Carter",
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
      t.driverName,
      t.carrierName,
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
      link.setAttribute("download", `Uniweigh_Vehicle_Transactions_${vehicle.plateNumber}.${format === "CSV" ? "csv" : "xlsx"}`);
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
          <td style="padding: 6px;">${r[7]}</td>
          <td style="padding: 6px; text-align: right; font-weight: bold;">${r[9]} t</td>
          <td style="padding: 6px;">${r[10]}</td>
          <td style="padding: 6px;">${r[11]}</td>
        </tr>`
        )
        .join("");

      printWindow.document.write(`
        <html>
        <head>
          <title>Weighbridge Transactions - ${vehicle.plateNumber}</title>
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
          <div class="subtitle">Vehicle Registration: ${vehicle.plateNumber} | Name: ${vehicle.name || "N/A"} | Carter: ${vehicle.carrierName}</div>
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Ticket No</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Driver</th>
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
            title="Return to vehicles ledger list"
          >
            <ArrowLeft className="h-4.5 w-4.5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-info/10 text-info text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-info/25">
                {vehicle.id || "VEH-N/A"}
              </span>
              <h1 className="text-xl font-bold text-foreground tracking-tight sm:text-2xl">
                {vehicle.name || "N/A"}
              </h1>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                isMultiaxel 
                  ? "bg-info/10 text-info border border-info/25" 
                  : "bg-info/10 text-info border border-info/25"
              }`}>
                {vehicle.category || "Standard"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-bold mt-0.5">
              Registration: <span className="font-mono text-foreground">{vehicle.plateNumber}</span> &bull; Carter: <span className="text-foreground">{vehicle.carrierName}</span>
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
              <div className="absolute right-0 mt-1.5 w-56 bg-card border border-border rounded-md shadow-lg py-2 z-20 text-xs font-bold">
                <div className="px-3 py-1 text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border mb-1">
                  Export Summary Card
                </div>
                <button
                  onClick={() => handleExportIndividualSummary("CSV")}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-muted text-foreground flex items-center gap-2"
                >
                  Export Specs to CSV
                </button>
                <button
                  onClick={() => handleExportIndividualSummary("PDF")}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-muted text-foreground flex items-center gap-2"
                >
                  Print Specs Sheet (PDF)
                </button>

                {isMultiaxel && (
                  <>
                    <div className="px-3 py-1 text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-t border-border my-1">
                      Export Axle Sets Config
                    </div>
                    <button
                      onClick={() => handleExportAxleSets("CSV")}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-muted text-foreground flex items-center gap-2"
                    >
                      Export Axles to CSV
                    </button>
                    <button
                      onClick={() => handleExportAxleSets("PDF")}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-muted text-foreground flex items-center gap-2"
                    >
                      Print Axles Config (PDF)
                    </button>
                  </>
                )}

                <div className="px-3 py-1 text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-t border-border my-1">
                  Export Transaction List
                </div>
                <button
                  onClick={() => handleExportTransactions("CSV")}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-muted text-foreground flex items-center gap-2 disabled:opacity-50"
                  disabled={linkedTransactions.length === 0}
                >
                  Export Transactions (CSV)
                </button>
                <button
                  onClick={() => handleExportTransactions("PDF")}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-muted text-foreground flex items-center gap-2 disabled:opacity-50"
                  disabled={linkedTransactions.length === 0}
                >
                  Print Transactions PDF (PDF)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TOP: Vehicle Summary Card */}
      <div className="bg-card border border-border rounded-md shadow-xs overflow-hidden">
        {/* Card Header Banner */}
        <div className="px-6 py-4 border-b border-border bg-muted flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-info shrink-0" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Vehicle Spec Matrix Summary
            </span>
          </div>
          <span
            className={`rounded px-2.5 py-0.5 text-xs font-bold border uppercase tracking-widest ${
              vehicle.status === "Active"
                ? "bg-success/10 text-success border-success/25"
                : "bg-destructive/10 text-destructive border-destructive/25"
            }`}
          >
            {vehicle.status}
          </span>
        </div>

        {/* Spec Information Details */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Group 1: Identity Specs */}
          <div className="space-y-3 border-r border-border pr-4 last:border-0 last:pr-0">
            <h4 className="text-xs font-bold text-info uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-border">
              Vehicle Details
            </h4>
            <div className="space-y-2.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Vehicle ID:</span>
                <span className="font-bold font-mono text-foreground">{vehicle.id || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Category:</span>
                <span className="font-bold text-info uppercase tracking-wider">{vehicle.category || "Standard"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Vehicle Name:</span>
                <span className="font-bold text-foreground">{vehicle.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Registration Plate:</span>
                <span className="font-bold font-mono text-foreground bg-muted px-1.5 py-0.25 rounded border border-border">
                  {vehicle.plateNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Carter Partner:</span>
                <span className="font-bold text-foreground underline decoration-dotted">
                  {vehicle.carrierName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Vehicle Type:</span>
                <span className="font-bold text-foreground">{vehicle.vehicleType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Make and Model:</span>
                <span className="font-bold text-foreground">{vehicle.makeModel || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Group 2: Weight Verification Metrics */}
          <div className="space-y-3 border-r border-border pr-4 last:border-0 last:pr-0">
            <h4 className="text-xs font-bold text-info uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-border">
              Weight Details & Limits
            </h4>
            <div className="space-y-2.5">
              {!isMultiaxel ? (
                /* Standard Vehicle Weights */
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-bold flex items-center gap-1">
                      <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                      Tare Weight:
                    </span>
                    <span className="font-bold font-mono text-foreground bg-muted border border-border px-2 py-0.5 rounded text-sm">
                      {tareWeight.toFixed(2)} t
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-bold flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                      Weight Max:
                    </span>
                    <span className="font-bold font-mono text-foreground bg-info/10 border border-info/25 px-2 py-0.5 rounded text-sm">
                      {weightMax.toFixed(2)} t
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-bold flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      Variance Tolerance:
                    </span>
                    <span className="font-bold font-mono text-warning bg-warning/10 border border-warning/30 px-2 py-0.5 rounded text-sm">
                      &plusmn; {variance.toFixed(2)} t
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="text-muted-foreground font-bold">Permissible Margin:</span>
                    <span className="font-bold text-muted-foreground font-mono">
                      {(weightMax - variance).toFixed(2)}t &mdash; {(weightMax + variance).toFixed(2)}t
                    </span>
                  </div>
                </>
              ) : (
                /* Multiaxel Vehicle Weights */
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-bold">Weighed As:</span>
                    <span className="font-bold text-info">{vehicle.weighedAs || "Weighed as Whole"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-bold flex items-center gap-1">
                      <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                      Combined Tare:
                    </span>
                    <span className="font-bold font-mono text-foreground bg-muted border border-border px-2 py-0.5 rounded text-sm">
                      {tareWeight.toFixed(2)} t
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-bold flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                      Gross Maximum:
                    </span>
                    <span className="font-bold font-mono text-foreground bg-info/10 border border-info/25 px-2 py-0.5 rounded text-sm">
                      {weightMax.toFixed(2)} t
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-bold">Axle Sets Count:</span>
                    <span className="font-bold text-foreground font-mono">{vehicle.axleSets?.length || 0} Sets</span>
                  </div>
                  <div className="p-2 bg-info/10 border border-info/25 rounded text-[10.5px] text-info font-bold">
                    Combined Tare is sum: {vehicle.enableCombinedTare ? "ON (Automatic)" : "OFF (Manual)"}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Group 3: Operator Notes and Logs */}
          <div className="space-y-3 pr-4">
            <h4 className="text-xs font-bold text-info uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-border">
              Compliance Notes
            </h4>
            <div className="space-y-2 bg-muted p-3 rounded-md border border-border h-28 overflow-y-auto">
              {vehicle.notes ? (
                <p className="font-bold text-muted-foreground leading-relaxed text-xs">
                  {vehicle.notes}
                </p>
              ) : (
                <p className="font-semibold text-muted-foreground italic">
                  No additional special operational or routing compliance notes registered for this hauling plate.
                </p>
              )}
            </div>
            <div className="text-[9.5px] text-muted-foreground font-bold">
              Last Tare calibration: <span className="font-mono text-muted-foreground">{vehicle.lastTareDate || "Unknown"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TABS SEGMENT */}
      <div className="space-y-4">
        {/* Tabs Switcher */}
        <div className="flex border-b border-border text-xs bg-card p-1 rounded-md border max-w-sm">
          {isMultiaxel && (
            <button
              onClick={() => setActiveTab("axlesets")}
              className={`flex-1 py-1.5 text-center font-bold rounded-md transition flex items-center justify-center gap-1 ${
                activeTab === "axlesets" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Axle Sets ({vehicle.axleSets?.length || 0})
            </button>
          )}
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

        {/* Tab: Axle Sets - ONLY FOR MULTIAXEL */}
        {isMultiaxel && activeTab === "axlesets" && (
          <div className="bg-card border border-border rounded-md shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-muted">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Axle Set Specifications Configuration
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-muted border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
                    <th className="px-5 py-3">Axle Set Number</th>
                    <th className="px-5 py-3">Tare Weight</th>
                    <th className="px-5 py-3">Gross Maximum</th>
                    <th className="px-5 py-3">Variance Tolerance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(!vehicle.axleSets || vehicle.axleSets.length === 0) ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-xs text-muted-foreground font-medium">
                        No Axle Sets configured for this vehicle.
                      </td>
                    </tr>
                  ) : (
                    vehicle.axleSets.map((set) => (
                      <tr key={set.axleSetNumber} className="hover:bg-muted transition duration-150">
                        <td className="px-5 py-3.5 font-bold text-foreground">Axle Set #{set.axleSetNumber}</td>
                        <td className="px-5 py-3.5 font-bold font-mono text-foreground">{set.tareWeight.toFixed(2)} t</td>
                        <td className="px-5 py-3.5 font-bold font-mono text-info">{set.weightMax.toFixed(2)} t</td>
                        <td className="px-5 py-3.5 font-bold font-mono text-warning">&plusmn; {set.variance.toFixed(2)} t</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Transactions list */}
        {activeTab === "transactions" && (
          <div className="bg-card border border-border rounded-md shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-muted">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Weighbridge logs for plate: {vehicle.plateNumber}
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
                    <th className="px-5 py-3">Driver</th>
                    <th className="px-5 py-3">Carter</th>
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
                        No transactions registered under this vehicle plate number yet.
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
                        <td className="px-5 py-3.5 font-semibold text-foreground">{t.driverName}</td>
                        <td className="px-5 py-3.5 font-semibold text-muted-foreground">{t.carrierName}</td>
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
                        <td className="px-5 py-3.5 text-center font-bold">
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

        {/* Tab: Carter linked info */}
        {activeTab === "carter" && (
          <div className="bg-card border border-border rounded-md shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-muted">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Carter Entity Information & Logistics Details
              </span>
            </div>

            <div className="p-6">
              {linkedCarter ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs max-w-2xl font-bold">
                  {/* Basic Identifiers */}
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border pb-1">
                      Carrier Profile
                    </h5>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Carter ID:</span>
                        <span className="font-bold font-mono text-foreground bg-muted px-2 py-0.5 rounded">
                          {linkedCarter.id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Carter Name:</span>
                        <span className="font-bold text-foreground">{linkedCarter.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Operational Status:</span>
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
                        <span className="text-muted-foreground">Phone Number:</span>
                        <span className="font-bold text-foreground flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          {linkedCarter.contactNo || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Default Transport Rate:</span>
                        <span className="font-bold font-mono text-foreground bg-success/10 border border-success/25 px-2 py-0.5 rounded">
                          $ {(linkedCarter.transportRate ?? 12.50).toFixed(2)} / t
                        </span>
                      </div>
                      {linkedCarter.email && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dispatch Email:</span>
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
                      The carter labeled <strong>"{vehicle.carrierName}"</strong> is currently listed as an independent, or does not 
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
