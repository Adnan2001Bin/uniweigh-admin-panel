import { Destination, Transaction } from "../../../../types";

export type ExportScope =
  | "current"
  | "selected"
  | "filtered"
  | "individual-summary"
  | "destination-transactions";
export type ExportFormat = "CSV" | "Excel" | "PDF";

interface ExecuteExportParams {
  exportScope: ExportScope;
  exportFormat: ExportFormat;
  destinations: Destination[];
  filteredDestinations: Destination[];
  checkedDestIds: string[];
  activeDestination: Destination | null;
  linkedTransactions: Transaction[];
  statusFilter: string;
  customerFilter: string;
  currentMode: string;
  showToast: (msg: string) => void;
  onComplete: () => void;
}

export function executeDestinationExport(params: ExecuteExportParams) {
  const {
    exportScope,
    exportFormat,
    destinations,
    filteredDestinations,
    checkedDestIds,
    activeDestination,
    linkedTransactions,
    statusFilter,
    customerFilter,
    currentMode,
    showToast,
    onComplete
  } = params;

  let dataset: any[] = [];
  let headers: string[] = [];
  let reportTitle = "";

  if (exportScope === "current") {
    dataset = destinations;
    headers = [
      "Destination ID",
      "Destination Name",
      "Job Reference",
      "Customer Name",
      "Phone",
      "Address Line 1",
      "Address Line 2",
      "Suburb",
      "State",
      "Postcode",
      "Status",
      "Notes"
    ];
    reportTitle = "Uniweigh_All_Destinations_Report";
  } else if (exportScope === "filtered") {
    dataset = filteredDestinations;
    headers = [
      "Destination ID",
      "Destination Name",
      "Job Reference",
      "Customer Name",
      "Phone",
      "Address Line 1",
      "Address Line 2",
      "Suburb",
      "State",
      "Postcode",
      "Status",
      "Notes"
    ];
    reportTitle = `Uniweigh_Filtered_Destinations_Report_${statusFilter}_${customerFilter}`;
  } else if (exportScope === "selected") {
    dataset = destinations.filter((d) => checkedDestIds.includes(d.id));
    if (dataset.length === 0) {
      showToast("Error: No destinations selected for export.");
      onComplete();
      return;
    }
    headers = [
      "Destination ID",
      "Destination Name",
      "Job Reference",
      "Customer Name",
      "Phone",
      "Address Line 1",
      "Address Line 2",
      "Suburb",
      "State",
      "Postcode",
      "Status",
      "Notes"
    ];
    reportTitle = "Uniweigh_Selected_Destinations_Report";
  } else if (exportScope === "individual-summary") {
    if (!activeDestination) {
      showToast("Error: No active destination loaded for summary export.");
      onComplete();
      return;
    }
    dataset = [activeDestination];
    headers = [
      "Destination ID",
      "Destination Name",
      "Job Reference",
      "Customer Name",
      "Phone",
      "Address Line 1",
      "Address Line 2",
      "Suburb",
      "State",
      "Postcode",
      "Status",
      "Notes"
    ];
    reportTitle = `Uniweigh_Destination_Summary_${activeDestination.id}`;
  } else if (exportScope === "destination-transactions") {
    if (!activeDestination) {
      showToast("Error: No active destination loaded for transactions export.");
      onComplete();
      return;
    }
    dataset = linkedTransactions;
    headers = [
      "Transaction ID",
      "Type",
      "Ticket Number",
      "Transaction Code",
      "Customer",
      "Job Order",
      "Product",
      "Lot Number",
      "Net Weight",
      "Total Value",
      "Status",
      "Timestamp"
    ];
    reportTitle = `Uniweigh_Transactions_Destination_${activeDestination.id}`;
  }

  const fileDateStr = new Date().toISOString().split("T")[0];
  const fullFileName = `${reportTitle}_${fileDateStr}`;

  if (exportFormat === "CSV" || exportFormat === "Excel") {
    const fileHeadersLine = headers.join(",");
    let rowsLines: string[] = [];

    if (exportScope === "destination-transactions") {
      rowsLines = (dataset as Transaction[]).map((t) => {
        return [
          t.id,
          t.type,
          t.ticketNo,
          t.transactionCode || "N/A",
          `"${t.customerName.replace(/"/g, '""')}"`,
          t.jobOrder,
          `"${t.productName.replace(/"/g, '""')}"`,
          t.lotNo || "N/A",
          t.netWeight,
          t.totalValue,
          t.status,
          t.firstWeighTime || "N/A"
        ].join(",");
      });
    } else {
      rowsLines = (dataset as Destination[]).map((d) => {
        const fullAddr2 = d.addressLine2 || "";
        return [
          d.id,
          `"${d.name.replace(/"/g, '""')}"`,
          d.jobId,
          `"${d.customerName.replace(/"/g, '""')}"`,
          `"${d.phone}"`,
          `"${d.addressLine1.replace(/"/g, '""')}"`,
          `"${fullAddr2.replace(/"/g, '""')}"`,
          `"${d.suburb}"`,
          `"${d.state}"`,
          `"${d.postcode}"`,
          d.status,
          `"${(d.notes || "").replace(/"/g, '""')}"`
        ].join(",");
      });
    }

    const csvContent =
      "data:text/csv;charset=utf-8," + [fileHeadersLine, ...rowsLines].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${fullFileName}.${exportFormat === "Excel" ? "xls" : "csv"}`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(
      `Successfully downloaded ${exportFormat} export report: ${dataset.length} items.`
    );
  } else {
    let printContent = `
====================================================================================
           UNIWEIGH SYSTEMS - ENTERPRISE BUSINESS GATEWAY LOGISTICS REPORT
====================================================================================
Report Title: ${reportTitle.replace(/_/g, " ")}
Generated On: ${new Date().toLocaleString()}
Export Format: PDF (Document Raw Format)
Records Count: ${dataset.length}
====================================================================================

`;

    if (exportScope === "destination-transactions") {
      printContent += `TRANSACTIONS LEDGER ASSOCIATED WITH DESTINATION: ${activeDestination?.name} (${activeDestination?.id})
------------------------------------------------------------------------------------\n`;
      printContent +=
        String("").padEnd(14) +
        " | " +
        String("TICKET").padEnd(10) +
        " | " +
        String("TYPE").padEnd(8) +
        " | " +
        String("PRODUCT").padEnd(25) +
        " | " +
        String("NET WT").padStart(10) +
        " | " +
        String("AMOUNT").padStart(12) +
        " | " +
        "STATUS\n";
      printContent += "-".repeat(95) + "\n";
      (dataset as Transaction[]).forEach((t) => {
        printContent += `${t.id.padEnd(14)} | ${t.ticketNo.padEnd(10)} | ${t.type.padEnd(
          8
        )} | ${t.productName.substring(0, 25).padEnd(25)} | ${String(
          t.netWeight.toFixed(2) + " t"
        ).padStart(10)} | ${String("$" + t.totalValue.toFixed(2)).padStart(
          12
        )} | ${t.status}\n`;
      });
    } else {
      printContent += `DESTINATIONS MASTER FILE DATA
------------------------------------------------------------------------------------\n`;
      (dataset as Destination[]).forEach((d) => {
        printContent += `
[${d.id}] ${d.name}
--------------------------------------------------------
Customer:  ${d.customerName} (${d.customerId})
Job Code:  ${d.jobId} (Ref: ${d.jobRef})
Telephone: ${d.phone}
Status:    ${d.status}
Address:   ${d.addressLine1}
           ${d.addressLine2 ? d.addressLine2 + "\n           " : ""}${d.suburb}, ${d.state} ${d.postcode}
Notes:     ${d.notes || "None registered"}
--------------------------------------------------------
`;
      });
    }

    const blob = new Blob([printContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fullFileName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(
      "Successfully downloaded printable PDF report (TXT format, simulated PDF)."
    );
  }

  onComplete();
}
