import { Vehicle, Transaction } from "../../../../types";

export function handleExportIndividualSummary(
  format: "CSV" | "Excel" | "PDF",
  vehicle: Vehicle,
  setIsExportOpen: (open: boolean) => void
): void {
  setIsExportOpen(false);
  const tareWeight = vehicle.tareWeight;
  const weightMax = vehicle.weightMax ?? Number((tareWeight * 2.5).toFixed(2));
  const variance = vehicle.variance ?? 0.5;

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
    link.setAttribute(
      "download",
      `Uniweigh_Vehicle_Summary_${vehicle.plateNumber}.${format === "CSV" ? "csv" : "xlsx"}`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else if (format === "PDF") {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Pop-up blocked. Please enable pop-ups to print PDF reports.");
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
}

export function handleExportAxleSets(
  format: "CSV" | "Excel" | "PDF",
  vehicle: Vehicle,
  setIsExportOpen: (open: boolean) => void
): void {
  setIsExportOpen(false);
  if (!vehicle.axleSets || vehicle.axleSets.length === 0) {
    alert("No axle sets configured for this vehicle.");
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
    link.setAttribute(
      "download",
      `Uniweigh_Axle_Sets_${vehicle.plateNumber}.${format === "CSV" ? "csv" : "xlsx"}`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else if (format === "PDF") {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Pop-up blocked. Please enable pop-ups to print PDF reports.");
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
}

export function handleExportTransactions(
  format: "CSV" | "Excel" | "PDF",
  vehicle: Vehicle,
  linkedTransactions: Transaction[],
  setIsExportOpen: (open: boolean) => void
): void {
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
    link.setAttribute(
      "download",
      `Uniweigh_Vehicle_Transactions_${vehicle.plateNumber}.${format === "CSV" ? "csv" : "xlsx"}`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else if (format === "PDF") {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Pop-up blocked. Please enable pop-ups to print PDF reports.");
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
}
