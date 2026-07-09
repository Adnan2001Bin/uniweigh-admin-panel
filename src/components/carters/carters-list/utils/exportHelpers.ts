import { Carrier } from "../../../../types";

export function exportCartersDataset(
  carriers: Carrier[],
  selectedIds: string[],
  filteredCarters: Carrier[],
  source: "all" | "selected" | "filtered",
  format: "CSV" | "Excel" | "PDF"
) {
  let listToExport = carriers;
  let fileNameSuffix = "All_Carters";

  if (source === "selected") {
    listToExport = carriers.filter((c) => selectedIds.includes(c.id));
    fileNameSuffix = "Selected_Carters";
    if (listToExport.length === 0) {
      alert("Please select at least one Carter in the listing table first.");
      return;
    }
  } else if (source === "filtered") {
    listToExport = filteredCarters;
    fileNameSuffix = "Filtered_Carters";
  }

  const headers = ["Carter ID", "Carter Name", "Phone Number", "Email", "Transport Rate ($/t)", "Status", "Address", "Notes", "Created Date"];
  const rows = listToExport.map((c) => [
    c.id,
    c.name,
    c.contactNo,
    c.email,
    (c.transportRate ?? 12.50).toFixed(2),
    c.status,
    c.address || "N/A",
    c.notes || "",
    c.createdDate || "2024-03-12"
  ]);

  if (format === "CSV" || format === "Excel") {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Uniweigh_${fileNameSuffix}.${format === "CSV" ? "csv" : "xlsx"}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else if (format === "PDF") {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Pop-up blocked. Please enable pop-ups to generate PDF lists.");
      return;
    }

    const htmlRows = rows
      .map(
        (r) => `
      <tr style="border-bottom: 1px solid #ddd; font-size: 11px;">
        <td style="padding: 8px; font-weight: bold; font-family: monospace;">${r[0]}</td>
        <td style="padding: 8px; font-weight: bold;">${r[1]}</td>
        <td style="padding: 8px;">${r[2]}</td>
        <td style="padding: 8px; font-family: monospace; color: green;">$${r[4]}/t</td>
        <td style="padding: 8px; font-weight: bold; color: ${r[5] === "Active" ? "green" : "red"};">${r[5]}</td>
        <td style="padding: 8px;">${r[6]}</td>
        <td style="padding: 8px; font-size: 10px; color: #555;">${r[8]}</td>
      </tr>`
      )
      .join("");

    printWindow.document.write(`
      <html>
      <head>
        <title>Carters Transport Report</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; color: #333; }
          h1 { font-size: 18px; border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 4px; }
          .meta { font-size: 11px; color: #666; margin-bottom: 25px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f5f5f5; border-bottom: 2px solid #ccc; padding: 8px; font-size: 11px; text-align: left; }
        </style>
      </head>
      <body>
        <h1>Transport Carters Administration Directory</h1>
        <div class="meta">Export Type: ${fileNameSuffix.replace("_", " ")} | Count: ${listToExport.length} | Generated: ${new Date().toLocaleString()}</div>
        <table>
          <thead>
            <tr>
              <th>Carter ID</th>
              <th>Carter Name</th>
              <th>Phone Number</th>
              <th>Transport Rate</th>
              <th>Status</th>
              <th>Address</th>
              <th>Created Date</th>
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
