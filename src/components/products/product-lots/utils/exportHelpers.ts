import { Product, ProductLot } from "../../../../types";

export type ComputedProductLot = ProductLot & {
  usedQuantity: number;
  remainingQuantity: number;
};

export function exportProductLots(
  lots: ComputedProductLot[],
  products: Product[],
  format: "CSV" | "Excel" | "PDF"
) {
  if (lots.length === 0) {
    alert("No data available to export.");
    return;
  }

  const headers = [
    "Product Lot ID",
    "Product Lot Name",
    "Product ID",
    "Product Name",
    "Order Quantity (t)",
    "Used Quantity (t)",
    "Remaining Quantity (t)",
    "Status",
    "Notes",
    "Created Date"
  ];

  const rows = lots.map((l) => {
    const p = products.find((prod) => prod.id === l.productId);
    return [
      l.id,
      l.name,
      l.productId,
      p ? p.name : "Unknown",
      l.orderQuantity.toFixed(2),
      l.usedQuantity.toFixed(2),
      l.remainingQuantity.toFixed(2),
      l.status,
      (l.notes || "").replace(/,/g, ";"),
      l.createdDate || "N/A"
    ];
  });

  const fileTitle = `Product_Lots_Export_${new Date().toISOString().split("T")[0]}`;

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
    exportProductLotsPDF(lots, products, rows);
  }
}

function exportProductLotsPDF(
  lots: ComputedProductLot[],
  products: Product[],
  rows: (string | number)[][]
) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Pop-up blocked. Please allow pop-ups to view/print reports.");
    return;
  }

  const htmlRows = rows
    .map(
      (r) =>
        `<tr style="border-bottom: 1px solid #ddd; font-size: 11px;">` +
        `<td style="padding: 6px; font-family: monospace; font-weight: bold;">${r[0]}</td>` +
        `<td style="padding: 6px; font-weight: bold;">${r[1]}</td>` +
        `<td style="padding: 6px;">${r[3]}</td>` +
        `<td style="padding: 6px; text-align: right; font-family: monospace;">${r[4]} t</td>` +
        `<td style="padding: 6px; text-align: right; font-family: monospace;">${r[5]} t</td>` +
        `<td style="padding: 6px; text-align: right; font-family: monospace; font-weight: bold; color: ${
          parseFloat(String(r[6])) < 0 ? "red" : parseFloat(String(r[6])) === 0 ? "gray" : "blue"
        }">${r[6]} t</td>` +
        `<td style="padding: 6px; text-align: center;">` +
        `<span style="font-size: 9px; font-weight: bold; background: #f0f0f0; border: 1px solid #ccc; padding: 1px 4px; border-radius: 4px;">${r[7]}</span>` +
        `</td></tr>`
    )
    .join("");

  printWindow.document.write(
    `<html><head><title>Uniweigh Admin Panel - Product Lots Report</title>` +
    `<style>` +
    `body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 20px; color: #333; }` +
    `h1 { font-size: 20px; border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 5px; }` +
    `.meta { font-size: 11px; color: #666; margin-bottom: 20px; }` +
    `table { width: 100%; border-collapse: collapse; margin-top: 10px; }` +
    `th { background: #f5f5f5; border-bottom: 2px solid #ccc; padding: 8px 6px; font-size: 11px; text-align: left; }` +
    `</style></head><body>` +
    `<h1>Uniweigh Admin Panel - Product Lots Report</h1>` +
    `<div class="meta">` +
    `Generated on: ${new Date().toLocaleString()}<br />` +
    `Total Lot Records: ${lots.length}` +
    `</div>` +
    `<table><thead><tr>` +
    `<th>Lot ID</th><th>Lot Name</th><th>Product</th>` +
    `<th style="text-align: right;">Order Qty</th>` +
    `<th style="text-align: right;">Used Qty</th>` +
    `<th style="text-align: right;">Remaining Qty</th>` +
    `<th style="text-align: center;">Status</th>` +
    `</tr></thead><tbody>${htmlRows}</tbody></table>` +
    `<script>window.onload = function() { window.print(); }</script>` +
    `</body></html>`
  );
  printWindow.document.close();
}
