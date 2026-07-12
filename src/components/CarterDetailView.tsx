import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Download,
  Calendar,
  Phone,
  MapPin,
  Mail,
  DollarSign,
  FileText,
  User,
  Truck,
  Layers,
  Building,
  CheckCircle,
  Eye,
  ChevronDown,
  Clock,
  ExternalLink,
  ShieldCheck,
  Check,
  Briefcase
} from "lucide-react";
import { Carrier, Driver, Vehicle, Transaction, TransactionStatus } from "../types";
import { toast } from "sonner";

interface CarterDetailViewProps {
  carterId: string;
  carriers: Carrier[];
  drivers: Driver[];
  vehicles: Vehicle[];
  transactions: Transaction[];
  onBack: () => void;
  onViewTicketDetails: (ticketId: string) => void;
}

export default function CarterDetailView({
  carterId,
  carriers,
  drivers,
  vehicles,
  transactions,
  onBack,
  onViewTicketDetails
}: CarterDetailViewProps) {
  const [activeTab, setActiveTab] = useState<"drivers" | "vehicles" | "transactions">("drivers");
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Detail Modal States for items inside tabs
  const [selectedDriverDetails, setSelectedDriverDetails] = useState<Driver | null>(null);
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState<Vehicle | null>(null);

  // Find the selected carter
  const selectedCarter = useMemo(() => {
    return carriers.find((c) => c.id === carterId);
  }, [carriers, carterId]);

  // Find linked drivers
  const linkedDrivers = useMemo(() => {
    if (!selectedCarter) return [];
    return drivers.filter(
      (d) => d.carrierId === selectedCarter.id || d.carrierName.toLowerCase() === selectedCarter.name.toLowerCase()
    );
  }, [drivers, selectedCarter]);

  // Find linked vehicles (including standard and multiaxis)
  const linkedVehicles = useMemo(() => {
    if (!selectedCarter) return [];
    return vehicles.filter(
      (v) => v.carrierName.toLowerCase() === selectedCarter.name.toLowerCase()
    );
  }, [vehicles, selectedCarter]);

  // Find linked transactions
  const linkedTransactions = useMemo(() => {
    if (!selectedCarter) return [];
    return transactions.filter(
      (t) => t.carrierName.toLowerCase() === selectedCarter.name.toLowerCase()
    );
  }, [transactions, selectedCarter]);

  if (!selectedCarter) {
    return (
      <div className="bg-destructive/10 border border-destructive/25 text-destructive rounded-md p-6 text-center text-xs font-bold space-y-3">
        <p>Error: Carter with ID "{carterId}" was not found or has been removed.</p>
        <button
          onClick={onBack}
          className="bg-destructive hover:bg-destructive text-white rounded-md px-4 py-2 font-bold transition text-xs"
        >
          Return to Carter Listing
        </button>
      </div>
    );
  }

  const transportRate = selectedCarter.transportRate ?? 12.50;

  // Export Individual Carter Summary Sheet
  const handleExportCarterSummary = (format: "CSV" | "Excel" | "PDF") => {
    setIsExportOpen(false);
    if (format === "CSV" || format === "Excel") {
      const csvData = [
        ["Uniweigh Admin Panel - Carter Profile Report"],
        ["Generated on", new Date().toLocaleString()],
        [],
        ["Field", "Value"],
        ["Carter ID", selectedCarter.id],
        ["Carter Name", selectedCarter.name],
        ["Phone Number", selectedCarter.contactNo],
        ["Email Address", selectedCarter.email],
        ["Physical Address", selectedCarter.address || "N/A"],
        ["Transport Rate ($ / Tonne)", `$${transportRate.toFixed(2)}`],
        ["Status", selectedCarter.status],
        ["Notes", selectedCarter.notes || "No notes available."],
        ["Created Date", selectedCarter.createdDate || "2024-03-12"],
        ["Linked Drivers Count", linkedDrivers.length.toString()],
        ["Linked Vehicles Count", linkedVehicles.length.toString()],
        ["Linked Transactions Count", linkedTransactions.length.toString()]
      ];

      const csvContent =
        "data:text/csv;charset=utf-8," +
        csvData.map((e) => e.map((val) => `"${val}"`).join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Carter_Summary_${selectedCarter.id}.${format === "CSV" ? "csv" : "xlsx"}`);
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
          <title>Carter Profile - ${selectedCarter.id}</title>
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
          <h1>Carter Profile Summary Report</h1>
          <div class="meta">Generated: ${new Date().toLocaleString()}</div>
          
          <div class="section">CARTER REGISTRATION DETAILS</div>
          <div class="grid">
            <div class="label">Carter ID:</div><div class="value">${selectedCarter.id}</div>
            <div class="label">Carter Name:</div><div class="value">${selectedCarter.name}</div>
            <div class="label">Status:</div><div class="value"><span style="background: #eef2f3; padding: 2px 6px; border-radius: 4px; border: 1px solid #ccc;">${selectedCarter.status}</span></div>
            <div class="label">Created Date:</div><div class="value">${selectedCarter.createdDate || "2024-03-12"}</div>
            <div class="label">Notes:</div><div class="value">${selectedCarter.notes || "No notes available."}</div>
          </div>

          <div class="section">CONTACT INFORMATION</div>
          <div class="grid">
            <div class="label">Phone Number:</div><div class="value">${selectedCarter.contactNo}</div>
            <div class="label">Email Address:</div><div class="value">${selectedCarter.email}</div>
            <div class="label">Address:</div><div class="value">${selectedCarter.address || "N/A"}</div>
          </div>

          <div class="section">PRICING & AGGREGATE STATS</div>
          <div class="grid">
            <div class="label">Transport Rate:</div><div class="value" style="color: green; font-size: 13px;">$${transportRate.toFixed(2)} / Tonne</div>
            <div class="label">Active Drivers:</div><div class="value">${linkedDrivers.length}</div>
            <div class="label">Registered Fleet:</div><div class="value">${linkedVehicles.length} vehicles</div>
            <div class="label">Transaction Count:</div><div class="value">${linkedTransactions.length} records</div>
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

  // Export Drivers linked to this Carter
  const handleExportDrivers = (format: "CSV" | "Excel" | "PDF") => {
    setIsExportOpen(false);
    if (linkedDrivers.length === 0) {
      toast.success("No drivers found registered under this Carter.");
      return;
    }

    if (format === "CSV" || format === "Excel") {
      const headers = ["Driver ID", "Driver Name", "Licence Number", "Phone Number", "Status"];
      const rows = linkedDrivers.map((d) => [
        d.id,
        d.name,
        d.licenseNumber,
        "+61 400 123 456",
        d.status
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Carter_Drivers_${selectedCarter.id}.${format === "CSV" ? "csv" : "xlsx"}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "PDF") {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Pop-up blocked. Please allow pop-ups to print drivers list.");
        return;
      }

      const htmlRows = linkedDrivers
        .map(
          (d) => `
        <tr style="border-bottom: 1px solid #ddd; font-size: 11px;">
          <td style="padding: 8px; font-weight: bold; font-family: monospace;">${d.id}</td>
          <td style="padding: 8px; font-weight: bold;">${d.name}</td>
          <td style="padding: 8px; font-family: monospace;">${d.licenseNumber}</td>
          <td style="padding: 8px;">+61 400 123 456</td>
          <td style="padding: 8px; font-weight: bold; color: ${d.status === "Active" ? "green" : "red"};">${d.status}</td>
        </tr>`
        )
        .join("");

      printWindow.document.write(`
        <html>
        <head>
          <title>Drivers List - ${selectedCarter.name}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; color: #333; }
            h1 { font-size: 18px; border-bottom: 2px solid #333; padding-bottom: 8px; }
            .meta { font-size: 11px; color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f5f5f5; border-bottom: 2px solid #ccc; padding: 8px; font-size: 11px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Drivers Registered under Carter: ${selectedCarter.name} (${selectedCarter.id})</h1>
          <div class="meta">Generated: ${new Date().toLocaleString()}</div>
          <table>
            <thead>
              <tr>
                <th>Driver ID</th>
                <th>Driver Name</th>
                <th>Licence Number</th>
                <th>Phone Number</th>
                <th>Status</th>
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

  // Export Vehicles linked to this Carter
  const handleExportVehicles = (format: "CSV" | "Excel" | "PDF") => {
    setIsExportOpen(false);
    if (linkedVehicles.length === 0) {
      toast.success("No vehicles found registered under this Carter.");
      return;
    }

    if (format === "CSV" || format === "Excel") {
      const headers = ["Vehicle ID", "Vehicle Name", "Registration Number", "Vehicle Type", "Tare Weight (t)", "Weight Max (t)", "Status"];
      const rows = linkedVehicles.map((v, idx) => [
        v.id || `V-${v.plateNumber.replace("-", "")}`,
        v.name || `${v.vehicleType} #${idx + 1}`,
        v.plateNumber,
        v.vehicleType,
        v.tareWeight.toFixed(2),
        (v.weightMax || v.tareWeight * 2.5).toFixed(2),
        v.status
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Carter_Vehicles_${selectedCarter.id}.${format === "CSV" ? "csv" : "xlsx"}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "PDF") {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Pop-up blocked. Please allow pop-ups to print vehicles list.");
        return;
      }

      const htmlRows = linkedVehicles
        .map((v, idx) => {
          const vId = v.id || `V-${v.plateNumber.replace("-", "")}`;
          const vName = v.name || `${v.vehicleType} #${idx + 1}`;
          const vMax = v.weightMax || v.tareWeight * 2.5;
          return `
          <tr style="border-bottom: 1px solid #ddd; font-size: 11px;">
            <td style="padding: 8px; font-weight: bold; font-family: monospace;">${vId}</td>
            <td style="padding: 8px; font-weight: bold;">${vName}</td>
            <td style="padding: 8px; font-family: monospace;">${v.plateNumber}</td>
            <td style="padding: 8px;">${v.vehicleType}</td>
            <td style="padding: 8px; font-family: monospace;">${v.tareWeight.toFixed(2)} t</td>
            <td style="padding: 8px; font-family: monospace;">${vMax.toFixed(2)} t</td>
            <td style="padding: 8px; font-weight: bold; color: ${v.status === "Active" ? "green" : "red"};">${v.status}</td>
          </tr>`;
        })
        .join("");

      printWindow.document.write(`
        <html>
        <head>
          <title>Vehicles Fleet - ${selectedCarter.name}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; color: #333; }
            h1 { font-size: 18px; border-bottom: 2px solid #333; padding-bottom: 8px; }
            .meta { font-size: 11px; color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f5f5f5; border-bottom: 2px solid #ccc; padding: 8px; font-size: 11px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Fleet Vehicles Registered under Carter: ${selectedCarter.name} (${selectedCarter.id})</h1>
          <div class="meta">Generated: ${new Date().toLocaleString()}</div>
          <table>
            <thead>
              <tr>
                <th>Vehicle ID</th>
                <th>Vehicle Name</th>
                <th>Registration Number</th>
                <th>Vehicle Type</th>
                <th>Tare Weight</th>
                <th>Weight Max</th>
                <th>Status</th>
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

  // Export Transactions linked to this Carter
  const handleExportTransactions = (format: "CSV" | "Excel" | "PDF") => {
    setIsExportOpen(false);
    if (linkedTransactions.length === 0) {
      toast.info("No transaction records found linked to this Carter.");
      return;
    }

    const headers = [
      "Transaction ID",
      "Type",
      "Ticket Number",
      "Transaction Code",
      "Customer",
      "Job",
      "Product",
      "Driver",
      "Vehicle",
      "Net Weight (t)",
      "Cartage Amount ($)",
      "Status",
      "Created Date"
    ];

    const rows = linkedTransactions.map((t) => {
      const cartage = t.netWeight * transportRate;
      return [
        t.id,
        t.type || "Account",
        t.ticketNo,
        t.transactionCode || "N/A",
        t.customerName,
        t.jobOrder,
        t.productName,
        t.driverName,
        t.vehicleReg,
        t.netWeight.toFixed(2),
        cartage.toFixed(2),
        t.status,
        t.auditHistory?.[0]?.timestamp || "N/A"
      ];
    });

    const fileTitle = `Carter_Transactions_${selectedCarter.id}`;

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
        <tr style="border-bottom: 1px solid #ddd; font-size: 10px;">
          <td style="padding: 6px; font-family: monospace; font-weight: bold;">${r[0]}</td>
          <td style="padding: 6px;">${r[1]}</td>
          <td style="padding: 6px; font-family: monospace;">${r[2]}</td>
          <td style="padding: 6px;">${r[4]}</td>
          <td style="padding: 6px; font-family: monospace;">${r[5]}</td>
          <td style="padding: 6px;">${r[6]}</td>
          <td style="padding: 6px; text-align: right; font-family: monospace;">${r[9]} t</td>
          <td style="padding: 6px; text-align: right; font-family: monospace; color: green; font-weight: bold;">$${r[10]}</td>
          <td style="padding: 6px; text-align: center;">${r[11]}</td>
        </tr>`
        )
        .join("");

      printWindow.document.write(`
        <html>
        <head>
          <title>Transactions List - ${selectedCarter.name}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; color: #333; }
            h1 { font-size: 18px; border-bottom: 2px solid #333; padding-bottom: 8px; }
            .meta { font-size: 11px; color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f5f5f5; border-bottom: 2px solid #ccc; padding: 6px; font-size: 10px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Transport Ledger Transactions: ${selectedCarter.name}</h1>
          <div class="meta">Generated: ${new Date().toLocaleString()} | Transport Rate: $${transportRate.toFixed(2)}/t</div>
          <table>
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Type</th>
                <th>Ticket No</th>
                <th>Customer</th>
                <th>Job</th>
                <th>Product</th>
                <th style="text-align: right;">Net Weight</th>
                <th style="text-align: right;">Cartage Amt</th>
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
      {/* Back Button & Dropdown Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 text-xs font-bold text-info hover:text-info transition select-none"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition" />
          Back to Carters List
        </button>

        {/* Export Dropdown */}
        <div className="relative self-start sm:self-auto">
          <button
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="rounded-md border border-border bg-card hover:bg-muted px-3.5 py-1.5 text-xs font-bold text-foreground transition flex items-center gap-1.5 select-none"
          >
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            Export Carter Data
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {isExportOpen && (
            <div className="absolute right-0 mt-1.5 w-56 bg-card border border-border rounded-md shadow-lg py-1.5 z-20 text-xs">
              <div className="px-3 py-1 font-bold text-muted-foreground text-xs uppercase tracking-widest border-b border-border mb-1">
                Carter Profile Sheets
              </div>
              <button
                onClick={() => handleExportCarterSummary("CSV")}
                className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2 text-xs"
              >
                <FileText className="h-3 w-3 text-success" />
                Export Carter Summary (CSV)
              </button>
              <button
                onClick={() => handleExportCarterSummary("Excel")}
                className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2 text-xs"
              >
                <FileText className="h-3 w-3 text-info" />
                Export Carter Summary (Excel)
              </button>
              <button
                onClick={() => handleExportCarterSummary("PDF")}
                className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2 text-xs"
              >
                <FileText className="h-3 w-3 text-destructive" />
                Print Carter Summary PDF
              </button>

              <div className="px-3 py-1 font-bold text-muted-foreground text-xs uppercase tracking-widest border-b border-t border-border my-1">
                Linked Drivers Sheet
              </div>
              <button
                onClick={() => handleExportDrivers("CSV")}
                className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2 text-xs"
              >
                <FileText className="h-3 w-3 text-success" />
                Export Drivers (CSV)
              </button>
              <button
                onClick={() => handleExportDrivers("PDF")}
                className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2 text-xs"
              >
                <FileText className="h-3 w-3 text-destructive" />
                Print Drivers PDF
              </button>

              <div className="px-3 py-1 font-bold text-muted-foreground text-xs uppercase tracking-widest border-b border-t border-border my-1">
                Linked Vehicles Fleet
              </div>
              <button
                onClick={() => handleExportVehicles("CSV")}
                className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2 text-xs"
              >
                <FileText className="h-3 w-3 text-success" />
                Export Vehicles (CSV)
              </button>
              <button
                onClick={() => handleExportVehicles("PDF")}
                className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2 text-xs"
              >
                <FileText className="h-3 w-3 text-destructive" />
                Print Vehicles PDF
              </button>

              <div className="px-3 py-1 font-bold text-muted-foreground text-xs uppercase tracking-widest border-b border-t border-border my-1">
                Linked Transactions
              </div>
              <button
                onClick={() => handleExportTransactions("CSV")}
                className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2 text-xs"
              >
                <FileText className="h-3 w-3 text-success" />
                Export Transactions (CSV)
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

      {/* Carter Summary Card */}
      <div className="bg-card border border-border rounded-md p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-5 mb-5">
          <div className="space-y-1">
            <span className="bg-info/10 text-info font-mono font-bold text-xs tracking-widest uppercase px-2 py-0.5 rounded-sm border border-info/25">
              Carter Profile
            </span>
            <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
              <Truck className="h-5 w-5 text-info" />
              {selectedCarter.name}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                Carter ID: <strong className="text-muted-foreground font-mono font-bold">{selectedCarter.id}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                Registered: <strong className="text-muted-foreground">{selectedCarter.createdDate || "2024-03-12"}</strong>
              </span>
            </div>
          </div>

          <div className="self-start md:self-auto">
            <span
              className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-bold border uppercase tracking-wider ${
                selectedCarter.status === "Active"
                  ? "bg-success/10 text-success border-success/25"
                  : "bg-destructive/10 text-destructive border-destructive/25"
              }`}
            >
              {selectedCarter.status}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 text-xs">
          <div className="bg-muted border border-border rounded-md p-3.5 space-y-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Phone Number</span>
            <div className="flex items-center gap-1.5 text-foreground font-bold">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              {selectedCarter.contactNo}
            </div>
          </div>

          <div className="bg-muted border border-border rounded-md p-3.5 space-y-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Email Address</span>
            <div className="flex items-center gap-1.5 text-foreground font-bold font-mono">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              {selectedCarter.email}
            </div>
          </div>

          <div className="bg-success/10 border border-success/25 rounded-md p-3.5 space-y-1">
            <span className="text-xs font-bold text-success uppercase tracking-widest block">Transport Rate</span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-success font-mono">
                ${transportRate.toFixed(2)}
              </span>
              <span className="text-xs text-success font-bold">/ tonne</span>
            </div>
          </div>

          <div className="bg-info/10 border border-info/25 rounded-md p-3.5 space-y-1">
            <span className="text-xs font-bold text-info uppercase tracking-widest block">Physical Address</span>
            <div className="flex items-center gap-1.5 text-foreground font-bold line-clamp-1">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="truncate" title={selectedCarter.address}>{selectedCarter.address || "No address supplied."}</span>
            </div>
          </div>
        </div>

        {/* Notes Block */}
        <div className="bg-muted border border-border rounded-md p-4 text-xs">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Internal Notes</span>
          <p className="font-medium text-foreground whitespace-pre-line leading-relaxed">
            {selectedCarter.notes || "No custom notes or instructions listed for this transport provider."}
          </p>
        </div>
      </div>

      {/* Tabs Menu - Exactly Three Tabs as requested */}
      <div className="space-y-4">
        <div className="border-b border-border">
          <nav className="flex gap-6 -mb-px" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("drivers")}
              className={`py-2 px-1 border-b-2 font-bold text-xs select-none transition flex items-center gap-1.5 ${
                activeTab === "drivers"
                  ? "border-primary text-info"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-input"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              Drivers ({linkedDrivers.length})
            </button>
            <button
              onClick={() => setActiveTab("vehicles")}
              className={`py-2 px-1 border-b-2 font-bold text-xs select-none transition flex items-center gap-1.5 ${
                activeTab === "vehicles"
                  ? "border-primary text-info"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-input"
              }`}
            >
              <Truck className="h-3.5 w-3.5" />
              Vehicles ({linkedVehicles.length})
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`py-2 px-1 border-b-2 font-bold text-xs select-none transition flex items-center gap-1.5 ${
                activeTab === "transactions"
                  ? "border-primary text-info"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-input"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Transactions ({linkedTransactions.length})
            </button>
          </nav>
        </div>

        {/* Tab Contents */}
        {activeTab === "drivers" && (
          <div className="bg-card border border-border rounded-md shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Linked Carter Drivers</h3>
                <p className="text-xs text-muted-foreground font-bold">Drivers approved to operate under this Carter's account.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-3">Driver ID</th>
                    <th className="px-6 py-3">Driver Name</th>
                    <th className="px-6 py-3">Licence Number</th>
                    <th className="px-6 py-3">Phone Number</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {linkedDrivers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-xs text-muted-foreground font-medium">
                        No drivers registered under this Carter.
                      </td>
                    </tr>
                  ) : (
                    linkedDrivers.map((d) => (
                      <tr key={d.id} className="hover:bg-muted transition">
                        <td className="px-6 py-4 font-bold font-mono text-foreground">{d.id}</td>
                        <td className="px-6 py-4 font-bold text-foreground">{d.name}</td>
                        <td className="px-6 py-4 font-mono font-bold text-muted-foreground">{d.licenseNumber}</td>
                        <td className="px-6 py-4 text-muted-foreground">+61 400 123 456</td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-bold border uppercase tracking-wider ${
                              d.status === "Active"
                                ? "bg-success/10 text-success border-success/25"
                                : "bg-destructive/10 text-destructive border-destructive/25"
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedDriverDetails(d)}
                            className="rounded-md border border-border hover:border-info/25 bg-card hover:bg-info/10 text-foreground hover:text-info p-1 px-2 text-xs font-bold transition flex items-center gap-1 mx-auto select-none"
                          >
                            <Eye className="h-3 w-3" />
                            Quick View
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

        {activeTab === "vehicles" && (
          <div className="bg-card border border-border rounded-md shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Linked Vehicles Fleet</h3>
                <p className="text-xs text-muted-foreground font-bold">Includes standard and heavy-duty multiaxel vehicles linked to this Carter.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-3">Vehicle ID</th>
                    <th className="px-6 py-3">Vehicle Name</th>
                    <th className="px-6 py-3">Registration Number</th>
                    <th className="px-6 py-3">Vehicle Type</th>
                    <th className="px-6 py-3">Tare Weight</th>
                    <th className="px-6 py-3">Weight Max</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {linkedVehicles.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-xs text-muted-foreground font-medium">
                        No vehicles registered under this Carter.
                      </td>
                    </tr>
                  ) : (
                    linkedVehicles.map((v, idx) => {
                      const vId = v.id || `V-${v.plateNumber.replace("-", "")}`;
                      const vName = v.name || `${v.vehicleType} #${idx + 1}`;
                      const isMulti = v.vehicleType === "B-Double" || v.vehicleType === "Quad-Dog" || v.vehicleType === "Semi-Trailer";
                      const weightMax = v.weightMax || Number((v.tareWeight * 2.5).toFixed(2));
                      return (
                        <tr key={v.plateNumber} className="hover:bg-muted transition">
                          <td className="px-6 py-4 font-bold font-mono text-foreground">{vId}</td>
                          <td className="px-6 py-4 font-bold text-foreground flex items-center gap-1.5">
                            {vName}
                            {isMulti && (
                              <span className="bg-info/10 text-info text-xs font-bold px-1.5 py-0.2 rounded border border-info/25 uppercase scale-90">
                                Multiaxel
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-muted-foreground">{v.plateNumber}</td>
                          <td className="px-6 py-4 text-muted-foreground">{v.vehicleType}</td>
                          <td className="px-6 py-4 font-mono font-bold text-foreground">{v.tareWeight.toFixed(2)} t</td>
                          <td className="px-6 py-4 font-mono font-semibold text-muted-foreground">{weightMax.toFixed(2)} t</td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-bold border uppercase tracking-wider ${
                                v.status === "Active"
                                  ? "bg-success/10 text-success border-success/25"
                                  : "bg-destructive/10 text-destructive border-destructive/25"
                              }`}
                            >
                              {v.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => setSelectedVehicleDetails(v)}
                              className="rounded-md border border-border hover:border-info/25 bg-card hover:bg-info/10 text-foreground hover:text-info p-1 px-2 text-xs font-bold transition flex items-center gap-1 mx-auto select-none"
                            >
                              <Eye className="h-3 w-3" />
                              Quick View
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="bg-card border border-border rounded-md shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Transport Transactions Log</h3>
                <p className="text-xs text-muted-foreground font-bold">Durable ledger records and dynamically calculated cartage fees ($) for this Carter.</p>
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
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3">Driver</th>
                    <th className="px-6 py-3">Vehicle</th>
                    <th className="px-6 py-3 text-right">Net Weight</th>
                    <th className="px-6 py-3 text-right font-bold text-success">Cartage Amount</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-center">Created Date</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {linkedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="py-12 text-center text-xs text-muted-foreground font-medium">
                        No transactions registered under this Carter's account.
                      </td>
                    </tr>
                  ) : (
                    linkedTransactions.map((tx) => {
                      const cartageAmt = tx.netWeight * transportRate;
                      return (
                        <tr key={tx.id} className="hover:bg-muted transition">
                          <td className="px-6 py-4 font-bold font-mono text-foreground">{tx.id}</td>
                          <td className="px-6 py-4 font-semibold text-foreground">{tx.type || "Account"}</td>
                          <td className="px-6 py-4 font-bold font-mono text-muted-foreground">{tx.ticketNo}</td>
                          <td className="px-6 py-4 font-mono font-bold text-muted-foreground">{tx.transactionCode || "N/A"}</td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-foreground block">{tx.customerName}</span>
                          </td>
                          <td className="px-6 py-4 font-mono font-bold bg-muted rounded text-xs text-muted-foreground px-1.5 py-0.5 text-center shrink-0">
                            {tx.jobOrder}
                          </td>
                          <td className="px-6 py-4 font-semibold text-foreground">{tx.productName}</td>
                          <td className="px-6 py-4 font-semibold text-foreground">{tx.driverName}</td>
                          <td className="px-6 py-4 font-mono text-muted-foreground">{tx.vehicleReg}</td>
                          <td className="px-6 py-4 text-right font-mono font-bold text-foreground">
                            {tx.netWeight.toFixed(2)} t
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-bold text-success bg-success/10">
                            ${cartageAmt.toFixed(2)}
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
                          <td className="px-6 py-4 text-center font-mono text-xs font-bold text-muted-foreground">
                            {tx.firstWeighTime ? tx.firstWeighTime.split(" ")[0] : "2026-06-22"}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => onViewTicketDetails(tx.id)}
                              className="rounded-md border border-border hover:border-info/25 bg-card hover:bg-info/10 text-foreground hover:text-info p-1 px-2.5 text-xs font-bold transition flex items-center gap-1 mx-auto select-none font-sans"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Ticket
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Driver Detail Dialog Modal */}
      {selectedDriverDetails && (
        <div className="fixed inset-0 bg-foreground flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-card rounded-md border border-border max-w-md w-full shadow-lg p-6 relative">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b pb-3 mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-info" />
              Driver Profile Specs
            </h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-border/60">
                <span className="font-bold text-muted-foreground uppercase">Driver ID</span>
                <span className="font-bold font-mono text-foreground">{selectedDriverDetails.id}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border/60">
                <span className="font-bold text-muted-foreground uppercase">Driver Name</span>
                <span className="font-bold text-foreground">{selectedDriverDetails.name}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border/60">
                <span className="font-bold text-muted-foreground uppercase">Licence Number</span>
                <span className="font-bold font-mono text-foreground">{selectedDriverDetails.licenseNumber}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border/60">
                <span className="font-bold text-muted-foreground uppercase">Phone Number</span>
                <span className="font-bold text-foreground">+61 400 123 456</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border/60">
                <span className="font-bold text-muted-foreground uppercase">Last Weigh Date</span>
                <span className="font-bold text-muted-foreground">{selectedDriverDetails.lastWeighedDate || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border/60">
                <span className="font-bold text-muted-foreground uppercase">Status</span>
                <span
                  className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider border ${
                    selectedDriverDetails.status === "Active"
                      ? "bg-success/10 text-success border-success/25"
                      : "bg-destructive/10 text-destructive border-destructive/25"
                  }`}
                >
                  {selectedDriverDetails.status}
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedDriverDetails(null)}
                className="bg-primary hover:bg-primary/90 text-white rounded-md px-4 py-2 text-xs font-bold transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Detail Dialog Modal */}
      {selectedVehicleDetails && (
        <div className="fixed inset-0 bg-foreground flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-card rounded-md border border-border max-w-md w-full shadow-lg p-6 relative">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b pb-3 mb-4 flex items-center gap-2">
              <Truck className="h-4 w-4 text-info" />
              Vehicle Specifications
            </h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-border/60">
                <span className="font-bold text-muted-foreground uppercase">Vehicle ID</span>
                <span className="font-bold font-mono text-foreground">
                  {selectedVehicleDetails.id || `V-${selectedVehicleDetails.plateNumber.replace("-", "")}`}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border/60">
                <span className="font-bold text-muted-foreground uppercase">Vehicle Name</span>
                <span className="font-bold text-foreground">
                  {selectedVehicleDetails.name || `${selectedVehicleDetails.vehicleType} Fleet`}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border/60">
                <span className="font-bold text-muted-foreground uppercase">Plate Number</span>
                <span className="font-bold font-mono text-foreground">{selectedVehicleDetails.plateNumber}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border/60">
                <span className="font-bold text-muted-foreground uppercase">Vehicle Type</span>
                <span className="font-bold text-foreground">{selectedVehicleDetails.vehicleType}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border/60">
                <span className="font-bold text-muted-foreground uppercase">Registered Tare</span>
                <span className="font-bold font-mono text-foreground">{selectedVehicleDetails.tareWeight.toFixed(2)} t</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border/60">
                <span className="font-bold text-muted-foreground uppercase">Max Gross Limit</span>
                <span className="font-bold font-mono text-foreground">
                  {(selectedVehicleDetails.weightMax || selectedVehicleDetails.tareWeight * 2.5).toFixed(2)} t
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border/60">
                <span className="font-bold text-muted-foreground uppercase">Last Tare Calibration</span>
                <span className="font-bold text-muted-foreground">{selectedVehicleDetails.lastTareDate || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border/60">
                <span className="font-bold text-muted-foreground uppercase">Status</span>
                <span
                  className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider border ${
                    selectedVehicleDetails.status === "Active"
                      ? "bg-success/10 text-success border-success/25"
                      : "bg-destructive/10 text-destructive border-destructive/25"
                  }`}
                >
                  {selectedVehicleDetails.status}
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedVehicleDetails(null)}
                className="bg-primary hover:bg-primary/90 text-white rounded-md px-4 py-2 text-xs font-bold transition"
              >
                Close Specs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
