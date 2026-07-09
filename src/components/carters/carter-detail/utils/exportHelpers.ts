import { Carrier, Driver, Vehicle, Transaction } from "../../../../types";

export function exportCarterSummary(
  selectedCarter: Carrier,
  transportRate: number,
  linkedDrivers: Driver[],
  linkedVehicles: Vehicle[],
  linkedTransactions: Transaction[],
  format: "CSV" | "Excel" | "PDF"
) {
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
      alert("Pop-up blocked. Please allow pop-ups to view printable summaries.");
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
}

export function exportDrivers(
  selectedCarter: Carrier,
  linkedDrivers: Driver[],
  format: "CSV" | "Excel" | "PDF"
) {
  if (linkedDrivers.length === 0) {
    alert("No drivers found registered under this Carter.");
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
      alert("Pop-up blocked. Please allow pop-ups to print drivers list.");
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
}

export function exportVehicles(
  selectedCarter: Carrier,
  linkedVehicles: Vehicle[],
  format: "CSV" | "Excel" | "PDF"
) {
  if (linkedVehicles.length === 0) {
    alert("No vehicles found registered under this Carter.");
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
      alert("Pop-up blocked. Please allow pop-ups to print vehicles list.");
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
}

export function exportTransactions(
  selectedCarter: Carrier,
  linkedTransactions: Transaction[],
  transportRate: number,
  format: "CSV" | "Excel" | "PDF"
) {
  if (linkedTransactions.length === 0) {
    alert("No transaction records found linked to this Carter.");
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
      alert("Pop-up blocked. Please allow pop-ups to print transactions list.");
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
}
