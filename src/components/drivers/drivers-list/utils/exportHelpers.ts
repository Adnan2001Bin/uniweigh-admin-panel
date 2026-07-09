import { Driver } from "../../../../types";

interface ExportDriversData {
  drivers: Driver[];
  filteredDrivers: Driver[];
  selectedDriverIds: string[];
}

export function exportDrivers(
  format: "CSV" | "Excel" | "PDF",
  source: "all" | "selected" | "filtered",
  data: ExportDriversData
) {
  const { drivers, filteredDrivers, selectedDriverIds } = data;

  let listToExport = drivers;
  let fileNameSuffix = "All_Drivers";

  if (source === "selected") {
    listToExport = drivers.filter((d) => selectedDriverIds.includes(d.id));
    fileNameSuffix = "Selected_Drivers";
    if (listToExport.length === 0) {
      alert("Please select at least one Driver in the table first.");
      return;
    }
  } else if (source === "filtered") {
    listToExport = filteredDrivers;
    fileNameSuffix = "Filtered_Drivers";
  }

  const headers = ["Driver ID", "Driver Name", "Licence Number", "Phone Number", "Carter Name", "Status", "Notes"];

  const rows = listToExport.map((d) => [
    d.id,
    d.name,
    d.licenseNumber,
    d.phoneNumber || "N/A",
    d.carrierName,
    d.status,
    d.notes || ""
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
      alert("Pop-up blocked. Please enable pop-ups to print PDF reports.");
      return;
    }

    const htmlRows = rows
      .map(
        (r) => `
      <tr style="border-bottom: 1px solid #ddd; font-size: 11px;">
        <td style="padding: 8px; font-weight: bold; font-family: monospace;">${r[0]}</td>
        <td style="padding: 8px; font-weight: bold;">${r[1]}</td>
        <td style="padding: 8px; font-family: monospace;">${r[2]}</td>
        <td style="padding: 8px;">${r[3]}</td>
        <td style="padding: 8px;">${r[4]}</td>
        <td style="padding: 8px; font-weight: bold; color: ${r[5] === "Active" ? "green" : "red"};">${r[5]}</td>
      </tr>`
      )
      .join("");

    printWindow.document.write(`
      <html>
      <head>
        <title>Registered Drivers Listing</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; color: #333; }
          h1 { font-size: 18px; border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 4px; }
          .meta { font-size: 11px; color: #666; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f5f5f5; border-bottom: 2px solid #ccc; padding: 8px; font-size: 11px; text-align: left; }
        </style>
      </head>
      <body>
        <h1>Registered Logistics Drivers Administration Report</h1>
        <div class="meta">Dataset: ${fileNameSuffix.replace("_", " ")} | Total Records: ${listToExport.length} | Generated: ${new Date().toLocaleString()}</div>
        <table>
          <thead>
            <tr>
              <th>Driver ID</th>
              <th>Driver Name</th>
              <th>Licence Number</th>
              <th>Phone Number</th>
              <th>Carter Name</th>
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
