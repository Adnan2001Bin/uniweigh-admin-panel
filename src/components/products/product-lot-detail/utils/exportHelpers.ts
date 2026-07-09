import { ProductLot, Product, Transaction } from "../../../../types";

export function exportLotSummary(
  selectedLot: ProductLot,
  parentProduct: Product | null,
  usedQuantity: number,
  remainingQuantity: number,
  displayedStatus: string,
  format: "CSV" | "Excel" | "PDF"
) {
  const prodName = parentProduct ? parentProduct.name : "Unknown Product";
  const prodCode = parentProduct ? parentProduct.productCode || parentProduct.id : "N/A";

  if (format === "CSV" || format === "Excel") {
    const csvData = [
      ["Uniweigh Admin Panel - Product Lot Summary Report"],
      ["Generated on", new Date().toLocaleString()],
      [],
      ["Field", "Value"],
      ["Product Lot ID", selectedLot.id],
      ["Product Lot Name", selectedLot.name],
      ["Parent Product ID", selectedLot.productId],
      ["Parent Product Code", prodCode],
      ["Parent Product Name", prodName],
      ["Order Quantity (Tonnes)", selectedLot.orderQuantity.toFixed(2)],
      ["Used Quantity (Tonnes)", usedQuantity.toFixed(2)],
      ["Remaining Quantity (Tonnes)", remainingQuantity.toFixed(2)],
      ["Status", displayedStatus],
      ["Notes", selectedLot.notes || ""],
      ["Created Date", selectedLot.createdDate || "N/A"]
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvData.map((e) => e.map((val) => `"${val}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Product_Lot_Summary_${selectedLot.id}.${format === "CSV" ? "csv" : "xlsx"}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else if (format === "PDF") {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Pop-up blocked. Please allow pop-ups to view printable summaries.");
      return;
    }

    printWindow.document.write(
      `<html><head><title>Lot Summary - ${selectedLot.id}</title>` +
      `<style>` +
      `body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; line-height: 1.5; }` +
      `h1 { font-size: 22px; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 5px; }` +
      `.meta { font-size: 11px; color: #666; margin-bottom: 30px; }` +
      `.section { font-size: 14px; font-weight: bold; background: #f5f5f5; padding: 6px 12px; margin-top: 20px; border-left: 4px solid #0066cc; }` +
      `.grid { display: grid; grid-template-columns: 150px 1fr; gap: 8px; margin-top: 15px; font-size: 12px; }` +
      `.label { font-weight: bold; color: #666; }` +
      `.value { font-weight: bold; }` +
      `</style></head><body>` +
      `<h1>Product Lot Summary Report</h1>` +
      `<div class="meta">Generated: ${new Date().toLocaleString()}</div>` +
      `<div class="section">LOT ALLOCATION DETAILS</div>` +
      `<div class="grid">` +
      `<div class="label">Product Lot ID:</div><div class="value">${selectedLot.id}</div>` +
      `<div class="label">Product Lot Name:</div><div class="value">${selectedLot.name}</div>` +
      `<div class="label">Status:</div><div class="value"><span style="background: #eef2f3; padding: 2px 6px; border-radius: 4px; border: 1px solid #ccc;">${displayedStatus}</span></div>` +
      `<div class="label">Created Date:</div><div class="value">${selectedLot.createdDate || "N/A"}</div>` +
      `<div class="label">Notes:</div><div class="value">${selectedLot.notes || "No notes available."}</div>` +
      `</div>` +
      `<div class="section">PRODUCT DETAILS</div>` +
      `<div class="grid">` +
      `<div class="label">Product ID:</div><div class="value">${selectedLot.productId}</div>` +
      `<div class="label">Product Code:</div><div class="value">${prodCode}</div>` +
      `<div class="label">Product Name:</div><div class="value">${prodName}</div>` +
      `<div class="label">Weighbridge Site:</div><div class="value">${parentProduct?.site || "N/A"}</div>` +
      `</div>` +
      `<div class="section">QUANTITY BALANCES (TONNES)</div>` +
      `<div class="grid">` +
      `<div class="label">Order Quantity:</div><div class="value">${selectedLot.orderQuantity.toFixed(2)} t</div>` +
      `<div class="label">Used Quantity:</div><div class="value" style="color: green;">${usedQuantity.toFixed(2)} t</div>` +
      `<div class="label">Remaining Quantity:</div><div class="value" style="color: blue; font-size: 13px;">${remainingQuantity.toFixed(2)} t</div>` +
      `</div>` +
      `<script>window.onload = function() { window.print(); }</script>` +
      `</body></html>`
    );
    printWindow.document.close();
  }
}

export function exportLotTransactions(
  selectedLot: ProductLot,
  lotTransactions: Transaction[],
  format: "CSV" | "Excel" | "PDF"
) {
  if (lotTransactions.length === 0) {
    alert("No transaction records found linked to this product lot.");
    return;
  }

  const headers = [
    "Transaction ID",
    "Type",
    "Ticket Number",
    "Transaction Code",
    "Customer",
    "Job",
    "Net Weight (t)",
    "Status",
    "Created Date"
  ];

  const rows = lotTransactions.map((t) => [
    t.id,
    t.type || "Account",
    t.ticketNo,
    t.transactionCode || "N/A",
    t.customerName,
    t.jobOrder,
    t.netWeight.toFixed(2),
    t.status,
    t.auditHistory?.[0]?.timestamp || "N/A"
  ]);

  const fileTitle = `Product_Lot_Transactions_${selectedLot.id}`;

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
        (r) =>
          `<tr style="border-bottom: 1px solid #ddd; font-size: 11px;">` +
          `<td style="padding: 6px; font-family: monospace; font-weight: bold;">${r[0]}</td>` +
          `<td style="padding: 6px;">${r[1]}</td>` +
          `<td style="padding: 6px; font-family: monospace;">${r[2]}</td>` +
          `<td style="padding: 6px;">${r[4]}</td>` +
          `<td style="padding: 6px; font-family: monospace;">${r[5]}</td>` +
          `<td style="padding: 6px; text-align: right; font-family: monospace;">${r[6]} t</td>` +
          `<td style="padding: 6px; text-align: center;">${r[7]}</td>` +
          `</tr>`
      )
      .join("");

    printWindow.document.write(
      `<html><head><title>Transactions List - Lot ${selectedLot.id}</title>` +
      `<style>` +
      `body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; color: #333; }` +
      `h1 { font-size: 18px; border-bottom: 2px solid #333; padding-bottom: 8px; }` +
      `.meta { font-size: 11px; color: #666; margin-bottom: 20px; }` +
      `table { width: 100%; border-collapse: collapse; }` +
      `th { background: #f5f5f5; border-bottom: 2px solid #ccc; padding: 6px; font-size: 11px; text-align: left; }` +
      `</style></head><body>` +
      `<h1>Transactions Linked to Product Lot: ${selectedLot.id} (${selectedLot.name})</h1>` +
      `<div class="meta">Generated: ${new Date().toLocaleString()}</div>` +
      `<table><thead><tr>` +
      `<th>Txn ID</th><th>Type</th><th>Ticket No</th><th>Customer</th><th>Job</th>` +
      `<th style="text-align: right;">Net Weight</th><th style="text-align: center;">Status</th>` +
      `</tr></thead><tbody>${htmlRows}</tbody></table>` +
      `<script>window.onload = function() { window.print(); }</script>` +
      `</body></html>`
    );
    printWindow.document.close();
  }
}
