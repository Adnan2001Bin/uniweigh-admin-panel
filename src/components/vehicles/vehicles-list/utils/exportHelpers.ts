import { Vehicle } from "../../../../types";

export function handleVehicleExport(
  source: "all" | "selected" | "filtered",
  format: "CSV" | "Excel" | "PDF",
  vehicles: Vehicle[],
  selectedPlates: string[],
  filteredVehicles: Vehicle[],
  setExportDropdownOpen: (open: boolean) => void
): void {
  setExportDropdownOpen(false);
  let listToExport = vehicles;
  let fileNameSuffix = "All_Vehicles";

  if (source === "selected") {
    listToExport = vehicles.filter((v) => selectedPlates.includes(v.plateNumber));
    fileNameSuffix = "Selected_Vehicles";
    if (listToExport.length === 0) {
      alert("Please select at least one Vehicle in the table first.");
      return;
    }
  } else if (source === "filtered") {
    listToExport = filteredVehicles;
    fileNameSuffix = "Filtered_Vehicles";
  }

  const headers = [
    "Vehicle ID",
    "Vehicle Name",
    "Registration Number",
    "Vehicle Category",
    "Vehicle Type",
    "Carter",
    "Tare Weight (t)",
    "Gross Maximum / Weight Max (t)",
    "Variance (t)",
    "Status",
    "Weighed As",
    "Combined Tare Enabled",
    "Notes"
  ];

  const rows = listToExport.map((v) => [
    v.id || "N/A",
    v.name || "N/A",
    v.plateNumber,
    v.category || "Standard",
    v.vehicleType,
    v.carrierName,
    v.tareWeight.toFixed(2),
    (v.weightMax ?? v.tareWeight * 2.5).toFixed(2),
    (v.variance ?? 0.50).toFixed(2),
    v.status,
    v.weighedAs || "N/A",
    v.enableCombinedTare ? "Yes" : "No",
    v.notes || ""
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
          <td style="padding: 8px;">${r[5]}</td>
          <td style="padding: 8px; text-align: right; font-family: monospace;">${r[6]} t</td>
          <td style="padding: 8px; text-align: right; font-family: monospace;">${r[7]} t</td>
          <td style="padding: 8px; font-weight: bold; color: ${r[9] === "Active" ? "green" : "red"};">${r[9]}</td>
        </tr>`
      )
      .join("");

    printWindow.document.write(`
      <html>
      <head>
        <title>Registered Fleet Vehicles</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; color: #333; }
          h1 { font-size: 18px; border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 4px; }
          .meta { font-size: 11px; color: #666; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f5f5f5; border-bottom: 2px solid #ccc; padding: 8px; font-size: 11px; text-align: left; }
        </style>
      </head>
      <body>
        <h1>Registered Fleet Vehicles Administration Report</h1>
        <div class="meta">Dataset: ${fileNameSuffix.replace("_", " ")} | Total Records: ${listToExport.length} | Generated: ${new Date().toLocaleString()}</div>
        <table>
          <thead>
            <tr>
              <th>Vehicle ID</th>
              <th>Vehicle Name</th>
              <th>Registration</th>
              <th>Category</th>
              <th>Vehicle Type</th>
              <th>Carter Name</th>
              <th style="text-align: right;">Tare Weight</th>
              <th style="text-align: right;">Weight Max</th>
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
