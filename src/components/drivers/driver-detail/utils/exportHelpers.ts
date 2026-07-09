import { Driver, Transaction } from "../../../../types";

export function exportDriverSummary(
  format: "CSV" | "Excel" | "PDF",
  driver: Driver,
  onDone?: () => void
) {
  onDone?.();

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
    link.setAttribute(
      "download",
      `Uniweigh_Driver_Summary_${driver.id}.${format === "CSV" ? "csv" : "xlsx"}`
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
}

export function exportDriverTransactions(
  format: "CSV" | "Excel" | "PDF",
  driver: Driver,
  linkedTransactions: Transaction[],
  onDone?: () => void
) {
  onDone?.();

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
    link.setAttribute(
      "download",
      `Uniweigh_Driver_Transactions_${driver.id}.${format === "CSV" ? "csv" : "xlsx"}`
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
}
