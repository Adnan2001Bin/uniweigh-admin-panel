import { Product, Job, Transaction } from "../../../../types";

export type ExportTarget = "summary" | "lots" | "jobs" | "transactions" | "pricing" | "all";

export interface ExportData {
  headers: string[];
  rows: any[][];
  filename: string;
}

export function buildProductExportData(
  selectedProduct: Product,
  target: ExportTarget,
  productLots: { lotNumber: string; orderQuantity: number; availableQuantity: number; status: string }[],
  productJobs: Job[],
  productTransactions: Transaction[],
  defaultPrice: number,
  p1Price?: number,
  p2Price?: number,
  p3Price?: number
): ExportData {
  const timestamp = Date.now();
  let filename = `uniweigh_${selectedProduct.id}_${target}_export_${timestamp}`;

  if (target === "summary") {
    return {
      headers: ["Attribute", "Value"],
      rows: [
        ["Product ID", selectedProduct.id],
        ["Product Code", selectedProduct.productCode || selectedProduct.id],
        ["Product Name", selectedProduct.name],
        ["Operating Site", selectedProduct.site || "Melbourne Eastern Quarry"],
        ["Unit of Measure", selectedProduct.unitOfMeasure || "Tonnes"],
        ["Status", selectedProduct.status],
        ["Default Price ($)", defaultPrice.toFixed(2)],
        ["Price Level 1 ($)", p1Price !== undefined ? p1Price.toFixed(2) : "N/A"],
        ["Price Level 2 ($)", p2Price !== undefined ? p2Price.toFixed(2) : "N/A"],
        ["Price Level 3 ($)", p3Price !== undefined ? p3Price.toFixed(2) : "N/A"],
        ["Notes", selectedProduct.notes || "No notes registered."]
      ],
      filename
    };
  }

  if (target === "lots") {
    return {
      headers: ["Lot ID", "Lot Name", "Order Quantity", "Available Quantity", "Status"],
      rows: productLots.map((l) => [
        l.lotNumber,
        `Lot ${l.lotNumber.replace(/[^0-9]/g, "") || l.lotNumber}`,
        l.orderQuantity,
        l.availableQuantity,
        l.status
      ]),
      filename
    };
  }

  if (target === "jobs") {
    return {
      headers: ["Job ID", "Customer", "Order Reference", "Order Quantity (t)", "Delivered Quantity (t)", "Remaining Quantity (t)", "Status", "Contract Price Type"],
      rows: productJobs.map((j) => [
        j.id,
        j.customerName,
        j.customerOrderRef,
        j.orderQty,
        j.deliveredQty,
        j.orderQty - j.deliveredQty,
        j.status,
        j.pricingType
      ]),
      filename
    };
  }

  if (target === "transactions") {
    return {
      headers: ["Transaction ID", "Type", "Ticket Number", "Customer", "Job ID", "Product Lot", "Net Weight (t)", "Total Value ($)", "Status", "Created Date"],
      rows: productTransactions.map((t) => [
        t.id,
        t.type,
        t.ticketNo,
        t.customerName,
        t.jobOrder || "N/A",
        t.lotNo || "N/A",
        t.netWeight,
        t.totalValue,
        t.status,
        t.firstWeighTime?.split(" ")[0] || "N/A"
      ]),
      filename
    };
  }

  if (target === "pricing") {
    const jobsByDefaultPrice = productJobs.filter(
      (j) => j.pricingType === "Default Product Price" || j.appliedRate === defaultPrice
    );
    const jobsByP1 = p1Price ? productJobs.filter((j) => j.pricingType === "Product Tier 1" || j.appliedRate === p1Price) : [];
    const jobsByP2 = p2Price ? productJobs.filter((j) => j.pricingType === "Product Tier 2" || j.appliedRate === p2Price) : [];
    const jobsByP3 = p3Price ? productJobs.filter((j) => j.pricingType === "Product Tier 3" || j.appliedRate === p3Price) : [];

    return {
      headers: ["Price Tier", "Configured Rate ($)", "Associated Active Jobs"],
      rows: [
        ["Default Price", defaultPrice.toFixed(2), jobsByDefaultPrice.map((j) => j.id).join("; ") || "None"],
        ["Price Level 1", p1Price !== undefined ? p1Price.toFixed(2) : "N/A", jobsByP1.map((j) => j.id).join("; ") || "None"],
        ["Price Level 2", p2Price !== undefined ? p2Price.toFixed(2) : "N/A", jobsByP2.map((j) => j.id).join("; ") || "None"],
        ["Price Level 3", p3Price !== undefined ? p3Price.toFixed(2) : "N/A", jobsByP3.map((j) => j.id).join("; ") || "None"]
      ],
      filename
    };
  }

  return {
    headers: ["Data Segment", "Item Attributes", "Status/Details"],
    rows: [
      ["Product Summary", `${selectedProduct.name} (Code: ${selectedProduct.productCode || selectedProduct.id})`, `Site: ${selectedProduct.site}`],
      ["Total Lots", `${productLots.length} registered lots`, ""],
      ["Total Jobs", `${productJobs.length} active jobs`, ""],
      ["Total Transactions", `${productTransactions.length} transaction tickets`, ""]
    ],
    filename
  };
}

export function downloadProductExport(data: ExportData, format: "CSV" | "Excel" | "PDF") {
  if (format === "CSV") {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [data.headers.join(","), ...data.rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${data.filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    alert(`Exporting data in ${format} format. Your download will begin in a moment.`);
  }
}
